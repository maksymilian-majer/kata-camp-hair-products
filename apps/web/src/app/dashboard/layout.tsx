import { ProtectedRoute } from '@/web/components/auth';
import { AppHeader } from '@/web/components/layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
