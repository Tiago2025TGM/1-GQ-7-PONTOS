"use client";
import styles from "./StatsBar.module.css";

const GENRE_EMOJI = {
  Ficção: "🌀", Romance: "💕", Terror: "👻",
  "Ficção Científica": "🚀", Fantasia: "🧙", Biografia: "🏆",
  História: "🏛️", Autoajuda: "💡", Técnico: "💻", Outro: "📌",
};

export default function StatsBar({ books, avgRating }) {
  const top5 = books.filter((b) => b.rating === 5).length;
  const genres = [...new Set(books.map((b) => b.genre).filter(Boolean))];
  const topGenre = genres.sort((a, b) =>
    books.filter((bk) => bk.genre === b).length - books.filter((bk) => bk.genre === a).length
  )[0];

  const stats = [
    { icon: "📚", label: "Total lidos", value: books.length },
    {
      icon: "⭐",
      label: "Nota média",
      value: avgRating ? `${avgRating}/5` : "—",
    },
    { icon: "🏆", label: "Obras perfeitas", value: top5 },
    {
      icon: topGenre ? GENRE_EMOJI[topGenre] || "📖" : "📖",
      label: "Gênero favorito",
      value: topGenre || "—",
    },
  ];

  return (
    <div className={styles.bar}>
      {stats.map((s) => (
        <div key={s.label} className={styles.stat}>
          <span className={styles.statIcon}>{s.icon}</span>
          <div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
