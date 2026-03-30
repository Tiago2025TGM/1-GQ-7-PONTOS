import { NextResponse } from "next/server";

export async function POST(request) {
  const { text } = await request.json();

  if (!text?.trim()) {
    return NextResponse.json({ success: false, message: "Texto vazio." }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_LANGUAGELAYER_KEY;

  if (!apiKey || apiKey === "SUA_LANGUAGELAYER_KEY_AQUI") {
    return NextResponse.json({ success: false, message: "API Key não configurada.", fallback: true });
  }

  // Try new apilayer.com endpoint first (header-based auth)
  try {
    const res = await fetch(
      `https://api.apilayer.com/language_detection/detect?q=${encodeURIComponent(text.trim())}`,
      {
        method: "GET",
        headers: { apikey: apiKey },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const top = data.languages?.[0];

      if (top) {
        return NextResponse.json({
          success: true,
          languageCode: top.language?.toLowerCase().slice(0, 2) || "und",
          languageName: top.language,
          reliability: Math.round(top.confidence ?? 90),
          isReliable: (top.confidence ?? 0) >= 70,
        });
      }
    }

    // Fall through to legacy endpoint if new one fails
    console.warn("[LanguageLayer] New endpoint failed, trying legacy...");
  } catch (err) {
    console.warn("[LanguageLayer] New endpoint error:", err.message);
  }

  // Try legacy apilayer.net endpoint (query-param auth)
  try {
    const res = await fetch(
      `http://apilayer.net/api/detect?access_key=${apiKey}&query=${encodeURIComponent(text.trim())}`
    );

    if (res.ok) {
      const data = await res.json();

      if (data.success) {
        const top = data.results?.[0];
        if (top) {
          return NextResponse.json({
            success: true,
            languageCode: top.language_code,
            languageName: top.language_name,
            reliability: top.percentage,
            isReliable: top.is_reliable,
          });
        }
      }
    }
  } catch (err) {
    console.warn("[LanguageLayer] Legacy endpoint error:", err.message);
  }

  return NextResponse.json({ success: false, message: "Não foi possível detectar o idioma.", fallback: true });
}
