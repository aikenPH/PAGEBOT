const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "duckgo",
  description: "Search for information using DuckGo.",
  usage: "duckgo [query]",
  author: "Jay Mar",

  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      return sendMessage(senderId, {
        text: "Usage: duckgo [query]\nExample: duckgo programming languages",
      }, pageAccessToken);
    }

    const query = args.join(" ");
    const apiUrl = "https://jerome-web.gleeze.com/service/api/search";

    try {
      const { data } = await axios.get(apiUrl, {
        params: { query },
      });

      if (Array.isArray(data) && data.length > 0) {
        const response = `
🔎 𝗗𝘂𝗰𝗸𝗚𝗼 𝗦𝗲𝗮𝗿𝗰𝗵 𝗥𝗲𝘀𝘂𝗹𝘁𝘀\n・──────────────・
${data
  .map((item, index) => `#${index + 1} ${item.title}\n🔗 ${item.url}`)
  .join("\n\n")}
        `.trim();

        await sendConcatenatedMessage(senderId, response, pageAccessToken);
      } else {
        return sendMessage(senderId, {
          text: "⚠️ No results found. Please try a different query.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with DuckGo command:", error.message || error);
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
