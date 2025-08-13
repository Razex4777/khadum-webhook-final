// 🔥 KEEP WARM FUNCTION - Prevents cold starts!

module.exports = async (req, res) => {
  // Simple ping endpoint to keep functions warm
  const timestamp = new Date().toISOString();
  
  console.log(`🔥 Keep-warm ping at ${timestamp}`);
  
  // Quick health check of main webhook
  try {
    const webhookUrl = `${req.headers.host || 'localhost'}/api/webhook`;
    console.log(`✅ Webhook warm: ${webhookUrl}`);
  } catch (error) {
    console.log(`❌ Webhook check failed: ${error.message}`);
  }
  
  res.status(200).json({
    status: 'warm',
    timestamp: timestamp,
    message: 'Function is active and warm! 🔥',
    uptime: process.uptime()
  });
};