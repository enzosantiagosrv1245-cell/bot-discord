const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, ChannelType, PermissionFlagsBits
} = require('discord.js');

let getUser, saveUser, getRankingXP, ensureUser;
try {
  const db = require('./db');
  getUser = db.getUser;
  saveUser = db.saveUser;
  getRankingXP = db.getRankingXP;
  ensureUser = db.ensureUser;
} catch {
  getUser = () => ({ moedas:0, banco:0, xp:0, nivel:0, casadoCom:null, inventario:[] });
  saveUser = () => {};
  getRankingXP = () => [];
  ensureUser = async () => {};
}

const COR = 0xE53935;
const E = {
  verificado:  '<:verificado:1482444634125766806> ',
  nverificado: '<:nverificado:1482444770793226422> ',
  seta:        '<a:seta:1494389872754954511> ',
  staff:       '<:staff:1494389821957869679> ',
  staff2:      '<:staff2:1494389791981310162> ',
  info:        '<:info:1492161517846659342> ',
  membro:      '<:membro:1494389688855695370> ',
  regras:      '<:regras:1494389661009842217> ',
  shop:        '<:shop:1494389631397920798> ',
  aviso:       '<:aviso:1492161793005584495> ',
  warning:     '<a:WARNING:1366624152718676021> ',
};

// Função para verificar se emoji existe no servidor
function getEmoji(guild, emojiName) {
  if (!guild) return (E[emojiName] || '❓') + ' '; // Fallback

  // Para emojis customizados, verificar se existem
  const emojiId = E[emojiName]?.match(/:(\d+)>/)?.[1];
  if (emojiId && guild.emojis.cache.has(emojiId)) {
    return E[emojiName] + ' ';
  }

  // Fallback para emojis padrão
  const fallbacks = {
    staff: '👑 ',
    staff2: '🛡️ ',
    membro: '👤 ',
    regras: '📋 ',
    shop: '🛒 ',
    aviso: '⚠️ ',
    warning: '🚨 ',
    info: 'ℹ️ ',
    seta: '➡️ ',
    verificado: '✅ ',
    nverificado: '❌ '
  };

  return fallbacks[emojiName] || '❓ ';
};

function embed(titulo, descricao, cor = COR) {
  return new EmbedBuilder().setColor(cor).setTitle(titulo).setDescription(descricao)
    .setTimestamp().setFooter({ text: 'TASD — Todos Aqui São Donos' });
}

function moedaFmt(n) { return `🪙 **${Number(n).toLocaleString('pt-BR')}** moedas`; }

// ─── Requisitos de parceria ───────────────────────────────────────────────────
const MSG_PARCERIA = [
  '> Leia com atenção antes de prosseguir.\n',
  '**✅ Requisitos obrigatórios:**\n',
  '> 👤 **1 representante** da parceria presente no nosso servidor',
  '> 👥 Servidor com **50+ membros**',
  '> 🔞 Servidor **sem canais NSFW**',
  '> 💬 Servidor com **chat ativo**\n',
  `Se o seu servidor atende a **todos** os requisitos acima, descreva sua proposta e aguarde um representante.\n<@1489775575802315045>`,
].join('\n');

// ─── Tipos de ticket ──────────────────────────────────────────────────────────
const TICKET_TIPOS = [
  { value: 'suporte',  label: '🆘 Suporte Geral', description: 'Dúvidas, bugs e problemas gerais',      emoji: '🆘' },
  { value: 'parceria', label: '🤝 Parceria',       description: 'Solicitar parceria com outro servidor', emoji: '🤝' },
  { value: 'denuncia', label: '⚠️ Denúncia',       description: 'Reportar um usuário ou situação',       emoji: '⚠️' },
  { value: 'apelacao', label: '⚖️ Apelação',       description: 'Apelar contra punições recebidas',      emoji: '⚖️' },
  { value: 'sugestao', label: '💡 Sugestão',        description: 'Sugerir melhorias para o servidor',    emoji: '💡' },
  { value: 'eventos',  label: '🎉 Eventos',         description: 'Solicitar ou perguntar sobre eventos',  emoji: '🎉' },
  { value: 'cargo',    label: '🏷️ Cargos',         description: 'Solicitar ou remover cargos',           emoji: '🏷️' },
  { value: 'outro',    label: '📋 Outro',           description: 'Assuntos não listados acima',           emoji: '📋' },
];

