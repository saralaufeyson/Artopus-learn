import { Navigate, Outlet } from 'react-router';
import { useAdminSession } from '../features/auth/hooks/useAdminSession';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
export function ProtectedAdminRoute() {
  const session = useAdminSession();
  if (session.isPending) return <LoadingState message="Checking administrator session..." />;
  if (session.isError) return <ErrorState message="Unable to verify the administrator session." retry={() => { void session.refetch(); }} />;
  if (!session.data) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
