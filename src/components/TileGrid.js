import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ReactP5Wrapper } from 'react-p5-wrapper';
import Tile from './Tile';
import styles from '../styles/TileGrid.module.css';

const TileGrid = ({ artifacts, onTileClick, sortBy, onSortChange }) => {
  const [tiles, setTiles] = useState([]);
  const [draggedTile, setDraggedTile] = useState(null);
  const [hoveredTile, setHoveredTile] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'random'
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const tileSize = 200;
  const gridGap = 20;
  const canvasPadding = 40;
  const randomGridSize = 50; // Tighter grid for random view

  // Initialize tiles when artifacts change
  useEffect(() => {
    if (containerRef.current && artifacts.length > 0) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const availableWidth = containerWidth - (canvasPadding * 2);
      const availableHeight = containerHeight - (canvasPadding * 2);
      
      const newTiles = artifacts.map((artifact, index) => {
        let x, y;
        
        if (viewMode === 'grid') {
          const tilesPerRow = Math.floor((availableWidth + gridGap) / (tileSize + gridGap));
          const row = Math.floor(index / tilesPerRow);
          const col = index % tilesPerRow;
          x = canvasPadding + (col * (tileSize + gridGap));
          y = canvasPadding + (row * (tileSize + gridGap));
        } else {
          // Random view with tighter grid
          const maxGridX = Math.floor((availableWidth - tileSize) / randomGridSize);
          const maxGridY = Math.floor((availableHeight - tileSize) / randomGridSize);
          const gridX = Math.floor(Math.random() * maxGridX);
          const gridY = Math.floor(Math.random() * maxGridY);
          x = canvasPadding + (gridX * randomGridSize);
          y = canvasPadding + (gridY * randomGridSize);
        }

        return {
          ...artifact,
          id: artifact.artifact_id,
          x: x,
          y: y,
          w: tileSize,
          h: tileSize,
          targetX: x,
          targetY: y
        };
      });

      setTiles(newTiles);
    }
  }, [artifacts, viewMode, tileSize, gridGap, canvasPadding, randomGridSize]);

  const sketch = useCallback(p5 => {
    p5.setup = () => {
      const canvas = p5.createCanvas(
        containerRef.current?.clientWidth || 800,
        containerRef.current?.clientHeight || 600
      );
      canvas.parent(containerRef.current);
    };

    p5.draw = () => {
      p5.background(255);
      
      if (viewMode === 'grid') {
        // Draw grid lines for grid view
        p5.stroke(240);
        p5.strokeWeight(0.5);
        for (let x = canvasPadding; x < p5.width; x += tileSize + gridGap) {
          p5.line(x, 0, x, p5.height);
        }
        for (let y = canvasPadding; y < p5.height; y += tileSize + gridGap) {
          p5.line(0, y, p5.width, y);
        }
      } else {
        // Draw tighter grid lines for random view
        p5.stroke(240);
        p5.strokeWeight(0.5);
        for (let x = canvasPadding; x < p5.width; x += randomGridSize) {
          p5.line(x, 0, x, p5.height);
        }
        for (let y = canvasPadding; y < p5.height; y += randomGridSize) {
          p5.line(0, y, p5.width, y);
        }
      }
    };

    p5.windowResized = () => {
      if (containerRef.current) {
        p5.resizeCanvas(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };
  }, [viewMode, tileSize, gridGap, canvasPadding, randomGridSize]);

  const handleMouseMove = useCallback(e => {
    if (!containerRef.current || !draggedTile) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Set dragging state to true when mouse moves
    if (!isDragging) {
      setIsDragging(true);
    }

    setTiles(prevTiles => 
      prevTiles.map(tile => 
        tile.id === draggedTile.id 
          ? { 
              ...tile, 
              x: mouseX - draggedTile.offsetX, 
              y: mouseY - draggedTile.offsetY
            } 
          : tile
      )
    );
  }, [draggedTile, isDragging]);

  const handleMouseDown = useCallback(e => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let i = tiles.length - 1; i >= 0; i--) {
      const tile = tiles[i];
      if (
        mouseX >= tile.x && 
        mouseX <= tile.x + tile.w && 
        mouseY >= tile.y && 
        mouseY <= tile.y + tile.h
      ) {
        const offsetX = mouseX - tile.x;
        const offsetY = mouseY - tile.y;
        setDraggedTile({ ...tile, offsetX, offsetY });
        break;
      }
    }
  }, [tiles]);

  const handleMouseUp = useCallback(() => {
    if (draggedTile) {
      if (viewMode === 'grid') {
        // Snap to grid in grid view
        setTiles(prevTiles => 
          prevTiles.map(tile => 
            tile.id === draggedTile.id 
              ? { 
                  ...tile, 
                  x: canvasPadding + Math.round((tile.x - canvasPadding) / (tileSize + gridGap)) * (tileSize + gridGap),
                  y: canvasPadding + Math.round((tile.y - canvasPadding) / (tileSize + gridGap)) * (tileSize + gridGap)
                } 
              : tile
          )
        );
      } else {
        // Snap to tighter grid in random view
        setTiles(prevTiles => 
          prevTiles.map(tile => 
            tile.id === draggedTile.id 
              ? { 
                  ...tile, 
                  x: canvasPadding + Math.round((tile.x - canvasPadding) / randomGridSize) * randomGridSize,
                  y: canvasPadding + Math.round((tile.y - canvasPadding) / randomGridSize) * randomGridSize
                } 
              : tile
          )
        );
      }
    }
    setDraggedTile(null);
    setIsDragging(false);
  }, [draggedTile, viewMode, tileSize, gridGap, canvasPadding, randomGridSize]);

  const handleTileClick = useCallback((tile) => {
    // Only trigger click if we're not dragging
    if (!isDragging) {
      onTileClick(tile);
    }
  }, [isDragging, onTileClick]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prevMode => prevMode === 'grid' ? 'random' : 'grid');
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp]);

  return (
    <div className={styles.tileGrid}>
      <div className={styles.controls}>
        <div className={styles.sortControls}>
          <span>SORT BY</span>
          <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            <option value="date">DATE ADDED</option>
            <option value="alphabetical">ALPHABETICAL</option>
            <option value="student">STUDENT</option>
            <option value="material">MATERIALS</option>
          </select>
        </div>
        <div className={styles.viewControls}>
          <button 
            className={`${styles.gridViewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={toggleViewMode}
          >
            ⊞
          </button>
          <button 
            className={`${styles.listViewBtn} ${viewMode === 'random' ? styles.active : ''}`}
            onClick={toggleViewMode}
          >
            ☰
          </button>
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className={styles.canvasContainer}
      >
        {artifacts.length > 0 ? (
          <>
            <ReactP5Wrapper sketch={sketch} />
            {tiles.map(tile => (
              <Tile
                key={tile.id}
                tile={tile}
                isDragging={draggedTile && draggedTile.id === tile.id}
                isHovered={hoveredTile && hoveredTile.id === tile.id}
                onClick={() => handleTileClick(tile)}
              />
            ))}
          </>
        ) : (
          <div className={styles.noData}>
            <p>Enter a search term to view artifacts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TileGrid;