const commands = {};

// ─── TICKET (painel) ──────────────────────────────────────────────────────────
commands['ticket'] = async (client, msg, args) => {
  const e = new EmbedBuilder()
    .setColor(COR)
    .setTitle('🎫 Central de Suporte')
    .setDescription(
      '**Precisa de ajuda? Estamos aqui!**\n\n' +
      'Clique no botão abaixo para abrir um ticket e escolher a categoria.\n\n' +
      '📌 **Dicas para um atendimento mais rápido:**\n' +
      '> • Seja claro e objetivo ao descrever seu problema\n' +
      '> • Inclua prints ou evidências se necessário\n' +
      '> • Aguarde — nossa equipe responderá em breve\n\n' +
      '*Tickets abertos sem motivo serão encerrados.*'
    )
    .setThumbnail(msg.guild.iconURL({ size: 256 }))
    .setImage('https://i.imgur.com/placeholder.png') // remova se não quiser banner
    .setTimestamp()
    .setFooter({ text: `${msg.guild.name} • Sistema de Tickets` });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('abrir_ticket').setLabel('Abrir Ticket').setStyle(ButtonStyle.Danger).setEmoji('🎫')
  );
  msg.channel.send({ embeds: [e], components: [row] });
};

// ─── Abrir menu de seleção ────────────────────────────────────────────────────
async function abrirTicketMenu(client, interaction) {
  const select = new StringSelectMenuBuilder()
    .setCustomId('ticket_tipo')
    .setPlaceholder('Selecione a categoria do seu ticket...')
    .addOptions(TICKET_TIPOS.map(t => ({ label: t.label, value: t.value, description: t.description, emoji: t.emoji })));
  const row = new ActionRowBuilder().addComponents(select);
  await interaction.reply({ content: '**Selecione a categoria do seu ticket abaixo:**', components: [row], flags: 64 });
}

// ─── Criar ticket ─────────────────────────────────────────────────────────────
async function handleTicketSelect(client, interaction) {
  const tipo = TICKET_TIPOS.find(t => t.value === interaction.values[0]);
  const guild = interaction.guild;
  const userId = interaction.user.id;

  const existente = guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${tipo.value}`);
  if (existente) return interaction.reply({ content: `❌ Você já tem um ticket desse tipo aberto: ${existente}`, flags: 64 });

  const categoriaTicket = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('ticket'));
  const cargosStaff = guild.roles.cache.filter(r => /staff|mod|admin|suporte/i.test(r.name));

  const canal = await guild.channels.create({
    name: `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)}-${tipo.value}`,
    type: ChannelType.GuildText,
    parent: categoriaTicket?.id || null,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: userId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
    ],
  });

  for (const [, cargo] of cargosStaff) {
    await canal.permissionOverwrites.edit(cargo, { ViewChannel: true, SendMessages: true });
  }

  const cores = {
    suporte: 0xE53935, parceria: 0x43A047, denuncia: 0xFF6F00,
    apelacao: 0x1E88E5, sugestao: 0x8E24AA, eventos: 0xF4511E,
    cargo: 0x00ACC1, outro: 0x757575,
  };

  const ticketEmbed = new EmbedBuilder()
    .setColor(cores[tipo.value] || COR)
    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
    .setTitle(`${tipo.emoji} ${tipo.label}`)
    .setDescription(
      `Olá, ${interaction.user}! Seu ticket foi aberto.\n\n` +
      `📋 **Categoria:** ${tipo.label}\n` +
      `🕐 **Aberto em:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
      `Descreva sua situação com o máximo de detalhes possível.\nNossa equipe irá te atender em breve.`
    )
    .setFooter({ text: `${guild.name} • Ticket System` })
    .setTimestamp();

  const rowTicket = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('fechar_ticket').setLabel('Fechar Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒')
  );

  await canal.send({
    content: `${interaction.user} ${cargosStaff.map(r => `<@&${r.id}>`).join(' ')}`,
    embeds: [ticketEmbed],
    components: [rowTicket]
  });

  if (tipo.value === 'parceria') {
    const parceriaEmbed = new EmbedBuilder()
      .setColor(0x43A047)
      .setTitle('🤝 Requisitos de Parceria')
      .setDescription(MSG_PARCERIA)
      .setFooter({ text: `${guild.name} • Parcerias` })
      .setTimestamp();
    await canal.send({ embeds: [parceriaEmbed] });
  }

  await interaction.reply({ content: `✅ Ticket aberto em ${canal}!`, flags: 64 });
}

