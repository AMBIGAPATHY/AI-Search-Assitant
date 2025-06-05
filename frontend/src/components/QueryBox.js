import React, { useState } from 'react';
import axios from 'axios';
import { FaRegPaperPlane } from 'react-icons/fa';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import './QueryBox.css';

const QueryBox = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResult('');
    try {
      const res = await axios.post('https://ai-search-assitant.vercel.app/', { query });
      setResult(res.data.result);
    } catch (error) {
      setResult('⚠️ Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-wrapper">
      <img src="/robot.png" alt="avatar" className="bot-avatar" />
      <div className="chat-bubble">
        <p>
          Hello! I’m <b>Sarath's AI Agent</b>, your smart search assistant. <br />
          The more detailed your question, the better I can help 😊
        </p>
      </div>

      <div className="input-box">
        <input
          type="text"
          placeholder="Ask a question or search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>
          <FaRegPaperPlane />
        </button>
      </div>

      {result && (
        <div className="response-box">
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(marked.parse(result))
            }}
          />
        </div>
      )}
    </div>
  );
};

export default QueryBox;
