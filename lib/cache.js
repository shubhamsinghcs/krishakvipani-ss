const weatherCache = new Map();
const genericCache = new Map();

const DEFAULT_WEATHER_TTL_MS = 8 * 60 * 1000;

export function getWeatherCache(cityKey, options = {}) {
  let entry = weatherCache.get(cityKey);
  
  if (!entry && typeof window !== "undefined") {
    try {
      const localData = localStorage.getItem(`weather_${cityKey}`);
      if (localData) {
         entry = JSON.parse(localData);
         weatherCache.set(cityKey, entry);
      }
    } catch(e) {}
  }

  if (!entry) return null;
  const allowStale = Boolean(options.allowStale);
  if (!allowStale && Date.now() > entry.expiresAt) {
    weatherCache.delete(cityKey);
    return null;
  }
  return entry.payload;
}

export function setWeatherCache(cityKey, payload, ttlMs = DEFAULT_WEATHER_TTL_MS) {
  const data = {
    payload: { ...payload },
    expiresAt: Date.now() + ttlMs,
  };
  weatherCache.set(cityKey, data);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`weather_${cityKey}`, JSON.stringify(data));
      // Save global latest weather for assistant context
      localStorage.setItem("weather_data", JSON.stringify(payload));
    } catch(e) {}
  }
}

export function setCache(key, value, ttlMs = 300000) {
  const data = {
    value,
    expiresAt: Date.now() + ttlMs,
  };
  genericCache.set(key, data);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(data));
    } catch(e) {}
  }
}

export function getCache(key) {
  let cached = genericCache.get(key);
  if (!cached && typeof window !== "undefined") {
    try {
      const localData = localStorage.getItem(`cache_${key}`);
      if (localData) {
         cached = JSON.parse(localData);
         genericCache.set(key, cached);
      }
    } catch(e) {}
  }

  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    genericCache.delete(key);
    return null;
  }
  return cached.value;
}
