'use client';

import { useState } from 'react';
import { Upload, FileText, Briefcase, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function IngestForm() {
  const [content, setContent] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [category, setCategory] = useState<'Resume' | 'Job Description' | 'Custom'>('Resume');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !sourceName.trim()) {
      toast.error('Please provide both content and a source name.');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call for vector embedding
    setTimeout(() => {
      toast.success(`Successfully embedded ${sourceName} into knowledge base.`);
      setContent('');
      setSourceName('');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-black/20 border border-white/10 rounded-xl p-6 backdrop-blur-md space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Upload className="w-5 h-5 text-emerald-400" />
        <h2 className="text-lg font-medium text-white/90">Add to Knowledge Base</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'Resume', icon: FileText },
          { id: 'Job Description', icon: Briefcase },
          { id: 'Custom', icon: BookOpen }
        ].map((type) => {
          const Icon = type.icon;
          return (
            <div
              key={type.id}
              onClick={() => setCategory(type.id as any)}
              className={`p-3 rounded-lg border cursor-pointer flex flex-col items-center gap-2 transition-all ${
                category === type.id
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{type.id}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sourceName" className="text-zinc-300">Document Title</Label>
          <Input 
            id="sourceName"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            placeholder="e.g. Senior Frontend Resume 2024"
            className="bg-black/40 border-white/10 focus-visible:ring-emerald-500/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-zinc-300">Content</Label>
          <Textarea 
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste text content here to generate embeddings..."
            className="min-h-[150px] bg-black/40 border-white/10 focus-visible:ring-emerald-500/50 resize-y"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
        disabled={isSubmitting || !content || !sourceName}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Embeddings...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Ingest to Vector Store
          </>
        )}
      </Button>
    </form>
  );
}
