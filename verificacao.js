const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  PermissionFlagsBits, ChannelType
} = require('discord.js');

const COR = 0xE53935;
const CARGO_VERIFICADO = '1492937390577422357';
const CARGO_NAO_VERIFICADO = '1492937430083567737';
const CANAL_VERIFICACAO = '1492937230832898218';

// userId => { resposta, tentativas, timeout }
const sessoes = new Map();

function gerarConta() {
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, resposta;
  if (op === '+') { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1; resposta = a + b; }
  else if (op === '-') { a = Math.floor(Math.random() * 20) + 10; b = Math.floor(Math.random() * 10) + 1; resposta = a - b; }
  else { a = Math.floor(Math.random() * 9) + 2; b = Math.floor(Math.random() * 9) + 2; resposta = a * b; }
  return { pergunta: `${a} ${op} ${b}`, resposta };
}

// ─── Envia o embed de verificação no canal ────────────────────────────────────
async function setupVerificacao(client, msg) {
  if (!msg.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return msg.reply({ embeds: [new EmbedBuilder().setColor(COR).setTitle('❌ Sem permissão').setDescription('Apenas administradores podem usar este comando.').setTimestamp()] });
  }

  const canal = msg.guild.channels.cache.get(CANAL_VERIFICACAO);
  if (!canal) return msg.reply({ content: '❌ Canal de verificação não encontrado.' });

  const embed = new EmbedBuilder()
    .setColor(COR)
    .setTitle('👑 Verificação — TASD')
    .setDescription(
      '**Bem-vindo ao servidor!**\n\n' +
      'Para ter acesso completo ao servidor, você precisa se verificar.\n\n' +
      '> Clique no botão abaixo e responda a pergunta que será enviada na sua **DM**.\n\n' +
      '⚠️ Certifique-se de que suas DMs estão **abertas** antes de clicar.'
    )
    .setThumbnail(msg.guild.iconURL({ size: 256 }))
    .setFooter({ text: 'TASD — Todos Aqui São Donos • Verificação anti-raid' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('verificar_membro')
      .setLabel('Verificar')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('✅')
  );

  await canal.send({ embeds: [embed], components: [row] });
  msg.reply({ content: '✅ Embed de verificação enviado!', ephemeral: true }).catch(() => {});
}

// ─── Ao clicar no botão ───────────────────────────────────────────────────────
async function handleVerificacaoBtn(client, interaction) {
  const member = interaction.member;
  const guild = interaction.guild;

  // Já verificado
  if (member.roles.cache.has(CARGO_VERIFICADO)) {
    return interaction.reply({ content: '✅ Você já está verificado!', ephemeral: true });
  }

  // Já tem sessão ativa
  if (sessoes.has(member.id)) {
    return interaction.reply({ content: '⏳ Você já tem uma verificação em andamento. Verifique sua DM!', ephemeral: true });
  }

  const { pergunta, resposta } = gerarConta();
  sessoes.set(member.id, { resposta, tentativas: 0 });

  // Timeout de 2 minutos para responder
  const timer = setTimeout(() => {
    if (sessoes.has(member.id)) {
      sessoes.delete(member.id);
      member.send('⏰ Tempo esgotado! Clique no botão de verificação novamente para tentar outra vez.').catch(() => {});
    }
  }, 120000);
  sessoes.get(member.id).timer = timer;

  const dmEmbed = new EmbedBuilder()
    .setColor(COR)
    .setTitle('🔐 Verificação — TASD')
    .setDescription(
      `Olá! Para acessar o servidor **${guild.name}**, resolva a seguinte conta:\n\n` +
      `# \`${pergunta} = ?\`\n\n` +
      `Responda com **apenas o número** aqui na DM.\nVocê tem **3 tentativas** e **2 minutos**.`
    )
    .setFooter({ text: 'TASD — Todos Aqui São Donos' })
    .setTimestamp();

  try {
    await member.send({ embeds: [dmEmbed] });
    await interaction.reply({ content: '📩 Te enviei uma DM com as instruções! Verifique sua caixa de mensagens.', ephemeral: true });
  } catch {
    sessoes.delete(member.id);
    clearTimeout(timer);
    await interaction.reply({
      content: '❌ Não consegui te enviar DM! Abra suas DMs em **Configurações → Privacidade** e tente novamente.',
      ephemeral: true
    });
  }
}

// ─── Escuta respostas na DM ───────────────────────────────────────────────────
async function handleDMResposta(client, message) {
  if (message.author.bot || message.guild) return;

  const sessao = sessoes.get(message.author.id);
  if (!sessao) return;

  const resposta = parseInt(message.content.trim());

  if (isNaN(resposta)) {
    return message.reply('❌ Responda apenas com um número!');
  }

  if (resposta === sessao.resposta) {
    // ✅ Correto — verificar em todos os servidores permitidos
    clearTimeout(sessao.timer);
    sessoes.delete(message.author.id);

    let verificado = false;
    for (const guildId of client.ALLOWED_GUILDS) {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) continue;
      const member = guild.members.cache.get(message.author.id) || await guild.members.fetch(message.author.id).catch(() => null);
      if (!member) continue;

      try {
        await member.roles.add(CARGO_VERIFICADO);
        if (member.roles.cache.has(CARGO_NAO_VERIFICADO)) {
          await member.roles.remove(CARGO_NAO_VERIFICADO);
        }
        verificado = true;
      } catch { /* sem permissão */ }
    }

    const embed = new EmbedBuilder()
      .setColor(0x43A047)
      .setTitle('✅ Verificação concluída!')
      .setDescription('Você foi verificado com sucesso e agora tem acesso completo ao servidor.\n\nBem-vindo ao **TASD — Todos Aqui São Donos**! 👑')
      .setTimestamp()
      .setFooter({ text: 'TASD — Todos Aqui São Donos' });

    message.reply({ embeds: [embed] });

  } else {
    sessao.tentativas += 1;

    if (sessao.tentativas >= 3) {
      clearTimeout(sessao.timer);
      sessoes.delete(message.author.id);

      // Kictar de todos os servidores permitidos
      for (const guildId of client.ALLOWED_GUILDS) {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) continue;
        const member = guild.members.cache.get(message.author.id) || await guild.members.fetch(message.author.id).catch(() => null);
        if (member) await member.kick('Falhou na verificação anti-raid 3 vezes.').catch(() => {});
      }

      const embed = new EmbedBuilder()
        .setColor(0xE53935)
        .setTitle('❌ Verificação falhou')
        .setDescription('Você errou **3 vezes** e foi removido do servidor.\nSe foi um engano, entre novamente pelo link de convite.')
        .setTimestamp()
        .setFooter({ text: 'TASD — Todos Aqui São Donos' });

      message.reply({ embeds: [embed] });

    } else {
      const restantes = 3 - sessao.tentativas;
      message.reply(`❌ Resposta incorreta! Você tem mais **${restantes} tentativa${restantes > 1 ? 's' : ''}**. Tente novamente:`);
    }
  }
}

// ─── Tranca canais ao entrar no servidor ─────────────────────────────────────
async function handleMembroEntrou(member) {
  try {
    // Dá o cargo de não verificado
    const cargoNV = member.guild.roles.cache.get(CARGO_NAO_VERIFICADO);
    if (cargoNV) await member.roles.add(cargoNV).catch(() => {});

    // DM de boas-vindas
    const embed = new EmbedBuilder()
      .setColor(COR)
      .setTitle('👋 Bem-vindo ao TASD!')
      .setDescription(
        `Olá, **${member.user.username}**!\n\n` +
        `Para acessar o servidor, vá até o canal de verificação e clique no botão **Verificar**.\n\n` +
        `> <#${CANAL_VERIFICACAO}>`
      )
      .setThumbnail(member.guild.iconURL())
      .setFooter({ text: 'TASD — Todos Aqui São Donos' })
      .setTimestamp();

    member.send({ embeds: [embed] }).catch(() => {});
  } catch { /* ignora */ }
}

module.exports = { setupVerificacao, handleVerificacaoBtn, handleDMResposta, handleMembroEntrou, CANAL_VERIFICACAO, CARGO_VERIFICADO, CARGO_NAO_VERIFICADO };