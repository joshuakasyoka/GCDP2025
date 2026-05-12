import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import SearchPanel from './SearchPanel';
import TileGrid from './TileGrid';
import GalleryModal from './GalleryModal';
import CommentsPanel from './CommentsPanel';
import { studentsData } from '../data/studentsData';
import { useSearch } from '../hooks/useSearch';
import { useLanguage } from '../contexts/LanguageContext';
import styles from '../styles/Archive.module.css';

const ArchivePage = () => {
  const { artifactId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();

  // Helper to detect mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Comments feature
  const [comments, setComments] = useState([]);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentsPanelOpen, setCommentsPanelOpen] = useState(false);
  const [panelSelectedId, setPanelSelectedId] = useState(null);

  const handleAddComment = useCallback((x, y) => {
    const id = Date.now().toString();
    const newComment = {
      id,
      x, y,
      initials: 'SP',
      name: 'Samuel',
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      title: 'Comment',
      status: null,
      coord: `${x.toFixed(0)}, ${y.toFixed(0)}`,
      previewText: '',
      threadComments: [],
      activities: [],
    };
    setComments(prev => [...prev, newComment]);
    setActiveCommentId(id);
  }, []);

  const handleCommentSelect = useCallback((id) => {
    setActiveCommentId(prev => prev === id ? null : id);
  }, []);

  const handleUpdateComment = useCallback((id, patch) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  }, []);

  const handleOpenCommentInPanel = useCallback((id) => {
    setActiveCommentId(null);
    setCommentsPanelOpen(true);
    setPanelSelectedId(id);
  }, []);

  const handleArtifactClick = (artifact_id) => {
    navigate(`/archive/artifact/${artifact_id}`);
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
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <h1 style={{ margin: 0 }}>MOSA</h1>
              <button
                className={styles.initials}
                onClick={() => {
                  if (language === 'en') {
                    window.location.href = 'https://gcdp-japan.vercel.app/archive';
                  } else {
                    toggleLanguage();
                  }
                }}
                aria-label={`Switch to ${language === 'en' ? 'Japanese' : 'English'}`}
              >
                {language === 'en' ? 'JP' : 'EN'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 8 }}>
              <Link to="/glossary" className={styles.glossaryLink}>GLOSSARY</Link>
              <Link to="/" className={styles.glossaryLink}>ARCHIVE DISPLAY</Link>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.headerLeft}>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h1>MATERIALS OF SOFT ACTIVISM</h1>
              </Link>
              <button
                className={styles.initials}
                onClick={() => {
                  if (language === 'en') {
                    window.location.href = 'https://gcdp-japan.vercel.app/archive';
                  } else {
                    toggleLanguage();
                  }
                }}
                aria-label={`Switch to ${language === 'en' ? 'Japanese' : 'English'}`}
              >
                {language === 'en' ? 'JP' : 'EN'}
              </button>
            </div>
            <div className={styles.headerRight}>
              <Link to="/glossary" className={styles.glossaryLink}>GLOSSARY</Link>
              <Link to="/" className={styles.glossaryLink}>ARCHIVE DISPLAY</Link>
              {comments.length > 0 && (
                <button
                  onClick={() => setCommentsPanelOpen(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', color: commentsPanelOpen ? 'var(--highlight-color)' : 'inherit' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  COMMENTS ({comments.length})
                </button>
              )}
            </div>
          </>
        )}
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
          comments={comments}
          activeCommentId={activeCommentId}
          onAddComment={handleAddComment}
          onCommentSelect={handleCommentSelect}
          onUpdateComment={handleUpdateComment}
          onOpenCommentInPanel={handleOpenCommentInPanel}
        />

        <CommentsPanel
          open={commentsPanelOpen}
          onClose={() => setCommentsPanelOpen(false)}
          comments={comments}
          onUpdateComment={handleUpdateComment}
          initialSelectedId={panelSelectedId}
          onClearInitialSelected={() => setPanelSelectedId(null)}
        />
      </div>

      {currentArtifact && (
        <GalleryModal
          key={`modal-${currentArtifact.artifact_id}-${location.pathname}`}
          artifact={currentArtifact}
          onClose={handleCloseModal}
          onTagClick={(tag) => {
            setSearchQuery(tag);
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
};

export default ArchivePage;
