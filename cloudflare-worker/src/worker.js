// Cloudflare Worker: WhatsApp webhook → Supabase JSONB history → Gemini → WhatsApp reply
// Free, instant responses (edge). Credentials are hardcoded as requested.

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		// Config copied from existing webhook.js
		const CONFIG = {
			whatsapp: {
				verify_token: 'khadum_webhook_verify_token_2024',
				access_token: 'EAATfgB4Y7dIBPCRRxSGRCGVvZB8Wzxme7m8fU9jHiZBF49SlWzf7hqcHgZB7w08dYrz2GW2mQSDB7kaCvRsqd2bZCB4j6hFkamkx33tF5tc4JTE7HpbcFknZCMZCctXQVw5wKZBvGdW4Va9NeILGn0rpY95XNE9HhSPeZB1fEvl0ZCNWLVA4wdFQZAfwyHnvKHfqiprgZDZD',
				phone_id: '740099439185588'
			},
			gemini: {
				api_key: 'AIzaSyCvR9UpA5fb2NE3hPXalClQECEl_K99J9Y'
			},
			supabase: {
				url: 'https://fegxpfdvrqywmwiobuer.supabase.co',
				anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZ3hwZmR2cnF5d213aW9idWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNTUzMDAsImV4cCI6MjA2OTgzMTMwMH0.xQSEBIWmZ0XmQCWv4x9NOWM0ViiN5EODzL4p_BeXCgQ'
			}
		};

		if (request.method === 'GET' || request.method === 'HEAD') {
			const mode = url.searchParams.get('hub.mode');
			const token = url.searchParams.get('hub.verify_token');
			const challenge = url.searchParams.get('hub.challenge');
			if (mode === 'subscribe' && token === CONFIG.whatsapp.verify_token) {
				return new Response(challenge || 'OK', { status: 200 });
			}
			return new Response(
				`<h1>KHADUM BOT • Cloudflare Worker</h1>
				<p>✅ Edge runtime • instant responses</p>
				<p>Use: ?hub.mode=subscribe&hub.verify_token=${CONFIG.whatsapp.verify_token}&hub.challenge=123</p>`,
				{ status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
			);
		}

		if (request.method === 'POST') {
			// Respond immediately, process in background
			const clone = request.clone();
			ctx.waitUntil(handlePost(clone, CONFIG));
			return new Response('OK', { status: 200 });
		}

		return new Response('Method Not Allowed', { status: 405 });
	}
};

async function handlePost(request, CONFIG) {
	try {
		const body = await request.json();
		console.log('Webhook body:', JSON.stringify(body));

		if (body.object !== 'whatsapp_business_account') return;

		const entry = body.entry?.[0];
		const change = entry?.changes?.[0];
		const value = change?.value;
		const messages = value?.messages;
		const contacts = value?.contacts;
		if (!messages || messages.length === 0) return;

		for (const message of messages) {
			const from = message.from;
			const contact = contacts?.find(c => c.wa_id === from);
			const name = contact?.profile?.name || 'عميل';

			let content = '';
			if (message.type === 'text') content = message.text?.body || '';
			else if (message.type === 'interactive') {
				if (message.interactive?.button_reply) content = message.interactive.button_reply.title;
				else if (message.interactive?.list_reply) content = message.interactive.list_reply.title;
			}
			if (!content) continue;

			// Mark as read and show typing indicator
			try {
				await sendTypingIndicator(CONFIG, message.id);
				console.log(`typing indicator sent for ${from} (${message.id})`);
			} catch (e) {
				console.warn('typing indicator failed', e);
			}

			// Load conversation (last 20)
			let conversation = await getChatHistory(CONFIG, from);
			conversation = Array.isArray(conversation) ? conversation : [];
			conversation.push({ role: 'user', content, timestamp: new Date().toISOString() });
			if (conversation.length > 20) conversation = conversation.slice(-20);

			// Build prompt
			const system = 'أنت "خدوم"، مساعد ودود وذكي يتحدث العربية بطلاقة، يساعد العملاء في وصف احتياجاتهم وخدمات المنصة.';
			const recent = conversation.slice(-6).map(m => `${m.role === 'user' ? 'المستخدم' : 'خدوم'}: ${m.content}`).join('\n');
			const prompt = `${system}\n\nاسم المستخدم: ${name}\nرقم الهاتف: ${from}\n\nالمحادثة الحديثة:\n${recent}\n\nالرسالة الحالية: ${content}`;

			console.log(`generating AI for ${from}...`);
			const ai = await generateWithGemini(CONFIG.gemini.api_key, prompt);
			const aiText = (ai || '').trim() || 'عذراً، حدث خطأ مؤقت.';

			// Save back
			conversation.push({ role: 'assistant', content: aiText, timestamp: new Date().toISOString() });
			await saveChatHistory(CONFIG, from, name, conversation);

			// Send WhatsApp reply
			await sendWhatsapp(CONFIG, from, aiText);
			console.log(`reply sent to ${from}`);
		}
	} catch (err) {
		console.error('handlePost error:', err);
	}
}

async function generateWithGemini(apiKey, prompt) {
	const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
	const res = await fetch(`${endpoint}?key=${apiKey}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
			generationConfig: { temperature: 0.8, topK: 20, topP: 0.9, maxOutputTokens: 400 }
		})
	});
	if (!res.ok) {
		console.error('Gemini HTTP error', res.status);
		return '';
	}
	const data = await res.json();
	return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function getChatHistory(CONFIG, phone) {
	const url = `${CONFIG.supabase.url}/rest/v1/chat_history?whatsapp_phone=eq.${phone}&select=conversation`;
	const res = await fetch(url, {
		headers: {
			apikey: CONFIG.supabase.anon_key,
			Authorization: `Bearer ${CONFIG.supabase.anon_key}`
		}
	});
	if (!res.ok) return [];
	const arr = await res.json();
	return arr?.[0]?.conversation || [];
}

async function saveChatHistory(CONFIG, phone, username, conversation) {
	const url = `${CONFIG.supabase.url}/rest/v1/chat_history?on_conflict=whatsapp_phone`;
	await fetch(url, {
		method: 'POST',
		headers: {
			apikey: CONFIG.supabase.anon_key,
			Authorization: `Bearer ${CONFIG.supabase.anon_key}`,
			'Content-Type': 'application/json',
			Prefer: 'resolution=merge-duplicates'
		},
		body: JSON.stringify({
			user_id: phone,
			whatsapp_username: username,
			whatsapp_phone: phone,
			conversation
		})
	});
}

async function sendWhatsapp(CONFIG, to, text) {
	const url = `https://graph.facebook.com/v19.0/${CONFIG.whatsapp.phone_id}/messages`;
	await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${CONFIG.whatsapp.access_token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			messaging_product: 'whatsapp',
			to,
			type: 'text',
			text: { body: text }
		})
	});
}

async function sendTypingIndicator(CONFIG, messageId) {
	const url = `https://graph.facebook.com/v19.0/${CONFIG.whatsapp.phone_id}/messages`;
	const payload = {
		messaging_product: 'whatsapp',
		status: 'read',
		message_id: messageId,
		typing_indicator: { type: 'text' }
	};
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${CONFIG.whatsapp.access_token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});
	if (!res.ok) {
		const err = await res.text();
		console.error('typing indicator http error', res.status, err);
	}
}
