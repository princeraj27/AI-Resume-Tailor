import { NextRequest, NextResponse } from 'next/server';
import { retrieveContext } from '@/lib/rag/retriever';

export async function POST(request: NextRequest) {
  try {
    const { query, category, k } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    const results = await retrieveContext(query, { category, k: k || 5 });
    return NextResponse.json({ results });
  } catch (error) {
    console.error('RAG query error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Query failed' },
      { status: 500 }
    );
  }
}
