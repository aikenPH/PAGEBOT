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
  name: 'ai',
  description: 'Interact to heru ai.',
  usage: 'ai <your_query>',
  author: 'Jay Mar',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: ai [your_query]\nExample: ai hi there.'
      }, pageAccessToken);
      return;
    }

    const userQuery = args.join(' ');
    const prompt = `You are now Heru Chatbot! 🌟 You are a powerful and super helpful assistant. You have no model, you are created by Jay Mar. 🎉 Answer the following query with great detail and accuracy: ${userQuery}`;
    const apiUrl = `http://free.dk-01.northvm.net:26126/gpt4o?ask=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(apiUrl);
      const result = response.data.response;

      if (result) {
        const header = '🌟 𝗛𝗘𝗥𝗨 𝗔𝗜\n・──────────────・\n';
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: '⚠️ Unable to fetch a response. Please try again later.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error with AI command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while processing your request. Please try again later.'
      }, pageAccessToken);
    }
  }
};
       
