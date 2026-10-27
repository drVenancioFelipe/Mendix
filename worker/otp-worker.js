// ============================================================
// CondoUai — OTP Email Verification Worker
// Cloudflare Worker com KV Storage e Resend API
// ============================================================

// ⚠️  NUNCA coloque a chave aqui em texto puro!
// Configure via: wrangler secret put RESEND_API_KEY
// A variável é injetada automaticamente pelo Cloudflare no ambiente do Worker.
const OTP_EXPIRY_SECONDS = 300; // 5 minutos
const FROM_EMAIL = "noreply@condouai.pages.dev";
const FROM_NAME = "CondoUai";

// CORS headers padrão
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
};

// ── Gera código numérico de 6 dígitos ──
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Envia e-mail via Resend API ──
async function sendOTPEmail(toEmail, userName, otp, env) {
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código de Verificação - CondoUai</title>
    </head>
    <body style="margin:0; padding:0; background-color:#0a0a0f; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width:560px; margin:40px auto; background-color:#111118; border:1px solid #1e1e2e; border-radius:16px; overflow:hidden;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0f172a 0%, #0a0a0f 100%); padding:32px 40px; text-align:center; border-bottom:1px solid #1e1e2e;">
                <h1 style="margin:0; font-size:24px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;">
                    Condo<span style="color:#00e6ff;">Uai</span>
                </h1>
                <p style="margin:6px 0 0; font-size:13px; color:#6b7280;">A plataforma inteligente para condomínios</p>
            </div>

            <!-- Body -->
            <div style="padding:40px;">
                <h2 style="margin:0 0 8px; font-size:20px; font-weight:700; color:#f9fafb;">Confirme sua avaliação</h2>
                <p style="margin:0 0 24px; font-size:14px; color:#9ca3af; line-height:1.6;">
                    Olá, <strong style="color:#e5e7eb;">${userName}</strong>!<br>
                    Recebemos sua avaliação no CondoUai. Use o código abaixo para confirmá-la.
                </p>

                <!-- OTP Code Box -->
                <div style="background-color:#0a0a0f; border:2px solid #00e6ff; border-radius:12px; padding:28px; text-align:center; margin-bottom:24px;">
                    <p style="margin:0 0 8px; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:1.5px; color:#00e6ff;">Seu código de verificação</p>
                    <div style="font-size:48px; font-weight:900; letter-spacing:12px; color:#ffffff; font-family: 'Courier New', monospace;">
                        ${otp}
                    </div>
                    <p style="margin:12px 0 0; font-size:12px; color:#6b7280;">
                        ⏱ Este código expira em <strong style="color:#f59e0b;">5 minutos</strong>
                    </p>
                </div>

                <!-- Warning -->
                <div style="background-color:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2); border-radius:8px; padding:16px; margin-bottom:24px;">
                    <p style="margin:0; font-size:13px; color:#9ca3af; line-height:1.5;">
                        🔒 <strong style="color:#f59e0b;">Segurança:</strong> Não compartilhe este código com ninguém. 
                        O CondoUai nunca solicita senhas ou dados bancários por e-mail.
                    </p>
                </div>

                <p style="margin:0; font-size:12px; color:#4b5563; line-height:1.6; text-align:center;">
                    Se você não solicitou esta verificação, ignore este e-mail.<br>
                    Nenhuma ação é necessária.
                </p>
            </div>

            <!-- Footer -->
            <div style="padding:20px 40px; border-top:1px solid #1e1e2e; text-align:center;">
                <p style="margin:0; font-size:11px; color:#374151;">
                    © ${new Date().getFullYear()} CondoUai — Todos os direitos reservados<br>
                    <a href="https://condouai.pages.dev" style="color:#00e6ff; text-decoration:none;">condouai.pages.dev</a>
                </p>
            </div>
        </div>
    </body>
    </html>`;

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            // env.RESEND_API_KEY é injetada via: wrangler secret put RESEND_API_KEY
            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [toEmail],
            subject: `${otp} é seu código de verificação — CondoUai`,
            html: html,
        }),
    });

    return response;
}

// ── Handler principal ──
export default {
    async fetch(request, env) {
        // Preflight CORS
        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        const url = new URL(request.url);

        // ── POST /send-otp ──
        if (request.method === "POST" && url.pathname === "/send-otp") {
            try {
                const body = await request.json();
                const { email, userName } = body;

                if (!email || !userName) {
                    return new Response(JSON.stringify({ error: "email e userName são obrigatórios." }), {
                        status: 400, headers: corsHeaders,
                    });
                }

                // Checagem de rate-limit (máx 3 tentativas por e-mail em 5 min)
                const rateLimitKey = `ratelimit:${email}`;
                const attempts = parseInt((await env.OTP_STORE.get(rateLimitKey)) || "0");
                if (attempts >= 3) {
                    return new Response(JSON.stringify({
                        error: "Muitas tentativas. Aguarde 5 minutos antes de solicitar um novo código."
                    }), { status: 429, headers: corsHeaders });
                }

                // Gera e salva OTP no KV com TTL de 5 minutos
                const otp = generateOTP();
                const kvKey = `otp:${email}`;
                await env.OTP_STORE.put(kvKey, otp, { expirationTtl: OTP_EXPIRY_SECONDS });

                // Incrementa contador de rate-limit
                await env.OTP_STORE.put(rateLimitKey, (attempts + 1).toString(), { expirationTtl: OTP_EXPIRY_SECONDS });

                // Envia e-mail
                const emailRes = await sendOTPEmail(email, userName, otp, env);
                if (!emailRes.ok) {
                    const errBody = await emailRes.text();
                    console.error("Resend API error:", errBody);
                    return new Response(JSON.stringify({ error: "Falha ao enviar o e-mail. Tente novamente." }), {
                        status: 500, headers: corsHeaders,
                    });
                }

                return new Response(JSON.stringify({ success: true, message: "Código enviado para o seu e-mail." }), {
                    status: 200, headers: corsHeaders,
                });

            } catch (err) {
                console.error(err);
                return new Response(JSON.stringify({ error: "Erro interno do servidor." }), {
                    status: 500, headers: corsHeaders,
                });
            }
        }

        // ── POST /verify-otp ──
        if (request.method === "POST" && url.pathname === "/verify-otp") {
            try {
                const body = await request.json();
                const { email, otp } = body;

                if (!email || !otp) {
                    return new Response(JSON.stringify({ error: "email e otp são obrigatórios." }), {
                        status: 400, headers: corsHeaders,
                    });
                }

                const kvKey = `otp:${email}`;
                const storedOtp = await env.OTP_STORE.get(kvKey);

                if (!storedOtp) {
                    return new Response(JSON.stringify({
                        valid: false,
                        error: "Código expirado ou inválido. Solicite um novo código."
                    }), { status: 200, headers: corsHeaders });
                }

                if (storedOtp !== otp.trim()) {
                    return new Response(JSON.stringify({
                        valid: false,
                        error: "Código incorreto. Verifique o e-mail e tente novamente."
                    }), { status: 200, headers: corsHeaders });
                }

                // OTP válido — remove do KV imediatamente (uso único)
                await env.OTP_STORE.delete(kvKey);
                await env.OTP_STORE.delete(`ratelimit:${email}`);

                return new Response(JSON.stringify({ valid: true, message: "E-mail verificado com sucesso!" }), {
                    status: 200, headers: corsHeaders,
                });

            } catch (err) {
                console.error(err);
                return new Response(JSON.stringify({ error: "Erro interno do servidor." }), {
                    status: 500, headers: corsHeaders,
                });
            }
        }

        return new Response(JSON.stringify({ error: "Rota não encontrada." }), {
            status: 404, headers: corsHeaders,
        });
    },
};
