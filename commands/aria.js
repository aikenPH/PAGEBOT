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
  name: "aria",
  description: "Generate responses using the Aria.",
  usage: "aria [your_prompt]",
  author: "Jay Mar",
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(
        senderId,
        {
          text: "Usage: aria [your_prompt]\nExample: aria What is quantum entanglement?",
        },
        pageAccessToken
      );
      return;
    }

    const prompt = args.join(" ");
    const uid = generateRandomUid();
    const apiUrl = `https://yt-video-production.up.railway.app/Aria`;

    try {
      const response = await axios.get(apiUrl, {
        params: { q: prompt, userid: uid },
      });

      const result = response.data.response;

      if (result) {
        const header = "🤖 𝗔𝗥𝗜𝗔-𝗔𝗜\n・──────────────・\n";
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: "⚠️ Unable to generate a response. Please try again later.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with Aria command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while processing your request. Please try again later.",
      }, pageAccessToken);
    }
  },
};
