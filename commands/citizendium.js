const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "citizendium",
  description: "Fetch information about a word or topic from Citizendium.",
  usage: "citizendium [word]",
  author: "Jay Mar",

  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      return sendMessage(senderId, {
        text: "Usage: citizendium [word]\nExample: citizendium cat",
      }, pageAccessToken);
    }

    const word = args.join(" ");
    const apiUrl = "https://jerome-web.gleeze.com/service/api/citizendium";

    try {
      const { data } = await axios.get(apiUrl, {
        params: { word },
      });

      if (data && data.description) {
        const response = `
📘 𝗖𝗶𝘁𝗶𝘇𝗲𝗻𝗱𝗶𝘂𝗺 𝗘𝗻𝘁𝗿𝘆\n・──────────────・
🔤 Title: ${data.title || "N/A"}
📖 Description:
${data.description.trim()}
        `.trim();

        await sendConcatenatedMessage(senderId, response, pageAccessToken);
      } else {
        return sendMessage(senderId, {
          text: "⚠️ No information found. Please try another topic or word.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with Citizendium command:", error.message || error);
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
    
