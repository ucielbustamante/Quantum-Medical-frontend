import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Calendar,
  UserCheck,
  FileText,
  Folder,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Heart,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();

  const { data: profileData, isLoading: profileLoading } = useQuery(
    ['patient-profile'],
    async () => {
      const response = await api.get('/api/rbac/patient/profile');
      return response.data;
    }
  );

  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery(
    ['patient-appointments', profileData?.data?.user?.patient?.id],
    async () => {
      if (!profileData?.data?.user?.patient?.id) {
        throw new Error('Patient ID not available');
      }
      const response = await api.get(`/api/patients/${profileData.data.user.patient.id}/appointments`);
      return response.data;
    },
    { enabled: !!profileData?.data?.user?.patient?.id }
  );

  const { data: recordsData, isLoading: recordsLoading } = useQuery(
    ['patient-clinical-records'],
    async () => {
      try {
        const response = await api.get('/api/clinical-records');
        return response.data;
      } catch (error) {
        console.warn('Error getting clinical records:', error);
        return { data: { records: [] } };
      }
    }
  );

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
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
      case 'completed':
        return 'text-blue-600 bg-blue-100';
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
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (profileLoading || appointmentsLoading || recordsLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />;
  }

  const patient = profileData?.data?.user;
  const appointments = appointmentsData?.data || [];
  const records = recordsData?.data?.records || [];

  const totalAppointments = appointments.length;
  const upcomingAppointments = appointments.filter(apt => 
    apt.status !== 'cancelled' && new Date(apt.date) > new Date()
  ).length;
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
  const totalRecords = records.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {patient?.name} {patient?.lastname}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Panel de control del paciente - {formatDate(new Date())}
        </p>
      </div>

      {/* Patient Info Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Mi Información</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {patient?.name} {patient?.lastname}
                </h4>
                <p className="text-sm text-gray-500">Paciente</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <span>{patient?.email}</span>
              </div>
              {patient?.dni && (
                <div className="flex items-center text-sm text-gray-600">
                  <UserCheck className="h-4 w-4 mr-2 text-gray-400" />
                  <span>DNI: {patient.dni}</span>
                </div>
              )}
              {patient?.patient?.birth_date && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Nacimiento: {formatDate(patient.patient.birth_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Próximas Citas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {upcomingAppointments}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Citas Completadas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {completedAppointments}
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
                {totalRecords}
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
              <p className="text-sm font-medium text-gray-500">Total Citas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalAppointments}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Citas */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Próximas Citas</h3>
            <a href="/patient/appointments" className="text-sm text-blue-600 hover:text-blue-500">
              Ver todas
            </a>
          </div>
          <div className="card-body">
            {upcomingAppointments > 0 ? (
              <div className="space-y-4">
                {appointments
                  .filter(apt => apt.status !== 'cancelled' && new Date(apt.date) > new Date())
                  .slice(0, 5)
                  .map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <UserCheck className="h-8 w-8 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Dr. {appointment.Doctor?.User?.name} {appointment.Doctor?.User?.lastname}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(appointment.date)} - {formatTime(appointment.start_time)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.Doctor?.Specialties?.[0]?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1">{getStatusText(appointment.status)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas próximas</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No tienes citas programadas próximamente.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Historiales Recientes */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Historiales Recientes</h3>
            <a href="/patient/clinical-records" className="text-sm text-blue-600 hover:text-blue-500">
              Ver todos
            </a>
          </div>
          <div className="card-body">
            {records.length > 0 ? (
              <div className="space-y-4">
                {records.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <FileText className="h-8 w-8 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {record.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(record.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {record.body?.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {record.ClinicalDocuments?.length || 0} docs
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay historiales</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No tienes historiales clínicos registrados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Acciones Rápidas</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/patient/appointments"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Calendar className="h-6 w-6 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-blue-900">Mis Citas</span>
            </a>
            
            <a
              href="/patient/doctors"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <UserCheck className="h-6 w-6 text-green-600 mr-3" />
              <span className="text-sm font-medium text-green-900">Buscar Doctores</span>
            </a>
            
            <a
              href="/patient/clinical-records"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <FileText className="h-6 w-6 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-purple-900">Mi Historial</span>
            </a>
            
            <a
              href="/patient/documents"
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Folder className="h-6 w-6 text-orange-600 mr-3" />
              <span className="text-sm font-medium text-orange-900">Mis Documentos</span>
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {appointments.length > 0 || records.length > 0 ? (
              <>
                {appointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        Cita con Dr. {appointment.Doctor?.User?.name} {appointment.Doctor?.User?.lastname} - {getStatusText(appointment.status)}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(appointment.date)}</p>
                    </div>
                  </div>
                ))}
                {records.slice(0, 2).map((record) => (
                  <div key={record.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        Historial actualizado: {record.title}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(record.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay actividad reciente</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No se ha registrado actividad en las últimas semanas.
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
      <Route index element={<PatientDashboard />} />
    </Routes>
  );
};

export default Dashboard; 