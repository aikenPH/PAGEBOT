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
  name: 'ai',
  description: 'Interacts with the Heru Ai.',
  usage: 'ai <prompt>',
  author: 'Developer',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: ai [your_question]\nExample: ai what is love??'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const apiUrl = `${api.jaymar}/api/heru?prompt=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(apiUrl);
      const result = response.data.response;

      if (result) {
        await sendConcatenatedMessage(senderId, result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: 'Oops! Something went wrong with the API. It might be down, or you can try your question again'
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
