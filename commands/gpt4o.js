const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

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

module.exports = {
  name: 'gpt4o',
  description: 'Interact to gpt4o',
  usage: 'gpt4o <question>',
  author: 'Jay Mar',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: gpt4o <question>\nExample: gpt4o What is the meaning of life?'
      }, pageAccessToken);
      return;
    }

    const question = args.join(' ');
    const apiUrl = `https://heru-apiv2.onrender.com/api/gpt-4o?question=${encodeURIComponent(question)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.response) {
        const answer = response.data.response;
        const header = '🤖 𝗚𝗣𝗧-4𝗢\n・─────────────・\n';
        await sendConcatenatedMessage(senderId, header + answer, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: '❌ Failed to generate a response. Please try again later.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error generating GPT-4O response:', error);
      await sendMessage(senderId, {
        text: '❌ An error occurred while generating the response. Please try again later.'
      }, pageAccessToken);
    }
  }
};
