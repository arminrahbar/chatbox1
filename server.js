const OpenAI = require('openai');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === 'development') {
      callback(null, 'http://localhost:3000'); // Allow local development
    } else {
      // Allow both GitHub Pages and your custom domain in production
      const allowedOrigins = [
        'https://arminrahbar.github.io',
        'https://arminrahbar.github.io/chatbox1/',
        'https://chatbox.arminrabar.com'
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true); // Allow these origins
      } else {
        console.log(`CORS request from disallowed origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware to parse incoming JSON requests
app.use(express.json());

const PORT = process.env.PORT || 8080;

// OpenAI client setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Dedicated health check route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Healthy' });
});

// Chat route to handle OpenAI interactions
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  console.log("Received message:", message);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
      max_tokens: 150
    });

    if (response.choices && response.choices.length > 0) {
      const generatedText = response.choices[0].message.content.trim();
      res.json({ generated_text: generatedText });
    } else {
      throw new Error("Invalid response structure from AI");
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to process the AI response',
      details: error.message
    });
  }
});

// Start the server on HTTPS port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
