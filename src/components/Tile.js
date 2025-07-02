import React from 'react';
import styles from '../styles/Tile.module.css';

const Tile = ({ tile, isDragging, isHovered, onClick, onHover, style, displayTags, classNameProp }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onClick(tile);
  };

  const handleMouseEnter = () => {
    onHover(true);
  };

  const handleMouseLeave = () => {
    onHover(false);
  };

  // Use fixed square dimensions
  const tileSize = 200; // pixels

  // Responsive style for mobile vs desktop
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

  // Get tags to display based on the active category
  const getDisplayTags = () => {
    console.log('Display tags category:', displayTags);
    console.log('Tile tags:', tile.tags);
    
    if (!displayTags || !tile.tags || !tile.tags[displayTags]) {
      console.log('No tags to display');
      return [];
    }
    
    const tags = tile.tags[displayTags];
    console.log('Tags to display:', tags);
    return tags.slice(0, 2); // Return only the first two tags
  };

  const displayTagsList = getDisplayTags();

  return (
    <div
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
          {tile.file_paths && tile.file_paths[0] ? (
            <img src={tile.file_paths[0]} alt={tile.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className={styles.placeholder}>
              <span>{tile.type}</span>
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
