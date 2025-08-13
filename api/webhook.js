// 🤖 KHADUM AI WEBHOOK - Human-like conversations with Gemini!

const { GoogleGenAI } = require('@google/genai');
const { GEMINI_CONFIG } = require('./gemini-config');

const VERIFY_TOKEN = 'khadum_webhook_verify_token_2024';
const WABA_TOKEN = 'EAATfgB4Y7dIBPCRRxSGRCGVvZB8Wzxme7m8fU9jHiZBF49SlWzf7hqcHgZB7w08dYrz2GW2mQSDB7kaCvRsqd2bZCB4j6hFkamkx33tF5tc4JTE7HpbcFknZCMZCctXQVw5wKZBvGdW4Va9NeILGn0rpY95XNE9HhSPeZB1fEvl0ZCNWLVA4wdFQZAfwyHnvKHfqiprgZDZD';
const PHONE_ID = '740099439185588';
const GEMINI_API_KEY = 'AIzaSyCvR9UpA5fb2NE3hPXalClQECEl_K99J9Y';

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// Enhanced session storage with conversation history
let userSessions = new Map();

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

async function sendButtonMessage(to, text, buttons) {
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
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: text },
          action: {
            buttons: buttons.map(btn => ({
              type: 'reply',
              reply: { id: btn.id, title: btn.title }
            }))
          }
        }
      })
    });
    
    const result = await response.json();
    console.log('✅ Button message sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending button message:', error);
    return null;
  }
}

// 🧠 AI-powered conversation handler with Gemini
async function handleAIConversation(from, content, name) {
  console.log(`🤖 AI processing for ${from}: "${content}"`);
  
  try {
    // Get or create user session with conversation history
    let session = userSessions.get(from) || {
      conversationHistory: [],
      projectData: {},
      lastMessage: Date.now()
    };
    
    // Add user message to conversation history
    session.conversationHistory.push({
      role: 'user',
      parts: [{ text: content }],
      timestamp: Date.now()
    });
    
    // Build conversation context for Gemini
    const conversationContext = [
      // Add user info context
      {
        role: 'user',
        parts: [{
          text: `اسمي: ${name || 'غير معروف'}\nرقم الهاتف: ${from}\n\nالرسالة: ${content}`
        }]
      }
    ];
    
    // Add conversation history if exists
    if (session.conversationHistory.length > 1) {
      // Include last 10 messages for context
      const recentHistory = session.conversationHistory.slice(-10);
      conversationContext.unshift(...recentHistory.slice(0, -1)); // Exclude current message
    }
    
    // Generate AI response with Gemini
    const response = await ai.models.generateContentStream({
      model: GEMINI_CONFIG.model,
      config: GEMINI_CONFIG.config,
      contents: conversationContext,
    });
    
    let aiResponse = '';
    for await (const chunk of response) {
      if (chunk.text) {
        aiResponse += chunk.text;
      }
    }
    
    // Clean up response
    aiResponse = aiResponse.trim();
    
    if (!aiResponse) {
      aiResponse = 'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى 🤖';
    }
    
    // Add AI response to conversation history
    session.conversationHistory.push({
      role: 'model',
      parts: [{ text: aiResponse }],
      timestamp: Date.now()
    });
    
    // Keep only last 20 messages to prevent memory overflow
    if (session.conversationHistory.length > 20) {
      session.conversationHistory = session.conversationHistory.slice(-20);
    }
    
    // Update session
    session.lastMessage = Date.now();
    userSessions.set(from, session);
    
    // Send AI response
    await sendMessage(from, aiResponse);
    
    console.log(`✅ AI Response sent to ${from}`);
    
  } catch (error) {
    console.error('❌ Error in AI conversation:', error);
    
    // Fallback response
    const fallbackResponse = `مرحباً ${name || 'بك'}! أنا خدوم، مساعدك الذكي في منصة خدوم 🤖\n\nأعتذر، أواجه مشكلة تقنية بسيطة. كيف يمكنني مساعدتك اليوم؟\n\n• أحتاج مصمم جرافيك\n• أبي مطور مواقع\n• مطلوب كاتب محتوى`;
    
    await sendMessage(from, fallbackResponse);
  }
}

module.exports = async (req, res) => {
  // Handle GET requests (webhook verification and status page)
  if (req.method === 'GET') {
    if (!req.query['hub.mode']) {
      return res.status(200).send(`
        <h1>🤖 KHADUM AI WEBHOOK IS LIVE!</h1>
        <p>✅ Powered by Google Gemini AI</p>
        <p>🧠 Human-like conversations</p>
        <p>🚀 Ready for intelligent WhatsApp conversations!</p>
        <p>Verify URL: <code>?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=123</code></p>
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
      const contacts = value?.contacts;
      
      if (messages && messages.length > 0) {
        for (const message of messages) {
          const from = message.from;
          const messageId = message.id;
          const messageType = message.type;
          
          // Get sender name
          const contact = contacts?.find(c => c.wa_id === from);
          const senderName = contact?.profile?.name;
          
          console.log(`📨 New message from ${from} (${senderName}): Type=${messageType}`);
          
          let messageContent = '';
          
          if (messageType === 'text') {
            messageContent = message.text.body;
          } else if (messageType === 'interactive') {
            // Handle button/list replies
            if (message.interactive.button_reply) {
              messageContent = message.interactive.button_reply.title;
            } else if (message.interactive.list_reply) {
              messageContent = message.interactive.list_reply.title;
            }
          }
          
          if (messageContent) {
            console.log(`💬 Processing: "${messageContent}"`);
            await handleAIConversation(from, messageContent, senderName);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
    }
    return;
  }

  res.status(405).send('Method Not Allowed');
};