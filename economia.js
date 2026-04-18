const { EmbedBuilder } = require('discord.js');

const COR = 0xE53935;
const COOLDOWNS = { trabalho: 3600000, crime: 7200000, pesca: 1800000, mineracao: 3600000 };

function embed(titulo, descricao, cor = COR) {
  return new EmbedBuilder().setColor(cor).setTitle(titulo).setDescription(descricao).setTimestamp().setFooter({ text: 'TASD — Todos Aqui São Donos' });
}
function moedaFmt(n) { return `🪙 **${Number(n).toLocaleString('pt-BR')}** moedas`; }
function checkCooldown(timestamp, ms) {
  const r = ms - (Date.now() - (timestamp || 0));
  if (r <= 0) return null;
  const s = Math.floor(r / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// Helpers para pegar DB do client
function U(client, id) {
  const u = client.getUser(id);
  return { moedas:u.moedas||0, banco:u.banco||0, xp:u.xp||0, nivel:u.nivel||0,
    daily:u.daily||0, trabalho:u.trabalho||0, crime:u.crime||0,
    pesca:u.pesca||0, mineracao:u.mineracao||0,
    inventario:u.inventario||[], plantando:u.plantando||null,
    plantaColher:u.plantaColher||null, casadoCom:u.casadoCom||null };
}
async function EU(client, id) { await client.ensureUser(id); return U(client, id); }

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

const commands = {};

commands['banco'] = async (client, msg, args) => {
  const alvo = msg.mentions.users.first() || msg.author;
  const user = await EU(client, alvo.id);
  const e = embed(`💳 Banco — ${alvo.username}`,
    `**Carteira:** ${moedaFmt(user.moedas)}\n**Banco:** ${moedaFmt(user.banco)}\n**Total:** ${moedaFmt(user.moedas + user.banco)}`
  ).setThumbnail(alvo.displayAvatarURL());
  msg.reply({ embeds: [e] });
};

commands['depositar'] = async (client, msg, args) => {
  const user = await EU(client, msg.author.id);
  const valor = (args[0] === 'tudo' || args[0] === 'all') ? user.moedas : parseInt(args[0]);
  if (!valor || valor <= 0) return msg.reply({ embeds: [embed('❌ Erro', 'Informe um valor válido.')] });
  if (valor > user.moedas) return msg.reply({ embeds: [embed('❌ Sem saldo', `Você tem apenas ${moedaFmt(user.moedas)} na carteira.`)] });
  client.saveUser(msg.author.id, { moedas: user.moedas - valor, banco: user.banco + valor });
  msg.reply({ embeds: [embed('🏦 Depósito', `Você depositou ${moedaFmt(valor)}.\nBanco: ${moedaFmt(user.banco + valor)}`)] });
};

commands['sacar'] = async (client, msg, args) => {
  const user = await EU(client, msg.author.id);
  const valor = (args[0] === 'tudo' || args[0] === 'all') ? user.banco : parseInt(args[0]);
  if (!valor || valor <= 0) return msg.reply({ embeds: [embed('❌ Erro', 'Informe um valor válido.')] });
  if (valor > user.banco) return msg.reply({ embeds: [embed('❌ Sem saldo', `Você tem apenas ${moedaFmt(user.banco)} no banco.`)] });
  client.saveUser(msg.author.id, { moedas: user.moedas + valor, banco: user.banco - valor });
  msg.reply({ embeds: [embed('💵 Saque', `Você sacou ${moedaFmt(valor)}.\nCarteira: ${moedaFmt(user.moedas + valor)}`)] });
};

commands['daily'] = async (client, msg, args) => {
  const user = await EU(client, msg.author.id);
  const cd = checkCooldown(user.daily, 86400000);
  if (cd && !client.CENSURA_OWNER.includes(msg.author.id)) return msg.reply({ embeds: [embed('⏳ Cooldown', `Próximo daily em **${cd}**.`)] });
  const valor = Math.floor(Math.random() * 500) + 300;
  client.saveUser(msg.author.id, { moedas: user.moedas + valor, daily: Date.now() });
  msg.reply({ embeds: [embed('🎁 Daily', `Você resgatou ${moedaFmt(valor)}!\nCarteira: ${moedaFmt(user.moedas + valor)}`)] });
};

commands['trabalhar'] = async (client, msg, args) => {
  const user = await EU(client, msg.author.id);
  const cd = checkCooldown(user.trabalho, COOLDOWNS.trabalho);
  if (cd && !client.CENSURA_OWNER.includes(msg.author.id)) return msg.reply({ embeds: [embed('⏳ Cooldown', `Volte em **${cd}**.`)] });
  const t = trabalhos[Math.floor(Math.random() * trabalhos.length)];
  const valor = Math.floor(Math.random() * (t.max - t.min)) + t.min;
  client.saveUser(msg.author.id, { moedas: user.moedas + valor, trabalho: Date.now() });
  msg.reply({ embeds: [embed('💼 Trabalho', `${t.texto} ${moedaFmt(valor)}!\nCarteira: ${moedaFmt(user.moedas + valor)}`)] });
};

commands['crime'] = async (client, msg, args) => {
  const user = await EU(client, msg.author.id);
  const cd = checkCooldown(user.crime, COOLDOWNS.crime);
  if (cd && !client.CENSURA_OWNER.includes(msg.author.id)) return msg.reply({ embeds: [embed('⏳ Cooldown', `Espere **${cd}**.`)] });
  if (Math.random() > 0.4) {
    const c = crimes[Math.floor(Math.random() * crimes.length)];
    const valor = Math.floor(Math.random() * (c.max - c.min)) + c.min;
    client.saveUser(msg.author.id, { moedas: user.moedas + valor, crime: Date.now() });
    msg.reply({ embeds: [embed('🦹 Crime', `${c.texto} e lucrou ${moedaFmt(valor)}!\nCarteira: ${moedaFmt(user.moedas + valor)}`)] });
  } else {
    const multa = Math.floor(Math.random() * 300) + 100;
    client.saveUser(msg.author.id, { moedas: Math.max(0, user.moedas - multa), crime: Date.now() });
    msg.reply({ embeds: [embed('🚔 Preso!', `Você pagou multa de ${moedaFmt(multa)}!\nCarteira: ${moedaFmt(Math.max(0, user.moedas - multa))}`, 0x757575)] });
  }
};

commands['roubar'] = async (client, msg, args) => {
  const alvo = msg.mentions.members?.first() || msg.mentions.users?.first();
  if (!alvo || alvo.id === msg.author.id) return msg.reply({ embeds: [embed('❌ Erro', 'Mencione um usuário válido.')] });
  const ladrao = await EU(client, msg.author.id);
  const vitima = await EU(client, alvo.id);
  if (vitima.moedas < 50) return msg.reply({ embeds: [embed('😂 Sem grana', 'Essa pessoa está mais pobre que você.')] });
  if (Math.random() > 0.5) {
    const valor = Math.floor(Math.random() * (vitima.moedas * 0.3)) + 10;
    client.saveUser(alvo.id, { moedas: vitima.moedas - valor });
    client.saveUser(msg.author.id, { moedas: ladrao.moedas + valor });
    msg.reply({ embeds: [embed('🥷 Roubo!', `Você roubou ${moedaFmt(valor)} de ${alvo}!`)] });
  } else {
    const multa = Math.floor(Math.random() * 200) + 50;
    client.saveUser(msg.author.id, { moedas: Math.max(0, ladrao.moedas - multa) });
    msg.reply({ embeds: [embed('🚔 Flagrado!', `Você pagou ${moedaFmt(multa)} de multa.`, 0x757575)] });
  }
};

commands['apostar'] = async (client, msg, args) => {
  const user = await EU(client, msg.author.id);
  const valor = (args[0] === 'tudo' || args[0] === 'all') ? user.moedas : parseInt(args[0]);
  if (!valor || valor <= 0) return msg.reply({ embeds: [embed('❌ Erro', 'Informe um valor.')] });
  if (valor > user.moedas) return msg.reply({ embeds: [embed('❌ Sem saldo', `Você só tem ${moedaFmt(user.moedas)}.`)] });
  const simbolos = ['🍒', '🍋', '🍊', '⭐', '💎', '7️⃣'];
  const r = [0,0,0].map(() => simbolos[Math.floor(Math.random() * simbolos.length)]);
  const display = r.join(' | ');
  if (r[0] === r[1] && r[1] === r[2]) {
    const mult = r[0]==='💎'?10:r[0]==='7️⃣'?7:r[0]==='⭐'?5:3;
    const ganho = valor * mult;
    client.saveUser(msg.author.id, { moedas: user.moedas + ganho - valor });
    msg.reply({ embeds: [embed('🎰 JACKPOT!', `[ ${display} ]\n\n🎉 Lucro: ${moedaFmt(ganho)}\nCarteira: ${moedaFmt(user.moedas + ganho - valor)}`)] });
  } else if (r[0]===r[1]||r[1]===r[2]||r[0]===r[2]) {
    const ganho = Math.floor(valor * 1.5);
    client.saveUser(msg.author.id, { moedas: user.moedas + ganho - valor });
    msg.reply({ embeds: [embed('🎰 Quase!', `[ ${display} ]\n\nPar! Ganhou ${moedaFmt(ganho)}.\nCarteira: ${moedaFmt(user.moedas + ganho - valor)}`)] });
  } else {
    client.saveUser(msg.author.id, { moedas: user.moedas - valor });
    msg.reply({ embeds: [embed('🎰 Que pena...', `[ ${display} ]\n\nPerdeu ${moedaFmt(valor)}.\nCarteira: ${moedaFmt(user.moedas - valor)}`, 0x757575)] });
  }
};

commands['pescar'] = async (client, msg, args) => {
  const user = await EU(client, msg.author.id);
  const cd = checkCooldown(user.pesca, COOLDOWNS.pesca);
  if (cd && !client.CENSURA_OWNER.includes(msg.author.id)) return msg.reply({ embeds: [embed('⏳ Cooldown', `Volte em **${cd}**.`)] });
  client.saveUser(msg.author.id, { pesca: Date.now() });
  if (Math.random() < 0.15) return msg.reply({ embeds: [embed('🎣 Que azar...', 'Você não pescou nada!')] });
  const item = pescarItens[Math.floor(Math.random() * pescarItens.length)];
  const inv = [...user.inventario, { nome: item.nome, valor: item.valor, tipo: 'peixe' }];
  client.saveUser(msg.author.id, { inventario: inv });
  msg.reply({ embeds: [embed('🎣 Pescaria', `Você pescou **${item.nome}**!\nVale ${moedaFmt(item.valor)}. Use \`r.sell\` para vender.`)] });
};

commands['minerar'] = async (client, msg, args) => {
  const user = await EU(client, msg.author.id);
  const cd = checkCooldown(user.mineracao, COOLDOWNS.mineracao);
  if (cd && !client.CENSURA_OWNER.includes(msg.author.id)) return msg.reply({ embeds: [embed('⏳ Cooldown', `Volte em **${cd}**.`)] });
  const item = minerarItens[Math.floor(Math.random() * minerarItens.length)];
  const inv = [...user.inventario, { nome: item.nome, valor: item.valor, tipo: 'mineral' }];
  client.saveUser(msg.author.id, { mineracao: Date.now(), inventario: inv });
  msg.reply({ embeds: [embed('⛏️ Mineração', `Você minerou **${item.nome}**!\nVale ${moedaFmt(item.valor)}. Use \`r.sell\` para vender.`)] });
};

commands['plantar'] = async (client, msg, args) => {
  const user = await EU(client, msg.author.id);
  if (user.plantando) {
    if (Date.now() >= user.plantaColher) {
      const inv = [...user.inventario, { nome: user.plantando.nome, valor: user.plantando.valor, tipo: 'planta' }];
      client.saveUser(msg.author.id, { inventario: inv, plantando: null, plantaColher: null });
      return msg.reply({ embeds: [embed('🌾 Colheita!', `Sua **${user.plantando.nome}** está pronta!\nUse \`r.sell\` para vender.`)] });
    } else {
      const tempo = Math.ceil((user.plantaColher - Date.now()) / 60000);
      return msg.reply({ embeds: [embed('🌱 Plantando...', `**${user.plantando.nome}** fica pronta em **${tempo} minutos**.`)] });
    }
  }
  const item = plantarItens[Math.floor(Math.random() * plantarItens.length)];
  client.saveUser(msg.author.id, { plantando: item, plantaColher: Date.now() + item.tempo });
  msg.reply({ embeds: [embed('🌱 Plantando', `Você plantou **${item.nome}**!\nPronta em **${item.tempo / 60000} minutos**.`)] });
};

commands['vender'] = async (client, msg, args) => {
  const user = await EU(client, msg.author.id);
  const inv = user.inventario;
  if (!inv || inv.length === 0) return msg.reply({ embeds: [embed('❌ Inventário vazio', 'Você não tem itens para vender.')] });
  const nome = args.join(' ').toLowerCase();
  if (nome === 'tudo' || nome === 'all') {
    const total = inv.reduce((a, b) => a + b.valor, 0);
    client.saveUser(msg.author.id, { moedas: user.moedas + total, inventario: [] });
    return msg.reply({ embeds: [embed('💰 Venda', `Vendeu **${inv.length} itens** por ${moedaFmt(total)}!\nCarteira: ${moedaFmt(user.moedas + total)}`)] });
  }
  const idx = inv.findIndex(i => i.nome.toLowerCase() === nome);
  if (idx === -1) return msg.reply({ embeds: [embed('❌ Item não encontrado', `Você não tem **${args.join(' ')}**.`)] });
  const item = inv.splice(idx, 1)[0];
  client.saveUser(msg.author.id, { moedas: user.moedas + item.valor, inventario: inv });
  msg.reply({ embeds: [embed('💰 Venda', `Vendeu **${item.nome}** por ${moedaFmt(item.valor)}!\nCarteira: ${moedaFmt(user.moedas + item.valor)}`)] });
};

commands['inventario'] = async (client, msg, args) => {
  const user = await EU(client, msg.author.id);
  const inv = user.inventario;
  if (!inv || inv.length === 0) return msg.reply({ embeds: [embed('🎒 Inventário', 'Seu inventário está vazio.')] });
  const lista = inv.map((i, idx) => `${idx + 1}. **${i.nome}** — ${moedaFmt(i.valor)}`).join('\n');
  msg.reply({ embeds: [embed('🎒 Inventário', lista)] });
};

commands['loja'] = async (client, msg, args) => {
  const lista = itensLoja.map(i => `**${i.nome}**\n💬 ${i.descricao}\n💵 ${moedaFmt(i.preco)}\nID: \`${i.id}\``).join('\n\n');
  msg.reply({ embeds: [embed('🏪 Loja', lista + '\n\nUse `r.buy <ID>` para comprar!')] });
};

commands['comprar'] = async (client, msg, args) => {
  if (!msg.guild) return msg.reply({ embeds: [embed('❌ Disponível apenas em servidores', 'Comprar itens de loja só funciona em servidores.')] });
  const item = itensLoja.find(i => i.id === args[0]);
  if (!item) return msg.reply({ embeds: [embed('❌ Item inválido', 'Use `r.shop` para ver os itens.')] });
  const user = await EU(client, msg.author.id);
  if (user.moedas < item.preco) return msg.reply({ embeds: [embed('❌ Saldo insuficiente', `Você precisa de ${moedaFmt(item.preco)}.`)] });
  client.saveUser(msg.author.id, { moedas: user.moedas - item.preco });
  const cargo = msg.guild.roles.cache.find(r => r.name.toLowerCase().includes(item.id.replace('cargo_', '')));
  if (cargo) await msg.member.roles.add(cargo).catch(() => {});
  msg.reply({ embeds: [embed('✅ Compra realizada!', `Você comprou **${item.nome}**!`)] });
};

commands['transferir'] = async (client, msg, args) => {
  const alvo = msg.mentions.users.first();
  const valor = parseInt(args[1]);
  if (!alvo || alvo.bot || alvo.id === msg.author.id) return msg.reply({ embeds: [embed('❌ Erro', 'Mencione um usuário válido.')] });
  if (!valor || valor <= 0) return msg.reply({ embeds: [embed('❌ Erro', 'Informe um valor válido.')] });
  const de = await EU(client, msg.author.id);
  const para = await EU(client, alvo.id);
  if (de.moedas < valor) return msg.reply({ embeds: [embed('❌ Saldo insuficiente', `Você só tem ${moedaFmt(de.moedas)}.`)] });
  client.saveUser(msg.author.id, { moedas: de.moedas - valor });
  client.saveUser(alvo.id, { moedas: para.moedas + valor });
  msg.reply({ embeds: [embed('💸 Transferência', `Você enviou ${moedaFmt(valor)} para ${alvo}!`)] });
};

commands['raspadinha'] = async (client, msg, args) => {
  const PRECO = 100;
  const user = await EU(client, msg.author.id);
  if (user.moedas < PRECO) return msg.reply({ embeds: [embed('❌ Sem saldo', `Custa ${moedaFmt(PRECO)}.`)] });
  const simbolos = ['💀', '💰', '⭐', '💎', '🎁', '❌', '💀', '❌', '💀'];
  const grade = Array.from({ length: 9 }, () => simbolos[Math.floor(Math.random() * simbolos.length)]);
  const cont = {};
  grade.forEach(s => cont[s] = (cont[s] || 0) + 1);
  let ganho = 0;
  if (cont['💎'] >= 3) ganho = 5000;
  else if (cont['💰'] >= 3) ganho = 1500;
  else if (cont['⭐'] >= 3) ganho = 800;
  else if (cont['🎁'] >= 2) ganho = 300;
  else if (cont['💰'] >= 2) ganho = 150;
  client.saveUser(msg.author.id, { moedas: user.moedas - PRECO + ganho });
  const g = [grade.slice(0,3), grade.slice(3,6), grade.slice(6,9)].map(l => l.join(' ')).join('\n');
  msg.reply({ embeds: [embed('🎟️ Raspadinha', `${g}\n\n${ganho > 0 ? `🎉 Você ganhou ${moedaFmt(ganho)}!` : '❌ Não foi dessa vez...'}\nCarteira: ${moedaFmt(user.moedas - PRECO + ganho)}`)] });
};

commands['loteria'] = async (client, msg, args) => {
  if (!msg.guild) return msg.reply({ embeds: [embed('❌ Disponível apenas em servidores', 'A loteria só acontece em servidores.')] });
  const PRECO = 200;
  const user = await EU(client, msg.author.id);
  if (user.moedas < PRECO) return msg.reply({ embeds: [embed('❌ Sem saldo', `Custa ${moedaFmt(PRECO)}.`)] });
  const loteria = client.getLoteria(msg.guild.id);
  if (loteria.participantes.includes(msg.author.id)) return msg.reply({ embeds: [embed('⚠️ Já inscrito', 'Você já tem um bilhete!')] });
  loteria.participantes.push(msg.author.id);
  loteria.pote += PRECO;
  client.saveUser(msg.author.id, { moedas: user.moedas - PRECO });
  client.saveLoteria(msg.guild.id, loteria);
  msg.reply({ embeds: [embed('🎟️ Loteria', `Bilhete comprado!\nPote: ${moedaFmt(loteria.pote)}\nParticipantes: **${loteria.participantes.length}**\nSorteio **domingo às 20h**.`)] });
};

commands['ranking'] = async (client, msg, args) => {
  const membros = client.getRankingMoedas(10);
  const medals = ['🥇', '🥈', '🥉'];
  const lista = membros.map((m, i) => `${medals[i]||`**${i+1}.**`} <@${m.id}> — ${moedaFmt(m.moedas + m.banco)}`).join('\n') || 'Ninguém ainda.';
  msg.reply({ embeds: [embed('🏆 Ranking de Moedas', lista)] });
};

async function sorteioLoteria(client) {
  client.guilds.cache.forEach(async (guild) => {
    const guildId = guild.id;
    const loteria = client.getLoteria(guildId);
    if (!loteria.participantes?.length) return;
    const vencedorId = loteria.participantes[Math.floor(Math.random() * loteria.participantes.length)];
    const vencedor = client.getUser(vencedorId);
    client.saveUser(vencedorId, { moedas: (vencedor.moedas || 0) + loteria.pote });
    client.saveLoteria(guildId, { participantes: [], pote: 0, ultimo: Date.now() });
    const canal = guild.channels.cache.find(c => /geral|chat/i.test(c.name));
    if (canal) {
      canal.send({ embeds: [new EmbedBuilder().setColor(0xE53935).setTitle('🎉 Sorteio da Loteria!')
        .setDescription(`O vencedor é <@${vencedorId}>!\n\nPrêmio: ${moedaFmt(loteria.pote)} 🪙`).setTimestamp()] });
    }
  });
}

async function slashBanco(client, interaction) {
  const alvo = interaction.options.getUser('usuario') || interaction.user;
  const user = await client.ensureUser(alvo.id).then(() => client.getUser(alvo.id));
  const e = new EmbedBuilder().setColor(0xE53935).setTitle(`💳 Banco — ${alvo.username}`)
    .setDescription(`**Carteira:** ${moedaFmt(user.moedas||0)}\n**Banco:** ${moedaFmt(user.banco||0)}\n**Total:** ${moedaFmt((user.moedas||0) + (user.banco||0))}`)
    .setThumbnail(alvo.displayAvatarURL()).setTimestamp().setFooter({ text: 'TASD — Todos Aqui São Donos' });
  interaction.reply({ embeds: [e] });
}

async function slashDaily(client, interaction) {
  const user = await client.ensureUser(interaction.user.id).then(() => client.getUser(interaction.user.id));
  const cd = checkCooldown(user.daily, 86400000);
  if (cd && !client.CENSURA_OWNER.includes(interaction.user.id)) return interaction.reply({ embeds: [embed('⏳ Cooldown', `Próximo daily em **${cd}**.`)], flags: 64 });
  const valor = Math.floor(Math.random() * 500) + 300;
  client.saveUser(interaction.user.id, { moedas: (user.moedas||0) + valor, daily: Date.now() });
  interaction.reply({ embeds: [embed('🎁 Daily', `Você resgatou ${moedaFmt(valor)}!\nCarteira: ${moedaFmt((user.moedas||0) + valor)}`)] });
}

async function slashRanking(client, interaction) {
  const membros = client.getRankingMoedas(10);
  const medals = ['🥇', '🥈', '🥉'];
  const lista = membros.map((m, i) => `${medals[i]||`**${i+1}.**`} <@${m.id}> — ${moedaFmt(m.moedas + m.banco)}`).join('\n') || 'Ninguém ainda.';
  interaction.reply({ embeds: [embed('🏆 Ranking de Moedas', lista)] });
}

module.exports = { commands, sorteioLoteria, slashBanco, slashDaily, slashRanking };