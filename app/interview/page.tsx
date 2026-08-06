import { redirect } from 'next/navigation';

export default function InterviewRedirect() {
  redirect('/practice?mode=text');
}
