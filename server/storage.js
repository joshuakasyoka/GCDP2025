const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'data/archive.json');
const isVercel = !!process.env.VERCEL;

let useMongo = false;
let StudentModel = null;
let MapPinModel = null;
let storageError = null;

const VERCEL_MONGO_MSG =
  'MongoDB is required on Vercel. Set MONGODB_URI in Vercel env vars and allow 0.0.0.0/0 in Atlas Network Access.';

function readFileData() {
  if (!fs.existsSync(DATA_PATH)) {
    return { students: [], map_pins: [] };
  }
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  return { students: data.students || [], map_pins: data.map_pins || [] };
}

function writeFileData(data) {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

async function initStorage() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    if (isVercel) {
      storageError = new Error(VERCEL_MONGO_MSG);
      throw storageError;
    }
    console.log('No MONGODB_URI set — using file storage (server/data/archive.json)');
    return;
  }

  try {
    const mongoose = require('mongoose');

    if (mongoose.models.Student) {
      StudentModel = mongoose.models.Student;
      MapPinModel = mongoose.models.MapPin || null;
      useMongo = true;
      if (MapPinModel) return;
    }

    if (!global._mongoosePromise) {
      global._mongoosePromise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 15000,
        maxPoolSize: 5,
      });
    }
    await global._mongoosePromise;
    useMongo = true;

    const artifactTagsSchema = new mongoose.Schema({
      themes: [String],
      design_as: [String],
      materials: [String],
      methods: [String],
      collaborators: [String],
      categories: [String],
    }, { _id: false });

    const artifactSchema = new mongoose.Schema({
      artifact_id: String,
      title: mongoose.Schema.Types.Mixed,
      description: mongoose.Schema.Types.Mixed,
      type: String,
      file_paths: [String],
      creation_date: String,
      w: Number,
      h: Number,
      lat: Number,
      lng: Number,
      priority: Boolean,
      tags: artifactTagsSchema,
    }, { _id: false });

    const projectSchema = new mongoose.Schema({
      project_id: String,
      title: mongoose.Schema.Types.Mixed,
      description: String,
      course_code: String,
      semester: String,
      submission_date: String,
      grade: String,
      status: String,
      project_photos: [{ url: String, caption: String, id: String }],
      artifacts: [artifactSchema],
    }, { _id: false });

    const studentSchema = new mongoose.Schema({
      student_id: { type: String, unique: true },
      name: {
        first_name: String,
        last_name: String,
        display_name: String,
      },
      email: String,
      about: String,
      student_number: String,
      enrollment_year: Number,
      student_year: Number,
      program: String,
      year_level: Number,
      projects: [projectSchema],
    });

    StudentModel = mongoose.model('Student', studentSchema);

    if (!mongoose.models.MapPin) {
      const mapPinSchema = new mongoose.Schema({
        pin_id: { type: String, unique: true },
        title: String,
        description: String,
        lat: Number,
        lng: Number,
        file_paths: [String],
      });
      MapPinModel = mongoose.model('MapPin', mapPinSchema);
    } else {
      MapPinModel = mongoose.models.MapPin;
    }

    const count = await StudentModel.countDocuments();
    if (count === 0 && fs.existsSync(DATA_PATH)) {
      const seed = readFileData();
      if (seed.students?.length) {
        await StudentModel.insertMany(seed.students);
        console.log(`Seeded MongoDB with ${seed.students.length} students`);
      }
      if (seed.map_pins?.length) {
        await MapPinModel.insertMany(seed.map_pins);
        console.log(`Seeded MongoDB with ${seed.map_pins.length} map pins`);
      }
    }

    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    useMongo = false;
    StudentModel = null;
    MapPinModel = null;
    storageError = new Error(
      isVercel
        ? `${VERCEL_MONGO_MSG} (${err.message})`
        : `MongoDB connection failed: ${err.message}`
    );
    if (isVercel) throw storageError;
  }
}

function ensureWritable() {
  if (useMongo && StudentModel) return;
  if (storageError) throw storageError;
  if (isVercel) throw new Error(VERCEL_MONGO_MSG);
}

async function getAllStudents() {
  if (useMongo && StudentModel) {
    const students = await StudentModel.find().lean();
    const map_pins = MapPinModel ? await MapPinModel.find().lean() : [];
    return { students, map_pins };
  }
  return readFileData();
}

async function getMapPins() {
  if (useMongo && MapPinModel) {
    return MapPinModel.find().lean();
  }
  return readFileData().map_pins;
}

async function getMapPin(pinId) {
  const pins = await getMapPins();
  return pins.find(p => p.pin_id === pinId) || null;
}

async function upsertMapPin(pin) {
  if (useMongo && MapPinModel) {
    await MapPinModel.findOneAndUpdate({ pin_id: pin.pin_id }, pin, { upsert: true, new: true });
    return pin;
  }
  if (useMongo && !MapPinModel) {
    throw new Error('Map pin storage is not initialized');
  }
  ensureWritable();
  const data = readFileData();
  const index = data.map_pins.findIndex(p => p.pin_id === pin.pin_id);
  if (index >= 0) {
    data.map_pins[index] = pin;
  } else {
    data.map_pins.push(pin);
  }
  writeFileData(data);
  return pin;
}

async function deleteMapPin(pinId) {
  if (useMongo && MapPinModel) {
    await MapPinModel.deleteOne({ pin_id: pinId });
    return;
  }
  ensureWritable();
  const data = readFileData();
  data.map_pins = data.map_pins.filter(p => p.pin_id !== pinId);
  writeFileData(data);
}

async function saveAllStudents(data) {
  if (useMongo && StudentModel) {
    await StudentModel.deleteMany({});
    if (data.students?.length) {
      await StudentModel.insertMany(data.students);
    }
    return data;
  }
  ensureWritable();
  writeFileData(data);
  return data;
}

async function getStudent(studentId) {
  const data = await getAllStudents();
  return data.students.find(s => s.student_id === studentId) || null;
}

async function upsertStudent(student) {
  const data = await getAllStudents();
  const index = data.students.findIndex(s => s.student_id === student.student_id);
  if (index >= 0) {
    data.students[index] = student;
  } else {
    data.students.push(student);
  }
  await saveAllStudents(data);
  return student;
}

async function deleteStudent(studentId) {
  const data = await getAllStudents();
  data.students = data.students.filter(s => s.student_id !== studentId);
  await saveAllStudents(data);
}

function generateId(prefix, existing) {
  const nums = existing
    .map(id => parseInt(id.replace(/\D/g, ''), 10))
    .filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(2, '0')}`;
}

function isUsingMongo() {
  return useMongo && !!StudentModel;
}

function getStorageError() {
  return storageError?.message || null;
}

module.exports = {
  initStorage,
  getAllStudents,
  saveAllStudents,
  getStudent,
  upsertStudent,
  deleteStudent,
  getMapPins,
  getMapPin,
  upsertMapPin,
  deleteMapPin,
  generateId,
  isUsingMongo,
  getStorageError,
};
