# 🤖 Khadum AI Webhook - Human-like WhatsApp Bot

Intelligent WhatsApp webhook powered by **Google Gemini AI** for natural, human-like conversations on the Khadum freelancer platform.

## ✨ Features

- 🧠 **Google Gemini AI** - Human-like conversations
- 🎯 **Khadum-trained** - Specialized for freelancer platform
- 💬 **Arabic & English** - Bilingual support
- 📱 **WhatsApp Business API** - Official integration
- 🔄 **Conversation Memory** - Maintains context
- ⚡ **Serverless** - Deployed on Vercel

## 🚀 Quick Setup

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy the key

### 2. Update Credentials
Edit `api/webhook.js` and replace:
```javascript
const GEMINI_API_KEY = 'YOUR_ACTUAL_GEMINI_API_KEY_HERE';
```

### 3. Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### 4. Configure Meta Webhook
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Select your WhatsApp app
3. Set webhook URL: `https://your-vercel-url.vercel.app/api/webhook`
4. Set verify token: `khadum_webhook_verify_token_2024`

## 🧠 AI Personality

The bot is trained as **"خدوم"** with this personality:
- Friendly Saudi assistant
- Specialized in freelancer services
- Collects project requirements naturally
- Speaks Arabic with modern touch
- Professional yet approachable

## 💼 Supported Services

- 🎨 **Design** - Graphics, logos, branding
- 💻 **Development** - Websites, apps, systems  
- ✍️ **Content** - Writing, marketing, translation
- 📱 **Digital Marketing** - Social media, ads, SEO
- 🎬 **Media** - Video editing, animation
- 📊 **Consulting** - Business, financial, legal

## 🗣️ Conversation Examples

**User:** مرحبا
**Bot:** مرحباً بك في خدوم! أنا خدوم، مساعدك الذكي لربطك بأفضل المستقلين في المملكة 🤖

**User:** أحتاج مصمم لوجو
**Bot:** ممتاز! أفهم أنك تحتاج تصميم لوجو. حدثني أكثر عن مشروعك - ما نوع النشاط؟ وما الألوان المفضلة؟

## 🔧 Technical Details

### File Structure
```
khadum-webhook-final/
├── api/
│   ├── webhook.js          # Main webhook handler
│   ├── gemini-config.js    # AI configuration
│   └── health.js          # Health check
├── package.json           # Dependencies
└── README.md             # This file
```

### Key Dependencies
- `@google/genai` - Gemini AI SDK
- `mime` - File type detection

### Environment Variables
```bash
GEMINI_API_KEY=your_gemini_key
WABA_TOKEN=your_whatsapp_token
PHONE_ID=your_phone_number_id
VERIFY_TOKEN=khadum_webhook_verify_token_2024
```

## 🧪 Testing

### Test Webhook
```bash
curl https://your-vercel-url.vercel.app/api/webhook
```

### Test Health
```bash
curl https://your-vercel-url.vercel.app/api/health
```

### Test WhatsApp
Send a message to your WhatsApp Business number:
- "مرحبا" (Hello)
- "أحتاج مصمم" (I need a designer)

## 📊 Conversation Flow

1. **Greeting** - Warm welcome and introduction
2. **Service Detection** - Understand what user needs
3. **Requirement Gathering** - Collect project details naturally
4. **Budget Discussion** - Get budget expectations
5. **Timeline Planning** - Understand deadlines
6. **Project Summary** - Confirm all details
7. **Freelancer Matching** - Connect with suitable freelancers

## 🔐 Security Features

- Token verification for webhooks
- Conversation history management  
- Rate limiting protection
- Secure API key handling

## 🚀 Deployment

This webhook is designed for **Vercel** serverless deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Your webhook URL will be:
# https://your-project.vercel.app/api/webhook
```

## 📞 Support

For technical issues:
1. Check Vercel function logs
2. Verify Gemini API key
3. Confirm Meta webhook configuration
4. Test with health endpoint

---

🎯 **Built for Khadum - Connecting Clients with Saudi Freelancers** 🇸🇦