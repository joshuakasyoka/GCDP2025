import React, { useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import SearchPanel from './SearchPanel';
import TileGrid from './TileGrid';
import GalleryModal from './GalleryModal';
import { studentsData } from '../data/studentsData';
import { useSearch } from '../hooks/useSearch';
import { useLanguage } from '../contexts/LanguageContext';
import styles from '../styles/Archive.module.css';

const ArchivePage = () => {
  const { artifactId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();

  // Flatten all artifacts from all students and projects
  const allArtifacts = studentsData.students.flatMap(student =>
    student.projects.flatMap(project =>
      project.artifacts.map(artifact => ({
        ...artifact,
        student: student.name[language]?.display_name || student.name.display_name,
        studentId: student.student_id,
        projectTitle: project.title[language] || project.title,
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

  const handleArtifactClick = (artifact) => {
    navigate(`/archive/artifact/${artifact.artifact_id}`);
  };

  const handleCloseModal = () => {
    navigate('/archive');
  };

  // Find the current artifact based on URL
  const currentArtifact = artifactId 
    ? allArtifacts.find(a => a.artifact_id === artifactId)
    : null;

  return (
    <div className={styles.archivePage}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>MATERIALS OF SOFT ACTIVISMS</h1>
          <button 
            className={styles.initials} 
            onClick={toggleLanguage}
            aria-label={`Switch to ${language === 'en' ? 'Japanese' : 'English'}`}
          >
            {language === 'en' ? 'JP' : 'EN'}
          </button>
        </div>
        <div className={styles.headerRight}>
          <Link to="/glossary" className={styles.glossaryLink}>GLOSSARY</Link>
          <span>ARCHIVE DISPLAY</span>
          {/* <span>GCDP 2025</span> */}
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
          onTileClick={handleArtifactClick}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {currentArtifact && (
        <GalleryModal
          key={`modal-${currentArtifact.artifact_id}-${location.pathname}`}
          artifact={currentArtifact}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ArchivePage;
