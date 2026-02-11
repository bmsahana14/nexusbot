'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface KBFile {
    name: string;
    title: string;
    length: number;
}

export default function AdminDashboard() {
    const [files, setFiles] = useState<KBFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/knowledge');
            const data = await response.json();
            setFiles(data.files || []);
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncMessage('Syncing knowledge base to Supabase...');
        try {
            const response = await fetch('/api/admin/sync');
            const data = await response.json();
            if (response.ok) {
                setSyncMessage('✅ ' + (data.message || 'Sync successful!'));
            } else {
                setSyncMessage('❌ ' + (data.error || 'Sync failed.'));
            }
        } catch (error) {
            setSyncMessage('❌ Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsSyncing(false);
            setTimeout(() => setSyncMessage(''), 5000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                            NexusBot Admin
                        </h1>
                        <p className="text-slate-400">Manage your RAG knowledge base and sync vectors.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {syncMessage && (
                            <motion.span
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-sm font-medium"
                            >
                                {syncMessage}
                            </motion.span>
                        )}
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={`px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg ${isSyncing
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-blue-500/20'
                                }`}
                        >
                            {isSyncing ? 'Syncing...' : 'Sync Knowledge Base'}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl"
                    >
                        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4">Total Documents</h3>
                        <p className="text-5xl font-bold">{files.length}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl"
                    >
                        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4">Vector Database</h3>
                        <p className="text-2xl font-bold text-green-400 flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                            Active
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl"
                    >
                        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4">LLM Provider</h3>
                        <p className="text-2xl font-bold text-blue-400">Groq (Llama-3)</p>
                    </motion.div>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        📂 Knowledge Files
                        <span className="text-sm font-normal text-slate-500 bg-slate-800 px-3 py-1 rounded-full">{files.length} found</span>
                    </h2>

                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {files.map((file, i) => (
                                <motion.div
                                    key={file.name}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.05 * i }}
                                    className="bg-slate-900/40 border border-white/5 p-5 rounded-xl hover:border-white/10 transition-colors group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-xl">
                                            📄
                                        </div>
                                        <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                            {file.name.split('.').pop()}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                                        {file.title}
                                    </h4>
                                    <p className="text-slate-500 text-xs mt-1 mb-4 truncate italic">
                                        {file.name}
                                    </p>
                                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                        <span className="text-xs text-slate-400">
                                            {Math.round(file.length / 1024 * 10) / 10} KB
                                        </span>
                                        <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                                            View Content →
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
