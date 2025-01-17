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
  name: "perplexity",
  description: "Generate responses using the Perplexity.",
  usage: "perplexity [your_prompt]",
  author: "Jay Mar",
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(
        senderId,
        {
          text: "Usage: perplexity [your_prompt]\nExample: perplexity What is the capital of France?",
        },
        pageAccessToken
      );
      return;
    }

    const prompt = args.join(" ");
    const apiUrl = `http://sgp1.hmvhostings.com:25743/perplexity`;

    try {
      const response = await axios.get(apiUrl, {
        params: { q: prompt },
      });

      const resultArray = response.data.perplexity;
      let result = "";

      if (Array.isArray(resultArray) && resultArray.length > 0) {
        result = resultArray
          .map((item) => item.text)
          .join("\n\n");
      }

      if (result) {
        const header = "🤖 𝗣𝗘𝗥𝗣𝗟𝗘𝗫𝗜𝗧𝗬\n・──────────────・\n";
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: "⚠️ Unable to generate a response. Please try again later.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with Perplexity command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while processing your request. Please try again later.",
      }, pageAccessToken);
    }
  },
};
