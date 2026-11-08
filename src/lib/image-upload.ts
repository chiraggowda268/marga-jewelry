import { uploadToFirebaseStorage } from "./firebase";

/**
 * Client-side image upload, compression, and Firebase Cloud Storage utility.
 * Reads local drive image files, resizes them to prevent storage bloat,
 * uploads them directly to Firebase Cloud Storage for permanent HTTPS CDN URLs,
 * and falls back to optimized high-quality Data URLs if offline or cloud unavailable.
 */

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type = "image/jpeg", quality = 0.82): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

export function processAndCompressImage(
  file: File,
  maxDimension = 1200,
  quality = 0.82,
  folder = "products"
): Promise<string> {
  return new Promise((resolve) => {
    // If it's an SVG vector, read directly as data URL without rasterizing
    if (file.type === "image/svg+xml") {
      readFileAsDataURL(file)
        .then(resolve)
        .catch(() => resolve(""));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      // Maintain aspect ratio while capping max dimension to 1200px (crisp retina quality)
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
      ctx.drawImage(img, 0, 0, width, height);

      let fallbackDataUrl = "";
      try {
        fallbackDataUrl = canvas.toDataURL("image/jpeg", quality);
      } catch {}

      // Attempt direct upload to Firebase Cloud Storage for permanent HTTPS CDN URL
      try {
        const blob = await canvasToBlob(canvas, "image/jpeg", quality);
        if (blob) {
          const uploadPromise = uploadToFirebaseStorage(blob, folder, file.name);
          const timeoutPromise = new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error("Storage timeout")), 4000)
          );
          const cloudUrl = await Promise.race([uploadPromise, timeoutPromise]);
          if (cloudUrl) {
            resolve(cloudUrl);
            return;
          }
        }
      } catch (err) {
        console.warn("[Firebase Storage] Cloud upload failed or timed out, using optimized local asset:", err);
      }

      // Fallback to data URL
      if (fallbackDataUrl) {
        resolve(fallbackDataUrl);
      } else {
        readFileAsDataURL(file).then(resolve).catch(() => resolve(""));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      readFileAsDataURL(file).then(resolve).catch(() => resolve(""));
    };

    img.src = url;
  });
}

export async function processMultipleImageFiles(
  files: FileList | File[],
  maxDimension = 1200,
  quality = 0.82,
  folder = "products"
): Promise<string[]> {
  const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
  const promises = fileArray.map((f) => processAndCompressImage(f, maxDimension, quality, folder));
  const results = await Promise.all(promises);
  return results.filter((url) => Boolean(url));
}
