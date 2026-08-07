'use client';

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isActive = false;
  private options: SpeechRecognitionOptions | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI();
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }
  
  start(options: SpeechRecognitionOptions): void {
    if (!this.recognition) return;

    // Stop any previous session cleanly
    if (this.isActive) {
      try { this.recognition.abort(); } catch {}
      this.isActive = false;
    }

    this.options = options;

    const defaultLang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-IN';
    this.recognition.lang = options.language || defaultLang;
    this.recognition.continuous = options.continuous ?? true;
    this.recognition.interimResults = options.interimResults ?? true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      // Accumulate ALL results from index 0 to get the complete transcript
      let fullTranscript = '';
      let latestIsFinal = false;

      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          latestIsFinal = true;
        }
      }

      if (options.onResult) {
        options.onResult(fullTranscript.trim(), latestIsFinal);
      }
    };

    this.recognition.onend = () => {
      this.isActive = false;
      if (options.onEnd) options.onEnd();
    };

    this.recognition.onerror = (event: any) => {
      // 'no-speech' and 'aborted' are not real errors
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      this.isActive = false;
      if (options.onError) options.onError(event.error);
    };

    try {
      this.recognition.start();
      this.isActive = true;
    } catch (e) {
      // If already started, ignore
      console.warn('Speech recognition start warning:', e);
    }
  }

  stop(): void {
    if (this.recognition && this.isActive) {
      try {
        this.recognition.stop();
      } catch {
        // Already stopped
      }
      this.isActive = false;
    }
  }

  abort(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.isActive = false;
    }
  }

  getIsListening(): boolean {
    return this.isActive;
  }
}
