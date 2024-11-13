const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');

const gothicFont = {
  A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱",
  S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹", 
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
  j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
  s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
  0: "𝟢", 1: "𝟣", 2: "𝟤", 3: "𝟥", 4: "𝟦", 5: "𝟧", 6: "𝟨", 7: "𝟩", 8: "𝟪", 9: "𝟫"
};

const convertToGothic = (text) => {
  return text.split('').map(char => gothicFont[char] || char).join('');
};

module.exports = {
  name: 'help',
  description: 'Show available commands',
  author: 'Jay Mar',
  execute(kupal, pogi, sili) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const commands = commandFiles.map((file) => {
      const command = require(path.join(commandsDir, file));
      if (command.name) {
        return {
          title: command.name,
          payload: `${command.name.toUpperCase()}_PAYLOAD`
        };
      }
      return null;
    }).filter(cmd => cmd !== null);

    const totalCommands = commands.length;
    const commandsPerPage = 5;
    const totalPages = Math.ceil(totalCommands / commandsPerPage);
    let page = parseInt(pogi[0], 10);

    if (isNaN(page) || page < 1) {
      page = 1;
    }

    if (pogi[0] && pogi[0].toLowerCase() === 'all') {
      const helpTextMessage = `${convertToGothic('╭─『 HERU CHATBOT 』')}\n` +
        commands.map(cmd => `${convertToGothic(`│✧ ${cmd.title}`)}`).join('\n') + `\n` +
        `${convertToGothic('╰───────────◊')}\n\n` +
        `${convertToGothic(`Dev: Jay Mar & YOU`)}`;

      return sendMessage(kupal, { text: helpTextMessage }, sili);
    }

    const startIndex = (page - 1) * commandsPerPage;
    const endIndex = startIndex + commandsPerPage;
    const commandsForPage = commands.slice(startIndex, endIndex);

    if (commandsForPage.length === 0) {
      return sendMessage(kupal, { text: convertToGothic(`Invalid page number. There are only ${totalPages} pages.`) }, sili);
    }

    const helpTextMessage = `${convertToGothic('╭─『 HERU CHATBOT 』')}\n` +
      commandsForPage.map(cmd => `${convertToGothic(`│✧ ${cmd.title}`)}`).join('\n') + `\n` +
      `${convertToGothic('╰───────────◊')}\n\n` +
      `${convertToGothic(`(Page ${page} of ${totalPages})`)}\n` +
      `${convertToGothic('Type !help <page number> to see more commands & To see all commands Type "help all" to see all Commands.')}\n\n` +
      `${convertToGothic('Dev: Jay Mar & YOU')}`;

    const quickRepliesPage = commandsForPage.map((cmd) => ({
      content_type: "text",
      title: cmd.title,
      payload: cmd.payload
    }));

    sendMessage(kupal, {
      text: helpTextMessage,
      quick_replies: quickRepliesPage
    }, sili);
  }
};
