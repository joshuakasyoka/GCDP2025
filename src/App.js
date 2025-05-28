import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ArchivePage from './components/ArchivePage';
import StudentProjectPage from './components/StudentProjectPage';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ArchivePage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/students/:studentId" element={<StudentProjectPage />} />
          <Route path="/students/:studentId/:projectId" element={<StudentProjectPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
