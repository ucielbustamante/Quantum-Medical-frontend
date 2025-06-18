import { Route } from "react-router-dom";
import { PrivateRoute } from "../components/PrivateRoute";
import { Appointments } from "../pages/appointmentPatient";
import { DashboardPatients } from "../pages/dashboardPatients"; 

export function PatientRoutes() {
  return (
    <>
      <Route
        path="/patient/dashboard"
        element={
          <PrivateRoute allowedRoles={["Patient"]}>
            <DashboardPatients />
          </PrivateRoute>
        }
      />
      <Route
        path="/mis-turnos"
        element={
          <PrivateRoute allowedRoles={["Doctor", "Patient"]}>
            <Appointments />
          </PrivateRoute>
        }
      />
      
    </>
  );
}



