/**
 * Detecta o idioma de um texto usando a API LanguageLayer.
 * Documentação: https://languagelayer.com/documentation
 */
export async function detectLanguage(text) {
  const apiKey = process.env.NEXT_PUBLIC_LANGUAGELAYER_KEY;

  if (!apiKey || apiKey === "SUA_LANGUAGELAYER_KEY_AQUI") {
    console.warn("[LanguageLayer] API Key não configurada. Usando detecção básica.");
    return basicDetection(text);
  }

  try {
    const url = `https://apilayer.net/api/detect?access_key=${apiKey}&query=${encodeURIComponent(text)}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      console.error("[LanguageLayer] HTTP Error:", res.status);
      return basicDetection(text);
    }

    const data = await res.json();

    if (!data.success) {
      console.warn("[LanguageLayer] API Error:", data.error);
      return basicDetection(text);
    }

    const top = data.results?.[0];
    if (!top) {
      return { success: false, message: "Nenhum resultado encontrado." };
    }

    return {
      success: true,
      languageCode: top.language_code,
      languageName: top.language_name,
      reliability: top.percentage,
      isReliable: top.is_reliable,
      allResults: data.results,
      message: `Idioma detectado: ${top.language_name} (${top.percentage}%)`,
    };
  } catch (err) {
    console.error("[LanguageLayer] Erro de rede:", err);
    return basicDetection(text);
  }
}

/** Fallback quando a API não está disponível */
function basicDetection(text) {
  const lower = text.toLowerCase();

  const patterns = [
    { code: "pt", name: "Portuguese", regex: /\b(de|da|do|em|para|com|uma|que|não|está|são|mas|por)\b/ },
    { code: "en", name: "English", regex: /\b(the|and|for|are|but|not|you|all|can|with|this|have)\b/ },
    { code: "es", name: "Spanish", regex: /\b(que|de|en|el|la|los|las|una|por|con|para|más|pero)\b/ },
    { code: "fr", name: "French", regex: /\b(le|la|les|de|du|des|un|une|et|en|pour|dans|sur|que)\b/ },
    { code: "de", name: "German", regex: /\b(der|die|das|ein|und|für|mit|auf|ist|ich|sie|von|nicht)\b/ },
    { code: "it", name: "Italian", regex: /\b(il|la|le|di|un|una|per|con|che|non|del|della|sono)\b/ },
  ];

  let best = null;
  let bestScore = 0;

  for (const p of patterns) {
    const matches = (lower.match(new RegExp(p.regex.source, "gi")) || []).length;
    if (matches > bestScore) {
      bestScore = matches;
      best = p;
    }
  }

  if (best && bestScore > 0) {
    return {
      success: true,
      languageCode: best.code,
      languageName: best.name,
      reliability: Math.min(95, bestScore * 15),
      isReliable: bestScore >= 3,
      allResults: [{ language_code: best.code, language_name: best.name, percentage: Math.min(95, bestScore * 15), is_reliable: bestScore >= 3 }],
      message: `Idioma detectado (básico): ${best.name}`,
    };
  }

  return {
    success: false,
    languageCode: "und",
    languageName: "Unknown",
    reliability: 0,
    isReliable: false,
    allResults: [],
    message: "Não foi possível detectar o idioma.",
  };
}
