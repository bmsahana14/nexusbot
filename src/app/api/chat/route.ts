import { NextRequest, NextResponse } from 'next/server';
import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { searchKnowledgeBase } from '@/lib/rag';

export async function POST(request: NextRequest) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s global safety timeout

    try {
        const { query } = await request.json();

        if (!query || typeof query !== 'string') {
            return NextResponse.json(
                { error: 'Invalid query' },
                { status: 400 }
            );
        }

        if (!process.env.GROQ_API_KEY) {
            console.error('[Chat API] Missing GROQ_API_KEY');
            return NextResponse.json(
                { error: 'Server configuration error: Missing LLM API Key' },
                { status: 500 }
            );
        }

        if (!process.env.GOOGLE_API_KEY) {
            console.error('[Chat API] Missing GOOGLE_API_KEY');
            return NextResponse.json(
                { error: 'Server configuration error: Missing Google API Key for embeddings' },
                { status: 500 }
            );
        }

        console.log(`[Chat API] Processing query: "${query}"`);

        // Handle Greetings
        const greetings = ['hi', 'hello', 'hey', 'greetings', 'hola', 'yo'];
        const cleanQuery = query.toLowerCase().trim().replace(/[!?.]/g, '');
        if (greetings.includes(cleanQuery)) {
            return NextResponse.json({
                answer: "Hello! I'm NexusBot, your TechNexus community assistant. How can I help you today? You can ask me about our upcoming events, community rules, or different user roles.",
                sources: []
            });
        }

        // Search knowledge base
        const startSearch = Date.now();
        const relevantDocs = await searchKnowledgeBase(query);
        console.log(`[Chat API] Search took ${Date.now() - startSearch}ms. Found ${relevantDocs.length} docs.`);

        // Even if no docs, we might want to let the fallback handle it, 
        // but currently we return specific response.
        if (relevantDocs.length === 0) {
            return NextResponse.json({
                answer: "I couldn't find a specific answer in my current knowledge base for that. However, I can help you with questions about TechNexus events, community rules, or roles. Could you try rephrasing or asking about one of those topics?",
                sources: []
            });
        }

        // Prepare context
        const context = relevantDocs
            .map((doc) => `[Source: ${doc.metadata.title}]\n${doc.content}`)
            .join('\n\n');

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", `You are NexusBot, the official AI assistant for the TechNexus Community. Your goal is to provide accurate, helpful, and concise information based ONLY on the provided knowledge base context.

PERSONALITY:
- Professional yet friendly and community-oriented.
- Helpful and direct.

STRICT RESPONSE RULES:
1. **Groundedness**: Answer ONLY using the information in the provided context. If the information is not there, politely state that you don't have that information in your knowledge base.
2. **Citations**: Mention the source title naturally if relevant (e.g., "Based on the FAQ..."), but NEVER used document numbers like "Document 1" or "Document 2".
3. **Formatting**: Use markdown for structure (bullet points, bold text) to make answers easy to read.
4. **Conciseness**: Keep answers under 150 words.

CONTEXT:
{context}`],
            ["human", "{question}"]
        ]);

        const model = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.3-70b-versatile",
            temperature: 0,
        });

        const formattedPrompt = await prompt.format({
            context,
            question: query
        });

        console.log(`[Chat API] Requesting LLM response...`);
        const startLLM = Date.now();

        // Get response from LLM with signal for timeout
        const response = await model.invoke(formattedPrompt, {
            signal: controller.signal
        });

        console.log(`[Chat API] LLM response took ${Date.now() - startLLM}ms.`);

        const sources = relevantDocs.map((doc) => ({
            file: doc.metadata.source,
            title: doc.metadata.title
        }));

        return NextResponse.json({
            answer: response.content,
            sources
        });

    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error('[Chat API] Request timed out after 20 seconds');
            return NextResponse.json(
                { error: 'Request timed out. Please try again with a shorter question.' },
                { status: 504 }
            );
        }
        console.error('[Chat API] Critical Error:', error.message || error);
        return NextResponse.json(
            {
                error: 'An error occurred processing your request',
                details: error.message || String(error)
            },
            { status: 500 }
        );
    } finally {
        clearTimeout(timeoutId);
    }
}
