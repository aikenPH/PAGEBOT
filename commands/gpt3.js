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
  name: 'gpt3',
  description: 'Interacts with GPT-3.5 Turbo.',
  usage: 'gpt3 <prompt>',
  author: 'Developer',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: gpt3 [your_question]\nExample: gpt3 what is love??'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const apiUrl = `${api.jaymar}/api/gpt-3.5-turbo?prompt=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(apiUrl);
      const result = response.data.response;

      if (result) {
        const header = '🤖 𝗚𝗣𝗧-3.5 𝗧𝗨𝗥𝗕𝗢\n・───────────・\n';
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
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
