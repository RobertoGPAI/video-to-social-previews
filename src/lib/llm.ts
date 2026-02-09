import { chat } from '@tanstack/ai';
import { ollamaText } from '@tanstack/ai-ollama';
import { outputSchema, type Output } from './schemas';
import { makeSystemPrompt } from './prompts';

export async function generateMetadata(transcript: string): Promise<Output> {
  // Forzamos el uso del adaptador de Ollama y el modelo que descargaste
  const adapter = ollamaText('llama3'); 

  const response = await chat({
    adapter,
    systemPrompts: makeSystemPrompt(),
    outputSchema,
    messages: [
      {
        role: 'user',
        content: `\nTranscript of the video:\n${transcript}`,
      },
    ],
  });

  return response;
}