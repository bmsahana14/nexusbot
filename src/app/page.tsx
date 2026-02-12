'use client';

import ChatWidget from '@/components/ChatWidget';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <ChatWidget />
    </main>
  );
}
