export function Notice({ ok, err }: { ok?: string; err?: string }) {
  if (ok) {
    return (
      <p className="notice notice--ok" role="status">
        {ok}
      </p>
    );
  }
  if (err) {
    return (
      <p className="notice notice--err" role="alert">
        {err}
      </p>
    );
  }
  return null;
}

export function ErrorBlock({ errors }: { errors?: string[] }) {
  if (!errors || !errors.length) return null;
  return (
    <div className="notice notice--err" role="alert">
      <ul>
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
