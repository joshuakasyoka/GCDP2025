import React, { useRef, useState, useEffect } from 'react';
import styles from '../styles/Tile.module.css';

const Tile = ({ tile, isDragging, isHovered, onClick, onHover, style, displayTags, classNameProp, priorityMode = false, scrollRoot = null }) => {
  const tileRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = tileRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { root: scrollRoot, rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollRoot]);

  const handleClick = (e) => {
    e.stopPropagation();
    onClick(tile.artifact_id);
  };

  const handleMouseEnter = () => onHover(true);
  const handleMouseLeave = () => onHover(false);

  const tileSize = 200;
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const tileStyle = isMobile
    ? {
        width: '100%',
        height: '100%',
        aspectRatio: '1 / 1',
        position: 'static',
        zIndex: style?.zIndex || 1,
        ...style,
      }
    : {
        position: style?.position ?? 'absolute',
        left: tile.x,
        top: tile.y,
        width: style?.width ?? tileSize,
        height: style?.height ?? tileSize,
        zIndex: style?.zIndex || 1,
        ...style,
      };

  const getDisplayTags = () => {
    if (!displayTags || !tile.tags || !tile.tags[displayTags]) return [];
    return tile.tags[displayTags].slice(0, 2);
  };

  const displayTagsList = getDisplayTags();
  const shouldShowImage = (isVisible || isHovered) && tile.file_paths && tile.file_paths[0];
  const imgStyle = { width: '100%', height: '100%', objectFit: 'cover', filter: priorityMode ? 'none' : undefined };

  return (
    <div
      ref={tileRef}
      className={[
        styles.tile,
        classNameProp ? styles[classNameProp] : '',
        isDragging ? styles.dragging : '',
        isHovered ? styles.hovered : ''
      ].join(' ')}
      style={tileStyle}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.tileContent} style={{ width: '100%', height: '100%' }}>
        <div className={styles.tileImage} style={{ width: '100%', height: '100%' }}>
          {shouldShowImage ? (
            <img
              src={tile.file_paths[0]}
              alt={tile.title}
              loading="lazy"
              decoding="async"
              style={imgStyle}
            />
          ) : (
            <div className={styles.placeholder}>
              <span>{tile.artifact_id}</span>
            </div>
          )}
        </div>
        <div className={styles.tileInfo}>
          <h3 className={styles.tileTitle}>{tile.title}</h3>
          <div className={styles.tileTags}>
            {displayTagsList.map((tag, index) => (
              <span key={index} className={styles.tag}>
                #{tag.replace(/_/g, '')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tile;
