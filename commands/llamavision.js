const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "llamavision",
  description: "Analyze images or answer text-based queries using llamavision.",
  usage: "llamavision <question> | [Attach or Reply to an image]",
  author: "Jay Mar",

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    const userPrompt = args.join(" ").trim();

    if (!userPrompt && !imageUrl && !getAttachmentUrl(event)) {
      return sendMessage(senderId, {
        text: "Usage: Send 'llamavision <question>' with image or without an image."
      }, pageAccessToken);
    }

    if (!imageUrl) {
      imageUrl = getAttachmentUrl(event) || (await getRepliedImage(event, pageAccessToken));
    }

    try {
      const apiUrl = "https://www.pinkissh.site/api/llamavision";
      const response = await axios.get(apiUrl, {
        params: {
          prompt: userPrompt || "Answer all question that need to answer?",
          imageUrl: imageUrl || ""
        }
      });

      if (!response.data || !response.data.response) {
        return sendMessage(senderId, {
          text: "⚠️ Unable to process your request. Try again."
        }, pageAccessToken);
      }

      const header = "📸 𝗟𝗟𝗔𝗠𝗔𝗩𝗜𝗦𝗜𝗢𝗡\n・──────────────・\n";
      await sendMessage(senderId, { text: header + response.data.response }, pageAccessToken);

    } catch (error) {
      console.error("Error in llamavision command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred. Please try again later."
      }, pageAccessToken);
    }
  }
};

function getAttachmentUrl(event) {
  const attachment = event.message?.attachments?.[0];
  return attachment?.type === "image" ? attachment.payload.url : null;
}

async function getRepliedImage(event, pageAccessToken) {
  if (event.message?.reply_to?.mid) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: pageAccessToken }
      });
      const imageData = data?.data?.[0]?.image_data;
      return imageData ? imageData.url : null;
    } catch (error) {
      console.error("Error fetching replied image:", error.message || error);
      return null;
    }
  }
  return null;
    }
          
