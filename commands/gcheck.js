const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

async function checkGrammar(senderId, text, pageAccessToken) {
  const apiUrl = 'https://webspellchecker-webspellcheckernet.p.rapidapi.com/api';
  const headers = {
    'Content-Type': 'application/json',
    'x-rapidapi-host': 'webspellchecker-webspellcheckernet.p.rapidapi.com',
    'x-rapidapi-key': 'df5cd8e7aemsh1d8ac6d5a328032p14dd9cjsn370f5f715cef',
  };

  const data = {
    cmd: 'autocorrect',
    lang: 'en_US',
    text,
  };

  try {
    const response = await axios.post(apiUrl, data, { headers });
    const correctedText = response.data.result;

    if (correctedText) {
      const message = `📝 𝗚𝗿𝗮𝗺𝗺𝗮𝗿 𝗖𝗵𝗲𝗰𝗸𝗲𝗿\n・───────────・\n𝗢𝗿𝗶𝗴𝗶𝗻𝗮𝗹: ${text}\n𝗖𝗼𝗿𝗿𝗲𝗰𝘁𝗲𝗱: ${correctedText}`;
      await sendMessage(senderId, { text: message }, pageAccessToken);
    } else {
      await sendMessage(senderId, {
        text: 'No corrections were suggested for the provided text.',
      }, pageAccessToken);
    }
  } catch (error) {
    console.error('Error from Grammar Checker API:', error);
    await sendMessage(senderId, {
      text: 'An error occurred while checking grammar. Please try again later.',
    }, pageAccessToken);
  }
}

module.exports = {
  name: 'gcheck',
  description: 'Checks grammar and suggests corrections using the Grammar Checker API.',
  usage: 'gcheck <text>',
  author: 'Developer',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: gcheck [your_text]\nExample: gcheck teh quick brown fox.',
      }, pageAccessToken);
      return;
    }

    const text = args.join(' ');
    await checkGrammar(senderId, text, pageAccessToken);
  },
};
  
