import 'dotenv/config';
import { default as makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, jidNormalizedUser, proto, getAggregateVotesInPollMessage } from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import yargs from 'yargs';
import { Low, JSONFile } from 'lowdb';
import lodash from 'lodash';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';
import { handler as messageHandler } from './handler.js'; // renamed to avoid conflict

const { chain } = lodash;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.db = new Low(/https/.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`));

global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return new Promise((resolve) => setInterval(function() { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000));
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = false;
    global.db.data = {
        users: {},
        chats: {},
        stats: {},
        msgs: {},
        sticker: {},
        settings: {},
        ...(global.db.data || {})
    };
    global.db.chain = chain(global.db.data);
};
loadDatabase();

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const authFolder = 'session';
const { state, saveCreds } = await useMultiFileAuthState(authFolder);
const { version, isLatest } = await fetchLatestBaileysVersion();
console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

const connectionOptions = {
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ['Sathio-X-MD', 'Chrome', '1.0.0'],
    auth: state,
    version,
};

const conn = makeWASocket(connectionOptions);
store.bind(conn.ev);

conn.ev.on('messages.upsert', async (chatUpdate) => {
    try {
        const mek = chatUpdate.messages[0];
        if (!mek.message) return;
        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return;
        if (!conn.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
        if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;
        const m = await (await import('./lib/simple.js')).smsg(conn, mek, store);
        await messageHandler(conn, m, chatUpdate);
    } catch (e) {
        console.error(e);
    }
});

conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
        if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete ${authFolder} and Scan Again`); conn.logout(); }
        else if (reason === DisconnectReason.connectionClosed) { console.log("Connection closed, reconnecting...."); startSathio(); }
        else if (reason === DisconnectReason.connectionLost) { console.log("Connection Lost from Server, reconnecting..."); startSathio(); }
        else if (reason === DisconnectReason.connectionReplaced) { console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); conn.logout(); }
        else if (reason === DisconnectReason.loggedOut) { console.log(`Device Logged Out, Please Delete ${authFolder} and Scan Again.`); conn.logout(); }
        else if (reason === DisconnectReason.restartRequired) { console.log("Restart Required, Restarting..."); startSathio(); }
        else if (reason === DisconnectReason.timedOut) { console.log("Connection TimedOut, Reconnecting..."); startSathio(); }
        else conn.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`);
    }
    if (connection === 'open') {
        console.log('Connected to WhatsApp');
        conn.sendMessage(process.env.OWNER_NUMBER + '@s.whatsapp.net', { text: `${botname} is now connected.` });
    }
});

conn.ev.on('creds.update', saveCreds);

async function startSathio() {
    try {
        await conn.connect();
    } catch (e) {
        console.error('Failed to start connection:', e);
    }
}

startSathio();

export default conn;
