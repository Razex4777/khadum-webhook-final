// 🚀 RAILWAY OPTIMIZED SERVER - INSTANT RESPONSES!
const express = require('express');
const webhookHandler = require('./api/webhook.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'alive', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    platform: 'Railway - INSTANT RESPONSES!' 
  });
});

// Main webhook endpoint - handles all requests
app.all('/api/webhook', webhookHandler);
app.all('/webhook', webhookHandler); // Alternative path

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <h1>🚀 KHADUM BOT - RAILWAY POWERED!</h1>
    <p>✅ INSTANT responses - No cold starts!</p>
    <p>⚡ Always-on container</p>
    <p>🔥 Sub-second message processing</p>
    <p>💾 Supabase chat history</p>
    <p>🤖 Pure Gemini AI responses</p>
    <hr>
    <p><strong>Webhook URL:</strong> <code>${req.protocol}://${req.get('host')}/api/webhook</code></p>
    <p><strong>Health:</strong> <a href="/health">Check Status</a></p>
  `);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Khadum Bot Server running on Railway!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`⚡ INSTANT responses enabled!`);
  console.log(`🔗 Webhook: /api/webhook`);
});

// Keep alive mechanism
setInterval(() => {
  console.log('🔥 Server is alive and warm!');
}, 30000); // Every 30 seconds