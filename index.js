const { Client, GatewayIntentBits, Partials, Collection, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
const express = require('express');

const PREFIX = 'r.';
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const ALLOWED_GUILDS = ['1464332991747588285', '1275809598242291773', '1493335577733501169', '1491441256323223712', '1476270039408705738', '1493740061873934469'];
const CENSURA_OWNER = ['1384263522422231201'];
const PARCERIA_STAFF = '1489775575802315045';
const CANAL_STAFF_LOG = '1491133454870380776';
const COR = 0xE53935;

const E = {
  verificado:  '<:verificado:1482444634125766806>',
  nverificado: '<:nverificado:1482444770793226422>',
  seta:        '<a:seta:1494389872754954511>',
  staff:       '<:staff:1494389821957869679>',
  staff2:      '<:staff2:1494389791981310162>',
  info:        '<:info:1492161517846659342>',
  membro:      '<:membro:1494389688855695370>',
  regras:      '<:regras:1494389661009842217>',
  shop:        '<:shop:1494389631397920798>',
  aviso:       '<:aviso:1492161793005584495>',
  warning:     '<a:WARNING:1366624152718676021>',
};

const ALIASES = {
  'help':'ajuda','h':'ajuda','ui':'userinfo','si':'serverinfo','sv':'serverinfo','p':'perfil',
  'dep':'depositar','sac':'sacar','work':'trabalhar','trab':'trabalhar','bal':'banco','saldo':'banco',
  'bet':'apostar','slot':'apostar','slots':'apostar','fish':'pescar','mine':'minerar','plant':'plantar',
  'sell':'vender','inv':'inventario','bag':'inventario','shop':'loja','buy':'comprar',
  'pay':'transferir','tf':'transferir','scratch':'raspadinha','rasp':'raspadinha',
  'lot':'loteria','top':'ranking','lb':'ranking',
  'marry':'casar','divorce':'divorciar','div':'divorciar','truth':'verdade','dare':'desafio','hang':'forca','l':'letra',
  'msg':'mensagens',
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.ALLOWED_GUILDS = ALLOWED_GUILDS;
client.CENSURA_OWNER = CENSURA_OWNER;
client.PARCERIA_STAFF = PARCERIA_STAFF;
client.COR = COR;
client.E = E;

// ─── DB Firebase ──────────────────────────────────────────────────────────────
let getUser, saveUser, ensureUser, getLoteria, saveLoteria, getRankingMoedas, getRankingXP, initCache;
try {
  const db = require('./db-firebase');
  getUser = db.getUser; saveUser = db.saveUser; ensureUser = db.ensureUser;
  getLoteria = db.getLoteria; saveLoteria = db.saveLoteria;
  getRankingMoedas = db.getRankingMoedas; getRankingXP = db.getRankingXP;
  initCache = db.initCache;
  console.log('[TASD Bot] Firebase carregado.');
} catch (e) {
  console.warn('[TASD Bot] Firebase falhou, usando JSON:', e.message);
  const fs = require('fs'), path = require('path');
  const DB_PATH = path.join(__dirname, 'dados.json');
  const _cache = {};
  const loadDB = () => { if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({ users: {}, loteria: {} })); return JSON.parse(fs.readFileSync(DB_PATH)); };
  const saveDB = d => fs.writeFileSync(DB_PATH, JSON.stringify(d, null, 2));
  const DEF = () => ({ moedas:0,banco:0,xp:0,nivel:0,daily:0,trabalho:0,crime:0,pesca:0,mineracao:0,inventario:[],plantando:null,plantaColher:null,casadoCom:null });
  getUser = (id) => { if (!_cache[id]) { const db2 = loadDB(); _cache[id] = db2.users[id] || DEF(); } return _cache[id]; };
  saveUser = (id, data) => { if (!_cache[id]) _cache[id] = DEF(); Object.assign(_cache[id], data); const db2 = loadDB(); db2.users[id] = _cache[id]; saveDB(db2); };
  ensureUser = async (id) => getUser(id);
  getLoteria = (gId) => { const db2 = loadDB(); return db2.loteria[gId] || { participantes:[], pote:0 }; };
  saveLoteria = (gId, data) => { const db2 = loadDB(); db2.loteria[gId] = data; saveDB(db2); };
  getRankingMoedas = (n=10) => Object.entries(_cache).map(([id,u])=>({id,moedas:u.moedas||0,banco:u.banco||0})).sort((a,b)=>(b.moedas+b.banco)-(a.moedas+a.banco)).slice(0,n);
  getRankingXP = (n=10) => Object.entries(_cache).map(([id,u])=>({id,nivel:u.nivel||0,xp:u.xp||0})).sort((a,b)=>b.nivel-a.nivel||b.xp-a.xp).slice(0,n);
  initCache = async () => { const db2 = loadDB(); Object.assign(_cache, db2.users); };
}
client.getUser = getUser; client.saveUser = saveUser; client.ensureUser = ensureUser;
client.getLoteria = getLoteria; client.saveLoteria = saveLoteria;
client.getRankingMoedas = getRankingMoedas; client.getRankingXP = getRankingXP;

const economia = require('./economia');
const diversao = require('./diversao');
const utilidades = require('./utilidades');

// ─── Anti-spam melhorado ──────────────────────────────────────────────────────
const spamMap = new Map();    // userId => { count, last, warned }
const spamTimeout = new Map(); // userId => timestamp de fim do castigo

function checkSpam(userId) {
  const agora = Date.now();
  const s = spamMap.get(userId) || { count: 0, last: 0, warned: false };
  if (agora - s.last < 3000) { s.count++; } else { s.count = 1; s.warned = false; }
  s.last = agora;
  spamMap.set(userId, s);
  return s.count >= 5;
}

// ─── Anti-raid ────────────────────────────────────────────────────────────────
const joinLog = new Map();

client.on('guildMemberAdd', async (member) => {
  if (!ALLOWED_GUILDS.includes(member.guild.id)) return;

  const gId = member.guild.id;
  const agora = Date.now();
  if (!joinLog.has(gId)) joinLog.set(gId, []);
  const log = joinLog.get(gId).filter(t => agora - t < 10000);
  log.push(agora);
  joinLog.set(gId, log);

  if (log.length >= 5) {
    await member.kick('Anti-raid: flood de entradas detectado.').catch(() => {});
    const logCanal = member.guild.channels.cache.get(CANAL_STAFF_LOG) ||
                     member.guild.channels.cache.find(c => /log|mod|audit/i.test(c.name));
    if (logCanal) {
      logCanal.send({ embeds: [new EmbedBuilder().setColor(0xFF0000)
        .setTitle(`${E.warning} Anti-Raid Ativado ${E.warning}`)
        .setDescription(`**${member.user.tag}** foi removido automaticamente.\n${E.aviso} Flood detectado: **${log.length} entradas em 10 segundos**.`)
        .setTimestamp().setFooter({ text: `${member.guild.name} • Anti-Raid` })] }).catch(() => {});
    }
    return;
  }

  const bvCanal = member.guild.channels.cache.find(c =>
    /boas.vinda|welcome|entrada|geral|chat.geral/i.test(c.name)
  );
  if (!bvCanal) return;

  const emb = new EmbedBuilder()
    .setColor(COR)
    .setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL() })
    .setTitle(`${E.seta} Bem-vindo(a), ${member.user.username}!`)
    .setDescription(
      `Olá, ${member}! Ficamos felizes em ter você aqui.\n\n` +
      `${E.regras} **Leia as regras** antes de interagir.\n` +
      `${E.info} **Apresente-se** nos canais de introdução.\n` +
      `${E.shop} Use \`r.ajuda\` para ver os comandos.\n` +
      `${E.staff} Respeite todos os membros.\n\n` +
      `*Esperamos que você aproveite a comunidade!* 🎉`
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setFooter({ text: `${member.guild.name} • Membro #${member.guild.memberCount}` })
    .setTimestamp();

  bvCanal.send({ embeds: [emb] }).catch(() => {});
});

