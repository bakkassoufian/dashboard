import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Formations from './pages/Formations';
import FormationsCom from './pages/FormationsCom';
import Participants from './pages/Participants';
import TalentSearch from './pages/TalentSearch';
import Entities from './pages/Entities';
import Users from './pages/Users';
import Import from './pages/Import';
import Employability from './pages/Employability';
import Startups from './pages/Startups';
import FabLab from './pages/FabLab';
import Programmes from './pages/Programmes';
import Feedback from './pages/Feedback';
import Reports from './pages/Reports';
import AdminPanel from './pages/AdminPanel';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import OdcHybrid from './pages/OdcHybrid';
import MaterialManagement from './pages/MaterialManagement';
import ProgrammeDetails from './pages/ProgrammeDetails';
import FormationDetails from './pages/FormationDetails';
import ManagerCalendar from './pages/ManagerCalendar';
import ImpactRse from './pages/ImpactRse';
import Coworking from './pages/Coworking';
import Platforms from './pages/Platforms';


function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-odc-black text-white">Chargement...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles?.length && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const RoleHome = () => {
    const { user } = useAuth();
    if (user?.role === 'super_admin') return <Navigate to="/admin" replace />;
    return <Dashboard />;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<RoleHome />} />
        <Route path="formations" element={<Formations />} />
        <Route path="formations/:id" element={<FormationDetails />} />
        <Route path="employabilite" element={<Employability />} />
        <Route path="startups" element={<Startups />} />
        <Route path="fablab" element={<FabLab />} />
        <Route path="programmes" element={<Programmes />} />
        <Route path="programmes/:id" element={<ProgrammeDetails />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="reports" element={<Reports />} />
        <Route path="participants" element={<Participants />} />
        <Route path="material" element={<PrivateRoute roles={['coordinator']}><MaterialManagement /></PrivateRoute>} />
        <Route path="events" element={<PrivateRoute roles={['manager', 'super_admin', 'member', 'member-odc-hybrid']}><Events /></PrivateRoute>} />
        <Route path="calendar" element={<PrivateRoute roles={['manager']}><ManagerCalendar /></PrivateRoute>} />
        <Route path="events/:id" element={<EventDetails />} />
        <Route path="odc-hybrid" element={<PrivateRoute roles={['manager', 'super_admin', 'member-odc-hybrid']}><OdcHybrid /></PrivateRoute>} />
        <Route path="coworking" element={<PrivateRoute roles={['manager', 'coordinator', 'member', 'member-odc-hybrid']}><Coworking /></PrivateRoute>} />
        <Route path="platforms" element={<PrivateRoute roles={['manager', 'super_admin', 'coordinator', 'member', 'member-odc-hybrid']}><Platforms /></PrivateRoute>} />
        <Route path="import" element={<PrivateRoute roles={['super_admin', 'coordinator', 'member', 'member-odc-hybrid']}><Import /></PrivateRoute>} />
        <Route path="entities" element={<PrivateRoute roles={['super_admin', 'manager']}><Entities /></PrivateRoute>} />
        <Route path="rse" element={<PrivateRoute roles={['manager', 'rse_manager']}><ImpactRse /></PrivateRoute>} />
        <Route path="users" element={<PrivateRoute roles={['super_admin']}><Users /></PrivateRoute>} />
        <Route path="admin" element={<PrivateRoute roles={['super_admin']}><AdminPanel /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
