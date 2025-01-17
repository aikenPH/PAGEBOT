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
  name: "boxpro",
  description: "Generate responses using the Blackbox Pro",
  usage: "boxpro [your_prompt]",
  author: "Jay Mar",
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(
        senderId,
        {
          text: "Usage: boxpro [your_prompt]\nExample: boxpro Explain quantum mechanics.",
        },
        pageAccessToken
      );
      return;
    }

    const prompt = args.join(" ");
    const apiUrl = `https://yt-video-production.up.railway.app/blackbox-pro`;

    try {
      const response = await axios.get(apiUrl, {
        params: { ask: prompt },
      });

      const result = response.data.Response;

      if (result) {
        const header = "🤖 𝗕𝗟𝗔𝗖𝗞𝗕𝗢𝗫-𝗣𝗥𝗢\n・──────────────・\n";
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: "⚠️ Unable to generate a response. Please try again later.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with BoxPro command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while processing your request. Please try again later.",
      }, pageAccessToken);
    }
  },
};