// ─── Whitelist ────────────────────────────────────────────────────────────────
client.on('guildCreate', async (guild) => {
  if (!ALLOWED_GUILDS.includes(guild.id)) {
    const owner = await guild.fetchOwner().catch(() => null);
    if (owner) owner.send({ embeds: [new EmbedBuilder().setColor(COR)
      .setTitle('❌ Acesso Negado')
      .setDescription('Este bot é **privado** e não está autorizado para este servidor.')
      .setFooter({ text: 'TASD Bot' })] }).catch(() => {});
    await guild.leave();
  }
});

// ─── Censura ──────────────────────────────────────────────────────────────────
const usuariosCensurados = new Set();
const censuradoAviso = new Set();
client.usuariosCensurados = usuariosCensurados;
client.censuradoAviso = censuradoAviso;

// ─── Contador de mensagens ────────────────────────────────────────────────────
const msgCount = new Map();
client.msgCount = msgCount;

// ─── XP + comandos ───────────────────────────────────────────────────────────
const xpCooldown = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!ALLOWED_GUILDS.includes(message.guild.id)) return;

  // Censura
  if (usuariosCensurados.has(message.author.id)) {
    message.delete().catch(() => {});
    if (!censuradoAviso.has(message.author.id)) {
      censuradoAviso.add(message.author.id);
      message.author.send({ embeds: [new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(`${E.warning} VOCÊ FOI CASTIGADO ${E.warning}`)
        .setDescription('Suas mensagens estão sendo **removidas automaticamente**.\nEntre em contato com a staff.')
        .setFooter({ text: message.guild.name }).setTimestamp()]
      }).catch(() => {});
    }
    return;
  }

  // Anti-spam melhorado
  if (checkSpam(message.author.id)) {
    message.delete().catch(() => {});
    const s = spamMap.get(message.author.id);

    if (!s.warned) {
      s.warned = true;
      spamMap.set(message.author.id, s);

      // Censura temporária de 2 minutos
      const fimCastigo = Date.now() + 120000;
      spamTimeout.set(message.author.id, fimCastigo);
      usuariosCensurados.add(message.author.id);
      censuradoAviso.delete(message.author.id);

      const aviso = await message.channel.send({
        content: `${E.aviso} ${message.author}, você foi silenciado por **2 minutos** por spam.`
      }).catch(() => {});
      if (aviso) setTimeout(() => aviso.delete().catch(() => {}), 8000);

      // Remove censura após 2 minutos e avisa staff
      setTimeout(async () => {
        usuariosCensurados.delete(message.author.id);
        censuradoAviso.delete(message.author.id);
        spamTimeout.delete(message.author.id);

        const canalStaff = message.guild.channels.cache.get(CANAL_STAFF_LOG);
        if (canalStaff) {
          canalStaff.send({ embeds: [new EmbedBuilder()
            .setColor(0xFFA000)
            .setTitle(`${E.aviso} Silêncio por Spam Encerrado`)
            .setDescription(`${message.author} (${message.author.tag}) foi silenciado por spam e o castigo expirou.\n\nCanal: ${message.channel}`)
            .setTimestamp().setFooter({ text: `${message.guild.name} • Anti-Spam` })]
          }).catch(() => {});
        }
      }, 120000);
    }
    return;
  }

  // Contador
  msgCount.set(message.author.id, (msgCount.get(message.author.id) || 0) + 1);

  // XP
  const userId = message.author.id;
  const now = Date.now();
  const cd = xpCooldown.get(userId) || 0;
  if (now - cd > 60000) {
    xpCooldown.set(userId, now);
    try {
      await ensureUser(userId);
      const user = getUser(userId);
      const ganho = Math.floor(Math.random() * 10) + 5;
      const novoXP = (user.xp || 0) + ganho;
      const xpNeeded = ((user.nivel || 0) + 1) * 100;
      if (novoXP >= xpNeeded) {
        const novoNivel = (user.nivel || 0) + 1;
        saveUser(userId, { xp: novoXP - xpNeeded, nivel: novoNivel });
        message.channel.send({ embeds: [new EmbedBuilder().setColor(COR)
          .setTitle('⬆️ Level Up!')
          .setDescription(`Parabéns, ${message.author}! Você chegou ao **nível ${novoNivel}**!`)
          .setThumbnail(message.author.displayAvatarURL()).setTimestamp()] });
        await aplicarCargoNivel(message.member, novoNivel, message.guild).catch(() => {});
      } else {
        saveUser(userId, { xp: novoXP });
      }
    } catch {}
  }

  if (!message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const rawCommand = args.shift().toLowerCase();
  const commandName = ALIASES[rawCommand] || rawCommand;

  if (commandName === 'mensagens') {
    const alvo = message.mentions.users.first() || message.author;
    const count = msgCount.get(alvo.id) || 0;
    return message.reply({ embeds: [new EmbedBuilder().setColor(COR)
      .setTitle(`${E.info} Contador de Mensagens`)
      .setDescription(`${E.membro} **${alvo.username}** enviou **${count.toLocaleString('pt-BR')} mensagens** nesta sessão.`)
      .setThumbnail(alvo.displayAvatarURL()).setTimestamp()
      .setFooter({ text: 'Contagem desde o último restart do bot' })] });
  }

  const cmdEconomia = economia.commands[commandName];
  if (cmdEconomia) return cmdEconomia(client, message, args);
  const cmdDiversao = diversao.commands[commandName];
  if (cmdDiversao) return cmdDiversao(client, message, args);
  const cmdUtil = utilidades.commands[commandName];
  if (cmdUtil) return cmdUtil(client, message, args);
});

