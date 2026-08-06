import { NextRequest, NextResponse } from 'next/server';
import { ingestText } from '@/lib/rag/ingest';

export async function POST(request: NextRequest) {
  try {
    const { text, metadata } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    const chunksAdded = await ingestText(text, metadata || { source: 'user_upload', category: 'custom' });
    return NextResponse.json({ success: true, chunksAdded });
  } catch (error) {
    console.error('RAG ingest error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ingest failed' },
      { status: 500 }
    );
  }
}
