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

function generateRandomUid() {
  return Math.random().toString(36).substring(2, 10);
}

module.exports = {
  name: "aristotle",
  description: "Talk to Aristotle AI.",
  usage: "aristotle [your_question]",
  author: "Jay Mar",
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(
        senderId,
        {
          text: "Usage: aristotle [your_question]\nExample: aristotle What is the essence of virtue?",
        },
        pageAccessToken
      );
      return;
    }

    const question = args.join(" ");
    const apiUrl = `https://markdevs-last-api-s7d0.onrender.com/genuines-ai`;

    try {
      const response = await axios.get(apiUrl, {
        params: { name: "Aristotle", question },
      });

      const result = response.data.result;

      if (result) {
        const header = "📜 𝗔𝗥𝗜𝗦𝗧𝗢𝗧𝗟𝗘\n・──────────────・\n";
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: "⚠️ Unable to generate a response. Please try again later.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with Aristotle command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while processing your request. Please try again later.",
      }, pageAccessToken);
    }
  },
};
