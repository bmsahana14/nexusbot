'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { marked } from 'marked';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: { file: string; title: string }[];
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const suggestedQuestions = [
        "What are the community rules?",
        "How do I create an account?",
        "What can NexusBot help with?",
        "Tell me about user roles."
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleClearChat = () => {
        setMessages([]);
    };

    const handleSuggestedClick = (question: string) => {
        setInput(question);
        processMessage(question);
    };

    const processMessage = async (query: string) => {
        if (!query.trim() || isLoading) return;

        console.log('[Chat] Sending query:', query);
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: query.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMessage.content })
            });

            console.log('[Chat] Received response status:', response.status);

            const responseText = await response.text();
            let data: any = null;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.warn('[Chat] Response is not JSON:', responseText);
                throw new Error(`Invalid server response: ${responseText.substring(0, 50)}...`);
            }

            if (!response.ok) {
                const errorMessage = data?.details || data?.error || `Server error (${response.status})`;
                throw new Error(errorMessage);
            }

            console.log('[Chat] Received data:', data);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.answer || 'I could not find an answer in my knowledge base.',
                sources: data.sources || []
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error: any) {
            console.error('[Chat] Error in processMessage:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Sorry, I encountered an error: ${error.message || 'Please try again later.'}`
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            console.log('[Chat] Request finished.');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        processMessage(input);
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl hover:shadow-blue-500/50 transition-shadow flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle chat"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.svg
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </motion.svg>
                    ) : (
                        <motion.div
                            key="chat"
                            className="relative"
                        >
                            <motion.svg
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </motion.svg>
                            {!isOpen && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400"></span>
                                </span>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 z-50 w-96 h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
                        style={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 border-b border-slate-100 flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={isLoading ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl shadow-sm"
                                >
                                    🤖
                                </motion.div>
                                <div>
                                    <h3 className="font-semibold text-white">NexusBot</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                        <p className="text-[10px] uppercase tracking-wider text-blue-100 font-bold">Online Assistant</p>
                                    </div>
                                </div>
                            </div>
                            {messages.length > 0 && (
                                <button
                                    onClick={handleClearChat}
                                    className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                                    title="Clear conversation"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center px-4"
                                >
                                    <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-4xl mb-6 shadow-sm border border-slate-100">
                                        🤖
                                    </div>
                                    <h4 className="text-slate-800 font-bold mb-2 text-xl">Hello! I'm NexusBot</h4>
                                    <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-[240px]">
                                        I can help you with anything related to our community.
                                        Try asking about:
                                    </p>

                                    <div className="grid grid-cols-1 gap-2 w-full">
                                        {suggestedQuestions.map((q, i) => (
                                            <motion.button
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * i }}
                                                onClick={() => handleSuggestedClick(q)}
                                                className="text-left px-4 py-3 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 text-sm transition-all hover:border-blue-300 hover:shadow-sm group"
                                            >
                                                <span className="group-hover:text-blue-600 transition-colors">{q}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${message.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-200'
                                            : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-none'
                                            }`}
                                    >
                                        <div
                                            className={`text-sm prose prose-sm max-w-none break-words ${message.role === 'user' ? 'prose-invert' : ''}`}
                                            dangerouslySetInnerHTML={{
                                                __html: message.role === 'assistant'
                                                    ? marked.parse(message.content)
                                                    : message.content
                                            }}
                                        />

                                        {message.sources && message.sources.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-200">
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Verified Sources</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {Array.from(new Set(message.sources.map(s => s.file))).map((sourceFile, idx) => {
                                                        const source = message.sources?.find(s => s.file === sourceFile);
                                                        return (
                                                            <div key={idx} className="flex items-center gap-1 px-2 py-1 rounded bg-white shadow-sm border border-slate-200">
                                                                <span className="text-[10px]">📄</span>
                                                                <span className="text-[10px] text-slate-600 font-bold truncate max-w-[120px]">
                                                                    {source?.title.split(' - ')[0]}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-slate-100 rounded-2xl px-4 py-3 border border-slate-200 rounded-tl-none flex items-center gap-1">
                                        <motion.span
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ repeat: Infinity, duration: 1.4, delay: 0 }}
                                            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                        />
                                        <motion.span
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }}
                                            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                        />
                                        <motion.span
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }}
                                            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your question..."
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                                    disabled={isLoading}
                                />
                                <motion.button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3.5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-blue-500/10"
                                >
                                    <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </motion.button>
                            </form>
                            <p className="text-[9px] text-center text-slate-400 mt-3 font-semibold tracking-wide uppercase">
                                Powered by NexusBot RAG • Grounded in verified content
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
