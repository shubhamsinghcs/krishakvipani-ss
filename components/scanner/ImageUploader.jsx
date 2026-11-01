"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLang } from "@/lib/LanguageContext";

const MAX_FILES = 3;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MIN_BYTES = 5 * 1024; // 5 KB

export default function ImageUploader({ onFilesChange }) {
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Live Camera Viewfinder State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState("environment"); // "environment" (rear) or "user" (front)
  const [permissionError, setPermissionError] = useState("");

  const cameraStreamRef = useRef(null);
  cameraStreamRef.current = cameraStream;

  const fileInputRef = useRef(null);
  const nativeCameraInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const videoRef = useRef(null);
  const replaceIndexRef = useRef(null);

  // Slot definitions based on user instructions
  const slotsMeta = [
    {
      title: lang === "hi" ? "1. प्रभावित पौधा / फसल" : lang === "pa" ? "1. ਪ੍ਰਭਾਵਿਤ ਪੌਦਾ / ਫ਼ਸਲ" : "1. Affected Plant / Crop",
      desc: lang === "hi" ? "पूरे पौधे की स्थिति दिखाएं" : lang === "pa" ? "ਪੂਰੇ ਪੌਦੇ ਦੀ ਹਾਲਤ ਦਿਖਾਓ" : "Overall plant view",
      icon: "🌱",
    },
    {
      title: lang === "hi" ? "2. पत्ती या लक्षण का क्लोज़-अप" : lang === "pa" ? "2. ਪੱਤੇ ਜਾਂ ਲੱਛਣ ਦਾ ਕਲੋਜ਼-ਅੱਪ" : "2. Close-up of Leaf / Symptom",
      desc: lang === "hi" ? "धब्बे, कीड़े या सिकुड़न पर फोकस करें" : lang === "pa" ? "ਧੱਬੇ ਜਾਂ ਕੀੜੇ 'ਤੇ ਫੋਕਸ ਕਰੋ" : "Clear view of spots/lesions",
      icon: "🔍",
    },
    {
      title: lang === "hi" ? "3. निचली सतह, तना या फल" : lang === "pa" ? "3. ਹੇਠਲਾ ਹਿੱਸਾ, ਤਣਾ ਜਾਂ ਫਲ" : "3. Underside, Stem, or Fruit",
      desc: lang === "hi" ? "पत्ती के नीचे की फफूंद या तने की क्षति" : lang === "pa" ? "ਪੱਤੇ ਦੇ ਹੇਠਾਂ ਉੱਲੀ ਜਾਂ ਤਣੇ ਦਾ ਨੁਕਸਾਨ" : "Check for spores, rot, or stem streaks",
      icon: "🔬",
    },
  ];

  // Stop video stream helper
  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const startLiveCamera = async (facing = "environment") => {
    setPermissionError("");
    setError("");
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        nativeCameraInputRef.current?.click();
        return;
      }

      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCameraStream(stream);
      setIsCameraOpen(true);
      setCameraFacing(facing);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn("Camera access failed/denied:", err.name, err.message);
      stopCameraStream();
      setIsCameraOpen(false);

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionError(
          lang === "hi"
            ? "कैमरा अनुमति अस्वीकृत है। कृपया ब्राउज़र सेटिंग्स में कैमरा चालू करें या गैलरी से फोटो चुनें।"
            : lang === "pa"
            ? "ਕੈਮਰਾ ਅਨੁਮਤੀ ਅਸਵੀਕਾਰ ਕੀਤੀ ਗਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਕੈਮਰਾ ਆਗਿਆ ਦਿਓ ਜਾਂ ਗੈਲਰੀ ਵਿੱਚੋਂ ਚੁਣੋ।"
            : "Camera permission denied. Please enable camera access in browser site settings or choose a photo from your gallery."
        );
      } else {
        nativeCameraInputRef.current?.click();
      }
    }
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraOpen, cameraStream]);

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const capturedFile = new File([blob], `crop_${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        stopCameraStream();
        setIsCameraOpen(false);

        if (replaceIndexRef.current !== null) {
          replaceAt(replaceIndexRef.current, capturedFile);
          replaceIndexRef.current = null;
        } else {
          processAndAddFiles([capturedFile]);
        }
      },
      "image/jpeg",
      0.85
    );
  };

  const toggleFacingMode = () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    startLiveCamera(nextFacing);
  };

  // Client-side image quality, darkness, blur & resolution validator
  const validateClientImageQuality = (file) =>
    new Promise((resolve) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        // 1. Resolution Check
        if (img.width < 250 || img.height < 250) {
          URL.revokeObjectURL(url);
          resolve({
            valid: false,
            error:
              lang === "hi"
                ? `फोटो का रिज़ॉल्यूशन बहुत कम है (${img.width}x${img.height}px)। कृपया कम से कम 300x300 पिक्सेल की स्पष्ट फोटो लें ताकि पत्ती के लक्षण साफ दिखें।`
                : lang === "pa"
                ? `ਫੋਟੋ ਦਾ ਰੈਜ਼ੋਲਿਊਸ਼ਨ ਬਹੁਤ ਘੱਟ ਹੈ (${img.width}x${img.height}px)। ਕਿਰਪਾ ਕਰਕੇ ਸਾਫ਼ ਫੋਟੋ ਲਓ।`
                : `Image resolution is too low (${img.width}x${img.height}px). Please provide a photo with at least 300x300 pixels so symptoms are visible.`,
          });
          return;
        }

        // Sample a scaled 200x200 canvas to evaluate lighting, blur and color
        const sampleDim = 200;
        const canvas = document.createElement("canvas");
        canvas.width = sampleDim;
        canvas.height = sampleDim;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve({ valid: true });
          return;
        }

        ctx.drawImage(img, 0, 0, sampleDim, sampleDim);
        const imgData = ctx.getImageData(0, 0, sampleDim, sampleDim);
        const data = imgData.data;
        const pixelCount = sampleDim * sampleDim;

        let totalLum = 0;
        let totalLumSq = 0;
        let foliarPixelCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLum += lum;
          totalLumSq += lum * lum;

          // Check for natural plant/foliage hues (green, yellow-green, necrotic brown/rust lesions)
          const isGreenish = g > r * 0.8 && g > b * 0.85;
          const isBrownOrYellow = r > 70 && g > 50 && b < r * 0.85;
          if (isGreenish || isBrownOrYellow) {
            foliarPixelCount++;
          }
        }

        const meanLum = totalLum / pixelCount;
        const variance = totalLumSq / pixelCount - meanLum * meanLum;

        URL.revokeObjectURL(url);

        // 2. Extreme Darkness Check
        if (meanLum < 20) {
          resolve({
            valid: false,
            error:
              lang === "hi"
                ? "तस्वीर बहुत अंधेरी है। कृपया दिन के उजाले में फोटो लें या फोन की टॉर्च ऑन करके पत्ती पर रोशनी डालें।"
                : lang === "pa"
                ? "ਤਸਵੀਰ ਬਹੁਤ ਹਨੇਰੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਚੰਗੀ ਰੌਸ਼ਨੀ ਵਿੱਚ ਫੋਟੋ ਲਓ।"
                : "Photograph is too dark / underexposed. Please take the photo in open daylight or turn on your flashlight.",
          });
          return;
        }

        // 3. Extreme Overexposure Check
        if (meanLum > 250) {
          resolve({
            valid: false,
            error:
              lang === "hi"
                ? "तस्वीर में अत्यधिक चमक / सफेद रोशनी है। कृपया तेज धूप की चकाचौंध से बचाकर स्पष्ट फोटो लें।"
                : "Photograph is overexposed with harsh glare. Please shield from direct glare and capture a balanced photo.",
          });
          return;
        }

        // 4. Severe Blurriness Check (Only flag if variance is very low, e.g. < 12)
        // Does NOT reject normal field photos with natural background bokeh/soil.
        if (variance < 12) {
          resolve({
            valid: false,
            error:
              lang === "hi"
                ? "तस्वीर अत्यधिक धुंधली (Blurry) है। कृपया फोन को स्थिर रखें, पत्ती से 10-15 सेमी दूर रखकर स्क्रीन पर फोकस करने के लिए टैप करें।"
                : lang === "pa"
                ? "ਫੋਟੋ ਧੁੰਦਲੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਕੈਮਰਾ ਸਥਿਰ ਰੱਖ ਕੇ ਸਾਫ਼ ਫੋਟੋ ਖਿੱਚੋ।"
                : "Photo is blurry or out of focus. Please hold the phone steady 10–15 cm from the leaf and tap the screen to focus.",
          });
          return;
        }

        // 5. Vegetative presence check (flag only if practically zero plant spectrum exists)
        if (foliarPixelCount / pixelCount < 0.04) {
          resolve({
            valid: false,
            error:
              lang === "hi"
                ? "तस्वीर में फसल या पत्ती के लक्षण स्पष्ट नहीं दिख रहे हैं। कृपया सीधे रोगग्रस्त पत्ती या पौधे की फोटो लें।"
                : lang === "pa"
                ? "ਤਸਵੀਰ ਵਿੱਚ ਫ਼ਸਲ ਜਾਂ ਪੱਤੇ ਦੇ ਲੱਛਣ ਸਾਫ਼ ਨਹੀਂ ਦਿਖ ਰਹੇ। ਕਿਰਪਾ ਕਰਕੇ ਪੌਦੇ ਦੀ ਫੋਟੋ ਲਓ।"
                : "No recognizable plant or crop leaf detected. Please take a clear photo showing the crop leaves or affected fruit.",
          });
          return;
        }

        resolve({ valid: true });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          valid: false,
          error:
            lang === "hi"
              ? "फ़ाइल दूषित या अपठनीय है। कृपया एक वैध छवि चुनें।"
              : "Corrupted or unreadable image file. Please choose a valid photograph.",
        });
      };

      img.src = url;
    });

  // Client-side image compression & optimization
  const compressImage = async (file) =>
    new Promise((resolve, reject) => {
      const image = new window.Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        const maxWidth = 1200;
        const ratio = image.width > maxWidth ? maxWidth / image.width : 1;
        const targetWidth = Math.round(image.width * ratio);
        const targetHeight = Math.round(image.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const context = canvas.getContext("2d");
        if (!context) {
          URL.revokeObjectURL(url);
          reject(new Error("Canvas context unavailable"));
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
          0.8
        );
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Image decode failed"));
      };
      image.src = url;
    });

  const processAndAddFiles = async (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    setError("");
    setPermissionError("");
    setIsProcessing(true);
    setProcessingProgress(20);

    try {
      const validFiles = [];
      for (const f of incoming) {
        if (!f.type.startsWith("image/")) {
          setError(
            lang === "hi"
              ? "अमान्य फ़ाइल प्रारूप। कृपया केवल JPG, PNG या WEBP छवियां अपलोड करें।"
              : lang === "pa"
              ? "ਗਲਤ ਫਾਈਲ ਫਾਰਮੈਟ। ਕਿਰਪਾ ਕਰਕੇ ਸਿਰਫ਼ JPG, PNG ਜਾਂ WEBP ਫੋਟੋਆਂ ਹੀ ਅੱਪਲੋਡ ਕਰੋ।"
              : "Invalid file type. Please upload only JPG, PNG, or WEBP images."
          );
          continue;
        }

        if (f.size > MAX_BYTES) {
          setError(
            lang === "hi"
              ? `फ़ाइल बहुत बड़ी है (${(f.size / (1024 * 1024)).toFixed(1)}MB)। अधिकतम सीमा 10MB है।`
              : lang === "pa"
              ? `ਫਾਈਲ ਬਹੁਤ ਵੱਡੀ ਹੈ। ਵੱਧ ਤੋਂ ਵੱਧ ਆਕਾਰ 10MB ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।`
              : `File is too large (${(f.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is 10MB.`
          );
          continue;
        }

        if (f.size < MIN_BYTES) {
          setError(
            lang === "hi"
              ? "फ़ाइल का आकार बहुत छोटा है। कृपया स्पष्ट उच्च-गुणवत्ता वाली फोटो अपलोड करें।"
              : "File size is too small. Please upload a clear photo."
          );
          continue;
        }

        // Validate image quality (lighting, blur, resolution, and vegetative presence)
        const qualityCheck = await validateClientImageQuality(f);
        if (!qualityCheck.valid) {
          setError(qualityCheck.error);
          continue;
        }

        validFiles.push(f);
      }

      setProcessingProgress(60);

      const currentFiles = items.map((i) => i.file);
      const remainingSlots = MAX_FILES - currentFiles.length;

      if (remainingSlots <= 0) {
        if (!error) {
          setError(
            lang === "hi"
              ? "अधिकतम 3 फोटो ही अपलोड की जा सकती हैं। बदलने के लिए 'बदलें' बटन का उपयोग करें।"
              : lang === "pa"
              ? "ਵੱਧ ਤੋਂ ਵੱਧ 3 ਫੋਟੋਆਂ ਹੀ ਅੱਪਲੋਡ ਕੀਤੀਆਂ ਜਾ ਸਕਦੀਆਂ ਹਨ।"
              : "Maximum 3 photos allowed. Use 'Replace' on any image to change it."
          );
        }
        setIsProcessing(false);
        return;
      }

      const filesToAdd = validFiles.slice(0, remainingSlots);
      const compressedList = [];

      for (let i = 0; i < filesToAdd.length; i++) {
        const compressed = await compressImage(filesToAdd[i]);
        compressedList.push(compressed);
        setProcessingProgress(60 + Math.round(((i + 1) / filesToAdd.length) * 35));
      }

      const combinedFiles = [...currentFiles, ...compressedList];
      const newItems = combinedFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        sizeKb: Math.round(file.size / 1024),
      }));

      // Revoke old URLs
      items.forEach((p) => URL.revokeObjectURL(p.url));

      setItems(newItems);
      onFilesChange(combinedFiles);
    } catch (err) {
      setError(
        lang === "hi"
          ? "फोटो संसाधित करने में त्रुटि। कृपया पुनः प्रयास करें।"
          : "Error processing photo. Please try again."
      );
    } finally {
      setIsProcessing(false);
      setProcessingProgress(100);
    }
  };

  const removeAt = (index) => {
    const next = items.filter((_, i) => i !== index);
    if (items[index]?.url) {
      URL.revokeObjectURL(items[index].url);
    }
    setItems(next);
    onFilesChange(next.map((n) => n.file));
    setError("");
  };

  const triggerReplace = (index) => {
    replaceIndexRef.current = index;
    replaceInputRef.current?.click();
  };

  const replaceAt = async (index, newFile) => {
    if (!newFile) return;
    setIsProcessing(true);
    try {
      // Quality check on replacement image
      const qualityCheck = await validateClientImageQuality(newFile);
      if (!qualityCheck.valid) {
        setError(qualityCheck.error);
        setIsProcessing(false);
        return;
      }

      const compressed = await compressImage(newFile);
      const nextItems = [...items];
      if (nextItems[index]?.url) {
        URL.revokeObjectURL(nextItems[index].url);
      }
      nextItems[index] = {
        file: compressed,
        url: URL.createObjectURL(compressed),
        sizeKb: Math.round(compressed.size / 1024),
      };
      setItems(nextItems);
      onFilesChange(nextItems.map((n) => n.file));
      setError("");
    } catch {
      setError("Failed to replace image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    items.forEach((p) => URL.revokeObjectURL(p.url));
    setItems([]);
    onFilesChange([]);
    setError("");
    setPermissionError("");
  };

  return (
    <div className="space-y-5">
      {/* 1. Step-by-Step Farmer Capture Instructions */}
      <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50/80 via-white to-emerald-50/50 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-green-900 flex items-center gap-1.5">
            <span>📋</span>
            <span>
              {lang === "hi"
                ? "सटीक रोग पहचान के लिए फोटो निर्देश (1-3 फोटो)"
                : lang === "pa"
                ? "ਸਹੀ ਰੋਗ ਪਛਾਣ ਲਈ ਫੋਟੋ ਨਿਰਦੇਸ਼ (1-3 ਫੋਟੋਆਂ)"
                : "Image Capture Instructions (1–3 Photos)"}
            </span>
          </h3>
          <span className="rounded-full bg-green-100 border border-green-300 px-2.5 py-0.5 text-xs font-bold text-green-800">
            {items.length}/3 Selected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {slotsMeta.map((slot, idx) => {
            const hasPhoto = Boolean(items[idx]);
            return (
              <div
                key={idx}
                className={`relative flex flex-col justify-between rounded-xl border p-3 transition-all ${
                  hasPhoto
                    ? "border-green-400 bg-white shadow-sm ring-1 ring-green-300"
                    : "border-gray-200 bg-white/80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{slot.icon}</span>
                    {hasPhoto ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                        ✓ Ready
                      </span>
                    ) : (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                        {idx === 0 ? "Required" : "Recommended"}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-bold text-gray-900">{slot.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{slot.desc}</p>
                </div>

                {hasPhoto && (
                  <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2 text-[11px]">
                    <span className="text-gray-500 font-mono">{items[idx].sizeKb} KB</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => triggerReplace(idx)}
                        className="font-semibold text-green-700 hover:text-green-800"
                      >
                        {lang === "hi" ? "बदलें" : "Replace"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAt(idx)}
                        className="font-semibold text-red-600 hover:text-red-700"
                      >
                        {lang === "hi" ? "हटाएं" : "Remove"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rule Banner: Same Plant Problem */}
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50/90 border border-amber-200/90 p-2.5 text-xs text-amber-900">
          <span className="text-sm shrink-0">⚠️</span>
          <p className="leading-relaxed">
            <span className="font-bold">
              {lang === "hi" ? "महत्वपूर्ण नियम: " : lang === "pa" ? "ਮਹੱਤਵਪੂਰਨ ਨਿਯਮ: " : "Important Rule: "}
            </span>
            {lang === "hi"
              ? "सभी 1 से 3 तस्वीरें एक ही पौधे या रोगग्रस्त हिस्से की होनी चाहिए, ताकि AI लक्षणों की सही तुलना कर सके।"
              : lang === "pa"
              ? "ਸਾਰੀਆਂ 1 ਤੋਂ 3 ਫੋਟੋਆਂ ਇੱਕੋ ਪੌਦੇ ਜਾਂ ਰੋਗਗ੍ਰਸਤ ਹਿੱਸੇ ਦੀਆਂ ਹੋਣੀਆਂ ਚਾਹੀਦੀਆਂ ਹਨ।"
              : "Multiple images must show the same suspected plant problem so the diagnostic engine can triangulate symptoms accurately."}
          </p>
        </div>
      </div>

      {/* 2. Drag & Drop Zone and Previews Grid */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (items.length < MAX_FILES) {
            fileInputRef.current?.click();
          }
        }}
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
          processAndAddFiles(e.dataTransfer.files);
        }}
        className={`relative min-h-[170px] rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
          dragOver
            ? "border-green-500 bg-green-50/90 shadow-md scale-[1.01]"
            : "border-green-200 bg-white hover:border-green-400"
        } ${items.length >= MAX_FILES ? "cursor-default" : "cursor-pointer"}`}
      >
        {items.length === 0 ? (
          <div className="flex min-h-[140px] flex-col items-center justify-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600 shadow-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <p className="text-sm font-bold text-brand-textDark">
              {lang === "hi"
                ? "फोटो खींचें या गैलरी से चुनें (1-3 फोटो)"
                : lang === "pa"
                ? "ਫੋਟੋ ਖਿੱਚੋ ਜਾਂ ਗੈਲਰੀ 'ਚੋਂ ਚੁਣੋ (1-3 ਫੋਟੋਆਂ)"
                : "Capture or Upload Crop Photos (1–3 Images)"}
            </p>
            <p className="text-xs text-gray-500 max-w-sm">
              {lang === "hi"
                ? "कंप्यूटर या फोन से फोटो यहां ड्रैग करें, या नीचे दिए गए बटनों का उपयोग करें (JPG, PNG, WEBP)"
                : "Drag & drop photos here, or use the camera and gallery buttons below"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" onClick={(e) => e.stopPropagation()}>
            {items.map((item, index) => (
              <div
                key={item.url}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-green-200 bg-gray-50 shadow-sm"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-black/5">
                  <Image
                    src={item.url}
                    alt={`Crop photo ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                    Photo {index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600/90 text-xs font-bold text-white shadow-md transition hover:bg-red-700 active:scale-90"
                    title={lang === "hi" ? "फोटो हटाएं" : "Remove image"}
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-white border-t border-gray-100 text-xs">
                  <span className="font-mono text-[11px] text-gray-500">{item.sizeKb} KB</span>
                  <button
                    type="button"
                    onClick={() => triggerReplace(index)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-green-700 hover:bg-green-50 active:scale-95 text-[11px]"
                  >
                    <span>🔄</span> {lang === "hi" ? "बदलें" : "Replace"}
                  </button>
                </div>
              </div>
            ))}

            {/* Empty Slot Placeholder if fewer than 3 */}
            {items.length < MAX_FILES && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-300 bg-green-50/40 p-4 text-center cursor-pointer transition hover:bg-green-50 hover:border-green-400 active:scale-95"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-xl mb-1">
                  +
                </div>
                <p className="text-xs font-bold text-green-900">
                  {lang === "hi" ? `फोटो ${items.length + 1} जोड़ें` : `Add Photo ${items.length + 1}`}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {items.length === 1 ? "Close-up or leaf underside" : "Additional symptom angle"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar while compressing images */}
        {isProcessing && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-white/90 backdrop-blur-xs p-4">
            <div className="w-48 max-w-full">
              <div className="flex justify-between text-xs font-semibold text-green-800 mb-1">
                <span>{lang === "hi" ? "फोटो अनुकूलन व गुणवत्ता जांच..." : "Validating & Optimizing Photo..."}</span>
                <span>{processingProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-green-100">
                <div
                  className="h-full bg-green-600 transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Action Buttons: Camera & Gallery Controls */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
        {/* Live Camera Viewfinder Button */}
        <button
          type="button"
          onClick={() => startLiveCamera("environment")}
          className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          {lang === "hi" ? "कैमरा खोलें" : lang === "pa" ? "ਕੈਮਰਾ ਖੋਲ੍ਹੋ" : "Open Camera"}
        </button>

        {/* Mobile Native Direct Camera Launcher */}
        <button
          type="button"
          onClick={() => nativeCameraInputRef.current?.click()}
          className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-green-300 bg-green-50 px-4 text-sm font-semibold text-green-800 transition hover:bg-green-100 active:scale-95 sm:w-auto"
        >
          <span>📱</span>
          {lang === "hi" ? "फ़ोन कैमरा" : "Phone App Camera"}
        </button>

        {/* Choose From Gallery */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          {lang === "hi" ? "गैलरी से चुनें" : lang === "pa" ? "ਗੈਲਰੀ 'ਚੋਂ ਚੁਣੋ" : "Choose from Gallery"}
        </button>

        {/* Clear All Button */}
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="min-h-[46px] rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 active:scale-95 sm:w-auto"
          >
            {lang === "hi" ? "सब हटाएं" : "Clear All"}
          </button>
        )}
      </div>

      {/* 4. Clear Error & Permission Banners */}
      {permissionError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 shadow-sm">
          <span className="text-base shrink-0">📷</span>
          <div>
            <p className="font-bold">{lang === "hi" ? "कैमरा अनुमति आवश्यक है" : "Camera Permission Blocked"}</p>
            <p className="mt-0.5">{permissionError}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 shadow-sm">
          <span className="text-base shrink-0">⚠️</span>
          <div>
            <p className="font-bold">{lang === "hi" ? "फ़ोटो गुणवत्ता सूचना" : "Photo Quality Notice"}</p>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Hidden File Input (Gallery & Multi-file) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          processAndAddFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Hidden Native Mobile Camera Input */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          processAndAddFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Hidden Single-file Input for Specific Slot Replacement */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0] && replaceIndexRef.current !== null) {
            replaceAt(replaceIndexRef.current, e.target.files[0]);
            replaceIndexRef.current = null;
          }
          e.target.value = "";
        }}
      />

      {/* 5. Live Interactive Camera Viewfinder Modal */}
      {isCameraOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative flex w-full max-w-lg flex-col items-center overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl">
            {/* Camera Header */}
            <div className="flex w-full items-center justify-between bg-neutral-900/90 px-5 py-3 text-white">
              <span className="text-sm font-semibold tracking-wide flex items-center gap-2">
                <span>🍃</span>
                <span>
                  {replaceIndexRef.current !== null
                    ? `Replacing Photo ${replaceIndexRef.current + 1}`
                    : lang === "hi"
                    ? "पत्ती या लक्षण को फ्रेम में लाएं"
                    : lang === "pa"
                    ? "ਪੱਤੇ ਨੂੰ ਫਰੇਮ ਵਿੱਚ ਰੱਖੋ"
                    : "Align Crop Leaf in Target Frame"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setIsCameraOpen(false);
                  replaceIndexRef.current = null;
                }}
                className="rounded-full bg-white/20 p-1.5 text-white transition hover:bg-white/30"
              >
                ✕
              </button>
            </div>

            {/* Video Viewfinder */}
            <div className="relative aspect-[4/3] w-full bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />

              {/* Viewfinder Alignment Box */}
              <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-dashed border-green-400/80 shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Target Area
                </div>
              </div>
            </div>

            {/* Camera Controls */}
            <div className="flex w-full items-center justify-around bg-neutral-950 p-4">
              <button
                type="button"
                onClick={toggleFacingMode}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-90"
                title="Switch Camera (Front/Back)"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={capturePhoto}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-green-500 shadow-lg transition hover:scale-105 active:scale-95"
                title="Capture Photo"
              >
                <div className="h-12 w-12 rounded-full bg-white" />
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setIsCameraOpen(false);
                  replaceIndexRef.current = null;
                }}
                className="text-xs font-semibold text-gray-300 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
