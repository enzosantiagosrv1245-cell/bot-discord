const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, ChannelType, PermissionFlagsBits, OverwriteType
} = require('discord.js');

const COR = 0xE53935;

function embed(titulo, descricao, cor = COR) {
  return new EmbedBuilder().setColor(cor).setTitle(titulo).setDescription(descricao)
    .setTimestamp().setFooter({ text: 'TASD — Todos Aqui São Donos' });
}

function moedaFmt(n) { return `🪙 **${Number(n).toLocaleString('pt-BR')}** moedas`; }

// ─── Requisitos de parceria ───────────────────────────────────────────────────
const MSG_PARCERIA = `**NOSSOS REQUISITOS:**\n\n✅ Ter **1 representante** da parceria no nosso servidor\n✅ Servidor com **50+ membros**\n✅ Servidor **sem NSFW**\n✅ Servidor com **chat ativo**\n\nSe o seu servidor atende a todos esses requisitos, aguarde um representante! <@1489775575802315045>`;

// ─── Tipos de ticket ──────────────────────────────────────────────────────────
const TICKET_TIPOS = [
  { value: 'suporte', label: '🆘 Suporte Geral', description: 'Dúvidas, bugs e problemas gerais', emoji: '🆘' },
  { value: 'parceria', label: '🤝 Parceria', description: 'Solicitar parceria com outro servidor', emoji: '🤝' },
  { value: 'denuncia', label: '⚠️ Denúncia', description: 'Reportar um usuário ou situação', emoji: '⚠️' },
  { value: 'apelacao', label: '⚖️ Apelação', description: 'Apelar contra punições recebidas', emoji: '⚖️' },
  { value: 'sugestao', label: '💡 Sugestão', description: 'Sugerir melhorias para o servidor', emoji: '💡' },
  { value: 'eventos', label: '🎉 Eventos', description: 'Solicitar ou perguntar sobre eventos', emoji: '🎉' },
  { value: 'cargo', label: '🏷️ Cargos', description: 'Solicitar ou remover cargos', emoji: '🏷️' },
  { value: 'outro', label: '📋 Outro', description: 'Assuntos não listados acima', emoji: '📋' },
];

const commands = {};

// ─── TICKET (painel) ──────────────────────────────────────────────────────────
commands['ticket'] = async (client, msg, args) => {
  const e = new EmbedBuilder()
    .setColor(COR)
    .setTitle('🎫 Central de Suporte — TASD')
    .setDescription('Bem-vindo ao sistema de tickets.\n\nClique no botão abaixo para abrir um ticket e escolher a categoria correspondente.\n\n> Seja específico ao descrever sua situação para receber ajuda mais rápido.')
    .setThumbnail(msg.guild.iconURL())
    .setTimestamp()
    .setFooter({ text: 'TASD — Todos Aqui São Donos' });

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
  await interaction.reply({ content: '**Selecione a categoria do seu ticket abaixo:**', components: [row], ephemeral: true });
}

