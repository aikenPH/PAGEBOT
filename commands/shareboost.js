const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const activeSessions = new Map();

module.exports = {
  name: 'shareboost',
  description: 'Boost a Facebook post by sharing it multiple times.',
  usage: 'shareboost <url> | <appstate> | <amount> | <interval>',
  author: 'Jay Mar',

  async execute(senderId, args, pageAccessToken) {
    if (args.length < 7 || !args.includes('|')) {
      await sendMessage(senderId, {
        text: 'Usage: shareboost <url> | <appstate> | <amount> | <interval>\nExample: shareboost https://facebook.com/post/123 | your_appstate | 1000 | 2'
      }, pageAccessToken);
      return;
    }

    const parts = args.join(' ').split('|').map(part => part.trim());
    const [url, appstate, amount, interval] = parts;

    if (!url || !appstate || isNaN(amount) || isNaN(interval)) {
      await sendMessage(senderId, {
        text: 'Invalid input format. Ensure all parameters are correct.\nExample: shareboost https://facebook.com/post/123 | your_appstate | 1000 | 2'
      }, pageAccessToken);
      return;
    }

    const sessionKey = `${senderId}-${url}`;

    if (activeSessions.has(sessionKey)) {
      const sessionInfo = activeSessions.get(sessionKey);
      await sendMessage(senderId, {
        text: `📊 𝗦𝗛𝗔𝗥𝗘 𝗕𝗢𝗢𝗦𝗧 𝗦𝗘𝗦𝗦𝗜𝗢𝗡\n・──────────────・\n🌐 URL: ${sessionInfo.url}\n📤 Amount: ${sessionInfo.amount}\n⏳ Interval: ${sessionInfo.interval} seconds\n⏱ Status: Active\n\nNote: Each link is equivalent to 50,000 shares. Submitting the same link within 24 hours will result in an error. The system auto-refreshes daily, allowing one link per day. Maximum shares: 50,000. You may resubmit tomorrow. Don't duplicate submit it; it causes errors.`
      }, pageAccessToken);
      return;
    }

    try {
      const response = await axios.post('https://spamsharev1api.onrender.com/api/submit', {
        cookie: appstate,
        url,
        amount: parseInt(amount, 10),
        interval: parseInt(interval, 10)
      });

      const successMessage = response.data?.message || 'Your post is now being shared!';
      
      // Store the session in the activeSessions Map
      activeSessions.set(sessionKey, {
        url,
        amount: parseInt(amount, 10),
        interval: parseInt(interval, 10),
        status: 'Active'
      });

      await sendMessage(senderId, {
        text: `📤 𝗦𝗛𝗔𝗥𝗘 𝗕𝗢𝗢𝗦𝗧\n・──────────────・\n${successMessage}\n🌐 URL: ${url}\n📤 Shares: ${amount}\n⏳ Interval: ${interval} seconds\n\nNote: Each link is equivalent to 50,000 shares. Submitting the same link within 24 hours will result in an error. The system auto-refreshes daily, allowing one link per day. Maximum shares: 50,000. You may resubmit tomorrow. Don't duplicate submit it; it causes errors.`
      }, pageAccessToken);

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An error occurred while processing your request. Please try again.';
      console.error('Error in shareboost:', error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ 𝗘𝗥𝗥𝗢𝗥\n・──────────────・\n${errorMessage}\n\nNote: Each link is equivalent to 50,000 shares. Submitting the same link within 24 hours will result in an error. The system auto-refreshes daily, allowing one link per day. Maximum shares: 50,000. You may resubmit tomorrow. Don't duplicate submit it; it causes errors.`
      }, pageAccessToken);
    }
  }
};
    