// ─── Fechar ticket ────────────────────────────────────────────────────────────
async function fecharTicket(client, interaction) {
  const canal = interaction.channel;
  if (!canal.name.startsWith('ticket-')) return interaction.reply({ content: '❌ Este não é um canal de ticket.', flags: 64 });
  const e = new EmbedBuilder().setColor(0x757575)
    .setTitle('🔒 Ticket Encerrado')
    .setDescription(`Ticket encerrado por ${interaction.user}.\nEste canal será deletado em **5 segundos**.`)
    .setTimestamp().setFooter({ text: interaction.guild.name });
  await interaction.reply({ embeds: [e] });
  setTimeout(() => canal.delete().catch(() => {}), 5000);
}


// ─── CLEAR ────────────────────────────────────────────────────────────────────
commands['clear'] = async (client, msg, args) => {
  if (!msg.member.permissions.has(PermissionFlagsBits.ManageMessages)) return msg.reply({ embeds: [embed('❌ Sem permissão', 'Você não tem permissão para usar este comando.')] });
  const qtd = Math.min(parseInt(args[0]) || 5, 100);
  await msg.channel.bulkDelete(qtd + 1, true).catch(() => {});
  const aviso = await msg.channel.send({ embeds: [embed('🗑️ Clear', `**${qtd}** mensagens deletadas por ${msg.author}.`)] });
  setTimeout(() => aviso.delete().catch(() => {}), 4000);
};

// ─── FALAR ────────────────────────────────────────────────────────────────────
commands['falar'] = async (client, msg, args) => {
  if (!client.CENSURA_OWNER.includes(msg.author.id)) return msg.reply({ embeds: [embed('❌ Sem permissão', 'Você não tem permissão para usar este comando.')] });
  if (!args.length) return msg.reply({ embeds: [embed('❌ Erro', 'Informe a mensagem: `r.falar <mensagem>`')] });
  await msg.delete().catch(() => {});
  msg.channel.send(args.join(' '));
};

// ─── CENSURA (secreto) ────────────────────────────────────────────────────────
commands['censurar'] = async (client, msg, args) => {
  if (!client.CENSURA_OWNER.includes(msg.author.id)) return;
  const acao = args[0]?.toLowerCase();
  const alvo = msg.mentions.members.first();
  if (!alvo || !['on', 'off'].includes(acao)) return;
  msg.delete().catch(() => {});
  if (acao === 'on') {
    client.usuariosCensurados.add(alvo.id);
    msg.author.send(`${getEmoji(msg.guild, 'verificado')} Censura ativada para **${alvo.user.username}**.`).catch(() => {});
  } else {
    client.usuariosCensurados.delete(alvo.id);
    if (client.censuradoAviso) client.censuradoAviso.delete(alvo.id);
    msg.author.send(`🔓 Censura removida de **${alvo.user.username}**.`).catch(() => {});
  }
};

