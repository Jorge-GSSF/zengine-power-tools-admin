/**
 * Vercel Serverless Function: /api/login
 * Validates administrator credentials for George Snow Scholarship Fund
 */

const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASSWORD || 'georgesnow2026';

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { password } = body;

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    if (password === DEFAULT_ADMIN_PASS) {
      // In production, sign a JWT or persistent session token
      const sessionToken = Buffer.from(`admin:${Date.now()}:${DEFAULT_ADMIN_PASS}`).toString('base64');
      return res.status(200).json({
        success: true,
        token: sessionToken,
        role: 'superadmin',
        org: 'George Snow Scholarship Fund',
        message: 'Authentication successful. You have access to publish settings to all extensions.'
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Invalid administrator password.'
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
