import { loadEnvConfig } from '@next/env';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentDir, '../../..');
const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error('Usage: tsx scripts/with-root-env.ts <command> [...args]');
  process.exit(1);
}

loadEnvConfig(repoRoot);

const child = spawn(command, args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
