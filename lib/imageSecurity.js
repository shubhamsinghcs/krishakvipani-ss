/**
 * Image Security & Request Rate-Limiting Module
 * Validates binary magic numbers, inspects for payload injection, strips EXIF/GPS metadata,
 * enforces file size boundaries, and protects endpoints with sliding window rate limiting.
 */

export const MIN_FILE_SIZE = 5 * 1024; // 5 KB minimum to prevent corrupt/stub files
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB maximum upload size

// In-memory sliding window rate limiter
const rateLimitMap = new Map();
let lastCleanup = Date.now();

export function checkRateLimit(key, maxRequests = 15, windowMs = 60 * 1000) {
  const now = Date.now();

  // Periodic cleanup of stale rate limits every 2 minutes
  if (now - lastCleanup > 2 * 60 * 1000) {
    for (const [k, data] of rateLimitMap.entries()) {
      if (now - data.resetTime > windowMs) {
        rateLimitMap.delete(k);
      }
    }
    lastCleanup = now;
  }

  let record = rateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    rateLimitMap.set(key, record);
    return { allowed: true, remaining: maxRequests - 1, resetSeconds: Math.ceil(windowMs / 1000) };
  }

  record.count += 1;
  const remaining = Math.max(0, maxRequests - record.count);
  const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

  if (record.count > maxRequests) {
    return { allowed: false, remaining: 0, resetSeconds };
  }

  return { allowed: true, remaining, resetSeconds };
}

/**
 * Validates file size against minimum and maximum boundaries.
 */
export function validateImageFileSize(size, minSize = MIN_FILE_SIZE, maxSize = MAX_FILE_SIZE) {
  if (typeof size !== "number" || isNaN(size)) {
    return { valid: false, error: "Invalid file size." };
  }
  if (size < minSize) {
    return {
      valid: false,
      error: `File is too small (${(size / 1024).toFixed(1)} KB). Minimum allowed size is ${Math.round(minSize / 1024)} KB.`,
    };
  }
  if (size > maxSize) {
    return {
      valid: false,
      error: `File exceeds maximum allowed size (${(size / (1024 * 1024)).toFixed(1)} MB). Limit is ${Math.round(maxSize / (1024 * 1024))} MB.`,
    };
  }
  return { valid: true };
}

/**
 * Validates file magic bytes to verify legitimate binary image formats.
 * Prevents attackers from uploading .exe, .sh, or .php renamed to .jpg/.png.
 */
export function validateImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) {
    return { valid: false, format: "unknown", error: "File buffer too small to be a valid image." };
  }

  const b = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  // JPEG: FF D8 FF
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return { valid: true, format: "image/jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a
  ) {
    return { valid: true, format: "image/png" };
  }

  // WEBP: RIFF .... WEBP
  if (
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  ) {
    return { valid: true, format: "image/webp" };
  }

  return {
    valid: false,
    format: "unknown",
    error: "File is not a valid JPEG, PNG, or WEBP image binary.",
  };
}

/**
 * Checks for malicious script signatures in image headers
 */
export function scanForMaliciousPayload(buffer) {
  const b = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const sample = b.subarray(0, Math.min(b.length, 4096)).toString("latin1").toLowerCase();

  const dangerousPatterns = [
    "<script",
    "<?php",
    "<%=",
    "eval(",
    "javascript:",
    "/bin/sh",
    "cmd.exe",
    "powershell",
    "base64_decode",
  ];

  for (const pattern of dangerousPatterns) {
    if (sample.includes(pattern)) {
      return { safe: false, reason: `Malicious signature detected: ${pattern}` };
    }
  }

  return { safe: true };
}

/**
 * Strips sensitive EXIF/APP1 metadata (GPS coordinates, camera serial numbers)
 * from JPEG and ancillary metadata chunks from PNG images to protect farmer privacy.
 */
export function stripExifMetadata(buffer) {
  if (!buffer || buffer.length < 16) return buffer;
  const b = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  // 1. JPEG EXIF Stripping
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    const pieces = [Buffer.from([0xff, 0xd8])];
    let offset = 2;
    let foundScan = false;

    while (offset < b.length) {
      if (b[offset] !== 0xff) {
        // Unexpected format, return original safely
        return buffer;
      }

      // Skip fill bytes (consecutive 0xFF)
      while (offset < b.length && b[offset] === 0xff) {
        offset++;
      }
      if (offset >= b.length) break;

      const marker = b[offset];
      offset++;

      // Standalone markers without length: RST0-7, SOI, EOI
      if (marker === 0xd9) { // EOI
        pieces.push(Buffer.from([0xff, 0xd9]));
        break;
      }
      if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
        pieces.push(Buffer.from([0xff, marker]));
        continue;
      }

      if (offset + 2 > b.length) break;
      const length = b.readUInt16BE(offset);

      // Marker 0xDA is Start of Scan (SOS) - image data begins here until EOI
      if (marker === 0xda) {
        pieces.push(b.subarray(offset - 2));
        foundScan = true;
        break;
      }

      // Check if this is an APP1 (0xE1 - EXIF/GPS) or COM (0xFE - Comment) marker
      const isExifMarker = marker === 0xe1 || marker === 0xfe;

      if (!isExifMarker) {
        // Retain standard markers (SOF0, DHT, DQT, APP0 JFIF, etc.)
        pieces.push(b.subarray(offset - 2, offset + length));
      }

      offset += length;
    }

    if (foundScan || pieces.length > 1) {
      return Buffer.concat(pieces);
    }
    return buffer;
  }

  // 2. PNG Metadata Stripping (eXIf, tEXt, zTXt, iTXt)
  if (
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a
  ) {
    const chunks = [b.subarray(0, 8)];
    let offset = 8;

    while (offset + 8 <= b.length) {
      const length = b.readUInt32BE(offset);
      const type = b.toString("ascii", offset + 4, offset + 8);
      const totalChunkLen = 12 + length;

      if (offset + totalChunkLen > b.length) break;

      // Filter out metadata chunks
      const isMetadataChunk = ["eXIf", "tEXt", "zTXt", "iTXt"].includes(type);
      if (!isMetadataChunk) {
        chunks.push(b.subarray(offset, offset + totalChunkLen));
      }

      offset += totalChunkLen;
      if (type === "IEND") break;
    }

    return Buffer.concat(chunks);
  }

  return buffer;
}
