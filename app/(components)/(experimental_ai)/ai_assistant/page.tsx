'use client';

import React, { useState, useRef, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Zap, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIAssistant() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I'm the Lukz AI Assistant. I am live and ready to help you with formulations, safety data, or batch calculations. What's on your mind?" 
    }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Get the token we saved during login
      const token = localStorage.getItem('token');

      // 2. Fetch from PythonAnywhere instead of local Next.js route
      const response = await fetch('http://127.0.0.1:8000/api/ai/chat/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Token ${token}` : '', // Send token for security
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.content 
      }]);

    } catch (error) {
      console.error("AI Fetch Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "### ⚠️ System Error\nUnable to reach the AI engine on the PythonAnywhere server. Please ensure you are logged in and the server is active." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <Navbar 
          title="AI Formula Assistant" 
          Icon={Zap} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />

        <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full flex flex-col min-h-0">
          
          {/* Status Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 mb-6 text-white shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg"><Sparkles size={20} /></div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider">Lukz Intelligence</h3>
                <p className="text-[10px] text-blue-100 italic">Connected to PythonAnywhere API</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-bold">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM ONLINE
            </div>
          </div>

          {/* Chat Container */}
          <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[400px] mb-4">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                      {m.role === 'assistant' ? (
                        <div className="prose prose-slate prose-sm max-w-none 
                          prose-p:leading-relaxed prose-headings:text-slate-800 
                          prose-strong:text-slate-900 prose-ul:my-2 prose-li:my-0.5">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 items-center text-slate-400 animate-pulse">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs italic">Consulting Lukz Knowledge Base...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about formulations, batching, or safety..."
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-5 pr-14 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm"
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()} 
                  className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}