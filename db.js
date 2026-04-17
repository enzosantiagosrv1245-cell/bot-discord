const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'dados.json');

let getUser, saveUser, ensureUser, getLoteria, saveLoteria, getRankingMoedas, getRankingXP, initCache, loadDB;

try {
  const db = require('./db-firebase');
  getUser = db.getUser;
  saveUser = db.saveUser;
  ensureUser = db.ensureUser;
  getLoteria = db.getLoteria;
  saveLoteria = db.saveLoteria;
  getRankingMoedas = db.getRankingMoedas;
  getRankingXP = db.getRankingXP;
  initCache = db.initCache;
  loadDB = () => null;
  console.log('[TASD Bot] Firebase carregado.');
} catch (e) {
  console.warn('[TASD Bot] Firebase falhou, usando JSON:', e.message);

  const _cache = {};
  const readDB = () => {
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({ users: {}, loteria: {} }, null, 2));
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  };
  const writeDB = (d) => fs.writeFileSync(DB_PATH, JSON.stringify(d, null, 2));
  const DEFAULT_USER = () => ({
    moedas: 0, banco: 0, xp: 0, nivel: 0,
    daily: 0, trabalho: 0, crime: 0, pesca: 0, mineracao: 0,
    inventario: [], plantando: null, plantaColher: null, casadoCom: null,
  });

  getUser = (id) => {
    if (!_cache[id]) {
      const db = readDB();
      _cache[id] = db.users[id] || DEFAULT_USER();
    }
    return _cache[id];
  };

  saveUser = (id, data) => {
    if (!_cache[id]) _cache[id] = DEFAULT_USER();
    Object.assign(_cache[id], data);
    const db = readDB();
    db.users[id] = _cache[id];
    writeDB(db);
  };

  ensureUser = async (id) => getUser(id);

  getLoteria = (guildId) => {
    const db = readDB();
    return db.loteria[guildId] || { participantes: [], pote: 0 };
  };

  saveLoteria = (guildId, data) => {
    const db = readDB();
    db.loteria[guildId] = data;
    writeDB(db);
  };

  getRankingMoedas = (limit = 10) => Object.entries(_cache)
    .map(([id, u]) => ({ id, moedas: u.moedas || 0, banco: u.banco || 0 }))
    .sort((a, b) => (b.moedas + b.banco) - (a.moedas + a.banco))
    .slice(0, limit);

  getRankingXP = (limit = 10) => Object.entries(_cache)
    .map(([id, u]) => ({ id, nivel: u.nivel || 0, xp: u.xp || 0 }))
    .sort((a, b) => b.nivel - a.nivel || b.xp - a.xp)
    .slice(0, limit);

  initCache = async () => {
    const db = readDB();
    Object.assign(_cache, db.users);
  };

  loadDB = () => readDB();
}

module.exports = {
  getUser,
  saveUser,
  ensureUser,
  getLoteria,
  saveLoteria,
  getRankingMoedas,
  getRankingXP,
  initCache,
  loadDB,
};
