/**
 * Detecta o idioma de um texto via rota interna Next.js,
 * que por sua vez chama a API LanguageLayer server-side (evita CORS).
 */
export async function detectLanguage(text) {
  if (!text?.trim()) {
    return { success: false, message: "Texto vazio." };
  }

  try {
    const res = await fetch("/api/detect-language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim() }),
    });

    const data = await res.json();

    // If API key is missing/invalid, server returns fallback:true — run client fallback
    if (!data.success && data.fallback) {
      return basicDetection(text);
    }

    return data;
  } catch (err) {
    console.error("[LanguageLayer] Erro ao chamar rota interna:", err);
    return basicDetection(text);
  }
}

/** Fallback por trigrama/palavra-chave quando a API não está disponível */
function basicDetection(text) {
  const lower = text.toLowerCase();

  const patterns = [
    { code: "pt", name: "Portuguese", words: ["de","da","do","em","para","com","uma","que","não","está","são","mas","por","isso","ser","ele","ela","nos","foi","como","mais"] },
    { code: "en", name: "English",    words: ["the","and","for","are","but","not","you","all","can","with","this","have","from","they","been","will","your","was","his","her"] },
    { code: "es", name: "Spanish",    words: ["que","de","en","el","la","los","las","una","por","con","para","más","pero","como","este","muy","sus","todo","también","cuando"] },
    { code: "fr", name: "French",     words: ["le","la","les","de","du","des","un","une","et","en","pour","dans","sur","que","est","avec","son","pas","qui","plus"] },
    { code: "de", name: "German",     words: ["der","die","das","ein","und","für","mit","auf","ist","ich","sie","von","nicht","des","dem","eine","auch","sich","an","er"] },
    { code: "it", name: "Italian",    words: ["il","la","le","di","un","una","per","con","che","non","del","della","sono","nel","una","si","ma","ho","lo","ci"] },
    { code: "nl", name: "Dutch",      words: ["de","het","een","van","is","op","te","en","dat","in","zijn","voor","met","aan","er","heeft","niet","ook","hij","ze"] },
    { code: "pl", name: "Polish",     words: ["i","w","na","do","z","się","to","że","jest","jak","nie","ale","tak","co","przez","po","czy","już","go","jego"] },
    { code: "ru", name: "Russian",    words: ["и","в","на","не","это","с","а","он","как","что","по","из","его","за","но","у","от","же","вс","так"] },
  ];

  const tokens = lower.match(/\b\w+\b/g) || [];
  const tokenSet = new Set(tokens);

  let best = null;
  let bestScore = 0;

  for (const p of patterns) {
    const score = p.words.filter(w => tokenSet.has(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }

  if (best && bestScore >= 1) {
    const reliability = Math.min(98, 40 + bestScore * 6);
    return {
      success: true,
      languageCode: best.code,
      languageName: best.name,
      reliability,
      isReliable: bestScore >= 3,
      message: `Idioma detectado: ${best.name} (${reliability}%)`,
    };
  }

  return {
    success: false,
    languageCode: "und",
    languageName: "Desconhecido",
    reliability: 0,
    isReliable: false,
    message: "Não foi possível detectar o idioma. Tente um texto mais longo.",
  };
}
