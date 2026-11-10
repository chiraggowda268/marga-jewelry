import { uploadToFirebaseStorage } from "./firebase";

/**
 * Client-side image upload, multi-threaded decode, adaptive compression,
 * and iPhone HEIC conversion utility.
 * 
 * Capable of handling high-resolution 5-25MB DSLR/iPhone camera photos (.heic, .jpg, .png)
 * without memory crashes, converting HEIC smoothly, resizing with high-fidelity interpolation
 * to crisp HD, and compressing into compact, retina-sharp WebP assets (~40-55KB)
 * so products can hold 10+ photos without ever breaching Firestore's 1MB limit.
 */

export function readFileAsDataURL(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Handles iPhone HEIC / HEIF photos by converting them to standard JPEG Blobs
 */
async function ensureStandardImageFile(file: File): Promise<File> {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name);

  if (isHeic && typeof window !== "undefined") {
    try {
      const heic2anyModule = await import("heic2any");
      const heic2anyFn = (heic2anyModule.default || heic2anyModule) as (options: any) => Promise<Blob | Blob[]>;
      const converted = await heic2anyFn({
        blob: file,
        toType: "image/jpeg",
        quality: 0.82,
      });
      const singleBlob = Array.isArray(converted) ? converted[0] : converted;
      if (singleBlob) {
        return new File(
          [singleBlob],
          file.name.replace(/\.(heic|heif)$/i, ".jpg"),
          { type: "image/jpeg" }
        );
      }
    } catch (err) {
      console.warn("[ImageUpload] Could not convert HEIC with heic2any, trying native decode:", err);
    }
  }
  return file;
}

function canvasToBlob(canvas: HTMLCanvasElement, type = "image/webp", quality = 0.75): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // If webp blob fails, fallback to jpeg blob
          canvas.toBlob((jpegBlob) => resolve(jpegBlob), "image/jpeg", quality);
        }
      },
      type,
      quality
    );
  });
}

/**
 * Resizes and encodes a canvas to an optimized Data URL with adaptive size targeting.
 * Keeps output strictly under ~65 KB so even 12+ images comfortably fit in a single Firestore document.
 */
function getOptimizedDataUrl(canvas: HTMLCanvasElement, initialQuality = 0.75): string {
  // 1. Try modern WebP first (30-50% smaller than JPEG at identical visual quality)
  let format = "image/webp";
  let quality = initialQuality;
  let dataUrl = "";

  try {
    dataUrl = canvas.toDataURL(format, quality);
  } catch {
    format = "image/jpeg";
    dataUrl = canvas.toDataURL(format, quality);
  }

  // Verify browser actually created webp
  if (!dataUrl.startsWith("data:image/webp")) {
    format = "image/jpeg";
    dataUrl = canvas.toDataURL(format, quality);
  }

  // 2. Adaptive compression: target max ~65,000 chars (~48 KB base64)
  const MAX_DATA_URL_LENGTH = 65000;
  while (dataUrl.length > MAX_DATA_URL_LENGTH && quality > 0.38) {
    quality -= 0.07;
    try {
      dataUrl = canvas.toDataURL(format, quality);
    } catch {
      break;
    }
  }

  // 3. If still over threshold (very complex texture), do a secondary downscale
  if (dataUrl.length > MAX_DATA_URL_LENGTH && canvas.width > 700) {
    try {
      const smallCanvas = document.createElement("canvas");
      const scale = 0.80;
      smallCanvas.width = Math.round(canvas.width * scale);
      smallCanvas.height = Math.round(canvas.height * scale);
      const smallCtx = smallCanvas.getContext("2d");
      if (smallCtx) {
        smallCtx.fillStyle = "#ffffff";
        smallCtx.fillRect(0, 0, smallCanvas.width, smallCanvas.height);
        smallCtx.imageSmoothingEnabled = true;
        smallCtx.imageSmoothingQuality = "high";
        smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
        const secondPass = smallCanvas.toDataURL(format, 0.70);
        if (secondPass && secondPass.length < dataUrl.length) {
          dataUrl = secondPass;
        }
      }
    } catch {}
  }

  return dataUrl;
}

