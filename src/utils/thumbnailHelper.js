/**
 * thumbnailHelper.js
 * Generates compact, optimized canvas preview thumbnails for Firestore cloud storage.
 */
export function generateThumbnail(canvas, targetWidth = 320, targetHeight = 180) {
  if (!canvas) return null;
  try {
    const offscreen = document.createElement('canvas');
    offscreen.width = targetWidth;
    offscreen.height = targetHeight;
    const ctx = offscreen.getContext('2d');

    // Fill dark background
    ctx.fillStyle = '#111318';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Crop center and scale
    const srcRatio = canvas.width / canvas.height;
    const dstRatio = targetWidth / targetHeight;
    let sw = canvas.width;
    let sh = canvas.height;
    let sx = 0;
    let sy = 0;

    if (srcRatio > dstRatio) {
      sw = canvas.height * dstRatio;
      sx = (canvas.width - sw) / 2;
    } else {
      sh = canvas.width / dstRatio;
      sy = (canvas.height - sh) / 2;
    }

    ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
    return offscreen.toDataURL('image/webp', 0.7);
  } catch (err) {
    console.warn('Could not generate canvas thumbnail:', err);
    return null;
  }
}
