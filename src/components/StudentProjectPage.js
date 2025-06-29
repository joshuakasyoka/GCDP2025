import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProjectTile from './ProjectTile';
import ArtifactGrid from './ArtifactGrid';
import GalleryModal, { SimplePhotoModal } from './GalleryModal';
import { studentsData } from '../data/studentsData';
import styles from '../styles/StudentProject.module.css';

function getGoogleDriveImageUrl(link) {
  const match = link.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
  if (!match) return link;
  const fileId = match[1];
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

const StudentProjectPage = () => {
  const { studentId, projectId } = useParams();
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const student = studentsData.students.find(s => s.student_id === studentId);

  useEffect(() => {
    if (student && projectId) {
      const project = student.projects.find(p => p.project_id === projectId);
      setSelectedProject(project);
    } else if (student && student.projects.length > 0) {
      setSelectedProject(student.projects[0]);
    }
  }, [student, projectId]);

  if (!student) {
    return <div>Student not found</div>;
  }

  return (
    <div className={styles.studentProjectPage}>
      <header className={styles.header}>
        <Link to="/archive" className={styles.backLink}>
          ← BACK TO ARCHIVE
        </Link>
        <span>{student.name.display_name}</span>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.projectsPanel}>
          <h2>PROJECTS</h2>
          <div className={styles.projectGrid}>
            {student.projects.map(project => (
              <Link
                key={project.project_id}
                to={`/students/${studentId}/${project.project_id}`}
                className={styles.projectLink}
              >
                <ProjectTile
                  project={project}
                  isSelected={selectedProject?.project_id === project.project_id}
                />
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.projectDetails}>
          {selectedProject ? (
            <>
              <div className={styles.projectHeader}>
                <h2>{selectedProject.title}</h2>
                <div className={styles.projectMeta}>
                  <span>{selectedProject.course_code}</span>
                  <span>{selectedProject.semester}</span>
                </div>
              </div>

              <div className={styles.projectDescription}>
                <p>{selectedProject.description}</p>
              </div>

              <div className={styles.artifactsSection}>
                <h3>STUDENT INFORMATION</h3>
                <div className={styles.studentDetails}>
                  <p> {student.about}</p>
                  {/* <p><strong>Year:</strong> {student.year_level}</p>
                  <p><strong>Email:</strong> {student.email}</p> */}
                </div>
              </div>

              <div className={styles.artifactsSection}>
                <h3>ARTIFACTS ({selectedProject.artifacts.length})</h3>
                <ArtifactGrid
                  artifacts={selectedProject.artifacts}
                  onArtifactClick={setSelectedArtifact}
                />
              </div>

              {selectedProject.project_photos && selectedProject.project_photos.length > 0 && (
                <>
                  <div className={styles.projectPhotos}>
                    <h3>PROJECT PHOTOS</h3>
                    <div className={styles.photoGrid}>
                      {selectedProject.project_photos.map(photo => (
                        <div 
                          key={photo.id} 
                          className={styles.photoItem}
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <img 
                            src={getGoogleDriveImageUrl(photo.url)} 
                            alt={photo.caption}
                            className={styles.projectPhoto}
                            style={{ objectFit: 'cover', borderRadius: 0 }}
                          />
                          <p className={styles.photoCaption}>{photo.caption}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className={styles.noProject}>
              <p>Select a project to view details</p>
            </div>
          )}
        </div>
      </div>

      {selectedArtifact && (
        <GalleryModal
          artifact={{
            ...selectedArtifact,
            student: student.name.display_name,
            projectTitle: selectedProject?.title
          }}
          onClose={() => setSelectedArtifact(null)}
        />
      )}

      {selectedPhoto && (
        <SimplePhotoModal
          photoUrl={getGoogleDriveImageUrl(selectedPhoto.url)}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
};

export default StudentProjectPage;
