import React, { useMemo } from 'react';
import MapView from './MapView';
import { parseCoordinate } from '../utils/artifactCoordinates';
import styles from '../styles/CmsMapPicker.module.css';

const CmsMapPicker = ({ lat, lng, title, onChange }) => {
  const parsedLat = parseCoordinate(lat);
  const parsedLng = parseCoordinate(lng);
  const hasPin = parsedLat !== null && parsedLng !== null;

  const pins = useMemo(() => {
    if (!hasPin) return [];
    return [{
      id: 'draft-pin',
      lat: parsedLat,
      lng: parsedLng,
      title: title || 'New pin',
    }];
  }, [hasPin, parsedLat, parsedLng, title]);

  const handleMapClick = (nextLng, nextLat) => {
    onChange({
      lat: Number(nextLat.toFixed(6)),
      lng: Number(nextLng.toFixed(6)),
    });
  };

  const handleClear = () => {
    onChange({ lat: '', lng: '' });
  };

  return (
    <div className={styles.picker}>
      <p className={styles.hint}>Click the map to place a pin for this artefact.</p>
      <div className={styles.mapFrame}>
        <MapView
          pins={pins}
          interactive
          onMapClick={handleMapClick}
          minHeight={280}
        />
      </div>
      {hasPin && (
        <div className={styles.coordsRow}>
          <span className={styles.coords}>
            {parsedLat.toFixed(5)}, {parsedLng.toFixed(5)}
          </span>
          <button type="button" className={styles.clearButton} onClick={handleClear}>
            Remove pin
          </button>
        </div>
      )}
    </div>
  );
};

export default CmsMapPicker;