async function aplicarCargoNivel(member, nivel, guild) {
  const cargosNivel = { 5:'Nível 5', 10:'Nível 10', 20:'Nível 20', 30:'Nível 30', 50:'Nível 50' };
  const nomeCargo = cargosNivel[nivel];
  if (!nomeCargo) return;
  const cargo = guild.roles.cache.find(r => r.name === nomeCargo);
  if (cargo) await member.roles.add(cargo).catch(() => {});
}

const slashCommands = [
  new SlashCommandBuilder().setName('falar').setDescription('Faz o bot enviar uma mensagem no canal').addStringOption(o => o.setName('mensagem').setDescription('Mensagem a enviar').setRequired(true)),
  new SlashCommandBuilder().setName('ticket').setDescription('Abre o painel de suporte'),
  new SlashCommandBuilder().setName('perfil').setDescription('Vê seu perfil').addUserOption(o => o.setName('usuario').setDescription('Usuário')),
  new SlashCommandBuilder().setName('banco').setDescription('Vê seu saldo'),
  new SlashCommandBuilder().setName('daily').setDescription('Resgata sua recompensa diária'),
  new SlashCommandBuilder().setName('ranking').setDescription('Ranking de moedas'),
  new SlashCommandBuilder().setName('rankingxp').setDescription('Ranking de XP'),
  new SlashCommandBuilder().setName('userinfo').setDescription('Informações de um usuário').addUserOption(o => o.setName('usuario').setDescription('Usuário')),
  new SlashCommandBuilder().setName('serverinfo').setDescription('Informações do servidor'),
  new SlashCommandBuilder().setName('ajuda').setDescription('Lista de comandos'),
].map(cmd => cmd.toJSON());

