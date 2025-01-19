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
  name: "pinterest",
  description: "Search Pinterest for image links.",
  usage: "pinterest [search_term]",
  author: "Jay Mar",
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(
        senderId,
        {
          text: "Usage: pinterest [search_term]\nExample: pinterest nature wallpapers",
        },
        pageAccessToken
      );
      return;
    }

    const searchQuery = args.join(" ");
    const apiUrl = `https://kaiz-apis.gleeze.com/api/pinterest`;

    try {
      const response = await axios.get(apiUrl, {
        params: { search: searchQuery },
      });

      const data = response.data.data;

      if (data && data.length > 0) {
        const header = "📌 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 𝗥𝗘𝗦𝗨𝗟𝗧𝗦\n・──────────────・\n";
        const formattedResults = data
          .slice(0, 5)
          .map((link) => ({
            type: "image",
            payload: {
              url: link,
              is_reusable: true,
            },
          }));

        for (const result of formattedResults) {
          await sendMessage(senderId, {
            attachment: result,
          }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, {
          text: "⚠️ No results found. Please try a different search term.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with Pinterest command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while processing your request. Please try again later.",
      }, pageAccessToken);
    }
  },
};
