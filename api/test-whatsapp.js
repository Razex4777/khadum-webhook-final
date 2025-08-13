// 🧪 TEST WHATSAPP API - Simple test endpoint

const CONFIG = {
  whatsapp: {
    access_token: 'EAATfgB4Y7dIBPCRRxSGRCGVvZB8Wzxme7m8fU9jHiZBF49SlWzf7hqcHgZB7w08dYrz2GW2mQSDB7kaCvRsqd2bZCB4j6hFkamkx33tF5tc4JTE7HpbcFknZCMZCctXQVw5wKZBvGdW4Va9NeILGn0rpY95XNE9HhSPeZB1fEvl0ZCNWLVA4wdFQZAfwyHnvKHfqiprgZDZD',
    phone_id: '740099439185588'
  }
};

async function testWhatsAppAPI(to) {
  try {
    const testMessage = `🧪 TEST MESSAGE FROM KHADUM BOT\nTime: ${new Date().toISOString()}\n\nIf you see this, the WhatsApp API is working! 🎉`;
    
    console.log('🧪 Testing WhatsApp API...');
    console.log('📱 Sending to:', to);
    console.log('📝 Message:', testMessage);
    
    const response = await fetch(`https://graph.facebook.com/v19.0/${CONFIG.whatsapp.phone_id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.whatsapp.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: testMessage }
      })
    });
    
    const result = await response.json();
    console.log('✅ WhatsApp API Response:', result);
    
    if (response.ok) {
      return { success: true, result };
    } else {
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('❌ WhatsApp API Error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = async (req, res) => {
  const { to } = req.query;
  
  if (!to) {
    return res.status(400).json({
      error: 'Missing "to" parameter. Usage: /api/test-whatsapp?to=213672661102'
    });
  }
  
  const result = await testWhatsAppAPI(to);
  
  res.json({
    timestamp: new Date().toISOString(),
    test: 'WhatsApp API',
    phoneNumber: to,
    ...result
  });
};
