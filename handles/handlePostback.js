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
            text: `Hello There!! I'm Heru Bot, your AI Companion\n\nType "help" to see commands or click the "help" button below.\n\n🌟 Hidden Features\nAutodownload: Facebook reels, TikTok, Instagram by sending the link.`,
            buttons: [
              {
                type: "web_url",
                url: "https://tigang.vercel.app/",
                title: "PRIVACY POLICY"
              },
              {
                type: "web_url",
                url: "https://www.facebook.com/100077070762554",
                title: "CONTACT US"
              }
            ]
          }
        },
        quick_replies: [
          {
            content_type: "text",
            title: "Help",
            payload: "HELP_PAYLOAD"
          }
        ]
      };

      sendMessage(chilli, combinedMessage, pageAccessToken);

    } else {
      sendMessage(chilli, pageAccessToken);
    }
  } else {
    console.error('Invalid postback event data');
  }
};

module.exports = { handlePostback };
