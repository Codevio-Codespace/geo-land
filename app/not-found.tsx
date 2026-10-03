export default function NotFound() {
  return (
    <>
      <link rel="stylesheet" href="/assets/css/base.css" precedence="base" />
      <main className="container" style={{ padding: '12vh 0' }}>
        <p className="mono" style={{ color: 'var(--orange-2)' }}>
          404
        </p>
        <h1 style={{ margin: '.5rem 0 1rem' }}>This page does not exist.</h1>
        <p>
          <a className="link-arrow" href="/">
            Back to the home page
          </a>
        </p>
      </main>
    </>
  );
}
