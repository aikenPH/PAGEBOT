const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

async function checkSpelling(senderId, text, pageAccessToken) {
  const apiUrl = 'https://spellcheckpro.p.rapidapi.com/check_spelling';
  const headers = {
    'Content-Type': 'application/json',
    'x-rapidapi-host': 'spellcheckpro.p.rapidapi.com',
    'x-rapidapi-key': 'df5cd8e7aemsh1d8ac6d5a328032p14dd9cjsn370f5f715cef',
  };

  const data = {
    text,
  };

  try {
    const response = await axios.post(apiUrl, data, { headers });
    const corrections = response.data.corrections;

    if (corrections && corrections.length > 0) {
      const correctedText = corrections.map(c => c.corrected).join(' ');
      const message = `📝 𝗦𝗽𝗲𝗹𝗹 𝗖𝗵𝗲𝗰𝗸𝗲𝗿\n・───────────・\n𝗢𝗿𝗶𝗴𝗶𝗻𝗮𝗹: ${text}\n𝗖𝗼𝗿𝗿𝗲𝗰𝘁𝗲𝗱: ${correctedText}`;
      await sendMessage(senderId, { text: message }, pageAccessToken);
    } else {
      await sendMessage(senderId, {
        text: 'No spelling corrections were suggested for the provided text.',
      }, pageAccessToken);
    }
  } catch (error) {
    console.error('Error from Spell Checker API:', error);
    await sendMessage(senderId, {
      text: 'An error occurred while checking spelling. Please try again later.',
    }, pageAccessToken);
  }
}

module.exports = {
  name: 'spellcheck',
  description: 'Checks spelling and provides corrections using the Spell Checker API.',
  usage: 'spellcheck <text>',
  author: 'Developer',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: spellcheck [your_text]\nExample: spellcheck The quik brown fox jumpd over the lzy dog.',
      }, pageAccessToken);
      return;
    }

    const text = args.join(' ');
    await checkSpelling(senderId, text, pageAccessToken);
  },
};
    
