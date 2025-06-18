import { Route } from "react-router-dom";
import { PrivateRoute } from "../components/PrivateRoute";
import { Appointments } from "../pages/appointmentPatient";
import { DashboardPatients } from "../pages/dashboardPatients"; 
import PatientClinicalRecords from "../pages/patientClinicalRecords";
import ViewClinicalRecord from "../pages/viewClinicalRecord";

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
      <Route
        path="/patient/clinical-records"
        element={
          <PrivateRoute allowedRoles={["Patient"]}>
            <PatientClinicalRecords />
          </PrivateRoute>
        }
      />
      <Route
        path="/patient/clinical-records/:recordId"
        element={
          <PrivateRoute allowedRoles={["Patient"]}>
            <ViewClinicalRecord />
          </PrivateRoute>
        }
      />
    </>
  );
}



