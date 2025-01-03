import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import ManageUsersPage from './pages/manage-users';
import ManagePatientsPage from './pages/managepatient'
import HistoryPage from './pages/History';
import HistorialView from './pages/[id]';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} /> 
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/manage-users" element={<ManageUsersPage />} />
        <Route path="/managepatient" element={<ManagePatientsPage />} />
        <Route path='/History' element={<HistoryPage />} />
        <Route path="/:id" element={<HistorialView />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
