import { Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import AdminLayout from '@/pages/admin/AdminLayout';

export default function ProtectedAdminRoute() {
  const user = useAppStore((state) => state.user);

  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <AdminLayout />;
}
