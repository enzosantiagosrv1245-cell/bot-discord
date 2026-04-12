const { Client, GatewayIntentBits, Partials, Collection, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');

// ─── Config ───────────────────────────────────────────────────────────────────
const PREFIX = 'r.';
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const ALLOWED_GUILDS = ['1464332991747588285', '1275809598242291773', '1491441256323223712'];
const CENSURA_OWNER = ['1384263522422231201','1487175282988158977','1464760965324079177'];
const PARCERIA_STAFF = '1489775575802315045';
const COR = 0xE53935;

// ─── Aliases (abreviações) ────────────────────────────────────────────────────
const ALIASES = {
  // Utilitários
  'help':       'ajuda',
  'h':          'ajuda',
  'ui':         'userinfo',
  'si':         'serverinfo',
  'sv':         'serverinfo',
  'p':          'perfil',
  // Economia
  'dep':        'depositar',
  'sac':        'sacar',
  'work':       'trabalhar',
  'trab':       'trabalhar',
  'bal':        'banco',
  'bal':        'banco',
  'saldo':      'banco',
  'bet':        'apostar',
  'slot':       'apostar',
  'slots':      'apostar',
  'fish':       'pescar',
  'mine':       'minerar',
  'plant':      'plantar',
  'sell':       'vender',
  'inv':        'inventario',
  'bag':        'inventario',
  'shop':       'loja',
  'buy':        'comprar',
  'pay':        'transferir',
  'tf':         'transferir',
  'scratch':    'raspadinha',
  'rasp':       'raspadinha',
  'lot':        'loteria',
  'top':        'ranking',
  'lb':         'ranking',
  // Diversão
  'marry':      'casar',
  'divorce':    'divorciar',
  'div':        'divorciar',
  'truth':      'verdade',
  'dare':       'desafio',
  'hang':       'forca',
  'l':          'letra',
};

// ─── Client ───────────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.commands = new Collection();
client.PREFIX = PREFIX;
client.COR = COR;
client.ALLOWED_GUILDS = ALLOWED_GUILDS;
client.CENSURA_OWNER = CENSURA_OWNER;
client.PARCERIA_STAFF = PARCERIA_STAFF;

// ─── Carregar módulos ─────────────────────────────────────────────────────────
const economia = require('./economia');
const diversao = require('./diversao');
const utilidades = require('./utilidades');
const verificacao = require('./verificacao');

// ─── DB simples ───────────────────────────────────────────────────────────────
const DB_PATH = path.join(__dirname, 'dados.json');

function loadDB() {
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({ users: {}, guilds: {}, loteria: {}, casamentos: {} }));
  return JSON.parse(fs.readFileSync(DB_PATH));
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

client.loadDB = loadDB;
client.saveDB = saveDB;

function getUser(db, userId) {
  if (!db.users[userId]) {
    db.users[userId] = {
      moedas: 0, banco: 0, xp: 0, nivel: 0,
      daily: 0, trabalho: 0, crime: 0, pesca: 0, mineracao: 0, plantio: 0,
      inventario: [], plantando: null, plantaColher: null,
      casadoCom: null,
    };
  }
  return db.users[userId];
}

client.getUser = getUser;

// ─── Whitelist de servidores ──────────────────────────────────────────────────
client.on('guildCreate', async (guild) => {
  if (!ALLOWED_GUILDS.includes(guild.id)) {
    const owner = await guild.fetchOwner().catch(() => null);
    if (owner) {
      const embed = new EmbedBuilder()
        .setColor(COR)
        .setTitle('❌ Acesso Negado')
        .setDescription('Este bot é **privado** e não está autorizado para este servidor.\nEntre em contato com a administração do TASD.')
        .setFooter({ text: 'TASD Bot' });
      owner.send({ embeds: [embed] }).catch(() => {});
    }
    await guild.leave();
  }
});

// ─── Usuários censurados (em memória — persiste enquanto o bot estiver online) ─
const usuariosCensurados = new Set();
client.usuariosCensurados = usuariosCensurados;

// ─── XP por mensagem ─────────────────────────────────────────────────────────
const xpCooldown = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!ALLOWED_GUILDS.includes(message.guild.id)) return;

  // Censura ativa: deleta a mensagem imediatamente, sem aviso nenhum
  if (usuariosCensurados.has(message.author.id)) {
    message.delete().catch(() => {});
    return;
  }

  const userId = message.author.id;
  const now = Date.now();
  const cd = xpCooldown.get(userId) || 0;

  if (now - cd > 60000) {
    xpCooldown.set(userId, now);
    const db = loadDB();
    const user = getUser(db, userId);
    const ganho = Math.floor(Math.random() * 10) + 5;
    user.xp += ganho;
    const xpNeeded = (user.nivel + 1) * 100;
    if (user.xp >= xpNeeded) {
      user.xp -= xpNeeded;
      user.nivel += 1;
      const embed = new EmbedBuilder()
        .setColor(COR)
        .setTitle('⬆️ Level Up!')
        .setDescription(`Parabéns, ${message.author}! Você chegou ao **nível ${user.nivel}**!`)
        .setThumbnail(message.author.displayAvatarURL())
        .setTimestamp();
      message.channel.send({ embeds: [embed] });
      // Cargos automáticos por nível
      await aplicarCargoNivel(message.member, user.nivel, message.guild).catch(() => {});
    }
    saveDB(db);
  }

  // Processar comandos
  if (!message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const rawCommand = args.shift().toLowerCase();
  const commandName = ALIASES[rawCommand] || rawCommand;

  // Comandos de economia
  const cmdEconomia = economia.commands[commandName];
  if (cmdEconomia) return cmdEconomia(client, message, args);

  // Comandos de diversão
  const cmdDiversao = diversao.commands[commandName];
  if (cmdDiversao) return cmdDiversao(client, message, args);

  // Comandos de utilidades
  const cmdUtil = utilidades.commands[commandName];
  if (cmdUtil) return cmdUtil(client, message, args);

  // Comando de setup de verificação
  if (commandName === 'setupverificacao') return verificacao.setupVerificacao(client, message, args);
});

