const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

const defaultEmojiTranslate = "🌐";

module.exports = {
  name: "trans2",
  description: "Translate text",
  usage: "trans2 <text> [->target_language]",
  author: "Aljur Pogoy",

  async execute(senderId, args, pageAccessToken) {
    if (args[0] === "-r" || args[0] === "-react" || args[0] === "-reaction") {
      if (args[1] === "set") {
        await sendMessage(senderId, {
          text: `🌀 Please react to this message to set that emoji as the emoji to translate messages.`
        }, pageAccessToken);
        return;
      }

      const isEnable = args[1] === "on" ? true : args[1] === "off" ? false : null;
      if (isEnable === null) {
        await sendMessage(senderId, {
          text: `❌ Invalid argument. Please choose 'on' or 'off'.`
        }, pageAccessToken);
        return;
      }

      await sendMessage(senderId, {
        text: isEnable
          ? `✅ Translation on reaction enabled. React with "${defaultEmojiTranslate}" to any message to translate it. Only messages sent after enabling this feature will be translated.`
          : `✅ Translation on reaction disabled.`
      }, pageAccessToken);
      return;
    }

    let content = args.join(" ");
    let langCodeTrans = null;

    if (args[0] && args[0].startsWith("-")) {
      content = args.slice(1).join(" ");
    } else {
      content = args.join(" ");
    }

    const lastIndexSeparator = content.lastIndexOf("->");
    if (lastIndexSeparator !== -1 && (content.length - lastIndexSeparator === 4 || content.length - lastIndexSeparator === 5)) {
      langCodeTrans = content.slice(lastIndexSeparator + 2);
      content = content.slice(0, lastIndexSeparator);
    }

    await sendMessage(senderId, { text: "Translating... Please wait." }, pageAccessToken);

    try {
      const { text, lang } = await translate(content.trim(), langCodeTrans || "en");
      await sendMessage(senderId, {
        text: `${text}\n\n🌐 Translated from ${lang} to ${langCodeTrans || "en"}.`
      }, pageAccessToken);
    } catch (error) {
      console.error("Error calling Translate API:", error);
      await sendMessage(senderId, {
        text: "There was an error translating the text. Please try again later."
      }, pageAccessToken);
    }
  }
};

async function translate(text, langCode) {
  const res = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
    params: {
      client: "gtx",
      sl: "auto",
      tl: langCode,
      dt: "t",
      q: encodeURIComponent(text)
    }
  });
  return {
    text: res.data[0].map((item) => item[0]).join(""),
    lang: res.data[2]
  };
        }
        
