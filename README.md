# Quantum Medical Frontend

Sistema de gestión médica frontend desarrollado con React, Vite y Tailwind CSS. Proporciona una interfaz de usuario moderna y responsive para la gestión integral de clínicas médicas con roles diferenciados para administradores, doctores y pacientes.

## Características Principales

### Autenticación y Autorización
- Sistema de login/registro con validación de formularios
- Gestión de roles múltiples (Admin, Doctor, Patient)
- Protección de rutas basada en roles
- Autenticación JWT con manejo de tokens
- Integración con Google OAuth

### Dashboards Específicos por Rol
- **Administrador**: Estadísticas del sistema, gestión completa de usuarios, doctores, pacientes y especialidades
- **Doctor**: Gestión de citas, pacientes asignados, historiales clínicos y documentos médicos
- **Paciente**: Visualización de citas, búsqueda de doctores, acceso a historial personal y documentos

### Gestión de Datos Médicos
- Sistema completo de citas médicas con validación de disponibilidad
- Gestión de historiales clínicos y documentos médicos
- Configuración de disponibilidad de doctores
- Búsqueda y filtrado avanzado de información

## Tecnologías Utilizadas

- **React 18**: Biblioteca de interfaz de usuario
- **Vite**: Build tool rápido y moderno
- **Tailwind CSS**: Framework de CSS utility-first
- **React Router v6**: Enrutamiento de la aplicación
- **React Query**: Gestión de estado del servidor y cache
- **React Hook Form**: Formularios con validación avanzada
- **Axios**: Cliente HTTP para comunicación con API
- **Lucide React**: Iconos modernos y consistentes
- **React Hot Toast**: Sistema de notificaciones

## Estructura del Proyecto

### Organización de Carpetas

```
src/
├── components/          # Componentes reutilizables
│   ├── admin/          # Componentes específicos del administrador
│   │   ├── AppointmentForm.jsx
│   │   ├── ClinicalRecordForm.jsx
│   │   ├── DoctorForm.jsx
│   │   ├── DocumentUploadForm.jsx
│   │   ├── ManageSpecialtiesModal.jsx
│   │   ├── PatientForm.jsx
│   │   ├── SpecialtyForm.jsx
│   │   └── UserForm.jsx
│   ├── auth/           # Componentes de autenticación
│   │   ├── LoginForm.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── RegisterForm.jsx
│   ├── common/         # Componentes comunes
│   │   └── LoadingSpinner.jsx
│   └── layout/         # Componentes de estructura
│       ├── Header.jsx
│       ├── Layout.jsx
│       ├── Sidebar.jsx
│       └── SidebarNavigation.jsx
├── contexts/           # Contextos de React
│   └── AuthContext.jsx # Gestión de estado de autenticación
├── pages/              # Páginas de la aplicación
│   ├── admin/          # Páginas del administrador
│   │   ├── Appointments.jsx
│   │   ├── ClinicalRecords.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Doctors.jsx
│   │   ├── Documents.jsx
│   │   ├── Patients.jsx
│   │   ├── Specialties.jsx
│   │   └── Users.jsx
│   ├── auth/           # Páginas de autenticación
│   │   ├── AuthSuccess.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   ├── doctor/         # Páginas del doctor
│   │   ├── Appointments.jsx
│   │   ├── Availability.jsx
│   │   ├── ClinicalRecords.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Documents.jsx
│   │   └── Patients.jsx
│   └── patient/        # Páginas del paciente
│       ├── Appointments.jsx
│       ├── BookAppointment.jsx
│       ├── ClinicalRecords.jsx
│       ├── Dashboard.jsx
│       ├── Doctors.jsx
│       └── Documents.jsx
├── services/           # Servicios y configuración
│   └── api.js          # Cliente HTTP con interceptores
├── App.jsx            # Componente principal de la aplicación
├── main.jsx           # Punto de entrada
└── index.css          # Estilos globales
```

### Justificación de la Estructura

