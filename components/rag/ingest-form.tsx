'use client';

import { useState } from 'react';
import { Upload, FileText, Briefcase, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ragIngest } from '@/lib/api';

export function IngestForm() {
  const [content, setContent] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [category, setCategory] = useState<'Resume' | 'Job Description' | 'Custom'>('Resume');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !sourceName.trim()) {
      toast.error('Please provide both content and a document title.');
      return;
    }

    setIsSubmitting(true);
    try {
      await ragIngest(content, { source: sourceName, category });
      toast.success(`Successfully embedded "${sourceName}" into vector store.`);
      setContent('');
      setSourceName('');
    } catch (err) {
      toast.error('Failed to ingest document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-5 space-y-5 border border-border bg-card text-card-foreground">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Upload className="w-5 h-5 text-emerald-500" />
        <h3 className="font-bold text-base">Ingest Custom Knowledge</h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { id: 'Resume', icon: FileText },
          { id: 'Job Description', icon: Briefcase },
          { id: 'Custom', icon: BookOpen }
        ].map((type) => {
          const Icon = type.icon;
          const isSelected = category === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setCategory(type.id as any)}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors ${
                isSelected
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                  : 'bg-card border-border hover:bg-muted text-muted-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{type.id}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="sourceName" className="text-xs">Document Title</Label>
          <Input 
            id="sourceName"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            placeholder="e.g. Senior Technical Lead Resume 2025"
            className="text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="content" className="text-xs">Content Text</Label>
          <Textarea 
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste text content here to generate vector embeddings..."
            className="min-h-[140px] text-sm resize-y"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full gap-2"
          disabled={isSubmitting || !content.trim() || !sourceName.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Ingesting to RAG Vector Store...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" /> Add to RAG Vector Store
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
