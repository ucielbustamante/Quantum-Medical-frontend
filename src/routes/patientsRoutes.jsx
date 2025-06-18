import { Route } from "react-router-dom";
import { PrivateRoute } from "../components/PrivateRoute";
import { Appointments } from "../pages/appointmentPatient"; 

export function PatientRoutes() {
  return (
    <>
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



