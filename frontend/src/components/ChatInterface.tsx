import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Database } from 'lucide-react';
import type { ChatMessage, TradeSource } from '../types';

interface Props {
  onSendMessage: (message: string) => Promise<void>;
  messages: ChatMessage[];
  isLoading: boolean;
}

export const ChatInterface: React.FC<Props> = ({ onSendMessage, messages, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await onSendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-neutral-800 flex flex-col h-[600px]">
      {/* Header */}
      <div className="border-b border-neutral-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-50">Chat with The Arbiter</h3>
            <p className="text-sm text-neutral-400">Ask about trading patterns, market insights, or past trades</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <Database className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-neutral-300 mb-2">Start a Conversation</h4>
              <p className="text-sm text-neutral-500 mb-4">
                Ask questions about trading patterns, market conditions, or past performance.
              </p>
              <div className="space-y-2 text-left">
                <button
                  onClick={() => setInput("What were the most profitable BTC trades?")}
                  className="w-full text-sm text-neutral-400 hover:text-primary bg-neutral-900/50 hover:bg-neutral-900 rounded-lg px-4 py-2 text-left transition-colors"
                >
                  "What were the most profitable BTC trades?"
                </button>
                <button
                  onClick={() => setInput("What patterns led to losses?")}
                  className="w-full text-sm text-neutral-400 hover:text-primary bg-neutral-900/50 hover:bg-neutral-900 rounded-lg px-4 py-2 text-left transition-colors"
                >
                  "What patterns led to losses?"
                </button>
                <button
                  onClick={() => setInput("Should I buy BTCUSDT right now?")}
                  className="w-full text-sm text-neutral-400 hover:text-primary bg-neutral-900/50 hover:bg-neutral-900 rounded-lg px-4 py-2 text-left transition-colors"
                >
                  "Should I buy BTCUSDT right now?"
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="bg-neutral-900/50 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm text-neutral-400">Analyzing trading history...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-800 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about trades, patterns, or market insights..."
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-neutral-50 placeholder-neutral-500 focus:outline-none focus:border-primary resize-none max-h-32"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-xs text-neutral-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

const ChatMessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-success/20' : 'bg-primary/20'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-success" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className={`rounded-lg px-4 py-3 max-w-3xl ${
          isUser 
            ? 'bg-success/10 border border-success/30' 
            : 'bg-neutral-900/50 border border-neutral-800'
        }`}>
          <p className="text-sm text-neutral-100 whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 space-y-2 max-w-3xl">
            <p className="text-xs font-medium text-neutral-400 flex items-center gap-1">
              <Database className="w-3 h-3" />
              Sources from trading history:
            </p>
            {message.sources.map((source) => (
              <div
                key={source.id}
                className="bg-neutral-900/30 border border-neutral-800/50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-300">{source.symbol}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      source.profit > 0 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                    }`}>
                      {source.profit > 0 ? '+' : ''}${source.profit.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500">
                    {(source.similarity * 100).toFixed(0)}% match
                  </span>
                </div>
                {source.reasoning && (
                  <p className="text-xs text-neutral-400 mt-1">"{source.reasoning}"</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-neutral-500 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};