// ─── USERINFO ─────────────────────────────────────────────────────────────────
commands['userinfo'] = async (client, msg, args) => {
  const alvoUser = msg.mentions.users.first() || msg.author;
  const alvoMember = msg.guild ? msg.mentions.members.first() || msg.member : null;
  const user = getUser(alvoUser.id);
  const cargos = alvoMember
    ? alvoMember.roles.cache.filter(r => r.id !== msg.guild.id).sort((a, b) => b.position - a.position).map(r => r.toString()).slice(0, 5).join(', ') || 'Nenhum'
    : 'Informação não disponível em DM';
  const joinedValue = alvoMember
    ? `<t:${Math.floor(alvoMember.joinedTimestamp / 1000)}:R>`
    : 'Somente em servidor';
  const apelido = alvoMember ? (alvoMember.nickname || 'Nenhum') : 'Somente em servidor';
  const cargosQuantidade = alvoMember ? alvoMember.roles.cache.size - 1 : 0;
  const e = new EmbedBuilder()
    .setColor((alvoMember?.displayHexColor) || COR)
    .setAuthor({ name: alvoUser.tag, iconURL: alvoUser.displayAvatarURL() })
    .setThumbnail(alvoUser.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: `${getEmoji(msg.guild, 'info')} ID`, value: `\`${alvoUser.id}\``, inline: true },
      { name: `${getEmoji(msg.guild, 'membro')} Apelido`, value: apelido, inline: true },
      { name: '📅 Conta criada', value: `<t:${Math.floor(alvoUser.createdTimestamp / 1000)}:R>`, inline: true },
      { name: '📥 Entrou no servidor', value: joinedValue, inline: true },
      { name: '⭐ Nível', value: `${user.nivel} (${user.xp} XP)`, inline: true },
      { name: `${getEmoji(msg.guild, 'shop')} Moedas`, value: (user.moedas + user.banco).toLocaleString('pt-BR'), inline: true },
      { name: `${getEmoji(msg.guild, 'staff')} Cargos (${cargosQuantidade})`, value: cargos, inline: false },
    )
    .setTimestamp().setFooter({ text: msg.guild?.name || 'TASD Bot' });
  msg.reply({ embeds: [e] });
};

// ─── SERVERINFO ───────────────────────────────────────────────────────────────
commands['serverinfo'] = async (client, msg, args) => {
  if (!msg.guild) {
    return msg.reply({ embeds: [embed('❌ Disponível apenas em servidores', 'Este comando só funciona em servidores.')] });
  }
  const g = msg.guild;
  await g.fetch();
  const bots = g.members.cache.filter(m => m.user.bot).size;

  const humanos = g.memberCount - bots;
  const e = new EmbedBuilder()
    .setColor(COR)
    .setTitle(`🏰 ${g.name}`)
    .setThumbnail(g.iconURL({ size: 256 }))
    .addFields(
      { name: '🆔 ID', value: g.id, inline: true },
      { name: '👑 Dono', value: `<@${g.ownerId}>`, inline: true },
      { name: '📅 Criado em', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true },
      { name: '👥 Membros', value: `${g.memberCount} (${humanos} humanos, ${bots} bots)`, inline: true },
      { name: '📢 Canais', value: `${g.channels.cache.size}`, inline: true },
      { name: '🏅 Cargos', value: `${g.roles.cache.size}`, inline: true },
      { name: '😄 Emojis', value: `${g.emojis.cache.size}`, inline: true },
      { name: `${getEmoji(msg.guild, 'staff')} Verificação`, value: g.verificationLevel.toString(), inline: true },
      { name: '🚀 Boosts', value: `${g.premiumSubscriptionCount || 0} (Nível ${g.premiumTier})`, inline: true },
    )
    .setTimestamp().setFooter({ text: g.name });
  msg.reply({ embeds: [e] });
};

// ─── PERFIL ───────────────────────────────────────────────────────────────────
commands['perfil'] = async (client, msg, args) => {
  const alvo = msg.mentions.users.first() || msg.author;
  if (ensureUser) await ensureUser(alvo.id);
  const user = getUser(alvo.id);
  const xpNeeded = (user.nivel + 1) * 100;
  const barraLen = 10;
  const preenchido = Math.floor((user.xp / xpNeeded) * barraLen);
  const barra = '█'.repeat(preenchido) + '░'.repeat(barraLen - preenchido);
  const e = new EmbedBuilder()
    .setColor(COR)
    .setAuthor({ name: alvo.tag, iconURL: alvo.displayAvatarURL() })
    .setThumbnail(alvo.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: `${getEmoji(msg.guild, 'info')} Nível`, value: `**${user.nivel}**`, inline: true },
      { name: '✨ XP', value: `${user.xp} / ${xpNeeded}\n\`${barra}\``, inline: true },
      { name: '💍 Casado com', value: user.casadoCom ? `<@${user.casadoCom}>` : 'Solteiro(a)', inline: true },
      { name: `${getEmoji(msg.guild, 'shop')} Carteira`, value: (user.moedas || 0).toLocaleString('pt-BR'), inline: true },
      { name: '🏦 Banco', value: (user.banco || 0).toLocaleString('pt-BR'), inline: true },
      { name: '💰 Total', value: ((user.moedas || 0) + (user.banco || 0)).toLocaleString('pt-BR'), inline: true },
    )
    .setTimestamp().setFooter({ text: msg.guild?.name || 'TASD Bot' });
  msg.reply({ embeds: [e] });
};

