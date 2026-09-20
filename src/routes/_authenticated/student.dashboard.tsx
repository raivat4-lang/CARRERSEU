import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/student/dashboard")({
  component: StudentDashboardRedirect,
});

function StudentDashboardRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/dashboard" as any, replace: true });
  }, [navigate]);
  return null;
}
