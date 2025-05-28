export const searchArtifacts = (artifacts, query) => {
  if (!query.trim()) return artifacts;

  const searchTerm = query.toLowerCase();
  
  return artifacts.filter(artifact => {
    // Search in title
    if (artifact.title.toLowerCase().includes(searchTerm)) return true;
    
    // Search in description
    if (artifact.description.toLowerCase().includes(searchTerm)) return true;
    
    // Search in student name
    if (artifact.student && artifact.student.toLowerCase().includes(searchTerm)) return true;
    
    // Search in tags
    const allTags = Object.values(artifact.tags).flat();
    if (allTags.some(tag => tag.toLowerCase().includes(searchTerm))) return true;
    
    return false;
  });
};

export const sortArtifacts = (artifacts, sortBy) => {
  const sorted = [...artifacts];
  
  switch (sortBy) {
    case 'date':
      return sorted.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date));
    case 'alphabetical':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'student':
      return sorted.sort((a, b) => a.student.localeCompare(b.student));
    case 'material':
      return sorted.sort((a, b) => {
        const aMaterial = a.tags.materials[0] || '';
        const bMaterial = b.tags.materials[0] || '';
        return aMaterial.localeCompare(bMaterial);
      });
    default:
      return sorted;
  }
};

export const getUniqueValues = (artifacts, tagCategory) => {
  const values = new Set();
  artifacts.forEach(artifact => {
    if (artifact.tags[tagCategory]) {
      artifact.tags[tagCategory].forEach(value => values.add(value));
    }
  });
  return Array.from(values).sort();
};