// ─── XP ───────────────────────────────────────────────────────────────────────
commands['xp'] = async (client, msg, args) => {
  const alvo = msg.mentions.users.first() || msg.author;
  if (ensureUser) await ensureUser(alvo.id);
  const user = getUser(alvo.id);
  const xpNeeded = (user.nivel + 1) * 100;
  msg.reply({ embeds: [embed(`${getEmoji(msg.guild, 'info')} XP — ${alvo.username}`, `Nível: **${user.nivel}**\nXP: **${user.xp} / ${xpNeeded}**`)] });
};

// ─── RANKING XP ───────────────────────────────────────────────────────────────
commands['rankingxp'] = async (client, msg, args) => {
  const membros = getRankingXP(10);
  const medals = ['🥇', '🥈', '🥉'];
  const lista = membros.map((m, i) => `${medals[i] || `**${i + 1}.**`} <@${m.id}> — Nível **${m.nivel}** (${m.xp} XP)`).join('\n') || 'Ninguém ainda.';
  msg.reply({ embeds: [embed('🏆 Ranking de XP', lista)] });
};

// ─── AJUDA ────────────────────────────────────────────────────────────────────
commands['ajuda'] = async (client, msg, args) => {
  const e = new EmbedBuilder()
    .setColor(COR)
    .setTitle('👑 TASD Bot — Comandos')
    .setDescription('Prefixo: `r.` ou `/` — Abreviações entre parênteses.')
    .addFields(
      {
        name: '💰 Economia — Ganhar dinheiro',
        value: [
          '`daily` — Recompensa diária',
          '`work` *(trabalhar)* — Trabalhe e ganhe moedas',
          '`crime` — Tente a sorte no crime',
          '`roubar @user` — Roube moedas de alguém',
        ].join('\n'),
        inline: false,
      },
      {
        name: '💳 Economia — Banco',
        value: [
          '`banco` *(bal/saldo)* — Veja seu saldo',
          '`dep <valor/all>` *(depositar)* — Deposite no banco',
          '`sac <valor/all>` *(sacar)* — Saque do banco',
          '`pay @user <valor>` *(transferir/tf)* — Transfira moedas',
        ].join('\n'),
        inline: false,
      },
      {
        name: '🎰 Economia — Apostas & Sorte',
        value: [
          '`bet <valor>` *(apostar/slot)* — Caça-níquel',
          '`rasp` *(raspadinha)* — Compre uma raspadinha',
          '`lot` *(loteria)* — Bilhete da loteria semanal',
        ].join('\n'),
        inline: false,
      },
      {
        name: '🌾 Economia — Recursos',
        value: [
          '`fish` *(pescar)* — Pesque itens',
          '`mine` *(minerar)* — Minere recursos',
          '`plant` *(plantar)* — Plante e colha',
          '`sell <item/all>` *(vender)* — Venda itens do inventário',
          '`inv` *(inventario/bag)* — Veja seu inventário',
        ].join('\n'),
        inline: false,
      },
      {
        name: '🏪 Economia — Loja',
        value: [
          '`shop` *(loja)* — Veja os itens disponíveis',
          '`buy <id>` *(comprar)* — Compre um item da loja',
          '`top` *(ranking/lb)* — Ranking de moedas',
        ].join('\n'),
        inline: false,
      },
      {
        name: '⭐ Níveis',
        value: [
          '`p [@user]` *(perfil)* — Veja seu perfil',
          '`xp [@user]` — Veja o XP de alguém',
          '`rankingxp` — Ranking de níveis',
        ].join('\n'),
        inline: false,
      },
      {
        name: '🎮 Diversão',
        value: [
          '`verdade` *(truth)* — Receba uma verdade',
          '`dare` *(desafio)* — Receba um desafio',
          '`ship @u1 @u2` — Compatibilidade entre dois usuários',
          '`marry @user` — Case com alguém',
          '`div` *(divorciar)* — Divorcie-se',
          '`forca` — Inicie um jogo de forca · `l <letra>` para jogar',
          '`8ball <pergunta>` · `dado` · `moeda`',
        ].join('\n'),
        inline: false,
      },
      {
        name: '🛠️ Utilidades',
        value: [
          '`ticket` — Abre o painel de suporte',
          '`ui [@user]` *(userinfo)* — Info de um usuário',
          '`si` *(serverinfo)* — Info do servidor',
          '`clear <qtd>` — Limpa mensagens *(staff)*',
          '`falar <msg>` — Bot fala no canal *(owner)*',
        ].join('\n'),
        inline: false,
      },
    );

  if (msg.guild?.iconURL()) {
    e.setThumbnail(msg.guild.iconURL());
  }

  e.setTimestamp().setFooter({ text: 'TASD — Todos Aqui São Donos' });
  msg.reply({ embeds: [e] });
};

