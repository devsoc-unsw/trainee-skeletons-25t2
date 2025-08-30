import { Link } from "react-router-dom";

export default function NavigationBar() {
  return (
    <nav className="flex justify-between items-center px-5 py-2 backdrop-blur-sm">
      {/* Logo LHS */}
      <Link to="/" className="text-2xl font-bold">
        NomNomVotes
      </Link>

      {/* Links RHS */}
      <div className="flex gap-6">
        <Link to="/">Home</Link>
        <Link to="/room/123/preferences">Preferences</Link>
        <Link to="/room/123/host">Host</Link>
        <Link to="/room/123/swipe">Swipe</Link>
        <Link to="/room/123/results">Results</Link>
        <Link to="/404">404</Link>
      </div>
    </nav>
  );
}
