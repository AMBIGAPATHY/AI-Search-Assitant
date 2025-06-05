require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { runAgent } = require('./agent');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/query', async (req, res) => {
  const { query } = req.body;
  try {
    const result = await runAgent(query);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: 'Backend error', detail: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running ✅ at http://localhost:${PORT}`));





// // server.js for Groq code
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const { runAgent } = require('./agent');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// app.post('/api/query', async (req, res) => {
//   const { query } = req.body;
//   try {
//     const result = await runAgent(query);
//     res.json({ result });
//   } catch (err) {
//     res.status(500).json({ error: 'Server Error', details: err.message });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Backend running at http://localhost:${PORT}`));
