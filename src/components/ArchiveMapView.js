import React, { useMemo, useCallback } from 'react';
import MapView from './MapView';
import { useArchiveData } from '../contexts/ArchiveDataContext';
import { hasCustomCoordinates, parseCoordinate } from '../utils/artifactCoordinates';

const VENUE_PIN = {
  id: 'venue',
  lat: 51.47404,
  lng: -0.08067,
  title: '45-65 Peckham Road, London SE5 8UF',
  isVenue: true,
};

const ArchiveMapView = ({ artifacts = [], onArtifactClick }) => {
  const { data } = useArchiveData();

  const pins = useMemo(() => {
    const mapPins = data.map_pins || [];
    const standalonePins = mapPins
      .filter((pin) => Number.isFinite(pin.lat) && Number.isFinite(pin.lng))
      .map((pin) => ({
        id: pin.pin_id,
        lat: pin.lat,
        lng: pin.lng,
        title: pin.title,
        description: pin.description,
        file_paths: pin.file_paths,
        isMapPin: true,
      }));

    const artifactPins = artifacts
      .filter(hasCustomCoordinates)
      .map((artifact) => ({
        id: artifact.artifact_id || artifact.id,
        lat: parseCoordinate(artifact.lat),
        lng: parseCoordinate(artifact.lng),
        title: artifact.title,
        description: artifact.description,
        student: artifact.student,
        projectTitle: artifact.projectTitle,
        file_paths: artifact.file_paths,
      }));

    return [VENUE_PIN, ...standalonePins, ...artifactPins];
  }, [artifacts, data.map_pins]);

  const handlePinClick = useCallback((pin) => {
    if (pin.isVenue || pin.isMapPin || !onArtifactClick) return;
    onArtifactClick(pin.id);
  }, [onArtifactClick]);

  return (
    <MapView
      pins={pins}
      onPinClick={onArtifactClick ? handlePinClick : undefined}
    />
  );
};

export default ArchiveMapView;
