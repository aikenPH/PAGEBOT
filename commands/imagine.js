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
  name: "imagine",
  description: "Generate images based on your prompt.",
  usage: "imagine [your_prompt]",
  author: "Jay Mar",
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(
        senderId,
        {
          text: "Usage: imagine [your_prompt]\nExample: imagine a futuristic city at sunset",
        },
        pageAccessToken
      );
      return;
    }

    const prompt = args.join(" ");
    const apiUrl = `https://kaiz-apis.gleeze.com/api/imagine`;

    try {
      const response = await axios.get(apiUrl, {
        params: { prompt: prompt },
      });

      const data = response.data;

      if (data && data.image) {
        const header = "🎨 𝗜𝗠𝗔𝗚𝗜𝗡𝗘 𝗥𝗘𝗦𝗨𝗟𝗧\n・──────────────・\n";
        await sendMessage(senderId, {
          attachment: {
            type: "image",
            payload: {
              url: data.image,
              is_reusable: true,
            },
          },
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: "⚠️ No image generated. Please try a different prompt.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with Imagine command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while processing your request. Please try again later.",
      }, pageAccessToken);
    }
  },
};
