"use client";
import styles from "./DetectionCard.module.css";

const LANGUAGE_FLAGS = {
  pt: "🇧🇷", en: "🇺🇸", es: "🇪🇸", fr: "🇫🇷",
  de: "🇩🇪", it: "🇮🇹", ja: "🇯🇵", zh: "🇨🇳",
  ru: "🇷🇺", ar: "🇸🇦", ko: "🇰🇷", nl: "🇳🇱",
  pl: "🇵🇱", tr: "🇹🇷", sv: "🇸🇪", und: "🌐",
};

export default function DetectionCard({ detection, onEdit, onDelete, index = 0 }) {
  const { id, text, detectedLanguage, languageCode, reliability, isReliable, note, createdAt } = detection;

  const flag = LANGUAGE_FLAGS[languageCode] || "🌐";
  const reliabilityLevel =
    reliability >= 80 ? "high" : reliability >= 50 ? "medium" : "low";

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "";

  const previewText = text?.length > 120 ? text.slice(0, 120) + "…" : text;

  return (
    <div
      className={`${styles.card} animate-fadeUp`}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className={styles.header}>
        <span className={styles.flag}>{flag}</span>
        <div className={styles.langInfo}>
          <span className={styles.langName}>{detectedLanguage}</span>
          <span className={styles.langCode}>{languageCode?.toUpperCase()}</span>
        </div>
        <div className={`${styles.reliabilityBadge} ${styles[reliabilityLevel]}`}>
          {reliability}%
        </div>
      </div>

      <p className={styles.textPreview}>{previewText}</p>

      {note && (
        <p className={styles.note}>
          <span className={styles.noteIcon}>📝</span> {note}
        </p>
      )}

      <div className={styles.footer}>
        <span className={styles.date}>{formattedDate}</span>
        {isReliable && <span className={styles.reliable}>✓ Confiável</span>}

        <div className={styles.actions}>
          <button className={styles.editBtn} onClick={() => onEdit(detection)} title="Editar anotação">
            ✏️
          </button>
          <button className={styles.deleteBtn} onClick={() => onDelete(id)} title="Excluir">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
