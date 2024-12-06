const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");
const api = require("../handles/api");

module.exports = {
  name: "discolm",
  description: "Generate responses using the Discolm German 7B model.",
  usage: "discolm [prompt]",
  author: "Jay Mar",

  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      return sendMessage(senderId, {
        text: "Usage: discolm [prompt]\nExample: discolm Translate this to German: Hello, how are you?",
      }, pageAccessToken);
    }

    const prompt = args.join(" ");
    const apiUrl = `${api.jaymar}/api/discolm-german-7b-v1`;

    try {
      const { data } = await axios.get(apiUrl, {
        params: { prompt },
      });

      if (data && data.content) {
        const response = `🤖 𝗗𝗜𝗦𝗖𝗢𝗟𝗠\n・──────────────・
${data.content}
        `.trim();

        await sendConcatenatedMessage(senderId, response, pageAccessToken);
      } else {
        return sendMessage(senderId, {
          text: "⚠️ No response from Discolm. Please try again with a different prompt.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with Discolm command:", error.message || error);
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
        
