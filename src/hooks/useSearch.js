import { useState, useMemo } from 'react';
import { searchArtifacts, sortArtifacts } from '../utils/searchUtils';

export const useSearch = (allArtifacts) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedFilters, setSelectedFilters] = useState({
    materials: [],
    themes: [],
    techniques: [],
    categories: []
  });

  const filteredAndSortedArtifacts = useMemo(() => {
    let filtered = searchArtifacts(allArtifacts, searchQuery);
    
    // Apply tag filters
    Object.entries(selectedFilters).forEach(([category, filters]) => {
      if (filters.length > 0) {
        filtered = filtered.filter(artifact => 
          artifact.tags[category] && 
          filters.some(filter => artifact.tags[category].includes(filter))
        );
      }
    });
    
    return sortArtifacts(filtered, sortBy);
  }, [allArtifacts, searchQuery, sortBy, selectedFilters]);

  const toggleFilter = (category, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedFilters,
    toggleFilter,
    filteredAndSortedArtifacts
  };
};