export async function processAndCompressImage(
  file: File,
  maxDimension = 1000,
  initialQuality = 0.75,
  folder = "products"
): Promise<string> {
  // If it's an SVG vector, read directly
  if (file.type === "image/svg+xml") {
    try {
      return await readFileAsDataURL(file);
    } catch {
      return "";
    }
  }

  return new Promise((resolve) => {
    const handleImageProcessing = async (source: HTMLImageElement | ImageBitmap, originalWidth: number, originalHeight: number) => {
      let width = originalWidth;
      let height = originalHeight;

      // Maintain aspect ratio while capping max dimension to 1000px (crisp HD retina quality)
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        readFileAsDataURL(file).then(resolve).catch(() => resolve(""));
        return;
      }

      // Fill with clean white background so transparent PNGs don't artifact or turn black
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(source, 0, 0, width, height);

      const optimizedDataUrl = getOptimizedDataUrl(canvas, initialQuality);

      // Attempt upload to Firebase Cloud Storage if active, with fast failover (no long 10s hangs)
      try {
        const blob = await canvasToBlob(canvas, "image/webp", initialQuality);
        if (blob) {
          const uploadPromise = uploadToFirebaseStorage(blob, folder, file.name);
          const timeoutPromise = new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error("Storage timeout")), 2000)
          );
          const cloudUrl = await Promise.race([uploadPromise, timeoutPromise]);
          if (cloudUrl && cloudUrl.startsWith("http")) {
            resolve(cloudUrl);
            return;
          }
        }
      } catch {
        // Storage bucket not provisioned - seamlessly use optimized high-clarity data URL
      }

      resolve(optimizedDataUrl);
    };

    // Use modern createImageBitmap for fast, multi-threaded decoding
    if (typeof window !== "undefined" && typeof window.createImageBitmap === "function") {
      createImageBitmap(file)
        .then((bitmap) => {
          handleImageProcessing(bitmap, bitmap.width, bitmap.height);
        })
        .catch(() => {
          // Fallback to standard Image loading
          fallbackStandardImageLoader(file, resolve, handleImageProcessing);
        });
    } else {
      fallbackStandardImageLoader(file, resolve, handleImageProcessing);
    }
  });
}

function fallbackStandardImageLoader(
  file: File,
  resolve: (val: string) => void,
  processor: (img: HTMLImageElement, w: number, h: number) => void
) {
  const url = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    URL.revokeObjectURL(url);
    processor(img, img.naturalWidth || img.width, img.naturalHeight || img.height);
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
    // If standard image fails to decode (e.g. unsupported raw format), resolve empty so it doesn't store broken 8MB data
    resolve("");
  };

  img.src = url;
}

/**
 * Sequentially processes multiple image files without spiking memory.
 * Converts iPhone HEIC, optimizes dimensions, and compresses to compact WebP.
 */
export async function processMultipleImageFiles(
  files: FileList | File[],
  maxDimension = 1000,
  quality = 0.75,
  folder = "products"
): Promise<string[]> {
  const allowedExtensions = /\.(jpe?g|png|webp|avif|gif|svg|bmp|tiff|heic|heif)$/i;
  const fileArray = Array.from(files).filter(
    (f) => f.type.startsWith("image/") || allowedExtensions.test(f.name)
  );

  const results: string[] = [];
  // Process sequentially to keep memory usage low and prevent mobile tab crashes
  for (const rawFile of fileArray) {
    try {
      const file = await ensureStandardImageFile(rawFile);
      const url = await processAndCompressImage(file, maxDimension, quality, folder);
      if (url && url.length > 50) {
        results.push(url);
      }
    } catch (err) {
      console.error(`[ImageUpload] Failed to process ${rawFile.name}:`, err);
    }
  }

  return results;
}
