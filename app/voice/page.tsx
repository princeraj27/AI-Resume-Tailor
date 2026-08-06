import { redirect } from 'next/navigation';

export default function VoiceRedirect() {
  redirect('/practice?mode=voice');
}
