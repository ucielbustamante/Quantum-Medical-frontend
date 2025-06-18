import { Route } from "react-router-dom";
import { PrivateRoute } from "../components/PrivateRoute";
import { NewAppointment } from "../pages/newAppointment";
import { Especialidad } from "../components/especialidad";
import { Medicos } from "../pages/medicos";

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
    </>
  );
}
