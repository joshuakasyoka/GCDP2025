import React from 'react';
import Tile from './Tile';
import styles from '../styles/TileGrid.module.css';

const MobileTileGrid = ({ tiles, onTileClick, getActiveCategory, draggedTile, hoveredTile, handleTileHover }) => (
  <div className={`${styles.tilesContainer} ${styles.mobileGrid}`}>
    {tiles.map(tile => (
      <Tile
        key={tile.id}
        tile={tile}
        isDragging={draggedTile && draggedTile.id === tile.id}
        isHovered={hoveredTile && hoveredTile.id === tile.id}
        onClick={onTileClick}
        onHover={isHovered => handleTileHover(tile.id, isHovered)}
        style={{ position: 'static', width: '100%' }}
        displayTags={getActiveCategory()}
        classNameProp="mobileGridTile"
      />
    ))}
  </div>
);

export default MobileTileGrid; 