// ─── DM: respostas de verificação ────────────────────────────────────────────
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.guild) return;
  verificacao.handleDMResposta(client, message);
});

// ─── Membro entrou no servidor ────────────────────────────────────────────────
client.on('guildMemberAdd', async (member) => {
  if (!client.ALLOWED_GUILDS.includes(member.guild.id)) return;
  verificacao.handleMembroEntrou(member);
});

// ─── Cargos por nível ─────────────────────────────────────────────────────────
async function aplicarCargoNivel(member, nivel, guild) {
  const cargosNivel = {
    5:  'Nível 5',
    10: 'Nível 10',
    20: 'Nível 20',
    30: 'Nível 30',
    50: 'Nível 50',
  };
  const nomeCargo = cargosNivel[nivel];
  if (!nomeCargo) return;
  const cargo = guild.roles.cache.find(r => r.name === nomeCargo);
  if (cargo) await member.roles.add(cargo).catch(() => {});
}

// ─── Slash Commands ───────────────────────────────────────────────────────────
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

  const rest = new REST({ version: '10' }).setToken(TOKEN);
  for (const guildId of ALLOWED_GUILDS) {
    const g = client.guilds.cache.get(guildId);
    if (!g) { console.warn('[TASD Bot] Guild ' + guildId + ' não encontrada, pulando slash commands.'); continue; }
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, guildId), { body: slashCommands })
      .catch(e => console.warn('[TASD Bot] Erro slash em ' + guildId + ': ' + e.message));
  }
  console.log('[TASD Bot] Slash commands registrados.');

  // Loteria automática toda semana (domingo 20h)
  setInterval(() => {
    const agora = new Date();
    if (agora.getDay() === 0 && agora.getHours() === 20 && agora.getMinutes() === 0) {
      economia.sorteioLoteria(client);
    }
  }, 60000);
});

// ─── Slash command handler ────────────────────────────────────────────────────
client.on('interactionCreate', async (interaction) => {
  // Botão de verificação pode vir de guild permitida
  if (interaction.isButton() && interaction.customId === 'verificar_membro') {
    if (!ALLOWED_GUILDS.includes(interaction.guildId)) return;
    return verificacao.handleVerificacaoBtn(client, interaction);
  }

  if (!ALLOWED_GUILDS.includes(interaction.guildId)) return;

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'ticket_tipo') {
      return utilidades.handleTicketSelect(client, interaction);
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'fechar_ticket') {
      return utilidades.fecharTicket(client, interaction);
    }
    if (interaction.customId === 'abrir_ticket') {
      return utilidades.abrirTicketMenu(client, interaction);
    }
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

// ─── Keepalive ────────────────────────────────────────────────────────────────
const app = express();
app.get('/', (_, res) => res.send('TASD Bot está online. 👑'));
app.listen(3000, () => console.log('[TASD Bot] Servidor HTTP ativo na porta 3000'));

client.login(TOKEN);