// ─── Slash handlers ───────────────────────────────────────────────────────────
async function slashFalar(client, interaction) {
  if (!client.CENSURA_OWNER.includes(interaction.user.id)) return interaction.reply({ content: '❌ Sem permissão.', ephemeral: true });
  const mensagem = interaction.options.getString('mensagem');
  await interaction.reply({ content: '✅ Mensagem enviada!', ephemeral: true });
  interaction.channel.send(mensagem);
}

async function slashTicket(client, interaction) {
  const e = new EmbedBuilder()
    .setColor(COR)
    .setTitle('🎫 Central de Suporte — TASD')
    .setDescription('Bem-vindo ao sistema de tickets.\n\nClique no botão abaixo para abrir um ticket e escolher a categoria correspondente.\n\n> Seja específico ao descrever sua situação para receber ajuda mais rápido.')
    .setThumbnail(interaction.guild.iconURL())
    .setTimestamp()
    .setFooter({ text: 'TASD — Todos Aqui São Donos' });
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('abrir_ticket').setLabel('Abrir Ticket').setStyle(ButtonStyle.Danger).setEmoji('🎫')
  );
  interaction.reply({ embeds: [e], components: [row] });
}

async function slashPerfil(client, interaction) {
  const alvo = interaction.options.getUser('usuario') || interaction.user;
  if (ensureUser) await ensureUser(alvo.id);
  const user = getUser(alvo.id);
  const xpNeeded = (user.nivel + 1) * 100;
  const e = new EmbedBuilder()
    .setColor(COR)
    .setTitle(`👤 Perfil — ${alvo.username}`)
    .setThumbnail(alvo.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: '⭐ Nível', value: `${user.nivel}`, inline: true },
      { name: '✨ XP', value: `${user.xp} / ${xpNeeded}`, inline: true },
      { name: '💍 Casado com', value: user.casadoCom ? `<@${user.casadoCom}>` : 'Solteiro(a)', inline: true },
      { name: '🪙 Carteira', value: (user.moedas).toLocaleString('pt-BR'), inline: true },
      { name: '🏦 Banco', value: (user.banco).toLocaleString('pt-BR'), inline: true },
      { name: '💰 Total', value: (user.moedas + user.banco).toLocaleString('pt-BR'), inline: true },
    )
    .setTimestamp().setFooter({ text: 'TASD — Todos Aqui São Donos' });
  interaction.reply({ embeds: [e] });
}

async function slashRankingXP(client, interaction) {
  const membros = getRankingXP(10);
  const medals = ['🥇', '🥈', '🥉'];
  const lista = membros.map((m, i) => `${medals[i] || `**${i + 1}.**`} <@${m.id}> — Nível **${m.nivel}** (${m.xp} XP)`).join('\n') || 'Ninguém ainda.';
  interaction.reply({ embeds: [embed('🏆 Ranking de XP', lista)] });
}

