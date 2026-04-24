interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="error-banner">
      <span>{message}</span>
      <button className="retry-btn" onClick={onRetry}>Retry</button>
    </div>
  );
}
