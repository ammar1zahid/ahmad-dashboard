"use client";

import Image from "next/image";
import styles from "./sidebar.module.css";
import {
  MdDashboard,
  MdSupervisedUserCircle,
  MdShoppingBag,
  MdAttachMoney,
  MdPeople,
  MdLogout,
  MdGroups,
  MdHistory,
  MdPerson,
  MdClose
} from "react-icons/md";
import MenuLink from "./menuLink/menuLink";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar({ onClose, isMobile }) {
  const { data: session } = useSession();
  const user = session?.user;

  const handleSignOut = async () => {
    try {
      const envLogout = process.env.NEXT_PUBLIC_NEXTLOGOUT_URL;
      const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXTAUTH_URL || "http://localhost:3000";
      const callbackUrl = envLogout || new URL("/login", origin).toString();

      console.log("signOut callbackUrl:", callbackUrl, "envLogout:", envLogout, "NEXTAUTH_URL:", process.env.NEXTAUTH_URL);

      await signOut({ callbackUrl });
    } catch (err) {
      console.error("signOut error:", err);
    }
  };

  // Close sidebar when menu item is clicked on mobile
  const handleMenuClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const menuItems = [
    {
      title: "Pages",
      list: [
        { title: "Dashboard", path: "/dashboard", icon: <MdDashboard /> },
        {
          title: "Users",
          path: "/dashboard/users",
          icon: <MdSupervisedUserCircle />,
        },
        {
          title: "Products",
          path: "/dashboard/products",
          icon: <MdShoppingBag />,
        },
        {
          title: "Customers",
          path: "/dashboard/customers",
          icon: <MdGroups />,
        },
      ],
    },
    {
      title: "Sales",
      list: [
        { title: "Sales", path: "/dashboard/sales", icon: <MdAttachMoney /> },
        {
          title: "Transactions",
          path: "/dashboard/transactions",
          icon: <MdHistory />,
        },
        { title: "Analytics", path: "/dashboard/analytics", icon: <MdPeople /> },
      ],
    },
    {
      title: "User",
      list: [
        {
          title: "Profile",
          path: `/dashboard/users/${user?.id || ""}`,
          icon: <MdPerson />,
        },
      ],
    },
  ];

  return (
    <div className={styles.container}>
      {/* Close button for mobile */}
      {isMobile && (
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <MdClose />
        </button>
      )}
      
      <div className={styles.user}>
        <Image
          className={styles.userImage}
          src={user?.img || "/noavatar.png"}
          alt="User Avatar"
          width={50}
          height={50}
        />
        <div className={styles.userDetail}>
          <span className={styles.username}>
            {user?.username || user?.email || "Guest"}
          </span>
          <span className={styles.userTitle}>
            {user?.isAdmin ? "Administrator" : "User"}
          </span>
        </div>
      </div>

      <ul className={styles.list}>
        {menuItems.map((cat) => (
          <li key={cat.title}>
            <span className={styles.cat}>{cat.title}</span>
            {cat.list.map((item) => (
              <MenuLink 
                item={item} 
                key={item.title} 
                onClick={handleMenuClick}
              />
            ))}
          </li>
        ))}
      </ul>

      <button type="button" className={styles.logout} onClick={handleSignOut}>
        <MdLogout />
        Logout
      </button>
    </div>
  );
}