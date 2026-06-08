const sharp = require('sharp');

const MAX_PX = 1600;
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;
const MAX_BYTES = 4 * 1024 * 1024; // Vercel serverless limit ~4.5MB

async function compressImage(buffer, mimetype) {
  let pipeline = sharp(buffer).rotate();

  const meta = await pipeline.metadata();
  if (meta.width > MAX_PX || meta.height > MAX_PX) {
    pipeline = pipeline.resize(MAX_PX, MAX_PX, { fit: 'inside', withoutEnlargement: true });
  }

  if (mimetype === 'image/png') {
    return pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 }).toBuffer();
  }
  if (mimetype === 'image/webp') {
    return pipeline.webp({ quality: JPEG_QUALITY }).toBuffer();
  }
  if (mimetype === 'image/gif') {
    return buffer;
  }
  return pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
}

async function prepareImageForStorage(buffer, mimetype) {
  let output = await compressImage(buffer, mimetype);

  if (output.length > MAX_BYTES && mimetype !== 'image/gif') {
    output = await sharp(output)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 70, mozjpeg: true })
      .toBuffer();
  }

  if (output.length > MAX_BYTES) {
    throw new Error('Image is too large even after compression. Try a smaller file (under 4MB).');
  }

  const contentType = mimetype === 'image/png' && output.length < buffer.length
    ? 'image/png'
    : mimetype === 'image/gif'
      ? 'image/gif'
      : output.length < buffer.length && mimetype !== 'image/png'
        ? 'image/jpeg'
        : mimetype;

  return { buffer: output, contentType };
}

module.exports = { prepareImageForStorage };
