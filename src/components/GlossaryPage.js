import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Glossary.module.css';

const GlossaryPage = () => {
  // Define tag categories and their descriptions
  const tagCategories = [
    {
      title: "Materials & Techniques",
      description: "Tags related to the physical materials and methods used in the projects",
      tags: ["paper", "digital", "photography", "video", "installation", "textile", "print", "collage"]
    },
    {
      title: "Themes & Concepts",
      description: "Tags related to the conceptual and thematic elements of the projects",
      tags: ["activism", "community", "sustainability", "identity", "social-justice", "environment", "culture"]
    },
    {
      title: "Process & Approach",
      description: "Tags related to the methodology and approach of the projects",
      tags: ["research", "collaboration", "experimental", "iterative", "participatory", "documentation"]
    }
  ];

  return (
    <div className={styles.glossaryPage}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/" className={styles.backLink}>← Back to Archive</Link>
        </div>
      </header>

      <div className={styles.content}>
        {tagCategories.map((category, index) => (
          <section key={index} className={styles.category}>
            <h2>{category.title}</h2>
            <p className={styles.description}>{category.description}</p>
            <div className={styles.tags}>
              {category.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default GlossaryPage; 