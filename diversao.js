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
  const alvo = msg.mentions.users.first();
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
  const chave = `${msg.guild.id}-${msg.channel.id}`;
  if (forcaAtiva.has(chave)) return msg.reply({ embeds: [embed('⚠️ Jogo ativo', 'Já tem um jogo de forca ativo neste canal!')] });
  const palavra = palavrasForca[Math.floor(Math.random() * palavrasForca.length)];
  const estado = { palavra, letras: [], erros: 0, iniciador: msg.author.id };
  forcaAtiva.set(chave, estado);
  const display = palavra.split('').map(l => estado.letras.includes(l) ? l : '_').join(' ');
  const e = embed('🎮 Forca', `${forcaEstados[0]}\n\n**Palavra:** \`${display}\`\n**Letras tentadas:** nenhuma ainda\n\nDigite uma letra para adivinhar!`);
  msg.channel.send({ embeds: [e] });
};

commands['letra'] = async (client, msg, args) => {
  const chave = `${msg.guild.id}-${msg.channel.id}`;
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

module.exports = { commands };

//diversao.js