
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, User, Bot, Loader2, Gamepad2, Lock, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface AITutorProps {
  isPro: boolean;
  onRequestUpgrade: () => void;
}

const AITutor: React.FC<AITutorProps> = ({ isPro, onRequestUpgrade }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '你好！我是你的 AI 钢琴助教。你可以问我乐理问题，或者点击下方的“生成测试”来考考自己。'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Free tier limit
  const FREE_LIMIT = 5;
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const isLimitReached = !isPro && userMessageCount >= FREE_LIMIT;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callGemini = async (userMessage: string, isHiddenPrompt: boolean = false) => {
     if (isLoading) return;
     if (isLimitReached) {
         onRequestUpgrade();
         return;
     }

     setIsLoading(true);

     const displayMessage = isHiddenPrompt ? "🎯 请给我出一道乐理选择题！" : userMessage;
     const newMsg: Message = { id: Date.now().toString(), role: 'user', text: displayMessage };
     setMessages(prev => [...prev, newMsg]);

     try {
      // Safely access API key
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
        You are an expert, patient, and encouraging Piano Teacher. 
        Your student is a beginner.
        
        Guidelines:
        1. Explanations should be simple, using metaphors.
        2. Use Chinese (Simplified) for the response.
        3. Formatting: Use Markdown for bolding key terms.
        4. If the user asks for a quiz/test: Provide ONE multiple choice question about Piano Theory (Slur, Tie, Rhythm, Dynamics, Intervals). 
           Format:
           **题目**: [Question]
           A) [Option]
           B) [Option]
           C) [Option]
           
           (Don't reveal the answer yet. Wait for user to reply).
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

      const finalPrompt = isHiddenPrompt 
        ? "Please generate a beginner multiple-choice music theory question now. Topics: Slur, Tie, Time Signatures, Dynamics, or Intervals." 
        : userMessage;

      const result = await chat.sendMessageStream({ message: finalPrompt });
      
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
        text: '抱歉，网络连接似乎有点问题，或者缺少 API Key。' 
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

  const handleQuiz = () => {
    if (isLimitReached) {
        onRequestUpgrade();
        return;
    }
    callGemini("", true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-stone-50 relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm flex items-start space-x-3 ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-white rounded-br-none'
                  : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none'
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                 {msg.role === 'user' ? <User size={18} /> : <Bot size={18} className="text-amber-600" />}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-stone-200 shadow-sm flex items-center space-x-2">
                <Loader2 className="animate-spin text-amber-500" size={18} />
                <span className="text-stone-400 text-sm">思考中...</span>
             </div>
          </div>
        )}
        
        {/* Limit Reached Message */}
        {isLimitReached && (
            <div className="flex justify-center mt-8 mb-4">
                <div className="bg-stone-900 text-white p-6 rounded-2xl shadow-xl max-w-sm text-center border border-stone-700">
                    <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Lock size={20} className="text-amber-500" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">免费额度已用完</h3>
                    <p className="text-stone-400 text-xs mb-4">升级 Pro 会员，解锁无限次 AI 对话与大师级课程。</p>
                    <button 
                        onClick={onRequestUpgrade}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 w-full py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Sparkles size={14} /> 立即升级
                    </button>
                </div>
            </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-stone-200 absolute bottom-0 left-0 right-0 z-10">
        <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
           <button 
             onClick={handleQuiz}
             disabled={isLoading || isLimitReached}
             className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap ${
                 isLimitReached 
                 ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed' 
                 : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200'
             }`}
           >
             <Gamepad2 size={14} />
             <span>生成测试题 (Quiz)</span>
           </button>
           
           {!isPro && (
               <div className="flex items-center px-3 py-1.5 text-xs text-stone-400 font-mono">
                   剩余额度: {Math.max(0, FREE_LIMIT - userMessageCount)}
               </div>
           )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLimitReached}
            placeholder={isLimitReached ? "请升级以继续..." : "输入你的问题..."}
            className="flex-1 p-3 bg-stone-100 border-none rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none text-stone-800 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || isLimitReached}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white p-3 rounded-xl transition-colors shadow-md flex items-center justify-center min-w-[50px]"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AITutor;
