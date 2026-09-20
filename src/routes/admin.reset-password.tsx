import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/reset-password")({
  head: () => ({
    meta: [{ title: "Admin Password Reset — CareerSetu AI" }],
  }),
  component: () => <Navigate to="/admin/forgot-password" />,
});
