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
  name: 'summarize',
  description: 'Summarizes the provided text using an API.',
  usage: 'summarize <text>',
  author: 'Jay Mar',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: summarize <text>\nExample: summarize This is a long text that needs to be summarized.'
      }, pageAccessToken);
      return;
    }

    const text = args.join(' ');
    const apiUrl = `https://kaiz-apis.gleeze.com/api/summarize?text=${encodeURIComponent(text)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.response) {
        const summary = response.data.response;
        const header = '🤖 𝗦𝗨𝗠𝗠𝗔𝗥𝗜𝗭𝗘 𝗔𝗜\n・────────────・\n';
        await sendConcatenatedMessage(senderId, header + summary, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: '❌ Failed to generate a summary. Please try again later.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      await sendMessage(senderId, {
        text: '❌ An error occurred while generating the summary. Please try again later.'
      }, pageAccessToken);
    }
  }
};
    
