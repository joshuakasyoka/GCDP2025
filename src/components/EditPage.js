import React, { useState, useEffect } from 'react';
import { useArchiveData } from '../contexts/ArchiveDataContext';
import { archiveApi } from '../services/archiveApi';
import { tagCategories, artifactTypes } from '../data/tagCategories';
import FileUpload from './FileUpload';
import CmsMapPicker from './CmsMapPicker';
import styles from '../styles/Edit.module.css';

const DEFAULT_YEARS = [2026, 2025];

const emptyStudentForm = {
  first_name: '',
  last_name: '',
  display_name: '',
  email: '',
  about: '',
  student_number: '',
  enrollment_year: new Date().getFullYear(),
  student_year: 2026,
  program: 'Design Research',
  year_level: 3,
  project_title: '',
  project_description: '',
};

function getStudentYear(student) {
  return student.student_year ?? 2025;
}

function buildYearGroups(students, extraYears) {
  const years = new Set([
    ...DEFAULT_YEARS,
    ...extraYears,
    ...students.map(getStudentYear),
  ]);
  return [...years].sort((a, b) => b - a);
}

const emptyArtifactForm = {
  title: '',
  description: '',
  type: 'documentation',
  file_paths: '',
  w: 180,
  h: 130,
  lat: '',
  lng: '',
  priority: false,
  tags: { themes: [], design_as: [], materials: [], methods: [], collaborators: [] },
};

const emptyPinForm = {
  title: '',
  description: '',
  lat: '',
  lng: '',
  file_paths: '',
};

const buildMapPinPayload = (form) => ({
  title: form.title,
  description: form.description,
  lat: Number(form.lat),
  lng: Number(form.lng),
  file_paths: typeof form.file_paths === 'string'
    ? form.file_paths.split(',').map(s => s.trim()).filter(Boolean)
    : form.file_paths || [],
});

const buildArtifactPayload = (form) => {
  const lat = form.lat === '' || form.lat === null || form.lat === undefined
    ? null
    : Number(form.lat);
  const lng = form.lng === '' || form.lng === null || form.lng === undefined
    ? null
    : Number(form.lng);

  const payload = {
    ...form,
    file_paths: typeof form.file_paths === 'string'
      ? form.file_paths.split(',').map(s => s.trim()).filter(Boolean)
      : form.file_paths,
    w: Number(form.w),
    h: Number(form.h),
  };

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    payload.lat = lat;
    payload.lng = lng;
  } else {
    payload.lat = null;
    payload.lng = null;
  }

  return payload;
};

