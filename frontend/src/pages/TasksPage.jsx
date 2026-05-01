import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  CheckSquare,
  Clock,
  Filter,
  FolderKanban,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Button from "../components/ui/Button.jsx";
import SidebarBrand from "../components/ui/SidebarBrand.jsx";
import {
  createTask,
  deleteTask,
  getProjects,
  getTasks,
  hasAuthToken,
  redirectToSignIn,
  updateTask,
} from "../utils/api.js";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks", active: true },
  { icon: Users, label: "Team", path: "/team" },
];

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

const statusOptions = ["todo", "in-progress", "review", "completed", "blocked"];
const priorityOptions = ["low", "medium", "high", "critical"];

const getApiErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
    status: "todo",
  });
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchData = async () => {
      if (!hasAuthToken()) {
        redirectToSignIn();
        return;
      }

      try {
        setLoading(true);
        const [tasksRes, projectsRes] = await Promise.all([
          getTasks(),
          getProjects(),
        ]);
        setTasks(tasksRes.data.data || []);
        setProjects(projectsRes.data.data || []);
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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!hasAuthToken()) {
      redirectToSignIn();
      return;
    }

    try {
      if (!formData.title || !formData.projectId) {
        alert("Please fill in title and project");
        return;
      }
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        projectId: formData.projectId,
        priority: formData.priority,
        status: formData.status,
      };

      if (formData.assignedTo) {
        payload.assignedTo = formData.assignedTo;
      }

      if (formData.dueDate) {
        payload.dueDate = formData.dueDate;
      }

      const res = await createTask(payload);
      setTasks([res.data.data, ...tasks]);
      setShowModal(false);
      setFormData({
        title: "",
        description: "",
        projectId: "",
        assignedTo: "",
        priority: "medium",
        dueDate: "",
        status: "todo",
      });
    } catch (error) {
      console.error("Error creating task:", error);
      alert(getApiErrorMessage(error, "Failed to create task"));
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await updateTask(taskId, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === taskId ? res.data.data : t)));
    } catch (error) {
      console.error("Error updating task:", error);
      alert(getApiErrorMessage(error, "Failed to update task"));
    }
  };

  const handlePriorityChange = async (taskId, newPriority) => {
    try {
      const res = await updateTask(taskId, { priority: newPriority });
      setTasks(tasks.map((t) => (t._id === taskId ? res.data.data : t)));
    } catch (error) {
      console.error("Error updating task priority:", error);
      alert(getApiErrorMessage(error, "Failed to update task priority"));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      alert(getApiErrorMessage(error, "Failed to delete task"));
    }
  };

  const filteredTasks = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const selectedProject = projects.find((p) => p._id === formData.projectId);
  const projectMembers = selectedProject?.members || [];
  const canDeleteTask = (task) =>
    task.createdBy?._id === currentUser?.id ||
    task.project?.owner === currentUser?.id ||
    task.project?.owner?._id === currentUser?.id ||
    task.project?.members?.some(
      (member) =>
        (member.user === currentUser?.id || member.user?._id === currentUser?.id) &&
        member.role === "admin"
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          <p className="mt-4 text-muted">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eef2ff_0%,#f7f6ff_38%,#ffffff_100%)] text-ink">
      <div className="flex">
        {/* Sidebar */}
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

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/75 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="relative w-full max-w-md">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                placeholder="Search tasks..."
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
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-xs font-black text-white">
              U
            </div>
          </header>

          <div className="space-y-6 p-4 sm:p-6">
            <section className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-normal text-ink sm:text-3xl">
                  Tasks
                </h1>
                <p className="mt-1 text-sm font-medium text-muted">
                  Manage and track your team's tasks
                </p>
              </div>
              <Button
                onClick={() => setShowModal(true)}
                className="min-h-9 px-4 py-2"
              >
                <Plus size={17} /> New Task
              </Button>
            </section>

            {/* Filter Buttons */}
            <section className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                  filter === "all"
                    ? "bg-gradient-to-r from-brand-500 to-violetSoft text-white"
                    : "bg-slate-100 text-muted hover:bg-slate-200"
                }`}
              >
                All ({filteredTasks.length})
              </button>
              {statusOptions.map((status) => {
                const count = tasks.filter((t) => t.status === status).length;
                return (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                      filter === status
                        ? "bg-gradient-to-r from-brand-500 to-violetSoft text-white"
                        : "bg-slate-100 text-muted hover:bg-slate-200"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                  </button>
                );
              })}
            </section>

            {/* Tasks List */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  <p>No tasks found. Create one to get started!</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {filteredTasks.map((task) => (
                    <li
                      key={task._id}
                      className="flex items-center gap-3 px-5 py-4 transition hover:bg-brand-50/40"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(
                            task._id,
                            task.status === "completed"
                              ? "todo"
                              : "completed"
                          )
                        }
                        className="text-muted transition hover:text-brand-600 shrink-0"
                        aria-label="Toggle task completion"
                      >
                        {task.status === "completed" ? (
                          <CheckCircle2 size={24} className="text-emerald-600" />
                        ) : (
                          <div className="w-6 h-6 border-2 border-slate-300 rounded-full" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`truncate text-sm font-bold ${
                            task.status === "completed"
                              ? "line-through text-muted"
                              : "text-ink"
                          }`}
                        >
                          {task.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-2 text-xs font-medium text-muted">
                          <span className="truncate">
                            {task.project?.name || "Project"}
                          </span>
                          <span>•</span>
                          <span className="truncate">
                            {task.assignedTo?.username || "Unassigned"}
                          </span>
                          <span>•</span>
                          <span>
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : "No due date"}
                          </span>
                        </p>
                      </div>
                      <select
                        value={task.priority}
                        onChange={(e) =>
                          handlePriorityChange(task._id, e.target.value)
                        }
                        className={`hidden rounded-full border px-2.5 py-1 text-xs font-bold md:inline-flex ${
                          priorityStyles[task.priority?.toLowerCase()] ||
                          priorityStyles.medium
                        } appearance-none cursor-pointer`}
                      >
                        {priorityOptions.map((p) => (
                          <option key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </option>
                        ))}
                      </select>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task._id, e.target.value)
                        }
                        className={`hidden rounded-full px-2.5 py-1 text-xs font-bold lg:inline-flex ${
                          statusStyles[task.status?.toLowerCase()] ||
                          statusStyles.todo
                        } appearance-none cursor-pointer`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                      {canDeleteTask(task) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task._id)}
                          className="rounded-lg p-2 text-muted transition hover:bg-rose-100 hover:text-rose-600"
                          aria-label={`Delete ${task.title}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-black text-ink">Create New Task</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter task title"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter task description"
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Project *
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projectId: e.target.value,
                      assignedTo: "",
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none"
                >
                  <option value="">Select a project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Assignee
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTo: e.target.value })
                  }
                  disabled={!formData.projectId}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none disabled:bg-slate-50 disabled:text-muted"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((member) => (
                    <option key={member.user?._id} value={member.user?._id}>
                      {member.user?.username || member.user?.email || "User"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none"
                  >
                    {priorityOptions.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-muted hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-500 to-violetSoft text-white text-sm font-bold hover:shadow-card transition"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
