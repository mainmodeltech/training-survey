import { useState } from "react";
import type { FormData, FormStep, SubmissionResult } from "../types";
import {
  DEPARTMENTS, FEATURES, LEVELS, DAILY_TASKS, DAILY_TIMES,
  DIFFICULTIES, MOTIVATIONS, EXPECTED_RESULTS, AMBITIONS,
  DURATIONS, MODALITIES, COMPUTERS, FILE_SIZES, STEP_LABELS,
} from "../types/constants";
import { submitForm } from "../services/api";
import ResultCard from "../components/ResultCard";
import StepIndicator from "../components/StepIndicator";
import "../styles/form.css";

const INITIAL: FormData = {
  full_name: "", position: "", department: "", location: "",
  self_level: "", features_usage: {}, file_size: "",
  daily_tasks: [], daily_time: "", difficulties: [], difficulty_details: "",
  motivation: "", expected_results: [], ambition_level: "",
  preferred_duration: "", preferred_modality: "", has_computer: "",
  concrete_case: "", additional_comments: "",
};

interface Props { onAdminClick: () => void; }

export default function FormPage({ onAdminClick }: Props) {
  const [step, setStep] = useState<FormStep>(1);
  const [data, setData] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const set = (key: keyof FormData, value: unknown) =>
    setData(d => ({ ...d, [key]: value }));

  const toggleArray = (key: keyof FormData, val: string) => {
    const arr = (data[key] as string[]) || [];
    set(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const setFeature = (feature: string, usage: string) =>
    set("features_usage", { ...data.features_usage, [feature]: usage });

  const validate = (): string | null => {
    if (step === 1) {
      if (!data.full_name.trim()) return "Veuillez saisir votre nom complet.";
      if (!data.position.trim()) return "Veuillez saisir votre poste.";
      if (!data.department) return "Veuillez sélectionner votre département.";
      if (!data.location.trim()) return "Veuillez indiquer votre lieu d'affectation.";
    }
    if (step === 2) {
      if (!data.self_level) return "Veuillez évaluer votre niveau.";
      if (Object.keys(data.features_usage).length === 0) return "Veuillez répondre à au moins une fonctionnalité.";
    }
    if (step === 3) {
      if (data.daily_tasks.length === 0) return "Veuillez sélectionner au moins une tâche quotidienne.";
      if (!data.daily_time) return "Veuillez indiquer le temps passé sur Excel.";
      if (data.difficulties.length === 0) return "Veuillez sélectionner au moins une difficulté.";
    }
    if (step === 4) {
      if (!data.motivation) return "Veuillez indiquer votre motivation.";
      if (data.expected_results.length === 0) return "Veuillez choisir au moins un résultat attendu.";
      if (!data.ambition_level) return "Veuillez indiquer votre niveau d'ambition.";
    }
    if (step === 5) {
      if (!data.preferred_duration) return "Veuillez choisir une durée.";
      if (!data.preferred_modality) return "Veuillez choisir une modalité.";
    }
    return null;
  };

  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    if (step < 5) setStep((s) => (s + 1) as FormStep);
  };

  const prev = () => {
    setError(null);
    if (step > 1) setStep((s) => (s - 1) as FormStep);
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await submitForm(data);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (result) return <ResultCard result={result} onReset={() => { setResult(null); setData(INITIAL); setStep(1); }} />;

  return (
    <div className="page-wrap">
      <header className="form-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-logo">MT</span>
            <div>
              <div className="brand-name">Model Technologie</div>
              <div className="brand-tagline">Excellence Data · Dakar</div>
            </div>
          </div>
          <button className="admin-link" onClick={onAdminClick}>Administration →</button>
        </div>
        <div className="hero-section">
          <div className="hero-badge">CORAF · Qualification Formation Excel</div>
          <h1 className="hero-title">Analysons ensemble vos besoins</h1>
          <p className="hero-sub">Ce formulaire nous permettra de construire un programme de formation Excel 100% adapté à votre profil et à vos enjeux quotidiens au CORAF.</p>
          <div className="hero-meta">
            <span>⏱ 8 à 12 minutes</span>
            <span>·</span>
            <span>5 sections</span>
            <span>·</span>
            <span>🔒 Données confidentielles</span>
          </div>
        </div>
      </header>

      <div className="form-container">
        <StepIndicator current={step} labels={STEP_LABELS} />

        <div className="form-card">
          {/* ─── STEP 1 ─────────────────────────────── */}
          {step === 1 && (
            <div className="step-body">
              <h2 className="step-title">Votre identification</h2>
              <p className="step-desc">Ces informations nous permettront de personnaliser votre parcours et de vous recontacter.</p>

              <div className="field-group">
                <label className="field-label">Nom complet <span className="req">*</span></label>
                <input className="field-input" placeholder="Prénom NOM" value={data.full_name} onChange={e => set("full_name", e.target.value)} />
              </div>

              <div className="field-group">
                <label className="field-label">Poste / Fonction <span className="req">*</span></label>
                <input className="field-input" placeholder="Ex : Chargé de suivi-évaluation" value={data.position} onChange={e => set("position", e.target.value)} />
              </div>

              <div className="field-group">
                <label className="field-label">Département / Direction <span className="req">*</span></label>
                <select className="field-input field-select" value={data.department} onChange={e => set("department", e.target.value)}>
                  <option value="">Sélectionnez votre département</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Pays / Bureau d'affectation <span className="req">*</span></label>
                <input className="field-input" placeholder="Ex : Sénégal – Dakar (siège)" value={data.location} onChange={e => set("location", e.target.value)} />
              </div>
            </div>
          )}

          {/* ─── STEP 2 ─────────────────────────────── */}
          {step === 2 && (
            <div className="step-body">
              <h2 className="step-title">Votre niveau sur Excel</h2>
              <p className="step-desc">Soyez honnête — il n'y a pas de mauvaise réponse. Cette évaluation nous sert uniquement à adapter le contenu.</p>

              <div className="field-group">
                <label className="field-label">Comment évaluez-vous votre niveau ? <span className="req">*</span></label>
                <div className="level-grid">
                  {LEVELS.map(l => (
                    <button
                      key={l.value}
                      className={`level-card ${data.self_level === l.value ? "level-card--active" : ""}`}
                      style={{ "--level-color": l.color } as React.CSSProperties}
                      onClick={() => set("self_level", l.value)}
                      type="button"
                    >
                      <span className="level-emoji">{l.emoji}</span>
                      <span className="level-name">{l.label}</span>
                      <span className="level-desc">{l.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Quelles fonctionnalités utilisez-vous ? <span className="req">*</span></label>
                <p className="field-hint">Pour chaque ligne, indiquez votre fréquence d'utilisation</p>
                <div className="feature-table">
                  <div className="feature-head">
                    <span>Fonctionnalité</span>
                    <span>Jamais</span>
                    <span>Parfois</span>
                    <span>Souvent</span>
                  </div>
                  {FEATURES.map(f => (
                    <div key={f} className="feature-row">
                      <span className="feature-name">{f}</span>
                      {(["jamais", "parfois", "souvent"] as const).map(u => (
                        <button
                          key={u}
                          type="button"
                          className={`freq-btn ${data.features_usage[f] === u ? "freq-btn--active" : ""}`}
                          onClick={() => setFeature(f, u)}
                        >{u}</button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Taille habituelle de vos fichiers</label>
                <div className="choice-list">
                  {FILE_SIZES.map(s => (
                    <label key={s} className={`choice-item ${data.file_size === s ? "choice-item--active" : ""}`}>
                      <input type="radio" name="file_size" checked={data.file_size === s} onChange={() => set("file_size", s)} />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 3 ─────────────────────────────── */}
          {step === 3 && (
            <div className="step-body">
              <h2 className="step-title">Votre utilisation quotidienne</h2>
              <p className="step-desc">Comment Excel s'intègre-t-il dans votre travail au CORAF ?</p>

              <div className="field-group">
                <label className="field-label">Tâches quotidiennes sur Excel <span className="req">*</span></label>
                <p className="field-hint">Plusieurs réponses possibles</p>
                <div className="check-list">
                  {DAILY_TASKS.map(t => (
                    <label key={t} className={`choice-item ${data.daily_tasks.includes(t) ? "choice-item--active" : ""}`}>
                      <input type="checkbox" checked={data.daily_tasks.includes(t)} onChange={() => toggleArray("daily_tasks", t)} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Temps passé sur Excel par jour <span className="req">*</span></label>
                <div className="choice-list">
                  {DAILY_TIMES.map(t => (
                    <label key={t} className={`choice-item ${data.daily_time === t ? "choice-item--active" : ""}`}>
                      <input type="radio" name="daily_time" checked={data.daily_time === t} onChange={() => set("daily_time", t)} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Difficultés rencontrées <span className="req">*</span></label>
                <p className="field-hint">Soyez honnête — c'est ce qui nous permet de cibler votre formation</p>
                <div className="check-list">
                  {DIFFICULTIES.map(d => (
                    <label key={d} className={`choice-item ${data.difficulties.includes(d) ? "choice-item--active" : ""}`}>
                      <input type="checkbox" checked={data.difficulties.includes(d)} onChange={() => toggleArray("difficulties", d)} />
                      <span>{d}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Décrivez un exemple concret de difficulté</label>
                <textarea
                  className="field-textarea"
                  placeholder="Ex : Je dois consolider le rapport trimestriel depuis 5 fichiers différents, ça me prend toute une journée..."
                  value={data.difficulty_details}
                  onChange={e => set("difficulty_details", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ─── STEP 4 ─────────────────────────────── */}
          {step === 4 && (
            <div className="step-body">
              <h2 className="step-title">Vos ambitions</h2>
              <p className="step-desc">Ce que vous souhaitez accomplir grâce à la formation.</p>

              <div className="field-group">
                <label className="field-label">Votre principale motivation <span className="req">*</span></label>
                <div className="choice-list">
                  {MOTIVATIONS.map(m => (
                    <label key={m} className={`choice-item ${data.motivation === m ? "choice-item--active" : ""}`}>
                      <input type="radio" name="motivation" checked={data.motivation === m} onChange={() => set("motivation", m)} />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Résultats attendus <span className="req">*</span></label>
                <p className="field-hint">Choisissez jusqu'à 3 priorités</p>
                <div className="check-list">
                  {EXPECTED_RESULTS.map(r => {
                    const selected = data.expected_results.includes(r);
                    const max3 = data.expected_results.length >= 3;
                    return (
                      <label key={r} className={`choice-item ${selected ? "choice-item--active" : ""} ${!selected && max3 ? "choice-item--disabled" : ""}`}>
                        <input type="checkbox" checked={selected} disabled={!selected && max3} onChange={() => toggleArray("expected_results", r)} />
                        <span>{r}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Jusqu'où souhaitez-vous aller ? <span className="req">*</span></label>
                <div className="ambition-list">
                  {AMBITIONS.map(a => (
                    <button
                      key={a.value}
                      type="button"
                      className={`ambition-card ${data.ambition_level === a.value ? "ambition-card--active" : ""}`}
                      onClick={() => set("ambition_level", a.value)}
                    >
                      <span className="ambition-title">{a.value}</span>
                      <span className="ambition-sub">{a.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 5 ─────────────────────────────── */}
          {step === 5 && (
            <div className="step-body">
              <h2 className="step-title">Modalités de formation</h2>
              <p className="step-desc">Dites-nous comment organiser au mieux votre formation.</p>

              <div className="field-group">
                <label className="field-label">Durée préférée <span className="req">*</span></label>
                <div className="choice-list">
                  {DURATIONS.map(d => (
                    <label key={d.value} className={`choice-item choice-item--two-line ${data.preferred_duration === d.value ? "choice-item--active" : ""}`}>
                      <input type="radio" name="duration" checked={data.preferred_duration === d.value} onChange={() => set("preferred_duration", d.value)} />
                      <div>
                        <div className="choice-main">{d.value}</div>
                        <div className="choice-hint">{d.sub}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Modalité préférée <span className="req">*</span></label>
                <div className="choice-list">
                  {MODALITIES.map(m => (
                    <label key={m} className={`choice-item ${data.preferred_modality === m ? "choice-item--active" : ""}`}>
                      <input type="radio" name="modality" checked={data.preferred_modality === m} onChange={() => set("preferred_modality", m)} />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Avez-vous un ordinateur avec Excel pour la formation ?</label>
                <div className="choice-list">
                  {COMPUTERS.map(c => (
                    <label key={c} className={`choice-item ${data.has_computer === c ? "choice-item--active" : ""}`}>
                      <input type="radio" name="computer" checked={data.has_computer === c} onChange={() => set("has_computer", c)} />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Un cas concret du CORAF à traiter en exercice ?</label>
                <textarea
                  className="field-textarea"
                  placeholder="Ex : Notre rapport trimestriel de suivi des indicateurs — consolidé depuis 5 fichiers manuellement..."
                  value={data.concrete_case}
                  onChange={e => set("concrete_case", e.target.value)}
                />
              </div>

              <div className="field-group">
                <label className="field-label">Remarques ou attentes supplémentaires</label>
                <textarea
                  className="field-textarea"
                  placeholder="Partagez librement..."
                  value={data.additional_comments}
                  onChange={e => set("additional_comments", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ─── Navigation ─────────────────────────── */}
          {error && <div className="form-error">{error}</div>}

          <div className="form-nav">
            {step > 1 && (
              <button className="btn-prev" onClick={prev} type="button">← Précédent</button>
            )}
            <div style={{ flex: 1 }} />
            {step < 5 ? (
              <button className="btn-next" onClick={next} type="button">Suivant →</button>
            ) : (
              <button className="btn-submit" onClick={handleSubmit} disabled={loading} type="button">
                {loading ? "Envoi en cours…" : "Soumettre mon formulaire ✓"}
              </button>
            )}
          </div>
        </div>
      </div>

      <footer className="page-footer">
        <p>© {new Date().getFullYear()} Model Technologie · Dakar, Sénégal · <a href="mailto:contact@model-technologie.com">contact@model-technologie.com</a></p>
      </footer>
    </div>
  );
}
