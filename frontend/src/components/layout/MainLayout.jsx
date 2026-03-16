import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import '../../styles/layout.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout-container">
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="layout-content">
        <Header onMenuClick={toggleSidebar} />
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
