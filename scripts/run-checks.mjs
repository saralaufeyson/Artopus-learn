import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const typecheck = [['packages/shared', 'build'], ['packages/shared', 'typecheck'], ['apps/api', 'typecheck'], ['apps/web', 'typecheck']];
const test = [['packages/shared', 'build'], ['apps/api', 'test'], ['packages/shared', 'test']];
const build = [['packages/shared', 'build'], ['apps/api', 'build'], ['apps/web', 'build']];
const tasks = { typecheck, test, build, check: [...typecheck, ['.', 'lint'], ...test, ...build] };
const jobs = tasks[process.argv[2]];
if (!jobs) { console.error('Choose typecheck, test, build or check.'); process.exit(1); }
const pathKey = Object.keys(process.env).find(key => key.toLowerCase() === 'path') || 'PATH';
for (const [directory, task] of jobs) {
  const cwd = path.join(root, directory);
  const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
  const command = pkg.scripts[task];
  console.log('Checking ' + pkg.name + ': ' + task);
  const code = await new Promise((resolve, reject) => {
    const child = spawn(command, { cwd, shell: true, stdio: 'inherit', env: { ...process.env, [pathKey]: path.join(root, 'node_modules', '.bin') + path.delimiter + (process.env[pathKey] || '') } });
    child.once('error', reject); child.once('exit', code => resolve(code ?? 1));
  });
  if (code) process.exit(code);
}
