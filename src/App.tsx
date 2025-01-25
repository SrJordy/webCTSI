import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import ManageUsersPage from './pages/manage-users';
import ManagePatientsPage from './pages/managepatient'
import HistoryPage from './pages/History';
import HistorialView from './pages/[id]';
import RecetaPage from './pages/RecetaPage';
import RecetasListPage from './pages/managerecipes';
import TratamientosListPage from './pages/Tratamientos';
import ExamenesPage from './pages/examenPage';
import DiagnosticosPage from './pages/diagnostico';

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
        <Route path="/Receta" element={<RecetaPage />} />
        <Route path="/managerecipes" element={<RecetasListPage />} />
        <Route path="/Tratamientos" element={<TratamientosListPage />} />
        <Route path="/Examenes" element={<ExamenesPage />} />
        <Route path="/Diagnosticos" element={<DiagnosticosPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
