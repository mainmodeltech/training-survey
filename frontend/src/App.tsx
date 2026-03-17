import { useState, useEffect } from "react";
import FormPage from "./pages/FormPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import type { AuthState } from "./types";

type View = "form" | "admin-login" | "admin-dashboard";

export default function App() {
  const [view, setView] = useState<View>("form");
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null });

  useEffect(() => {
    const saved = localStorage.getItem("coraf_token");
    const savedUser = localStorage.getItem("coraf_user");
    if (saved && savedUser) {
      setAuth({ token: saved, user: JSON.parse(savedUser) });
      if (window.location.hash === "#admin") setView("admin-dashboard");
    }
    if (window.location.hash === "#admin") {
      setView(saved ? "admin-dashboard" : "admin-login");
    }
  }, []);

  const handleLogin = (token: string, user: { username: string; is_superadmin: boolean }) => {
    localStorage.setItem("coraf_token", token);
    localStorage.setItem("coraf_user", JSON.stringify(user));
    setAuth({ token, user });
    setView("admin-dashboard");
    window.location.hash = "#admin";
  };

  const handleLogout = () => {
    localStorage.removeItem("coraf_token");
    localStorage.removeItem("coraf_user");
    setAuth({ token: null, user: null });
    setView("form");
    window.location.hash = "";
  };

  if (view === "admin-login") {
    return <AdminLogin onLogin={handleLogin} onBack={() => { setView("form"); window.location.hash = ""; }} />;
  }

  if (view === "admin-dashboard" && auth.token) {
    return <AdminDashboard token={auth.token} user={auth.user!} onLogout={handleLogout} />;
  }

  return (
    <FormPage onAdminClick={() => { setView("admin-login"); window.location.hash = "#admin"; }} />
  );
}
