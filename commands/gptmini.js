const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

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
  name: 'gptmini',
  description: 'Get a response from GPT-4o Mini API.',
  usage: 'gpt4o-mini <query>',
  author: 'Developer',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: gptmini [your_question]\nExample: gptmini explain quantum computing'
      }, pageAccessToken);
      return;
    }

    const query = args.join(' ');
    const apiUrl = `https://heru-apiv2.onrender.com/api/gpt-4o-mini?prompt=${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(apiUrl);
      const result = response.data.response;

      if (result) {
        const fullResponse = `🤖 𝗚𝗣𝗧4𝗢-𝗠𝗜𝗡𝗜\n・───────────・\n${result}`;
        await sendConcatenatedMessage(senderId, fullResponse, pageAccessToken);
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