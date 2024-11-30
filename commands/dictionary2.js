const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'dictionary2',
  description: 'Fetch the meaning, phonetics, and audio pronunciation of a word.',
  usage: 'dictionary <word>',
  author: 'Jay Mar',

  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: dictionary <word>\nExample: dictionary hello'
      }, pageAccessToken);
      return;
    }

    const word = args.join(' ').trim();

    try {
      const apiUrl = `https://ccprojectapis.ddns.net/api/dictio?q=${encodeURIComponent(word)}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.status) {
        const { word, phonetics, audio, meanings } = response.data;

        // Build the response message
        let message = `📚 𝗗𝗜𝗖𝗧𝗜𝗢𝗡𝗔𝗥𝗬\n・──────────────・\n🔍 Word: ${word}\n`;

        if (phonetics && phonetics.length > 0) {
          const phoneticText = phonetics.map((p) => p.text || 'N/A').join(', ');
          message += `📌 Phonetics: ${phoneticText}\n`;
        }

        if (audio) {
          message += `🔊 [Pronunciation Audio](${audio})\n`;
        }

        if (meanings && meanings.length > 0) {
          meanings.forEach((meaning, index) => {
            const { partOfSpeech, definitions } = meaning;
            message += `\n${index + 1}. (${partOfSpeech})\n`;
            definitions.forEach((def, i) => {
              message += `  - ${i + 1}. ${def.definition}\n`;
            });
          });
        }

        await sendMessage(senderId, { text: message }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: `⚠️ No meaning found for the word "${word}". Please try another word.`
        }, pageAccessToken);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An error occurred while fetching the word. Please try again.';
      console.error('Error in dictionary command:', error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ 𝗘𝗥𝗥𝗢𝗥\n・──────────────・\n${errorMessage}`
      }, pageAccessToken);
    }
  }
};
          
