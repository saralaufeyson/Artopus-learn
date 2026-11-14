import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { loadEnv } from 'vite';
Object.assign(process.env, loadEnv('production', process.cwd(), ''));
const { render, publicPages } = await import('../dist/server/entry-server.js');
const output = fileURLToPath(new URL('../dist/', import.meta.url));
const index = await readFile(join(output, 'index.html'), 'utf8');
const templateFile = join(output, 'server', 'template.html');
let template;
if (index.includes('<!--app-html-->')) {
  template = index;
  await writeFile(templateFile, index);
} else {
  template = await readFile(templateFile, 'utf8');
}
template = template.replace(/<title>.*?<\/title>/, '');
const api = process.env.VITE_PRERENDER_API_URL || 'http://127.0.0.1:4000/api/v1';
const response = await fetch(api + '/content/routes', { signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error('Prerendering needs the public API. Start the API and verify its MongoDB connection.');
const { data: dynamicRoutes } = await response.json();
const paths = [...publicPages.map(page => page.path), ...dynamicRoutes.map(route => route.path), '/admin/login'];
for (const url of paths) {
  if (!/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/?)*$/.test(url)) throw new Error('Unsafe public route');
  const rendered = await render(url);
  const directory = join(output, url.slice(1));
  await mkdir(directory, { recursive: true });
  const html = template.replace('<!--app-html-->', () => rendered.html).replace('<!--app-head-->', () => rendered.head).replace('<!--app-state-->', () => '<script type="application/json" id="artopus-query-state">' + rendered.state + '</script>');
  await writeFile(join(directory, 'index.html'), html);
  if (url !== '/') await writeFile(join(output, url.slice(1) + '.html'), html);
}
const missing = await render('/not-found');
await writeFile(join(output, '404.html'), template.replace('<!--app-html-->', () => missing.html).replace('<!--app-head-->', () => missing.head).replace('<!--app-state-->', () => '<script type="application/json" id="artopus-query-state">' + missing.state + '</script>'));
console.info('Prerendered ' + paths.length + ' pages from published API content. Demo noindex remains enabled.');
