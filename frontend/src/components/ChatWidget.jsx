// src/components/ChatWidget.jsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWidget = ({ onTransactionAdded }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'How can I help you manage your budget today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    const newMsgs = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMsgs);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setMessages([
          ...newMsgs,
          {
            role: 'bot',
            content: 'Please log in first to use the chat assistant.'
          }
        ]);
        setLoading(false);
        return;
      }

      console.log('🚀 Sending message to /chat:', userMessage);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      console.log('📨 Chat response received:', data);

      setMessages((prevMsgs) => [
        ...prevMsgs,
        {
          role: 'bot',
          content: data.reply || 'Sorry, I could not process that right now.'
        }
      ]);

      // ✅ FIXED: Wait 200ms for backend to save, THEN refresh
      if (data.transactionAdded === true) {
        console.log('✅ TRANSACTION ADDED - waiting 200ms before refresh');
        setTimeout(() => {
          if (typeof onTransactionAdded === 'function') {
            console.log('✅ Calling onTransactionAdded callback');
            onTransactionAdded();
          }
        }, 200);
      }
    } catch (err) {
      console.error('❌ Chat error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setMessages((prevMsgs) => [
        ...prevMsgs,
        {
          role: 'bot',
          content: `Error: ${err.message || 'Something went wrong.'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading && input.trim()) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="btn-primary p-4 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
        onClick={() => setOpen(!open)}
        title="Open Chat Assistant"
      >
        {open ? (
          <X className="w-7 h-7 text-white" />
        ) : (
          <MessageCircle className="w-7 h-7 text-white" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="card mt-3 w-80 max-h-[500px] flex flex-col shadow-2xl rounded-lg overflow-hidden"
          >
            <div className="flex justify-between items-center bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3">
              <span className="text-base font-semibold text-white">
                💰 BudgetFlow AI
              </span>
              <button
                className="text-white hover:bg-white/20 p-1 rounded transition"
                onClick={() => setOpen(false)}
                title="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gray-50 dark:bg-gray-900"
              style={{ minHeight: 200 }}
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-xs break-words text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg rounded-bl-none">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-2 rounded text-xs"
                >
                  ⚠️ {error}
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            <form
              className="flex gap-2 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              onSubmit={(e) => {
                e.preventDefault();
                if (!loading && input.trim()) {
                  handleSend();
                }
              }}
            >
              <input
                className="form-control flex-1"
                placeholder="Ask about spending, budget..."
                value={input}
                disabled={loading}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <motion.button
                type="submit"
                className="btn-primary px-4 py-2"
                disabled={loading || !input.trim()}
                whileHover={{ scale: loading || !input.trim() ? 1 : 1.05 }}
                whileTap={{ scale: loading || !input.trim() ? 1 : 0.95 }}
              >
                {loading ? '...' : 'Send'}
              </motion.button>
            </form>

            <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 border-t border-blue-200 dark:border-blue-800 text-xs text-gray-600 dark:text-gray-400">
              💡 Try: "Add 250 to groceries" or ask budget questions
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;
