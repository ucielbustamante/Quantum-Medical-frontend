import { Route } from "react-router-dom";
import { PrivateRoute } from "../components/PrivateRoute";
import { AppointmentsDoctor } from "../pages/appointmentsDoctor";
// import { AllUsers } from "../pages/allUsers";
import { DashboardDoctors } from "../pages/dashboardDoctor";

export function DoctorsRoutes() {
  return (
    <>
      {/* <Route path="/turnos" element={<Turnos />} /> */}

      <Route
        path="/dashboard-doctors"
        element={
          <PrivateRoute allowedRoles={["Doctor"]}>
            <DashboardDoctors />
          </PrivateRoute>
        }
      />

      <Route
        path="/appoinments-doctors"
        element={
          <PrivateRoute allowedRoles={["Doctor"]}>
            <AppointmentsDoctor />
          </PrivateRoute>
        }
      />

      {/* <Route
        path="/users/all-users"
        element={
          <PrivateRoute allowedRoles={["Doctor"]}>
            <AllUsers />
          </PrivateRoute>
        }
      /> */}
      
    </>
  );
}