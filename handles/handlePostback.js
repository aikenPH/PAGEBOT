const { sendMessage } = require('./sendMessage');

const api = {
  graph: function(options) {
    console.log("Graph API called with options:", options);
  },
  sendMessage: sendMessage
};

api.graph({
  get_started: { payload: "GET_STARTED_PAYLOAD" }
});

function handlePayload(payload, senderID) {
  if (payload === "GET_STARTED_PAYLOAD") {
    api.sendMessage("Welcome! I'm here to help you.", senderID);
    api.sendMessage("Type 'help' to see what I can do.", senderID);
  }
}

function handlePostback(event, pageAccessToken) {
  const senderId = event.sender.id;
  const payload = event.postback.payload;

  if (payload) {
    handlePayload(payload, senderId);
  }
}

module.exports = { handlePostback };
