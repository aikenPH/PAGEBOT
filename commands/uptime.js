const moment = require('moment-timezone');
const { sendMessage } = require('../handles/sendMessage');

async function sendConcatenatedMessage(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sendMessage(senderId, { text: message }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text }, pageAccessToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

module.exports = {
  name: 'uptime',
  description: 'Show uptime of the bot.',
  usage: 'uptime',
  author: 'Jay Mar',
  async execute(senderId, args, pageAccessToken) {
    const uptime = process.uptime();

    const duration = moment.duration(uptime, 'seconds');
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    let uptimeMessage = "";

    if (days === 1) {
      uptimeMessage += `${days} Day, `;
    } else if (days > 1) {
      uptimeMessage += `${days} Days, `;
    }

    if (hours === 1) {
      uptimeMessage += `${hours} Hour, `;
    } else if (hours > 1) {
      uptimeMessage += `${hours} Hours, `;
    }

    if (minutes === 1) {
      uptimeMessage += `${minutes} Minute, `;
    } else if (minutes > 1) {
      uptimeMessage += `${minutes} Minutes, `;
    }

    if (seconds === 1) {
      uptimeMessage += `${seconds} Second.`;
    } else if (seconds > 1) {
      uptimeMessage += `${seconds} Seconds.`;
    }

    const message = `🤖 Heru Chatbot has been running for: ${uptimeMessage}`;
    await sendConcatenatedMessage(senderId, message, pageAccessToken);
  }
};
    
