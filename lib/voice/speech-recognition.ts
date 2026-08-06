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
  private isListening = false;

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

    const defaultLang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-IN';
    this.recognition.lang = options.language || defaultLang;
    this.recognition.continuous = options.continuous ?? false;
    this.recognition.interimResults = options.interimResults ?? false;

    this.recognition.onresult = (event: any) => {
      let fullTranscript = '';
      let isFinal = false;

      for (let i = 0; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }

      if (options.onResult) {
        options.onResult(fullTranscript.trim(), isFinal);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (options.onEnd) options.onEnd();
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      if (options.onError) options.onError(event.error);
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.error('Speech recognition start error:', e);
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}
