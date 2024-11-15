const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

function generateRandomUID() {
  return Math.random().toString(36).substring(2, 15); // Generates a random alphanumeric string
}

async function sendConcatenatedMessage(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 1000));
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
  name: 'deepcoder2',
  description: 'Interacts with DeepCoder2 AI.',
  usage: 'deepcoder2 <prompt>',
  author: 'Developer',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: deepcoder2 [your_question]\nExample: deepcoder2 explain algorithms'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const uid = generateRandomUID();
    const apiUrl = `${api.joshWebApi}/ai/deepseek-coder?q=${encodeURIComponent(prompt)}&uid=${uid}`;

    try {
      const response = await axios.get(apiUrl);
      const result = response.data.result;

      if (result) {
        const header = '🤖 𝗗𝗘𝗘𝗣𝗖𝗢𝗗𝗘𝗥 𝗔𝗜\n・───────────・\n';
        const footer = '\n・───────────・\n𝖭𝗈𝗍𝖾: 𝖳𝗁𝗂𝗌 𝗂𝗌 𝖼𝗈𝗇𝗏𝖾𝗋𝗌𝖺𝗍𝗂𝗈𝗇𝖺𝗅. 𝖳𝗒𝗉𝖾 "deepcoder2 clear" 𝗍𝗈 𝖼𝗅𝖾𝖺𝗋 𝖼𝗈𝗇𝗏𝖾𝗋𝗌𝖺𝗍𝗂𝗈𝗇 𝗐𝗂𝗍𝗁 DeepCoder2.';
        await sendConcatenatedMessage(senderId, header + result + footer, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: 'An error occurred while fetching the response. Please try again later.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while generating the response. Please try again later.'
      }, pageAccessToken);
    }
  }
};
