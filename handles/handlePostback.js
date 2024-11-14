const { sendMessage } = require('./sendMessage');

function handlePostback(event, pageAccessToken) {
  const senderId = event.sender.id;
  const payload = event.postback.payload;

  if (payload === "GET_STARTED_PAYLOAD") {
    sendMessage(senderId, "Welcome! I'm Heru Bot, your AI Companion. Type 'help' to se all available commands and 'help all' to show all commands. Thank you for using Heru Chatbot\n\n👻 Hidden Features:\n\n◉ Autodownload\n— Facebook reels\n— Tiktok\n— Instagram", pageAccessToken);

    // Gusto mo mag quick replies?? pwes Walang ganon
  }
}

module.exports = { handlePostback };