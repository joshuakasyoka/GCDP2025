const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = require('mongodb');
const { prepareImageForStorage } = require('./compressImage');

const UPLOAD_ROOT = path.join(__dirname, '../public/uploads');

function getBucket() {
  if (!mongoose.connection?.db) return null;
  return new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
}

function buildFilename(originalname) {
  const ext = path.extname(originalname).toLowerCase() || '.jpg';
  const base = path.basename(originalname, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40) || 'image';
  return `${Date.now()}-${base}${ext}`;
}

async function storeImageMongo(file, studentId) {
  const bucket = getBucket();
  if (!bucket) throw new Error('MongoDB not connected');

  const { buffer, contentType } = await prepareImageForStorage(file.buffer, file.mimetype);
  const ext = contentType === 'image/png' ? '.png' : contentType === 'image/webp' ? '.webp' : '.jpg';
  const filename = buildFilename(file.originalname).replace(/\.[^.]+$/, ext);
  const safeStudentId = studentId.replace(/[^a-zA-Z0-9_-]/g, '');

  return new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(filename, {
      metadata: {
        studentId: safeStudentId,
        contentType,
        originalName: file.originalname,
      },
    });
    stream.on('error', reject);
    stream.on('finish', () => resolve(stream.id.toString()));
    stream.end(buffer);
  });
}

async function storeImageDisk(file, studentId) {
  const safeStudentId = studentId.replace(/[^a-zA-Z0-9_-]/g, '');
  const dir = path.join(UPLOAD_ROOT, safeStudentId);
  fs.mkdirSync(dir, { recursive: true });

  const { buffer, contentType } = await prepareImageForStorage(file.buffer, file.mimetype);
  const ext = contentType === 'image/png' ? '.png' : '.jpg';
  const filename = buildFilename(file.originalname).replace(/\.[^.]+$/, ext);
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, buffer);

  return `/uploads/${safeStudentId}/${filename}`;
}

async function storeImage(file, studentId, useMongo) {
  if (process.env.VERCEL && !useMongo) {
    throw new Error('MONGODB_URI is required for image uploads on Vercel');
  }
  if (useMongo) {
    const id = await storeImageMongo(file, studentId);
    return `/api/media/${id}`;
  }
  return storeImageDisk(file, studentId);
}

async function streamImage(fileId, res) {
  const bucket = getBucket();
  if (!bucket) {
    res.status(503).json({ error: 'Media storage unavailable' });
    return;
  }

  let objectId;
  try {
    objectId = new ObjectId(fileId);
  } catch {
    res.status(400).json({ error: 'Invalid file id' });
    return;
  }

  const files = await bucket.find({ _id: objectId }).toArray();
  if (!files.length) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  const file = files[0];
  res.set('Content-Type', file.metadata?.contentType || 'application/octet-stream');
  res.set('Cache-Control', 'public, max-age=31536000, immutable');

  bucket.openDownloadStream(objectId).pipe(res);
}

module.exports = { storeImage, streamImage, UPLOAD_ROOT };