function TagSelector({ categoryKey, selected, onChange }) {
  const category = tagCategories.find(c => c.key === categoryKey);
  const [customTag, setCustomTag] = useState('');

  const toggle = (tag) => {
    const next = selected.includes(tag)
      ? selected.filter(t => t !== tag)
      : [...selected, tag];
    onChange(next);
  };

  const addCustom = () => {
    const tag = customTag.trim().toLowerCase().replace(/\s+/g, '_');
    if (tag && !selected.includes(tag)) {
      onChange([...selected, tag]);
    }
    setCustomTag('');
  };

  return (
    <div className={styles.tagSection}>
      <h4>{category.title}</h4>
      <div className={styles.tagGrid}>
        {category.tags.map(tag => (
          <button
            key={tag}
            type="button"
            className={`${styles.tagButton} ${selected.includes(tag) ? styles.tagSelected : ''}`}
            onClick={() => toggle(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className={styles.customTagRow}>
        <input
          value={customTag}
          onChange={e => setCustomTag(e.target.value)}
          placeholder="Add custom tag"
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
        />
        <button type="button" onClick={addCustom}>Add</button>
      </div>
    </div>
  );
}

const EditPage = () => {
  const { data, loading, source, refresh } = useArchiveData();
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [expandedArtifact, setExpandedArtifact] = useState(null);
  const [showNewStudent, setShowNewStudent] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showNewArtifact, setShowNewArtifact] = useState(false);
  const [studentForm, setStudentForm] = useState(emptyStudentForm);
  const [pinForm, setPinForm] = useState(emptyPinForm);
  const [artifactForm, setArtifactForm] = useState(emptyArtifactForm);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [extraYears, setExtraYears] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [dropTargetYear, setDropTargetYear] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState(
    sessionStorage.getItem('cms_api_key') || process.env.REACT_APP_CMS_API_KEY || ''
  );

  const students = data.students || [];
  const mapPins = data.map_pins || [];
  const yearGroups = buildYearGroups(students, extraYears);
  const selected = students.find(s => s.student_id === selectedId);
  const selectedPin = mapPins.find(p => p.pin_id === selectedPinId);

  const clearSelection = () => {
    setSelectedId(null);
    setSelectedPinId(null);
    setShowNewStudent(false);
    setShowNewPin(false);
    setShowNewArtifact(false);
  };

  useEffect(() => {
    if (selectedPin) {
      setPinForm({
        title: selectedPin.title || '',
        description: selectedPin.description || '',
        lat: selectedPin.lat ?? '',
        lng: selectedPin.lng ?? '',
        file_paths: (selectedPin.file_paths || []).join(', '),
      });
    }
  }, [selectedPin]);

  useEffect(() => {
    if (selected) {
      setStudentForm({
        first_name: selected.name.first_name,
        last_name: selected.name.last_name,
        display_name: selected.name.display_name,
        email: selected.email,
        about: selected.about,
        student_number: selected.student_number,
        enrollment_year: selected.enrollment_year,
        student_year: getStudentYear(selected),
        program: selected.program,
        year_level: selected.year_level,
        project_title: selected.projects[0]?.title || '',
        project_description: selected.projects[0]?.description || '',
      });
    }
  }, [selected]);

  const artifactCount = (student) =>
    student.projects.reduce((sum, p) => sum + p.artifacts.length, 0);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      const created = await archiveApi.createStudent(studentForm);
      await refresh();
      setSelectedId(created.student_id);
      setShowNewStudent(false);
      setStudentForm(emptyStudentForm);
      setStatus('Student created');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setStatus('');
    try {
      const updated = {
        ...selected,
        name: {
          first_name: studentForm.first_name,
          last_name: studentForm.last_name,
          display_name: studentForm.display_name || `${studentForm.first_name} ${studentForm.last_name}`.trim(),
        },
        email: studentForm.email,
        about: studentForm.about,
        student_number: studentForm.student_number,
        enrollment_year: Number(studentForm.enrollment_year),
        student_year: Number(studentForm.student_year),
        program: studentForm.program,
        year_level: Number(studentForm.year_level),
        projects: selected.projects.map((p, i) =>
          i === 0
            ? { ...p, title: studentForm.project_title, description: studentForm.project_description }
            : p
        ),
      };
      await archiveApi.updateStudent(selected.student_id, updated);
      await refresh();
      setStatus('Saved');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (e, studentId) => {
    e.dataTransfer.setData('text/student-id', studentId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(studentId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTargetYear(null);
  };

  const handleDragOver = (e, year) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetYear(year);
  };

  const handleDragLeave = () => {
    setDropTargetYear(null);
  };

  const handleDrop = async (e, targetYear) => {
    e.preventDefault();
    setDropTargetYear(null);
    setDraggingId(null);

    const studentId = e.dataTransfer.getData('text/student-id');
    if (!studentId) return;

    const student = students.find(s => s.student_id === studentId);
    if (!student || getStudentYear(student) === targetYear) return;

    setSaving(true);
    setStatus('');
    try {
      await archiveApi.updateStudent(studentId, { ...student, student_year: targetYear });
      await refresh();
      setStatus(`Moved to ${targetYear}`);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddYear = () => {
    const nextYear = Math.max(...yearGroups) + 1;
    setExtraYears(prev => [...prev, nextYear]);
  };

  const handleDeleteStudent = async () => {
    if (!selected || !window.confirm(`Delete ${selected.name.display_name}?`)) return;
    setSaving(true);
    try {
      await archiveApi.deleteStudent(selected.student_id);
      await refresh();
      setSelectedId(null);
      setStatus('Student deleted');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateArtifact = async (e) => {
    e.preventDefault();
    if (!selected) return;
    const project = selected.projects[0];
    if (!project) return;
    setSaving(true);
    setStatus('');
    try {
      await archiveApi.createArtifact(selected.student_id, project.project_id, buildArtifactPayload(artifactForm));
      await refresh();
      setShowNewArtifact(false);
      setArtifactForm(emptyArtifactForm);
      setStatus('Artifact created');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveArtifact = async (studentId, projectId, artifact) => {
    setSaving(true);
    setStatus('');
    try {
      await archiveApi.updateArtifact(studentId, projectId, artifact.artifact_id, artifact);
      await refresh();
      setStatus('Artifact saved');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArtifact = async (studentId, projectId, artifactId) => {
    if (!window.confirm('Delete this artifact?')) return;
    setSaving(true);
    try {
      await archiveApi.deleteArtifact(studentId, projectId, artifactId);
      await refresh();
      setExpandedArtifact(null);
      setStatus('Artifact deleted');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePin = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      const created = await archiveApi.createMapPin(buildMapPinPayload(pinForm));
      await refresh();
      setShowNewPin(false);
      setSelectedPinId(created.pin_id);
      setStatus('Pin created');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!selectedPin) return;
    setSaving(true);
    setStatus('');
    try {
      await archiveApi.updateMapPin(selectedPin.pin_id, buildMapPinPayload(pinForm));
      await refresh();
      setStatus('Pin saved');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePin = async () => {
    if (!selectedPin || !window.confirm(`Delete pin "${selectedPin.title}"?`)) return;
    setSaving(true);
    setStatus('');
    try {
      await archiveApi.deleteMapPin(selectedPin.pin_id);
      await refresh();
      setSelectedPinId(null);
      setPinForm(emptyPinForm);
      setStatus('Pin deleted');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.editPage}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>GCDP / EDIT</h1>
        </div>
        <div className={styles.headerRight}>
          <input
            type="password"
            className={styles.apiKeyInput}
            value={apiKeyInput}
            onChange={(e) => {
              setApiKeyInput(e.target.value);
              archiveApi.setApiKey(e.target.value);
            }}
            placeholder="CMS key (if required)"
          />
          <span>{loading ? 'Loading…' : `Source: ${source}`}</span>
        </div>
      </header>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <button
            type="button"
            className={styles.addButton}
            onClick={() => { clearSelection(); setShowNewStudent(true); }}
          >
            + New student
          </button>
          <button type="button" className={styles.addButton} onClick={handleAddYear}>
            + Add year
          </button>
          <button
            type="button"
            className={styles.addButton}
            onClick={() => { clearSelection(); setShowNewPin(true); setPinForm(emptyPinForm); }}
          >
            + New pin
          </button>
          <h2>MAP PINS</h2>
          <div className={`${styles.yearSection} ${styles.pinSection}`}>
            {mapPins.length === 0 ? (
              <p className={styles.yearEmpty}>No map pins yet</p>
            ) : (
              <ul className={styles.studentList}>
                {mapPins.map(pin => (
                  <li key={pin.pin_id} className={styles.pinItem}>
                    <button
                      type="button"
                      className={`${styles.studentButton} ${selectedPinId === pin.pin_id ? styles.studentButtonActive : ''}`}
                      onClick={() => {
                        setSelectedId(null);
                        setShowNewStudent(false);
                        setShowNewPin(false);
                        setShowNewArtifact(false);
                        setSelectedPinId(pin.pin_id);
                      }}
                    >
                      <span>{pin.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <h2>STUDENTS</h2>
          {yearGroups.map(year => {
            const yearStudents = students
              .filter(s => getStudentYear(s) === year)
              .sort((a, b) => a.name.display_name.localeCompare(b.name.display_name));

            return (
              <div
                key={year}
                className={`${styles.yearSection} ${styles.yearDropZone} ${dropTargetYear === year ? styles.yearDropZoneActive : ''}`}
                onDragOver={(e) => handleDragOver(e, year)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, year)}
              >
                <h3 className={styles.yearHeading}>{year}</h3>
                {yearStudents.length === 0 ? (
                  <p className={styles.yearEmpty}>Drop students here</p>
                ) : (
                  <ul className={styles.studentList}>
                    {yearStudents.map(student => (
                      <li
                        key={student.student_id}
                        className={`${styles.studentItem} ${draggingId === student.student_id ? styles.studentItemDragging : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, student.student_id)}
                        onDragEnd={handleDragEnd}
                      >
                        <button
                          type="button"
                          className={`${styles.studentButton} ${selectedId === student.student_id ? styles.studentButtonActive : ''}`}
                          onClick={() => {
                            setSelectedId(student.student_id);
                            setSelectedPinId(null);
                            setShowNewStudent(false);
                            setShowNewPin(false);
                            setShowNewArtifact(false);
                          }}
                        >
                          <span>{student.name.display_name}</span>
                          <span className={styles.artifactCount}>{artifactCount(student)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </aside>

        <main className={styles.main}>
          {showNewStudent && (
            <div className={styles.panel}>
              <h2>NEW STUDENT</h2>
              <form onSubmit={handleCreateStudent}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>First name</label>
                    <input value={studentForm.first_name} onChange={e => setStudentForm(f => ({ ...f, first_name: e.target.value }))} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Last name</label>
                    <input value={studentForm.last_name} onChange={e => setStudentForm(f => ({ ...f, last_name: e.target.value }))} required />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Display name</label>
                  <input value={studentForm.display_name} onChange={e => setStudentForm(f => ({ ...f, display_name: e.target.value }))} placeholder="Optional — defaults to first + last" />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input type="email" value={studentForm.email} onChange={e => setStudentForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Student number</label>
                    <input value={studentForm.student_number} onChange={e => setStudentForm(f => ({ ...f, student_number: e.target.value }))} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>About</label>
                  <textarea value={studentForm.about} onChange={e => setStudentForm(f => ({ ...f, about: e.target.value }))} />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Student year</label>
                    <select value={studentForm.student_year} onChange={e => setStudentForm(f => ({ ...f, student_year: Number(e.target.value) }))}>
                      {yearGroups.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Year level</label>
                    <input type="number" value={studentForm.year_level} onChange={e => setStudentForm(f => ({ ...f, year_level: e.target.value }))} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Program</label>
                  <input value={studentForm.program} onChange={e => setStudentForm(f => ({ ...f, program: e.target.value }))} />
                </div>
                <h3>DEFAULT PROJECT</h3>
                <div className={styles.formGroup}>
                  <label>Project title</label>
                  <input value={studentForm.project_title} onChange={e => setStudentForm(f => ({ ...f, project_title: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>Project description</label>
                  <textarea value={studentForm.project_description} onChange={e => setStudentForm(f => ({ ...f, project_description: e.target.value }))} />
                </div>
                <div className={styles.actions}>
                  <button type="submit" className={styles.saveButton} disabled={saving}>
                    {saving ? 'Creating…' : 'Create student'}
                  </button>
                  <button type="button" className={styles.deleteButton} onClick={() => setShowNewStudent(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {showNewPin && (
            <div className={styles.panel}>
              <h2>NEW MAP PIN</h2>
              <form onSubmit={handleCreatePin}>
                <PinFields form={pinForm} setForm={setPinForm} />
                <div className={styles.actions}>
                  <button type="submit" className={styles.saveButton} disabled={saving}>
                    {saving ? 'Creating…' : 'Create pin'}
                  </button>
                  <button type="button" className={styles.deleteButton} onClick={() => setShowNewPin(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {!showNewStudent && !showNewPin && selectedPin && (
            <div className={styles.panel}>
              <h2>{selectedPin.title.toUpperCase()}</h2>
              <form onSubmit={handleSavePin}>
                <PinFields form={pinForm} setForm={setPinForm} />
                <div className={styles.actions}>
                  <button type="submit" className={styles.saveButton} disabled={saving}>Save pin</button>
                  <button type="button" className={styles.deleteButton} onClick={handleDeletePin}>Delete pin</button>
                </div>
              </form>
            </div>
          )}

          {!showNewStudent && !showNewPin && selected && (
            <div className={styles.panel}>
              <h2>{selected.name.display_name.toUpperCase()}</h2>
              <form onSubmit={handleSaveStudent}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>First name</label>
                    <input value={studentForm.first_name} onChange={e => setStudentForm(f => ({ ...f, first_name: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Last name</label>
                    <input value={studentForm.last_name} onChange={e => setStudentForm(f => ({ ...f, last_name: e.target.value }))} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Display name</label>
                  <input value={studentForm.display_name} onChange={e => setStudentForm(f => ({ ...f, display_name: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>About</label>
                  <textarea value={studentForm.about} onChange={e => setStudentForm(f => ({ ...f, about: e.target.value }))} />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input value={studentForm.email} onChange={e => setStudentForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Program</label>
                    <input value={studentForm.program} onChange={e => setStudentForm(f => ({ ...f, program: e.target.value }))} />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Student year</label>
                    <select value={studentForm.student_year} onChange={e => setStudentForm(f => ({ ...f, student_year: Number(e.target.value) }))}>
                      {yearGroups.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Year level</label>
                    <input type="number" value={studentForm.year_level} onChange={e => setStudentForm(f => ({ ...f, year_level: e.target.value }))} />
                  </div>
                </div>

                {selected.projects[0] && (
                  <>
                    <div className={styles.formGroup}>
                      <label>Project title</label>
                      <input value={studentForm.project_title} onChange={e => setStudentForm(f => ({ ...f, project_title: e.target.value }))} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Project description</label>
                      <textarea value={studentForm.project_description} onChange={e => setStudentForm(f => ({ ...f, project_description: e.target.value }))} />
                    </div>
                  </>
                )}

                <div className={styles.actions}>
                  <button type="submit" className={styles.saveButton} disabled={saving}>Save profile</button>
                  <button type="button" className={styles.deleteButton} onClick={handleDeleteStudent}>Delete student</button>
                </div>
              </form>

              <h3>ARTEFACTS</h3>
              <button
                type="button"
                className={styles.addButton}
                onClick={() => { setShowNewArtifact(true); setArtifactForm(emptyArtifactForm); }}
              >
                + New artefact
              </button>

              {showNewArtifact && (
                <form className={styles.artifactForm} onSubmit={handleCreateArtifact}>
                  <ArtifactFields form={artifactForm} setForm={setArtifactForm} studentId={selected.student_id} />
                  <div className={styles.actions}>
                    <button type="submit" className={styles.saveButton} disabled={saving}>Create artefact</button>
                    <button type="button" className={styles.deleteButton} onClick={() => setShowNewArtifact(false)}>Cancel</button>
                  </div>
                </form>
              )}

              <ul className={styles.artifactList}>
                {selected.projects.flatMap(project =>
                  project.artifacts.map(artifact => (
                    <li key={artifact.artifact_id} className={styles.artifactItem}>
                      <button
                        type="button"
                        className={styles.artifactHeader}
                        onClick={() => setExpandedArtifact(
                          expandedArtifact === artifact.artifact_id ? null : artifact.artifact_id
                        )}
                      >
                        <span>{typeof artifact.title === 'string' ? artifact.title : artifact.title?.en}</span>
                        <span className={styles.artifactMeta}>{artifact.type}{artifact.priority ? ' · priority' : ''}</span>
                      </button>
                      {expandedArtifact === artifact.artifact_id && (
                        <ArtifactEditor
                          artifact={artifact}
                          projectId={project.project_id}
                          studentId={selected.student_id}
                          onSave={handleSaveArtifact}
                          onDelete={handleDeleteArtifact}
                          saving={saving}
                        />
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {!showNewStudent && !showNewPin && !selected && !selectedPin && (
            <p className={styles.empty}>Select a student or map pin, or create a new one.</p>
          )}

          {status && <p className={styles.status}>{status}</p>}
        </main>
      </div>
    </div>
  );
};

function PinFields({ form, setForm }) {
  return (
    <>
      <div className={styles.formGroup}>
        <label>Title</label>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
      </div>
      <div className={styles.formGroup}>
        <label>Description</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <FileUpload
        studentId="map-pins"
        value={form.file_paths}
        onChange={(paths) => setForm(f => ({ ...f, file_paths: paths }))}
        label="Pin image"
      />
      <div className={styles.formGroup}>
        <label>Map location</label>
        <CmsMapPicker
          lat={form.lat}
          lng={form.lng}
          title={form.title}
          onChange={({ lat, lng }) => setForm(f => ({ ...f, lat, lng }))}
        />
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Latitude</label>
            <input
              type="number"
              step="any"
              value={form.lat ?? ''}
              onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Longitude</label>
            <input
              type="number"
              step="any"
              value={form.lng ?? ''}
              onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
              required
            />
          </div>
        </div>
      </div>
    </>
  );
}

function ArtifactFields({ form, setForm, studentId }) {
  const setTags = (key, tags) => {
    setForm(f => ({ ...f, tags: { ...f.tags, [key]: tags } }));
  };

  return (
    <>
      <div className={styles.formGroup}>
        <label>Title</label>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
      </div>
      <div className={styles.formGroup}>
        <label>Description</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div className={styles.formGroup}>
        <label>Type</label>
        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          {artifactTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <FileUpload
        studentId={studentId}
        value={form.file_paths}
        onChange={(paths) => setForm(f => ({ ...f, file_paths: paths }))}
        label="Artefact images"
      />
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Width (tile)</label>
          <input type="number" value={form.w} onChange={e => setForm(f => ({ ...f, w: e.target.value }))} />
        </div>
        <div className={styles.formGroup}>
          <label>Height (tile)</label>
          <input type="number" value={form.h} onChange={e => setForm(f => ({ ...f, h: e.target.value }))} />
        </div>
      </div>
      <div className={styles.checkboxRow}>
        <input
          type="checkbox"
          id="priority"
          checked={form.priority}
          onChange={e => setForm(f => ({ ...f, priority: e.target.checked }))}
        />
        <label htmlFor="priority">Priority (featured in archive)</label>
      </div>
      <div className={styles.formGroup}>
        <label>Map pin</label>
        <CmsMapPicker
          lat={form.lat}
          lng={form.lng}
          title={form.title}
          onChange={({ lat, lng }) => setForm(f => ({ ...f, lat, lng }))}
        />
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Latitude</label>
            <input
              type="number"
              step="any"
              placeholder="51.4988"
              value={form.lat ?? ''}
              onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Longitude</label>
            <input
              type="number"
              step="any"
              placeholder="-0.1749"
              value={form.lng ?? ''}
              onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
            />
          </div>
        </div>
      </div>
      {tagCategories.map(cat => (
        <TagSelector
          key={cat.key}
          categoryKey={cat.key}
          selected={form.tags[cat.key] || []}
          onChange={tags => setTags(cat.key, tags)}
        />
      ))}
    </>
  );
}

function ArtifactEditor({ artifact, projectId, studentId, onSave, onDelete, saving }) {
  const [form, setForm] = useState({
    ...artifact,
    file_paths: (artifact.file_paths || []).join(', '),
    lat: artifact.lat ?? '',
    lng: artifact.lng ?? '',
    tags: {
      themes: artifact.tags?.themes || [],
      design_as: artifact.tags?.design_as || [],
      materials: artifact.tags?.materials || [],
      methods: artifact.tags?.methods || [],
      collaborators: artifact.tags?.collaborators || [],
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    onSave(studentId, projectId, buildArtifactPayload(form));
  };

  return (
    <form className={styles.artifactForm} onSubmit={handleSave}>
      <ArtifactFields form={form} setForm={setForm} studentId={studentId} />
      <div className={styles.actions}>
        <button type="submit" className={styles.saveButton} disabled={saving}>Save artefact</button>
        <button type="button" className={styles.deleteButton} onClick={() => onDelete(studentId, projectId, artifact.artifact_id)}>Delete</button>
      </div>
    </form>
  );
}

export default EditPage;
