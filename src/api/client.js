import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export function connectCopilot(projectContext, onMessage, onDone, onError) {
  const wsBase = API_BASE.replace('http', 'ws') || `ws://${window.location.hostname}:8000`;
  const ws = new WebSocket(`${wsBase}/api/copilot/chat`);
  
  ws.onopen = () => {
    if (projectContext) {
      ws.send(JSON.stringify({ type: 'context', data: projectContext }));
    }
  };
  
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'token') onMessage(msg.content);
    if (msg.type === 'done') onDone();
    if (msg.type === 'error') onError?.(msg.content);
  };
  
  ws.onerror = () => onError?.('WebSocket connection failed');
  
  return {
    send: (text) => ws.send(JSON.stringify({ type: 'message', content: text })),
    close: () => ws.close(),
  };
}
