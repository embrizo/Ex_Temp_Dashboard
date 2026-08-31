import { useState } from 'react';
import { Bot, Loader2, Send, X } from 'lucide-react';
import { askAssistant } from '../../services/assistant';

export default function AssistantPanel({ open, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setSending(true);

    try {
      const result = await askAssistant(question);
      setMessages((prev) => [...prev, { role: 'assistant', content: result.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: err.message, isError: true }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="assistant-panel glass-card">
      <div className="assistant-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={16} color="var(--color-cyan)" />
          <span>Assistant</span>
        </div>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div className="assistant-panel-messages">
        {messages.length === 0 && (
          <div className="assistant-panel-empty">
            Ask about a sensor, e.g. "how is the Temp Sensor doing?" or "any alerts on Air Washer 3?"
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`assistant-message assistant-message-${m.role}${m.isError ? ' assistant-message-error' : ''}`}
          >
            {m.content}
          </div>
        ))}
        {sending && (
          <div className="assistant-message assistant-message-assistant">
            <Loader2 size={14} className="spin" /> Thinking…
          </div>
        )}
      </div>

      <form className="assistant-panel-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          disabled={sending}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={sending || !input.trim()}>
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
