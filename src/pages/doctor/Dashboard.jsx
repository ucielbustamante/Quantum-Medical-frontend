import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Calendar,
  Heart,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  TrendingUp,
  Users,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();

  const { data: appointmentsData, isLoading, error } = useQuery(
    ['doctor-dashboard-data', user?.id],
    async () => {
      if (!user?.id) return { data: [] };
      try {
        const doctorResponse = await api.post('/api/doctors/search', { 
          email: user.email,
          limit: 1 
        });
        
        if (doctorResponse.data.data && doctorResponse.data.data.length > 0) {
          const doctorId = doctorResponse.data.data[0].id;
          const response = await api.get(`/api/doctors/${doctorId}/appointments`);
          return response.data;
        } else {
          console.warn('Doctor not found for user:', user.email);
          return { data: [] };
        }
      } catch (err) {
        console.error('Error getting doctor appointments for dashboard:', err);
        toast.error('No se pudieron cargar los datos del dashboard.');
        return { data: [] };
      }
    },
    { 
      enabled: !!user?.id,
    }
  );

  const {
    stats,
    upcomingAppointments,
    recentPatients
  } = React.useMemo(() => {
    const appointments = appointmentsData?.data || [];
    if (!Array.isArray(appointments)) {
      return { stats: {}, upcomingAppointments: [], recentPatients: [] };
    }

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date).toISOString().split('T')[0];
      return aptDate === today;
    }).length;

    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const weekAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate <= weekFromNow && aptDate >= new Date();
    }).length;

    const patientsMap = new Map();
    appointments.forEach(apt => {
      if (apt.Patient) {
        patientsMap.set(apt.Patient.id, apt.Patient);
      }
    });
    const uniquePatients = Array.from(patientsMap.values());

    return {
      stats: {
        todayAppointments,
        weekAppointments,
        activePatients: uniquePatients.length,
        clinicalRecords: 0,
      },
      upcomingAppointments: appointments.slice(0, 5),
      recentPatients: uniquePatients.slice(0, 5)
    };
  }, [appointmentsData]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      timeZone: 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    if (typeof timeString === 'string' && timeString.includes(':')) {
      return timeString.substring(0, 5);
    }
    return new Date(timeString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />;
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error al cargar el panel</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se pudieron obtener los datos. Por favor, intente de nuevo más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, Dr. {user?.name} {user?.lastname}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Panel de control del doctor - {formatDate(new Date())}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Citas Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.todayAppointments}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pacientes Activos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.activePatients}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Historiales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.clinicalRecords}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Próximos 7 Días</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.weekAppointments}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Próximas Citas</h3>
          </div>
          <div className="card-body">
            {upcomingAppointments.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {upcomingAppointments.map((appointment) => (
                  <li key={appointment.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.Patient?.User?.name} {appointment.Patient?.User?.lastname}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(appointment.date)} - {formatTime(appointment.start_time)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                      {getStatusIcon(appointment.status)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay próximas citas</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No tienes citas programadas en los próximos días.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Pacientes Recientes</h3>
          </div>
          <div className="card-body">
            {recentPatients.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentPatients.map((patient) => (
                  <li key={patient.id} className="py-4 flex items-center space-x-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {patient.User?.name} {patient.User?.lastname}
                      </p>
                      <p className="text-sm text-gray-500">{patient.User?.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pacientes</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aún no tienes pacientes registrados con citas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <Routes>
      <Route index element={<DoctorDashboard />} />
    </Routes>
  );
};

export default Dashboard; 