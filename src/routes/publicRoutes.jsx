import { Route } from "react-router-dom";
import { PrivateRoute } from "../components/PrivateRoute";
import { NewAppointment } from "../pages/newAppointment";
import { Especialidad } from "../components/especialidad";
import { Medicos } from "../pages/medicos";
import { AllPatients } from "../pages/allPatients";

export function PublicRoutes() {
  return (
    <>
      <Route path="/especialidad" element={<Especialidad />} />
      <Route path="/medicos" element={<Medicos />} />
      <Route
        path="/appointment"
        element={
          <PrivateRoute allowedRoles={["Admin", "Patient"]}>
            <NewAppointment />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/all-patients"
        element={
          <PrivateRoute allowedRoles={["Admin", "Patient"]}>
            <AllPatients />
          </PrivateRoute>
         }
     />
    </>
  );
}
