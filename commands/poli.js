const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'poli',
  description: 'Generate image using pilination ai',
  author: 'Developer',

  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Usage: poli [your_prompt]\nExample: poli dog and cat' }, pageAccessToken);
      return;
    }

    const prompt = args.join(" ");

    try {
      const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: apiUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error generating image:', error);
      await sendMessage(senderId, { text: 'An error occurred while generating the image. Please try again later.' },
 pageAccessToken);
    }
  }
};