const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");
const api = require("../handles/api");

module.exports = {
  name: "flux2",
  description: "Generate an image based on a prompt",
  author: "Jay Mar",
  usage: "flux2 [prompt]",

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(" ").trim();

    if (!prompt) {
      return sendMessage(
        senderId,
        {
          text: "Usage: flux2 [your_prompt]\nExample: flux2 girl flying?",
        },
        pageAccessToken
      );
    }

    try {
      const response = await axios.get(`${api.kinlie2}/flux-realism/`, {
        params: { prompt },
      });

      const data = response.data.response;

      if (!data || !data.imageUrl) {
        return sendMessage(
          senderId,
          { text: "❌ Unable to generate the image. Please try again with a different prompt." },
          pageAccessToken
        );
      }

      const messageWithImage = {
        attachment: {
          type: "image",
          payload: {
            url: data.imageUrl,
            is_reusable: true,
          },
        },
      };

      await sendMessage(senderId, messageWithImage, pageAccessToken);
      await sendMessage(
        senderId,
        { text: `✅ Image generated successfully! Prompt: "${prompt}"` },
        pageAccessToken
      );
    } catch (error) {
      console.error("Error in flux2 command:", error.message || error);
      await sendMessage(
        senderId,
        { text: "❌ An error occurred while generating the image. Please try again later." },
        pageAccessToken
      );
    }
  },
};
    
