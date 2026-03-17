import type { FormData, SubmissionResult, Stats, SubmissionListItem } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erreur réseau" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Public ────────────────────────────────────────────────────────────────

export async function submitForm(data: FormData): Promise<SubmissionResult> {
  return apiFetch<SubmissionResult>("/api/submissions/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export async function login(username: string, password: string) {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);

  const res = await fetch(`${API_URL}/api/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Identifiants incorrects" }));
    throw new Error(err.detail || "Erreur de connexion");
  }

  return res.json();
}

// ─── Admin ─────────────────────────────────────────────────────────────────

export async function fetchStats(token: string): Promise<Stats> {
  return apiFetch<Stats>("/api/admin/stats", {}, token);
}

export async function fetchSubmissions(
  token: string,
  params?: { level?: string; reviewed?: boolean; skip?: number }
): Promise<{ total: number; items: SubmissionListItem[] }> {
  const qs = new URLSearchParams();
  if (params?.level) qs.set("level", params.level);
  if (params?.reviewed !== undefined) qs.set("reviewed", String(params.reviewed));
  if (params?.skip) qs.set("skip", String(params.skip));
  return apiFetch(`/api/admin/submissions?${qs}`, {}, token);
}

export async function fetchSubmissionDetail(token: string, id: number) {
  return apiFetch(`/api/admin/submissions/${id}`, {}, token);
}

export async function updateSubmission(
  token: string,
  id: number,
  payload: { notes_admin?: string; reviewed?: boolean }
) {
  return apiFetch(`/api/admin/submissions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, token);
}
