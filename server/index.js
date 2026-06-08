require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const {
  initStorage,
  getAllStudents,
  getStudent,
  upsertStudent,
  deleteStudent,
  generateId,
  isUsingMongo,
  getStorageError,
} = require('./storage');
const { requireAuth } = require('./auth');
const { upload } = require('./upload');
const { storeImage, streamImage, UPLOAD_ROOT } = require('./media');

const app = express();
const api = express.Router();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = !!process.env.VERCEL;

const initPromise = initStorage().catch((err) => {
  console.error('Storage init error:', err.message);
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOAD_ROOT));
app.use(express.static(path.join(__dirname, '../public')));

api.use(async (req, res, next) => {
  try {
    await initPromise;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Storage unavailable' });
  }
});

api.get('/health', async (req, res) => {
  const mongo = isUsingMongo();
  const err = getStorageError();
  res.json({
    ok: mongo || !isVercel,
    storage: mongo ? 'mongodb' : 'file',
    images: mongo ? 'gridfs' : 'disk',
    uploads: true,
    auth: !!process.env.CMS_API_KEY,
    error: err || undefined,
  });
});

api.get('/media/:fileId', async (req, res) => {
  try {
    await streamImage(req.params.fileId, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

api.get('/students', async (req, res) => {
  try {
    const data = await getAllStudents();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

api.get('/students/:studentId', async (req, res) => {
  try {
    const student = await getStudent(req.params.studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

api.post('/upload', requireAuth, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const studentId = req.body.studentId || req.query.studentId || 'general';
    const useMongo = isUsingMongo();
    const urls = await Promise.all(
      req.files.map(file => storeImage(file, studentId, useMongo))
    );
    res.json({ urls, storage: useMongo ? 'gridfs' : 'disk' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

api.post('/students', requireAuth, async (req, res) => {
  try {
    const data = await getAllStudents();
    const studentId = generateId('student_', data.students.map(s => s.student_id));
    const projectId = generateId('project_', []);

    const student = {
      student_id: studentId,
      name: {
        first_name: req.body.first_name || '',
        last_name: req.body.last_name || '',
        display_name: req.body.display_name || `${req.body.first_name || ''} ${req.body.last_name || ''}`.trim(),
      },
      email: req.body.email || '',
      about: req.body.about || '',
      student_number: req.body.student_number || '',
      enrollment_year: req.body.enrollment_year || new Date().getFullYear(),
      student_year: req.body.student_year || new Date().getFullYear(),
      program: req.body.program || 'Design Research',
      year_level: req.body.year_level || 3,
      projects: [{
        project_id: projectId,
        title: req.body.project_title || 'Untitled Project',
        description: req.body.project_description || '',
        course_code: req.body.course_code || 'DESIGN401',
        semester: req.body.semester || 'Fall 2025',
        status: 'in_progress',
        project_photos: [],
        artifacts: [],
      }],
    };

    await upsertStudent(student);
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

api.put('/students/:studentId', requireAuth, async (req, res) => {
  try {
    const existing = await getStudent(req.params.studentId);
    if (!existing) return res.status(404).json({ error: 'Student not found' });

    const updated = {
      ...existing,
      ...req.body,
      student_id: existing.student_id,
      name: { ...existing.name, ...req.body.name },
    };

    await upsertStudent(updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

api.delete('/students/:studentId', requireAuth, async (req, res) => {
  try {
    const existing = await getStudent(req.params.studentId);
    if (!existing) return res.status(404).json({ error: 'Student not found' });
    await deleteStudent(req.params.studentId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

api.post('/students/:studentId/projects/:projectId/artifacts', requireAuth, async (req, res) => {
  try {
    const student = await getStudent(req.params.studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const project = student.projects.find(p => p.project_id === req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const projectNum = req.params.projectId.replace('project_', '');
    const suffix = String(project.artifacts.length + 1).padStart(2, '0');
    const artifactId = `artifact_${projectNum}_${suffix}`;

    const artifact = {
      artifact_id: artifactId,
      title: req.body.title || 'Untitled',
      description: req.body.description || '',
      type: req.body.type || 'documentation',
      file_paths: req.body.file_paths || [],
      creation_date: req.body.creation_date || new Date().toISOString(),
      w: req.body.w || 180,
      h: req.body.h || 130,
      priority: req.body.priority || false,
      tags: {
        themes: req.body.tags?.themes || [],
        design_as: req.body.tags?.design_as || [],
        materials: req.body.tags?.materials || [],
        methods: req.body.tags?.methods || [],
        collaborators: req.body.tags?.collaborators || [],
      },
    };

    project.artifacts.push(artifact);
    await upsertStudent(student);
    res.status(201).json(artifact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

api.put('/students/:studentId/projects/:projectId/artifacts/:artifactId', requireAuth, async (req, res) => {
  try {
    const student = await getStudent(req.params.studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const project = student.projects.find(p => p.project_id === req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const index = project.artifacts.findIndex(a => a.artifact_id === req.params.artifactId);
    if (index < 0) return res.status(404).json({ error: 'Artifact not found' });

    project.artifacts[index] = {
      ...project.artifacts[index],
      ...req.body,
      artifact_id: req.params.artifactId,
      tags: { ...project.artifacts[index].tags, ...req.body.tags },
    };

    await upsertStudent(student);
    res.json(project.artifacts[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

api.delete('/students/:studentId/projects/:projectId/artifacts/:artifactId', requireAuth, async (req, res) => {
  try {
    const student = await getStudent(req.params.studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const project = student.projects.find(p => p.project_id === req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    project.artifacts = project.artifacts.filter(a => a.artifact_id !== req.params.artifactId);
    await upsertStudent(student);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api', api);
if (isVercel) app.use(api);

app.use((err, req, res, next) => {
  if (err) {
    res.status(400).json({ error: err.message });
  } else {
    next();
  }
});

if (isProduction && !isVercel) {
  const buildPath = path.join(__dirname, '../build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

module.exports = app;

if (require.main === module) {
  initPromise.then(() => {
    app.listen(PORT, () => {
      console.log(`Archive server running on http://localhost:${PORT}${isProduction ? ' (production)' : ''}`);
    });
  });
}
