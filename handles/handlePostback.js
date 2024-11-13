/*const { sendMessage } = require('./sendMessage');

function handlePostback(event, pageAccessToken) {
  const senderId = event.sender.id;
  const payload = event.postback.payload;

}

module.exports = { handlePostback };*/

const { sendMessage } = require('./sendMessage');

function handlePostback(event, pageAccessToken) {
  const senderId = event.sender.id;
  const payload = event.postback.payload;

  if (payload === "GET_STARTED_PAYLOAD") {
    // Updated welcome message
    sendMessage(
      senderId, 
      "Welcome! I'm Heru Bot, your AI Companion. Type the down button below if you need assistance. Welcome! I'm here to help you.",
      pageAccessToken
    );

    const messageWithQuickReplies = {
      quick_replies: [
        {
          content_type: "text",
          title: "Help",
          payload: "HELP_PAYLOAD"
        },
        {
          content_type: "text",
          title: "Privacy",
          payload: "PRIVACY_POLICY_PAYLOAD"
        }
      ]
    };

    sendMessage(senderId, messageWithQuickReplies, pageAccessToken);

    const contactUsButtonMessage = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          buttons: [
            {
              type: "web_url",
              title: "Contact Us",
              url: "https://www.facebook.com/jaymar.dev.00",
              webview_height_ratio: "full"
            }
          ]
        }
      }
    };

    sendMessage(senderId, contactUsButtonMessage, pageAccessToken);
  }
}

module.exports = { handlePostback };