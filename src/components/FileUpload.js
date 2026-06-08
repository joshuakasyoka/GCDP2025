import React, { useRef, useState } from 'react';
import { archiveApi } from '../services/archiveApi';
import { compressImageFile } from '../utils/compressImageClient';
import styles from '../styles/FileUpload.module.css';

function parsePaths(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

const FileUpload = ({ studentId, value, onChange, label = 'Images' }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const paths = parsePaths(value);

  const uploadFiles = async (files) => {
    if (!files.length) return;
    if (!studentId) {
      setError('Save the student profile first before uploading');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const compressed = await Promise.all([...files].map(compressImageFile));
      const { urls } = await archiveApi.uploadFiles(studentId, compressed);
      onChange([...paths, ...urls].join(', '));
    } catch (err) {
      setError(err.message.includes('413') || err.message.includes('Too Large')
        ? 'Image too large — try a smaller file or take a screenshot at lower resolution'
        : err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles([...e.dataTransfer.files]);
  };

  const removePath = (pathToRemove) => {
    onChange(paths.filter(p => p !== pathToRemove).join(', '));
  };

  return (
    <div className={styles.upload}>
      <label className={styles.label}>{label}</label>
      <div
        className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => uploadFiles([...e.target.files])}
        />
        <span className={styles.dropText}>
          {uploading ? 'Uploading…' : 'Drop images here or click to browse (max 10MB, compressed for web)'}
        </span>
      </div>

      {paths.length > 0 && (
        <ul className={styles.previewList}>
          {paths.map(path => (
            <li key={path} className={styles.previewItem}>
              <img src={path} alt="" className={styles.previewImg} />
              <span className={styles.previewPath}>{path}</span>
              <button type="button" className={styles.removeBtn} onClick={() => removePath(path)}>×</button>
            </li>
          ))}
        </ul>
      )}

      <input
        className={styles.pathInput}
        value={typeof value === 'string' ? value : paths.join(', ')}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/api/media/... or /uploads/student_01/image.jpg"
      />

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default FileUpload;
