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
  name: "gpt4",
  description: "Talk to GPT-4 AI.",
  usage: "gpt4 [your_question]",
  author: "Jay Mar",
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(
        senderId,
        {
          text: "Usage: gpt4 [your_question]\nExample: gpt4 What is the future of AI?",
        },
        pageAccessToken
      );
      return;
    }

    const question = args.join(" ");
    const uid = generateRandomUid();
    const apiUrl = `https://kaiz-apis.gleeze.com/api/gpt-4o`;

    try {
      const response = await axios.get(apiUrl, {
        params: { q: question, uid },
      });

      const result = response.data.response;

      if (result) {
        const header = "🤖 𝗚𝗣𝗧-𝟰\n・──────────────・\n";
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: "⚠️ Unable to generate a response. Please try again later.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with GPT-4 command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while processing your request. Please try again later.",
      }, pageAccessToken);
    }
  },
};
