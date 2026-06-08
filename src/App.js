import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import IntroAnimation from './components/IntroAnimation';
import ArchivePage from './components/ArchivePage';
import StudentProjectPage from './components/StudentProjectPage';
import GlossaryPage from './components/GlossaryPage';
import EditPage from './components/EditPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { ArchiveDataProvider } from './contexts/ArchiveDataContext';
import './styles/globals.css';
import styles from './styles/App.module.css';

function AppRoutes() {
  const location = useLocation();
  const skipIntro = location.pathname.startsWith('/edit');
  const [showIntro, setShowIntro] = useState(!skipIntro);

  if (showIntro) {
    return <IntroAnimation onComplete={() => setShowIntro(false)} />;
  }

  return (
    <LanguageProvider>
      <ArchiveDataProvider>
        <Routes>
          <Route path="/" element={<ArchivePage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/archive/artifact/:artifactId" element={<ArchivePage />} />
          <Route path="/students/:studentId" element={<StudentProjectPage />} />
          <Route path="/students/:studentId/:projectId" element={<StudentProjectPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/edit" element={<EditPage />} />
        </Routes>
      </ArchiveDataProvider>
    </LanguageProvider>
  );
}

function App() {
  return (
    <div className={styles.app}>
      <Router>
        <AppRoutes />
      </Router>
    </div>
  );
}

export default App;
