const API_BASE = process.env.REACT_APP_API_URL || '';

function getAuthHeaders() {
  const key = process.env.REACT_APP_CMS_API_KEY || sessionStorage.getItem('cms_api_key');
  return key ? { Authorization: `Bearer ${key}` } : {};
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const archiveApi = {
  getStudents: () => request('/api/students'),
  getStudent: (id) => request(`/api/students/${id}`),
  createStudent: (data) => request('/api/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id, data) => request(`/api/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id) => request(`/api/students/${id}`, { method: 'DELETE' }),
  createArtifact: (studentId, projectId, data) =>
    request(`/api/students/${studentId}/projects/${projectId}/artifacts`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateArtifact: (studentId, projectId, artifactId, data) =>
    request(`/api/students/${studentId}/projects/${projectId}/artifacts/${artifactId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteArtifact: (studentId, projectId, artifactId) =>
    request(`/api/students/${studentId}/projects/${projectId}/artifacts/${artifactId}`, {
      method: 'DELETE',
    }),
  uploadFiles: async (studentId, files) => {
    const formData = new FormData();
    formData.append('studentId', studentId);
    files.forEach(file => formData.append('files', file));

    const res = await fetch(`${API_BASE}/api/upload?studentId=${encodeURIComponent(studentId)}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  },
  setApiKey: (key) => {
    if (key) sessionStorage.setItem('cms_api_key', key);
    else sessionStorage.removeItem('cms_api_key');
  },
};
