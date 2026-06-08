const ANCHORS = {
  london: { lng: -0.1749, lat: 51.4988, spread: 0.09 },
  kyoto: { lng: 135.7681, lat: 35.0116, spread: 0.07 },
  tokyo: { lng: 139.6917, lat: 35.6895, spread: 0.08 },
};

const hashString = (value = '') => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getSearchText = (artifact) => {
  const title = typeof artifact.title === 'string'
    ? artifact.title
    : Object.values(artifact.title || {}).join(' ');
  const description = typeof artifact.description === 'string'
    ? artifact.description
    : Object.values(artifact.description || {}).join(' ');
  const projectTitle = typeof artifact.projectTitle === 'string'
    ? artifact.projectTitle
    : Object.values(artifact.projectTitle || {}).join(' ');

  return `${title} ${description} ${projectTitle} ${artifact.student || ''}`.toLowerCase();
};

const getAnchor = (artifact) => {
  const text = getSearchText(artifact);
  if (text.includes('kyoto')) return ANCHORS.kyoto;
  if (text.includes('tokyo')) return ANCHORS.tokyo;
  if (text.includes('japan') && !text.includes('london')) return ANCHORS.kyoto;
  return ANCHORS.london;
};

export const parseCoordinate = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export const hasCustomCoordinates = (artifact) => {
  const lat = parseCoordinate(artifact.lat);
  const lng = parseCoordinate(artifact.lng);
  return (
    lat !== null
    && lng !== null
    && lat >= -90
    && lat <= 90
    && lng >= -180
    && lng <= 180
  );
};

export const getArtifactCoordinates = (artifact) => {
  const lat = parseCoordinate(artifact.lat);
  const lng = parseCoordinate(artifact.lng);

  if (hasCustomCoordinates(artifact)) {
    return { lng, lat, region: 'custom' };
  }

  const anchor = getAnchor(artifact);
  const seed = hashString(artifact.artifact_id || artifact.id || '');
  const angle = ((seed % 360) * Math.PI) / 180;
  const distance = ((seed % 100) / 100) * anchor.spread;

  return {
    lng: anchor.lng + Math.cos(angle) * distance,
    lat: anchor.lat + Math.sin(angle) * distance * 0.72,
    region: anchor === ANCHORS.kyoto || anchor === ANCHORS.tokyo ? 'japan' : 'london',
  };
};

export const getMapBounds = (artifacts) => {
  if (!artifacts.length) return null;

  const coordinates = artifacts.map(getArtifactCoordinates);
  const lngs = coordinates.map(point => point.lng);
  const lats = coordinates.map(point => point.lat);

  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
};
