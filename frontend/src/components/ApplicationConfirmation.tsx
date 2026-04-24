interface Props {
  jobTitle: string;
  onReset: () => void;
}

export function ApplicationConfirmation({ jobTitle, onReset }: Props) {
  return (
    <div className="confirmation">
      <div className="confirmation-icon">✓</div>
      <h2 className="confirmation-title">Application Submitted</h2>
      <p className="confirmation-message">
        Your application for <strong>{jobTitle}</strong> has been submitted.
        The hiring team will be in touch.
      </p>
      <button type="button" className="reset-btn" onClick={onReset}>
        Apply for Another Role
      </button>
    </div>
  );
}
