"use client";
import { useState, useEffect } from "react";
import { createBook, updateBook } from "@/services/books";
import styles from "./BookModal.module.css";

const GENRES = [
  "Ficção", "Romance", "Terror", "Ficção Científica", "Fantasia",
  "Biografia", "História", "Autoajuda", "Técnico", "Outro",
];

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className={styles.starPicker} role="group" aria-label="Nota">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`${styles.starBtn} ${s <= (hovered || value) ? styles.starOn : ""}`}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${s} estrela${s > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
      <span className={styles.starLabel}>
        {value ? `${value}/5` : "Sem nota"}
      </span>
    </div>
  );
}

const EMPTY = {
  title: "", author: "", description: "",
  rating: 0, genre: "", coverUrl: "", readAt: "",
};

export default function BookModal({ book, onClose, onSaved }) {
  const isEdit = !!book;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title || "",
        author: book.author || "",
        description: book.description || "",
        rating: book.rating || 0,
        genre: book.genre || "",
        coverUrl: book.coverUrl || "",
        readAt: book.readAt ? book.readAt.split("T")[0] : "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [book]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Título obrigatório.";
    if (!form.author.trim()) e.author = "Autor obrigatório.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      let saved;
      if (isEdit) {
        saved = await updateBook(book.id, form);
      } else {
        saved = await createBook(form);
      }
      onSaved(saved, isEdit);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEdit ? "✏️ Editar Livro" : "📖 Novo Livro"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Fechar">
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGrid}>
            {/* Title */}
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label} htmlFor="title">Título *</label>
              <input
                id="title"
                className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                type="text"
                placeholder="Nome do livro"
                value={form.title}
                onChange={set("title")}
              />
              {errors.title && <span className={styles.error}>{errors.title}</span>}
            </div>

            {/* Author */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="author">Autor *</label>
              <input
                id="author"
                className={`${styles.input} ${errors.author ? styles.inputError : ""}`}
                type="text"
                placeholder="Nome do autor"
                value={form.author}
                onChange={set("author")}
              />
              {errors.author && <span className={styles.error}>{errors.author}</span>}
            </div>

            {/* Genre */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="genre">Gênero</label>
              <select
                id="genre"
                className={styles.input}
                value={form.genre}
                onChange={set("genre")}
              >
                <option value="">Selecione...</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Read date */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="readAt">Data de leitura</label>
              <input
                id="readAt"
                className={styles.input}
                type="date"
                value={form.readAt}
                onChange={set("readAt")}
              />
            </div>

            {/* Cover URL */}
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label} htmlFor="coverUrl">URL da capa (opcional)</label>
              <input
                id="coverUrl"
                className={styles.input}
                type="url"
                placeholder="https://..."
                value={form.coverUrl}
                onChange={set("coverUrl")}
              />
            </div>

            {/* Rating */}
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label}>Nota</label>
              <StarPicker
                value={form.rating}
                onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
              />
            </div>

            {/* Description */}
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label} htmlFor="description">Descrição / Resumo</label>
              <textarea
                id="description"
                className={`${styles.input} ${styles.textarea}`}
                placeholder="O que você achou do livro? Uma breve sinopse ou suas impressões..."
                value={form.description}
                onChange={set("description")}
                rows={4}
              />
            </div>
          </div>

          {/* Cover preview */}
          {form.coverUrl && (
            <div className={styles.coverPreview}>
              <img src={form.coverUrl} alt="Preview da capa" className={styles.coverPreviewImg} />
            </div>
          )}

          {errors.submit && (
            <div className={styles.submitError}>{errors.submit}</div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.cancelBtn} type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className={styles.saveBtn} type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : isEdit ? "Salvar Alterações" : "Adicionar Livro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
