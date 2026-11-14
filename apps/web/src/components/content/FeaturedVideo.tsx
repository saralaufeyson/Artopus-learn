import { useState } from 'react';
import { Play, ArrowUpRight } from 'lucide-react';
import { youtubeVideo, type PublicSiteSettings } from '@artopus/shared';
import { ActionLink } from './PublicPrimitives';
export function FeaturedVideo({ video }: { video?: PublicSiteSettings['featuredVideo'] }) {
  const [playing, setPlaying] = useState(false);
  const source = video && youtubeVideo(video.url);
  if (!video || !source) return null;
  return <section id="featured-video" className="section-space border-t border-line" aria-label="Featured Artopus video">
    <div className="grid items-center gap-8 rounded-3xl border border-line bg-surface p-5 sm:p-8 lg:grid-cols-[1fr_.8fr] lg:gap-14 lg:p-12">
      <div><p className="eyebrow">A glimpse of Artopus</p><h2 className="section-title">{video.title}</h2>{video.description && <p className="mt-5 max-w-xl leading-8 text-muted">{video.description}</p>}
        <p className="mt-5 max-w-xl text-sm leading-7 text-muted">Press play to watch here, or open the video on YouTube.</p>
        <a href={'https://www.youtube.com/watch?v=' + source.id} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent underline">Watch on YouTube<ArrowUpRight size={16} aria-hidden="true" /></a>
        <div className="mt-6"><ActionLink href="/classes" secondary>Find your drawing class</ActionLink></div>
      </div>
      <div className={'relative mx-auto w-full overflow-hidden rounded-2xl border border-line bg-tint ' + (source.portrait ? 'aspect-[9/16] max-w-[320px]' : 'aspect-video')}>
        {playing ? <iframe key={source.id} src={'https://www.youtube-nocookie.com/embed/' + source.id + '?autoplay=1&rel=0'} title={video.title} className="absolute inset-0 h-full w-full border-0" allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <button type="button" className="group absolute inset-0 h-full w-full" onClick={() => setPlaying(true)} aria-label={'Play ' + video.title}>
          <img src={'https://i.ytimg.com/vi/' + source.id + '/hqdefault.jpg'} alt="" loading="lazy" width="480" height="360" className="absolute inset-0 h-full w-full object-cover" referrerPolicy="no-referrer" />
          <span className="absolute inset-0 bg-black/20" /><span className="absolute inset-0 flex items-center justify-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg group-hover:bg-primary-hover"><Play className="ml-1" fill="currentColor" size={26} aria-hidden="true" /></span></span>
          <span className="absolute inset-x-4 bottom-5 rounded-xl bg-black/75 px-4 py-3 text-sm font-semibold text-white">Play featured video</span>
        </button>}
      </div>
    </div>
  </section>;
}
