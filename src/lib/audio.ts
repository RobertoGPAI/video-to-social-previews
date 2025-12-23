import { execa } from 'execa';
import path from 'node:path';

export async function extractWav(inputPath: string, outDir: string): Promise<string> {
  const wavPath = path.join(outDir, 'audio_16k.wav');

  await execa('ffmpeg', [
    '-y',
    '-i', inputPath,
    '-ac', '1',
    '-ar', '16000',
    wavPath,
  ], { stdio: 'pipe' });

  return wavPath;
}
