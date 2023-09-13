import { Navigate, useRoutes } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { IndexList } from "apps/index/pages/IndexList";
import { Login } from "apps/auth/pages/Login";
import { EmptyLayout } from "./layouts/EmptyLayout";
import { AddIndex } from "apps/index/pages/AddIndex";
import { DocumentsList } from "apps/index/pages/DocumentsList";
import { AnalyticsRules } from "apps/analytics/pages/Rules";
import { Reports } from "apps/analytics/pages/Reports";
import { CreateApiKey } from "apps/apiKeys/pages/Create";
import { ApiKeysList } from "apps/apiKeys/pages/List";

export const Routes = () => {
  return useRoutes([
    {
      path: "/index",
      element: (
        <RequireAuth redirectTo="/login">
          <DashboardLayout />
        </RequireAuth>
      ),
      children: [
        { path: "list", element: <IndexList /> },
        { path: "add", element: <AddIndex /> },
        { path: "documents", element: <DocumentsList /> },
      ],
    },
    {
      path: "/observe",
      element: (
        <RequireAuth redirectTo="/login">
          <DashboardLayout />
        </RequireAuth>
      ),
      children: [
        { path: "rules", element: <AnalyticsRules /> },
        { path: "reports", element: <Reports /> },
      ],
    },
    {
      path: "/keys",
      element: (
        <RequireAuth redirectTo="/login">
          <DashboardLayout />
        </RequireAuth>
      ),
      children: [
        { path: "list", element: <ApiKeysList /> },
        { path: "add", element: <CreateApiKey /> },
      ],
    },
    {
      path: "/",
      element: <EmptyLayout />,
      children: [
        { path: "login", element: <Login /> },
        { path: "/", element: <Navigate to="/index/list" /> },
      ],
    },
  ]);
};
