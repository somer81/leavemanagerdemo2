// `npm run dev`: starts the API and the web dev server together (spec 0001, R-5).
// Dev only — never part of scripts/check. Stops both when either exits or on Ctrl+C.
import { spawn } from 'node:child_process';

const apiPort = process.env.API_PORT ?? '3000';
const children = [
  spawn('npm', ['run', 'dev', '-w', '@leave/api'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: apiPort },
  }),
  spawn('npm', ['run', 'dev', '-w', '@leave/web'], {
    stdio: 'inherit',
    env: { ...process.env, API_PORT: apiPort },
  }),
];

let stopping = false;
function stopAll(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null) child.kill('SIGTERM');
  }
  process.exitCode = code;
}

for (const child of children) {
  child.on('exit', (code) => stopAll(code ?? 0));
}
process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
