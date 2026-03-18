import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RoleSwitcher from '../components/dev/RoleSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (!isAuthenticated) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden bg-background transition-colors duration-500">
      <Sidebar isOpen={isSidebarOpen} close={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Floating UI Elements */}
      <div className="fixed top-6 right-6 z-[1001] flex items-center gap-4">
         <ThemeToggle />
      </div>
      <RoleSwitcher />
    </div>
  );
};

export default Layout;
