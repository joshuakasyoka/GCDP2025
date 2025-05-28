import React from 'react';
import { Link } from 'react-router-dom';
import { getUniqueValues } from '../utils/searchUtils';
import styles from '../styles/SearchPanel.module.css';

const SearchPanel = ({ 
  searchQuery, 
  onSearchChange, 
  artifacts, 
  filteredArtifacts,
  selectedFilters,
  onToggleFilter 
}) => {
  // Get unique students from artifacts using a Map to ensure uniqueness by studentId
  const uniqueStudents = Array.from(
    artifacts.reduce((map, artifact) => {
      if (!map.has(artifact.studentId)) {
        map.set(artifact.studentId, {
          id: artifact.studentId,
          name: artifact.student
        });
      }
      return map;
    }, new Map())
  ).map(([_, student]) => student);

  const FilterSection = ({ title, category, items }) => (
    <div className={styles.filterSection}>
      <h4>{title}</h4>
      <div className={styles.filterItems}>
        {items.map(item => (
          <label key={item} className={styles.filterItem}>
            <input
              type="checkbox"
              checked={selectedFilters[category].includes(item)}
              onChange={() => onToggleFilter(category, item)}
            />
            <span className={styles.filterLabel}>
              {item.replace(/_/g, ' ')}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.searchPanel}>
      <div className={styles.searchSection}>
        <h2>SEARCH</h2>
        <input
          type="text"
          placeholder="Search artifacts, students, materials..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
      </div>
{/* 
      <div className={styles.filtersSection}>
        <FilterSection
          title="MATERIALS"
          category="materials"
          items={getUniqueValues(artifacts, 'materials')}
        />
        <FilterSection
          title="THEMES"
          category="themes"
          items={getUniqueValues(artifacts, 'themes')}
        />
        <FilterSection
          title="TECHNIQUES"
          category="techniques"
          items={getUniqueValues(artifacts, 'techniques')}
        />
      </div> */}

      <div className={styles.resultsSection}>
        <h3>RESULTS ({filteredArtifacts.length})</h3>
        {searchQuery ? (
          filteredArtifacts.length > 0 ? (
            filteredArtifacts.map(artifact => (
              <div key={artifact.artifact_id} className={styles.resultItem}>
                <div className={styles.artifactName}>{artifact.title}</div>
                <div className={styles.studentName}>{artifact.student}</div>
                <div className={styles.tags}>
                  {Object.values(artifact.tags).flat().slice(0, 3).map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      #{tag.replace(/_/g, '')}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              No results found for "{searchQuery}"
            </div>
          )
        ) : (
          <div className={styles.noResults}>
            Enter a search term to find artifacts
          </div>
        )}
      </div>

      <div className={styles.studentPages}>
        <h3>STUDENT PAGES</h3>
        <div className={styles.studentList}>
          {uniqueStudents.map(student => (
            <Link 
              key={student.id} 
              to={`/students/${student.id}`}
              className={styles.studentLink}
            >
              {student.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;
