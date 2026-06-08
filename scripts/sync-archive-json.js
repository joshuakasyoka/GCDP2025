const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.join(__dirname, '../src/data/studentsData.js');
const targetPath = path.join(__dirname, '../server/data/archive.json');

const content = fs.readFileSync(sourcePath, 'utf8');
const code = content.replace('export const studentsData = ', 'studentsData = ');
const sandbox = {};
vm.runInNewContext(code, sandbox);

sandbox.studentsData.students = sandbox.studentsData.students.map(student => ({
  ...student,
  student_year: student.student_year ?? 2025,
}));

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, JSON.stringify(sandbox.studentsData, null, 2));
console.log(`Synced ${sandbox.studentsData.students.length} students to server/data/archive.json`);
