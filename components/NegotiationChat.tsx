
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatAction } from '../types';
import { chatWithAssistant } from '../services/geminiService';

interface NegotiationChatProps {
  contractContext: string;
}

const NegotiationChat: React.FC<NegotiationChatProps> = ({ contractContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (query?: string) => {
    const textToSend = query || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const responseData = await chatWithAssistant(history, textToSend, contractContext);
      
      const modelMessage: ChatMessage = {
        role: 'model',
        content: responseData.text,
        actions: responseData.actions,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'model',
        content: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: ChatAction) => {
    if (action.type === 'query' && action.payload) {
      handleSend(action.payload);
    } else if (action.type === 'email') {
      alert("I've generated a specific email draft based on this advice. You can find it in the 'Email Generator' tab of the relevant clause!");
    } else {
      handleSend(action.label);
    }
  };

  return (
    <div className="flex flex-col h-[550px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-indigo-400">
              <i className="fa-solid fa-user-tie text-white text-lg"></i>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-slate-800 rounded-full"></div>
          </div>
          <div>
            <h3 className="text-white font-black text-xs uppercase tracking-widest">Mentor AI</h3>
            <p className="text-slate-400 text-[10px] font-bold">Negotiation Specialist Online</p>
          </div>
        </div>
        <button onClick={() => setMessages([])} className="text-slate-500 hover:text-white transition-colors">
          <i className="fa-solid fa-rotate-right text-xs"></i>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-4 border border-slate-700">
              <i className="fa-solid fa-handshake text-indigo-400 text-2xl"></i>
            </div>
            <h4 className="text-white font-bold text-sm mb-1">Hi, I'm your Negotiation Coach.</h4>
            <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
              How can I help you navigate this contract today?
            </p>
            <div className="grid grid-cols-1 gap-2 mt-6 w-full">
              {["Is this legal in France?", "They rejected my counter-offer", "What is my biggest risk?"].map(q => (
                <button 
                  key={q} 
                  onClick={() => handleSend(q)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold rounded-xl border border-slate-700 transition-all text-left flex items-center justify-between"
                >
                  {q}
                  <i className="fa-solid fa-chevron-right text-[10px] opacity-50"></i>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700 font-medium'
            }`}>
              {m.content}
            </div>
            
            {/* Actions */}
            {m.role === 'model' && m.actions && (
              <div className="flex flex-wrap gap-2 mt-3 max-w-[90%]">
                {m.actions.map((action, aidx) => (
                  <button
                    key={aidx}
                    onClick={() => handleAction(action)}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-indigo-300 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-1.5"
                  >
                    {action.type === 'email' && <i className="fa-solid fa-envelope"></i>}
                    {action.type === 'legal' && <i className="fa-solid fa-scale-balanced"></i>}
                    {action.type === 'success_story' && <i className="fa-solid fa-trophy"></i>}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Mentor Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your coach..."
            className="flex-1 bg-slate-900 text-white border-2 border-slate-700 rounded-2xl px-5 py-3 text-sm focus:border-indigo-500 focus:ring-0 outline-none transition-all placeholder:text-slate-600"
          />
          <button 
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 active:scale-95"
          >
            <i className="fa-solid fa-paper-plane text-lg"></i>
          </button>
        </div>
        <p className="text-[9px] text-slate-500 mt-2 text-center font-bold uppercase tracking-widest opacity-50">
          Powered by LexiNegotiate Intelligence
        </p>
      </div>
    </div>
  );
};

export default NegotiationChat;