// ─── Criar ticket ─────────────────────────────────────────────────────────────
async function handleTicketSelect(client, interaction) {
  const tipo = TICKET_TIPOS.find(t => t.value === interaction.values[0]);
  const guild = interaction.guild;
  const userId = interaction.user.id;

  const existente = guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${tipo.value}`);
  if (existente) {
    return interaction.reply({ content: `❌ Você já tem um ticket desse tipo aberto: ${existente}`, ephemeral: true });
  }

  const categoriaTicket = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('ticket'));

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

  // Adicionar permissões de staff (cargos com "staff", "mod", "admin" no nome)
  const cargosStaff = guild.roles.cache.filter(r => /staff|mod|admin|suporte/i.test(r.name));
  for (const [, cargo] of cargosStaff) {
    await canal.permissionOverwrites.edit(cargo, { ViewChannel: true, SendMessages: true });
  }

  const ticketEmbed = new EmbedBuilder()
    .setColor(COR)
    .setTitle(`${tipo.emoji} Ticket — ${tipo.label}`)
    .setDescription(`Olá, ${interaction.user}! Seu ticket foi aberto com sucesso.\n\nPor favor, **descreva seu problema com detalhes** e aguarde. Nossa equipe irá te atender em breve.\n\n> Categoria: **${tipo.label}**`)
    .setThumbnail(interaction.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({ text: 'TASD — Todos Aqui São Donos' });

  const rowTicket = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('fechar_ticket').setLabel('Fechar Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒')
  );

  await canal.send({ content: `${interaction.user} | ${cargosStaff.map(r => `<@&${r.id}>`).join(' ') || ''}`, embeds: [ticketEmbed], components: [rowTicket] });

  if (tipo.value === 'parceria') {
    const parceriaEmbed = new EmbedBuilder().setColor(COR).setTitle('🤝 Requisitos de Parceria').setDescription(MSG_PARCERIA).setTimestamp().setFooter({ text: 'TASD — Todos Aqui São Donos' });
    await canal.send({ embeds: [parceriaEmbed] });
  }

  await interaction.reply({ content: `✅ Seu ticket foi aberto em ${canal}!`, ephemeral: true });
}

// ─── Fechar ticket ────────────────────────────────────────────────────────────
async function fecharTicket(client, interaction) {
  const canal = interaction.channel;
  if (!canal.name.startsWith('ticket-')) return interaction.reply({ content: '❌ Este não é um canal de ticket.', ephemeral: true });

  const e = embed('🔒 Ticket Fechado', `Ticket fechado por ${interaction.user}.\nO canal será deletado em **5 segundos**.`);
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
  if (!msg.member.permissions.has(PermissionFlagsBits.ManageMessages)) return msg.reply({ embeds: [embed('❌ Sem permissão', 'Você não tem permissão para usar este comando.')] });
  if (!args.length) return msg.reply({ embeds: [embed('❌ Erro', 'Informe a mensagem: `r.falar <mensagem>`')] });
  await msg.delete().catch(() => {});
  msg.channel.send(args.join(' '));
};

// ─── CENSURA (secreto) ────────────────────────────────────────────────────────
commands['censurar'] = async (client, msg, args) => {
  if (msg.author.id !== client.CENSURA_OWNER) return;
  const acao = args[0]?.toLowerCase();
  const alvo = msg.mentions.members.first();
  if (!alvo || !['on', 'off'].includes(acao)) return;

  try {
    if (acao === 'on') {
      await alvo.timeout(2419200000, 'Censurado pelo sistema TASD.');
      msg.react('✅').catch(() => {});
    } else {
      await alvo.timeout(null);
      msg.react('🔓').catch(() => {});
    }
  } catch {
    msg.react('❌').catch(() => {});
  }
  setTimeout(() => msg.delete().catch(() => {}), 3000);
};

// ─── USERINFO ─────────────────────────────────────────────────────────────────
commands['userinfo'] = async (client, msg, args) => {
  const alvo = msg.mentions.members.first() || msg.member;
  const db = client.loadDB();
  const user = client.getUser(db, alvo.id);
  const cargos = alvo.roles.cache.filter(r => r.id !== msg.guild.id).sort((a, b) => b.position - a.position).map(r => r.toString()).slice(0, 5).join(', ') || 'Nenhum';
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
      { name: `🏅 Cargos (${alvo.roles.cache.size - 1})`, value: cargos, inline: false },
    )
    .setTimestamp().setFooter({ text: 'TASD — Todos Aqui São Donos' });
  msg.reply({ embeds: [e] });
};

// ─── SERVERINFO ───────────────────────────────────────────────────────────────
commands['serverinfo'] = async (client, msg, args) => {
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
      { name: '🔒 Verificação', value: g.verificationLevel.toString(), inline: true },
      { name: '🚀 Boosts', value: `${g.premiumSubscriptionCount || 0} (Nível ${g.premiumTier})`, inline: true },
    )
    .setTimestamp().setFooter({ text: 'TASD — Todos Aqui São Donos' });
  msg.reply({ embeds: [e] });
};

// ─── PERFIL ───────────────────────────────────────────────────────────────────
commands['perfil'] = async (client, msg, args) => {
  const alvo = msg.mentions.users.first() || msg.author;
  const db = client.loadDB();
  const user = client.getUser(db, alvo.id);
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
  msg.reply({ embeds: [e] });
};

// ─── XP ───────────────────────────────────────────────────────────────────────
commands['xp'] = async (client, msg, args) => {
  const alvo = msg.mentions.users.first() || msg.author;
  const db = client.loadDB();
  const user = client.getUser(db, alvo.id);
  const xpNeeded = (user.nivel + 1) * 100;
  msg.reply({ embeds: [embed('✨ XP', `**${alvo.username}**\nNível: **${user.nivel}**\nXP: **${user.xp} / ${xpNeeded}**`)] });
};

// ─── RANKING XP ───────────────────────────────────────────────────────────────
commands['rankingxp'] = async (client, msg, args) => {
  const db = client.loadDB();
  const membros = Object.entries(db.users)
    .map(([id, u]) => ({ id, nivel: u.nivel || 0, xp: u.xp || 0 }))
    .sort((a, b) => b.nivel !== a.nivel ? b.nivel - a.nivel : b.xp - a.xp)
    .slice(0, 10);
  const medals = ['🥇', '🥈', '🥉'];
  const lista = membros.map((m, i) => `${medals[i] || `**${i + 1}.**`} <@${m.id}> — Nível **${m.nivel}** (${m.xp} XP)`).join('\n') || 'Ninguém ainda.';
  msg.reply({ embeds: [embed('🏆 Ranking de XP', lista)] });
};

// ─── AJUDA ────────────────────────────────────────────────────────────────────
commands['ajuda'] = async (client, msg, args) => {
  const e = new EmbedBuilder()
    .setColor(COR)
    .setTitle('📖 Comandos — TASD Bot')
    .setDescription('Use `r.` ou `/` como prefixo. Veja todos os comandos abaixo:')
    .addFields(
      {
        name: '💰 Economia',
        value: [
          '`banco` `depositar` `sacar` `daily` `trabalhar`',
          '`crime` `roubar` `apostar` `pescar` `minerar`',
          '`plantar` `vender` `inventario` `loja` `comprar`',
          '`transferir` `raspadinha` `loteria` `ranking`',
        ].join('\n'),
        inline: false,
      },
      {
        name: '🎮 Diversão',
        value: [
          '`8ball` `dado` `moeda` `ship` `casar` `divorciar`',
          '`verdade` `desafio` `forca` `letra`',
        ].join('\n'),
        inline: false,
      },
      {
        name: '⭐ Níveis',
        value: '`perfil` `xp` `rankingxp`',
        inline: false,
      },
      {
        name: '🛠️ Utilidades',
        value: '`ticket` `userinfo` `serverinfo` `clear` `falar`',
        inline: false,
      },
    )
    .setThumbnail(msg.guild.iconURL())
    .setTimestamp()
    .setFooter({ text: 'TASD — Todos Aqui São Donos' });
  msg.reply({ embeds: [e] });
};

// ─── Slash handlers ───────────────────────────────────────────────────────────
async function slashFalar(client, interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) return interaction.reply({ content: '❌ Sem permissão.', ephemeral: true });
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
  const db = client.loadDB();
  const user = client.getUser(db, alvo.id);
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
  const db = client.loadDB();
  const membros = Object.entries(db.users)
    .map(([id, u]) => ({ id, nivel: u.nivel || 0, xp: u.xp || 0 }))
    .sort((a, b) => b.nivel !== a.nivel ? b.nivel - a.nivel : b.xp - a.xp)
    .slice(0, 10);
  const medals = ['🥇', '🥈', '🥉'];
  const lista = membros.map((m, i) => `${medals[i] || `**${i + 1}.**`} <@${m.id}> — Nível **${m.nivel}** (${m.xp} XP)`).join('\n') || 'Ninguém ainda.';
  interaction.reply({ embeds: [embed('🏆 Ranking de XP', lista)] });
}

async function slashUserinfo(client, interaction) {
  const alvo = interaction.options.getMember('usuario') || interaction.member;
  const db = client.loadDB();
  const user = client.getUser(db, alvo.id);
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