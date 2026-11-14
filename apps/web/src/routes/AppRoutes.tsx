import { lazy, Suspense } from 'react';
import { LoadingState } from '../components/ui/LoadingState';
import { Route, Routes } from 'react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedAdminRoute } from './ProtectedAdminRoute';
import { NotFoundPage } from '../pages/NotFoundPage';
import { HomePage } from '../pages/public/HomePage';
import { ClassesPage } from '../pages/public/ClassesPage';
import { ClassDetailPage } from '../pages/public/ClassDetailPage';
import { EventsPage } from '../pages/public/EventsPage';
import { EventDetailPage } from '../pages/public/EventDetailPage';
import { BlogPage } from '../pages/public/BlogPage';
import { BlogDetailPage } from '../pages/public/BlogDetailPage';
import { AboutPage } from '../pages/public/AboutPage';
import { ContactPage } from '../pages/public/ContactPage';
import { LoginPage } from '../pages/admin/LoginPage';
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage').then(module => ({ default: module.DashboardPage })));
const BlogListPage = lazy(() => import('../pages/admin/BlogListPage').then(module => ({ default: module.BlogListPage })));
const BlogEditorPage = lazy(() => import('../pages/admin/BlogEditorPage').then(module => ({ default: module.BlogEditorPage })));
const EventListPage = lazy(() => import('../pages/admin/EventListPage').then(module => ({ default: module.EventListPage })));
const EventEditorPage = lazy(() => import('../pages/admin/EventEditorPage').then(module => ({ default: module.EventEditorPage })));
const ClassListPage = lazy(() => import('../pages/admin/ClassListPage').then(module => ({ default: module.ClassListPage })));
const ClassEditorPage = lazy(() => import('../pages/admin/ClassEditorPage').then(module => ({ default: module.ClassEditorPage })));
const MediaLibraryPage = lazy(() => import('../pages/admin/MediaLibraryPage').then(module => ({ default: module.MediaLibraryPage })));
const SettingsPage = lazy(() => import('../pages/admin/SettingsPage').then(module => ({ default: module.SettingsPage })));
export function AppRoutes() {
  return <Suspense fallback={<LoadingState message="Opening the studio…" />}><Routes>
    <Route element={<PublicLayout />}>
      <Route index element={<HomePage />} />
      <Route path="classes" element={<ClassesPage />} />
      <Route path="classes/:slug" element={<ClassDetailPage />} />
      <Route path="events" element={<EventsPage />} />
      <Route path="events/:slug" element={<EventDetailPage />} />
      <Route path="blog" element={<BlogPage />} />
      <Route path="blog/:slug" element={<BlogDetailPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="contact" element={<ContactPage />} />
    </Route>
    <Route path="admin/login" element={<LoginPage />} />
    <Route element={<ProtectedAdminRoute />}>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="blogs" element={<BlogListPage />} />
        <Route path="blogs/new" element={<BlogEditorPage />} />
        <Route path="blogs/:id/edit" element={<BlogEditorPage />} />
        <Route path="events" element={<EventListPage />} />
        <Route path="events/new" element={<EventEditorPage />} />
        <Route path="events/:id/edit" element={<EventEditorPage />} />
        <Route path="classes" element={<ClassListPage />} />
        <Route path="classes/new" element={<ClassEditorPage />} />
        <Route path="classes/:id/edit" element={<ClassEditorPage />} />
        <Route path="media" element={<MediaLibraryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes></Suspense>;
}
