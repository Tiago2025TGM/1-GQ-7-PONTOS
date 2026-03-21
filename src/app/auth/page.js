"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { validateEmail } from "@/lib/emailValidator";
import styles from "./auth.module.css";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // null | "checking" | "valid" | "invalid"
  const { login, register } = useAuth();
  const router = useRouter();

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: "" }));
  };

  const handleEmailBlur = async () => {
    if (mode !== "register" || !form.email) return;
    setEmailStatus("checking");
    const result = await validateEmail(form.email);
    setEmailStatus(result.valid ? "valid" : "invalid");
    if (!result.valid) {
      setErrors((e) => ({ ...e, email: result.message }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Nome de usuário obrigatório.";
    if (mode === "register") {
      if (!form.email.trim()) newErrors.email = "Email obrigatório.";
      else if (emailStatus === "invalid")
        newErrors.email = "Email inválido ou temporário.";
    }
    if (!form.password || form.password.length < 6)
      newErrors.password = "Senha deve ter ao menos 6 caracteres.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.username, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
      router.replace("/dashboard");
    } catch (err) {
      const msg = err.message || "Erro desconhecido.";
      setErrors({ submit: msg.includes("Invalid username/password") ? "Usuário ou senha incorretos." : msg });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setErrors({});
    setEmailStatus(null);
    setForm({ username: "", email: "", password: "" });
  };

  return (
    <div className={styles.page}>
      {/* Background decoration */}
      <div className={styles.bgDecor}>
        <span>📚</span><span>📖</span><span>✍️</span>
        <span>🔖</span><span>📝</span><span>📕</span>
      </div>

      <div className={styles.card}>
        {/* Logo / Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span>📚</span>
          </div>
          <h1 className={styles.brandName}>BookShelf</h1>
          <p className={styles.brandTagline}>Sua estante literária digital</p>
        </div>

        {/* Tab switcher */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === "login" ? styles.tabActive : ""}`}
            onClick={() => setMode("login") || setErrors({})}
            type="button"
          >
            Entrar
          </button>
          <button
            className={`${styles.tab} ${mode === "register" ? styles.tabActive : ""}`}
            onClick={() => setMode("register") || setErrors({})}
            type="button"
          >
            Cadastrar
          </button>
          <div
            className={styles.tabIndicator}
            style={{ transform: mode === "register" ? "translateX(100%)" : "translateX(0)" }}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Username */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              {mode === "login" ? "Usuário" : "Nome de usuário"}
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>👤</span>
              <input
                id="username"
                className={`${styles.input} ${errors.username ? styles.inputError : ""}`}
                type="text"
                placeholder={mode === "login" ? "seu.usuario" : "Escolha um usuário"}
                value={form.username}
                onChange={set("username")}
                autoComplete="username"
              />
            </div>
            {errors.username && (
              <span className={styles.error}>{errors.username}</span>
            )}
          </div>

          {/* Email (register only) */}
          {mode === "register" && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Email
                {emailStatus === "checking" && (
                  <span className={styles.emailChecking}> · verificando...</span>
                )}
                {emailStatus === "valid" && (
                  <span className={styles.emailValid}> · ✓ válido</span>
                )}
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>✉️</span>
                <input
                  id="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""} ${emailStatus === "valid" ? styles.inputValid : ""}`}
                  type="email"
                  placeholder="voce@email.com"
                  value={form.email}
                  onChange={set("email")}
                  onBlur={handleEmailBlur}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <span className={styles.error}>{errors.email}</span>
              )}
            </div>
          )}

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Senha</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                id="password"
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                type="password"
                placeholder={mode === "login" ? "••••••••" : "Mínimo 6 caracteres"}
                value={form.password}
                onChange={set("password")}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
            {errors.password && (
              <span className={styles.error}>{errors.password}</span>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className={styles.submitError}>{errors.submit}</div>
          )}

          {/* Submit */}
          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : mode === "login" ? (
              "Entrar na Estante"
            ) : (
              "Criar Conta"
            )}
          </button>
        </form>

        <p className={styles.switchText}>
          {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
          <button className={styles.switchLink} onClick={switchMode} type="button">
            {mode === "login" ? "Cadastre-se" : "Fazer login"}
          </button>
        </p>
      </div>
    </div>
  );
}
