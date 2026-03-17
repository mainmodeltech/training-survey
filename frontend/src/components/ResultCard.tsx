import type { SubmissionResult } from "../types";

interface Props {
  result: SubmissionResult;
  onReset: () => void;
}

export default function ResultCard({ result, onReset }: Props) {
  const isB = result.computed_level === "B";

  return (
    <div className="result-page">
      <div className="result-card">
        <div className={`result-badge ${isB ? "result-badge--b" : "result-badge--a"}`}>
          Curriculat recommandé : {result.computed_level}
        </div>

        <div className="result-score-row">
          <div className="result-score-circle" style={{ "--score-pct": `${result.score_total}%` } as React.CSSProperties}>
            <span className="result-score-value">{result.score_total}</span>
            <span className="result-score-label">/100</span>
          </div>
          <div>
            <h2 className="result-title">{result.recommended_label}</h2>
            <div className="result-duration">Durée recommandée : <strong>{result.recommended_duration}</strong></div>
          </div>
        </div>

        <div className="result-topics">
          <h3 className="result-topics-title">Thèmes clés de votre programme</h3>
          <ul className="result-topics-list">
            {result.key_topics.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>

        <div className="result-message">
          <div className="result-message-icon">✓</div>
          <p>{result.message}</p>
        </div>

        <div className="result-footer">
          <div className="result-contact">
            <strong>Model Technologie</strong> · contact@model-technologie.com
          </div>
          <button className="btn-reset" onClick={onReset}>Soumettre un autre formulaire</button>
        </div>
      </div>
    </div>
  );
}
