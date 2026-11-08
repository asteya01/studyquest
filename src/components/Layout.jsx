// The page frame shared by every page: skip link, top bar, and the navigation.
// On a computer the navigation sits in the top bar. On a phone it becomes a tab bar at the
// bottom of the screen, where a thumb can reach it (the CSS does that, see styles.css).
import { useState } from "react";
import { NavLink, Outlet } from "react-router";

// Small 24x24 line icons. They only show on phones, and are hidden from screen readers
// because the text label next to each one says the same thing.
const ICONS = {
  dashboard: <path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z" />,
  assignments: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="0.8" /><circle cx="4.5" cy="12" r="0.8" /><circle cx="4.5" cy="18" r="0.8" />
    </>
  ),
  subjects: (
    <>
      <path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z" />
      <path d="M5 17a3 3 0 013-3h11" />
    </>
  ),
  achievements: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z" />,
};

const links = [
  { to: "/", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/assignments", label: "Assignments", icon: "assignments" },
  { to: "/subjects", label: "Subjects", icon: "subjects" },
  { to: "/achievements", label: "Achievements", icon: "achievements" },
];

// Switches between light and dark. The choice is saved in this browser. If saving isn't
// allowed (a private window, say), it still works until the page is closed.
function ThemeToggle() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || "light");

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem("studyquest-theme", next);
    } catch {
      /* not saved, and that's fine */
    }
  }

  const dark = theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />
        )}
      </svg>
    </button>
  );
}

export default function Layout() {
  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to content</a>

      <header className="topbar">
        <NavLink to="/" className="brand">
          <svg viewBox="0 0 32 32" aria-hidden="true" className="brand-mark">
            <rect width="32" height="32" rx="8" />
            <path d="M16 6l3.1 6.3 6.9 1-5 4.9 1.2 6.8L16 21.7l-6.2 3.3L11 18.2l-5-4.9 6.9-1z" />
          </svg>
          StudyQuest
        </NavLink>

        <nav aria-label="Main" className="main-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-icon">{ICONS[link.icon]}</svg>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="topbar-actions">
          <ThemeToggle />
          <NavLink to="/assignments/new" className="button" aria-label="Add assignment">
            <span aria-hidden="true">+ Add<span className="add-more"> assignment</span></span>
          </NavLink>
        </div>
      </header>

      <main className="page" id="main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
