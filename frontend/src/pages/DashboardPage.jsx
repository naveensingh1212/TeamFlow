import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  CheckSquare,
  Circle,
  Clock,
  FolderKanban,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import Button from "../components/ui/Button.jsx";
import SidebarBrand from "../components/ui/SidebarBrand.jsx";
import useCountUp from "../hooks/useCountUp.js";
import {
  getProfile,
  getProjects,
  getTasks,
  hasAuthToken,
  redirectToSignIn,
  updateTask,
} from "../utils/api.js";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true, path: "/dashboard" },
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Users, label: "Team", path: "/team" },
];

const toneStyles = {
  primary: "bg-gradient-to-r from-brand-500 to-violetSoft text-white",
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
};

const priorityStyles = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-600",
  medium: "border-amber-200 bg-amber-50 text-amber-600",
  high: "border-rose-200 bg-rose-50 text-rose-600",
  critical: "border-red-200 bg-red-50 text-red-600",
};

const statusStyles = {
  todo: "bg-slate-100 text-slate-600",
  "in-progress": "bg-blue-50 text-blue-600",
  review: "bg-violet-50 text-violet-600",
  completed: "bg-emerald-50 text-emerald-600",
  blocked: "bg-rose-50 text-rose-600",
};

const getApiErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

const getTaskStats = (tasks) => ({
  total: tasks.length,
  inProgress: tasks.filter((task) => task.status === "in-progress").length,
  completed: tasks.filter((task) => task.status === "completed").length,
  overdue: tasks.filter((task) => task.isOverdue).length,
});

