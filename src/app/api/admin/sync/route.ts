import { NextRequest, NextResponse } from 'next/server';
import { syncKnowledgeBase } from '@/lib/rag';

export async function GET(request: NextRequest) {
    try {
        console.log('Starting knowledge base sync to Supabase...');
        await syncKnowledgeBase();
        return NextResponse.json({ message: 'Knowledge base synced successfully' });
    } catch (error) {
        console.error('Sync failed:', error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
