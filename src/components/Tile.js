import React from 'react';
import styles from '../styles/Tile.module.css';

const Tile = ({ tile, isDragging, isHovered, onClick, onHover, style }) => {
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
            <img src={tile.file_paths[0]} alt={tile.title} />
          ) : (
            <div className={styles.placeholder}>
              <span>{tile.type}</span>
            </div>
          )}
        </div>
        <div className={styles.tileInfo}>
          <h3 className={styles.tileTitle}>{tile.title}</h3>
          <div className={styles.tileTags}>
            {tile.tags.materials && tile.tags.materials.slice(0, 2).map((tag, index) => (
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
