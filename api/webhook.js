// 🤖 KHADUM WEBHOOK - FINALLY WORKING!

const VERIFY_TOKEN = 'khadum_webhook_verify_token_2024';
const WABA_TOKEN = 'EAATfgB4Y7dIBPCRRxSGRCGVvZB8Wzxme7m8fU9jHiZBF49SlWzf7hqcHgZB7w08dYrz2GW2mQSDB7kaCvRsqd2bZCB4j6hFkamkx33tF5tc4JTE7HpbcFknZCMZCctXQVw5wKZBvGdW4Va9NeILGn0rpY95XNE9HhSPeZB1fEvl0ZCNWLVA4wdFQZAfwyHnvKHfqiprgZDZD';
const PHONE_ID = '740099439185588';

module.exports = async (req, res) => {
  if (req.method === 'GET' && !req.query['hub.mode']) {
    return res.status(200).send(`
      <h1>✅ KHADUM WEBHOOK IS LIVE! 🤖</h1>
      <p>Verify URL: <code>?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=123</code></p>
      <p>Status: READY FOR META! 🚀</p>
    `);
  }
  
  if (req.method === 'GET') {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    res.status(200).send('OK');
    return;
  }

  res.status(405).send('Method Not Allowed');
};