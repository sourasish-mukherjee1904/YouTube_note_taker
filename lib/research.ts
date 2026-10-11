/**
 * Web Research Service for Learning Gap Resolution
 * Searches authoritative educational resources to augment missing lecture explanations.
 * Supports Tavily API with DuckDuckGo / Wikipedia educational fallbacks.
 */

export interface ResearchResult {
  title: string;
  url: string;
  snippet: string;
  sourceName: string;
  accessedDate: string;
}

export async function searchEducationalResource(
  query: string,
  options: { tavilyApiKey?: string } = {}
): Promise<ResearchResult | null> {
  const tavilyKey = options.tavilyApiKey || process.env.TAVILY_API_KEY;
  const today = new Date().toISOString().split("T")[0];

  // Strategy 1: Tavily AI Search (if key provided)
  if (tavilyKey && tavilyKey.trim().length > 0 && tavilyKey !== "your_tavily_api_key_here") {
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${query} tutorial explanation educational definition`,
          search_depth: "basic",
          include_answer: true,
          max_results: 3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const firstResult = data.results?.[0];
        if (firstResult) {
          const domain = new URL(firstResult.url).hostname.replace("www.", "");
          return {
            title: firstResult.title || query,
            url: firstResult.url,
            snippet: data.answer || firstResult.content || "",
            sourceName: domain,
            accessedDate: today,
          };
        }
      }
    } catch (err) {
      console.warn("Tavily search failed, falling back:", err);
    }
  }

  // Strategy 2: Wikipedia Summary API (extremely reliable, authoritative, zero rate limit)
  try {
    const cleanTerm = encodeURIComponent(query.replace(/[?.,]/g, "").trim().slice(0, 80));
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${cleanTerm}`;
    const res = await fetch(wikiUrl, {
      headers: { "User-Agent": "LectureLensEducationalCompanion/1.0 (contact@lecturelens.app)" },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.extract && data.type !== "disambiguation") {
        return {
          title: data.title || query,
          url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${cleanTerm}`,
          snippet: data.extract,
          sourceName: "Wikipedia (Educational Reference)",
          accessedDate: today,
        };
      }
    }
  } catch (err) {
    console.warn("Wikipedia fallback failed:", err);
  }

  // Strategy 3: DuckDuckGo HTML / Instant Answer fallback
  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(ddgUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.AbstractText) {
        return {
          title: data.Heading || query,
          url: data.AbstractURL || "https://duckduckgo.com",
          snippet: data.AbstractText,
          sourceName: data.AbstractSource || "DuckDuckGo Educational Index",
          accessedDate: today,
        };
      }
    }
  } catch (err) {
    console.warn("DuckDuckGo fallback failed:", err);
  }

  return null;
}
