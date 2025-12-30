import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MappingList from './components/MappingList';
import MappingForm from './components/MappingForm';
import LogsViewer from './components/LogsViewer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="mappings" element={<MappingList />} />
          <Route path="mappings/new" element={<MappingForm />} />
          <Route path="mappings/:id" element={<MappingForm />} />
          <Route path="logs" element={<LogsViewer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
