"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useLang } from "@/lib/LanguageContext";

const MAX_FILES = 3;
const MAX_BYTES = 5 * 1024 * 1024;

export default function ImageUploader({ onFilesChange }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const pushPreviewUrls = (files) => {
    const next = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setItems((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return next;
    });
    onFilesChange(files);
  };

  const compressImage = async (file) =>
    new Promise((resolve, reject) => {
      const image = new window.Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        const maxWidth = 960;
        const ratio = image.width > maxWidth ? maxWidth / image.width : 1;
        const targetWidth = Math.round(image.width * ratio);
        const targetHeight = Math.round(image.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const context = canvas.getContext("2d");
        if (!context) {
          URL.revokeObjectURL(url);
          reject(new Error("Canvas not supported"));
          return;
        }
        context.drawImage(image, 0, 0, targetWidth, targetHeight);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) {
              reject(new Error("Compression failed"));
              return;
            }
            const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressed);
          },
          "image/jpeg",
          0.72
        );
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Image decode failed"));
      };
      image.src = url;
    });

  const addFiles = async (fileList) => {
    const incoming = Array.from(fileList || []).filter((f) => f && f.type.startsWith("image/"));
    if (!incoming.length) {
      if (fileList?.length) setError(t.scanner.invalidType);
      return;
    }
    setError("");
    try {
      const current = items.map((i) => i.file);
      const merged = [...current];
      for (const f of incoming) {
        if (merged.length >= MAX_FILES) break;
        if (!f.type.startsWith("image/")) continue;
        const compressed = await compressImage(f);
        if (compressed.size > MAX_BYTES) {
          setError(t.scanner.tooLarge);
          onFilesChange([]);
          items.forEach((p) => URL.revokeObjectURL(p.url));
          setItems([]);
          return;
        }
        merged.push(compressed);
      }
      if (!merged.length) {
        onFilesChange([]);
        return;
      }
      const previews = merged.map((file) => ({ file, url: URL.createObjectURL(file) }));
      setItems((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.url));
        return previews;
      });
      onFilesChange(merged.slice(0, MAX_FILES));
    } catch {
      setError(t.scanner.failed);
      onFilesChange([]);
    }
  };

  const removeAt = (index) => {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      prev.forEach((p, i) => {
        if (i === index) URL.revokeObjectURL(p.url);
      });
      const files = next.map((n) => n.file);
      onFilesChange(files);
      return next;
    });
  };

  const clearAll = () => {
    setItems((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
    onFilesChange([]);
    setError("");
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-brand-textMid">{t.scanner.multiHint}</p>
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`min-h-[160px] rounded-2xl border-2 border-dashed p-4 text-center ${
          dragOver ? "border-green-500 bg-green-50" : "border-green-200 bg-white"
        }`}
      >
        {items.length === 0 ? (
          <div className="flex min-h-[140px] flex-col items-center justify-center gap-2">
            <span className="text-3xl">📷</span>
            <p className="text-sm font-medium text-brand-textDark">{t.scanner.dropTitle}</p>
            <p className="text-xs text-gray-500">{t.scanner.dropDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {items.map((item, index) => (
              <div key={item.url} className="relative aspect-square overflow-hidden rounded-xl border border-green-100 bg-gray-50">
                <Image src={item.url} alt="" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAt(index);
                  }}
                  className="absolute right-1 top-1 flex h-8 min-h-[32px] w-8 items-center justify-center rounded-full bg-black/65 text-sm text-white transition active:scale-95"
                  aria-label={t.scanner.removePhoto}
                >
                  ×
                </button>
              </div>
            ))}
            {items.length < MAX_FILES ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-green-300 bg-green-50/50 text-2xl text-green-700 transition active:scale-95"
              >
                +
              </button>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[44px] w-full rounded-xl border border-green-300 px-4 text-sm font-semibold text-brand-textMid transition active:scale-95 sm:w-auto"
        >
          {t.scanner.gallery}
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="min-h-[44px] w-full rounded-xl bg-green-600 px-4 text-sm font-semibold text-white transition active:scale-95 sm:w-auto"
        >
          {t.scanner.camera}
        </button>
        {items.length ? (
          <button
            type="button"
            onClick={clearAll}
            className="min-h-[44px] w-full rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700 transition active:scale-95 sm:w-auto"
          >
            {t.scanner.clearAll}
          </button>
        ) : null}
      </div>
      <p className="text-xs text-gray-500">{t.scanner.maxPhotos}</p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