function StatCard({ stat, delay }) {
  const value = useCountUp(stat.value);
  const Icon = stat.icon;
  const positive = !stat.delta.startsWith("-");

  return (
    <article
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-soft"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneStyles[stat.tone]}`}
        >
          <Icon size={21} strokeWidth={2.2} />
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
            positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          <TrendingUp size={13} />
          {stat.delta}
        </span>
      </div>
      <div className="mt-4 text-3xl font-black tabular-nums text-ink">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-muted">{stat.label}</div>
    </article>
  );
}

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!hasAuthToken()) {
        redirectToSignIn();
        return;
      }

      try {
        setLoading(true);
        const [profileRes, tasksRes, projectsRes] = await Promise.all([
          getProfile(),
          getTasks({ limit: 5 }),
          getProjects(),
        ]);

        setUser(profileRes.data.data);
        const allTasks = tasksRes.data.data || [];
        setTasks(allTasks);
        setProjects(projectsRes.data.data || []);

        setStats(getTaskStats(allTasks));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNavClick = (path) => {
    window.history.pushState(null, null, path);
    window.dispatchEvent(new Event("teamflow:navigate"));
  };

  const handleTaskToggle = async (task) => {
    const nextStatus = task.status === "completed" ? "todo" : "completed";

    try {
      const response = await updateTask(task._id, { status: nextStatus });
      const updatedTasks = tasks.map((currentTask) =>
        currentTask._id === task._id ? response.data.data : currentTask
      );

      setTasks(updatedTasks);
      setStats(getTaskStats(updatedTasks));
    } catch (error) {
      console.error("Error updating dashboard task:", error);
      alert(getApiErrorMessage(error, "Failed to update task"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          <p className="mt-4 text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getUserInitials = () => {
    if (!user) return "U";
    const name = user.username || user.email;
    return name.substring(0, 2).toUpperCase();
  };

  const getRandomGradient = () => {
    const gradients = [
      "from-pink-500 to-rose-500",
      "from-blue-500 to-indigo-500",
      "from-cyan-500 to-blue-500",
      "from-violet-500 to-purple-500",
      "from-emerald-500 to-teal-500",
      "from-amber-500 to-orange-500",
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eef2ff_0%,#f7f6ff_38%,#ffffff_100%)] text-ink">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white/65 backdrop-blur-xl lg:flex lg:flex-col">
          <SidebarBrand />

          <nav className="flex-1 px-3 py-2">
            <ul className="space-y-1">
              {navItems.map(({ icon: Icon, label, active, path }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(path)}
                    className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${
                      active
                        ? "bg-gradient-to-r from-brand-500 to-violetSoft text-white shadow-card"
                        : "text-muted hover:bg-brand-50 hover:text-brand-700"
                    }`}
                  >
                    <Icon size={17} />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="m-3 rounded-xl border border-slate-200 bg-[radial-gradient(circle_at_top,#eef2ff,#ffffff)] p-4">
            <div className="text-sm font-black text-ink">Upgrade to Pro</div>
            <p className="mt-1 text-xs leading-5 text-muted">
              Unlock advanced reporting and unlimited projects.
            </p>
            <Button type="button" className="mt-3 min-h-9 w-full py-2 text-sm">
              Upgrade
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/75 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="relative w-full max-w-md">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                placeholder="Search tasks, projects, people..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-10 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </div>
            <button
              type="button"
              className="relative rounded-lg p-2 text-ink transition hover:bg-brand-50"
              aria-label="Notifications"
            >
              <Bell size={21} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
            </button>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${getRandomGradient()} text-xs font-black text-white`}>
              {getUserInitials()}
            </div>
          </header>

          <div className="space-y-6 p-4 sm:p-6">
            <section className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-normal text-ink sm:text-3xl">
                  Welcome back,{" "}
                  <span className="bg-gradient-to-r from-brand-500 to-violetSoft bg-clip-text text-transparent">
                    {user?.username || user?.email || "User"}
                  </span>
                </h1>
                <p className="mt-1 text-sm font-medium text-muted">
                  Here's what your team is working on today.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" className="min-h-9 px-4 py-2" onClick={() => handleNavClick("/tasks")}>
                  <Plus size={17} /> New Task
                </Button>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                stat={{
                  label: "Total Tasks",
                  value: stats.total,
                  delta: `+${stats.total > 0 ? "1" : "0"}`,
                  icon: CheckSquare,
                  tone: "primary",
                }}
                delay={0}
              />
              <StatCard
                stat={{
                  label: "In Progress",
                  value: stats.inProgress,
                  delta: `+${stats.inProgress > 0 ? "1" : "0"}`,
                  icon: Clock,
                  tone: "blue",
                }}
                delay={100}
              />
              <StatCard
                stat={{
                  label: "Completed",
                  value: stats.completed,
                  delta: `+${stats.completed > 0 ? "1" : "0"}`,
                  icon: CheckCircle2,
                  tone: "emerald",
                }}
                delay={200}
              />
              <StatCard
                stat={{
                  label: "Overdue",
                  value: stats.overdue,
                  delta: stats.overdue > 0 ? `-${stats.overdue}` : "+0",
                  icon: AlertTriangle,
                  tone: "rose",
                }}
                delay={300}
              />
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-card xl:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <h2 className="text-base font-black text-ink">My Tasks</h2>
                    <p className="text-xs font-medium text-muted">
                      Your assigned work
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavClick("/tasks")}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-muted transition hover:bg-brand-50 hover:text-brand-700"
                  >
                    View all <ArrowUpRight size={16} />
                  </button>
                </div>

                <ul className="divide-y divide-slate-200">
                  {tasks.length === 0 ? (
                    <li className="px-5 py-8 text-center text-muted">
                      No tasks yet. Create one to get started!
                    </li>
                  ) : (
                    tasks.map((task, index) => {
                      const isOverdue = task.isOverdue;
                      const gradient = getRandomGradient();

                      return (
                        <li
                          key={task._id}
                          className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-brand-50/40"
                          style={{ animationDelay: `${index * 60}ms` }}
                        >
                          <button
                            type="button"
                            onClick={() => handleTaskToggle(task)}
                            className="text-muted transition hover:text-brand-600"
                            aria-label={`Mark ${task.title} complete`}
                          >
                            {task.status === "completed" ? (
                              <CheckCircle2 size={21} />
                            ) : (
                              <Circle size={21} />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-bold text-ink">
                              {task.title}
                            </h3>
                            <p className="mt-0.5 flex items-center gap-2 text-xs font-medium text-muted">
                              <span className="truncate">
                                {task.project?.name || "Project"}
                              </span>
                              <span>.</span>
                              <span
                                className={
                                  isOverdue ? "font-bold text-rose-500" : ""
                                }
                              >
                                {task.dueDate
                                  ? new Date(task.dueDate).toLocaleDateString()
                                  : "No due date"}
                              </span>
                            </p>
                          </div>
                          <span
                            className={`hidden rounded-full border px-2.5 py-1 text-xs font-bold md:inline-flex ${
                              priorityStyles[task.priority?.toLowerCase()] ||
                              priorityStyles.medium
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`hidden rounded-full px-2.5 py-1 text-xs font-bold lg:inline-flex ${
                              statusStyles[task.status?.toLowerCase()] ||
                              statusStyles.todo
                            }`}
                          >
                            {task.status}
                          </span>
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[10px] font-black text-white`}
                            title={task.assignedTo?.username || "Unassigned"}
                          >
                            {task.assignedTo?.username
                              ? task.assignedTo.username.substring(0, 2).toUpperCase()
                              : "U"}
                          </div>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-muted transition hover:bg-slate-100 hover:text-ink"
                            aria-label={`More options for ${task.title}`}
                          >
                            <MoreHorizontal size={17} />
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>

              <div className="space-y-8">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-ink">
                      Weekly Progress
                    </h2>
                    <span className="text-xs font-medium text-muted">
                      Mon-Sun
                    </span>
                  </div>
                  <div className="mt-4 flex h-28 items-end justify-between gap-2">
                    {[40, 65, 50, 80, 72, 90, 58].map((height, index) => (
                      <div
                        key={`${height}-${index}`}
                        className="flex flex-1 flex-col items-center gap-1.5"
                      >
                        <div className="flex w-full flex-1 items-end">
                          <div
                            className="w-full rounded-t-md bg-gradient-to-t from-brand-500 to-violetSoft opacity-90"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-muted">
                          {["M", "T", "W", "T", "F", "S", "S"][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                    <div>
                      <p className="text-xs font-medium text-muted">
                        Tasks completed
                      </p>
                      <p className="text-lg font-black text-ink">{stats.completed}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600">
                      <TrendingUp size={14} />{" "}
                      {stats.completed > 0 ? "+18%" : "0%"}
                    </span>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-ink">
                      Your Projects
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleNavClick("/projects")}
                      className="rounded-lg px-3 py-2 text-sm font-bold text-muted transition hover:bg-brand-50 hover:text-brand-700"
                    >
                      View
                    </button>
                  </div>
                  <ul className="mt-4 space-y-4">
                    {projects.slice(0, 3).map((project, index) => (
                      <li
                        key={project._id}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className={`h-3 w-3 rounded-full bg-gradient-to-br ${getRandomGradient()}`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-ink">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted">
                            {project.members?.length || 0} members
                          </p>
                        </div>
                      </li>
                    ))}
                    {projects.length === 0 && (
                      <li className="text-center text-muted text-sm py-4">
                        No projects yet
                      </li>
                    )}
                  </ul>
                </section>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
