"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/sidebar/sidebar';
import Navbar from '../components/dashboard/navbar/navbar';
import styles from "../components/dashboard/dashboard.module.css";
import Footer from '../components/dashboard/footer/footer';

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false); // Close sidebar on desktop
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeSidebar();
    }
  };

  return (
    <div className={styles.container}>
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className={`${styles.overlay} ${isSidebarOpen ? styles.active : ''}`}
          onClick={handleOverlayClick}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${styles.menu} ${isSidebarOpen ? styles.open : ''}`}>
        <Sidebar onClose={closeSidebar} isMobile={isMobile} />
      </div>
      
      {/* Main Content */}
      <div className={styles.content}>
        <Navbar onMenuToggle={toggleSidebar} />
        {children}
        <Footer />
      </div>
    </div>
  );
}

export default Layout;