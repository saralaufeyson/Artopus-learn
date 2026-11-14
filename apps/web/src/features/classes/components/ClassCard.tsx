import { Link } from 'react-router';
import { ArrowUpRight, Users, Monitor } from 'lucide-react';
import type { ClassOffering } from '@artopus/shared';
import { DemoBadge, MediaImage, formatClassMode } from '../../../components/content/PublicPrimitives';
export function ClassCard({ offering, index = 0 }: { offering: ClassOffering; index?: number }) {
  return <article className="content-card group"><Link to={'/classes/' + offering.slug} className="block aspect-[8/5] overflow-hidden" aria-label={'View ' + offering.title}><MediaImage image={offering.thumbnail} variant={index} /></Link><div className="p-6">
    <div className="mb-4 flex flex-wrap items-center gap-2"><span className="pill">{formatClassMode(offering.classMode)}</span><DemoBadge isDemo={offering.isDemo} /></div>
    <h3 className="card-title"><Link to={'/classes/' + offering.slug}>{offering.title}</Link></h3>
    <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted">{offering.description.replace(/<[^>]*>/g, ' ')}</p>
    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-sm text-muted"><span className="flex items-center gap-2"><Users size={15} aria-hidden="true" />{offering.ageGroup}</span><span className="flex items-center gap-2"><Monitor size={15} aria-hidden="true" />{formatClassMode(offering.classMode)}</span></div>
    <Link to={'/classes/' + offering.slug} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">Explore this class<ArrowUpRight size={17} aria-hidden="true" /></Link>
  </div></article>;
}
