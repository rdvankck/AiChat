// index.js

const express = require('express');
const axios = require('axios');
const cors = require('cors'); // cors paketini dahil ettik

const app = express();
const PORT = 3000; // Backend'imiz bu portta çalışacak

// Middleware'ler
app.use(cors()); // Frontend'den (farklı porttan) gelen isteklere izin ver
app.use(express.json()); // Gelen isteklerin body'sini JSON olarak parse et

// Ollama'nın çalıştığı adres
const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

// Bizim oluşturduğumuz API endpoint'i
app.post('/api/chat', async (req, res) => {
  try {
    // Frontend'den gelen 'prompt'u alıyoruz
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`AI modeline yönlendiriliyor: "${prompt}"`);

    // Ollama'ya isteği iletiyoruz
    const ollamaResponse = await axios.post(OLLAMA_API_URL, {
      model: 'deepseek-coder',
      prompt: prompt,
      stream: false // Cevabı tek parça halinde almak için
    });

    // Ollama'dan gelen cevabı frontend'e geri gönderiyoruz
    res.json({ reply: ollamaResponse.data.response });

  } catch (error) {
    console.error('Hata:', error.message);
    res.status(500).json({ error: 'AI modeli ile iletişim kurulamadı.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server http://localhost:${PORT} adresinde çalışıyor.`);
  console.log('İstek atmadan önce Ollama\'nın çalıştığından emin ol!');
});