async function slashUserinfo(client, interaction) {
  const alvo = interaction.options.getMember('usuario') || interaction.member;
  if (ensureUser) await ensureUser(alvo.id);
  const user = getUser(alvo.id);
  const cargos = alvo.roles.cache.filter(r => r.id !== interaction.guild.id).sort((a, b) => b.position - a.position).map(r => r.toString()).slice(0, 5).join(', ') || 'Nenhum';
  const e = new EmbedBuilder()
    .setColor(alvo.displayHexColor || COR)
    .setTitle(`👤 ${alvo.user.username}`)
    .setThumbnail(alvo.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: '🆔 ID', value: alvo.id, inline: true },
      { name: '🏷️ Apelido', value: alvo.nickname || 'Nenhum', inline: true },
      { name: '📅 Conta criada', value: `<t:${Math.floor(alvo.user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: '📥 Entrou no servidor', value: `<t:${Math.floor(alvo.joinedTimestamp / 1000)}:R>`, inline: true },
      { name: '⭐ Nível', value: `${user.nivel} (${user.xp} XP)`, inline: true },
      { name: '🪙 Moedas', value: `${(user.moedas + user.banco).toLocaleString('pt-BR')}`, inline: true },
      { name: `🏅 Cargos`, value: cargos, inline: false },
    )
    .setTimestamp().setFooter({ text: 'TASD — Todos Aqui São Donos' });
  interaction.reply({ embeds: [e] });
}

async function slashServerinfo(client, interaction) {
  const g = interaction.guild;
  await g.fetch();
  const bots = g.members.cache.filter(m => m.user.bot).size;
  const humanos = g.memberCount - bots;
  const e = new EmbedBuilder()
    .setColor(COR)
    .setTitle(`🏰 ${g.name}`)
    .setThumbnail(g.iconURL({ size: 256 }))
    .addFields(
      { name: '🆔 ID', value: g.id, inline: true },
      { name: '👑 Dono', value: `<@${g.ownerId}>`, inline: true },
      { name: '📅 Criado em', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true },
      { name: '👥 Membros', value: `${g.memberCount} (${humanos} humanos, ${bots} bots)`, inline: true },
      { name: '📢 Canais', value: `${g.channels.cache.size}`, inline: true },
      { name: '🏅 Cargos', value: `${g.roles.cache.size}`, inline: true },
      { name: '😄 Emojis', value: `${g.emojis.cache.size}`, inline: true },
      { name: '🚀 Boosts', value: `${g.premiumSubscriptionCount || 0} (Nível ${g.premiumTier})`, inline: true },
    )
    .setTimestamp().setFooter({ text: 'TASD — Todos Aqui São Donos' });
  interaction.reply({ embeds: [e] });
}

async function slashAjuda(client, interaction) {
  const e = new EmbedBuilder()
    .setColor(COR)
    .setTitle('📖 Comandos — TASD Bot')
    .setDescription('Use `r.` ou `/` como prefixo.')
    .addFields(
      { name: '💰 Economia', value: '`banco` `depositar` `sacar` `daily` `trabalhar` `crime` `roubar` `apostar` `pescar` `minerar` `plantar` `vender` `inventario` `loja` `comprar` `transferir` `raspadinha` `loteria` `ranking`', inline: false },
      { name: '🎮 Diversão', value: '`8ball` `dado` `moeda` `ship` `casar` `divorciar` `verdade` `desafio` `forca` `letra`', inline: false },
      { name: '⭐ Níveis', value: '`perfil` `xp` `rankingxp`', inline: false },
      { name: '🛠️ Utilidades', value: '`ticket` `userinfo` `serverinfo` `clear` `falar`', inline: false },
    )
    .setTimestamp().setFooter({ text: 'TASD — Todos Aqui São Donos' });
  interaction.reply({ embeds: [e], ephemeral: true });
}

module.exports = {
  commands,
  abrirTicketMenu, handleTicketSelect, fecharTicket,
  slashFalar, slashTicket, slashPerfil, slashRankingXP,
  slashUserinfo, slashServerinfo, slashAjuda,
};

//utilidades.js