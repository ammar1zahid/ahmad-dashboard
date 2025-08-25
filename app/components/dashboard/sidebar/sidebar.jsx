// app/components/dashboard/sidebar/sidebar.jsx
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
  MdPerson
} from "react-icons/md";
import MenuLink from "./menuLink/menuLink";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar() {
  const { data: session } = useSession();
  const user = session?.user;

// const handleSignOut = async () => {
//   try {
//     const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXTAUTH_URL;
//     const callbackUrl = new URL("/login", origin).toString(); // canonical absolute URL
//     await signOut({ callbackUrl });
//   } catch (err) {
//     console.error("signOut error:", err);
//   }
// };

const handleSignOut = async () => {
  try {
    // Build callbackUrl with this precedence:
    // 1) NEXT_PUBLIC_NEXTLOGOUT_URL (read at build time, available in client)
    // 2) runtime window.location.origin + "/login" (browser)
    // 3) fallback to NEXTAUTH_URL or localhost
    const envLogout = process.env.NEXT_PUBLIC_NEXTLOGOUT_URL; // set this in Vercel (Production)
    const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXTAUTH_URL || "http://localhost:3000";
    const callbackUrl = envLogout || new URL("/login", origin).toString();

    await signOut({ callbackUrl });
  } catch (err) {
    console.error("signOut error:", err);
  }
};



  // Build menu dynamically so we can inject user id into profile link
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
        // {
        //   title: "Settings",
        //   path: "/dashboard/settings",
        //   icon: <MdOutlineSettings />,
        // },
        // { title: "Help", path: "/dashboard/help", icon: <MdHelpCenter /> },
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
              <MenuLink item={item} key={item.title} />
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
