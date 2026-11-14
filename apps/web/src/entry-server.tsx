import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { safeHref } from '@artopus/shared';
import { App } from './App';
import { settingsQuery, categoriesQuery, classesQuery, eventsQuery, blogsQuery, classQuery, eventQuery, blogQuery } from './services/public-queries';
const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
export async function render(url: string) {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: false } } });
  const settings = await client.fetchQuery(settingsQuery());
  let title = settings.seoDefaults.title;
  let description = settings.seoDefaults.description;
  if (url === '/') await Promise.all([client.fetchQuery(classesQuery('limit=3')), client.fetchQuery(eventsQuery('limit=3&status=upcoming')), client.fetchQuery(eventsQuery('limit=3&status=completed')), client.fetchQuery(blogsQuery('limit=3'))]);
  else if (url === '/classes') { title = 'Drawing classes | Artopus Learn'; await client.fetchQuery(classesQuery('limit=12&page=1')); }
  else if (url === '/events') { title = 'Creative events | Artopus Learn'; await client.fetchQuery(eventsQuery('limit=6&page=1&status=upcoming')); }
  else if (url === '/blog') { title = 'The creative journal | Artopus Learn'; await Promise.all([client.fetchQuery(blogsQuery('limit=6&page=1')), client.fetchQuery(categoriesQuery())]); }
  else if (url.startsWith('/classes/')) { const record = await client.fetchQuery(classQuery(url.slice(9))); title = record.seoTitle || record.title + ' | Artopus Learn'; description = record.seoDescription || record.description.replace(/<[^>]*>/g, ' ').slice(0, 180); }
  else if (url.startsWith('/events/')) { const record = await client.fetchQuery(eventQuery(url.slice(8))); title = record.seoTitle || record.title + ' | Artopus Learn'; description = record.seoDescription || record.description.replace(/<[^>]*>/g, ' ').slice(0, 180); }
  else if (url.startsWith('/blog/')) { const record = await client.fetchQuery(blogQuery(url.slice(6))); title = record.seoTitle || record.title + ' | Artopus Learn'; description = record.seoDescription || record.excerpt; }
  else if (url === '/about') title = 'About Artopus | Artopus Learn';
  else if (url === '/contact') title = 'Contact Artopus | Artopus Learn';
  else if (url === '/admin/login') title = 'Administrator login | Artopus Learn';
  else title = 'Page not found | Artopus Learn';
  const canonical = new URL(url, safeHref(settings.seoDefaults.siteUrl) || 'https://learn.artopusindia.com').href;
  const html = renderToString(<StaticRouter location={url}><App client={client} /></StaticRouter>);
  const state = JSON.stringify(dehydrate(client)).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return { html, state, head: '<meta name="artopus-rendered-path" content="' + escape(url) + '"/><title>' + escape(title) + '</title><meta name="description" content="' + escape(description) + '"/><link rel="canonical" href="' + escape(canonical) + '"/><meta property="og:title" content="' + escape(title) + '"/><meta property="og:description" content="' + escape(description) + '"/><meta property="og:type" content="' + (url.startsWith('/blog/') ? 'article' : 'website') + '"/><meta property="og:url" content="' + escape(canonical) + '"/>' };
}
export { publicPages } from './routes/paths';
