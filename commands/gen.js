const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api'); // Ensure you have the correct import for the api object

module.exports = {
  name: 'gen',
  description: 'Generate image using my api',
  usage: 'gen <prompt>',
  author: 'Developer',
  async execute(kupal, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(kupal, {
        text: 'Usage: gen [your_prompt]\nExample: gen dog and cat'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const apiUrl = `${api.joshWebApi}/aigen?prompt=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(apiUrl);
      const imageUrl = response.data.result;

      if (imageUrl) {
        await sendMessage(kupal, {
          attachment: {
            type: 'image',
            payload: {
              url: imageUrl
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(kupal, {
          text: 'An error occurred while generating the image. Please try again later.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      await sendMessage(kupal, {
        text: 'An error occurred while generating the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
