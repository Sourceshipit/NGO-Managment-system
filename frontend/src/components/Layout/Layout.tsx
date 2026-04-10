import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-brand-surface overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[260px] min-w-0 relative z-10 w-[calc(100%-260px)]">
        <Navbar />
        <main className="flex-1 overflow-y-auto pt-16 relative">
          <div className="p-8 page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
