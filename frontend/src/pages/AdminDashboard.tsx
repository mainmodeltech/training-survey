import { useState, useEffect, useCallback } from "react";
import { fetchStats, fetchSubmissions, fetchSubmissionDetail, updateSubmission } from "../services/api";
import type { Stats, SubmissionListItem, AdminUser } from "../types";

interface Props {
  token: string;
  user: AdminUser;
  onLogout: () => void;
}

type Tab = "dashboard" | "submissions" | "detail";

interface SubmissionDetail {
  id: number;
  full_name: string;
  position: string;
  department: string;
  location: string;
  self_level: string;
  features_usage: Record<string, string>;
  file_size: string | null;
  daily_tasks: string[];
  daily_time: string;
  difficulties: string[];
  difficulty_details: string | null;
  motivation: string;
  expected_results: string[];
  ambition_level: string;
  preferred_duration: string;
  preferred_modality: string;
  has_computer: string | null;
  concrete_case: string | null;
  additional_comments: string | null;
  computed_level: string;
  score_total: number;
  score_breakdown: Record<string, number> | null;
  reviewed: boolean;
  notes_admin: string | null;
  created_at: string;
}

export default function AdminDashboard({ token, user, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>("");
  const [filterReviewed, setFilterReviewed] = useState<string>("");
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try { setStats(await fetchStats(token)); }
    catch { /* handled */ }
    finally { setLoadingStats(false); }
  }, [token]);

  const loadSubmissions = useCallback(async () => {
    setLoadingSubs(true);
    try {
      const params: { level?: string; reviewed?: boolean } = {};
      if (filterLevel) params.level = filterLevel;
      if (filterReviewed !== "") params.reviewed = filterReviewed === "true";
      const res = await fetchSubmissions(token, params);
      setSubmissions(res.items);
      setTotal(res.total);
    } catch { /* handled */ }
    finally { setLoadingSubs(false); }
  }, [token, filterLevel, filterReviewed]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (tab === "submissions") loadSubmissions(); }, [tab, loadSubmissions]);

  const openDetail = async (id: number) => {
    const d = await fetchSubmissionDetail(token, id) as SubmissionDetail;
    setDetail(d);
    setSelectedId(id);
    setAdminNote(d.notes_admin ?? "");
    setTab("detail");
  };

  const saveNote = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await updateSubmission(token, selectedId, { notes_admin: adminNote, reviewed: true });
      setDetail(d => d ? { ...d, reviewed: true, notes_admin: adminNote } : d);
    } finally { setSaving(false); }
  };

  const levelColor = (level: string) => level === "B" ? "#1D9E75" : "#1B3A5C";

  return (
      <div className="admin-wrap">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-brand">
            <span className="brand-logo">MT</span>
            <div>
              <div className="brand-name">Model Tech.</div>
              <div className="brand-tagline">Administration</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button className={`sidebar-item ${tab === "dashboard" ? "sidebar-item--active" : ""}`} onClick={() => setTab("dashboard")}>
              <span className="sidebar-icon">📊</span> Tableau de bord
            </button>
            <button className={`sidebar-item ${tab === "submissions" || tab === "detail" ? "sidebar-item--active" : ""}`} onClick={() => setTab("submissions")}>
              <span className="sidebar-icon">📋</span> Formulaires
            </button>
          </nav>

          <div className="sidebar-user">
            <div className="sidebar-user-name">{user.username}</div>
            {user.is_superadmin && <div className="sidebar-user-role">Super-admin</div>}
            <button className="btn-logout" onClick={onLogout}>Déconnexion</button>
          </div>
        </aside>

        {/* Main */}
        <main className="admin-main">

          {/* DASHBOARD */}
          {tab === "dashboard" && (
              <div className="admin-content">
                <div className="admin-page-header">
                  <h1 className="admin-page-title">Tableau de bord</h1>
                  <p className="admin-page-sub">Vue d'ensemble des réponses CORAF</p>
                  <button className="btn-refresh" onClick={loadStats}>↻ Actualiser</button>
                </div>

                {loadingStats && <div className="admin-loading">Chargement…</div>}

                {stats && (
                    <>
                      <div className="kpi-grid">
                        <div className="kpi-card">
                          <div className="kpi-value">{stats.total_submissions}</div>
                          <div className="kpi-label">Formulaires reçus</div>
                        </div>
                        <div className="kpi-card kpi-card--green">
                          <div className="kpi-value">{stats.level_a_count}</div>
                          <div className="kpi-label">Curriculat A</div>
                          <div className="kpi-sub">Excel Opérationnel</div>
                        </div>
                        <div className="kpi-card kpi-card--blue">
                          <div className="kpi-value">{stats.level_b_count}</div>
                          <div className="kpi-label">Curriculat B</div>
                          <div className="kpi-sub">Excel Avancé</div>
                        </div>
                        <div className="kpi-card kpi-card--orange">
                          <div className="kpi-value">{stats.pending_count}</div>
                          <div className="kpi-label">À traiter</div>
                        </div>
                        <div className="kpi-card">
                          <div className="kpi-value">{stats.avg_score}</div>
                          <div className="kpi-label">Score moyen /100</div>
                        </div>
                      </div>

                      <div className="charts-grid">
                        <div className="chart-card">
                          <h3 className="chart-title">Répartition par niveau déclaré</h3>
                          {stats.by_self_level.map(({ level, count }) => (
                              <div key={level} className="bar-row">
                                <span className="bar-label">{level}</span>
                                <div className="bar-track">
                                  <div className="bar-fill" style={{ width: `${stats.total_submissions ? (count / stats.total_submissions) * 100 : 0}%`, background: "#1B3A5C" }} />
                                </div>
                                <span className="bar-count">{count}</span>
                              </div>
                          ))}
                        </div>

                        <div className="chart-card">
                          <h3 className="chart-title">Modalités préférées</h3>
                          {stats.by_modality.map(({ modality, count }) => (
                              <div key={modality} className="bar-row">
                                <span className="bar-label" style={{ fontSize: "11px" }}>{modality.slice(0, 35)}{modality.length > 35 ? "…" : ""}</span>
                                <div className="bar-track">
                                  <div className="bar-fill" style={{ width: `${stats.total_submissions ? (count / stats.total_submissions) * 100 : 0}%`, background: "#E8440A" }} />
                                </div>
                                <span className="bar-count">{count}</span>
                              </div>
                          ))}
                        </div>

                        <div className="chart-card">
                          <h3 className="chart-title">Durées souhaitées</h3>
                          {stats.by_duration.map(({ duration, count }) => (
                              <div key={duration} className="bar-row">
                                <span className="bar-label" style={{ fontSize: "11px" }}>{duration.slice(0, 25)}{duration.length > 25 ? "…" : ""}</span>
                                <div className="bar-track">
                                  <div className="bar-fill" style={{ width: `${stats.total_submissions ? (count / stats.total_submissions) * 100 : 0}%`, background: "#1D9E75" }} />
                                </div>
                                <span className="bar-count">{count}</span>
                              </div>
                          ))}
                        </div>
                      </div>
                    </>
                )}
              </div>
          )}

          {/* SUBMISSIONS LIST */}
          {tab === "submissions" && (
              <div className="admin-content">
                <div className="admin-page-header">
                  <h1 className="admin-page-title">Formulaires reçus</h1>
                  <p className="admin-page-sub">{total} réponse{total > 1 ? "s" : ""} au total</p>
                </div>

                <div className="filter-bar">
                  <select className="filter-select" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                    <option value="">Tous les niveaux</option>
                    <option value="A">Curriculat A</option>
                    <option value="B">Curriculat B</option>
                  </select>
                  <select className="filter-select" value={filterReviewed} onChange={e => setFilterReviewed(e.target.value)}>
                    <option value="">Tous les statuts</option>
                    <option value="false">À traiter</option>
                    <option value="true">Traités</option>
                  </select>
                  <button className="btn-refresh" onClick={loadSubmissions}>↻ Filtrer</button>
                </div>

                {loadingSubs && <div className="admin-loading">Chargement…</div>}

                <div className="subs-table-wrap">
                  <table className="subs-table">
                    <thead>
                    <tr>
                      <th>#</th>
                      <th>Nom</th>
                      <th>Poste</th>
                      <th>Département</th>
                      <th>Niveau</th>
                      <th>Score</th>
                      <th>Durée souhaitée</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {submissions.map(s => (
                        <tr key={s.id} className={s.reviewed ? "row--reviewed" : ""}>
                          <td className="td-id">{s.id}</td>
                          <td className="td-name">{s.full_name}</td>
                          <td className="td-pos">{s.position}</td>
                          <td>{s.department}</td>
                          <td>
                        <span className="level-pill" style={{ background: levelColor(s.computed_level) }}>
                          {s.computed_level}
                        </span>
                          </td>
                          <td>
                            <div className="score-bar-wrap">
                              <div className="score-bar-track">
                                <div className="score-bar-fill" style={{ width: `${s.score_total}%` }} />
                              </div>
                              <span>{s.score_total}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: "12px" }}>{s.preferred_duration.slice(0, 20)}…</td>
                          <td>
                        <span className={`status-pill ${s.reviewed ? "status-pill--done" : "status-pill--pending"}`}>
                          {s.reviewed ? "Traité" : "En attente"}
                        </span>
                          </td>
                          <td>
                            <button className="btn-view" onClick={() => openDetail(s.id)}>Voir →</button>
                          </td>
                        </tr>
                    ))}
                    {!loadingSubs && submissions.length === 0 && (
                        <tr><td colSpan={9} className="td-empty">Aucun formulaire trouvé.</td></tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
          )}

          {/* DETAIL */}
          {tab === "detail" && detail && (
              <div className="admin-content">
                <button className="btn-back" onClick={() => setTab("submissions")}>← Retour à la liste</button>

                <div className="detail-header">
                  <div>
                    <h1 className="admin-page-title">{detail.full_name}</h1>
                    <p className="admin-page-sub">{detail.position} · {detail.department} · {detail.location}</p>
                  </div>
                  <div className="detail-badges">
                <span className="level-pill" style={{ background: levelColor(detail.computed_level), fontSize: "14px", padding: "6px 16px" }}>
                  Curriculat {detail.computed_level}
                </span>
                    <span className="score-badge">Score : {detail.score_total}/100</span>
                  </div>
                </div>

                <div className="detail-grid">
                  <div className="detail-section">
                    <h3 className="detail-section-title">Niveau & fonctionnalités</h3>
                    <div className="detail-row"><span>Niveau déclaré</span><strong>{detail.self_level}</strong></div>
                    <div className="detail-row"><span>Taille fichiers</span><strong>{detail.file_size ?? "—"}</strong></div>
                    <div className="detail-features">
                      {Object.entries(detail.features_usage ?? {}).map(([f, u]) => (
                          <div key={f} className={`feature-badge feature-badge--${u}`}>
                            <span>{f.slice(0, 28)}{f.length > 28 ? "…" : ""}</span>
                            <strong>{u}</strong>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3 className="detail-section-title">Usage quotidien</h3>
                    <div className="detail-row"><span>Temps / jour</span><strong>{detail.daily_time}</strong></div>
                    <div className="detail-tags">
                      {(detail.daily_tasks ?? []).map((t, i) => <span key={i} className="detail-tag">{t}</span>)}
                    </div>
                    <h4 className="detail-sub-title">Difficultés</h4>
                    <div className="detail-tags">
                      {(detail.difficulties ?? []).map((d, i) => <span key={i} className="detail-tag detail-tag--red">{d}</span>)}
                    </div>
                    {detail.difficulty_details && (
                        <div className="detail-note">{detail.difficulty_details}</div>
                    )}
                  </div>

                  <div className="detail-section">
                    <h3 className="detail-section-title">Ambitions</h3>
                    <div className="detail-row"><span>Motivation</span><strong>{detail.motivation}</strong></div>
                    <div className="detail-row"><span>Ambition</span><strong>{detail.ambition_level}</strong></div>
                    <h4 className="detail-sub-title">Résultats attendus</h4>
                    <div className="detail-tags">
                      {(detail.expected_results ?? []).map((r, i) => <span key={i} className="detail-tag detail-tag--green">{r}</span>)}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3 className="detail-section-title">Modalités</h3>
                    <div className="detail-row"><span>Durée</span><strong>{detail.preferred_duration}</strong></div>
                    <div className="detail-row"><span>Format</span><strong>{detail.preferred_modality}</strong></div>
                    <div className="detail-row"><span>Ordinateur</span><strong>{detail.has_computer ?? "—"}</strong></div>
                    {detail.concrete_case && (
                        <>
                          <h4 className="detail-sub-title">Cas concret</h4>
                          <div className="detail-note">{detail.concrete_case}</div>
                        </>
                    )}
                    {detail.additional_comments && (
                        <>
                          <h4 className="detail-sub-title">Remarques</h4>
                          <div className="detail-note">{detail.additional_comments}</div>
                        </>
                    )}
                  </div>
                </div>

                {/* Admin note */}
                <div className="admin-note-card">
                  <h3 className="detail-section-title">Notes internes (Model Technologie)</h3>
                  <textarea
                      className="field-textarea"
                      placeholder="Observations, décisions, suivi commercial…"
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      rows={4}
                  />
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <button className="btn-submit" onClick={saveNote} disabled={saving}>
                      {saving ? "Enregistrement…" : "Enregistrer et marquer comme traité ✓"}
                    </button>
                    {detail.reviewed && (
                        <span className="status-pill status-pill--done" style={{ alignSelf: "center" }}>Traité</span>
                    )}
                  </div>
                </div>
              </div>
          )}
        </main>
      </div>
  );
}
