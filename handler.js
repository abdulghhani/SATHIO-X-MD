import { smsg } from './lib/simple.js';
import { format } from 'util';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import chalk from 'chalk';

const { proto } = (await import('@whiskeysockets/baileys')).default;
const isNumber = x => typeof x === 'number' && !isNaN(x);
const isBoolean = x => typeof x === 'boolean';

export async function handler(conn, m, chatUpdate) {
    this.msgqueque = this.msgqueque || [];
    if (!m) return;

    try {
        m = smsg(conn, m, this.store);
        let user = global.db.data.users[m.sender];
        if (typeof user !== 'object') global.db.data.users[m.sender] = {};
        if (user) {
            if (!isNumber(user.afk)) user.afk = -1;
            if (!('afkReason' in user)) user.afkReason = '';
            if (!isBoolean(user.registered)) user.registered = false;
            // Initialize other user properties here
        } else {
            global.db.data.users[m.sender] = {
                afk: -1,
                afkReason: '',
                registered: false,
                // Initialize other user properties here
            };
        }

        let chat = global.db.data.chats[m.chat];
        if (typeof chat !== 'object') global.db.data.chats[m.chat] = {};
        if (chat) {
            if (!('isBanned' in chat)) chat.isBanned = false;
            if (!('welcome' in chat)) chat.welcome = true;
            if (!('detect' in chat)) chat.detect = true;
            // Initialize other chat properties here
        } else {
            global.db.data.chats[m.chat] = {
                isBanned: false,
                welcome: true,
                detect: true,
                // Initialize other chat properties here
            };
        }
        
        let settings = global.db.data.settings[this.user.jid];
        if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {};
        if (settings) {
            if (!('self' in settings)) settings.self = false;
            if (!('autoread' in settings)) settings.autoread = false;
            // Initialize other settings properties here
        } else {
            global.db.data.settings[this.user.jid] = {
                self: false,
                autoread: false,
                // Initialize other settings properties here
            };
        }

        if (opts['nyimak']) return;
        if (!m.fromMe && opts['self']) return;
        if (opts['pconly'] && m.chat.endsWith('g.us')) return;
        if (opts['gconly'] && !m.chat.endsWith('g.us')) return;
        if (opts['swonly'] && m.chat !== 'status@broadcast') return;
        if (typeof m.text !== 'string') m.text = '';

        const isROwner = [conn.decodeJid(conn.user.id), ...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
        const isOwner = isROwner || m.fromMe;
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
        const isPrems = isROwner || db.data.users[m.sender].premiumTime > 0;

        if (opts['queque'] && m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5;
            const previous = queque[queque.length - 1];
            if (previous && m.sender == previous.sender) {
                const diff = m.messageTimestamp - previous.messageTimestamp;
                if (diff < time) return m.reply(`*You are sending messages too fast. Please wait ${((time - diff) / 1000).toFixed(1)} seconds.*`);
            }
            queque.push({
                sender: m.sender,
                messageTimestamp: m.messageTimestamp
            });
            if (queque.length > 5) queque.splice(0, 1);
        }

        if (m.isBaileys) return;
        m.exp += Math.ceil(Math.random() * 10);

        let usedPrefix;
        let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender];
        
        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');
        const _prefix = /^[\\/!#.]/gi;
        const prefix = _prefix.test(m.text) ? m.text.match(_prefix)[0] : '.';

        for (let name in global.plugins) {
            let plugin = global.plugins[name];
            if (!plugin) continue;
            if (plugin.disabled) continue;
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate,
                    });
                } catch (e) {
                    console.error(e);
                }
            }
            if (!opts['public'] && !m.fromMe) continue;
            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                    chatUpdate,
                })) continue;
            }
            if (typeof plugin !== 'function') continue;
            
            const match = (plugin.customPrefix ? plugin.customPrefix : prefix).toLowerCase();
            const str = m.text.toLowerCase();
            if (!str.startsWith(match)) continue;

            const command = str.slice(match.length).trim().split(/ +/).shift();
            const isCommand = plugin.command instanceof RegExp ? plugin.command.test(command) : Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) : typeof plugin.command === 'string' ? plugin.command === command : false;

            if (!isCommand) continue;
            
            let extra = {
                match,
                usedPrefix: prefix,
                command,
                text: m.text.slice(match.length + command.length + 1),
                args: m.text.slice(match.length).trim().split(/ +/).slice(1)
            };

            try {
                await plugin.call(this, m, extra);
            } catch (e) {
                console.error(e);
                m.reply(format(e));
            } finally {
                if (typeof plugin.after === 'function') {
                    try {
                        await plugin.after.call(this, m, extra);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
            break; 
        }
    } catch (e) {
        console.error(e);
    } finally {
        if (opts['autoread']) {
            await conn.readMessages([m.key]);
        }
    }
}

export async function groupsUpdate(conn, groupsUpdate) {
    // Your group update logic here
}

export function presenceUpdate(update) {
    // Your presence update logic here
}

export async function participantsUpdate(update) {
    // Your participants update logic here
}

let file = fileURLToPath(import.meta.url);
watchFile(file, () => {
    unwatchFile(file);
    console.log(chalk.redBright("Update 'handler.js'"));
    import(`${file}?update=${Date.now()}`);
});
