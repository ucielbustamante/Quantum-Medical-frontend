import { Route } from "react-router-dom";
import { PrivateRoute } from "../components/PrivateRoute";
import { Turnos } from "../pages/turnosPatientAdmin";
import { Medicos } from "../pages/medicos";
import { Especialidad } from "../components/especialidad";
import { NuevoMedico } from "../pages/newMedic";
import { DashboardAdmin } from "../pages/dashboardAdmin";
import { NewUser } from "../pages/newUser";
import { AllUsers } from "../pages/allUsers";
import { NewEspecialty } from "../pages/newEspecialities";
import { AllSpecialties } from "../pages/allSpecialties";
import { FindDoctorByEmail } from "../components/FindDoctorByEmail";
import { EditarMedico } from "../pages/editMedic";
import { NewPatient } from "../pages/newPatients";
import { EditPatient } from "../pages/editPatient";
import AllClinicalRecords from "../pages/allClinicalRecords";
import NewClinicalRecord from "../pages/newClinicalRecord";
import ViewClinicalRecord from "../pages/viewClinicalRecord";
import EditClinicalRecord from "../pages/editClinicalRecord";

export function AdminRoutes() {
  return (
    <>
      <Route path="/medicos" element={<Medicos />} />
      <Route path="/especialidad" element={<Especialidad />} />
      <Route path="/formulario-medico" element={<NuevoMedico />} />

      <Route
        path="/dashboard-admin"
        element={
          <PrivateRoute allowedRoles={["Admin"]}>
            <DashboardAdmin />
          </PrivateRoute>
        }
      />

      <Route
        path="/users"
        element={
          <PrivateRoute allowedRoles={["Admin"]}>
            <NewUser />
          </PrivateRoute>
        }
      />

      <Route
        path="/users/all-users"
        element={
          <PrivateRoute allowedRoles={["Admin"]}>
            <AllUsers />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/new-patient"
        element={
          <PrivateRoute allowedRoles={["Admin"]}>
            <NewPatient />
          </PrivateRoute>
        }
      
      />

      <Route 
        path="/admin/patients/edit/:id"
        element={
          <PrivateRoute allowedRoles={["Admin"]}>
            <EditPatient />
          </PrivateRoute>
        }
      />

      <Route 
        path="/admin/patients/:id/turnos"
        element={
          <PrivateRoute allowedRoles={["Admin"]}>
            <Turnos />
          </PrivateRoute>
        }
      />
      
      <Route 
        path="/admin/doctors/edit/:id"
        element={
          <PrivateRoute allowedRoles={["Admin"]}>
            <EditarMedico/>
          </PrivateRoute>
        }
      />

      <Route
        path="/specialities"
        element={
          <PrivateRoute allowedRoles={["Admin"]}>
            <NewEspecialty />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/specialties"
        element={
          <PrivateRoute allowedRoles={["Admin"]}>
            <AllSpecialties />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/new-specialty"
        element={
          <PrivateRoute allowedRoles={["Admin"]}>
            <NewEspecialty />
          </PrivateRoute>
        }
      />

      {/* Rutas de Registros Clínicos */}
      <Route
        path="/admin/clinical-records"
        element={
          <PrivateRoute allowedRoles={["Admin", "Doctor"]}>
            <AllClinicalRecords />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/new-clinical-record"
        element={
          <PrivateRoute allowedRoles={["Admin", "Doctor"]}>
            <NewClinicalRecord />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/new-clinical-record/:patientId"
        element={
          <PrivateRoute allowedRoles={["Admin", "Doctor"]}>
            <NewClinicalRecord />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/clinical-records/:id"
        element={
          <PrivateRoute allowedRoles={["Admin", "Doctor"]}>
            <ViewClinicalRecord />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/clinical-records/:id/edit"
        element={
          <PrivateRoute allowedRoles={["Admin", "Doctor"]}>
            <EditClinicalRecord />
          </PrivateRoute>
        }
      />

      <Route
        path="/email"
        element={
          <PrivateRoute allowedRoles={["Admin"]}>
            <FindDoctorByEmail />
          </PrivateRoute>
        }
      />
    </>
  );
}
