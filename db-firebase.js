const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      clientId: process.env.FIREBASE_CLIENT_ID,
      authUri: 'https://accounts.google.com/o/oauth2/auth',
      tokenUri: 'https://oauth2.googleapis.com/token',
      clientCertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    }),
  });
}

const db = admin.firestore();

// ─── Usuários ─────────────────────────────────────────────────────────────────
const DEFAULT_USER = () => ({
  moedas: 0, banco: 0, xp: 0, nivel: 0,
  daily: 0, trabalho: 0, crime: 0, pesca: 0, mineracao: 0,
  inventario: [], plantando: null, plantaColher: null, casadoCom: null,
});

function getUser(userId) {
  // Síncrono não é possível com Firestore — retorna objeto padrão e faz merge lazy
  // Para compatibilidade total, usamos cache em memória + sync em background
  if (!getUser._cache) getUser._cache = {};
  if (!getUser._cache[userId]) getUser._cache[userId] = { ...DEFAULT_USER() };
  return getUser._cache[userId];
}

async function loadUser(userId) {
  if (!getUser._cache) getUser._cache = {};
  const doc = await db.collection('users').doc(userId).get();
  if (doc.exists) {
    getUser._cache[userId] = { ...DEFAULT_USER(), ...doc.data() };
  } else {
    getUser._cache[userId] = { ...DEFAULT_USER() };
  }
  return getUser._cache[userId];
}

function saveUser(userId, data) {
  if (!getUser._cache) getUser._cache = {};
  getUser._cache[userId] = { ...(getUser._cache[userId] || DEFAULT_USER()), ...data };
  // Salva no Firestore em background
  db.collection('users').doc(userId).set(getUser._cache[userId], { merge: true }).catch(console.error);
}

// ─── Pré-carrega usuário antes dos comandos ───────────────────────────────────
async function ensureUser(userId) {
  if (!getUser._cache?.[userId]) await loadUser(userId);
  return getUser._cache[userId];
}

// ─── Loteria ──────────────────────────────────────────────────────────────────
const _lotCache = {};

function getLoteria(guildId) {
  if (!_lotCache[guildId]) _lotCache[guildId] = { participantes: [], pote: 0, ultimo: 0 };
  return _lotCache[guildId];
}

function saveLoteria(guildId, data) {
  _lotCache[guildId] = data;
  db.collection('loteria').doc(guildId).set(data, { merge: true }).catch(console.error);
}

async function loadLoteria(guildId) {
  const doc = await db.collection('loteria').doc(guildId).get();
  if (doc.exists) _lotCache[guildId] = doc.data();
  else _lotCache[guildId] = { participantes: [], pote: 0, ultimo: 0 };
  return _lotCache[guildId];
}

// ─── Rankings ─────────────────────────────────────────────────────────────────
function getRankingMoedas(limit = 10) {
  if (!getUser._cache) return [];
  return Object.entries(getUser._cache)
    .map(([id, u]) => ({ id, moedas: u.moedas || 0, banco: u.banco || 0 }))
    .sort((a, b) => (b.moedas + b.banco) - (a.moedas + a.banco))
    .slice(0, limit);
}

function getRankingXP(limit = 10) {
  if (!getUser._cache) return [];
  return Object.entries(getUser._cache)
    .map(([id, u]) => ({ id, nivel: u.nivel || 0, xp: u.xp || 0 }))
    .sort((a, b) => b.nivel - a.nivel || b.xp - a.xp)
    .slice(0, limit);
}

// Carrega todos os usuários do Firestore na inicialização
async function initCache() {
  if (!getUser._cache) getUser._cache = {};
  const snap = await db.collection('users').get();
  snap.forEach(doc => { getUser._cache[doc.id] = { ...DEFAULT_USER(), ...doc.data() }; });
  const lotSnap = await db.collection('loteria').get();
  lotSnap.forEach(doc => { _lotCache[doc.id] = doc.data(); });
  console.log(`[Firebase] Cache carregado: ${snap.size} usuários, ${lotSnap.size} loterias.`);
}

module.exports = { getUser, saveUser, loadUser, ensureUser, getLoteria, saveLoteria, loadLoteria, getRankingMoedas, getRankingXP, initCache };