

export const config = {
  whisperApiUrl: process.env.WHISPER_API_URL || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  outDir: process.env.OUT_DIR || './dist',
  defaultInbox: './inbox',
} as const;

export function validateConfig(): void {
  if (!config.whisperApiUrl) {
    throw new Error('WHISPER_API_URL environment variable is not set');
  }
}
