import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ReactP5Wrapper } from 'react-p5-wrapper';
import Tile from './Tile';
import styles from '../styles/TileGrid.module.css';
import createFuzzySearch from '@nozbe/microfuzz';
import MobileTileGrid from './MobileTileGrid';

// MobileHeader component for mobile view
const MobileHeader = ({ searchQuery, onSearchChange, viewMode, setViewMode, isFullscreen, setIsFullscreen, styles, priorityOnly, setPriorityOnly }) => (
  <div className={styles.mobileHeader}>
    <input
      type="text"
      placeholder="Search..."
      value={searchQuery}
      onChange={e => onSearchChange(e.target.value)}
      className={styles.mobileSearchInput}
    />
    <div className={styles.mobileIcons}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, marginRight: 4 }}>
        <span style={{ position: 'relative', display: 'inline-block', width: 24, height: 14 }}>
          <input
            type="checkbox"
            checked={priorityOnly}
            onChange={() => setPriorityOnly(v => !v)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: priorityOnly ? 'var(--highlight-color)' : '#ccc',
            borderRadius: 14,
            transition: '.2s',
            width: 24,
            height: 14,
            display: 'block'
          }}></span>
          <span style={{
            position: 'absolute',
            content: '""',
            height: 10,
            width: 10,
            left: priorityOnly ? 12 : 2,
            bottom: 2,
            background: 'white',
            borderRadius: '50%',
            transition: '.2s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            display: 'block'
          }}></span>
        </span>
      </label>
      <button
        className={`${styles.gridViewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
        onClick={() => setViewMode('grid')}
        aria-label="Grid view"
      >
        ⊞
      </button>
      {/* Hide cluster view on mobile */}
      {/* <button
        className={`${styles.clusterViewBtn} ${viewMode === 'cluster' ? styles.active : ''}`}
        onClick={() => setViewMode('cluster')}
        aria-label="Cluster view"
      >
        ⊙
      </button> */}
      <button
        className={`${styles.vectorViewBtn} ${viewMode === 'vector' ? styles.active : ''}`}
        onClick={() => setViewMode('vector')}
        aria-label="Vector view"
      >
        □
      </button>
      <button
        className={`${styles.fullscreenBtn} ${isFullscreen ? styles.active : ''}`}
        onClick={() => setIsFullscreen(!isFullscreen)}
        aria-label="Fullscreen"
      >
        {isFullscreen ? '⤢' : '⤢'}
      </button>
    </div>
  </div>
);

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
  const [priorityOnly, setPriorityOnly] = useState(true);
  
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
  // Set default view mode to 'vector' on mobile
  useEffect(() => {
    if (isMobileDevice()) {
      setViewMode('vector');
    }
  }, []);
  
  // Responsive tile sizes
  const getTileSize = () => {
    if (typeof window === 'undefined') return 200; // Default for SSR
    if (window.innerWidth <= 480) return 90; // Smaller Mobile
    if (window.innerWidth <= 768) return 130; // Smaller Tablet
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

      // --- FILTER ARTIFACTS FOR GRID LAYOUT IF NEEDED ---
      let layoutArtifacts = artifacts;
      // If grid view and priorityOnly, only layout priority artifacts
      if (viewMode === 'grid' && priorityOnly) {
        layoutArtifacts = artifacts.filter(a => a.priority === true);
      }
      // If grid view and not priorityOnly, sort so priority first
      else if (viewMode === 'grid') {
        layoutArtifacts = [...artifacts].sort((a, b) => {
          if (a.priority === b.priority) return 0;
          return a.priority ? -1 : 1;
        });
      }

      const newTiles = layoutArtifacts.map((artifact, index) => {
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
          // Randomly distribute circles within the visible area (no overlap, all in bounds)
          const circleRadius = 16; // 32px diameter
          const margin = 8;
          const maxAttempts = 100;
          // Keep a list of placed positions to avoid overlap
          if (!window._vectorPositions || window._vectorPositions.length !== artifacts.length) {
            window._vectorPositions = [];
            for (let i = 0; i < artifacts.length; i++) {
              let placed = false;
              let attempts = 0;
              while (!placed && attempts < maxAttempts) {
                const x = canvasPadding + circleRadius + Math.random() * (availableWidth - 2 * circleRadius);
                const y = canvasPadding + circleRadius + Math.random() * (availableHeight - 2 * circleRadius);
                // Check for overlap
                const overlap = window._vectorPositions.some(pos => {
                  const dx = pos.x - x;
                  const dy = pos.y - y;
                  return Math.sqrt(dx * dx + dy * dy) < 2 * circleRadius + margin;
                });
                if (!overlap) {
                  window._vectorPositions.push({ x, y });
                  placed = true;
                }
                attempts++;
              }
              if (!placed) {
                // fallback: just place it
                window._vectorPositions.push({
                  x: canvasPadding + circleRadius + Math.random() * (availableWidth - 2 * circleRadius),
                  y: canvasPadding + circleRadius + Math.random() * (availableHeight - 2 * circleRadius)
                });
              }
            }
          }
          x = window._vectorPositions[index].x;
          y = window._vectorPositions[index].y;
        }

        return {
          ...artifact,
          id: artifact.artifact_id,
          x: x,
          y: y,
          w: viewMode === 'vector' ? 32 : tileSize,
          h: viewMode === 'vector' ? 32 : tileSize,
          targetX: x,
          targetY: y,
          zIndex: index
        };
      });

      setTiles(newTiles);
    }
  }, [artifacts, viewMode, tileSize, vectorTileSize, gridGap, canvasPadding, overlapOffset, clusterRadius, priorityOnly]);

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
        p5.background(255); // Clear canvas to white
        // Draw grid background for vector view
        p5.stroke(220); // Slightly darker for visibility
        p5.strokeWeight(0.7);
        const gridSpacing = 40;
        for (let x = 0; x < p5.width; x += gridSpacing) {
          p5.line(x, 0, x, p5.height);
        }
        for (let y = 0; y < p5.height; y += gridSpacing) {
          p5.line(0, y, p5.width, y);
        }
        // Draw lines connecting circles
        p5.stroke('#FF9900');
        p5.strokeWeight(2.5);
        for (let i = 0; i < tiles.length - 1; i++) {
          p5.line(tiles[i].x + 16, tiles[i].y + 16, tiles[i + 1].x + 16, tiles[i + 1].y + 16);
        }
        // Draw circles with highlight color
        for (let i = 0; i < tiles.length; i++) {
          p5.noStroke();
          p5.fill(getComputedStyle(document.documentElement).getPropertyValue('--highlight-color') || '#FF9900');
          p5.circle(tiles[i].x + 16, tiles[i].y + 16, 32);
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
        onTileClick(draggedTile.id);
      }
    }
    
    setDraggedTile(null);
    setIsDragging(false);
    setDragStartTime(null);
    setDragStartPosition(null);
  }, [draggedTile, isDragging, viewMode, tileSize, gridGap, canvasPadding, overlapOffset, dragStartTime, onTileClick]);

  const handleTileClick = (artifact_id) => {
    onTileClick(artifact_id);
  };

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
        onTileClick(draggedTile.id);
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
    let result;
    if (!searchQuery) {
      result = tiles;
    } else {
      // Category search: show all tiles with tags in that category
      const query = searchQuery.toLowerCase();
      const isCategorySearch = ['materials', 'methods', 'themes', 'design_as', 'collaborators'].includes(query);
      if (isCategorySearch) {
        result = tiles.filter(tile =>
          (query === 'materials' && tile.tags.materials && tile.tags.materials.length > 0) ||
          (query === 'methods' && tile.tags.methods && tile.tags.methods.length > 0) ||
          (query === 'themes' && tile.tags.themes && tile.tags.themes.length > 0) ||
          (query === 'design_as' && tile.tags.design_as && tile.tags.design_as.length > 0) ||
          (query === 'collaborators' && tile.tags.collaborators && tile.tags.collaborators.length > 0)
        );
      } else {
        result = fuzzySearch(searchQuery).map(result => result.item);
      }
    }
    if (priorityOnly) {
      return result.filter(tile => tile.priority === true);
    }
    // If in grid view, sort so priority artifacts are first
    if (viewMode === 'grid') {
      return [...result].sort((a, b) => {
        if (a.priority === b.priority) return 0;
        return a.priority ? -1 : 1;
      });
    }
    return result;
  }, [tiles, searchQuery, fuzzySearch, priorityOnly, viewMode]);

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
      {/* Show mobile header on mobile only */}
      {isMobileDevice() && (
        <MobileHeader
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
          styles={styles}
          priorityOnly={priorityOnly}
          setPriorityOnly={setPriorityOnly}
        />
      )}
      <div className={styles.controls} style={isMobileDevice() ? { display: 'none' } : {}}>
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
          <span className={styles.sortByLabel}>
            <span className={styles.desktopOnly}>SORT BY</span>
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className={styles.desktopOnly}
          >
            <option value="date">DATE ADDED</option>
            <option value="alphabetical">ALPHABETICAL</option>
            <option value="student">STUDENT</option>
            <option value="material">MATERIALS</option>
          </select>
        </div>
        <div className={styles.viewControls}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, marginRight: 8 }}>
            <span style={{ marginRight: 4 }}>Priority</span>
            <span style={{ position: 'relative', display: 'inline-block', width: 24, height: 14 }}>
              <input
                type="checkbox"
                checked={priorityOnly}
                onChange={() => setPriorityOnly(v => !v)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: priorityOnly ? '#2196F3' : '#ccc',
                borderRadius: 14,
                transition: '.2s',
                width: 24,
                height: 14,
                display: 'block'
              }}></span>
              <span style={{
                position: 'absolute',
                content: '""',
                height: 10,
                width: 10,
                left: priorityOnly ? 12 : 2,
                bottom: 2,
                background: 'white',
                borderRadius: '50%',
                transition: '.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                display: 'block'
              }}></span>
            </span>
          </label>
          <button 
            className={`${styles.gridViewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => setViewMode('grid')}
          >
            ⊞
          </button>
          <button 
            className={`${styles.clusterViewBtn} ${viewMode === 'cluster' ? styles.active : ''}`}
            onClick={() => setViewMode('cluster')}
          >
            □
          </button>
          <button 
            className={`${styles.vectorViewBtn} ${viewMode === 'vector' ? styles.active : ''}`}
            onClick={() => setViewMode('vector')}
          >
            ⊙
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
              {viewMode === 'grid' && isMobileDevice() ? (
                <MobileTileGrid
                  tiles={filteredTiles}
                  onTileClick={handleTileClick}
                  getActiveCategory={getActiveCategory}
                  draggedTile={draggedTile}
                  hoveredTile={hoveredTile}
                  handleTileHover={handleTileHover}
                />
              ) : (
                filteredTiles.map(tile => {
                  if (viewMode === 'vector') {
                    return (
                      <div
                        key={tile.id}
                        className={`${styles.tile} ${styles.vectorTile} ${draggedTile?.id === tile.id ? styles.dragging : ''}`}
                        style={{
                          position: 'absolute',
                          left: tile.x,
                          top: tile.y,
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          zIndex: tile.zIndex,
                          cursor: 'pointer',
                          background: 'var(--highlight-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pointerEvents: 'auto',
                        }}
                        onClick={() => handleTileClick(tile.id)}
                        onMouseEnter={() => handleTileHover(tile.id, true)}
                        onMouseLeave={() => handleTileHover(tile.id, false)}
                      >
                        <span className={styles.vectorTileNumber} style={{ color: '#fff', fontWeight: 600, fontSize: 12 }}>
                          {tiles.findIndex(t => t.id === tile.id) + 1}
                        </span>
                      </div>
                    );
                  } else {
                    // Default (desktop grid, cluster, etc): absolute positioning
                    return (
                      <Tile
                        key={tile.id}
                        tile={tile}
                        isDragging={draggedTile && draggedTile.id === tile.id}
                        isHovered={hoveredTile && hoveredTile.id === tile.id}
                        onClick={handleTileClick}
                        onHover={(isHovered) => handleTileHover(tile.id, isHovered)}
                        style={{ zIndex: tile.zIndex }}
                        displayTags={getActiveCategory()}
                        priorityMode={(priorityOnly && (viewMode === 'grid' || viewMode === 'cluster'))}
                      />
                    );
                  }
                })
              )}
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
                    onClick={() => handleTileClick(hoveredTile.id)}
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
