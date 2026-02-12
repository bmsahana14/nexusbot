# NexusBot 🤖

A lightweight, standalone AI chat widget powered by Retrieval-Augmented Generation (RAG). This repository is optimized for easy integration into existing websites.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- 🎯 **Grounded Answers**: Responses strictly based on your verified knowledge base.
- ⚡ **High Performance**: Powered by Groq (Llama-3) for near-instant responses.
- 🎨 **Modern UI**: Clean, light-themed chat interface with smooth animations.
- 📚 **Markdown Support**: Handles rich formatting in both input and output.
- 📱 **Mobile Ready**: Fully responsive design.

## 🚀 Setup & Integration

### 1. Configure Environment
Create a `.env` file with the following keys:
```env
GROQ_API_KEY=your_key
GOOGLE_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_role_key
```

### 2. Add Your Knowledge
Place your `.md` files in the `/knowledge` directory. These files form the "brain" of your bot.

### 3. Run Locally
```bash
npm install
npm run dev
```

### 4. Embed in Your Website
Once deployed, you can add this bot to any website using an iframe:
```html
<iframe 
  src="https://your-deployment.vercel.app" 
  style="width: 400px; height: 600px; border: none; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);"
></iframe>
```

## 🏗️ Tech Stack
- **AI**: LangChain + Groq (Llama-3.3-70b)
- **Embeddings**: Google Gemini (gemini-embedding-001)
- **Database**: Supabase Vector (pgvector)
- **Frontend**: Next.js 16 + Tailwind CSS 4 + Framer Motion
