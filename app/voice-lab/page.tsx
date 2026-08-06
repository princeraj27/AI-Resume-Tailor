import { redirect } from 'next/navigation';

export default function VoiceLabRedirect() {
  redirect('/practice?mode=voice');
}
