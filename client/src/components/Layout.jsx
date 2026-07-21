import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import {
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Search, 
  Building2, 
  UserCog, 
  FileUp, 
  LogOut, 
  Menu, 
  Rocket, 
  Microscope, 
  HeartPulse, 
  PieChart, 
  FileText,
  ShieldCheck,
  Calendar,
  Globe,
  Package,
  Armchair,
  LayoutGrid,
} from 'lucide-react';

const nav = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['manager', 'coordinator', 'member', 'member-odc-hybrid'] },
  { to: '/formations', label: 'École du code', icon: GraduationCap, roles: ['manager', 'coordinator', 'member', 'member-odc-hybrid'] },
  { to: '/startups', label: 'Orange Fab', icon: Rocket, roles: ['manager', 'coordinator', 'member'] },
  { to: '/fablab', label: 'FabLab Solidaire', icon: Microscope, roles: ['manager', 'coordinator', 'member'] },
  { to: '/odc-hybrid', label: 'ODC Hybrid', icon: Globe, roles: ['manager', 'super_admin', 'member-odc-hybrid'] },
  { to: '/coworking', label: 'Coworking', icon: Armchair, roles: ['manager', 'coordinator', 'member', 'member-odc-hybrid'] },
  { to: '/platforms', label: 'Nos Plateformes', icon: LayoutGrid, roles: ['manager', 'super_admin', 'coordinator', 'member', 'member-odc-hybrid'] },
  { to: '/events', label: 'Événements', icon: Calendar, roles: ['manager', 'super_admin', 'member', 'member-odc-hybrid'] },
  { to: '/calendar', label: 'Calendrier', icon: Calendar, roles: ['manager'] },
  { to: '/reports', label: 'Rapports', icon: FileText, roles: ['manager', 'coordinator'] },
  { to: '/rse', label: 'Impact RSE', icon: HeartPulse, roles: ['manager', 'rse_manager'] },
  { to: '/material', label: 'Gestion matériel', icon: Package, roles: ['coordinator'] },
  { to: '/participants', label: 'Participants', icon: Users, roles: ['coordinator', 'member', 'member-odc-hybrid'] },
  { to: '/employabilite', label: 'Employabilité & Insertion', icon: Search, roles: ['coordinator', 'member'] },
  { to: '/programmes', label: 'Programmes Spéciaux', icon: HeartPulse, roles: ['coordinator', 'member'] },
  { to: '/feedback', label: 'Satisfaction & Feedback', icon: PieChart, roles: ['coordinator', 'member'] },
  { to: '/import', label: 'Import données', icon: FileUp, roles: ['super_admin', 'coordinator', 'member', 'member-odc-hybrid'] },
  { to: '/admin', label: 'Admin Panel', icon: ShieldCheck, roles: ['super_admin'] },
  { to: '/users', label: 'Utilisateurs', icon: UserCog, roles: ['super_admin'] },
];

/** Membre rattaché à une entité FabLab ou Orange Fab (navigation dédiée) */
function isMemberFabOrOrange(user) {
  if (user?.role !== 'member') return false;
  const t = String(user?.entityId?.type || '').toLowerCase();
  return t.includes('fablab') || t.includes('orange fab');
}

/**
 * Membre « École du Code » : pas d’accès aux modules Orange Fab, FabLab, ODC Hybrid.
 * Si `entityId` est absent (ex. compte non rattaché), on applique le même menu restreint.
 */
function isMemberEcoleDuCodeMenu(user) {
  if (user?.role !== 'member') return false;
  if (isMemberFabOrOrange(user)) return false;
  return true;
}

const EDC_FORBIDDEN_LABELS = ['Orange Fab', 'FabLab Solidaire', 'ODC Hybrid'];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNav = nav.filter((item) => {
    if (!item.roles || (user && item.roles.includes(user.role))) {
      if (isMemberFabOrOrange(user)) {
        const memberAllowed = [
          'Tableau de bord',
          'École du code',
          'Événements',
          'Participants',
          'Import données',
          'Orange Fab',
          'FabLab Solidaire',
          'Coworking',
          'Nos Plateformes',
        ];
        return memberAllowed.includes(item.label);
      }
      if (isMemberEcoleDuCodeMenu(user)) {
        return !EDC_FORBIDDEN_LABELS.includes(item.label);
      }
      return true;
    }
    return false;
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-[#f5f5f5]">
      <aside className={`bg-odc-black text-white w-64 flex-shrink-0 fixed md:static inset-y-0 z-30 transform transition-transform md:transform-none flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <span className="font-bold uppercase tracking-wide text-sm">ODC Ecosystem</span>
          <button type="button" className="md:hidden p-2 -mr-2" onClick={() => setSidebarOpen(false)} aria-label="Fermer menu">×</button>
        </div>
        <nav className="p-2 mt-2 flex-1 overflow-y-auto custom-scrollbar">
          {filteredNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded odc rounded-odc text-sm font-medium transition-colors ${isActive ? 'bg-odc-orange text-white' : 'text-white/80 hover:bg-white/10'}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {user?.role === 'manager' && to === '/' ? 'Vue Exécutive' : label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <div className="text-xs text-white/60 truncate px-2">{user?.email}</div>
          <button type="button" onClick={handleLogout} className="flex items-center gap-2 mt-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-odc w-full">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center gap-4 sticky top-0 z-20">
          <button type="button" className="md:hidden p-2 -ml-2" onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <Menu className="w-6 h-6 text-odc-black" />
          </button>
          <div className="h-8 w-8 rounded bg-odc-orange flex-shrink-0" title="Orange Digital Center" />
          <h1 className="text-lg font-bold text-odc-black truncate">Orange Digital Center</h1>
          <NotificationBell />
        </header>
        <main className="flex-1 p-4 md:px-6 md:py-2 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
