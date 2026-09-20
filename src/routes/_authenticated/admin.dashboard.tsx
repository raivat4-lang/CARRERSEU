import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { verifyAdminAccessServerFn } from "@/lib/auth/auth.functions";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  beforeLoad: async () => {
    let token = "";
    if (typeof localStorage !== "undefined") {
      token = localStorage.getItem("careersetu_admin_token") || "";
    }
    const verifyResult = await verifyAdminAccessServerFn({ data: { token } });
    if (!verifyResult.authorized) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminDashboardRedirect,
});

function AdminDashboardRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/admin" as any, replace: true });
  }, [navigate]);
  return null;
}

