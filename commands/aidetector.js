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
  name: 'aidetector',
  description: 'Analyzes a query using the AI Detector API.',
  usage: 'aidetector <query>',
  author: 'Developer',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: aidetector [your_query]\nExample: aidetector Is this AI-generated content?'
      }, pageAccessToken);
      return;
    }

    const query = args.join(' ');
    const apiUrl = `${api.kaizen}/api/aidetector?q=${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(apiUrl);
      const result = response.data.response;

      if (result) {
        const header = `🤖 𝗔𝗜 𝗗𝗘𝗧𝗘𝗖𝗧𝗢𝗥\n・───────────・\n`;
        const messageWithHeader = `${header}${result}`;
        await sendConcatenatedMessage(senderId, messageWithHeader, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: 'Oops! The AI Detector API did not return a response. Please try again.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error fetching data from AI Detector API:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while processing your request. Please try again later.'
      }, pageAccessToken);
    }
  }
};
                      
