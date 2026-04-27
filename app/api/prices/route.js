import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { MANDI_DATA, PUNJAB_DISTRICTS } from "@/lib/constants";
import { getCache, setCache } from "@/lib/cache";
import { safeEnv } from "@/lib/env";
const API_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-IN,en;q=0.942,hi;q=0.9",
};

async function fetchWithTimeout(url, timeoutMs = 8000, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      ...init,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeRecord(record) {
  const modalRaw = record.modal_price || record.modalPrice || "0";
  const maxRaw = record.max_price || record.maxPrice || modalRaw;
  const minRaw = record.min_price || record.minPrice || modalRaw;
  return {
    market: record.market || record.market_name || "Unknown Market",
    crop: record.commodity || record.crop || "Unknown Crop",
    variety: record.variety || "Standard",
    minPrice: Number(minRaw) || 0,
    maxPrice: Number(maxRaw) || 0,
    modalPrice: Number(modalRaw) || 0,
    price: Number(modalRaw) || 0,
    unit: "quintal",
    date: record.arrival_date || record.date || new Date().toISOString().split("T")[0],
  };
}

function parseAgmarknetHtml(html, cropParam, districtParam) {
  try {
    const $ = cheerio.load(html);
    const out = [];
    const cropLower = cropParam.toLowerCase();
    const cropStem = cropLower.slice(0, Math.min(5, cropLower.length));
    const distLower = (districtParam || "").toLowerCase();

    $("table tr").each((_, tr) => {
      const cells = $(tr)
        .find("td")
        .map((__, td) =>
          $(td)
            .text()
            .replace(/\s+/g, " ")
            .trim()
        )
        .get();
      if (cells.length < 5) return;

      const rowText = cells.join(" ").toLowerCase();
      const cropHit =
        rowText.includes(cropLower) ||
        rowText.includes(cropStem) ||
        cells.some((c) => c.toLowerCase().includes(cropLower));
      if (!cropHit) return;
      if (districtParam && !rowText.includes(distLower)) return;

      const nums = cells
        .map((c) => Number(String(c).replace(/,/g, "")))
        .filter((n) => Number.isFinite(n) && n > 200 && n < 500000);

      if (!nums.length) return;

      const modalPrice = nums[nums.length - 1];
      const minPrice = nums.length > 1 ? nums[0] : modalPrice;
      const maxPrice = nums.length > 2 ? nums[Math.min(1, nums.length - 2)] : Math.max(minPrice, modalPrice);

      out.push({
        market: cells.find((c) => /mandi|market|yard|bazar|sabzi/i.test(c)) || cells[1] || cells[0] || "Mandi",
        crop: cropParam,
        variety: cells.find((c) => c.length > 1 && c.length < 40 && !/\d/.test(c)) || "Standard",
        minPrice,
        maxPrice: Math.max(minPrice, maxPrice, modalPrice),
        modalPrice,
        price: modalPrice,
        unit: "quintal",
        date: new Date().toISOString().split("T")[0],
      });
    });

    return out.filter((item) => item.modalPrice > 0).slice(0, 40);
  } catch {
    return [];
  }
}

async function fetchAgmarknetScrape(cropParam, districtParam) {
  try {
    const urls = [
      "https://www.agmarknet.gov.in/PriceAndArrivals/DatewiseCommodityReport.aspx",
      "https://agmarknet.gov.in/PriceAndArrivals/DatewiseCommodityReport.aspx",
    ];
    for (const url of urls) {
      const response = await fetchWithTimeout(url, 8000, { headers: BROWSER_HEADERS });
      if (!response.ok) continue;
      const html = await response.text();
      const parsed = parseAgmarknetHtml(html, cropParam, districtParam);
      if (parsed.length) return parsed;
      const loose = parseAgmarknetHtml(html, cropParam, "");
      if (loose.length) {
        return districtParam
          ? loose.filter(
              (row) =>
                String(row.market).toLowerCase().includes(districtParam.toLowerCase()) ||
                !districtParam
            )
          : loose;
      }
    }
  } catch {
    /* fallback chain */
  }
  return [];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cropParam = (searchParams.get("crop") || "Wheat").trim();
    const districtParam = (searchParams.get("district") || "").trim();
    const cropKey = cropParam.toLowerCase();
    const cacheKey = `prices:${cropKey}:${districtParam.toLowerCase()}`;

    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json(
        {
          ...cached,
          cached: true,
        },
        { status: 200, headers: { "Cache-Control": "s-maxage=300" } }
      );
    }

    if (districtParam && !PUNJAB_DISTRICTS.includes(districtParam)) {
      return NextResponse.json(
        { success: false, message: "अमान्य जिला चुना गया है।" },
        { status: 400, headers: { "Cache-Control": "s-maxage=300" } }
      );
    }

    let ogdData = [];
    const dataGovKey = safeEnv("DATA_GOV_API_KEY", "");

    if (dataGovKey && !dataGovKey.includes("your_")) {
      const url = `https://api.data.gov.in/resource/${API_RESOURCE_ID}?api-key=${encodeURIComponent(
        dataGovKey
      )}&format=json&limit=30&filters[commodity]=${encodeURIComponent(cropParam)}${
        districtParam ? `&filters[district]=${encodeURIComponent(districtParam)}` : ""
      }`;
      const response = await fetchWithTimeout(url, 8000);
      if (response.ok) {
        const payload = await response.json();
        const records = Array.isArray(payload?.records) ? payload.records : [];
        ogdData = records.map(normalizeRecord).filter((item) => item.modalPrice > 0);
      }
    }

    let scrapeData = [];
    if (!ogdData.length) {
      scrapeData = await fetchAgmarknetScrape(cropParam, districtParam);
    }

    let data = ogdData.length ? ogdData : scrapeData;
    let source = "fallback";
    if (ogdData.length) source = "ogd";
    else if (scrapeData.length) source = "agmarknet_scrape";

    if (!data.length) {
      const fallback = MANDI_DATA[cropKey];
      if (!fallback) {
        return NextResponse.json(
          { success: false, message: "फसल डेटा नहीं मिला।" },
          { status: 404, headers: { "Cache-Control": "s-maxage=300" } }
        );
      }
      source = "fallback";
      data = districtParam
        ? fallback.map((item) => ({
            ...item,
            crop: cropParam,
            price: item.modalPrice,
            market: item.market.includes(districtParam) ? item.market : `${districtParam} - ${item.market}`,
          }))
        : fallback.map((item) => ({ ...item, crop: cropParam, price: item.modalPrice }));
    }

    const responsePayload = {
      success: true,
      crop: cropParam,
      district: districtParam || null,
      data,
      fetchedAt: new Date().toISOString(),
      source,
    };

    setCache(cacheKey, responsePayload, 300000);

    return NextResponse.json(
      responsePayload,
      { status: 200, headers: { "Cache-Control": "s-maxage=300" } }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि। कृपया बाद में प्रयास करें।" },
      { status: 500, headers: { "Cache-Control": "s-maxage=300" } }
    );
  }
}
