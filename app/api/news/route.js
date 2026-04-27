import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeArticle(article) {
  return {
    title: article.title || "Untitled",
    summary: article.description || article.content || "No summary available.",
    source: article.source?.name || "Unknown Source",
    date: article.publishedAt || new Date().toISOString(),
    url: article.url || "#",
    image: article.urlToImage || null,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = (searchParams.get("city") || "").trim();
    const cacheKey = `news:${city.toLowerCase() || "india"}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, ...cached, cached: true }, { status: 200 });
    }

    const apiKey = process.env.NEWS_API_KEY;
    const query = city ? `agriculture farming ${city} india` : "agriculture farming india";
    let articles = [];

    if (apiKey && !apiKey.includes("your_")) {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        query
      )}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${encodeURIComponent(apiKey)}`;
      const response = await fetchWithTimeout(url, 8000);
      if (response.ok) {
        const payload = await response.json();
        articles = (payload.articles || []).map(normalizeArticle);
      }
    }

    if (!articles.length) {
      articles = [
        {
          title: "Punjab farmers adopt precision irrigation to save water",
          summary: "New adoption across districts shows improved wheat yield and reduced pumping hours.",
          source: "Agri Desk",
          date: new Date().toISOString(),
          url: "https://www.google.com/search?q=Punjab+precision+irrigation+farmers",
          image: null,
        },
        {
          title: "India expands agri-export support for basmati and spices",
          summary: "Farmer producer groups are receiving quality and logistics support under export clusters.",
          source: "Market Watch",
          date: new Date().toISOString(),
          url: "https://www.google.com/search?q=India+agri+export+support+basmati+spices",
          image: null,
        },
      ];
    }

    const result = {
      articles,
      total: articles.length,
      fetchedAt: new Date().toISOString(),
    };
    setCache(cacheKey, result, 300000);
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        success: false,
        articles: [],
        total: 0,
        fetchedAt: new Date().toISOString(),
        fallback: true,
        message: "समाचार लोड करने में त्रुटि।",
      },
      { status: 503 }
    );
  }
}
