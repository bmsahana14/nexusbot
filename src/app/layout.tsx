import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexusBot | TechNexus Community AI Assistant",
  description: "Intelligent AI assistant for the TechNexus Community. Get accurate, grounded answers about events, rules, and roles with zero hallucinations.",
  keywords: ["AI", "Chatbot", "RAG", "TechNexus", "Community", "Assistant"],
  authors: [{ name: "TechNexus Community" }],
  openGraph: {
    title: "NexusBot 🤖",
    description: "Your intelligent guide to the TechNexus Community.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
