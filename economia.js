const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const COR = 0xE53935;
const COOLDOWNS = { trabalho: 3600000, crime: 7200000, pesca: 1800000, mineracao: 3600000 };

// ─── Utilitários ──────────────────────────────────────────────────────────────
function embed(titulo, descricao, cor = COR) {
  return new EmbedBuilder().setColor(cor).setTitle(titulo).setDescription(descricao).setTimestamp().setFooter({ text: 'TASD — Todos Aqui São Donos' });
}

function moedaFmt(n) { return `🪙 **${Number(n).toLocaleString('pt-BR')}** moedas`; }

function checkCooldown(timestamp, ms) {
  const restante = ms - (Date.now() - timestamp);
  if (restante <= 0) return null;
  const s = Math.floor(restante / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// ─── Trabalhos ────────────────────────────────────────────────────────────────
const trabalhos = [
  { texto: 'Você trabalhou como programador e recebeu', min: 200, max: 500 },
  { texto: 'Você fez entregas de pizza e ganhou', min: 100, max: 300 },
  { texto: 'Você vendeu rifas no mercado e lucrou', min: 150, max: 350 },
  { texto: 'Você ajudou no estoque de um supermercado e recebeu', min: 120, max: 280 },
  { texto: 'Você foi motorista de aplicativo e faturou', min: 180, max: 420 },
  { texto: 'Você deu aulas particulares e ganhou', min: 250, max: 480 },
];

const crimes = [
  { texto: 'Você roubou uma carteira', min: 300, max: 800 },
  { texto: 'Você hackeou uma conta bancária', min: 500, max: 1200 },
  { texto: 'Você falsificou documentos', min: 200, max: 600 },
  { texto: 'Você assaltou uma loja', min: 400, max: 900 },
];

const itensLoja = [
  { id: 'cargo_vip', nome: '👑 Cargo VIP', preco: 5000, tipo: 'cargo', descricao: 'Cargo exclusivo VIP no servidor' },
  { id: 'cargo_rico', nome: '💰 Cargo Rico', preco: 15000, tipo: 'cargo', descricao: 'Cargo de milionário do servidor' },
  { id: 'cargo_lendario', nome: '🏆 Cargo Lendário', preco: 50000, tipo: 'cargo', descricao: 'O cargo mais raro do servidor' },
];

const pescarItens = [
  { nome: 'Sardinha', valor: 50 }, { nome: 'Tilápia', valor: 80 },
  { nome: 'Salmão', valor: 200 }, { nome: 'Atum', valor: 350 },
  { nome: 'Peixe Raro', valor: 800 }, { nome: 'Bota Velha', valor: 5 },
  { nome: 'Lata', valor: 2 }, { nome: 'Peixe Dourado', valor: 1500 },
];

const minerarItens = [
  { nome: 'Carvão', valor: 40 }, { nome: 'Ferro', valor: 90 },
  { nome: 'Ouro', valor: 300 }, { nome: 'Diamante', valor: 700 },
  { nome: 'Rubi', valor: 1200 }, { nome: 'Pedra', valor: 10 },
];

const plantarItens = [
  { nome: 'Trigo', valor: 60, tempo: 1800000 },
  { nome: 'Cenoura', valor: 120, tempo: 3600000 },
  { nome: 'Tomate', valor: 200, tempo: 7200000 },
  { nome: 'Abóbora', valor: 500, tempo: 14400000 },
];

// ─── Comandos ─────────────────────────────────────────────────────────────────
const commands = {};

// BANCO
commands['banco'] = async (client, msg, args) => {
  const alvo = msg.mentions.users.first() || msg.author;
  const db = client.loadDB();
  const user = client.getUser(db, alvo.id);
  const e = embed(`💳 Banco — ${alvo.username}`,
    `**Carteira:** ${moedaFmt(user.moedas)}\n**Banco:** ${moedaFmt(user.banco)}\n**Total:** ${moedaFmt(user.moedas + user.banco)}`
  );
  e.setThumbnail(alvo.displayAvatarURL());
  msg.reply({ embeds: [e] });
};

// DEPOSITAR
commands['depositar'] = async (client, msg, args) => {
  const db = client.loadDB();
  const user = client.getUser(db, msg.author.id);
  const valor = args[0] === 'tudo' ? user.moedas : parseInt(args[0]);
  if (!valor || valor <= 0) return msg.reply({ embeds: [embed('❌ Erro', 'Informe um valor válido.')] });
  if (valor > user.moedas) return msg.reply({ embeds: [embed('❌ Sem saldo', `Você tem apenas ${moedaFmt(user.moedas)} na carteira.`)] });
  user.moedas -= valor;
  user.banco += valor;
  client.saveDB(db);
  msg.reply({ embeds: [embed('🏦 Depósito realizado', `Você depositou ${moedaFmt(valor)} no banco.\nSaldo atual: ${moedaFmt(user.banco)}`)] });
};

// SACAR
commands['sacar'] = async (client, msg, args) => {
  const db = client.loadDB();
  const user = client.getUser(db, msg.author.id);
  const valor = args[0] === 'tudo' ? user.banco : parseInt(args[0]);
  if (!valor || valor <= 0) return msg.reply({ embeds: [embed('❌ Erro', 'Informe um valor válido.')] });
  if (valor > user.banco) return msg.reply({ embeds: [embed('❌ Sem saldo', `Você tem apenas ${moedaFmt(user.banco)} no banco.`)] });
  user.banco -= valor;
  user.moedas += valor;
  client.saveDB(db);
  msg.reply({ embeds: [embed('💵 Saque realizado', `Você sacou ${moedaFmt(valor)} do banco.\nSaldo na carteira: ${moedaFmt(user.moedas)}`)] });
};

// DAILY
commands['daily'] = async (client, msg, args) => {
  const db = client.loadDB();
  const user = client.getUser(db, msg.author.id);
  const cd = checkCooldown(user.daily, 86400000);
  if (cd) return msg.reply({ embeds: [embed('⏳ Cooldown', `Você já resgatou hoje. Próximo daily em **${cd}**.`)] });
  const valor = Math.floor(Math.random() * 500) + 300;
  user.moedas += valor;
  user.daily = Date.now();
  client.saveDB(db);
  msg.reply({ embeds: [embed('🎁 Daily', `Você resgatou ${moedaFmt(valor)}!\nCarteira: ${moedaFmt(user.moedas)}`)] });
};

// TRABALHAR
commands['trabalhar'] = async (client, msg, args) => {
  const db = client.loadDB();
  const user = client.getUser(db, msg.author.id);
  const cd = checkCooldown(user.trabalho, COOLDOWNS.trabalho);
  if (cd) return msg.reply({ embeds: [embed('⏳ Cooldown', `Você está cansado. Volte em **${cd}**.`)] });
  const t = trabalhos[Math.floor(Math.random() * trabalhos.length)];
  const valor = Math.floor(Math.random() * (t.max - t.min)) + t.min;
  user.moedas += valor;
  user.trabalho = Date.now();
  client.saveDB(db);
  msg.reply({ embeds: [embed('💼 Trabalho', `${t.texto} ${moedaFmt(valor)}!\nCarteira: ${moedaFmt(user.moedas)}`)] });
};

// CRIME
commands['crime'] = async (client, msg, args) => {
  const db = client.loadDB();
  const user = client.getUser(db, msg.author.id);
  const cd = checkCooldown(user.crime, COOLDOWNS.crime);
  if (cd) return msg.reply({ embeds: [embed('⏳ Cooldown', `Ainda está quente. Espere **${cd}**.`)] });
  user.crime = Date.now();
  const sucesso = Math.random() > 0.4;
  if (sucesso) {
    const c = crimes[Math.floor(Math.random() * crimes.length)];
    const valor = Math.floor(Math.random() * (c.max - c.min)) + c.min;
    user.moedas += valor;
    client.saveDB(db);
    msg.reply({ embeds: [embed('🦹 Crime', `${c.texto} e lucrou ${moedaFmt(valor)}!\nCarteira: ${moedaFmt(user.moedas)}`)] });
  } else {
    const multa = Math.floor(Math.random() * 300) + 100;
    user.moedas = Math.max(0, user.moedas - multa);
    client.saveDB(db);
    msg.reply({ embeds: [embed('🚔 Preso!', `Você foi pego e pagou uma multa de ${moedaFmt(multa)}!\nCarteira: ${moedaFmt(user.moedas)}`, 0x757575)] });
  }
};

// ROUBAR
commands['roubar'] = async (client, msg, args) => {
  const alvo = msg.mentions.members.first();
  if (!alvo || alvo.user.id === msg.author.id) return msg.reply({ embeds: [embed('❌ Erro', 'Mencione um usuário válido para roubar.')] });
  const db = client.loadDB();
  const ladrão = client.getUser(db, msg.author.id);
  const vítima = client.getUser(db, alvo.id);
  if (vítima.moedas < 50) return msg.reply({ embeds: [embed('😂 Sem grana', 'Essa pessoa está mais pobre que você.')] });
  const sucesso = Math.random() > 0.5;
  if (sucesso) {
    const valor = Math.floor(Math.random() * (vítima.moedas * 0.3)) + 10;
    vítima.moedas -= valor;
    ladrão.moedas += valor;
    client.saveDB(db);
    msg.reply({ embeds: [embed('🥷 Roubo bem-sucedido!', `Você roubou ${moedaFmt(valor)} de ${alvo}!`)] });
  } else {
    const multa = Math.floor(Math.random() * 200) + 50;
    ladrão.moedas = Math.max(0, ladrão.moedas - multa);
    client.saveDB(db);
    msg.reply({ embeds: [embed('🚔 Flagrado!', `Você foi pego roubando ${alvo} e pagou ${moedaFmt(multa)} de multa.`, 0x757575)] });
  }
};

// APOSTAR (caça-níquel)
commands['apostar'] = async (client, msg, args) => {
  const db = client.loadDB();
  const user = client.getUser(db, msg.author.id);
  const valor = args[0] === 'tudo' ? user.moedas : parseInt(args[0]);
  if (!valor || valor <= 0) return msg.reply({ embeds: [embed('❌ Erro', 'Informe um valor para apostar.')] });
  if (valor > user.moedas) return msg.reply({ embeds: [embed('❌ Sem saldo', `Você só tem ${moedaFmt(user.moedas)}.`)] });
  const simbolos = ['🍒', '🍋', '🍊', '⭐', '💎', '7️⃣'];
  const resultado = [0, 0, 0].map(() => simbolos[Math.floor(Math.random() * simbolos.length)]);
  const display = resultado.join(' | ');
  if (resultado[0] === resultado[1] && resultado[1] === resultado[2]) {
    let multiplicador = resultado[0] === '💎' ? 10 : resultado[0] === '7️⃣' ? 7 : resultado[0] === '⭐' ? 5 : 3;
    const ganho = valor * multiplicador;
    user.moedas += ganho - valor;
    client.saveDB(db);
    msg.reply({ embeds: [embed('🎰 JACKPOT!', `[ ${display} ]\n\n🎉 **VOCÊ GANHOU!** Lucro: ${moedaFmt(ganho)}\nCarteira: ${moedaFmt(user.moedas)}`)] });
  } else if (resultado[0] === resultado[1] || resultado[1] === resultado[2] || resultado[0] === resultado[2]) {
    const ganho = Math.floor(valor * 1.5);
    user.moedas += ganho - valor;
    client.saveDB(db);
    msg.reply({ embeds: [embed('🎰 Quase!', `[ ${display} ]\n\nPar encontrado! Ganhou ${moedaFmt(ganho)}.\nCarteira: ${moedaFmt(user.moedas)}`)] });
  } else {
    user.moedas -= valor;
    client.saveDB(db);
    msg.reply({ embeds: [embed('🎰 Que pena...', `[ ${display} ]\n\nVocê perdeu ${moedaFmt(valor)}.\nCarteira: ${moedaFmt(user.moedas)}`, 0x757575)] });
  }
};

// PESCAR
commands['pescar'] = async (client, msg, args) => {
  const db = client.loadDB();
  const user = client.getUser(db, msg.author.id);
  const cd = checkCooldown(user.pesca, COOLDOWNS.pesca);
  if (cd) return msg.reply({ embeds: [embed('⏳ Cooldown', `As águas ainda estão agitadas. Volte em **${cd}**.`)] });
  user.pesca = Date.now();
  if (Math.random() < 0.15) {
    client.saveDB(db);
    return msg.reply({ embeds: [embed('🎣 Que azar...', 'Você não pescou nada dessa vez!')] });
  }
  const item = pescarItens[Math.floor(Math.random() * pescarItens.length)];
  if (!user.inventario) user.inventario = [];
  user.inventario.push({ nome: item.nome, valor: item.valor, tipo: 'peixe' });
  client.saveDB(db);
  msg.reply({ embeds: [embed('🎣 Pescaria', `Você pescou **${item.nome}**!\nVale ${moedaFmt(item.valor)}. Use \`r.vender\` para vender.`)] });
};

// MINERAR
commands['minerar'] = async (client, msg, args) => {
  const db = client.loadDB();
  const user = client.getUser(db, msg.author.id);
  const cd = checkCooldown(user.mineracao, COOLDOWNS.mineracao);
  if (cd) return msg.reply({ embeds: [embed('⏳ Cooldown', `Você está exausto da mineração. Volte em **${cd}**.`)] });
  user.mineracao = Date.now();
  const item = minerarItens[Math.floor(Math.random() * minerarItens.length)];
  if (!user.inventario) user.inventario = [];
  user.inventario.push({ nome: item.nome, valor: item.valor, tipo: 'mineral' });
  client.saveDB(db);
  msg.reply({ embeds: [embed('⛏️ Mineração', `Você minerou **${item.nome}**!\nVale ${moedaFmt(item.valor)}. Use \`r.vender\` para vender.`)] });
};

// PLANTAR
commands['plantar'] = async (client, msg, args) => {
  const db = client.loadDB();
  const user = client.getUser(db, msg.author.id);
  if (user.plantando) {
    if (Date.now() >= user.plantaColher) {
      const item = user.plantando;
      if (!user.inventario) user.inventario = [];
      user.inventario.push({ nome: item.nome, valor: item.valor, tipo: 'planta' });
      user.plantando = null;
      user.plantaColher = null;
      client.saveDB(db);
      return msg.reply({ embeds: [embed('🌾 Colheita!', `Sua **${item.nome}** está pronta! Foi adicionada ao inventário.\nUse \`r.vender\` para vender.`)] });
    } else {
      const restante = checkCooldown(Date.now() - (user.plantaColher - Date.now()) / 2, (user.plantaColher - Date.now()) + (user.plantaColher - Date.now()) / 2);
      const tempo = Math.ceil((user.plantaColher - Date.now()) / 60000);
      return msg.reply({ embeds: [embed('🌱 Plantando...', `Sua **${user.plantando.nome}** ainda está crescendo. Pronta em **${tempo} minutos**.`)] });
    }
  }
  const item = plantarItens[Math.floor(Math.random() * plantarItens.length)];
  user.plantando = item;
  user.plantaColher = Date.now() + item.tempo;
  client.saveDB(db);
  const tempo = item.tempo / 60000;
  msg.reply({ embeds: [embed('🌱 Plantando', `Você plantou **${item.nome}**!\nEla estará pronta em **${tempo} minutos**. Use \`r.plantar\` para colher.`)] });
};

// VENDER
commands['vender'] = async (client, msg, args) => {
  const db = client.loadDB();
  const user = client.getUser(db, msg.author.id);
  if (!user.inventario || user.inventario.length === 0) return msg.reply({ embeds: [embed('❌ Inventário vazio', 'Você não tem itens para vender.')] });
  const nome = args.join(' ').toLowerCase();
  if (nome === 'tudo') {
    const total = user.inventario.reduce((a, b) => a + b.valor, 0);
    user.moedas += total;
    const qtd = user.inventario.length;
    user.inventario = [];
    client.saveDB(db);
    return msg.reply({ embeds: [embed('💰 Venda', `Vendeu **${qtd} itens** por ${moedaFmt(total)}!\nCarteira: ${moedaFmt(user.moedas)}`)] });
  }
  const idx = user.inventario.findIndex(i => i.nome.toLowerCase() === nome);
  if (idx === -1) return msg.reply({ embeds: [embed('❌ Item não encontrado', `Você não tem **${args.join(' ')}** no inventário.`)] });
  const item = user.inventario.splice(idx, 1)[0];
  user.moedas += item.valor;
  client.saveDB(db);
  msg.reply({ embeds: [embed('💰 Venda', `Vendeu **${item.nome}** por ${moedaFmt(item.valor)}!\nCarteira: ${moedaFmt(user.moedas)}`)] });
};

// INVENTÁRIO
commands['inventario'] = async (client, msg, args) => {
  const db = client.loadDB();
  const user = client.getUser(db, msg.author.id);
  if (!user.inventario || user.inventario.length === 0) return msg.reply({ embeds: [embed('🎒 Inventário', 'Seu inventário está vazio.')] });
  const lista = user.inventario.map((i, idx) => `${idx + 1}. **${i.nome}** — ${moedaFmt(i.valor)}`).join('\n');
  msg.reply({ embeds: [embed('🎒 Inventário', lista)] });
};

// LOJA
commands['loja'] = async (client, msg, args) => {
  const lista = itensLoja.map(i => `**${i.nome}**\n💬 ${i.descricao}\n💵 Preço: ${moedaFmt(i.preco)}\nID: \`${i.id}\``).join('\n\n');
  msg.reply({ embeds: [embed('🏪 Loja — TASD', lista + '\n\nUse `r.comprar <ID>` para comprar!')] });
};

// COMPRAR
commands['comprar'] = async (client, msg, args) => {
  const itemId = args[0];
  const item = itensLoja.find(i => i.id === itemId);
  if (!item) return msg.reply({ embeds: [embed('❌ Item inválido', 'Use `r.loja` para ver os itens disponíveis.')] });
  const db = client.loadDB();
  const user = client.getUser(db, msg.author.id);
  if (user.moedas < item.preco) return msg.reply({ embeds: [embed('❌ Saldo insuficiente', `Você precisa de ${moedaFmt(item.preco)} e tem apenas ${moedaFmt(user.moedas)}.`)] });
  user.moedas -= item.preco;
  client.saveDB(db);
  if (item.tipo === 'cargo') {
    const cargo = msg.guild.roles.cache.find(r => r.name === item.nome.replace(/[^a-zA-Z0-9 ]/g, '').trim()) ||
                  msg.guild.roles.cache.find(r => r.name.toLowerCase().includes(item.id.replace('cargo_', '')));
    if (cargo) {
      await msg.member.roles.add(cargo).catch(() => {});
      msg.reply({ embeds: [embed('✅ Compra realizada!', `Você comprou **${item.nome}** e recebeu o cargo!`)] });
    } else {
      msg.reply({ embeds: [embed('✅ Compra realizada!', `Você comprou **${item.nome}**! O cargo será atribuído em breve por um administrador.`)] });
    }
  }
};

// TRANSFERIR
commands['transferir'] = async (client, msg, args) => {
  const alvo = msg.mentions.users.first();
  const valor = parseInt(args[1]);
  if (!alvo || alvo.bot || alvo.id === msg.author.id) return msg.reply({ embeds: [embed('❌ Erro', 'Mencione um usuário válido.')] });
  if (!valor || valor <= 0) return msg.reply({ embeds: [embed('❌ Erro', 'Informe um valor válido.')] });
  const db = client.loadDB();
  const de = client.getUser(db, msg.author.id);
  const para = client.getUser(db, alvo.id);
  if (de.moedas < valor) return msg.reply({ embeds: [embed('❌ Saldo insuficiente', `Você só tem ${moedaFmt(de.moedas)}.`)] });
  de.moedas -= valor;
  para.moedas += valor;
  client.saveDB(db);
  msg.reply({ embeds: [embed('💸 Transferência', `Você enviou ${moedaFmt(valor)} para ${alvo}!`)] });
};

// RASPADINHA
commands['raspadinha'] = async (client, msg, args) => {
  const PRECO = 100;
  const db = client.loadDB();
  const user = client.getUser(db, msg.author.id);
  if (user.moedas < PRECO) return msg.reply({ embeds: [embed('❌ Sem saldo', `A raspadinha custa ${moedaFmt(PRECO)}.`)] });
  user.moedas -= PRECO;
  const simbolos = ['💀', '💰', '⭐', '💎', '🎁', '❌', '💀', '❌', '💀'];
  const grade = Array.from({ length: 9 }, () => simbolos[Math.floor(Math.random() * simbolos.length)]);
  const contagem = {};
  grade.forEach(s => contagem[s] = (contagem[s] || 0) + 1);
  let ganho = 0;
  if (contagem['💎'] >= 3) ganho = 5000;
  else if (contagem['💰'] >= 3) ganho = 1500;
  else if (contagem['⭐'] >= 3) ganho = 800;
  else if (contagem['🎁'] >= 2) ganho = 300;
  else if (contagem['💰'] >= 2) ganho = 150;
  user.moedas += ganho;
  client.saveDB(db);
  const linhas = [grade.slice(0, 3), grade.slice(3, 6), grade.slice(6, 9)];
  const displayGrade = linhas.map(l => l.join(' ')).join('\n');
  const resultado = ganho > 0 ? `🎉 **Parabéns!** Você ganhou ${moedaFmt(ganho)}!` : '❌ Não foi dessa vez...';
  msg.reply({ embeds: [embed('🎟️ Raspadinha', `${displayGrade}\n\n${resultado}\nCarteira: ${moedaFmt(user.moedas)}`)] });
};

// LOTERIA
commands['loteria'] = async (client, msg, args) => {
  const PRECO = 200;
  const db = client.loadDB();
  const user = client.getUser(db, msg.author.id);
  if (user.moedas < PRECO) return msg.reply({ embeds: [embed('❌ Sem saldo', `O bilhete da loteria custa ${moedaFmt(PRECO)}.`)] });
  if (!db.loteria[msg.guild.id]) db.loteria[msg.guild.id] = { participantes: [], pote: 0, ultimo: 0 };
  const loteria = db.loteria[msg.guild.id];
  if (loteria.participantes.includes(msg.author.id)) return msg.reply({ embeds: [embed('⚠️ Já inscrito', 'Você já comprou um bilhete para essa rodada!')] });
  user.moedas -= PRECO;
  loteria.participantes.push(msg.author.id);
  loteria.pote += PRECO;
  client.saveDB(db);
  msg.reply({ embeds: [embed('🎟️ Loteria', `Bilhete comprado!\nPote atual: ${moedaFmt(loteria.pote)}\nParticipantes: **${loteria.participantes.length}**\nSorteio toda **domingo às 20h**.`)] });
};

// RANKING
commands['ranking'] = async (client, msg, args) => {
  const db = client.loadDB();
  const membros = Object.entries(db.users)
    .map(([id, u]) => ({ id, total: (u.moedas || 0) + (u.banco || 0) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const medals = ['🥇', '🥈', '🥉'];
  const lista = membros.map((m, i) => `${medals[i] || `**${i + 1}.**`} <@${m.id}> — ${moedaFmt(m.total)}`).join('\n') || 'Ninguém ainda.';
  msg.reply({ embeds: [embed('🏆 Ranking de Moedas', lista)] });
};

// ─── Sorteio automático loteria ───────────────────────────────────────────────
async function sorteioLoteria(client) {
  const db = client.loadDB();
  for (const [guildId, loteria] of Object.entries(db.loteria)) {
    if (!loteria.participantes || loteria.participantes.length === 0) continue;
    const vencedorId = loteria.participantes[Math.floor(Math.random() * loteria.participantes.length)];
    const guild = client.guilds.cache.get(guildId);
    if (!guild) continue;
    const vencedor = client.getUser(db, vencedorId);
    vencedor.moedas += loteria.pote;
    const canal = guild.channels.cache.find(c => c.name.includes('geral') || c.name.includes('chat'));
    if (canal) {
      const e = new EmbedBuilder().setColor(COR).setTitle('🎉 Sorteio da Loteria!')
        .setDescription(`O vencedor desta semana é <@${vencedorId}>!\n\nPrêmio: ${moedaFmt(loteria.pote)} 🪙\n\nParabéns!`).setTimestamp();
      canal.send({ embeds: [e] });
    }
    db.loteria[guildId] = { participantes: [], pote: 0, ultimo: Date.now() };
  }
  client.saveDB(db);
}

// ─── Slash handlers ───────────────────────────────────────────────────────────
async function slashBanco(client, interaction) {
  const alvo = interaction.options.getUser('usuario') || interaction.user;
  const db = client.loadDB();
  const user = client.getUser(db, alvo.id);
  const e = new EmbedBuilder().setColor(COR).setTitle(`💳 Banco — ${alvo.username}`)
    .setDescription(`**Carteira:** ${moedaFmt(user.moedas)}\n**Banco:** ${moedaFmt(user.banco)}\n**Total:** ${moedaFmt(user.moedas + user.banco)}`)
    .setThumbnail(alvo.displayAvatarURL()).setTimestamp().setFooter({ text: 'TASD — Todos Aqui São Donos' });
  interaction.reply({ embeds: [e] });
}

async function slashDaily(client, interaction) {
  const db = client.loadDB();
  const user = client.getUser(db, interaction.user.id);
  const cd = checkCooldown(user.daily, 86400000);
  if (cd) return interaction.reply({ embeds: [embed('⏳ Cooldown', `Próximo daily em **${cd}**.`)], ephemeral: true });
  const valor = Math.floor(Math.random() * 500) + 300;
  user.moedas += valor;
  user.daily = Date.now();
  client.saveDB(db);
  interaction.reply({ embeds: [embed('🎁 Daily', `Você resgatou ${moedaFmt(valor)}!\nCarteira: ${moedaFmt(user.moedas)}`)] });
}

async function slashRanking(client, interaction) {
  const db = client.loadDB();
  const membros = Object.entries(db.users)
    .map(([id, u]) => ({ id, total: (u.moedas || 0) + (u.banco || 0) }))
    .sort((a, b) => b.total - a.total).slice(0, 10);
  const medals = ['🥇', '🥈', '🥉'];
  const lista = membros.map((m, i) => `${medals[i] || `**${i + 1}.**`} <@${m.id}> — ${moedaFmt(m.total)}`).join('\n') || 'Ninguém ainda.';
  interaction.reply({ embeds: [embed('🏆 Ranking de Moedas', lista)] });
}

module.exports = { commands, sorteioLoteria, slashBanco, slashDaily, slashRanking };