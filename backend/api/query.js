import { runAgent } from '../agent.js';

export default async function handler(req, res) {
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
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
}
