import 'dotenv/config';
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = require(path.join(__dirname, '../package.json'));

// ---  BOT SETTINGS ---
global.owner = [[process.env.OWNER_NUMBER, process.env.OWNER_NAME, true]];
global.botname = process.env.BOT_NAME;

// --- API KEYS ---
global.lolkeysapi = process.env.LOLHUMAN_API_KEY;
global.keysZens = ['c2459db922', '37CC845916', '6fb0eff124']; // Add other keys if needed
global.keysxxx = keysZens[Math.floor(keysZens.length * Math.random())];
global.keysxteam = ['29d4b59a4aa687ca', '5LTV57azwaid7dXfz5fzJu', 'cb15ed422c71a2fb', '5bd33b276d41d6b4', 'HIRO'];
global.keysxteammm = keysxteam[Math.floor(keysxteam.length * Math.random())];
global.keysneoxr = ['5VC9rvNx', 'cf39514fed'];
global.keysneoxrrr = keysneoxr[Math.floor(keysneoxr.length * Math.random())];

// --- OTHER SETTINGS ---
global.APIs = {
  lolhuman: 'https://api.lolhuman.xyz',
  neoxr: 'https://api.neoxr.my.id',
  zenzapis: 'https://zenzapis.xyz',
  // Add other APIs here
};

global.APIKeys = {
  'https://api.lolhuman.xyz': process.env.LOLHUMAN_API_KEY,
  'https://api.neoxr.my.id': keysneoxrrr,
  'https://zenzapis.xyz': keysZens[Math.floor(keysZens.length * Math.random())],
  // Add other API keys here
};

global.packname = 'Sathio-X-MD';
global.author = 'abdulghhani';
global.vs = pkg.version;
global.version = vs;
global.gt = 'https://github.com/Sathio-official/SATHIO-X-MD';
global.hades = 'https://whatsapp.com/channel/0029Va9sOFd3a3BP2p32jA2s';
global.instag = 'https://www.instagram.com/sathio.official';

// --- STICKER WM ---
global.stickpack = 'SATHIO-X';
global.stickauth = 'MD';

// --- GLOBAL IMAGES ---
global.imagen1 = 'https://i.imgur.com/IXl1f2X.jpg';
global.imagen2 = 'https://i.imgur.com/4WHnHhI.jpg';
global.imagen3 = 'https://i.imgur.com/aL2O56c.jpg';
global.imagen4 = 'https://i.imgur.com/b2o2g5S.jpg';
global.imagen5 = 'https://i.imgur.com/2wO3c8p.jpg';
global.imagen6 = 'https://i.imgur.com/pZpA3iL.jpg';
global.imagen7 = 'https://i.imgur.com/N3c5Ea1.jpg';
global.imagen8 = 'https://i.imgur.com/i55Qz20.jpeg';
global.imagen9 = 'https://i.imgur.com/k2tHk1b.jpg';
global.imagen10 = 'https://i.imgur.com/b2aB4Te.jpg';
global.imagen11 = 'https://i.imgur.com/2fFFsoY.jpg';
global.imagen12 = 'https://i.imgur.com/gK9d5sN.jpg';
global.imagen13 = 'https://i.imgur.com/ZGWaDAt.jpg';

// --- GLOBAL MESSAGES ---
global.wait = '*[❗] Wait, command is processing...*';
global.waitt = '*[❗] Wait, command is processing...*';
global.waittt = '*[❗] Wait, command is processing...*';
global.waitttt = '*[❗] Wait, command is processing...*';
global.nomorown = process.env.OWNER_NUMBER;
global.pdoc = ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/msword', 'application/pdf', 'text/rtf'];

// --- DON'T EDIT BELOW THIS ---
let file = fileURLToPath(import.meta.url);
// You can add more global variables if needed
