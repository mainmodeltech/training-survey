interface Props {
  current: number;
  labels: string[];
}

export default function StepIndicator({ current, labels }: Props) {
  return (
    <div className="step-indicator">
      {labels.map((label, i) => {
        const n = i + 1;
        const status = n < current ? "done" : n === current ? "active" : "pending";
        return (
          <div key={n} className={`step-item step-item--${status}`}>
            <div className="step-dot">
              {status === "done" ? "✓" : n}
            </div>
            <span className="step-label">{label}</span>
            {i < labels.length - 1 && <div className="step-line" />}
          </div>
        );
      })}
    </div>
  );
}
