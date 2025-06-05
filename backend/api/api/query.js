import { runAgent } from '../agent.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Optional: allow CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { query } = req.body;

  try {
    const result = await runAgent(query);
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', detail: error.message });
  }
}
