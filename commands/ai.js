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

function generateUidPool(count) {
  const uids = [];
  for (let i = 0; i < count; i++) {
    uids.push(Math.random().toString(36).substring(2, 10));
  }
  return uids;
}

const uidPool = generateUidPool(100);

function getRandomUid() {
  const randomIndex = Math.floor(Math.random() * uidPool.length);
  return uidPool[randomIndex];
}

module.exports = {
  name: "ai",
  description: "Generate responses using GPT-4 Omni.",
  usage: "ai [your_prompt]",
  author: "Jay Mar",
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(
        senderId,
        {
          text: "Usage: ai [your_prompt]\nExample: ai Write a poem about the sea.",
        },
        pageAccessToken
      );
      return;
    }

    const prompt = args.join(" ");
    const uid = getRandomUid();
    const apiUrl = `https://yt-video-production.up.railway.app/gpt4-omni`;

    try {
      const response = await axios.get(apiUrl, {
        params: { ask: prompt, userid: uid },
      });

      const result = response.data.response;

      if (result) {
        const header = "🤖 𝗔𝗜 𝗥𝗘𝗦𝗣𝗢𝗡𝗦𝗘\n・──────────────・\n";
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: "⚠️ Unable to generate a response. Please try again later.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with AI command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while processing your request. Please try again later.",
      }, pageAccessToken);
    }
  },
};
