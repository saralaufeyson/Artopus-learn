import { useTrackPageView } from '../features/analytics/page-views';
import { Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { SiteHeader } from '../components/navigation/SiteHeader';
import { SiteFooter } from '../components/navigation/SiteFooter';
import { useSiteSettings } from '../features/settings/hooks/useSiteSettings';
export function PublicLayout() {
  useTrackPageView();
  const location = useLocation();
  const { data: settings } = useSiteSettings();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location.pathname]);
  return <><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader />
    {settings?.demoMode && <aside className="demo-banner">Preview content: sample classes, events and articles are clearly labeled. Contact Artopus for actual offerings.</aside>}
    <main id="main-content" className="min-h-[70vh]"><Outlet /></main><SiteFooter /></>;
}
