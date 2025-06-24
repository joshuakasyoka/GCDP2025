import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Glossary.module.css';

const GlossaryPage = () => {
  // Define tag categories and their descriptions
  const tagCategories = [
    {
      title: "Themes",
      description: "Conceptual and topical focuses explored in the projects, such as social issues, cultural topics, or creative directions.",
      tags: ["ai", "technology", "participatory_design", "politics", "identity", "community", "futuresthinking", "mapping", "storytelling", "repair", "collage", "zine", "handmaking", "photography", "documentation"]
    },
    {
      title: "Design As",
      description: "The role or mode of design practice, such as participatory, speculative, critical, or educational approaches.",
      tags: ["participatory", "speculative", "critical", "enquiry", "democratic", "discursive", "craft", "inclusive", "visual", "educational", "installation"]
    },
    {
      title: "Materials",
      description: "Physical or digital materials used in the making of artifacts, including traditional and experimental media.",
      tags: ["paper", "ink", "thread", "wood", "plastic", "metal", "textile", "digital", "film", "thermal_ink", "thermal_paper", "polyethylene", "map", "marker", "sticker"]
    },
    {
      title: "Methods",
      description: "Processes, techniques, or research methods used to develop and realize the projects.",
      tags: ["workshops", "collage", "ethnography", "storytelling", "guided_conversation", "participatory_mapping", "installation_engagement", "structured_dialog", "autoethnography", "dataanalysis", "creativewriting", "photography", "sculpting"]
    },
    {
      title: "Collaborators",
      description: "Organizations, communities, or individuals who contributed to or partnered in the projects.",
      tags: ["ual", "outlandish", "lj_works", "peckham_library", "communitycenter", "womenssupportgroup", "turinglab", "friendsofruskinpark", "southlondonurbangrowersslug", "camberwellgreen", "multicultural_center", "cultural_groups"]
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