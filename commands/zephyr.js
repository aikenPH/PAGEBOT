const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");
const api = require("../handles/api");

module.exports = {
  name: "zephyr",
  description: "Generate responses using the Zephyr 7B Beta model.",
  usage: "zephyr [prompt]",
  author: "Jay Mar",

  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      return sendMessage(senderId, {
        text: "Usage: zephyr [prompt]\nExample: zephyr Summarize the following text: Artificial intelligence is...",
      }, pageAccessToken);
    }

    const prompt = args.join(" ");
    const apiUrl = `${api.jaymar}/api/zephyr-7b-beta`;

    try {
      const { data } = await axios.get(apiUrl, {
        params: { prompt },
      });

      if (data && data.content) {
        const response = `🤖!𝗭𝗘𝗣𝗛𝗬𝗥\n・──────────────・
${data.content}
        `.trim();

        await sendConcatenatedMessage(senderId, response, pageAccessToken);
      } else {
        return sendMessage(senderId, {
          text: "⚠️ No response from Zephyr. Please try again with a different prompt.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with Zephyr command:", error.message || error);
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
      await new Promise(resolve => setTimeout(resolve, 1000)); // Add a delay between messages
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
