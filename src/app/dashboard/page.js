"use client";
import { useState, useEffect, useCallback } from "react";
import { getBooks, deleteBook } from "@/services/books";
import { useAuth } from "@/context/AuthContext";
import BookCard from "@/components/BookCard";
import BookModal from "@/components/BookModal";
import StatsBar from "@/components/StatsBar";
import styles from "./page.module.css";

export default function DashboardPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [view, setView] = useState("grid"); // "grid" | "list"

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleDelete = async (id) => {
    try {
      await deleteBook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert("Erro ao deletar: " + err.message);
    }
  };

  const handleSaved = (book, isEdit) => {
    if (isEdit) {
      setBooks((prev) => prev.map((b) => (b.id === book.id ? book : b)));
    } else {
      setBooks((prev) => [book, ...prev]);
    }
    setModalOpen(false);
    setEditBook(null);
  };

  // Filtering
  const genres = ["all", ...new Set(books.map((b) => b.genre).filter(Boolean))];

  const filtered = books.filter((b) => {
    const matchSearch =
      !searchQuery ||
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGenre = filterGenre === "all" || b.genre === filterGenre;
    const matchRating =
      filterRating === "all" || b.rating === Number(filterRating);
    return matchSearch && matchGenre && matchRating;
  });

  const avgRating =
    books.length > 0
      ? (books.reduce((s, b) => s + (b.rating || 0), 0) / books.length).toFixed(1)
      : null;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Olá, <span className={styles.username}>{user?.get("username")}</span> 👋
          </h1>
          <p className={styles.subtitle}>
            {books.length === 0
              ? "Comece adicionando seu primeiro livro!"
              : `${books.length} livro${books.length !== 1 ? "s" : ""} na sua estante`}
          </p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => { setEditBook(null); setModalOpen(true); }}
        >
          <span>+</span> Adicionar Livro
        </button>
      </div>

      {/* Stats */}
      {books.length > 0 && (
        <StatsBar books={books} avgRating={avgRating} />
      )}

      {/* Filters */}
      {books.length > 0 && (
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Buscar por título ou autor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className={styles.clearSearch} onClick={() => setSearchQuery("")}>×</button>
            )}
          </div>

          <div className={styles.filters}>
            <select
              className={styles.filterSelect}
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
            >
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g === "all" ? "Todos os gêneros" : g}
                </option>
              ))}
            </select>

            <select
              className={styles.filterSelect}
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">Todas as notas</option>
              {[5, 4, 3, 2, 1, 0].map((r) => (
                <option key={r} value={r}>{"⭐".repeat(r) || "☆ Sem nota"}</option>
              ))}
            </select>

            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${view === "grid" ? styles.viewBtnActive : ""}`}
                onClick={() => setView("grid")}
                title="Grade"
              >⊞</button>
              <button
                className={`${styles.viewBtn} ${view === "list" ? styles.viewBtnActive : ""}`}
                onClick={() => setView("list")}
                title="Lista"
              >☰</button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className={styles.centerState}>
          <div className="spinner" style={{ width: 40, height: 40, color: "var(--gold)" }} />
          <p>Carregando sua estante...</p>
        </div>
      ) : error ? (
        <div className={styles.errorState}>
          <span>⚠️</span>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={fetchBooks}>Tentar novamente</button>
        </div>
      ) : books.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIllustration}>📚</div>
          <h2>Sua estante está vazia</h2>
          <p>Adicione os primeiros livros que você leu e comece a construir sua biblioteca pessoal.</p>
          <button
            className={styles.addBtn}
            onClick={() => { setEditBook(null); setModalOpen(true); }}
          >
            + Adicionar Primeiro Livro
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIllustration}>🔍</div>
          <h2>Nenhum resultado</h2>
          <p>Tente ajustar os filtros ou a busca.</p>
        </div>
      ) : (
        <div className={`${styles.booksGrid} ${view === "list" ? styles.booksListView : ""}`}>
          {filtered.map((book, i) => (
            <BookCard
              key={book.id}
              book={book}
              view={view}
              style={{ animationDelay: `${i * 0.05}s` }}
              onEdit={() => { setEditBook(book); setModalOpen(true); }}
              onDelete={() => setDeleteConfirm(book)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <BookModal
          book={editBook}
          onClose={() => { setModalOpen(false); setEditBook(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className={styles.overlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <span className={styles.confirmIcon}>🗑️</span>
            <h3>Remover livro</h3>
            <p>Deseja remover <strong>"{deleteConfirm.title}"</strong> da sua estante?</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(deleteConfirm.id)}>
                Sim, remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
