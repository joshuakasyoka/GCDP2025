import React, { useState, useEffect } from 'react';
import styles from '../styles/IntroAnimation.module.css';

const IntroAnimation = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 1000); // Wait for fade out animation
    }, 3000); // Show intro for 3 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`${styles.introContainer} ${!isVisible ? styles.fadeOut : ''}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>Materials of Soft Activism</h1>
        <h2 className={styles.subtitle}>Global Collaborative Design Practice 2025</h2>
      </div>
    </div>
  );
};

export default IntroAnimation; 