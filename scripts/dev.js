/**
 * Lance le backend et le frontend en parallèle (sans dépendance externe).
 * Usage : npm run dev
 */
import { spawn } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const procs = ['server', 'client'].map((dir) =>
  spawn(npm, ['run', 'dev', '--prefix', dir], { stdio: 'inherit', shell: process.platform === 'win32' }),
);

const stopAll = () => procs.forEach((p) => p.kill());
process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);
procs.forEach((p) => p.on('exit', (code) => { stopAll(); process.exit(code ?? 0); }));
