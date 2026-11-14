import { Link } from 'react-router';
import type { BlogPost } from '@artopus/shared';
import { ArrowUpRight } from 'lucide-react';
import { DemoBadge, MediaImage, formatDate } from '../../../components/content/PublicPrimitives';
export function BlogCard({ post, index = 0 }: { post: BlogPost; index?: number }) {
  return <article className="content-card"><Link to={'/blog/' + post.slug} className="block aspect-[8/5] overflow-hidden" aria-label={'Read ' + post.title}><MediaImage image={post.coverImage} variant={index} /></Link><div className="p-6">
    <div className="mb-4 flex flex-wrap items-center gap-2"><span className="pill">{post.category}</span><DemoBadge isDemo={post.isDemo} /></div>
    <h3 className="card-title"><Link to={'/blog/' + post.slug}>{post.title}</Link></h3><p className="mt-3 line-clamp-3 text-sm leading-7 text-muted">{post.excerpt}</p>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"><time dateTime={post.publishedAt} className="text-xs text-muted">{post.publishedAt ? formatDate(post.publishedAt) : ''}</time><Link to={'/blog/' + post.slug} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent">Read story<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
  </div></article>;
}
