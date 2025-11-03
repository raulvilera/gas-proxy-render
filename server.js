// server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

app.use(cors());
app.use(express.json());

// 🔗 URL do Google Apps Script (sua URL real)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx_0xQzvWEGJoRlcHASY8EDEZj6RfZ89kSm2H6qJJECFCnqnPe7EKcUb_6BBHbpn4BR/exec';

// === Rota principal (teste rápido) ===
app.get('/', (req, res) => {
  res.send('Servidor rodando com sucesso e conectado ao Google Sheets!');
});

// === Rota para receber os dados do formulário e enviar ao Google Sheets ===
app.post('/enviar', async (req, res) => {
  try {
    console.log('📩 Dados recebidos do formulário:', req.body);

    // Envia os dados ao Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const result = await response.json();
    console.log('📤 Resposta do Google Sheets:', result);

    res.status(200).json({
      success: true,
      message: 'Dados enviados ao Google Sheets com sucesso!',
      googleResponse: result
    });
  } catch (error) {
    console.error('❌ Erro ao enviar para o Google Sheets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// === Porta padrão do Render ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
