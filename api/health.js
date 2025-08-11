module.exports = (_req, res) => {
  res.status(200).json({ ok: true, service: 'khadum-webhook', status: 'LIVE' });
};