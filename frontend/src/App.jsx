import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import AssetsPage from './pages/AssetsPage';
import EmployeesPage from './pages/EmployeesPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route 
              path="/projects" 
              element={
                <RoleRoute roles={['System Admin', 'HR Manager', 'Department / Project Manager']}>
                  <ProjectsPage />
                </RoleRoute>
              } 
            />
            <Route 
              path="/assets" 
              element={
                <RoleRoute roles={['System Admin', 'HR Manager', 'Department / Project Manager', 'Employee']}>
                  <AssetsPage />
                </RoleRoute>
              } 
            />
            <Route 
              path="/employees" 
              element={
                <RoleRoute roles={['System Admin', 'HR Manager']}>
                  <EmployeesPage />
                </RoleRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <RoleRoute roles={['System Admin']}>
                  <SettingsPage />
                </RoleRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;