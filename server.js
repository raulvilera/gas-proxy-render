// server.js
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // se o HTML estiver dentro da pasta "public"

// === Rota para testar o servidor ===
app.get('/', (req, res) => {
  res.send('Servidor rodando com sucesso!');
});

// === Rota que o frontend vai usar ===
app.post('/enviar', (req, res) => {
  console.log('📩 Dados recebidos do formulário:', req.body);
  res.status(200).json({ message: 'Respostas recebidas com sucesso!' });
});

// === Porta do Render ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