client.on('ready', async () => {
  console.log(`[TASD Bot] Online como ${client.user.tag}`);
  client.user.setPresence({ activities: [{ name: 'TASD | r.ajuda' }], status: 'online' });

  // Carrega cache do Firebase
  if (initCache) await initCache().catch(e => console.warn('[Firebase] Erro no cache:', e.message));

  const rest = new REST({ version: '10' }).setToken(TOKEN);
  for (const guildId of ALLOWED_GUILDS) {
    const g = client.guilds.cache.get(guildId);
    if (!g) { console.warn(`[TASD Bot] Guild ${guildId} não encontrada.`); continue; }
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, guildId), { body: slashCommands })
      .catch(e => console.warn(`[TASD Bot] Erro slash em ${guildId}: ${e.message}`));
  }
  console.log('[TASD Bot] Slash commands registrados.');

  setInterval(() => {
    const agora = new Date();
    if (agora.getDay() === 0 && agora.getHours() === 20 && agora.getMinutes() === 0) economia.sorteioLoteria(client);
  }, 60000);
});

client.on('interactionCreate', async (interaction) => {
  if (!ALLOWED_GUILDS.includes(interaction.guildId)) return;
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_tipo') return utilidades.handleTicketSelect(client, interaction);
  if (interaction.isButton()) {
    if (interaction.customId === 'fechar_ticket') return utilidades.fecharTicket(client, interaction);
    if (interaction.customId === 'abrir_ticket') return utilidades.abrirTicketMenu(client, interaction);
  }
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;
  if (commandName === 'falar') return utilidades.slashFalar(client, interaction);
  if (commandName === 'ticket') return utilidades.slashTicket(client, interaction);
  if (commandName === 'perfil') return utilidades.slashPerfil(client, interaction);
  if (commandName === 'banco') return economia.slashBanco(client, interaction);
  if (commandName === 'daily') return economia.slashDaily(client, interaction);
  if (commandName === 'ranking') return economia.slashRanking(client, interaction);
  if (commandName === 'rankingxp') return utilidades.slashRankingXP(client, interaction);
  if (commandName === 'userinfo') return utilidades.slashUserinfo(client, interaction);
  if (commandName === 'serverinfo') return utilidades.slashServerinfo(client, interaction);
  if (commandName === 'ajuda') return utilidades.slashAjuda(client, interaction);
});

// Tratamento global de erros para não crashar
process.on('unhandledRejection', (err) => console.error('[TASD Bot] Erro não tratado:', err?.message || err));

const app = express();
app.get('/', (_, res) => res.send('TASD Bot online. 👑'));
app.listen(3000, () => console.log('[TASD Bot] HTTP ativo na porta 3000'));

client.login(TOKEN);