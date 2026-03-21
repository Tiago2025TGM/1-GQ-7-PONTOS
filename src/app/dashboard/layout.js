"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import styles from "./dashboard.module.css";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className={styles.loadingScreen}>
        <span className={styles.loadingBook}>📚</span>
        <div className="spinner" style={{ color: "var(--gold)", width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
