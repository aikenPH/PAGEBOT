const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api);

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
  name: 'babe',
  description: 'Talk to horny AI',
  usage: 'babe <prompt>',
  author: 'developer',
  async execute(senderId, args, pageAccessToken) {
    const chilli = args.join(' ').trim();

    if (!chilli) {
      await sendMessage(senderId, { text: 'Please provide a prompt, for example: babe How are you?' }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.markApi}/api/ashley?query=${encodeURIComponent(chilli)}`;

    try {
      const response = await axios.get(apiUrl);
      const ashleyResponse = response.data.result || 'No response from Ashley.';

      const formattedResponse = `𝗛𝗢𝗥𝗡𝗬 𝗔𝗜 🥵\n\n${ashleyResponse}`;
      await sendConcatenatedMessage(senderId, formattedResponse, pageAccessToken);

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: '❌ An error occurred. Please try again later.' }, pageAccessToken);
    }
  }
};

