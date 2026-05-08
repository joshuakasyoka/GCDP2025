import React from 'react';
import styles from '../styles/ProjectTile.module.css';

const ProjectTile = ({ project, isSelected, onClick }) => {
  return (
    <div
      className={`${styles.projectTile} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      {/* <div className={styles.thumbnail}>
        {thumbnail ? (
          <img src={thumbnail} alt={project.title} />
        ) : (
          <div className={styles.placeholder}>
            <span>{project.artifacts.length} artifacts</span>
          </div>
        )}
      </div> */}
      <div className={styles.projectInfo}>
        <h3>{project.title}</h3>
        <p>{project.artifacts.length} artifact{project.artifacts.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
};

export default ProjectTile;
