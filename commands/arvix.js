const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "arvix",
  description: "Search articles from Arvix based on a query.",
  usage: "arxiv [search_query]",
  author: "Jay Mar",

  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      return sendMessage(senderId, {
        text: "Usage: arvix [search_query]\nExample: arvix quantum physics",
      }, pageAccessToken);
    }

    const query = args.join(" ");
    const apiUrl = "https://jerome-web.gleeze.com/service/api/arxiv";

    try {
      const { data } = await axios.get(apiUrl, {
        params: { query },
      });

      if (data && data.article) {
        const article = data.article;
        const response = `
📄 𝗔𝗿𝘃𝗶𝘅 𝗔𝗿𝘁𝗶𝗰𝗹𝗲\n・──────────────・
🔗 Title: ${article.title || "N/A"}
📅 Published: ${article.published || "N/A"}
👨‍🔬 Authors: ${article.authors ? article.authors.join(", ") : "N/A"}
📝 Summary: ${article.summary || "N/A"}
🌐 Link: ${article.id || "N/A"}
        `.trim();

        await sendConcatenatedMessage(senderId, response, pageAccessToken);
      } else {
        return sendMessage(senderId, {
          text: "⚠️ No articles found. Please try another query.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with Arxiv command:", error.message || error);
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
             
