const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");
const api = require("../handles/api");

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

module.exports = {
  name: "blackbox",
  description: "Generate AI-powered responses using Blackbox.",
  usage: "blackbox <your_query>",
  author: "Jay Mar",
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: "Usage: blackbox [your_query]\nExample: blackbox What is AI?",
      }, pageAccessToken);
      return;
    }

    const query = args.join(" ");
    const apiUrl = `${api.kenlie2}/blackbox/?text=${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(apiUrl);
      const result = response.data.response;

      if (result) {
        const header = "🤖 𝗕𝗟𝗔𝗖𝗞𝗕𝗢𝗫\n・──────────────・\n";
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: "⚠️ Unable to fetch a response. Please try again later.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with Blackbox command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while processing your request. Please try again later.",
      }, pageAccessToken);
    }
  },
};
