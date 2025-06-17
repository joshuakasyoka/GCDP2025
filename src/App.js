import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IntroAnimation from './components/IntroAnimation';
import ArchivePage from './components/ArchivePage';
import StudentProjectPage from './components/StudentProjectPage';
import GlossaryPage from './components/GlossaryPage';
import './styles/globals.css';
import styles from './styles/App.module.css';

function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className={styles.app}>
      {showIntro ? (
        <IntroAnimation onComplete={() => setShowIntro(false)} />
      ) : (
        <Router>
          <Routes>
            <Route path="/" element={<ArchivePage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/archive/artifact/:artifactId" element={<ArchivePage />} />
            <Route path="/students/:studentId" element={<StudentProjectPage />} />
            <Route path="/students/:studentId/:projectId" element={<StudentProjectPage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
          </Routes>
        </Router>
      )}
    </div>
  );
}

export default App;
