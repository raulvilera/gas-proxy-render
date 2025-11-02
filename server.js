const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(express.json());

// Configure CORS - ajustar allowedOrigins se quiser restringir
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : ["*"];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"), false);
    }
  }
}));

// Rate limiting básico
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60, // máximo 60 requisições por IP por minuto
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Variáveis obrigatórias: GAS_URL e optionally SECRET_TOKEN
const GAS_URL = process.env.GAS_URL;
const SECRET_TOKEN = process.env.SECRET_TOKEN || null;

if (!GAS_URL) {
  console.error("Erro: variável de ambiente GAS_URL não definida.");
  process.exit(1);
}

// Endpoint proxy
app.post("/enviar-resposta", async (req, res) => {
  try {
    // Se você configurou SECRET_TOKEN, exige header Authorization: Bearer <token>
    if (SECRET_TOKEN) {
      const auth = (req.headers.authorization || "").split(" ");
      if (auth.length !== 2 || auth[0] !== "Bearer" || auth[1] !== SECRET_TOKEN) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
    }

    // Repassa corpo para o GAS
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    // Se o GAS não retornar JSON válido, tenta repassar texto
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      json = { success: false, message: "Resposta do GAS não é JSON", raw: text };
    }

    // Repasse do status code do GAS
    return res.status(response.status || 200).json(json);

  } catch (err) {
    console.error("Erro no proxy:", err);
    return res.status(500).json({ success: false, message: "Erro interno no proxy." });
  }
});

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy rodando na porta ${PORT}`);
});
