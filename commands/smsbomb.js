const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'smsbomb',
  description: 'Putokan na!!.',
  usage: 'smsbomb <phone_number> <count> [interval]',
  author: 'Jay Mar',
  async execute(senderId, args, pageAccessToken) {
    if (args.length < 2) {
      await sendMessage(senderId, {
        text: 'Usage: smsbomb <phone_number> <count> [interval]\nExample: smsbomb 1234567890 5 2'
      }, pageAccessToken);
      return;
    }

    const phoneNumber = args[0];
    const count = parseInt(args[1], 10);
    const interval = args[2] ? parseInt(args[2], 10) : 1; // Default interval to 1 second if not specified

    if (isNaN(count) || count <= 0) {
      await sendMessage(senderId, { text: 'Please provide a valid number of SMS to send.' }, pageAccessToken);
      return;
    }

    const apiUrl = `https://kaiz-apis.gleeze.com/api/spamsms?phone=${encodeURIComponent(phoneNumber)}&count=${count}&interval=${interval}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.success) {
        await sendMessage(senderId, {
          text: `✅ Successfully sent ${count} SMS to ${phoneNumber} with an interval of ${interval} second(s).`
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: '❌ Failed to send SMS. Please check the input or try again later.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      await sendMessage(senderId, {
        text: '❌ An error occurred while trying to send SMS. Please try again later.'
      }, pageAccessToken);
    }
  }
};
      