#### Components
- **admin/**: Componentes específicos para funcionalidades administrativas como formularios de gestión
- **auth/**: Componentes relacionados con autenticación y autorización
- **common/**: Componentes reutilizables en toda la aplicación
- **layout/**: Componentes que definen la estructura visual de la aplicación

#### Contexts
- **AuthContext.jsx**: Maneja el estado global de autenticación, tokens JWT y información del usuario

#### Pages
- **admin/**: Páginas exclusivas para administradores con funcionalidades de gestión completa
- **auth/**: Páginas de autenticación como login, registro y recuperación de contraseña
- **doctor/**: Páginas específicas para doctores con gestión de pacientes y citas
- **patient/**: Páginas para pacientes con acceso a sus datos y agendamiento de citas

#### Services
- **api.js**: Configuración centralizada del cliente HTTP con interceptores para manejo automático de tokens y errores

## Configuración de Estilos

### Variables CSS Globales
```css
:root {
  --primary-color: #3B82F6;
  --secondary-color: #64748B;
  --success-color: #22C55E;
  --warning-color: #F59E0B;
  --danger-color: #EF4444;
  --background-color: #F8FAFC;
  --text-primary: #1E293B;
  --text-secondary: #64748B;
  --border-color: #E2E8F0;
}
```

### Clases de Utilidad Tailwind
```css
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors;
}

.btn-outline {
  @apply border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors;
}

.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.card-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.card-body {
  @apply px-6 py-4;
}

.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
```

## Funcionalidades por Rol

### Administrador
- Dashboard con estadísticas del sistema
- Gestión completa de usuarios (crear, editar, eliminar)
- Administración de doctores y asignación de especialidades
- Gestión de pacientes y sus datos
- Configuración de especialidades médicas
- Gestión de citas médicas
- Administración de historiales clínicos y documentos

### Doctor
- Dashboard personal con citas del día y pacientes recientes
- Gestión de citas asignadas
- Lista de pacientes con acceso a sus historiales
- Creación y edición de historiales clínicos
- Subida y gestión de documentos médicos
- Configuración de disponibilidad horaria

### Paciente
- Dashboard personal con próximas citas
- Visualización de historial médico personal
- Búsqueda de doctores por especialidad
- Agendamiento de citas médicas
- Acceso a documentos médicos personales
- Gestión de citas (ver, cancelar)

## Integración con Backend

### Endpoints Principales
- `/api/auth/*` - Autenticación y autorización
- `/api/users/*` - Gestión de usuarios
- `/api/doctors/*` - Gestión de doctores
- `/api/patients/*` - Gestión de pacientes
- `/api/appointments/*` - Gestión de citas
- `/api/clinical-records/*` - Historiales clínicos
- `/api/clinical-documents/*` - Documentos médicos
- `/api/specialties/*` - Especialidades médicas
- `/api/doctor-specialties/*` - Asociación doctor-especialidad
- `/api/availability/*` - Disponibilidad de doctores

### Manejo de Autenticación
```javascript
// Interceptor automático para tokens JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejo de errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Configuración para Docker

### Variables de Entorno
```env
VITE_API_URL=http://backend
```

### Dockerfile
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Características Responsive
- Sidebar colapsable en dispositivos móviles
- Grids adaptables según el tamaño de pantalla
- Formularios optimizados para interacción táctil
- Tablas con scroll horizontal en pantallas pequeñas

## Manejo de Estado

### React Query
- Cache automático de datos del servidor
- Sincronización en tiempo real
- Manejo de estados de carga y error
- Invalidación automática de cache

### Context API
- Estado global de autenticación
- Información del usuario actual
- Tokens JWT y OAuth

## Validación y Manejo de Errores

### Formularios
- Validación en tiempo real con React Hook Form
- Mensajes de error específicos por campo
- Validación de tipos de archivo para documentos
- Manejo de errores de red y servidor

### Notificaciones
- Sistema de toast notifications
- Mensajes de éxito, error y advertencia
- Auto-dismiss configurable
- Posicionamiento personalizable

## 📄 Licencia

Este proyecto está bajo la Licencia Creative Commons BY-NC-SA 4.0. Ver el archivo [`LICENSE`](LICENSE.txt) para más detalles.

## 👥 Equipo de Desarrollo

### 🧑‍💻 Desarrolladores

| **Uciel Bustamante** | **Nahuel Martínez** | **Micaela Galeano** | **Juan Iturrart** |
|:---:|:---:|:---:|:---:|
| Tech Lead | Backend Developer | Frontend Developer | Frontend Engineer |
| [📧 Contact](mailto:ucibustamante.a@gmail.com) | [📧 Contact](mailto:martinezsnahu@gmail.com) | [📧 Contact](mailto:galeano94mica@gmail.com) | [📧 Contact](mailto:juaniturrart588@gmail.com) | 
[📘 LinkedIn](https://www.linkedin.com/in/uciel-bustamante/) | [📘 LinkedIn](https://www.linkedin.com/in/nahuel-martinez-7b898a218/) | [📘 LinkedIn](https://www.linkedin.com/in/micaela-alejandra-galeano) | [📘 LinkedIn](https://www.linkedin.com/in/juan-ignacio-iturrart-06027b284/) |
### 🤝 Contribuciones

Este proyecto es el resultado del trabajo colaborativo del equipo de desarrollo, donde cada miembro aportó su experiencia y conocimientos para crear una solución integral de gestión médica.

---

**Desarrollado con ❤️ por el equipo de Quantum Medical**