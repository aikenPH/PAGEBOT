const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

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
  name: 'freegpt',
  description: 'Generate responses using FreeGPT OpenAI.',
  usage: 'freegpt <your_query>',
  author: 'Jay Mar',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: freegpt [your_query]\nExample: freegpt What is AI?'
      }, pageAccessToken);
      return;
    }

    const question = args.join(' ');
    const apiUrl = `${api.kenlie2}/freegpt-openai/?question=${encodeURIComponent(question)}`;

    try {
      const response = await axios.get(apiUrl);
      const result = response.data.response;

      if (result) {
        const header = '🤖 𝗙𝗥𝗘𝗘𝗚𝗣𝗧 𝗢𝗣𝗘𝗡𝗔𝗜\n・──────────────・\n';
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: '⚠️ Unable to fetch a response. Please try again later.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error with FreeGPT command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while processing your request. Please try again later.'
      }, pageAccessToken);
    }
  }
};
                              
