import { useState } from "react";
import { login } from "../services/api";

interface Props {
  onLogin: (token: string, user: { username: string; is_superadmin: boolean }) => void;
  onBack: () => void;
}

export default function AdminLogin({ onLogin, onBack }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Veuillez renseigner tous les champs.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await login(username, password);
      onLogin(data.access_token, { username: data.username, is_superadmin: data.is_superadmin });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-logo">MT</span>
          <div>
            <div className="brand-name">Model Technologie</div>
            <div className="brand-tagline">Espace Administration</div>
          </div>
        </div>

        <h1 className="login-title">Connexion</h1>
        <p className="login-sub">Accès réservé à l'équipe Model Technologie</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field-group">
            <label className="field-label">Identifiant</label>
            <input
              className="field-input"
              type="text"
              placeholder="admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="field-group">
            <label className="field-label">Mot de passe</label>
            <input
              className="field-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter →"}
          </button>
        </form>

        <button className="btn-back-link" onClick={onBack}>
          ← Retour au formulaire
        </button>
      </div>
    </div>
  );
}
