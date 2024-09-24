const OpenAI = require('openai');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  console.log("Received message:", message);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
      max_tokens: 150
    });

    console.log('Raw AI response:', JSON.stringify(response, null, 2));

    if (response.choices && response.choices.length > 0) {
      const generatedText = response.choices[0].message.content.trim();
      console.log("Processed AI response:", generatedText);
      res.json({ generated_text: generatedText });
    } else {
      console.log("Response structure is invalid or empty.");
      throw new Error("Invalid response structure from AI");
    }
  } catch (error) {
    console.error('Error calling AI API:', error.message);
    console.error('Detailed error:', error.response ? JSON.stringify(error.response.data, null, 2) : 'No response data available');
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