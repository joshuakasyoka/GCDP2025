import React from 'react';
import { Link } from 'react-router-dom';
import Tile from './Tile';
import styles from '../styles/TileGrid.module.css';

const MobileTileGrid = ({ tiles, getActiveCategory, draggedTile, hoveredTile, handleTileHover }) => (
  <div className={`${styles.tilesContainer} ${styles.mobileGrid}`}>
    {tiles.map(tile => (
      <Link
        key={tile.id}
        to={`/archive/artifact/${tile.artifact_id}`}
        style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
      >
        <Tile
          tile={tile}
          isDragging={draggedTile && draggedTile.id === tile.id}
          isHovered={hoveredTile && hoveredTile.id === tile.id}
          onClick={() => {}} // No-op, handled by Link
          onHover={isHovered => handleTileHover(tile.id, isHovered)}
          style={{ position: 'static', width: '100%' }}
          displayTags={getActiveCategory()}
          classNameProp="mobileGridTile"
        />
      </Link>
    ))}
  </div>
);

export default MobileTileGrid; 