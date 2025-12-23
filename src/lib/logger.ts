import chalk from 'chalk';
import ora, { type Ora } from 'ora';

// ASCII art banner
export const banner = `
${chalk.cyan.bold('╔═══════════════════════════════════════════════════════════╗')}
${chalk.cyan.bold('║')}  ${chalk.magenta.bold('🎬 Video Processing Pipeline')}                             ${chalk.cyan.bold('║')}
${chalk.cyan.bold('║')}  ${chalk.gray('Transcription → Metadata → Social Copy → Blog')}            ${chalk.cyan.bold('║')}
${chalk.cyan.bold('╚═══════════════════════════════════════════════════════════╝')}
`;

export const divider = chalk.gray('─'.repeat(60));

export const logger = {
  banner: () => console.log(banner),
  divider: () => console.log(divider),

  info: (msg: string) => console.log(chalk.blue('ℹ'), chalk.white(msg)),
  success: (msg: string) => console.log(chalk.green('✔'), chalk.white(msg)),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), chalk.yellow(msg)),
  error: (msg: string) => console.log(chalk.red('✖'), chalk.red(msg)),

  step: (current: number, total: number, msg: string) => {
    const progress = chalk.cyan(`[${current}/${total}]`);
    console.log(`\n${progress} ${chalk.bold(msg)}`);
  },

  file: (label: string, path: string) => {
    console.log(chalk.gray('  →'), chalk.dim(label + ':'), chalk.green(path));
  },

  header: (text: string) => {
    console.log(`\n${chalk.cyan.bold('▸')} ${chalk.bold.white(text)}`);
  },

  done: (outputDir: string) => {
    console.log('\n' + chalk.green.bold('✨ Processing complete!'));
    console.log(chalk.gray('   Output directory:'), chalk.cyan(outputDir));
  },

  watchMode: (dir: string, transcriptOnly: boolean) => {
    console.log(chalk.yellow.bold('\n👁  Watch Mode Active'));
    console.log(chalk.gray('   Monitoring:'), chalk.cyan(dir));
    if (transcriptOnly) {
      console.log(chalk.gray('   Mode:'), chalk.yellow('Transcript only'));
    }
    console.log(chalk.gray('   Press'), chalk.white('Ctrl+C'), chalk.gray('to stop\n'));
  },
};

export function createSpinner(text: string): Ora {
  return ora({
    text,
    spinner: 'dots',
    color: 'cyan',
  });
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
