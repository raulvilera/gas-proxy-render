import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwAL6PdzJnA0ATW0IjPfbyexuL7nZCnUoTFZjmiqxcME-xGlntRFGeXTZsmZSRLb265/exec";

// 🔹 Rota principal — teste rápido no navegador
app.get("/", (req, res) => {
  res.send("✅ Servidor Render ativo e conectado ao Google Sheets!");
});

// 🔹 Rota de envio — recebe os dados do formulário e repassa ao Google Sheets
app.post("/enviar", async (req, res) => {
  console.log("📩 Dados recebidos do formulário:", req.body);

  try {
    const resposta = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      // ⚠️ ALTERAÇÃO IMPORTANTE: Apps Script entende melhor text/plain
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(req.body),
    });

    const respostaTexto = await resposta.text();
    console.log("📤 Resposta bruta do Apps Script:", respostaTexto);

    // tenta interpretar como JSON — caso contrário, devolve texto cru
    let dados;
    try {
      dados = JSON.parse(respostaTexto);
    } catch {
      dados = { success: false, message: "Resposta não era JSON", raw: respostaTexto };
    }

    res.json(dados);
  } catch (err) {
    console.error("❌ Erro ao enviar para Google Sheets:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Inicialização do servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando com sucesso na porta ${PORT}`));
