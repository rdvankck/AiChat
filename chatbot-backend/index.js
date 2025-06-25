const express = require('express');
const axios = require('axios');
const cors = require('cors'); 

const app = express();
const PORT = 3000; 

// Middleware
app.use(cors()); // Allow requests from the frontend (which is on a different port)
app.use(express.json()); // Parse the body of incoming requests as JSON


const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

app.post('/api/chat', async (req, res) => {
  try {
    // Get the 'prompt' from the frontend's request body
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`Forwarding to AI model: "${prompt}"`);

    // Forward the request to the Ollama API
    const ollamaResponse = await axios.post(OLLAMA_API_URL, {
      model: 'deepseek-chat', // We updated this to the general chat model
      prompt: prompt,
      stream: false // To receive the response in a single chunk
    });

    // Send the response from Ollama back to the frontend
    res.json({ reply: ollamaResponse.data.response });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Could not communicate with the AI model.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running at http://localhost:${PORT}`);
  console.log('Before making requests, ensure that Ollama is running!');
});