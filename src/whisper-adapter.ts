import { TranscriptionAdapter, TranscriptionOptions, TranscriptionResult } from "@tanstack/ai";

const {
  WHISPER_API_URL,
  WHISPER_API_LANGUAGE = '',
  WHISPER_API_TASK = 'transcribe',
  WHISPER_API_WORD_TS = 'false',
} = process.env as Record<string, string>;

class WhisperAdapter implements TranscriptionAdapter {
  constructor(public apiUrl: string, public language: string) { }

  name = 'Whisper API Adapter';
  declare kind: 'transcription';
  model = 'whisper-api';
  declare "~types": {
    providerOptions: Record<string, any>;
  }
  async transcribe(options: TranscriptionOptions): Promise<TranscriptionResult> {

    const form = new FormData();
    form.append('file', options.audio as Blob, 'audio.wav');
    if (options.language) form.append('language', options.language);
    form.append('task', WHISPER_API_TASK);
    if (WHISPER_API_WORD_TS === 'true') form.append('word_ts', 'true');
    const res = await fetch(`${WHISPER_API_URL.replace(/\/$/, '')}/transcribe`, {
      method: 'POST',
      body: form
    });
    if (!res.ok) {
      throw new Error(`Whisper API request failed with status ${res.status}`);
    }
    const data = await res.json();
    const srtText: string = data.srt || (data.segments?.map((s: any) => `${s.text}`).join('\n') ?? '');

    return {
      id: "",
      text: srtText,
      model: "whisper"
    };
  }
}
export const whisperAdapter = new WhisperAdapter(WHISPER_API_URL, WHISPER_API_LANGUAGE);
