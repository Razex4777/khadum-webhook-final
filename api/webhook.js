// 🤖 KHADUM SMART WEBHOOK - Enhanced with Backend Logic!

const VERIFY_TOKEN = 'khadum_webhook_verify_token_2024';
const WABA_TOKEN = 'EAATfgB4Y7dIBPCRRxSGRCGVvZB8Wzxme7m8fU9jHiZBF49SlWzf7hqcHgZB7w08dYrz2GW2mQSDB7kaCvRsqd2bZCB4j6hFkamkx33tF5tc4JTE7HpbcFknZCMZCctXQVw5wKZBvGdW4Va9NeILGn0rpY95XNE9HhSPeZB1fEvl0ZCNWLVA4wdFQZAfwyHnvKHfqiprgZDZD';
const PHONE_ID = '740099439185588';

// In-memory session storage (for demo - use database in production)
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

// Smart conversation handler inspired by your backend
async function handleSmartConversation(from, content, name) {
  console.log(`🧠 Smart processing for ${from}: "${content}"`);
  
  // Get or create user session
  let session = userSessions.get(from) || {
    state: 'initial',
    data: {},
    lastMessage: Date.now()
  };
  
  const message = content.toLowerCase();
  let response = '';
  let buttons = null;
  
  // Smart conversation flow based on your backend logic
  if (session.state === 'initial') {
    // Greeting detection
    if (message.includes('مرحبا') || message.includes('السلام') || message.includes('أهلا') || 
        message.includes('hello') || message.includes('hi')) {
      response = `مرحباً ${name || 'بك'} في خدوم! 🤖

✨ أنا وسيطك الذكي لربطك بأفضل المستقلين في المملكة

كيف يمكنني مساعدتك اليوم؟`;
      
      buttons = [
        { id: 'need_service', title: '🎯 أحتاج خدمة' },
        { id: 'join_freelancer', title: '💼 انضمام كمستقل' },
        { id: 'help', title: '❓ مساعدة' }
      ];
      
    } else if (message.includes('أبي') || message.includes('أحتاج') || message.includes('مطلوب') || 
               message.includes('أريد')) {
      // Service request detected
      session.state = 'asking_service_type';
      response = `ممتاز! أفهم أنك تحتاج خدمة مستقل.

ما نوع الخدمة التي تحتاجها؟`;
      
      buttons = [
        { id: 'design', title: '🎨 تصميم جرافيك' },
        { id: 'programming', title: '💻 برمجة وتطوير' },
        { id: 'writing', title: '✍️ كتابة ومحتوى' }
      ];
      
    } else {
      // Default welcome
      response = `أهلاً وسهلاً بك في خدوم! 👋

🤖 أنا بوت ذكي يساعدك في العثور على أفضل المستقلين

يمكنك أن تقول:
• "أحتاج مصمم جرافيك"
• "أبي مطور تطبيقات"
• "مطلوب كاتب محتوى"`;
    }
    
  } else if (session.state === 'asking_service_type') {
    // Handle service type selection
    let serviceType = '';
    if (message.includes('تصميم') || message.includes('design')) {
      serviceType = 'تصميم جرافيك';
    } else if (message.includes('برمجة') || message.includes('تطوير') || message.includes('programming')) {
      serviceType = 'برمجة وتطوير';
    } else if (message.includes('كتابة') || message.includes('محتوى') || message.includes('writing')) {
      serviceType = 'كتابة ومحتوى';
    }
    
    if (serviceType) {
      session.data.serviceType = serviceType;
      session.state = 'asking_budget';
      
      response = `رائع! اخترت: ${serviceType} ✅

ما هي ميزانيتك المتوقعة لهذا المشروع؟

مثال:
• 500 ريال
• 1000 ريال  
• 2500 ريال`;
      
    } else {
      response = `يرجى اختيار نوع الخدمة من الخيارات المتاحة:`;
      buttons = [
        { id: 'design', title: '🎨 تصميم جرافيك' },
        { id: 'programming', title: '💻 برمجة وتطوير' },
        { id: 'writing', title: '✍️ كتابة ومحتوى' }
      ];
    }
    
  } else if (session.state === 'asking_budget') {
    // Extract budget from message
    const budgetMatch = content.match(/(\d+)/);
    if (budgetMatch) {
      const budget = parseInt(budgetMatch[1]);
      session.data.budget = budget;
      session.state = 'asking_timeline';
      
      response = `الميزانية: ${budget} ريال ✅

كم المدة الزمنية المطلوبة لإنجاز المشروع؟

مثال:
• 3 أيام
• أسبوع واحد
• أسبوعين`;
      
    } else {
      response = `يرجى إدخال رقم الميزانية بوضوح.

مثال: 500 ريال أو 1000 ريال`;
    }
    
  } else if (session.state === 'asking_timeline') {
    session.data.timeline = content;
    session.state = 'asking_description';
    
    response = `المدة الزمنية: ${content} ✅

الآن، يرجى وصف المشروع بالتفصيل:

مثال: "أحتاج تصميم لوجو لمطعم، الألوان المفضلة أزرق وذهبي، الاسم: مطعم الأصالة، النمط عصري"`;
    
  } else if (session.state === 'asking_description') {
    session.data.description = content;
    session.state = 'project_summary';
    
    response = `📋 ملخص مشروعك:

🔸 الخدمة: ${session.data.serviceType}
🔸 الميزانية: ${session.data.budget} ريال
🔸 المدة: ${session.data.timeline}
🔸 الوصف: ${session.data.description}

🚀 سيتم الآن البحث عن أفضل المستقلين المناسبين لمشروعك وسنتواصل معك قريباً!

شكراً لاستخدامك منصة خدوم ✨`;
    
    // Reset session for new conversation
    session.state = 'initial';
    session.data = {};
  }
  
  // Update session
  session.lastMessage = Date.now();
  userSessions.set(from, session);
  
  // Send response
  if (buttons) {
    await sendButtonMessage(from, response, buttons);
  } else {
    await sendMessage(from, response);
  }
}

module.exports = async (req, res) => {
  // Handle GET requests (webhook verification and status page)
  if (req.method === 'GET') {
    if (!req.query['hub.mode']) {
      return res.status(200).send(`
        <h1>🤖 KHADUM SMART WEBHOOK IS LIVE!</h1>
        <p>✅ Enhanced with intelligent conversation flow</p>
        <p>🧠 State management and button interactions</p>
        <p>🚀 Ready for smart WhatsApp conversations!</p>
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
            await handleSmartConversation(from, messageContent, senderName);
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