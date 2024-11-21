const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

async function translateText(senderId, args, pageAccessToken) {
  const targetLanguage = args[0];
  const content = args.slice(1).join(' ');

  try {
    if (content.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a text to translate.\n\nExample: trans tl What is life?'
      }, pageAccessToken);
      return;
    }

    const apiUrl = encodeURI(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${content}`);
    const response = await axios.get(apiUrl);
    const retrieve = response.data;

    let translatedText = '';
    retrieve[0].forEach(item => (item[0]) ? translatedText += item[0] : '');

    const fromLang = (retrieve[2] === retrieve[8][0][0]) ? retrieve[2] : retrieve[8][0][0];
    const resultMessage = `Translation: ${translatedText}\n- Translated from ${fromLang} to ${targetLanguage}`;
    await sendMessage(senderId, { text: resultMessage }, pageAccessToken);
  } catch (error) {
    console.error('Translation error:', error);
    await sendMessage(senderId, {
      text: 'An error occurred while processing the translation. Please try again later.'
    }, pageAccessToken);
  }
}

module.exports = {
  name: 'trans',
  description: 'Text translation using Google Translate API.',
  usage: 'trans [target_language] [text]',
  author: 'Developer',
  async execute(senderId, args, pageAccessToken) {
    await translateText(senderId, args, pageAccessToken);
  }
};
      
