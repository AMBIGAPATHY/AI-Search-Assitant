import { runAgent } from '../agent.js';

// Add CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // You can also whitelist a domain
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCorsHeaders(res); // Add this early

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // ✅ Allow preflight
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid query.' });
    }

    const result = await runAgent(query);
    res.status(200).json({ result });
  } catch (error) {
    console.error('❌ runAgent error:', error);
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
}
