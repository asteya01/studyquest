// Which page shows for which address. Layout draws the navigation menu around every page.
import { Routes, Route } from "react-router";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Assignments from "./pages/Assignments.jsx";
import AssignmentForm from "./pages/AssignmentForm.jsx";
import Subjects from "./pages/Subjects.jsx";
import Achievements from "./pages/Achievements.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="assignments/new" element={<AssignmentForm />} />
        <Route path="assignments/:id/edit" element={<AssignmentForm />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
