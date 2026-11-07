// Reusable loading and error messages, so every page shows them the same way.

export function Loading({ what = "Loading" }) {
  return (
    <p className="status" role="status">
      <span className="spinner" aria-hidden="true" /> {what}…
    </p>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="status status-error" role="alert">
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>Try again</button>}
    </div>
  );
}
