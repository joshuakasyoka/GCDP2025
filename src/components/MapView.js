import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapPinCard from './MapPinCard';
import styles from '../styles/MapView.module.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const DEFAULT_CENTER = [-0.08067, 51.47404];
const DEFAULT_ZOOM = 13;

const createPinElement = (mapStyles, { interactive = false, onEnter, onLeave, onClick } = {}) => {
  const pinEl = document.createElement('button');
  pinEl.type = 'button';
  pinEl.className = `${mapStyles.locationPin} ${interactive ? mapStyles.locationPinInteractive : ''}`;
  const dot = document.createElement('span');
  dot.className = mapStyles.locationPinDot;
  dot.setAttribute('aria-hidden', 'true');
  pinEl.appendChild(dot);

  if (onEnter) pinEl.addEventListener('mouseenter', onEnter);
  if (onLeave) pinEl.addEventListener('mouseleave', onLeave);
  if (onClick) pinEl.addEventListener('click', onClick);

  return pinEl;
};

const MapView = ({
  pins = [],
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  interactive = false,
  onMapClick,
  onPinClick,
  className = '',
  minHeight = 480,
  showControls = true,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const handlersRef = useRef([]);
  const [hoveredPin, setHoveredPin] = useState(null);

  const clearMarkers = useCallback(() => {
    handlersRef.current.forEach(({ pinEl, enter, leave, click }) => {
      pinEl.removeEventListener('mouseenter', enter);
      pinEl.removeEventListener('mouseleave', leave);
      if (click) pinEl.removeEventListener('click', click);
    });
    handlersRef.current = [];
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];
  }, []);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center,
      zoom,
      attributionControl: false,
    });

    if (showControls) {
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    }

    mapRef.current = map;

    const resize = () => {
      if (mapRef.current) mapRef.current.resize();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mapContainerRef.current);
    window.addEventListener('resize', resize);
    map.on('load', resize);

    return () => {
      clearMarkers();
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !MAPBOX_TOKEN) return;

    const handleMapClick = (event) => {
      if (!interactive || !onMapClick) return;
      onMapClick(event.lngLat.lng, event.lngLat.lat);
    };

    const setup = () => {
      const canvas = map.getCanvas();
      if (interactive && onMapClick) {
        canvas.style.cursor = 'crosshair';
        map.on('click', handleMapClick);
      } else {
        canvas.style.cursor = '';
      }
    };

    if (map.isStyleLoaded()) {
      setup();
    } else {
      map.once('load', setup);
    }

    return () => {
      map.off('click', handleMapClick);
      if (map.getCanvas()) {
        map.getCanvas().style.cursor = '';
      }
    };
  }, [interactive, onMapClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !MAPBOX_TOKEN) return;

    const renderPins = () => {
      clearMarkers();

      pins.forEach((pin) => {
        const title = typeof pin.title === 'string' ? pin.title : pin.title?.en || 'Map pin';
        const enter = () => setHoveredPin(pin);
        const leave = () => setHoveredPin((current) => (current?.id === pin.id ? null : current));
        const click = (event) => {
          event.stopPropagation();
          onPinClick?.(pin);
        };

        const pinEl = createPinElement(styles, {
          interactive: Boolean(onPinClick),
          onEnter: enter,
          onLeave: leave,
          onClick: onPinClick ? click : undefined,
        });
        pinEl.setAttribute('aria-label', title);

        const marker = new mapboxgl.Marker({ element: pinEl, anchor: 'center' })
          .setLngLat([pin.lng, pin.lat])
          .addTo(map);

        markersRef.current.push({ marker, pinId: pin.id });
        handlersRef.current.push({ pinEl, enter, leave, click: onPinClick ? click : undefined });
      });
    };

    if (map.isStyleLoaded()) {
      renderPins();
    } else {
      map.once('load', renderPins);
    }
  }, [pins, onPinClick, clearMarkers]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`${styles.mapWrap} ${className}`} style={{ minHeight }}>
        <div className={styles.fallback}>
          <p>
            Add <code>REACT_APP_MAPBOX_TOKEN</code> to your <code>.env</code> and restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.mapWrap} ${className}`} style={{ minHeight }}>
      <div ref={mapContainerRef} className={styles.mapContainer} />
      <MapPinCard pin={hoveredPin} />
    </div>
  );
};

export default MapView;
