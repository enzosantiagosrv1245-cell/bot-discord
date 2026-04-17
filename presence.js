const RPC = require("discord-rpc");

const clientId = "1491518268626833458";
const rpc = new RPC.Client({ transport: "ipc" });

// 🔥 LISTA DE FRASES
const frases = [
  { details: "Na floresta vermelha", state: "Observando nas sombras..." },
  { details: "Caçada iniciada", state: "Procurando presas..." },
  { details: "Silêncio mortal", state: "Algo está te observando..." },
  { details: "No território do lobo", state: "Você não está sozinho..." },
  { details: "Sangue na trilha", state: "A caça já começou..." },
  { details: "Instinto ativado", state: "Movendo-se na escuridão..." },
  { details: "Olhos brilhando na noite", state: "Predador à espreita..." },
  { details: "Entre árvores sombrias", state: "O perigo está próximo..." }
];

rpc.on("ready", () => {
  setInterval(() => {
    const random = frases[Math.floor(Math.random() * frases.length)];

    rpc.setActivity({
      details: random.details,
      state: random.state,
      startTimestamp: new Date(),
      largeImageKey: "forest_bg",
      largeImageText: "Floresta Vermelha",
      smallImageKey: "wolf_logo",
      smallImageText: "Predador",
      buttons: [
        { label: "Entrar no TASD", url: "https://discord.gg/8DZEEF48" }
      ]
    });

  }, 15000); // troca a cada 15s
});

rpc.login({ clientId }).catch(console.error);