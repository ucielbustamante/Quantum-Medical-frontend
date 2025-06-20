import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Folder,
  LogOut,
  Stethoscope,
  Heart,
  ClipboardList,
} from 'lucide-react';

const SidebarNavigation = () => {
  const { user, logout } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: `/${user?.role?.toLowerCase()}/dashboard`,
        icon: Home,
      },
    ];

    switch (user?.role) {
      case 'Admin':
        return [
          ...baseItems,
          {
            name: 'Usuarios',
            href: '/admin/users',
            icon: Users,
          },
          {
            name: 'Doctores',
            href: '/admin/doctors',
            icon: UserCheck,
          },
          {
            name: 'Pacientes',
            href: '/admin/patients',
            icon: Heart,
          },
          {
            name: 'Especialidades',
            href: '/admin/specialties',
            icon: Stethoscope,
          },
          {
            name: 'Citas',
            href: '/admin/appointments',
            icon: Calendar,
          },
          {
            name: 'Historiales',
            href: '/admin/clinical-records',
            icon: FileText,
          },
          {
            name: 'Documentos',
            href: '/admin/documents',
            icon: Folder,
          },
        ];

      case 'Doctor':
        return [
          ...baseItems,
          {
            name: 'Mis Citas',
            href: '/doctor/appointments',
            icon: Calendar,
          },
          {
            name: 'Mis Pacientes',
            href: '/doctor/patients',
            icon: Heart,
          },
          {
            name: 'Historiales',
            href: '/doctor/clinical-records',
            icon: FileText,
          },
          {
            name: 'Documentos',
            href: '/doctor/documents',
            icon: Folder,
          },
          {
            name: 'Disponibilidad',
            href: '/doctor/availability',
            icon: ClipboardList,
          },
        ];

      case 'Patient':
        return [
          ...baseItems,
          {
            name: 'Mis Citas',
            href: '/patient/appointments',
            icon: Calendar,
          },
          {
            name: 'Buscar Doctores',
            href: '/patient/doctors',
            icon: UserCheck,
          },
          {
            name: 'Mi Historial',
            href: '/patient/clinical-records',
            icon: FileText,
          },
          {
            name: 'Mis Documentos',
            href: '/patient/documents',
            icon: Folder,
          },
        ];

      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="mt-5 flex-1 px-2 space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `sidebar-item ${
                isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
              }`
            }
          >
            <Icon className="mr-3 h-6 w-6" aria-hidden="true" />
            {item.name}
          </NavLink>
        );
      })}

      <div className="pt-4 mt-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="sidebar-item-inactive w-full text-left"
        >
          <LogOut className="mr-3 h-6 w-6" aria-hidden="true" />
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default SidebarNavigation; 