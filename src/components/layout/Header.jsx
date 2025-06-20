import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Menu as MenuIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const getRoleColor = () => {
    switch (user?.role) {
      case 'Admin':
        return 'bg-red-600';
      case 'Doctor':
        return 'bg-blue-600';
      case 'Patient':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getRoleName = () => {
    switch (user?.role) {
      case 'Admin':
        return 'Administrador';
      case 'Doctor':
        return 'Doctor';
      case 'Patient':
        return 'Paciente';
      default:
        return 'Usuario';
    }
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <MenuIcon className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Quantum Medical</h1>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <Menu as="div" className="ml-3 relative">
            <div>
              <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <span className="sr-only">Open user menu</span>
                <div className={`h-8 w-8 rounded-full ${getRoleColor()} flex items-center justify-center`}>
                  <span className="text-sm font-medium leading-none text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-gray-500">{user?.email}</div>
                      <div className="text-xs text-gray-400 mt-1">{getRoleName()}</div>
                    </div>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex px-4 py-2 text-sm text-gray-700 w-full text-left`}
                    >
                      Cerrar Sesión
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default Header; 