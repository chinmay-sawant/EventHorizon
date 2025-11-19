import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Info, X } from 'lucide-react';
import { generateBlackHoleResponse, ChatMessage } from '../services/geminiService';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'INITIALIZING VOXEL_ENGINE... EVENT HORIZON ONLINE. SPEAK, ENTITY.' }
  ]);
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await generateBlackHoleResponse(messages.concat(userMsg), input);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "ERROR: DATA CORRUPTION IN SECTOR 7G." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-black/80 p-3 rounded-full border-2 border-orange-500 text-orange-500 hover:bg-orange-900/50 transition-all z-50 shadow-[0_0_15px_rgba(255,165,0,0.3)]"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-md z-10 flex flex-col gap-2 px-4 sm:px-0">
      
      {/* Header/Status Panel */}
      <div className="bg-black/80 backdrop-blur-sm border-2 border-gray-800 p-3 rounded-t-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-500 font-pixel text-xl">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>SINGULARITY.EXE</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex gap-2 items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-xs text-gray-400 font-mono">ONLINE</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={18} />
            </button>
        </div>
      </div>

      {/* Chat Window */}
      <div 
        ref={scrollRef}
        className="h-80 bg-black/70 backdrop-blur-md border-x-2 border-gray-800 overflow-y-auto p-4 font-mono text-sm custom-scrollbar"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border-2 ${
                    msg.role === 'user' ? 'bg-blue-900 border-blue-700' : 'bg-orange-900 border-orange-700'
                }`}>
                    {msg.role === 'user' ? <User size={16} className="text-blue-200"/> : <Bot size={16} className="text-orange-200"/>}
                </div>

                {/* Message Bubble */}
                <div className={`p-3 border-2 rounded shadow-lg ${
                    msg.role === 'user' 
                    ? 'bg-blue-950/50 border-blue-800 text-blue-100' 
                    : 'bg-orange-950/50 border-orange-800 text-orange-100'
                }`}>
                    <p className={msg.role === 'model' ? 'font-pixel text-lg leading-tight tracking-wide' : 'font-sans'}>
                        {msg.text}
                    </p>
                </div>
            </div>
          </div>
        ))}
        {loading && (
            <div className="text-orange-500 font-pixel animate-pulse pl-12">
                COMPUTING_GRAVITY_WELL...
            </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="bg-black/80 border-2 border-gray-800 rounded-b-lg p-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Communicate with the void..."
          className="flex-1 bg-gray-900/50 border-2 border-gray-700 text-white px-3 py-2 outline-none focus:border-orange-500 font-pixel text-xl transition-colors"
        />
        <button 
            type="submit"
            disabled={loading}
            className="bg-orange-700 hover:bg-orange-600 text-white border-2 border-orange-500 p-2 px-4 transition-colors disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </form>
      
      <div className="text-xs text-gray-500 text-center font-mono">
         Gemini 2.5 Flash • Voxel Renderer
      </div>
    </div>
  );
};