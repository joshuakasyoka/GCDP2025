import React, { useState, useEffect } from 'react';
import styles from '../styles/GalleryModal.module.css';

const GalleryModal = ({ artifact, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (artifact.file_paths) {
        if (e.key === 'ArrowRight' && currentImageIndex < artifact.file_paths.length - 1) {
          setCurrentImageIndex(currentImageIndex + 1);
        } else if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
          setCurrentImageIndex(currentImageIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, artifact.file_paths, currentImageIndex]);

  const handleOverlayClick = (e) => {
    e.preventDefault();
    onClose();
  };

  const handleContentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const nextImage = () => {
    if (artifact.file_paths && currentImageIndex < artifact.file_paths.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent} onClick={handleContentClick}>
        <button 
          className={styles.closeButton} 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className={styles.imageSection}>
          {artifact.file_paths && artifact.file_paths.length > 0 ? (
            <>
              <img 
                src={artifact.file_paths[currentImageIndex]} 
                alt={artifact.title}
                className={styles.mainImage}
              />
              {artifact.file_paths.length > 1 && (
                <div className={styles.imageNavigation}>
                  <button 
                    onClick={prevImage} 
                    disabled={currentImageIndex === 0}
                    className={styles.navButton}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <span className={styles.imageCounter}>
                    {currentImageIndex + 1} / {artifact.file_paths.length}
                  </span>
                  <button 
                    onClick={nextImage} 
                    disabled={currentImageIndex === artifact.file_paths.length - 1}
                    className={styles.navButton}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noImage}>
              <span>No images available</span>
            </div>
          )}
        </div>

        <div className={styles.metadataSection}>
          <div className={styles.artifactHeader}>
            <h2>{artifact.title}</h2>
            <span className={styles.artifactNumber}>#{artifact.artifact_id}</span>
          </div>

          <div className={styles.artifactDescription}>
            <p>{artifact.description}</p>
          </div>

          <div className={styles.studentInfo}>
            <h3>STUDENT</h3>
            <p>{artifact.student}</p>
          </div>

          <div className={styles.projectInfo}>
            <h3>PROJECT</h3>
            <p>{artifact.projectTitle}</p>
          </div>

          <div className={styles.tagsSection}>
            <div className={styles.tagGroup}>
              <h4>MATERIALS</h4>
              <div className={styles.tags}>
                {artifact.tags.materials?.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    #{tag.replace(/_/g, '')}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.tagGroup}>
              <h4>THEMES</h4>
              <div className={styles.tags}>
                {artifact.tags.themes?.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    #{tag.replace(/_/g, '')}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.tagGroup}>
              <h4>TECHNIQUES</h4>
              <div className={styles.tags}>
                {artifact.tags.techniques?.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    #{tag.replace(/_/g, '')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.metadata}>
            <div className={styles.metadataItem}>
              <strong>Type:</strong> {artifact.type}
            </div>
            <div className={styles.metadataItem}>
              <strong>Created:</strong> {new Date(artifact.creation_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;
