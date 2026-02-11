# NexusBot 🤖

A transparent, floating AI chat widget powered by Retrieval-Augmented Generation (RAG) that provides accurate, grounded answers from a predefined knowledge base.

![NexusBot](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- 🎯 **Accurate Answers**: Responses grounded in verified knowledge base content
- 🛡️ **Anti-Hallucination**: Strict prompts prevent AI from making up information
- ⚡ **Lightning Fast**: Get answers in under 2 seconds
- 📚 **Rich Knowledge Base**: Comprehensive documentation on all platform topics
- 🔒 **Privacy First**: Stateless design, no personal data storage
- ✨ **Beautiful UI**: Glassmorphism design with smooth animations
- 📱 **Responsive**: Works seamlessly on desktop and mobile

## 🏗️ Architecture

NexusBot uses a RAG (Retrieval-Augmented Generation) architecture:

1. **Knowledge Base**: Markdown files containing verified information
2. **Retrieval**: Searches knowledge base for relevant content
3. **Generation**: LLM generates answers strictly from retrieved content
4. **Anti-Hallucination**: System prompts enforce grounded responses

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Groq API key (for fast LLM responses - Llama-3)
- Google AI Studio API key (for FREE embeddings)
- Supabase account (for vector storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nexusbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   GOOGLE_API_KEY=your_google_api_key_here
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Knowledge Base

The knowledge base is located in the `/knowledge` directory and contains markdown files:

- `overview.md` - Platform overview
- `rules.md` - Community rules
- `faq.md` - Frequently asked questions
- `roles.md` - User and admin roles
- `events.md` - Events and activities
- `moderation.md` - Moderation policies
- `history.md` - Platform history

### Adding New Content

1. Create a new `.md` file in the `/knowledge` directory
2. Write your content in markdown format
3. The RAG system will automatically index it

### Content Guidelines

- Use clear, concise language
- Organize with headers (##, ###)
- Include relevant keywords
- Keep sections focused

## 🎨 Customization

### Styling

The chat widget uses Tailwind CSS and can be customized in:
- `/src/components/ChatWidget.tsx` - Widget component
- `/src/app/globals.css` - Global styles

### Colors

Default gradient: Blue to Purple
```tsx
bg-gradient-to-br from-blue-500 to-purple-600
```

Change in `ChatWidget.tsx` to customize.

### Branding

Update metadata in `/src/app/layout.tsx`:
```tsx
export const metadata: Metadata = {
  title: "Your Bot Name",
  description: "Your description",
};
```

## 🔧 Configuration

### LLM Settings

Edit `/src/app/api/chat/route.ts`:

```tsx
const model = new ChatGroq({
  model: "llama-3.3-70b-versatile", // Change model
  temperature: 0, // 0 for deterministic responses
  apiKey: process.env.GROQ_API_KEY,
});
```

### Search Settings

Edit `/src/lib/rag.ts` to adjust:
- Number of retrieved documents
- Search algorithm
- Chunking strategy

## 📦 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variable: `OPENAI_API_KEY`
   - Deploy!

### Other Platforms

NexusBot can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **LLM**: LangChain + Groq (Llama-3)
- **Embeddings**: Google Gemini (100% Free)
- **Vector Database**: Supabase Vector (pgvector)
- **RAG**: Custom implementation with LangChain

## 📝 API Routes

### POST /api/chat

Send a chat message and receive a response.

**Request:**
```json
{
  "query": "What are the community rules?"
}
```

**Response:**
```json
{
  "answer": "The community rules include...",
  "sources": [
    {
      "file": "rules.md",
      "title": "Community Rules"
    }
  ]
}
```

## 🔐 Security

- No user data storage
- Stateless API design
- Environment variables for secrets
- Prompt injection prevention
- Read-only knowledge base access

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- Built with Next.js and LangChain
- Inspired by modern RAG architectures
- Designed for transparency and accuracy

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Ask NexusBot itself! 😉

---

**Built with ❤️ using Next.js, LangChain, and Framer Motion**
