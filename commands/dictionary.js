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
  name: 'dictionary',
  description: 'Search words dictionary',
  usage: 'dictionary <word>',
  author: 'Jay Mar',
  async execute(senderId, args, pageAccessToken) {
    const input = args.join(' ').trim();

    if (!input) {
      await sendMessage(senderId, { text: 'Usage: dictionary [your_word]\nExample: dictionary love.' }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(input)}`;
      const response = await axios.get(apiUrl);
      const data = response.data[0];

      const phonetics = data.phonetics
        .map(item => (item.text ? `\n    /${item.text}/` : ""))
        .join('');

      const meanings = data.meanings
        .map(item => {
          const definition = item.definitions[0]?.definition;
          const example = item.definitions[0]?.example
            ? `\n*example:\n "${item.definitions[0].example.charAt(0).toUpperCase() + item.definitions[0].example.slice(1)}"`
            : "";
          return `\n• ${item.partOfSpeech}\n ${definition ? definition.charAt(0).toUpperCase() + definition.slice(1) : "Definition not available"}${example}`;
        })
        .join('');

      const msg = `❰ ❝ ${data.word} ❞ ❱${phonetics}${meanings}`;
      await sendConcatenatedMessage(senderId, msg, pageAccessToken);
    } catch (error) {
      if (error.response?.status === 404) {
        await sendMessage(senderId, { text: `No definitions found for '${input}'.` }, pageAccessToken);
      } else {
        console.error('Error fetching definition:', error);
        await sendMessage(senderId, {
          text: 'An error occurred while fetching the definition. Please try again later.'
        }, pageAccessToken);
      }
    }
  }
};
            
