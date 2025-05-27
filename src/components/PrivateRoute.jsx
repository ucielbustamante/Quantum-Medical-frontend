import { Navigate } from "react-router-dom";

export function PrivateRoute({ children, allowedRole }) {
  const role = localStorage.getItem("rol");

if (!role) {
  return <Navigate to="/login" replace />;
}

if (allowedRole && !allowedRole.includes(role)) {
  return <Navigate to="/login" replace />;
}

return children;
}
