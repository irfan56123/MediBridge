import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { PageTitleProvider, usePageTitleContext } from '@/context/PageTitleContext';
import { useState } from 'react';

function LayoutInner() {
  const { title } = usePageTitleContext();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar title={title} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="w-full flex-1 p-4 sm:p-6 lg:p-8">
          <div className="page-enter mx-auto w-full max-w-[1600px]"><Outlet /></div>
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
