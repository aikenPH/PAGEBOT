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
            text: `Hello There!! Im Heru Bot your Ai Companion\n\nType "help" to see commands or click the "Help" button below.`,
            buttons: [
              {
                type: "web_url",
                url: "https://tigang.vercel.app/",
                title: "PRIVACY POLICY"
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
      sendMessage(chilli, { text: `You sent a postback with payload: ${pogi}` }, pageAccessToken);
    }
  } else {
    console.error('Invalid postback event data');
  }
};

module.exports = { handlePostback };