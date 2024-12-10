const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");
const api = require("../handles/api");

async function sendConcatenatedMessage(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 1000));
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
  name: "paraphrase",
  description: "Generate a paraphrased version of the provided text.",
  usage: "paraphrase [text]",
  author: "Jay Mar",
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: "Usage: paraphrase [text]\nExample: paraphrase Please rewrite this sentence in a simpler way.",
      }, pageAccessToken);
      return;
    }

    const text = args.join(" ");
    const apiUrl = `${api.jaymar}/api/paraphrase`;

    try {
      const response = await axios.get(apiUrl, {
        params: { text },
      });
      const result = response.data.response;

      if (result) {
        const header = "🤖 𝗣𝗔𝗥𝗔𝗣𝗛𝗥𝗔𝗦𝗘\n・──────────────・\n";
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: "⚠️ Unable to fetch a paraphrased response. Please try again later.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with Paraphrase command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while processing your request. Please try again later.",
      }, pageAccessToken);
    }
  },
};
    
