import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export function PlaceholderPage({
  title,
  label = "Coming soon",
}: {
  title: string;
  label?: string;
}) {
  return (
    <section className="empty-page content-width">
      <span className="status-label">{label}</span>
      <h1>{title}</h1>
      <Link className="back-link" to="/games">
        <ArrowLeft size={17} aria-hidden="true" /> All games
      </Link>
    </section>
  );
}
