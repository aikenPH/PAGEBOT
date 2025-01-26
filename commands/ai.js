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

module.exports = {
  name: "ai",
  description: "Talk to Heru Ai",
  usage: "ai [your_prompt]",
  author: "Marjhun Baylon",
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(
        senderId,
        {
          text: "Usage: ai [your_prompt]\nExample: ai Write a poem about the sea.",
        },
        pageAccessToken
      );
      return;
    }

    const prompt = args.join(" ");
    const apiUrl = `https://heru-api-v1.vercel.app/heru`;

    try {
      const response = await axios.get(apiUrl, {
        params: { question: prompt },
      });

      const result = response.data.response;

      if (result) {
        const header = "☬ 𝗛𝗘𝗥𝗨 𝗔𝗜\n・──────────────・\n";
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: "⚠️ Unable to generate a response. Please try again later.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with AI command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ API SUCK\nPlease contact Jaymar on Facebook: https://www.facebook.com/jaymar.dev.00.",
      }, pageAccessToken);
    }
  },
};
