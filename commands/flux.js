const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "flux",
  description: "Generate an image based on a prompt",
  author: "Jay Mar",
  usage: "flux [prompt]",

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(" ").trim();

    if (!prompt) {
      return sendMessage(
        senderId,
        { text: "Please provide a prompt for the image generation. Example: flux A futuristic cityscape." },
        pageAccessToken
      );
    }

    try {
      await sendMessage(senderId, { text: "🎨 Generating image, please wait..." }, pageAccessToken);

      const response = await axios.get(`https://api.kenliejugarap.com/flux/`, {
        params: { prompt },
      });

      const data = response.data;

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
      console.error("Error in flux command:", error.message || error);
      await sendMessage(
        senderId,
        { text: "❌ An error occurred while generating the image. Please try again later." },
        pageAccessToken
      );
    }
  },
};
