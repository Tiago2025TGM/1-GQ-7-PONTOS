"use client";
import { useState, useEffect, useCallback } from "react";
import DetectionCard from "@/components/DetectionCard";
import DetectionModal from "@/components/DetectionModal";
import {
  getDetections,
  createDetection,
  updateDetection,
  deleteDetection,
} from "@/services/detections";
import styles from "./language.module.css";

export default function LanguagePage() {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null); // { mode: "create" | "edit", detection?: {} }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id to delete
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCode, setFilterCode] = useState("all");

  const fetchDetections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDetections();
      setDetections(data);
    } catch (err) {
      setError("Erro ao carregar detecções.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetections();
  }, [fetchDetections]);

  const handleSave = async (data) => {
    if (modal?.mode === "edit") {
      const updated = await updateDetection(modal.detection.id, data);
      setDetections((prev) =>
        prev.map((d) => (d.id === updated.id ? updated : d))
      );
    } else {
      const created = await createDetection(data);
      setDetections((prev) => [created, ...prev]);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteDetection(id);
      setDetections((prev) => prev.filter((d) => d.id !== id));
      setDeleteConfirm(null);
    } catch {
      setError("Erro ao excluir detecção.");
    } finally {
      setDeleting(false);
    }
  };

  // Unique language codes for filter
  const uniqueCodes = [...new Set(detections.map((d) => d.languageCode).filter(Boolean))];

  const filtered = detections.filter((d) => {
    const matchSearch =
      !search ||
      d.text?.toLowerCase().includes(search.toLowerCase()) ||
      d.detectedLanguage?.toLowerCase().includes(search.toLowerCase()) ||
      d.note?.toLowerCase().includes(search.toLowerCase());
    const matchCode = filterCode === "all" || d.languageCode === filterCode;
    return matchSearch && matchCode;
  });

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🌐 Detector de Idiomas</h1>
          <p className={styles.subtitle}>
            Detecte automaticamente o idioma de qualquer texto com a LanguageLayer API
          </p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => setModal({ mode: "create" })}
        >
          + Nova Detecção
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          type="text"
          placeholder="🔎 Pesquisar texto, idioma ou anotação…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.select}
          value={filterCode}
          onChange={(e) => setFilterCode(e.target.value)}
        >
          <option value="all">Todos os idiomas</option>
          {uniqueCodes.map((code) => (
            <option key={code} value={code}>
              {code.toUpperCase()} — {detections.find((d) => d.languageCode === code)?.detectedLanguage}
            </option>
          ))}
        </select>
      </div>

      {/* ── Stats ── */}
      {detections.length > 0 && (
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{detections.length}</span>
            <span className={styles.statLabel}>Detecções</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{uniqueCodes.length}</span>
            <span className={styles.statLabel}>Idiomas Distintos</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {Math.round(
                detections.reduce((s, d) => s + (d.reliability || 0), 0) /
                  detections.length
              )}%
            </span>
            <span className={styles.statLabel}>Confiabilidade Média</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {detections.filter((d) => d.isReliable).length}
            </span>
            <span className={styles.statLabel}>Resultados Confiáveis</span>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && <p className={styles.error}>{error}</p>}

      {/* ── Content ── */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <div className="spinner" style={{ color: "var(--gold)", width: 36, height: 36 }} />
          <p>Carregando detecções…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🌐</span>
          <h3>
            {detections.length === 0
              ? "Nenhuma detecção ainda"
              : "Nenhum resultado encontrado"}
          </h3>
          <p>
            {detections.length === 0
              ? "Clique em «+ Nova Detecção» para começar a analisar textos."
              : "Tente outro termo de busca ou filtro."}
          </p>
          {detections.length === 0 && (
            <button
              className={styles.emptyBtn}
              onClick={() => setModal({ mode: "create" })}
            >
              + Nova Detecção
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((d, i) => (
            <DetectionCard
              key={d.id}
              detection={d}
              index={i}
              onEdit={(det) => setModal({ mode: "edit", detection: det })}
              onDelete={(id) => setDeleteConfirm(id)}
            />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <DetectionModal
          mode={modal.mode}
          detection={modal.detection}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className={styles.overlay}>
          <div className={styles.confirmBox}>
            <h3 className={styles.confirmTitle}>🗑️ Excluir detecção?</h3>
            <p className={styles.confirmText}>
              Essa ação não pode ser desfeita.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
              >
                {deleting ? "Excluindo…" : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
