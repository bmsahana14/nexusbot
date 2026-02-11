import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { TaskType } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import { Document as LangChainDocument } from 'langchain/document';

// Initialize Supabase configuration lazily to prevent import-time errors
const getSupabaseClient = () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('Supabase environment variables (URL/KEY) are missing. Check your .env file.');
    }
    return createClient(url, key);
};

// Use a lazy client to avoid top-level crashes
let _supabaseClient: any = null;
const supabaseClient = () => {
    if (!_supabaseClient) _supabaseClient = getSupabaseClient();
    return _supabaseClient;
};

export interface Document {
    content: string;
    metadata: {
        source: string;
        title: string;
    };
}

// Singleton instances for performance
let cachedVectorStore: SupabaseVectorStore | null = null;
let kbCache: Document[] | null = null;

// Custom embedding object for Gemini with outputDimensionality support
const geminiEmbeddings = {
    embedDocuments: async (texts: string[]): Promise<number[][]> => {
        const results: number[][] = [];
        const batchSize = 5; // Process 5 at a time
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            console.log(`[RAG] Embedding batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(texts.length / batchSize)}...`);
            const batchResults = await Promise.all(batch.map(text => geminiEmbeddings.embedQuery(text)));
            results.push(...batchResults);
        }
        return results;
    },

    embedQuery: async (text: string): Promise<number[]> => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

        try {
            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GOOGLE_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: { parts: [{ text }] },
                    outputDimensionality: 768
                }),
                signal: controller.signal
            });

            if (!resp.ok) {
                const err = await resp.text();
                throw new Error(`Google API Error (${resp.status}): ${err}`);
            }

            const data: any = await resp.json();
            if (data.embedding) return data.embedding.values;
            throw new Error(`Embedding failed: ${JSON.stringify(data)}`);
        } catch (error: any) {
            console.error(`[RAG] Embedding error for text "${text.substring(0, 50)}...":`, error.message);
            throw error;
        } finally {
            clearTimeout(timeout);
        }
    }
};

/**
 * Get or initialize the Supabase Vector Store
 */
export async function getVectorStore() {
    if (cachedVectorStore) return cachedVectorStore;

    cachedVectorStore = new SupabaseVectorStore(geminiEmbeddings as any, {
        client: supabaseClient(),
        tableName: 'documents',
        queryName: 'match_documents',
    });

    return cachedVectorStore;
}

/**
 * Ingest or Refresh the knowledge base into Supabase
 * You can call this from a script or an admin route
 */
export async function syncKnowledgeBase() {
    const knowledgeDir = path.join(process.cwd(), 'knowledge');
    if (!fs.existsSync(knowledgeDir)) return;

    const files = fs.readdirSync(knowledgeDir);
    const docs: LangChainDocument[] = [];
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    for (const file of files) {
        if (file.endsWith('.md')) {
            const filePath = path.join(knowledgeDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const { data, content } = matter(fileContent);
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = data.title || (titleMatch ? titleMatch[1] : file.replace('.md', ''));

            const splitDocs = await splitter.createDocuments([content], [{ source: file, title }]);
            docs.push(...splitDocs);
        }
    }

    console.log(`[RAG] Split into ${docs.length} chunks. Syncing to Supabase...`);
    const vectorStore = await getVectorStore();
    console.log('[RAG] Clearing existing documents...');
    await supabaseClient().from('documents').delete().neq('id', 0);
    console.log('[RAG] Adding new documents...');
    await vectorStore.addDocuments(docs);
    console.log('[RAG] Sync complete.');
    kbCache = null; // Invalidate cache
}

/**
 * Search knowledge base using Supabase vector search
 */
export async function searchKnowledgeBase(query: string): Promise<Document[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // Increased to 10s budget

    try {
        const vectorStore = await getVectorStore();

        // Wrap similarity search in a timeout race
        const results = await Promise.race([
            vectorStore.similaritySearch(query, 4),
            new Promise<never>((_, reject) => {
                controller.signal.addEventListener('abort', () => reject(new Error('Vector search timed out')));
            })
        ]);

        clearTimeout(timeout);

        if (results && results.length > 0) {
            return results.map(doc => ({
                content: doc.pageContent,
                metadata: {
                    source: doc.metadata.source,
                    title: doc.metadata.title
                }
            }));
        }

        return performLocalFallback(query);
    } catch (error) {
        clearTimeout(timeout);
        console.warn('[RAG] Vector search bypassed:', (error as Error).message);
        return performLocalFallback(query);
    }
}

async function performLocalFallback(query: string): Promise<Document[]> {
    try {
        const knowledgeDocs = await loadKnowledgeBase();
        const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);

        return knowledgeDocs
            .filter(doc => {
                const contentLower = doc.content.toLowerCase();
                return queryTerms.some(term => contentLower.includes(term));
            })
            .slice(0, 3);
    } catch (e) {
        return [];
    }
}

/**
 * Load all knowledge base files (with caching)
 */
export async function loadKnowledgeBase(): Promise<Document[]> {
    if (kbCache) return kbCache;

    const knowledgeDir = path.join(process.cwd(), 'knowledge');
    if (!fs.existsSync(knowledgeDir)) return [];

    const files = fs.readdirSync(knowledgeDir);
    const documents: Document[] = [];

    for (const file of files) {
        if (file.endsWith('.md')) {
            const filePath = path.join(knowledgeDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const { data, content } = matter(fileContent);
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = data.title || (titleMatch ? titleMatch[1] : file.replace('.md', ''));

            documents.push({
                content,
                metadata: { source: file, title }
            });
        }
    }

    kbCache = documents;
    return documents;
}
