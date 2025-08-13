// 🚀 FREE LOCAL WHATSAPP BOT - INSTANT RESPONSES!
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

// 🔧 Configuration (same as your webhook)
const CONFIG = {
  gemini: {
    api_key: 'AIzaSyCvR9UpA5fb2NE3hPXalClQECEl_K99J9Y',
  },
  supabase: {
    url: 'https://fegxpfdvrqywmwiobuer.supabase.co',
    anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZ3hwZmR2cnF5d213aW9idWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNTUzMDAsImV4cCI6MjA2OTgzMTMwMH0.xQSEBIWmZ0XmQCWv4x9NOWM0ViiN5EODzL4p_BeXCgQ'
  }
};

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(CONFIG.gemini.api_key);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-001',
  systemInstruction: require('./api/gemini-config').KHADUM_SYSTEM_PROMPT,
});

// Initialize Supabase
const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.anon_key);

// Initialize WhatsApp client with local session
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

console.log('🚀 Starting Khadum WhatsApp Bot...');

// QR Code for first time setup
client.on('qr', (qr) => {
  console.log('📱 Scan this QR code with your WhatsApp:');
  qrcode.generate(qr, { small: true });
});

// Bot ready
client.on('ready', () => {
  console.log('✅ Khadum Bot is READY and CONNECTED!');
  console.log('🔥 INSTANT responses enabled - no cold starts!');
  console.log('💾 Supabase chat history active');
  console.log('🤖 Pure Gemini AI responses');
});

// Handle disconnection
client.on('disconnected', (reason) => {
  console.log('❌ Client disconnected:', reason);
});

// 🧠 Database functions (same as webhook)
async function getChatHistory(phone) {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('whatsapp_phone', phone)
      .single();
    
    if (error && error.code !== 'PGRST116') {
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
        user_id: phone,
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

// 🤖 AI conversation handler (INSTANT - NO DELAYS!)
async function handleAIConversation(from, content, name) {
  console.log(`🤖 Processing message from ${from} (${name}): "${content}"`);
  
  try {
    // Get conversation history from database
    const chatData = await getChatHistory(from);
    let conversation = chatData?.conversation || [];
    
    // Add user message
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
    
    // Build conversation context
    const recentHistory = conversation.slice(-6).map(msg => {
      return `${msg.role === 'user' ? 'المستخدم' : 'خدوم'}: ${msg.content}`;
    }).join('\n');
    
    const fullPrompt = `${require('./api/gemini-config').KHADUM_SYSTEM_PROMPT}\n\nاسم المستخدم: ${name || 'عميل'}\nرقم الهاتف: ${from}\n\nالمحادثة الحديثة:\n${recentHistory}\n\nالرسالة الحالية: ${content}`;
    
    // Generate AI response (INSTANT!)
    console.log(`⚡ Calling Gemini API...`);
    const result = await model.generateContent(fullPrompt);
    const aiResponse = result.response.text().trim();
    
    console.log(`✅ AI Response: "${aiResponse.substring(0, 50)}..."`);
    
    // Add AI response to conversation
    const aiMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };
    conversation.push(aiMessage);
    
    // Save to database
    await saveChatHistory(from, name, conversation);
    
    return aiResponse;
    
  } catch (error) {
    console.error('❌ Error in AI conversation:', error);
    return 'أعتذر، حدث خطأ تقني. يرجى المحاولة مرة أخرى.';
  }
}

// 📨 Message handler
client.on('message', async (message) => {
  // Skip status messages and groups
  if (message.isStatus || message.from.includes('@g.us')) {
    return;
  }
  
  const from = message.from.replace('@c.us', '');
  const content = message.body.trim();
  
  // Skip empty messages
  if (!content) {
    return;
  }
  
  // Get contact info
  const contact = await message.getContact();
  const name = contact.pushname || contact.name || 'عميل';
  
  console.log(`📱 New message from ${name} (${from}): ${content}`);
  
  try {
    // Get AI response
    const response = await handleAIConversation(from, content, name);
    
    // Send response INSTANTLY
    await message.reply(response);
    console.log(`✅ Response sent to ${name}`);
    
  } catch (error) {
    console.error('❌ Error handling message:', error);
    await message.reply('أعتذر، حدث خطأ تقني. يرجى المحاولة مرة أخرى.');
  }
});

// Start the client
client.initialize();