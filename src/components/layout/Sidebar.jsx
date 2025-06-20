import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SidebarNavigation from './SidebarNavigation';
import quantumLogo from '../../assets/quantum.svg';

const Sidebar = ({ open, setOpen }) => {
  const { user } = useAuth();

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
    <>
      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-gray-800">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    src={quantumLogo}
                    alt="Quantum Medical Logo"
                    className="h-8 w-8 text-white"
                  />
                </div>
                <div className="ml-3">
                  <h1 className="text-white text-lg font-semibold">Quantum Medical</h1>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <SidebarNavigation />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar para mobile */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 md:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-800">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                  <div className="flex-shrink-0 flex items-center px-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          src={quantumLogo}
                          alt="Quantum Medical Logo"
                          className="h-8 w-8 text-white"
                        />
                      </div>
                      <div className="ml-3">
                        <h1 className="text-white text-lg font-semibold">Quantum Medical</h1>
                      </div>
                    </div>
                  </div>
                  <SidebarNavigation />
                </div>
                <div className="flex flex-shrink-0 bg-gray-700 p-4">
                  <div className="flex items-center">
                    <div>
                      <div className={`inline-flex h-8 w-8 rounded-full ${getRoleColor()} items-center justify-center`}>
                        <span className="text-sm font-medium leading-none text-white">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs font-medium text-gray-300">{getRoleName()}</p>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0" aria-hidden="true">
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default Sidebar; 