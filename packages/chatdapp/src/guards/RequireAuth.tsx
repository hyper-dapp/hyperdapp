import { Navigate, useLocation } from "react-router-dom";
import { useMoralis } from "react-moralis";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useMoralis();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
