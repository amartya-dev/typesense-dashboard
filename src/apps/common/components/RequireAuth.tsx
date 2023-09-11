import { AuthUtils } from "apps/auth/utils";
import { Navigate } from "react-router-dom";

interface RequireAuthProps {
  children: JSX.Element;
  redirectTo: string;
}

export const RequireAuth = ({ children, redirectTo }: RequireAuthProps) => {
  if (AuthUtils.isLoggedIn()) {
    return children;
  }
  return <Navigate to={redirectTo} />;
};
