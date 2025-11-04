import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.text({ type: "*/*" })); // ✅ aceita corpo text/plain

// URL do seu Google Apps Script
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwAL6PdzJnA0ATW0IjPfbyexuL7nZCnUoTFZjmiqxcME-xGlntRFGeXTZsmZSRLb265/exec";

app.post("/enviar", async (req, res) => {
  console.log("📩 Dados recebidos:", req.body);

  try {
    // 🔥 Envia o corpo exatamente como texto
    const resposta = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: req.body,
    });

    const texto = await resposta.text();
    console.log("📤 Resposta do Apps Script:", texto);

    let dados;
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = { success: false, message: "Resposta não era JSON válida" };
    }

    res.json(dados);
  } catch (err) {
    console.error("❌ Erro ao enviar:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/", (req, res) => res.send("✅ Servidor Render ativo e conectado ao Google Sheets!"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor ouvindo na porta ${PORT}`));
