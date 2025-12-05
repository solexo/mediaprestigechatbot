const axios = require('axios');

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        res.status(403).end();
      }
    } else {
      res.status(400).end();
    }
  } else if (req.method === 'POST') {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from;
        const msg_body = message.text.body.toLowerCase();

        await handleMessage(from, msg_body);
      }
      res.status(200).end();
    } else {
      res.status(404).end();
    }
  } else {
    res.status(405).end();
  }
}

const handleMessage = async (from, msg) => {
  let response = '';

  if (msg.includes('bose')) {
    response = 'Bose offers premium sound systems for events. Popular products: Bose L1 Pro portable PA, Bose S1 Pro multi-purpose speaker. What would you like to know?';
  } else if (msg.includes('jbl')) {
    response = 'JBL provides powerful speakers for sound and events. Popular products: JBL PartyBox portable party speaker, JBL Go waterproof speaker. What would you like to know?';
  } else if (msg.includes('sound') || msg.includes('event')) {
    response = 'We have Bose and JBL products for sound and events. Type "bose" or "jbl" for more info.';
  } else {
    response = 'Hello! I\'m here to help with Bose and JBL products for sound and event. Ask about Bose or JBL!';
  }

  await sendMessage(from, response);
};

const sendMessage = async (to, text) => {
  const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
  const data = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: { body: text }
  };
  const headers = {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    await axios.post(url, data, { headers });
    console.log('Message sent');
  } catch (error) {
    console.error('Error sending message:', error.response.data);
  }
};