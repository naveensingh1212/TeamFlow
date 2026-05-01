import { useEffect, useState } from "react";
import DashboardPage from "./pages/DashboardPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import TeamPage from "./pages/TeamPage.jsx";

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setPath(window.location.pathname);

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("teamflow:navigate", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("teamflow:navigate", handleLocationChange);
    };
  }, []);

  // Render based on path
  if (path === "/dashboard") {
    return <DashboardPage />;
  }

  if (path === "/tasks") {
    return <TasksPage />;
  }

  if (path === "/projects") {
    return <ProjectsPage />;
  }

  if (path === "/team") {
    return <TeamPage />;
  }

  // Default to landing page
  return <LandingPage />;
}

export default App;
