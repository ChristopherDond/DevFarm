import { mkdir, copyFile, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true });
  for await (const entry of await readdir(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(from, to);
    else if (entry.isFile()) await copyFile(from, to);
  }
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await copyFile(path.join(root, 'index.html'), path.join(dist, 'index.html'));
await copyDir(path.join(root, 'src'), path.join(dist, 'src'));

const htmlPath = path.join(dist, 'index.html');
const html = await readFile(htmlPath, 'utf8');
await writeFile(
  htmlPath,
  html.replace('/src/styles.css', './src/styles.css').replace('/src/main.js', './src/main.js'),
  'utf8'
);

console.log('Build complete: dist/');
