import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MappingList from './components/MappingList';
import MappingForm from './components/MappingForm';
import LogsViewer from './components/LogsViewer';
import Login from './pages/Login';
import AuthVerify from './pages/AuthVerify';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/verify" element={<AuthVerify />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="mappings" element={<MappingList />} />
            <Route path="mappings/new" element={<MappingForm />} />
            <Route path="mappings/:id" element={<MappingForm />} />
            <Route path="logs" element={<LogsViewer />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
