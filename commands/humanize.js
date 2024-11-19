const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'humanize',
  description: 'Get a human-like response from the AI.',
  usage: 'humanize <text>',
  author: 'chilli',
  async execute(chilli, pogi, kupal) {
    if (!pogi || pogi.length === 0) {
      await sendMessage(chilli, {
        text: 'Usage: humanize [your_text]\nExample: humanize I love you'
      }, kupal);
      return;
    }

    const text = pogi.join(' ');
    const apiUrl = `https://kaiz-apis.gleeze.com/api/humanizer?q=${encodeURIComponent(text)}`;

    try {
      const response = await axios.get(apiUrl);
      const { response: message, error } = response.data;

      if (error === "No") {
        const fullResponse = `🤖 𝗛𝗨𝗠𝗔𝗡𝗜𝗭𝗘 𝗔𝗜\n・───────────・\n${message}`;
        await sendConcatenatedMessage(chilli, fullResponse, kupal);
      } else {
        await sendMessage(chilli, { text: 'An error occurred while processing your request. Please try again later.' }, kupal);
      }
      
    } catch (error) {
      console.error('Error in humanize command:', error);
      await sendMessage(chilli, { text: 'An error occurred while connecting to the API. Please try again later.' }, kupal);
    }
  }
};

async function sendConcatenatedMessage(chilli, text, kalamansi) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);

    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sendMessage(chilli, { text: message }, kalamansi);
    }
  } else {
    await sendMessage(chilli, { text }, kalamansi);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
