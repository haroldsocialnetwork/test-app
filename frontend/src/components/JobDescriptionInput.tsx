interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export function JobDescriptionInput({
  value,
  onChange,
  error,
  disabled,
}: JobDescriptionInputProps) {
  return (
    <div className="input-section">
      <label className="section-label" htmlFor="job-description">
        Job Description
      </label>
      <textarea
        id="job-description"
        className={`text-input ${error ? 'input-error' : ''}`}
        placeholder="Paste the job description here…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={8}
      />
      {error && <p className="error-inline">{error}</p>}
    </div>
  );
}
