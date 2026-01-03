
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, User, Bot, Loader2, Gamepad2, Lock, Sparkles, Eraser, Lightbulb, Music, ChevronRight, MessageSquare, Copy, Check, Zap, ArrowDown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

interface AITutorProps {
  isPro: boolean;
  onRequestUpgrade: () => void;
}

// Simple text formatter for bolding **text**
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span className="whitespace-pre-wrap leading-relaxed tracking-wide text-[15px]">
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="text-stone-900 font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </span>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(msg.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isUser = msg.role === 'user';

    return (
        <div className={`flex gap-3 md:gap-4 group ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-scale-in origin-bottom`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm border select-none ${isUser ? 'bg-stone-900 border-stone-900' : 'bg-white border-stone-200'}`}>
               {isUser ? <User size={16} className="text-white" /> : <Bot size={18} className="text-amber-600" />}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col max-w-[90%] md:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`relative px-4 py-3 md:px-6 md:py-4 rounded-2xl text-sm md:text-base leading-7 shadow-sm border transition-all duration-200 ${
                    isUser 
                    ? 'bg-stone-900 text-white rounded-tr-sm border-stone-900 shadow-md' 
                    : 'bg-white text-stone-700 rounded-tl-sm border-stone-100 hover:shadow-md'
                } ${msg.isError ? 'bg-red-50 border-red-100 text-red-600' : ''}`}>
                    {isUser ? msg.text : <FormattedText text={msg.text} />}
                    
                    {/* Copy Button for Model */}
                    {!isUser && !msg.isError && (
                        <button 
                            onClick={handleCopy}
                            className={`absolute -bottom-6 left-0 text-[10px] md:text-xs text-stone-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-stone-600 p-1`}
                            title="Copy to clipboard"
                        >
                            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            {copied ? <span className="text-emerald-500 font-medium">Copied</span> : <span>Copy</span>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const AITutor: React.FC<AITutorProps> = ({ isPro, onRequestUpgrade }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Use a ref for the scroll container specifically
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Free tier limit
  const FREE_LIMIT = 5;
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const isLimitReached = !isPro && userMessageCount >= FREE_LIMIT;

  // Scroll handler to show/hide "Scroll to bottom" button
  const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
  };

  // Auto-scroll logic
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const callGemini = async (userMessage: string, displayMessage?: string) => {
     if (isLoading) return;
     if (isLimitReached) {
         onRequestUpgrade();
         return;
     }

     setIsLoading(true);

     const newMsg: Message = { 
         id: Date.now().toString(), 
         role: 'user', 
         text: displayMessage || userMessage 
     };
     setMessages(prev => [...prev, newMsg]);

     try {
      let apiKey = '';
      try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            apiKey = process.env.API_KEY;
        }
      } catch (e) {
        console.warn("Could not access process.env");
      }

      if (!apiKey) {
          throw new Error("API Key not found");
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
        You are an expert, patient, and encouraging Piano Teacher named "Maestro".
        Your student is a beginner to intermediate player.
        
        Guidelines:
        1. Keep answers concise, engaging, and easy to understand. Use metaphors.
        2. Use Chinese (Simplified) for the response.
        3. Formatting: Use **bold** for key terms. Use lists where appropriate.
        4. Tone: Warm, professional, supportive.
        5. If asked for a quiz, provide ONE multiple choice question about Music Theory.
      `;

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      const result = await chat.sendMessageStream({ message: userMessage });
      
      let fullResponse = "";
      const modelMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '' }]);

      for await (const chunk of result) {
        const chunkText = chunk.text;
        fullResponse += chunkText;
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === modelMsgId ? { ...msg, text: fullResponse } : msg
          )
        );
      }

    } catch (error) {
      console.error("Error calling Gemini:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: '抱歉，网络连接似乎有点问题，或者缺少 API Key。请稍后再试。',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const txt = input.trim();
    setInput('');
    callGemini(txt);
  };

  const handleQuickAction = (prompt: string, display?: string) => {
      callGemini(prompt, display);
  };

  const handleClearHistory = () => {
      if (window.confirm("确定要清空对话历史吗？")) {
          setMessages([]);
      }
  };

  const QUICK_ACTIONS = [
      { icon: Lightbulb, label: "五度圈怎么记？", prompt: "请用简单的方法解释五度圈（Circle of Fifths），最好有一个好记的口诀。", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
      { icon: Music, label: "如何练习音阶？", prompt: "作为初学者，我该如何高效地练习音阶？请给出3个具体的建议。", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
      { icon: Zap, label: "三和弦 vs 七和弦", prompt: "简单解释一下三和弦和七和弦在听感上的区别。", color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" },
      { icon: Gamepad2, label: "乐理小测试", prompt: "请给我出一道关于乐理的基础选择题（比如关于音程、节奏或谱号），并附带选项。不要直接给出答案。", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#FAFAF9] relative overflow-hidden rounded-3xl">
      
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#e7e5e4 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* Main Chat Scroll Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-0 p-4 md:p-8 scroll-smooth custom-scrollbar w-full relative z-10"
      >
        <div className="max-w-3xl mx-auto flex flex-col min-h-full pb-32 md:pb-36">
            
            {/* Empty State */}
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center flex-1 py-10">
                    <div className="bg-white p-5 rounded-[2rem] shadow-lg shadow-stone-200/50 mb-8 relative group animate-slideUp">
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-100 to-rose-100 rounded-[2rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
                        <Bot size={56} className="text-stone-800 relative z-10" strokeWidth={1.5} />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white"></div>
                    </div>
                    <h3 className="text-3xl font-black text-stone-900 mb-3 font-serif animate-slideUp text-center" style={{ animationDelay: '0.1s' }}>Maestro AI</h3>
                    <p className="text-stone-500 text-center max-w-sm mb-12 leading-relaxed animate-slideUp text-sm md:text-base px-4" style={{ animationDelay: '0.2s' }}>
                        你的全天候 AI 钢琴私教。无论是乐理疑惑、练习瓶颈，还是想来点灵感，我都在这里。
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl animate-slideUp px-2" style={{ animationDelay: '0.3s' }}>
                        {QUICK_ACTIONS.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuickAction(action.prompt, action.label)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-left bg-white ${action.border} group`}
                            >
                                <div className={`p-3 rounded-xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform shrink-0`}>
                                    <action.icon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-stone-800 text-sm truncate">{action.label}</div>
                                    <div className="text-xs text-stone-400 mt-0.5 group-hover:text-stone-500 transition-colors">点击提问</div>
                                </div>
                                <ChevronRight size={16} className="text-stone-300 group-hover:text-stone-500 group-hover:translate-x-1 transition-transform shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages List */}
            <div className="space-y-6 md:space-y-8">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                ))}
            </div>

            {/* Loading Indicator */}
            {isLoading && (
            <div className="flex gap-4 animate-fadeIn mt-6 md:mt-8">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                    <Bot size={18} className="text-amber-600 animate-pulse" />
                </div>
                <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-sm border border-stone-100 shadow-sm flex items-center gap-2">
                    <div className="flex space-x-1.5">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                    <span className="text-xs text-stone-400 ml-2 font-medium uppercase tracking-wider">Thinking...</span>
                </div>
            </div>
            )}
            
            {/* Invisible anchor for scrolling */}
            <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll Down Button (Visible when scrolled up) */}
      {showScrollButton && (
          <button 
            onClick={() => scrollToBottom()}
            className="absolute bottom-28 md:bottom-32 right-6 md:right-8 z-30 w-10 h-10 bg-white border border-stone-200 shadow-lg rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all animate-bounce-gentle"
          >
              <ArrowDown size={20} />
          </button>
      )}

      {/* Free Limit Warning Overlay */}
      {isLimitReached && (
          <div className="absolute bottom-28 left-4 right-4 md:left-auto md:right-auto md:w-96 md:left-1/2 md:-translate-x-1/2 z-40 animate-slideUp">
              <div className="bg-stone-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-stone-700/50">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500 border border-amber-500/20">
                          <Lock size={18} />
                      </div>
                      <div>
                          <div className="font-bold text-sm">次数已用完</div>
                          <div className="text-[10px] text-stone-400 mt-0.5">升级 Pro 解锁无限次对话。</div>
                      </div>
                  </div>
                  <button 
                      onClick={onRequestUpgrade}
                      className="px-4 py-2 bg-white text-stone-900 rounded-lg text-xs font-bold hover:bg-amber-50 transition-colors shrink-0 shadow-lg"
                  >
                      解锁 Pro
                  </button>
              </div>
          </div>
      )}

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        {/* Gradient Mask for fading content */}
        <div className="h-8 md:h-12 bg-gradient-to-t from-[#FAFAF9] to-transparent pointer-events-none"></div>
        
        <div className="bg-[#FAFAF9]/80 backdrop-blur-xl p-4 md:p-6 pt-2 border-t border-stone-200/50">
            {/* Floating Toolbar */}
            {messages.length > 0 && !isLimitReached && (
                <div className="absolute -top-14 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md border border-stone-200 p-1 rounded-full shadow-sm flex gap-1 pointer-events-auto scale-90 md:scale-100 origin-bottom transition-all hover:scale-105 hover:shadow-md">
                        <button onClick={handleClearHistory} className="p-2 hover:bg-stone-100 rounded-full text-stone-500 hover:text-stone-800 transition-colors" title="Clear History">
                            <Eraser size={16} />
                        </button>
                        <div className="w-px bg-stone-200 mx-1 my-1"></div>
                        <button onClick={() => handleQuickAction("给我一个乐理挑战", "🎯 随机挑战")} className="px-4 py-1.5 hover:bg-stone-50 rounded-full text-xs font-bold text-stone-600 transition-colors flex items-center gap-1.5">
                            <Zap size={14} className="text-amber-500"/> 随机挑战
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3 max-w-3xl mx-auto relative items-end">
            <div className="relative flex-1 group">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLimitReached}
                    placeholder={isLimitReached ? "请升级以继续..." : "输入你的问题..."}
                    className="w-full pl-5 pr-10 py-3.5 md:py-4 bg-white border-2 border-stone-100 rounded-2xl focus:bg-white focus:border-stone-300 focus:ring-4 focus:ring-stone-100 transition-all outline-none text-stone-900 placeholder-stone-400 font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-sm text-sm md:text-base"
                />
                {!isLimitReached && !input && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none animate-pulse">
                        <MessageSquare size={18} />
                    </div>
                )}
            </div>
            
            <button
                type="submit"
                disabled={isLoading || !input.trim() || isLimitReached}
                className={`
                    h-[50px] w-[50px] md:h-[58px] md:w-[58px] rounded-2xl transition-all shadow-md flex items-center justify-center shrink-0
                    ${!input.trim() || isLoading || isLimitReached 
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                        : 'bg-stone-900 text-white hover:bg-stone-800 hover:scale-105 active:scale-95 shadow-stone-900/20'}
                `}
            >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} fill="currentColor" className="ml-0.5" />}
            </button>
            </form>
            
            {!isPro && (
                <div className="text-center mt-3">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest bg-stone-100/80 px-3 py-1 rounded-full backdrop-blur-sm">
                        剩余额度: {Math.max(0, FREE_LIMIT - userMessageCount)} / {FREE_LIMIT}
                    </span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AITutor;
