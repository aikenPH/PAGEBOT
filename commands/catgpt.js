const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");
const api = require("../handles/api");

module.exports = {
  name: "catgpt",
  description: "Generate creative or informational responses using CatGPT.",
  usage: "catgpt [prompt]",
  author: "Jay Mar",

  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      return sendMessage(senderId, {
        text: "Usage: catgpt [prompt]\nExample: catgpt Tell me a joke about cats.",
      }, pageAccessToken);
    }

    const prompt = args.join(" ");
    const apiUrl = `${api.jaymar}/api/catgpt`;

    try {
      const { data } = await axios.get(apiUrl, {
        params: { prompt },
      });

      if (data && data.response) {
        const response = `
🐾 𝗖𝗔𝗧𝗚𝗣𝗧\n・──────────────・
${data.response}
        `.trim();

        await sendConcatenatedMessage(senderId, response, pageAccessToken);
      } else {
        return sendMessage(senderId, {
          text: "⚠️ No response from CatGPT. Please try again with a different prompt.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with CatGPT command:", error.message || error);
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
    
