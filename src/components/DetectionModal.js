"use client";
import { useState, useEffect } from "react";
import { detectLanguage } from "@/lib/languageLayer";
import styles from "./DetectionModal.module.css";

export default function DetectionModal({ mode, detection, onSave, onClose }) {
  const isEdit = mode === "edit";

  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && detection) {
      setNote(detection.note || "");
      setResult({
        languageName: detection.detectedLanguage,
        languageCode: detection.languageCode,
        reliability: detection.reliability,
        isReliable: detection.isReliable,
      });
    }
  }, [isEdit, detection]);

  const handleDetect = async () => {
    if (!text.trim()) {
      setError("Digite algum texto para detectar o idioma.");
      return;
    }
    setError("");
    setDetecting(true);
    setResult(null);

    try {
      const res = await detectLanguage(text.trim());
      if (!res.success) {
        setError(res.message || "Não foi possível detectar o idioma.");
      } else {
        setResult(res);
      }
    } catch (err) {
      setError("Erro ao chamar a API de detecção.");
    } finally {
      setDetecting(false);
    }
  };

  const handleSave = async () => {
    if (!isEdit && !result) {
      setError("Detecte o idioma antes de salvar.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await onSave({ note });
      } else {
        await onSave({
          text: text.trim(),
          languageName: result.languageName,
          languageCode: result.languageCode,
          reliability: result.reliability,
          isReliable: result.isReliable,
          note,
        });
      }
      onClose();
    } catch (err) {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <h2 className={styles.title}>
          {isEdit ? "✏️ Editar Anotação" : "🔍 Detectar Idioma"}
        </h2>

        {!isEdit && (
          <div className={styles.field}>
            <label className={styles.label}>Texto para análise *</label>
            <textarea
              className={styles.textarea}
              rows={5}
              placeholder="Cole ou escreva o texto aqui…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={detecting || saving}
            />
            <button
              className={styles.detectBtn}
              onClick={handleDetect}
              disabled={detecting || saving || !text.trim()}
            >
              {detecting ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, color: "white" }} />
                  Detectando…
                </>
              ) : (
                "🔍 Detectar Idioma"
              )}
            </button>
          </div>
        )}

        {isEdit && (
          <div className={styles.resultBox}>
            <span className={styles.resultFlag}>
              {getFlag(result?.languageCode)}
            </span>
            <div>
              <div className={styles.resultLang}>{result?.languageName}</div>
              <div className={styles.resultMeta}>
                {result?.languageCode?.toUpperCase()} · {result?.reliability}% confiabilidade
              </div>
            </div>
          </div>
        )}

        {!isEdit && result && (
          <div className={styles.resultBox}>
            <span className={styles.resultFlag}>{getFlag(result.languageCode)}</span>
            <div>
              <div className={styles.resultLang}>{result.languageName}</div>
              <div className={styles.resultMeta}>
                {result.languageCode?.toUpperCase()} · {result.reliability}% confiabilidade
                {result.isReliable && (
                  <span className={styles.reliableBadge}>✓ Confiável</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>Anotação (opcional)</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Ex: Trecho de artigo acadêmico…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={saving}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving || (!isEdit && !result)}
          >
            {saving ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, color: "white" }} />
                Salvando…
              </>
            ) : (
              isEdit ? "Salvar Anotação" : "Salvar Detecção"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const FLAGS = {
  pt: "🇧🇷", en: "🇺🇸", es: "🇪🇸", fr: "🇫🇷",
  de: "🇩🇪", it: "🇮🇹", ja: "🇯🇵", zh: "🇨🇳",
  ru: "🇷🇺", ar: "🇸🇦", ko: "🇰🇷", nl: "🇳🇱",
};
function getFlag(code) { return FLAGS[code] || "🌐"; }
