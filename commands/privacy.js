const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'privacy',
  description: 'Rules for using the page bot',
  usage: 'privacy',
  author: 'cliff',
  async execute(senderId, args, pageAccessToken) {
    const termsAndConditions = `𝗧𝗘𝗥𝗠𝗦 𝗢𝗙 𝗦𝗘𝗥𝗩𝗜𝗖𝗘 & 𝗣𝗥𝗜𝗩𝗔𝗖𝗬 𝗣𝗢𝗟𝗜𝗖𝗬`;

    const kupal = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: termsAndConditions,
          buttons: [
            {
              type: "web_url",
              url: "https://tigang.vercel.app",
              title: "PRIVACY POLICY"
            }
          ]
        }
      }
    };
    await sendMessage(senderId, kupal, pageAccessToken);
  }
};
