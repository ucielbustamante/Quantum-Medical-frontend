import { Route } from "react-router-dom";
import { PrivateRoute } from "../components/PrivateRoute";
import { Turnos } from "../pages/turnos";
import { AllUsers } from "../pages/allUsers";
import { DashboardDoctors } from "../pages/dashboardDoctor";

export function DoctorsRoutes() {
  return (
    <>
      <Route path="/turnos" element={<Turnos />} />

      <Route
        path="/dashboard-doctors"
        element={
          <PrivateRoute allowedRoles={["Doctor"]}>
            <DashboardDoctors />
          </PrivateRoute>
        }
      />

      <Route
        path="/turnos"
        element={
          <PrivateRoute allowedRoles={["Doctor"]}>
            <Turnos />
          </PrivateRoute>
        }
      />

      <Route
        path="/users/all-users"
        element={
          <PrivateRoute allowedRoles={["Doctor"]}>
            <AllUsers />
          </PrivateRoute>
        }
      />
      
    </>
  );
}