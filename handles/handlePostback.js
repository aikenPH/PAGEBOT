const { sendMessage } = require('./sendMessage');

const handlePostback = (event, pageAccessToken) => {
  const chilli = event.sender?.id;
  const pogi = event.postback?.payload;

  if (chilli && pogi) {
    if (pogi === 'GET_STARTED_PAYLOAD') {
      const combinedMessage = {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: `Hello im Heru Chatbot your Ai Companion.\n◉ Guide\nType "help all" to show all available commands.\n◉ Hidden Features:\n◉ Autodownload Media:\n— Facebook Reels\n— Tiktok\n— Instagram`,
            buttons: [
              {
                type: "web_url",
                url: "https://www.facebook.com/jaymar.dev.00",
                title: "CONTACT US"
              }
            ]
          }
        },
        quick_replies: [
          {
            content_type: "text",
            title: "Help all",
            payload: "HELP_PAYLOAD"
          }
        ]
      };

      sendMessage(chilli, combinedMessage, pageAccessToken);

    } else {
      sendMessage(chilli, { text: `You sent a postback with payload: ${pogi}` }, pageAccessToken);
    }
  } else {
    console.error('Invalid postback event data');
  }
};

module.exports = { handlePostback };