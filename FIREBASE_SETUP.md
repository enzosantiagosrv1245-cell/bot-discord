# Firebase Firestore Setup Guide (100% GRÁTIS)

## 🔥 Por que Firebase?

- **100% GRÁTIS** (até 1GB de dados, 50k leituras/dia)
- **Não precisa de cartão de crédito**
- **Fácil de configurar**
- **Persistente** (dados sobrevivem a redeploys)
- **Rápido e confiável**

## 📋 Passo a passo:

### 1. Criar conta no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Faça login com sua conta Google
3. Clique em **"Criar um projeto"** ou **"Add project"**
4. Dê um nome ao projeto (ex: `tasd-bot`)
5. Clique em **"Continuar"** (pode desabilitar Google Analytics)

### 2. Ativar Firestore

1. No painel do projeto, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Selecione **"Iniciar no modo de produção"**
4. Escolha uma região próxima (ex: `us-central1`)
5. Clique em **"Concluído"**

### 3. Gerar credenciais de serviço

1. No menu lateral, clique em **"Configurações do projeto"** (ícone de engrenagem)
2. Vá para a aba **"Contas de serviço"**
3. Clique em **"Gerar nova chave privada"**
4. Baixe o arquivo JSON (guarde em local seguro!)

### 4. Configurar variáveis de ambiente

**⚠️ IMPORTANTE:** Nunca commite credenciais reais no GitHub!

1. **Copie o arquivo `.env.example`** para `.env`:
   ```bash
   cp .env.example .env
   ```

2. **Edite o `.env`** e substitua os valores pelos do JSON baixado:
   ```env
   # Discord
   TOKEN=SEU_TOKEN_DISCORD_AQUI
   CLIENT_ID=SEU_CLIENT_ID_AQUI
   GUILD_ID=SEU_GUILD_ID_AQUI

   # Firebase Firestore (100% GRÁTIS)
   FIREBASE_PROJECT_ID=seu_project_id_aqui
   FIREBASE_PRIVATE_KEY_ID=seu_private_key_id_aqui
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu_project_id.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=seu_client_id_aqui
   FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40seu_project_id.iam.gserviceaccount.com
   ```

   **Copie exatamente do arquivo JSON baixado!**

3. **O arquivo `.env` já está no `.gitignore`** - ele não será enviado para o GitHub

### 5. Deploy no Render

1. No painel do Render, vá para **Environment**
2. Adicione todas as variáveis `FIREBASE_*` e `TOKEN`, `CLIENT_ID`, `GUILD_ID` que você configurou no `.env`
3. Faça deploy normalmente

### 6. Teste

```bash
npm install
node index.js
```

Se aparecer `[TASD Bot] Online como...` sem erros, está funcionando! ✅

---

## 📊 Limites Gratuitos do Firebase:

- **1GB** de dados armazenados
- **50.000** leituras por dia
- **20.000** gravações por dia
- **20.000** exclusões por dia
- **5GB** de transferência de dados por mês

**Para um bot Discord pequeno, isso é mais que suficiente!**

## 🔒 Segurança

- ✅ **Nunca commite** o arquivo `.env` (já está no `.gitignore`)
- ✅ **Use apenas placeholders** no `.env.example`
- ✅ **Mantenha credenciais seguras** - não compartilhe o arquivo JSON baixado

## 🔧 Troubleshooting:

**Erro: "Invalid credentials"**
- Verifique se copiou corretamente as credenciais do JSON
- Certifique-se que a chave privada tem as quebras de linha `\n`

**Erro: "Quota exceeded"**
- Você atingiu o limite diário. Aguarde até amanhã ou faça upgrade (pago)

**Dados não aparecem**
- Verifique no [Firebase Console](https://console.firebase.google.com) se os dados estão sendo salvos

---

**🎉 Pronto!** Agora seus dados são 100% gratuitos e persistentes!
