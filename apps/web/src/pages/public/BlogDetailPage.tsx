import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { blogQuery } from '../../services/public-queries';
import { QueryState } from '../../components/content/QueryState';
import { ActionLink, Breadcrumb, DemoBadge, MediaImage, MediaGallery, RichText, SectionHeading, formatDate } from '../../components/content/PublicPrimitives';
import { BlogCard } from '../../features/blogs/components/BlogCard';
import { ShareArticle } from '../../features/blogs/components/ShareArticle';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
export function BlogDetailPage() {
  const { slug = '' } = useParams();
  const query = useQuery(blogQuery(slug));
  const post = query.data;
  useDocumentTitle(post?.seoTitle || post?.title || 'Creative journal');
  return <QueryState pending={query.isPending} error={query.error} retry={() => { void query.refetch(); }}>{post && <div className="container-art py-10 md:py-14"><article className="mx-auto max-w-3xl"><Breadcrumb href="/blog" label="Back to the journal" /><div className="mb-5 flex flex-wrap gap-2"><span className="pill">{post.category}</span><DemoBadge isDemo={post.isDemo} /></div><h1 className="page-title">{post.title}</h1><p className="mt-5 text-lg leading-8 text-muted">{post.excerpt}</p><div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted"><span>By {post.author}</span><span aria-hidden="true">&middot;</span>{post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}</div><div className="my-9 overflow-hidden rounded-3xl border border-line"><MediaImage image={post.coverImage} /></div><RichText html={post.content} /><MediaGallery images={post.gallery} />{post.tags.length > 0 && <div className="mt-8 flex flex-wrap gap-2">{post.tags.map(tag => <span key={tag} className="pill">#{tag}</span>)}</div>}<ShareArticle title={post.title} /><aside className="cta-panel mt-10"><h2 className="text-2xl font-semibold">Let the next idea be yours.</h2><p className="mt-4 leading-7 text-muted">Interested in exploring your creativity? Discover Artopus drawing classes.</p><div className="mt-6 flex justify-center"><ActionLink href="/classes">Explore drawing classes</ActionLink></div></aside></article>{post.related.length > 0 && <section className="section-space"><SectionHeading eyebrow="Keep exploring" title="A little more inspiration." /><div className="card-grid">{post.related.map((related, index) => <BlogCard key={related.id} post={related} index={index + 1} />)}</div></section>}</div>}</QueryState>;
}
