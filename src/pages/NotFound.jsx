import { Link } from "react-router";
export default function NotFound() {
  return (
    <section>
      <h1>Page not found</h1>
      <p className="muted">There's no page at this address.</p>
      <p><Link to="/">Go to the dashboard</Link></p>
    </section>
  );
}
