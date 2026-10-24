import api from './axiosConfig';

export const authApi = {
  login: (credentials) => api.post('/users/auth/token/', credentials),
  refresh: (refreshToken) => api.post('/users/auth/token/refresh/', { refresh: refreshToken }),
  me: () => api.get('/users/employees/me/'),
};

export const usersApi = {
  listRoles: () => api.get('/users/roles/'),
  createRole: (data) => api.post('/users/roles/', data),
  updateRole: (publicId, data) => api.patch(`/users/roles/${publicId}/`, data),
  deleteRole: (publicId) => api.delete(`/users/roles/${publicId}/`),
  
  listUsers: () => api.get('/users/users/'),
  createUser: (data) => api.post('/users/users/', data),
  updateUser: (publicId, data) => api.patch(`/users/users/${publicId}/`, data),
  deleteUser: (publicId) => api.delete(`/users/users/${publicId}/`),
  
  listEmployees: () => api.get('/users/employees/'),
  createEmployee: (data) => api.post('/users/employees/', data),
  updateEmployee: (publicId, data) => api.patch(`/users/employees/${publicId}/`, data),
  deleteEmployee: (publicId) => api.delete(`/users/employees/${publicId}/`),
  getMyProfile: () => api.get('/users/employees/me/'),
};

export const organizationApi = {
  listCompanies: () => api.get('/organization/companies/'),
  createCompany: (data) => api.post('/organization/companies/', data),
  updateCompany: (publicId, data) => api.patch(`/organization/companies/${publicId}/`, data),
  deleteCompany: (publicId) => api.delete(`/organization/companies/${publicId}/`),
  
  listBranches: () => api.get('/organization/branches/'),
  createBranch: (data) => api.post('/organization/branches/', data),
  updateBranch: (publicId, data) => api.patch(`/organization/branches/${publicId}/`, data),
  deleteBranch: (publicId) => api.delete(`/organization/branches/${publicId}/`),
  
  listDepartments: () => api.get('/organization/departments/'),
  createDepartment: (data) => api.post('/organization/departments/', data),
  updateDepartment: (publicId, data) => api.patch(`/organization/departments/${publicId}/`, data),
  deleteDepartment: (publicId) => api.delete(`/organization/departments/${publicId}/`),
  
  listTeams: () => api.get('/organization/teams/'),
  createTeam: (data) => api.post('/organization/teams/', data),
  updateTeam: (publicId, data) => api.patch(`/organization/teams/${publicId}/`, data),
  deleteTeam: (publicId) => api.delete(`/organization/teams/${publicId}/`),
};

export const projectsApi = {
  listProjects: () => api.get('/projects/'),
  createProject: (data) => api.post('/projects/', data),
  getProject: (publicId) => api.get(`/projects/${publicId}/`),
  updateProject: (publicId, data) => api.patch(`/projects/${publicId}/`, data),
  deleteProject: (publicId) => api.delete(`/projects/${publicId}/`),
  
  listTasks: () => api.get('/projects/tasks/'),
  createTask: (data) => api.post('/projects/tasks/', data),
  getTask: (publicId) => api.get(`/projects/tasks/${publicId}/`),
  updateTask: (publicId, data) => api.patch(`/projects/tasks/${publicId}/`, data),
  deleteTask: (publicId) => api.delete(`/projects/tasks/${publicId}/`),
};

export const assetsApi = {
  listAssets: () => api.get('/assets/assets/'),
  createAsset: (data) => api.post('/assets/assets/', data),
  getAsset: (publicId) => api.get(`/assets/assets/${publicId}/`),
  updateAsset: (publicId, data) => api.patch(`/assets/assets/${publicId}/`, data),
  deleteAsset: (publicId) => api.delete(`/assets/assets/${publicId}/`),
  
  listAllocations: () => api.get('/assets/allocations/'),
  createAllocation: (data) => api.post('/assets/allocations/', data),
  getAllocation: (publicId) => api.get(`/assets/allocations/${publicId}/`),
  updateAllocation: (publicId, data) => api.patch(`/assets/allocations/${publicId}/`, data),
  deleteAllocation: (publicId) => api.delete(`/assets/allocations/${publicId}/`),
  
  listHistory: () => api.get('/assets/history/'),
};