import React from 'react';
import styles from '../styles/MapPinCard.module.css';

const getText = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.en || value.ja || Object.values(value)[0] || '';
};

const MapPinCard = ({ pin }) => {
  if (!pin) return null;

  const title = getText(pin.title);
  const description = getText(pin.description);
  const image = pin.file_paths?.[0];

  return (
    <div className={styles.card}>
      {image && (
        <div className={styles.image}>
          <img src={image} alt="" />
        </div>
      )}
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {pin.student && <p className={styles.meta}>{pin.student}</p>}
        {pin.projectTitle && <p className={styles.meta}>{getText(pin.projectTitle)}</p>}
        {description && <p className={styles.description}>{description}</p>}
        {pin.isVenue && !description && <p className={styles.description}>{title}</p>}
      </div>
    </div>
  );
};

export default MapPinCard;
