const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'anime',
  description: 'Search for anime information',
  author: 'Jay Mar',
  usage: 'anime [anime title]',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const query = args.join(' ').trim();

    if (!query) {
      return await sendMessage(senderId, { text: 'Please provide the title of an anime. Example: anime Boku no Hero Academia' }, pageAccessToken);
    }

    try {
      await sendMessage(senderId, { text: '🔍 Searching...' }, pageAccessToken);

      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/mal?title=${encodeURIComponent(query)}`);
      const data = response.data;

      if (!data.title) {
        return await sendMessage(senderId, { text: 'No results found for this anime.' }, pageAccessToken);
      }

      const formattedMessage = `🎥 ${data.title} (${data.japanese})\n\n` +
        `📺 Type: ${data.type}\n` +
        `📅 Status: ${data.status}\n` +
        `🌟 Score: ${data.score} (${data.scoreStats})\n` +
        `👥 Popularity: ${data.popularity}\n` +
        `🍿 Premiered: ${data.premiered}\n` +
        `📆 Aired: ${data.aired}\n` +
        `🎙️ Studios: ${data.studios}\n` +
        `📖 Genres: ${data.genres}\n` +
        `📄 Description: ${data.description}\n\n` +
        `🔗 More info: [MAL Link](${data.url})`;

      const messageWithImage = {
        attachment: {
          type: 'image',
          payload: {
            url: data.picture,
            is_reusable: true,
          },
        },
      };

      await sendMessage(senderId, messageWithImage, pageAccessToken);
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error.message || error);
      await sendMessage(senderId, { text: '❌ An error occurred during the search. Please try again later.' }, pageAccessToken);
    }
  }
};
      
