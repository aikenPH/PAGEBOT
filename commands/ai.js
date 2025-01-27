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
  description: "Talk to toshia ai",
  usage: "ai [your_prompt]",
  author: "𝗠𝗮𝗿𝗷𝗵𝘂𝗻 𝗕𝗮𝘆𝗹𝗼𝗻",
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
    const apiUrl = `https://ai-api-production-ca04.up.railway.app/meta32`;

    try {
      const response = await axios.get(apiUrl, {
        params: { content: prompt },
      });

      const result = response.data.result; 

      if (result) {
        const header = "☬ 𝗧𝗢𝗦𝗛𝗜𝗔 𝗖𝗛𝗔𝗧𝗕𝗢𝗧\n・──────────────・\n";
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: "⚠️ Unable to generate a response. Please try again later.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with AI command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ API error. Please contact Marjhun Baylon on Facebook: https://www.facebook.com/marjhuncutieee.",
      }, pageAccessToken);
    }
  },
};
