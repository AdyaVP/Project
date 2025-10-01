import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useSidebar } from '../../hooks/useSidebar';

export const MainLayout: React.FC = () => {
  const { isOpen, isMobile, toggle, close } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={close}
        />
      )}

      <Sidebar isOpen={isOpen} isMobile={isMobile} onClose={close} />
      <Navbar onMenuClick={toggle} />
      
      <main className={`mt-16 p-4 sm:p-6 transition-all duration-300 ${
        isOpen && !isMobile ? 'lg:ml-64' : 'ml-0'
      }`}>
        <Outlet />
      </main>
    </div>
  );
};
