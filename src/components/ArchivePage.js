import React, { useState } from 'react';
import SearchPanel from './SearchPanel';
import TileGrid from './TileGrid';
import GalleryModal from './GalleryModal';
import { studentsData } from '../data/studentsData';
import { useSearch } from '../hooks/useSearch';
import styles from '../styles/Archive.module.css';

const ArchivePage = () => {
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  // Flatten all artifacts from all students and projects
  const allArtifacts = studentsData.students.flatMap(student =>
    student.projects.flatMap(project =>
      project.artifacts.map(artifact => ({
        ...artifact,
        student: student.name.display_name,
        studentId: student.student_id,
        projectTitle: project.title,
        url: `/students/${student.student_id}/${project.project_id}`
      }))
    )
  );

  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedFilters,
    toggleFilter,
    filteredAndSortedArtifacts
  } = useSearch(allArtifacts);

  return (
    <div className={styles.archivePage}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>MATERIALS OF SOFT ACTIVISMS</h1>
          <span className={styles.initials}>JP</span>
        </div>
        <div className={styles.headerRight}>
          <span>ARCHIVE DISPLAY</span>
          <span>MA GCDP</span>
        </div>
      </header>
      
      <div className={styles.mainContent}>
        <SearchPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          artifacts={allArtifacts}
          filteredArtifacts={filteredAndSortedArtifacts}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedFilters={selectedFilters}
          onToggleFilter={toggleFilter}
        />
        
        <TileGrid
          artifacts={filteredAndSortedArtifacts}
          onTileClick={setSelectedArtifact}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      {selectedArtifact && (
        <GalleryModal
          artifact={selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
        />
      )}
    </div>
  );
};

export default ArchivePage;
