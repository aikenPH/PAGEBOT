const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "flux",
  description: "Generate an image using Flux",
  author: "Jerome",
  usage: "flux [prompt]",

  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      return sendMessage(
        senderId,
        { text: "Usage: flux [your_prompt]\nExample: flux dog" },
        pageAccessToken
      );
    }

    const prompt = args.join(" ");
    const apiUrl = `https://jerome-web.onrender.com/service/api/bing?prompt=${encodeURIComponent(
      prompt
    )}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.success && data.result && data.result.length > 0) {
        const imageMessages = data.result.slice(0, 2).map((imageUrl) => ({
          attachment: {
            type: "image",
            payload: {
              url: imageUrl,
              is_reusable: true,
            },
          },
        }));

        for (const imageMessage of imageMessages) {
          await sendMessage(senderId, imageMessage, pageAccessToken);
        }
      } else {
        sendMessage(
          senderId,
          { text: `Sorry, no images were found for "${prompt}".` },
          pageAccessToken
        );
      }
    } catch (error) {
      console.error("Error fetching Bing images:", error.message || error);
      sendMessage(
        senderId,
        { text: "Sorry, there was an error processing your request." },
        pageAccessToken
      );
    }
  },
};
  
