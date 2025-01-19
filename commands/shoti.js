const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

async function sendConcatenatedMessage(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
  name: "shoti",
  description: "Generate a short video link from the provided URL.",
  usage: "shoti [your_url]",
  author: "Jay Mar",
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(
        senderId,
        {
          text: "Usage: shoti [your_url]\nExample: shoti https://www.example.com",
        },
        pageAccessToken
      );
      return;
    }

    const url = args.join(" ");
    const apiUrl = `https://kaiz-apis.gleeze.com/api/shoti`;

    try {
      const response = await axios.get(apiUrl, {
        params: { url: url },
      });

      const data = response.data;

      if (data.status === "success" && data.shoti) {
        const { videoUrl, title, username, nickname, duration, region } = data.shoti;
        const header = "🎥 𝗦𝗛𝗢𝗧𝗜 𝗩𝗜𝗗𝗘𝗢\n・──────────────・\n";
        const videoMessage = `
Title: ${title}
Username: ${username}
Nickname: ${nickname}
Duration: ${duration}s
Region: ${region}
Video Link: ${videoUrl}
        `;
        
        const videoPayload = {
          attachment: {
            type: "video",
            payload: {
              url: videoUrl,
              is_reusable: true,
            },
          },
        };

        await sendConcatenatedMessage(senderId, header + videoMessage, pageAccessToken);
        await sendMessage(senderId, videoPayload, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: "⚠️ Unable to process the video link. Please try again later.",
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error with Shoti command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while processing your request. Please try again later.",
      }, pageAccessToken);
    }
  },
};
                          
