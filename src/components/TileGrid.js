import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ReactP5Wrapper } from 'react-p5-wrapper';
import Tile from './Tile';
import styles from '../styles/TileGrid.module.css';

const TileGrid = ({ artifacts, onTileClick, sortBy, onSortChange }) => {
  const [tiles, setTiles] = useState([]);
  const [draggedTile, setDraggedTile] = useState(null);
  const [hoveredTile, setHoveredTile] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'random', or 'cluster'
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState(null);
  const [dragStartPosition, setDragStartPosition] = useState(null);
  const containerRef = useRef(null);
  const tileSize = 200;
  const vectorTileSize = 60; // Size of squares in vector view
  const gridGap = 20;
  const canvasPadding = 40;
  const overlapOffset = 20;
  const clusterRadius = 300; // Maximum distance from cluster center
  const DRAG_THRESHOLD = 5; // Minimum pixels to move before considering it a drag
  const CLICK_THRESHOLD = 200; // Maximum milliseconds to consider it a click

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
        } else if (viewMode === 'random') {
          const baseX = canvasPadding;
          const baseY = canvasPadding;
          x = baseX + (index * overlapOffset);
          y = baseY + (index * overlapOffset);
        } else if (viewMode === 'cluster') {
          // Create random clusters
          const numClusters = Math.ceil(artifacts.length / 5); // 5 items per cluster
          const clusterIndex = Math.floor(index / 5);
          const clusterX = canvasPadding + (Math.random() * (availableWidth - tileSize));
          const clusterY = canvasPadding + (Math.random() * (availableHeight - tileSize));
          
          // Add some randomness within the cluster
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * clusterRadius;
          x = clusterX + (Math.cos(angle) * distance);
          y = clusterY + (Math.sin(angle) * distance);
        } else if (viewMode === 'vector') {
          const tilesPerRow = 8;
          const row = Math.floor(index / tilesPerRow);
          const col = index % tilesPerRow;
          x = canvasPadding + (col * (vectorTileSize + gridGap));
          y = canvasPadding + (row * (vectorTileSize + gridGap));
        }

        return {
          ...artifact,
          id: artifact.artifact_id,
          x: x,
          y: y,
          w: viewMode === 'vector' ? vectorTileSize : tileSize,
          h: viewMode === 'vector' ? vectorTileSize : tileSize,
          targetX: x,
          targetY: y,
          zIndex: index
        };
      });

      setTiles(newTiles);
    }
  }, [artifacts, viewMode, tileSize, vectorTileSize, gridGap, canvasPadding, overlapOffset, clusterRadius]);

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
      } else if (viewMode === 'random') {
        // Draw diagonal grid lines for list view
        p5.stroke(240);
        p5.strokeWeight(0.5);
        
        const maxLines = Math.max(
          Math.ceil((p5.width - canvasPadding) / overlapOffset),
          Math.ceil((p5.height - canvasPadding) / overlapOffset)
        );

        for (let i = 0; i < maxLines; i++) {
          const x = canvasPadding + (i * overlapOffset);
          const y = canvasPadding + (i * overlapOffset);
          
          p5.line(x, 0, x, p5.height);
          p5.line(0, y, p5.width, y);
          p5.line(x, 0, 0, y);
          p5.line(x, p5.height, p5.width, y);
        }
      } else if (viewMode === 'cluster') {
        // Draw cluster visualization
        p5.stroke(240);
        p5.strokeWeight(0.5);
        p5.noFill();
        
        const numClusters = Math.ceil(artifacts.length / 5);
        for (let i = 0; i < numClusters; i++) {
          const clusterX = canvasPadding + (Math.random() * (p5.width - canvasPadding * 2));
          const clusterY = canvasPadding + (Math.random() * (p5.height - canvasPadding * 2));
          p5.circle(clusterX, clusterY, clusterRadius * 2);
        }
      } else if (viewMode === 'vector') {
        p5.stroke(240);
        p5.strokeWeight(0.5);
        p5.noFill();
        
        // Draw grid lines for vector view
        const tilesPerRow = 8;
        const numRows = Math.ceil(artifacts.length / tilesPerRow);
        
        for (let i = 0; i <= numRows; i++) {
          const y = canvasPadding + (i * (vectorTileSize + gridGap));
          p5.line(0, y, p5.width, y);
        }
        
        for (let i = 0; i <= tilesPerRow; i++) {
          const x = canvasPadding + (i * (vectorTileSize + gridGap));
          p5.line(x, 0, x, p5.height);
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
  }, [viewMode, tileSize, vectorTileSize, gridGap, canvasPadding, overlapOffset, clusterRadius, artifacts.length]);

  const handleMouseMove = useCallback(e => {
    if (!containerRef.current || !draggedTile || !dragStartPosition) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate distance moved
    const dx = mouseX - dragStartPosition.x;
    const dy = mouseY - dragStartPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only set dragging state if we've moved past the threshold
    if (!isDragging && distance > DRAG_THRESHOLD) {
      setIsDragging(true);
    }

    if (isDragging) {
      setTiles(prevTiles => 
        prevTiles.map(tile => 
          tile.id === draggedTile.id 
            ? { 
                ...tile, 
                x: mouseX - draggedTile.offsetX, 
                y: mouseY - draggedTile.offsetY,
                zIndex: 1000
              } 
            : tile
        )
      );
    }
  }, [draggedTile, isDragging, dragStartPosition]);

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
        setDragStartTime(Date.now());
        setDragStartPosition({ x: mouseX, y: mouseY });
        break;
      }
    }
  }, [tiles]);

  const handleMouseUp = useCallback(() => {
    if (draggedTile) {
      const dragDuration = Date.now() - dragStartTime;
      
      if (isDragging) {
        // This was a drag operation
        if (viewMode === 'grid') {
          setTiles(prevTiles => 
            prevTiles.map(tile => 
              tile.id === draggedTile.id 
                ? { 
                    ...tile, 
                    x: canvasPadding + Math.round((tile.x - canvasPadding) / (tileSize + gridGap)) * (tileSize + gridGap),
                    y: canvasPadding + Math.round((tile.y - canvasPadding) / (tileSize + gridGap)) * (tileSize + gridGap),
                    zIndex: tile.id
                  } 
                : tile
            )
          );
        } else if (viewMode === 'random') {
          setTiles(prevTiles => {
            const index = prevTiles.findIndex(t => t.id === draggedTile.id);
            return prevTiles.map(tile => 
              tile.id === draggedTile.id 
                ? { 
                    ...tile, 
                    x: canvasPadding + (index * overlapOffset),
                    y: canvasPadding + (index * overlapOffset),
                    zIndex: index
                  } 
                : tile
            );
          });
        } else if (viewMode === 'cluster') {
          setTiles(prevTiles => 
            prevTiles.map(tile => 
              tile.id === draggedTile.id 
                ? { 
                    ...tile, 
                    x: tile.x,
                    y: tile.y,
                    zIndex: 1000
                  } 
                : tile
            )
          );
        } else if (viewMode === 'vector') {
          setTiles(prevTiles => 
            prevTiles.map(tile => 
              tile.id === draggedTile.id 
                ? { 
                    ...tile, 
                    x: tile.x,
                    y: tile.y,
                    zIndex: 1000
                  } 
                : tile
            )
          );
        }
      } else if (dragDuration < CLICK_THRESHOLD) {
        // This was a click operation
        onTileClick(draggedTile);
      }
    }
    
    setDraggedTile(null);
    setIsDragging(false);
    setDragStartTime(null);
    setDragStartPosition(null);
  }, [draggedTile, isDragging, viewMode, tileSize, gridGap, canvasPadding, overlapOffset, dragStartTime, onTileClick]);

  const handleTileClick = useCallback((tile) => {
    // Only trigger click if we're not dragging and it's a quick click
    if (!isDragging && Date.now() - dragStartTime < CLICK_THRESHOLD) {
      onTileClick(tile);
    }
  }, [isDragging, dragStartTime, onTileClick]);

  const handleTileHover = useCallback((tileId, isHovered) => {
    if (isHovered) {
      const tile = tiles.find(t => t.id === tileId);
      if (tile) {
        setHoveredTile(tile);
      }
    } else {
      setHoveredTile(null);
    }
  }, [tiles]);

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
            onClick={() => setViewMode('grid')}
          >
            ⊞
          </button>
          <button 
            className={`${styles.listViewBtn} ${viewMode === 'random' ? styles.active : ''}`}
            onClick={() => setViewMode('random')}
          >
            ☰
          </button>
          <button 
            className={`${styles.clusterViewBtn} ${viewMode === 'cluster' ? styles.active : ''}`}
            onClick={() => setViewMode('cluster')}
          >
            ⊙
          </button>
          <button 
            className={`${styles.vectorViewBtn} ${viewMode === 'vector' ? styles.active : ''}`}
            onClick={() => setViewMode('vector')}
          >
            □
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
              viewMode === 'vector' ? (
                <div
                  key={tile.id}
                  className={`${styles.tile} ${styles.vectorTile} ${draggedTile?.id === tile.id ? styles.dragging : ''}`}
                  style={{
                    position: 'absolute',
                    left: tile.x,
                    top: tile.y,
                    width: tile.w,
                    height: tile.h,
                    zIndex: tile.zIndex,
                    cursor: 'move'
                  }}
                  onClick={() => handleTileClick(tile)}
                  onMouseEnter={() => handleTileHover(tile.id, true)}
                  onMouseLeave={() => handleTileHover(tile.id, false)}
                >
                  <span className={styles.vectorTileNumber}>
                    {tiles.findIndex(t => t.id === tile.id) + 1}
                  </span>
                </div>
              ) : (
                <Tile
                  key={tile.id}
                  tile={tile}
                  isDragging={draggedTile && draggedTile.id === tile.id}
                  isHovered={hoveredTile && hoveredTile.id === tile.id}
                  onClick={() => handleTileClick(tile)}
                  onHover={(isHovered) => handleTileHover(tile.id, isHovered)}
                  style={{ zIndex: tile.zIndex }}
                />
              )
            ))}
            {viewMode === 'vector' && hoveredTile && (
              <div 
                className={styles.floatingTile}
                style={{
                  position: 'absolute',
                  left: hoveredTile.x + hoveredTile.w + 10,
                  top: hoveredTile.y - (tileSize / 2),
                  zIndex: 1000
                }}
              >
                <Tile
                  tile={hoveredTile}
                  isHovered={true}
                  onClick={() => handleTileClick(hoveredTile)}
                  onHover={() => {}}
                />
              </div>
            )}
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
