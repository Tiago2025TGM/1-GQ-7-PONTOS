/**
 * Valida um endereço de email usando a API MailboxLayer.
 * Documentação: https://mailboxlayer.com/documentation
 */
export async function validateEmail(email) {
  const apiKey = process.env.NEXT_PUBLIC_MAILBOXLAYER_KEY;

  // Fallback: validação básica com regex se a API key não estiver configurada
  if (!apiKey || apiKey === "SUA_API_KEY_AQUI") {
    console.warn(
      "[MailboxLayer] API Key não configurada. Usando validação básica."
    );
    return basicEmailValidation(email);
  }

  try {
    const url = `https://apilayer.net/api/check?access_key=${apiKey}&email=${encodeURIComponent(email)}&smtp=1&format=1`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      console.error("[MailboxLayer] HTTP Error:", res.status);
      return basicEmailValidation(email);
    }

    const data = await res.json();

    // A API retorna erro 104 quando o limite gratuito é atingido
    if (data.error) {
      console.warn("[MailboxLayer] API Error:", data.error);
      return basicEmailValidation(email);
    }

    return {
      valid: data.format_valid && !data.disposable,
      formatValid: data.format_valid,
      smtpValid: data.smtp_check,
      disposable: data.disposable,
      score: data.score,
      message: !data.format_valid
        ? "Formato de email inválido."
        : data.disposable
        ? "Emails temporários/descartáveis não são permitidos."
        : "Email válido.",
    };
  } catch (err) {
    console.error("[MailboxLayer] Erro de rede:", err);
    return basicEmailValidation(email);
  }
}

function basicEmailValidation(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = regex.test(email);
  return {
    valid,
    formatValid: valid,
    smtpValid: null,
    disposable: false,
    score: valid ? 0.8 : 0,
    message: valid ? "Email válido." : "Formato de email inválido.",
  };
}
