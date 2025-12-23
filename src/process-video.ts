import chalk from 'chalk';
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  config,
  createSpinner,
  ensureDir,
  exists,
  extractWav,
  formatDuration,
  generateMetadata,
  getOutputPath,
  logger,
  transcribe,
  writeOutputs,
  writeTranscriptOnly,
} from './lib';

// Re-export types for external use
export type { Output } from './lib/schemas';

async function processVideo(mp4Path: string, transcriptOnly = false): Promise<void> {
  const startTime = Date.now();
  const abs = path.resolve(mp4Path);
  const outBase = getOutputPath(abs, config.outDir);

  await ensureDir(outBase);

  logger.banner();
  logger.info(`Processing: ${chalk.cyan(path.basename(abs))}`);
  logger.info(`Output: ${chalk.dim(outBase)}`);
  logger.divider();

  const totalSteps = transcriptOnly ? 3 : 4;

  // Step 1: Extract audio
  logger.step(1, totalSteps, 'Extracting audio from video');
  const audioSpinner = createSpinner('Running FFmpeg...').start();

  try {
    const wav = await extractWav(abs, outBase);
    audioSpinner.succeed(chalk.green('Audio extracted successfully'));
    logger.file('WAV file', wav);

    // Step 2: Transcribe
    logger.step(2, totalSteps, 'Transcribing audio');
    const transcribeSpinner = createSpinner('Sending to Whisper API...').start();

    const { srtText } = await transcribe(wav, outBase);
    transcribeSpinner.succeed(chalk.green('Transcription complete'));
    logger.file('Transcript', path.join(outBase, 'transcript.txt'));

    if (transcriptOnly) {
      // Step 3: Write transcript only
      logger.step(3, totalSteps, 'Writing transcript files');
      const writeSpinner = createSpinner('Saving files...').start();

      await writeTranscriptOnly(outBase, srtText);
      writeSpinner.succeed(chalk.green('Transcript files saved'));

      printCompletionSummary(outBase, startTime, true);
      return;
    }

    // Step 3: Generate metadata with LLM
    logger.step(3, totalSteps, 'Generating metadata with LLM');
    const llmSpinner = createSpinner('Analyzing transcript and generating content...').start();

    const outputs = await generateMetadata(srtText);
    llmSpinner.succeed(chalk.green('Content generated successfully'));

    // Step 4: Write all outputs
    logger.step(4, totalSteps, 'Writing output files');
    const outputSpinner = createSpinner('Saving all files...').start();

    await writeOutputs(outBase, outputs, srtText, srtText);
    outputSpinner.succeed(chalk.green('All files saved'));

    printCompletionSummary(outBase, startTime, false);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Processing failed: ${errorMessage}`);
    throw error;
  }
}

function printCompletionSummary(outBase: string, startTime: number, transcriptOnly: boolean): void {
  const duration = formatDuration(Date.now() - startTime);

  logger.divider();
  logger.done(outBase);
  console.log(chalk.gray('   Duration:'), chalk.yellow(duration));
  console.log();

  logger.header('Generated Files');

  if (transcriptOnly) {
    logger.file('Transcript (SRT)', 'transcript.srt');
    logger.file('Transcript (TXT)', 'transcript.txt');
  } else {
    logger.file('YouTube metadata', 'youtube.md');
    logger.file('Social media copy', 'socials.md');
    logger.file('Blog post', 'blog.md');
    logger.file('Transcript (SRT)', 'transcript.srt');
    logger.file('Transcript (TXT)', 'transcript.txt');
  }

  console.log();
}

// ─────────────────────────────────────────────────────────────
// CLI Entry Point
// ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function printHelp(): void {
  logger.banner();
  console.log(chalk.bold('Usage:'));
  console.log(chalk.gray('  pnpm generate <path/to/video.mp4>') + chalk.dim(' [options]'));
  console.log(chalk.gray('  pnpm generate --watch <dir>') + chalk.dim(' [options]'));
  console.log();
  console.log(chalk.bold('Options:'));
  console.log(chalk.cyan('  --watch <dir>') + chalk.gray('       Watch a folder for new .mp4 files'));
  console.log(chalk.cyan('  --transcriptOnly') + chalk.gray('    Only generate transcript, skip LLM'));
  console.log(chalk.cyan('  --help') + chalk.gray('              Show this help message'));
  console.log();
  console.log(chalk.bold('Examples:'));
  console.log(chalk.dim('  pnpm generate video.mp4'));
  console.log(chalk.dim('  pnpm generate ./inbox/tutorial.mp4 --transcriptOnly'));
  console.log(chalk.dim('  pnpm generate --watch ./inbox'));
  console.log();
}

if (args[0] === '--help' || args.length === 0) {
  printHelp();
  process.exit(0);
}

const transcriptOnly = args.includes('--transcriptOnly');
const filteredArgs = args.filter(arg => arg !== '--transcriptOnly');

if (filteredArgs[0] === '--watch') {
  const dir = path.resolve(filteredArgs[1] || config.defaultInbox);

  logger.banner();
  logger.watchMode(dir, transcriptOnly);

  await ensureDir(dir);
  const seen = new Set<string>();

  setInterval(async () => {
    const files = await fs.readdir(dir);
    for (const f of files) {
      if (f.endsWith('.mp4')) {
        const full = path.join(dir, f);
        if (seen.has(full)) continue;
        seen.add(full);

        console.log(chalk.yellow('\n📥 New file detected:'), chalk.cyan(f));

        processVideo(full, transcriptOnly).catch(err => {
          logger.error(`Failed to process ${f}: ${err.message}`);
          seen.delete(full);
        });
      }
    }
  }, 2000);
} else {
  const file = filteredArgs[0].startsWith('./inbox/')
    ? filteredArgs[0]
    : './inbox/' + filteredArgs[0];

  if (!file) {
    logger.error('Please provide a path to an .mp4 file');
    process.exit(1);
  }

  if (!(await exists(file))) {
    logger.error(`File does not exist: ${file}`);
    process.exit(1);
  }

  await processVideo(file, transcriptOnly);
}
