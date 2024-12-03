const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "ai",
  description: "Interact to FreeGPT-OpenAI.",
  usage: "ai [your_prompt]",
  author: "Jay Mar",

  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      return sendMessage(senderId, {
        text: "Usage: ai [your_prompt]\nExample: ai What is the capital of France?",
      }, pageAccessToken);
    }

    const question = args.join(" ");
    const apiUrl = "https://api.kenliejugarap.com/freegpt-openai/";

    try {
      const { data } = await axios.get(apiUrl, {
        params: { question },
      });

      if (data && data.response) {
        const header = "🤖 𝗔𝗜-𝗥𝗘𝗦𝗣𝗢𝗡𝗦𝗘\n・──────────────・\n";
        await sendConcatenatedMessage(senderId, header + data.response, pageAccessToken);
      } else {
        return sendMessage(senderId, {
          text: "⚠️ Unable to fetch a response. Please try again later.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with AI command:", error.message || error);
      return sendMessage(senderId, {
        text: "⚠️ An error occurred while processing your request. Please try again later.",
      }, pageAccessToken);
    }
  },
};

async function sendConcatenatedMessage(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Ensure messages are sent with a delay
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
       
