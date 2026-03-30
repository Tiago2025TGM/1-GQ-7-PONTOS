"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/auth");
  };

  const navLinks = [
    { href: "/dashboard", label: "📚 Estante" },
    { href: "/dashboard/language", label: "🌐 Idiomas" },
  ];

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>📚</span>
          <span className={styles.brandName}>BookShelf</span>
        </div>

        <nav className={styles.navLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.nav}>
          <div className={styles.userChip}>
            <span className={styles.avatar}>
              {user?.get("username")?.[0]?.toUpperCase() || "U"}
            </span>
            <span className={styles.userName}>{user?.get("username")}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
