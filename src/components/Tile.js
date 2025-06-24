import React from 'react';
import styles from '../styles/Tile.module.css';

const Tile = ({ tile, isDragging, isHovered, onClick, onHover, style, displayTags }) => {
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
      className={`${styles.tile} ${isDragging ? styles.dragging : ''} ${isHovered ? styles.hovered : ''}`}
      style={{
        position: 'absolute',
        left: tile.x,
        top: tile.y,
        width: tileSize,
        height: tileSize,
        zIndex: style?.zIndex || 1,
        transition: isDragging ? 'none' : 'z-index 0.2s ease-in-out'
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.tileContent}>
        <div className={styles.tileImage}>
          {tile.file_paths && tile.file_paths[0] ? (
            <img src={tile.file_paths[0]} alt={tile.title} loading="lazy" />
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
