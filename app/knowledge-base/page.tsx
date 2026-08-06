import { redirect } from 'next/navigation';

export default function KnowledgeBaseRedirect() {
  redirect('/dashboard?tab=knowledge');
}
