function requireAuth(req, res, next) {
  const key = process.env.CMS_API_KEY;
  if (!key) return next();

  const auth = req.headers.authorization || '';
  if (auth === `Bearer ${key}`) return next();

  res.status(401).json({ error: 'Unauthorized — CMS API key required' });
}

module.exports = { requireAuth };
