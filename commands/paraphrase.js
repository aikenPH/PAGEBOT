const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");
const api = require("../handles/api");

module.exports = {
  name: "paraphrase",
  description: "Generate a paraphrased version of the provided text.",
  usage: "paraphrase [text]",
  author: "Jay Mar",

  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      return sendMessage(senderId, {
        text: "Usage: paraphrase [text]\nExample: paraphrase Please rewrite this sentence in a simpler way.",
      }, pageAccessToken);
    }

    const text = args.join(" ");
    const apiUrl = `${api.kaizen}/api/paraphrase`;

    try {
      const { data } = await axios.get(apiUrl, {
        params: { text },
      });

      if (data && data.response) {
        const response = `
🤖 𝗣𝗔𝗥𝗔𝗣𝗛𝗥𝗔𝗦𝗘
・──────────────・
${data.response}
        `.trim();

        await sendConcatenatedMessage(senderId, response, pageAccessToken);
      } else {
        return sendMessage(senderId, {
          text: "⚠️ No paraphrased response received. Please try again with a different input.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with Paraphrase command:", error.message || error);
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
  
