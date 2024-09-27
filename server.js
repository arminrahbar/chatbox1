const OpenAI = require('openai');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Force HTTPS in production if the FORCE_HTTPS variable is set to 'true'
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS === 'true' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// CORS configuration to allow GitHub Pages and localhost
const corsOptions = {
  origin: function (origin, callback) {
    // Allow localhost in development
    if (process.env.NODE_ENV === 'development') {
      callback(null, 'http://localhost:3000'); // Local React frontend running on localhost
    } else {
      // Allow requests from GitHub Pages in production
      if (origin === 'https://arminrahbar.github.io' || origin === 'https://arminrahbar.github.io/chatbox1/') {
        callback(null, true); // Allow GitHub Pages
      } else {
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
