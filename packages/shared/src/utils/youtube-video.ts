export function youtubeVideo(value: string): { id: string; portrait: boolean } | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return undefined;
    let id: string | null | undefined;
    let portrait = false;
    if (url.hostname === 'youtu.be') id = url.pathname.slice(1);
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname)) {
      if (url.pathname === '/watch' && url.hostname !== 'www.youtube-nocookie.com') id = url.searchParams.get('v');
      else {
        const path = /^\/(shorts|embed)\/([^/]+)\/?$/.exec(url.pathname);
        id = path?.[2]; portrait = path?.[1] === 'shorts';
      }
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? { id, portrait } : undefined;
  } catch { return undefined; }
}
