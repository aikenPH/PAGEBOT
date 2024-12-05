const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "wiktionary",
  description: "Fetch word definitions and details from Wiktionary.",
  usage: "wiktionary [word]",
  author: "Jay Mar",

  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      return sendMessage(senderId, {
        text: "Usage: wiktionary [word]\nExample: wiktionary dog",
      }, pageAccessToken);
    }

    const word = args.join(" ");
    const apiUrl = "https://jerome-web.gleeze.com/service/api/wiktionary";

    try {
      const { data } = await axios.get(apiUrl, {
        params: { word },
      });

      if (data && data.definition) {
        const response = `
📚 𝗪𝗶𝗸𝘁𝗶𝗼𝗻𝗮𝗿𝘆 𝗘𝗻𝘁𝗿𝘆\n・──────────────・
🔤 Word: ${data.word || "N/A"}
📖 Definition:
${data.definition.trim()}
        `.trim();

        await sendConcatenatedMessage(senderId, response, pageAccessToken);
      } else {
        return sendMessage(senderId, {
          text: "⚠️ No definitions found. Please try another word.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with Wiktionary command:", error.message || error);
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
      
