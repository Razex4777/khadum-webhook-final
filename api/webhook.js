// 🤖 KHADUM WEBHOOK - WITH MESSAGE HANDLING!

const VERIFY_TOKEN = 'khadum_webhook_verify_token_2024';
const WABA_TOKEN = 'EAATfgB4Y7dIBPCRRxSGRCGVvZB8Wzxme7m8fU9jHiZBF49SlWzf7hqcHgZB7w08dYrz2GW2mQSDB7kaCvRsqd2bZCB4j6hFkamkx33tF5tc4JTE7HpbcFknZCMZCctXQVw5wKZBvGdW4Va9NeILGn0rpY95XNE9HhSPeZB1fEvl0ZCNWLVA4wdFQZAfwyHnvKHfqiprgZDZD';
const PHONE_ID = '740099439185588';

async function sendMessage(to, text) {
  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WABA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: text }
      })
    });
    
    const result = await response.json();
    console.log('✅ Message sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    return null;
  }
}

module.exports = async (req, res) => {
  // Handle GET requests (webhook verification and status page)
  if (req.method === 'GET') {
    if (!req.query['hub.mode']) {
      return res.status(200).send(`
        <h1>✅ KHADUM WEBHOOK IS LIVE! 🤖</h1>
        <p>Verify URL: <code>?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=123</code></p>
        <p>Status: READY FOR META! 🚀</p>
        <p>Messages processed and bot responding! ✨</p>
      `);
    }
    
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified');
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // Handle POST requests (incoming messages)
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      console.log('📥 Received webhook:', JSON.stringify(body, null, 2));
      
      // Respond to Meta immediately
      res.status(200).send('OK');
      
      // Check if it's a WhatsApp message
      if (body.object !== 'whatsapp_business_account') {
        console.log('❌ Not a WhatsApp webhook');
        return;
      }
      
      // Process incoming messages
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;
      
      if (messages && messages.length > 0) {
        for (const message of messages) {
          const from = message.from;
          const messageId = message.id;
          const messageType = message.type;
          
          console.log(`📨 New message from ${from}: Type=${messageType}, ID=${messageId}`);
          
          if (messageType === 'text') {
            const messageText = message.text.body;
            console.log(`💬 Text message: "${messageText}"`);
            
            // Echo the message back with bot prefix
            const botReply = `🤖 Khadum Bot: مرحباً! تلقيت رسالتك: "${messageText}"
            
✨ أنا بوت خدوم، وسيطك الذكي لربطك بأفضل المستقلين!

كيف يمكنني مساعدتك اليوم؟`;
            
            await sendMessage(from, botReply);
          }
        }
      } else {
        console.log('📭 No messages in webhook');
      }
      
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
    }
    return;
  }

  res.status(405).send('Method Not Allowed');
};