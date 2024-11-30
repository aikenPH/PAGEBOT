const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "ytmp3",
  description: "Search and download YouTube songs.",
  usage: "ytmp3 [song_title]",
  author: "Developer",
  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(" ");
    if (!prompt) {
      await sendMessage(senderId, {
        text: "Usage: ytmp3 [your_song_title]\nExample: yptmp3 Shape of You",
      }, pageAccessToken);
      return;
    }

    await sendMessage(senderId, {
      text: "🔎 Searching..",
    }, pageAccessToken);

    try {
      // Fetch video information
      const searchResponse = await axios.get(`https://apiv2.kenliejugarap.com/ytsearch?title=${encodeURIComponent(prompt)}`);
      const videoInfo = searchResponse.data.videos[0];
      const { title, url } = videoInfo;

      const responseTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila",
        hour12: true,
      });

      await sendMessage(senderId, {
        text: `𝗬𝗼𝘂𝘁𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n\n🈯 Title: ${title}\n\n🌐 url: ${url}\n\n⏰ Asia/Manila: ${responseTime}\n\nDownloading...`,
      }, pageAccessToken);

      // Fetch download link
      const downloadResponse = await axios.get(`https://apiv2.kenliejugarap.com/music?url=${url}`);
      const downloadLink = downloadResponse.data.response;

      // Send the audio file
      const audioMessage = {
        attachment: {
          type: "audio",
          payload: {
            url: downloadLink,
          },
        },
      };

      await sendMessage(senderId, audioMessage, pageAccessToken);
    } catch (error) {
      console.error("Error with ytmp3 command:", error.message || error);
      await sendMessage(senderId, {
        text: `❌: ${error.message}`,
      }, pageAccessToken);
    }
  },
};
        
