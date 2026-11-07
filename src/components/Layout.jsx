// The navigation menu and page frame shared by every page.
import { NavLink, Outlet } from "react-router";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/assignments", label: "Assignments" },
  { to: "/subjects", label: "Subjects" },
  { to: "/achievements", label: "Achievements" },
];

export default function Layout() {
  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand">StudyQuest</NavLink>
        <nav aria-label="Main">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/assignments/new" className="button">Add assignment</NavLink>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
