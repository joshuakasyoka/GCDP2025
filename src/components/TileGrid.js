import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ReactP5Wrapper } from 'react-p5-wrapper';
import Tile from './Tile';
import styles from '../styles/TileGrid.module.css';
import createFuzzySearch from '@nozbe/microfuzz';

const TileGrid = ({ artifacts, onTileClick, sortBy, onSortChange, searchQuery, onSearchChange }) => {
  const [tiles, setTiles] = useState([]);
  const [draggedTile, setDraggedTile] = useState(null);
  const [hoveredTile, setHoveredTile] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'random', or 'cluster'
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState(null);
  const [dragStartPosition, setDragStartPosition] = useState(null);
  const containerRef = useRef(null);
  const [tilePositions, setTilePositions] = useState({});
  
  // Constants for drag and click detection
  const DRAG_THRESHOLD = 5; // Minimum pixels to move before considering it a drag
  const CLICK_THRESHOLD = 200; // Maximum milliseconds to consider it a click
  
  // Check if device is mobile
  const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  };

  // Initialize fullscreen state based on device
  const [isFullscreen, setIsFullscreen] = useState(isMobileDevice());
  
  // Responsive tile sizes
  const getTileSize = () => {
    if (typeof window === 'undefined') return 200; // Default for SSR
    if (window.innerWidth <= 480) return 140; // Mobile
    if (window.innerWidth <= 768) return 160; // Tablet
    return 200; // Desktop
  };

  const [tileSize, setTileSize] = useState(getTileSize());
  const vectorTileSize = Math.floor(tileSize * 0.3); // Scale vector tiles proportionally
  const gridGap = Math.floor(tileSize * 0.05); // Reduced gap for mobile
  const canvasPadding = Math.floor(tileSize * 0.1); // Reduced padding for mobile
  const overlapOffset = Math.floor(tileSize * 0.1); // Scale offset proportionally
  const clusterRadius = Math.floor(tileSize * 1.2); // Reduced cluster radius for mobile

  // Update tile size and fullscreen state on window resize
  useEffect(() => {
    const handleResize = () => {
      setTileSize(getTileSize());
      // Only auto-fullscreen on mobile devices
      if (isMobileDevice()) {
        setIsFullscreen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;
    const mouseX = e.clientX - rect.left + scrollLeft;
    const mouseY = e.clientY - rect.top + scrollTop;

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
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;
    const mouseX = e.clientX - rect.left + scrollLeft;
    const mouseY = e.clientY - rect.top + scrollTop;

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

  // Add touch event handlers
  const handleTouchStart = useCallback(e => {
    if (!containerRef.current) return;
    
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;
    const touchX = touch.clientX - rect.left + scrollLeft;
    const touchY = touch.clientY - rect.top + scrollTop;

    for (let i = tiles.length - 1; i >= 0; i--) {
      const tile = tiles[i];
      if (
        touchX >= tile.x && 
        touchX <= tile.x + tile.w && 
        touchY >= tile.y && 
        touchY <= tile.y + tile.h
      ) {
        const offsetX = touchX - tile.x;
        const offsetY = touchY - tile.y;
        setDraggedTile({ ...tile, offsetX, offsetY });
        setDragStartTime(Date.now());
        setDragStartPosition({ x: touchX, y: touchY });
        break;
      }
    }
  }, [tiles]);

  const handleTouchMove = useCallback(e => {
    if (!containerRef.current || !draggedTile || !dragStartPosition) return;
    
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;
    const touchX = touch.clientX - rect.left + scrollLeft;
    const touchY = touch.clientY - rect.top + scrollTop;

    // Calculate distance moved
    const dx = touchX - dragStartPosition.x;
    const dy = touchY - dragStartPosition.y;
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
                x: touchX - draggedTile.offsetX, 
                y: touchY - draggedTile.offsetY,
                zIndex: 1000
              } 
            : tile
        )
      );
    }
  }, [draggedTile, isDragging, dragStartPosition]);

  const handleTouchEnd = useCallback(() => {
    if (draggedTile) {
      const dragDuration = Date.now() - dragStartTime;
      
      if (isDragging) {
        // Handle drag end similar to mouse up
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
        }
      } else if (dragDuration < CLICK_THRESHOLD) {
        // This was a tap operation
        onTileClick(draggedTile);
      }
    }
    
    setDraggedTile(null);
    setIsDragging(false);
    setDragStartTime(null);
    setDragStartPosition(null);
  }, [draggedTile, isDragging, viewMode, tileSize, gridGap, canvasPadding, overlapOffset, dragStartTime, onTileClick]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Mouse events
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseup', handleMouseUp);
    
    // Touch events
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      // Mouse events
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);
      
      // Touch events
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Prepare a flat list of searchable fields for each tile
  const getSearchText = (tile) => [
    tile.title,
    tile.student,
    ...(tile.tags?.themes || []),
    ...(tile.tags?.design_as || []),
    ...(tile.tags?.materials || []),
    ...(tile.tags?.methods || []),
    ...(tile.tags?.collaborators || [])
  ].filter(Boolean);

  // Memoize the fuzzy search instance
  const fuzzySearch = React.useMemo(() =>
    createFuzzySearch(tiles, {
      getText: getSearchText
    }),
    [tiles]
  );

  // Debug logs
  console.log('Tiles:', tiles);
  if (tiles.length > 0) {
    console.log('getSearchText for first tile:', getSearchText(tiles[0]));
  }
  console.log('Search query:', searchQuery);
  if (searchQuery && !['materials', 'methods', 'themes', 'design_as', 'collaborators'].includes(searchQuery.toLowerCase())) {
    console.log('Fuzzy search result:', fuzzySearch(searchQuery));
  }

  // Filter tiles based on search query using microfuzz
  const filteredTiles = React.useMemo(() => {
    if (!searchQuery) return tiles;
    // Category search: show all tiles with tags in that category
    const query = searchQuery.toLowerCase();
    const isCategorySearch = ['materials', 'methods', 'themes', 'design_as', 'collaborators'].includes(query);
    if (isCategorySearch) {
      return tiles.filter(tile =>
        (query === 'materials' && tile.tags.materials && tile.tags.materials.length > 0) ||
        (query === 'methods' && tile.tags.methods && tile.tags.methods.length > 0) ||
        (query === 'themes' && tile.tags.themes && tile.tags.themes.length > 0) ||
        (query === 'design_as' && tile.tags.design_as && tile.tags.design_as.length > 0) ||
        (query === 'collaborators' && tile.tags.collaborators && tile.tags.collaborators.length > 0)
      );
    }
    // Fuzzy search for everything else
    return fuzzySearch(searchQuery).map(result => result.item);
  }, [tiles, searchQuery, fuzzySearch]);

  // Get the active category for tag display
  const getActiveCategory = () => {
    if (!searchQuery) return 'materials'; // Default to materials if no search
    const query = searchQuery.toLowerCase().trim();
    
    // Check if the search query exactly matches a category
    if (query === 'materials') return 'materials';
    if (query === 'methods') return 'methods';
    if (query === 'themes') return 'themes';
    if (query === 'design_as') return 'design_as';
    if (query === 'collaborators') return 'collaborators';
    
    // If the search query contains a category name, use that category
    if (query.includes('materials')) return 'materials';
    if (query.includes('methods')) return 'methods';
    if (query.includes('themes')) return 'themes';
    if (query.includes('design_as')) return 'design_as';
    if (query.includes('collaborators')) return 'collaborators';
    
    return 'materials'; // Default to materials if no category match
  };

  // Debug log to check what's being passed to Tile
  console.log('Search query:', searchQuery);
  console.log('Active category:', getActiveCategory());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create canvas element if it doesn't exist
    let canvas = container.querySelector('canvas');
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }, [filteredTiles]);

  const handleTileMount = (id, element) => {
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    setTilePositions(prev => ({
      ...prev,
      [id]: {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height
      }
    }));
  };

  return (
    <div className={`${styles.tileGrid} ${isFullscreen ? styles.fullscreen : ''}`}>
      <div className={styles.controls}>
        <div className={styles.sortControls}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search artifacts, students, materials, techniques, themes, categories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={styles.searchInput}
            />
          </div>
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
          {/*
          <button 
            className={`${styles.listViewBtn} ${viewMode === 'random' ? styles.active : ''}`}
            onClick={() => setViewMode('random')}
          >
            ☰
          </button>
          */}
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
          <button 
            className={`${styles.fullscreenBtn} ${isFullscreen ? styles.active : ''}`}
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? '⤢' : '⤢'}
          </button>
        </div>
      </div>
      
      <div className={styles.canvasContainer}>
        <div 
          ref={containerRef} 
          className={styles.tilesContainer}
        >
          {filteredTiles.length > 0 ? (
            <>
              {filteredTiles.map(tile => (
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
                    displayTags={getActiveCategory()}
                  />
                )
              ))}
              {viewMode === 'vector' && hoveredTile && (
                <div 
                  className={styles.floatingTile}
                  style={{
                    position: 'absolute',
                    left: hoveredTile.w + 15,
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
    </div>
  );
};

export default TileGrid;
