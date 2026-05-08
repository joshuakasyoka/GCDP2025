import React from 'react';
import styles from '../styles/ArtifactGrid.module.css';

const ArtifactGrid = ({ artifacts, onArtifactClick }) => {
  return (
    <div className={styles.artifactGrid}>
      {artifacts.map(artifact => (
        <div
          key={artifact.artifact_id}
          className={styles.artifactItem}
          onClick={() => onArtifactClick(artifact)}
        >
          <div className={styles.artifactThumbnail}>
            {artifact.file_paths && artifact.file_paths[0] ? (
              <img src={artifact.file_paths[0]} alt={artifact.title} loading="lazy" decoding="async" />
            ) : (
              <div className={styles.placeholder}>
                <span>{artifact.type}</span>
              </div>
            )}
          </div>
          <div className={styles.artifactInfo}>
            <h4>{artifact.title}</h4>
            <div className={styles.artifactTags}>
              {artifact.tags.materials?.slice(0, 2).map((tag, index) => (
                <span key={index} className={styles.tag}>
                  #{tag.replace(/_/g, '')}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArtifactGrid;
