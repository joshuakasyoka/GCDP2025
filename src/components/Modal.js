import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from '../styles/Modal.module.css';

const Modal = ({ onClose, artifact, student }) => {
  const { language } = useLanguage();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.modalHeader}>
          <h2>{artifact.title[language]}</h2>
          <div className={styles.studentInfo}>
            <h3>{student.name[language].display_name}</h3>
            <p className={styles.about}>{student.about[language]}</p>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.imageContainer}>
            {artifact.file_paths && artifact.file_paths[0] ? (
              <img src={artifact.file_paths[0]} alt={artifact.title[language]} />
            ) : (
              <div className={styles.placeholder}>
                <span>{artifact.type}</span>
              </div>
            )}
          </div>
          
          <div className={styles.artifactInfo}>
            <p className={styles.description}>{artifact.description[language]}</p>
            
            <div className={styles.tags}>
              <div className={styles.tagGroup}>
                <h4>Materials</h4>
                {artifact.tags.materials[language].map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className={styles.tagGroup}>
                <h4>Themes</h4>
                {artifact.tags.themes[language].map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal; 