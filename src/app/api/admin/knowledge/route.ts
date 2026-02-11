import { NextRequest, NextResponse } from 'next/server';
import { loadKnowledgeBase } from '@/lib/rag';

export async function GET(request: NextRequest) {
    try {
        const documents = await loadKnowledgeBase();
        const files = documents.map(doc => ({
            name: doc.metadata.source,
            title: doc.metadata.title,
            length: doc.content.length
        }));
        return NextResponse.json({ files });
    } catch (error) {
        console.error('Failed to load knowledge base:', error);
        return NextResponse.json({ error: 'Failed to load knowledge base' }, { status: 500 });
    }
}
