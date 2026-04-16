const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
client.once('ready', async () => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const members = await guild.members.fetch();
  const verificado = '1492937390577422357';
  const naoVerificado = '1492937430083567737';
  let countDeu = 0, countRemoveu = 0;
  for (const [, member] of members) {
    if (member.user.bot) continue;
    const temV = member.roles.cache.has(verificado);
    const temNV = member.roles.cache.has(naoVerificado);
    if (temV && temNV) {
      await member.roles.remove(naoVerificado).catch(() => {});
      countRemoveu++;
    } else if (!temV && !temNV) {
      await member.roles.add(naoVerificado).catch(() => {});
      countDeu++;
    }
  }
  console.log('Pronto! ' + countDeu + ' receberam Não Verificado, ' + countRemoveu + ' perderam Não Verificado.');
  process.exit(0);
});
client.login(process.env.TOKEN);

//fix-cargos.js
