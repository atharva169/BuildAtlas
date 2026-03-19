import { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { connectCopilot } from '../api/client';
import { Bot, Send, Sparkles } from 'lucide-react';

export default function Copilot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m BuildAtlas AI Copilot. I can answer construction-related questions grounded in your project data, IS codes, and RERA regulations. Ask me anything!' },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);
  const getProjectContext = useProjectStore(s => s.getProjectContext);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || isStreaming) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsStreaming(true);

    const context = getProjectContext();
    let accumulated = '';

    const conn = connectCopilot(
      context,
      (token) => {
        accumulated += token;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && last.streaming) {
            return [...prev.slice(0, -1), { role: 'assistant', content: accumulated, streaming: true }];
          }
          return [...prev, { role: 'assistant', content: accumulated, streaming: true }];
        });
      },
      () => {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.streaming) {
            return [...prev.slice(0, -1), { role: 'assistant', content: last.content }];
          }
          return prev;
        });
        setIsStreaming(false);
      },
      (err) => {
        setMessages(prev => [...prev, { role: 'assistant', content: `Connection error: ${err}. Make sure the backend is running.` }]);
        setIsStreaming(false);
      }
    );

    // Small delay then send the message
    setTimeout(() => conn.send(userMsg), 500);
    setWs(conn);
  };

  const suggestions = [
    'What IS code governs RCC design?',
    'How many bags of cement do I need for this project?',
    'What are the RERA requirements for my project?',
    'Compare AAC blocks vs red bricks for my build',
  ];

  return (
    <div>
      <div className="page-header">
        <h1>
          <Bot size={28} style={{ display: 'inline', marginRight: 10, color: 'var(--accent-blue)' }} />
          AI Construction Copilot
        </h1>
        <p>Context-aware assistant grounded in your project data and Indian construction standards</p>
      </div>

      <div className="chat-container glass-card" style={{ padding: 24 }}>
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role} animate-fade-up`}>
              {msg.content}
              {msg.streaming && <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2, display: 'inline-block', marginLeft: 6, verticalAlign: 'middle' }} />}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 12 }}>
            {suggestions.map((s, i) => (
              <button key={i} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                onClick={() => { setInput(s); }}>
                <Sparkles size={12} /> {s}
              </button>
            ))}
          </div>
        )}

        <div className="chat-input-bar">
          <input className="input-field" placeholder="Ask about IS codes, costs, materials, schedule..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            disabled={isStreaming}
          />
          <button className="btn-primary" onClick={sendMessage} disabled={isStreaming || !input.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
