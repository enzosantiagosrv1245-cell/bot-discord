/**
 * setup-canais.js
 *
 * Rode UMA VEZ com: node setup-canais.js
 * Ele vai travar todos os canais do servidor para quem não tem o cargo Verificado,
 * deixando apenas o canal de verificação acessível para todos.
 *
 * Precisa das env vars TOKEN e GUILD_ID configuradas.
 */

const { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType } = require('discord.js');

const TOKEN        = process.env.TOKEN;
const GUILD_ID     = process.env.GUILD_ID; // ID do servidor que quer configurar
const CARGO_VERIFICADO    = '1492937390577422357';
const CARGO_NAO_VERIFICADO = '1492937430083567737';
const CANAL_VERIFICACAO   = '1492937230832898218';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log(`[Setup] Bot online como ${client.user.tag}`);

  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.error('[Setup] Servidor não encontrado. Verifique o GUILD_ID.');
    process.exit(1);
  }

  await guild.channels.fetch();
  const canais = guild.channels.cache;
  let ok = 0, erros = 0;

  for (const [id, canal] of canais) {
    // Ignora categorias (as permissões dos filhos têm prioridade)
    if (canal.type === ChannelType.GuildCategory) continue;

    try {
      if (id === CANAL_VERIFICACAO) {
        // Canal de verificação: @everyone pode VER, mas não pode mandar mensagem
        await canal.permissionOverwrites.set([
          {
            id: guild.id, // @everyone
            allow: [PermissionFlagsBits.ViewChannel],
            deny:  [PermissionFlagsBits.SendMessages],
          },
          {
            id: CARGO_VERIFICADO,
            allow: [PermissionFlagsBits.ViewChannel],
            deny:  [PermissionFlagsBits.SendMessages],
          },
          {
            id: CARGO_NAO_VERIFICADO,
            allow: [PermissionFlagsBits.ViewChannel],
            deny:  [PermissionFlagsBits.SendMessages],
          },
          {
            id: client.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
          },
        ]);
        console.log(`[Setup] ✅ Canal de verificação configurado: #${canal.name}`);
      } else {
        // Todos os outros canais: só verificados acessam
        await canal.permissionOverwrites.set([
          {
            id: guild.id, // @everyone
            deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
          {
            id: CARGO_NAO_VERIFICADO,
            deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
          {
            id: CARGO_VERIFICADO,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
          {
            id: client.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ManageChannels],
          },
        ]);
        console.log(`[Setup] 🔒 Canal travado: #${canal.name}`);
      }
      ok++;
    } catch (e) {
      console.warn(`[Setup] ⚠️  Erro em #${canal.name}: ${e.message}`);
      erros++;
    }
  }

  console.log(`\n[Setup] Concluído! ${ok} canais configurados, ${erros} erros.`);
  console.log('[Setup] Agora use r.setupverificacao no servidor para enviar o embed.');
  process.exit(0);
});

client.login(TOKEN);