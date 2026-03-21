"use client";
import styles from "./BookCard.module.css";

const GENRE_COLORS = {
  Ficção: "#6b7c5a",
  Romance: "#a0522d",
  Terror: "#4a4a6a",
  "Ficção Científica": "#2d6a7a",
  Fantasia: "#6a4a8a",
  Biografia: "#8a6a2d",
  História: "#5a4a2d",
  Autoajuda: "#2d6a4a",
  Técnico: "#2d4a6a",
  Outro: "#6a6a6a",
};

function StarRating({ rating }) {
  return (
    <div className={styles.stars} aria-label={`Nota: ${rating} de 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
    </div>
  );
}

function CoverPlaceholder({ title, genre }) {
  const color = GENRE_COLORS[genre] || "#6a6a6a";
  const letter = title?.[0]?.toUpperCase() || "?";
  return (
    <div className={styles.coverPlaceholder} style={{ background: color }}>
      <span className={styles.coverLetter}>{letter}</span>
      <span className={styles.coverSpine} />
    </div>
  );
}

export default function BookCard({ book, onEdit, onDelete, view, style }) {
  const dateStr = book.readAt
    ? new Date(book.readAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  if (view === "list") {
    return (
      <div className={`${styles.listCard} animate-fadeUp`} style={style}>
        <div className={styles.listCover}>
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className={styles.listCoverImg} />
          ) : (
            <CoverPlaceholder title={book.title} genre={book.genre} />
          )}
        </div>
        <div className={styles.listInfo}>
          <div className={styles.listMeta}>
            {book.genre && (
              <span className={styles.genre}>{book.genre}</span>
            )}
            {dateStr && <span className={styles.date}>📅 {dateStr}</span>}
          </div>
          <h3 className={styles.listTitle}>{book.title}</h3>
          <p className={styles.listAuthor}>por {book.author}</p>
          <StarRating rating={book.rating} />
          {book.description && (
            <p className={styles.listDesc}>{book.description}</p>
          )}
        </div>
        <div className={styles.listActions}>
          <button className={styles.editBtn} onClick={onEdit} title="Editar">✏️</button>
          <button className={styles.deleteBtn} onClick={onDelete} title="Remover">🗑️</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} animate-fadeUp`} style={style}>
      <div className={styles.coverWrap}>
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className={styles.cover} />
        ) : (
          <CoverPlaceholder title={book.title} genre={book.genre} />
        )}
        <div className={styles.cardOverlay}>
          <button className={styles.overlayBtn} onClick={onEdit}>✏️ Editar</button>
          <button className={`${styles.overlayBtn} ${styles.overlayDelete}`} onClick={onDelete}>🗑️ Remover</button>
        </div>
        {book.rating === 5 && (
          <span className={styles.badge}>⭐ Destaque</span>
        )}
      </div>

      <div className={styles.info}>
        {book.genre && <span className={styles.genre}>{book.genre}</span>}
        <h3 className={styles.bookTitle} title={book.title}>{book.title}</h3>
        <p className={styles.bookAuthor}>por {book.author}</p>
        <div className={styles.footer}>
          <StarRating rating={book.rating} />
          {dateStr && <span className={styles.date}>{dateStr}</span>}
        </div>
      </div>
    </div>
  );
}
