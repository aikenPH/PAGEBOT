const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "gemini",
  description: "Interact with Google Gemini for image recognition or text-based queries.",
  author: "Developer",

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    const userPrompt = args.join(" ");

    if (!userPrompt && !imageUrl) {
      return sendMessage(senderId, { 
        text: `Usage: gemini [your_question]\nExample: gemini hello 'gemini describe this photo'\n✨ Guide:
❶ Send an image with [gemini and question].
❷ Send [gemini and question] for text-only queries.` 
      }, pageAccessToken);
    }

    try {
      if (!imageUrl) {
        if (event.message.reply_to && event.message.reply_to.mid) {
          imageUrl = await getRepliedImage(event.message.reply_to.mid, pageAccessToken);
        } else if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
          imageUrl = event.message.attachments[0].payload.url;
        }
      }

      const apiUrl = `${api.joshWebApi}/gemini`;
      const response = await handleImageRecognition(apiUrl, userPrompt, imageUrl);
      const result = response.gemini;

      const header = "📸 𝗚𝗘𝗠𝗜𝗡𝗜-𝗚𝗢𝗢𝗚𝗟𝗘\n・───────────・\n";
      await sendConcatenatedMessage(senderId, `${header}${result}`, pageAccessToken);

    } catch (error) {
      console.error("Error in Gemini command:", error);
      sendMessage(senderId, { text: `⚠️ Error: ${error.message || "Something went wrong."}` }, pageAccessToken);
    }
  }
};

async function handleImageRecognition(apiUrl, prompt, imageUrl) {
  const { data } = await axios.get(apiUrl, {
    params: {
      prompt,
      url: imageUrl || ""
    }
  });

  return data;
}

async function getRepliedImage(mid, pageAccessToken) {
  const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
    params: { access_token: pageAccessToken }
  });

  if (data && data.data.length > 0 && data.data[0].image_data) {
    return data.data[0].image_data.url;
  } else {
    return "";
  }
}

async function sendConcatenatedMessage(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);

    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 500));
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