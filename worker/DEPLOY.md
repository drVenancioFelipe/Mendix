# 🚀 Deploy — Cloudflare Worker OTP (condouai-otp-worker)

## Passo 1: Instalar o Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

## Passo 2: Criar o KV Namespace no Cloudflare

```bash
# Cria o namespace de produção
wrangler kv:namespace create "OTP_STORE"
# Retornará algo como: id = "abc123def456..."

# Cria o namespace de preview (para dev local)
wrangler kv:namespace create "OTP_STORE" --preview
```

📌 **Copie o `id` gerado** e substitua em `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "OTP_STORE"
id = "COLE_O_ID_AQUI"
preview_id = "COLE_O_PREVIEW_ID_AQUI"
```

## Passo 3: Configurar a chave Resend como Secret seguro

A chave **nunca** deve estar no código. Configure via Wrangler:

```bash
wrangler secret put RESEND_API_KEY
# Cole a chave quando solicitado (ela ficará criptografada no Cloudflare)
```

> O Worker acessa via `env.RESEND_API_KEY` — já configurado no código.

## Passo 4: Configurar o Domínio de Envio no Resend

1. Acesse [resend.com/domains](https://resend.com/domains)
2. Adicione o domínio `condouai.pages.dev` (ou use `onresend.com` gratuito)
3. Atualize o `FROM_EMAIL` no `worker/otp-worker.js` se necessário:
   ```js
   const FROM_EMAIL = "noreply@condouai.pages.dev";
   // ou use o domínio gratuito do Resend:
   // const FROM_EMAIL = "onboarding@resend.dev";  ← funciona sem configurar domínio
   ```

## Passo 4: Deploy do Worker

```bash
cd c:\Desenvolvimento\workspace\mendix-no-code
wrangler deploy
```

O Wrangler irá retornar a URL do Worker, ex:
`https://condouai-otp-worker.SEU_USUARIO.workers.dev`

## Passo 5: Atualizar a URL no app.js

Abra `app.js` e atualize a constante:
```js
const OTP_WORKER_URL = 'https://condouai-otp-worker.SEU_USUARIO.workers.dev';
```

## Passo 6: Testar localmente (opcional)

```bash
wrangler dev worker/otp-worker.js
# Worker disponível em http://localhost:8787
```

---

## ✅ Endpoints disponíveis

| Endpoint | Método | Body | Descrição |
|---|---|---|---|
| `/send-otp` | POST | `{email, userName}` | Gera e envia código OTP de 6 dígitos |
| `/verify-otp` | POST | `{email, otp}` | Valida o código (uso único) |

## 🔒 Segurança implementada

- **TTL automático de 300s** no Cloudflare KV
- **Rate limit**: máx. 3 tentativas por e-mail por janela de 5 minutos
- **Uso único**: o código é deletado do KV imediatamente após validação correta
- **CORS** configurado para aceitar requisições do frontend
