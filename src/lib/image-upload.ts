/**
 * Client-side image upload and compression utility.
 * Reads local drive image files, resizes them if needed to prevent memory/storage bloat,
 * and converts them to crisp high-quality Data URLs for instant preview & persistent storage.
 */

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export function processAndCompressImage(
  file: File,
  maxDimension = 1000,
  quality = 0.80
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

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      // Maintain aspect ratio while capping max dimension to 1000px (crisp retina quality)
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

      // Fill with clean ivory/white background so transparent PNGs don't artifact or turn black
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG with quality compression (reduces 3MB+ photos to crisp ~60KB-90KB)
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      } catch (err) {
        console.warn("Canvas toDataURL failed, falling back to direct reader:", err);
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
  maxDimension = 1000,
  quality = 0.80
): Promise<string[]> {
  const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
  const promises = fileArray.map((f) => processAndCompressImage(f, maxDimension, quality));
  const results = await Promise.all(promises);
  return results.filter((url) => Boolean(url));
}
