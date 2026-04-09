import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-[#FAFAFA] font-mono overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 min-w-0 relative z-10 w-[calc(100%-16rem)]">
        <Navbar />
        <main className="flex-1 overflow-y-auto pt-16 relative">
          {/* Subtle global structural grid behind content */}
          <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,1) 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>
          <div className="p-8 page-enter relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
