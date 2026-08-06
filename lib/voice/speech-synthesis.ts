'use client';

export interface SpeechSynthesisOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onStart?: () => void;
}

export class SpeechSynthesisService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
    }
  }

  isSupported(): boolean {
    return this.synth !== null;
  }

  speak(text: string, options?: SpeechSynthesisOptions): void {
    if (!this.synth) return;
    this.stop();

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    if (options?.rate) this.currentUtterance.rate = options.rate;
    if (options?.pitch) this.currentUtterance.pitch = options.pitch;

    if (options?.voice) {
      const voices = this.getAvailableVoices();
      const selectedVoice = voices.find(v => v.name === options.voice);
      if (selectedVoice) {
        this.currentUtterance.voice = selectedVoice;
      }
    }

    this.currentUtterance.onstart = () => {
      this.isSpeaking = true;
      if (options?.onStart) options.onStart();
    };

    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      if (options?.onEnd) options.onEnd();
    };

    this.synth.speak(this.currentUtterance);
  }

  async speakStreaming(textChunks: AsyncIterable<string>, options?: SpeechSynthesisOptions): Promise<void> {
    if (!this.synth) return;
    this.stop();

    let sentenceBuffer = '';
    
    for await (const chunk of textChunks) {
      sentenceBuffer += chunk;
      // Match punctuation denoting end of sentence
      const match = sentenceBuffer.match(/([^.!?\n]+[.!?\n]+)(.*)/);
      
      if (match) {
        const sentence = match[1].trim();
        sentenceBuffer = match[2] || '';
        if (sentence) {
          this.speakSentenceQueue(sentence, options);
        }
      }
    }

    if (sentenceBuffer.trim()) {
      this.speakSentenceQueue(sentenceBuffer.trim(), options);
    }
  }

  private speakSentenceQueue(text: string, options?: SpeechSynthesisOptions) {
    if (!this.synth) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (options?.rate) utterance.rate = options.rate;
    if (options?.pitch) utterance.pitch = options.pitch;
    
    if (options?.voice) {
      const voices = this.getAvailableVoices();
      const selectedVoice = voices.find(v => v.name === options.voice);
      if (selectedVoice) utterance.voice = selectedVoice;
    }

    utterance.onstart = () => { this.isSpeaking = true; };
    utterance.onend = () => { this.isSpeaking = this.synth?.speaking || false; };
    
    this.synth.speak(utterance);
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  getIsSpeaking(): boolean {
    return this.synth?.speaking || this.isSpeaking;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }
}
