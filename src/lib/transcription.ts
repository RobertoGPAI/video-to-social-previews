import { generateTranscription } from '@tanstack/ai';
import fs from 'node:fs/promises';
import path from 'node:path';
import { whisperAdapter } from '../whisper-adapter';

export interface TranscriptionResult {
  srtText: string;
  transcriptText: string;
}

export async function transcribe(wavPath: string, outDir: string): Promise<TranscriptionResult> {
  // Check for existing transcripts
  const existingSrcText = await fs.readFile(path.join(outDir, 'transcript.txt')).catch(() => null);
  const existingTranscript = await fs.readFile(path.join(outDir, 'original_transcript.txt')).catch(() => null);

  if (existingSrcText && existingTranscript) {
    return {
      srtText: existingTranscript.toString('utf8'),
      transcriptText: existingSrcText.toString('utf8'),
    };
  }

  // Perform new transcription
  const buf = await fs.readFile(wavPath);
  const blob = new Blob([buf]);

  const result = await generateTranscription({
    adapter: whisperAdapter,
    audio: blob,
    language: 'es',
  });

  // Save transcription results
  await fs.writeFile(path.join(outDir, 'transcript.txt'), result.text, 'utf8');
  await fs.writeFile(path.join(outDir, 'original_transcript.txt'), result.text, 'utf8');

  return {
    srtText: result.text,
    transcriptText: result.text,
  };
}

export function hasExistingTranscript(existingResult: TranscriptionResult | null): existingResult is TranscriptionResult {
  return existingResult !== null;
}
