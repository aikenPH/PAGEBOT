const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

async function sendConcatenatedMessage(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await sendMessage(senderId, { text: message }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text }, pageAccessToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

function generateRandomUid() {
  return Math.random().toString(36).substring(2, 10);
}

module.exports = {
  name: "gpt3",
  description: "Talk to GPT-3.5 AI.",
  usage: "gpt3 [your_question]",
  author: "Jay Mar",
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(
        senderId,
        {
          text: "Usage: gpt3 [your_question]\nExample: gpt3 What is artificial intelligence?",
        },
        pageAccessToken
      );
      return;
    }

    const question = args.join(" ");
    const apiUrl = `https://kaiz-apis.gleeze.com/api/gpt-3.5`;

    try {
      const response = await axios.get(apiUrl, {
        params: { q: question },
      });

      const result = response.data.result;

      if (result) {
        const header = "🤖 𝗚𝗣𝗧-𝟯.𝟱\n・──────────────・\n";
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: "⚠️ Unable to generate a response. Please try again later.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with GPT-3.5 command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while processing your request. Please try again later.",
      }, pageAccessToken);
    }
  },
};
