import { Link } from 'react-router';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return <main className="mx-auto max-w-4xl p-10"><h1 className="text-3xl font-semibold">Page not found</h1><Link to="/" className="mt-5 inline-block underline">Return home</Link></main>;
}
