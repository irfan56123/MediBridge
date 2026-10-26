import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { PageTitleProvider, usePageTitleContext } from '@/context/PageTitleContext';

function LayoutInner() {
  const { title } = usePageTitleContext();
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <PageTitleProvider>
      <LayoutInner />
    </PageTitleProvider>
  );
}
