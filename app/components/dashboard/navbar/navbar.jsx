"use client";

import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";
import {
  MdMenu,
} from "react-icons/md";

const Navbar = ({ onMenuToggle }) => {
  const pathname = usePathname();

  // Get page title from pathname
  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Dashboard";
    
    const lastSegment = segments[segments.length - 1];
    // Convert from URL format to readable format
    return lastSegment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };



  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        {/* Mobile menu button */}
        <button 
          className={styles.mobileMenuButton}
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <MdMenu />
        </button>
        
        <h1 className={styles.title}>
          {getPageTitle()}
        </h1>
      </div>
      
      <div className={styles.menu}>

        
        <div className={styles.icons}>
          {/* <button 
            className={`${styles.iconButton} ${styles.hasNotification}`}
            aria-label="Messages"
            title="Messages"
          >
            <MdOutlineChat size={20} />
          </button> */}
          
          {/* <button 
            className={`${styles.iconButton} ${styles.hasNotification}`}
            aria-label="Notifications"
            title="Notifications"
          >
            <MdNotifications size={20} />
          </button> */}
          
          {/* <button 
            className={styles.iconButton}
            aria-label="Public view"
            title="Public View"
          >
            <MdPublic size={20} />
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default Navbar;