"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/auth");
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>📚</span>
          <span className={styles.brandName}>BookShelf</span>
        </div>

        <nav className={styles.nav}>
          <div className={styles.userChip}>
            <span className={styles.avatar}>
              {user?.get("username")?.[0]?.toUpperCase() || "U"}
            </span>
            <span className={styles.userName}>{user?.get("username")}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
