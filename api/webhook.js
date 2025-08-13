// 🤖 KHADUM AI WEBHOOK - Human-like conversations with Gemini!

const { GoogleGenAI } = require('@google/genai');
const { GEMINI_CONFIG } = require('./gemini-config');
const { createClient } = require('@supabase/supabase-js');

// 🔧 Configuration - All credentials in one place (no .env files!)
const CONFIG = {
  whatsapp: {
    verify_token: 'khadum_webhook_verify_token_2024',
    access_token: 'EAATfgB4Y7dIBPCRRxSGRCGVvZB8Wzxme7m8fU9jHiZBF49SlWzf7hqcHgZB7w08dYrz2GW2mQSDB7kaCvRsqd2bZCB4j6hFkamkx33tF5tc4JTE7HpbcFknZCMZCctXQVw5wKZBvGdW4Va9NeILGn0rpY95XNE9HhSPeZB1fEvl0ZCNWLVA4wdFQZAfwyHnvKHfqiprgZDZD',
    phone_id: '740099439185588'
  },
  gemini: {
    api_key: 'AIzaSyCvR9UpA5fb2NE3hPXalClQECEl_K99J9Y',
    timeout: 8000
  },
  supabase: {
    url: 'https://fegxpfdvrqywmwiobuer.supabase.co',
    anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZ3hwZmR2cnF5d213aW9idWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI3MjE3MDAsImV4cCI6MjAzODI5NzcwMH0.OoK3DYCNHVOOIzRCXkxJTSgfUlmO_MJNadAKFHZPMVY'
  },
  app: {
    name: 'Khadum AI Webhook',
    version: '1.0.0'
  }
};

// Extract values for easy access
const VERIFY_TOKEN = CONFIG.whatsapp.verify_token;
const WABA_TOKEN = CONFIG.whatsapp.access_token;
const PHONE_ID = CONFIG.whatsapp.phone_id;
const GEMINI_API_KEY = CONFIG.gemini.api_key;

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// Initialize Supabase
const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.anon_key);

// Self-warming mechanism (no cron needed!)
let lastActivity = Date.now();
setInterval(() => {
  const now = Date.now();
  if (now - lastActivity > 240000) { // 4 minutes of inactivity
    console.log('🔥 Self-warming function...');
    lastActivity = now;
  }
}, 60000); // Check every minute

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

// 🧠 Database functions for chat history
async function getChatHistory(phone) {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('whatsapp_phone', phone)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error getting chat history:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getChatHistory:', error);
    return null;
  }
}

async function saveChatHistory(phone, username, conversation) {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .upsert({
        user_id: phone, // Using phone as user_id for simplicity
        whatsapp_username: username,
        whatsapp_phone: phone,
        conversation: conversation
      }, {
        onConflict: 'whatsapp_phone'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving chat history:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveChatHistory:', error);
    return false;
  }
}

// 🧠 AI-powered conversation handler with Gemini (PURE AI - NO KEYWORDS!)
async function handleAIConversation(from, content, name) {
  console.log(`🤖 AI processing for ${from}: "${content}"`);
  
  try {
    // Get conversation history from database
    const chatData = await getChatHistory(from);
    let conversation = chatData?.conversation || [];
    
    // Add user message to conversation
    const userMessage = {
      role: 'user',
      content: content,
      timestamp: new Date().toISOString()
    };
    conversation.push(userMessage);
    
    // Keep only last 20 messages
    if (conversation.length > 20) {
      conversation = conversation.slice(-20);
    }
    
    // Build conversation context for Gemini
    const recentHistory = conversation.slice(-6).map(msg => {
      return `${msg.role === 'user' ? 'المستخدم' : 'خدوم'}: ${msg.content}`;
    }).join('\n');
    
    const fullPrompt = `${require('./gemini-config').KHADUM_SYSTEM_PROMPT}\n\nاسم المستخدم: ${name || 'عميل'}\nرقم الهاتف: ${from}\n\nالمحادثة الحديثة:\n${recentHistory}\n\nالرسالة الحالية: ${content}`;
    
    // Generate AI response with Gemini (PURE AI ONLY!)
    console.log(`🤖 Calling Gemini API for ${from}...`);
    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: fullPrompt,
        config: {
          generationConfig: {
            temperature: 0.8,
            topK: 20,
            topP: 0.9,
            maxOutputTokens: 400,
          }
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API Timeout')), 12000) // 12 seconds
      )
    ]);
    
    console.log(`✅ Gemini API responded for ${from}`);
    
    let aiResponse = response.text || '';
    aiResponse = aiResponse.trim();
    
    // Only fallback if completely empty (no keywords!)
    if (!aiResponse) {
      aiResponse = 'أعتذر، لم أتمكن من معالجة رسالتك حالياً. يرجى المحاولة مرة أخرى.';
    }
    
    // Add AI response to conversation
    const aiMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };
    conversation.push(aiMessage);
    
    // Save updated conversation to database
    await saveChatHistory(from, name, conversation);
    
    // Send AI response
    console.log(`📤 Sending AI response to ${from}: "${aiResponse.substring(0, 50)}..."`);
    await sendMessage(from, aiResponse);
    
    console.log(`✅ AI Response sent to ${from}`);
    
  } catch (error) {
    console.error('❌ Error in AI conversation:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      from: from,
      content: content
    });

    // MINIMAL fallback - no keywords, just error message
    const errorResponse = 'أعتذر، حدث خطأ تقني. يرجى المحاولة مرة أخرى خلال دقيقة.';
    
    try {
      await sendMessage(from, errorResponse);
      console.log(`✅ Error response sent to ${from}`);
    } catch (sendError) {
      console.error('❌ Failed to send error message:', sendError);
    }
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
        <p>⚡ Speed optimized - 12 second timeout</p>
        <p>🔧 No .env files - All config in code</p>
        <p>🔥 Self-warming enabled (no cron needed)</p>
        <p>💾 Supabase chat history enabled</p>
        <p>🧠 Pure AI responses - no keywords!</p>
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
      // Update activity tracker
      lastActivity = Date.now();
      
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