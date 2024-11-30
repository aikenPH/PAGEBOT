const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'wiki',
  description: 'Fetch information from Wikipedia.',
  usage: 'wiki <question or text>',
  author: 'Jay Mar',

  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: wiki <question or text>\nExample: wiki Albert Einstein'
      }, pageAccessToken);
      return;
    }

    const query = args.join(' ').trim();

    try {
      const apiUrl = `https://ccprojectapis.ddns.net/api/wiki?q=${encodeURIComponent(query)}`;
      const { data } = await axios.get(apiUrl);

      if (data && data.extract) {
        const message = `🌐 𝗪𝗜𝗞𝗜 𝗥𝗘𝗦𝗨𝗟𝗧\n・──────────────・\n🔍 Query: ${query}\n\n${data.extract}`;
        await sendMessage(senderId, { text: message }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: `⚠️ No results found for "${query}". Please try again with a different query.`
        }, pageAccessToken);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An error occurred while fetching data. Please try again later.';
      console.error('Error in wiki command:', error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ 𝗘𝗥𝗥𝗢𝗥\n・──────────────・\n${errorMessage}`
      }, pageAccessToken);
    }
  }
};
