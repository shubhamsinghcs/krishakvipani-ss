export function safeEnv(key, fallback = "") {
  if (typeof process === "undefined") {
    // If somehow accessed in a non-Node.js/Next.js environment
    return fallback;
  }
  
  const value = process.env[key];
  if (value === undefined || value === null || value === "") {
    if (fallback === "") {
      console.warn(`⚠️ Warning: Environment variable ${key} is missing. Using fallback.`);
    }
    return fallback;
  }
  return value;
}
