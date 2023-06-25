const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { Configuration, OpenAIApi } = require("openai");
// const rateLimit = require("express-rate-limit");

require('dotenv').config();

const middlewares = require('./middlewares');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY
});
const openai = new OpenAIApi(configuration);

// const limiter = rateLimit({
//     windowMs: 10 * 60 * 1000, // 10 minutes
//     max: 10, // Allow only 10 requests per windowMs
// });
// app.use(limiter);

app.get("/", async (req, res) => {
  res.json({
    message: "Server is running!",
  });
});

app.post("/ask", async (req, res) => {
  const prompt = req.body.prompt;
  try {
    if (prompt == null) {
      throw new Error("Uh oh, no prompt was provided");
    }
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
    });
    const completion = response.data.choices[0].text;
    return res.status(200).json({
      success: true,
      message: completion,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
