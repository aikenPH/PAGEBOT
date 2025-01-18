const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'lyrics',
  description: 'Fetch song lyrics',
  usage: 'lyrics [song name]',
  author: 'Jay Mar',

  async execute(senderId, args, pageAccessToken) {
    if (!args.length) {
      await sendMessage(senderId, { text: 'Please provide the name of the song.' }, pageAccessToken);
      return;
    }

    const query = args.join(' ').trim();

    try {
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/lyrics?title=${encodeURIComponent(query)}`);
      const result = response.data;

      if (result && result.lyrics) {
        const { title, lyrics, thumbnail } = result;
        const messages = splitMessage(title, lyrics, 2000);

        for (const message of messages) {
          await sendMessage(senderId, { text: message }, pageAccessToken);
        }

        if (thumbnail) {
          await sendMessage(senderId, {
            attachment: {
              type: 'image',
              payload: {
                url: thumbnail,
                is_reusable: true
              }
            }
          }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: 'Sorry, no lyrics were found for your query.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error fetching lyrics:', error.message);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};

const splitMessage = (title, lyrics, chunkSize) => {
  const message = `💹 𝗧𝗶𝘁𝗹𝗲: ${title}\n\n${lyrics}`;
  const chunks = [];
  
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }

  return chunks;
};
