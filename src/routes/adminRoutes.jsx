import { Route } from "react-router-dom";
import { PrivateRoute } from "../components/PrivateRoute";
import { Turnos } from "../pages/turnos";
import { Medicos } from "../pages/medicos";
import { Especialidad } from "../components/especialidad";
import { NuevoMedico } from "../pages/newMedic";
import { DashboardAdmin } from "../pages/dashboardAdmin";
import { NewUser } from "../pages/newUser";
import { AllUsers } from "../pages/allUsers";
import { NewEspecialty } from "../pages/newEspecialities";
import { FindDoctorByEmail } from "../components/FindDoctorByEmail";
import { EditarMedico } from "../pages/editMedic";
import { AllPatients } from "../pages/allPatients";
import { NewPatient } from "../pages/newPatients";

export function AdminRoutes() {
  return (
    <>
      <Route path="/turnos" element={<Turnos />} />
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
        path="/admin/all-patients"
        element={
          <PrivateRoute allowedRoles={["Admin"]}>
            <AllPatients />
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
        path="/admin/doctors/edit/:id"
        element={
          <PrivateRoute allowedRole={["Admin"]}>
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
