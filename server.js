const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Endpoint to handle chat messages from the frontend
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  // Check if the token is set
  const token = process.env.HUGGINGFACE_TOKEN;
  if (!token) {
    console.error("Hugging Face Token is not set.");
    return res.status(500).json({ error: "Hugging Face Token is not available." });
  }

  // Log the received message and token for debugging
  console.log('Received message:', message);
  console.log('Hugging Face Token:', token);

  // Correct payload with direct assignment of message to 'inputs'
  const payload = {
    inputs: message  // Make sure 'message' is the text you want to process
  };

  console.log('Payload:', payload);

  try {
    const response = await axios.post('https://api-inference.huggingface.co/models/distilgpt2', payload, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    console.log('AI API response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error calling AI API:', error.message);
    if (error.response) {
      console.error('Status code:', error.response.status);
      console.error('AI API responded with:', error.response.data);
    }

    res.status(500).json({
      error: 'Failed to process the AI response',
      details: error.message,
      apiResponse: error.response ? error.response.data : 'No response data'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
