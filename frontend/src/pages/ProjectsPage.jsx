import { useEffect, useState } from "react";
import {
  Bell,
  CheckSquare,
  Filter,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Button from "../components/ui/Button.jsx";
import SidebarBrand from "../components/ui/SidebarBrand.jsx";
import {
  addProjectMember,
  createProject,
  deleteProject,
  getProjects,
  getTeams,
  hasAuthToken,
  removeProjectMember,
  redirectToSignIn,
  searchUsers,
} from "../utils/api.js";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderKanban, label: "Projects", path: "/projects", active: true },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Users, label: "Team", path: "/team" },
];

const getApiErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [memberForms, setMemberForms] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    team: "",
    dueDate: "",
  });
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchProjects = async () => {
      if (!hasAuthToken()) {
        redirectToSignIn();
        return;
      }

      try {
        setLoading(true);
        const [projectsRes, teamsRes] = await Promise.all([
          getProjects(),
          getTeams(),
        ]);
        setProjects(projectsRes.data.data || []);
        setTeams(teamsRes.data.data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleNavClick = (path) => {
    window.history.pushState(null, null, path);
    window.dispatchEvent(new Event("teamflow:navigate"));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!hasAuthToken()) {
      redirectToSignIn();
      return;
    }

    try {
      if (!formData.name) {
        alert("Please enter a project name");
        return;
      }
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      if (formData.team) {
        payload.team = formData.team;
      }

      if (formData.dueDate) {
        payload.dueDate = formData.dueDate;
      }

      const res = await createProject(payload);
      setProjects([res.data.data, ...projects]);
      setShowModal(false);
      setFormData({
        name: "",
        description: "",
        team: "",
        dueDate: "",
      });
    } catch (error) {
      console.error("Error creating project:", error);
      alert(getApiErrorMessage(error, "Failed to create project"));
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(projectId);
      setProjects(projects.filter((p) => p._id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      alert(getApiErrorMessage(error, "Failed to delete project"));
    }
  };

  const canManageProject = (project) =>
    project.owner?._id === currentUser?.id ||
    project.owner === currentUser?.id ||
    project.members?.some(
      (member) =>
        member.user?._id === currentUser?.id && member.role === "admin"
    );

  const updateMemberForm = (projectId, updates) => {
    setMemberForms((current) => ({
      ...current,
      [projectId]: {
        email: "",
        role: "member",
        ...(current[projectId] || {}),
        ...updates,
      },
    }));
  };

  const handleAddMember = async (event, project) => {
    event.preventDefault();

    const form = memberForms[project._id] || {};
    if (!form.email?.trim()) {
      alert("Enter a user email or username");
      return;
    }

    try {
      const usersRes = await searchUsers(form.email.trim());
      const user = usersRes.data.data?.[0];

      if (!user) {
        alert("No user found with that email or username");
        return;
      }

      const projectRes = await addProjectMember(project._id, {
        userId: user._id,
        role: form.role || "member",
      });

      setProjects(
        projects.map((item) =>
          item._id === project._id ? projectRes.data.data : item
        )
      );
      updateMemberForm(project._id, { email: "", role: "member" });
    } catch (error) {
      console.error("Error adding project member:", error);
      alert(getApiErrorMessage(error, "Failed to add project member"));
    }
  };

  const handleRemoveMember = async (project, member) => {
    if (!confirm("Remove this member from the project?")) return;

    try {
      const projectRes = await removeProjectMember(project._id, member.user._id);
      setProjects(
        projects.map((item) =>
          item._id === project._id ? projectRes.data.data : item
        )
      );
    } catch (error) {
      console.error("Error removing project member:", error);
      alert(getApiErrorMessage(error, "Failed to remove project member"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          <p className="mt-4 text-muted">Loading projects...</p>
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
                placeholder="Search projects..."
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
                  Projects
                </h1>
                <p className="mt-1 text-sm font-medium text-muted">
                  Manage and organize your team projects
                </p>
              </div>
              <Button
                onClick={() => setShowModal(true)}
                className="min-h-9 px-4 py-2"
              >
                <Plus size={17} /> New Project
              </Button>
            </section>

            {/* Stats */}
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="text-sm font-medium text-muted">Total Projects</p>
                <p className="mt-2 text-3xl font-black text-ink">{projects.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="text-sm font-medium text-muted">Active Projects</p>
                <p className="mt-2 text-3xl font-black text-ink">
                  {projects.filter((p) => p.status === "active").length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="text-sm font-medium text-muted">Team Members</p>
                <p className="mt-2 text-3xl font-black text-ink">
                  {new Set(projects.flatMap((p) => p.members?.map((m) => m.user))).size}
                </p>
              </div>
            </section>

            {/* Projects Grid */}
            <section>
              {projects.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <FolderKanban size={48} className="text-muted opacity-50" />
                  </div>
                  <p className="text-muted mb-4">No projects yet. Create one to get started!</p>
                  <Button onClick={() => setShowModal(true)}>
                    <Plus size={17} /> Create First Project
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <div
                      key={project._id}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-card hover:shadow-lg transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-black text-ink">
                            {project.name}
                          </h3>
                          <p className="mt-1 text-xs font-medium text-muted">
                            {project.status || "active"}
                          </p>
                        </div>
                        {canManageProject(project) && (
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            className="rounded-lg p-2 text-muted transition hover:bg-rose-100 hover:text-rose-600"
                            aria-label={`Delete ${project.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      {project.description && (
                        <p className="text-sm text-muted mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      <div className="space-y-3 border-t border-slate-200 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted">
                            Team
                          </span>
                          <span className="text-sm font-bold text-ink">
                            {project.team?.name || "No team"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted">
                            Members
                          </span>
                          <span className="text-sm font-bold text-ink">
                            {project.members?.length || 0}
                          </span>
                        </div>

                        {project.dueDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted">
                              Due Date
                            </span>
                            <span className="text-sm font-bold text-ink">
                              {new Date(project.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted">
                              Progress
                            </span>
                            <span className="text-xs font-bold text-ink">
                              {project.members?.length || 0 * 10}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-brand-500 to-violetSoft"
                              style={{
                                width: `${Math.min((project.members?.length || 0) * 10, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {project.members && project.members.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {project.members.map((member) => (
                            <div
                              key={member.user?._id}
                              className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-ink">
                                  {member.user?.username || "User"}
                                </p>
                                <p className="truncate text-xs text-muted">
                                  {member.user?.email} • {member.role}
                                </p>
                              </div>
                              {canManageProject(project) &&
                                member.user?._id !== currentUser?.id && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveMember(project, member)
                                    }
                                    className="rounded-lg p-1.5 text-muted transition hover:bg-rose-100 hover:text-rose-600"
                                    aria-label={`Remove ${member.user?.username}`}
                                  >
                                    <X size={15} />
                                  </button>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                      {canManageProject(project) && (
                        <form
                          onSubmit={(event) => handleAddMember(event, project)}
                          className="mt-4 space-y-2"
                        >
                          <input
                            type="text"
                            value={memberForms[project._id]?.email || ""}
                            onChange={(event) =>
                              updateMemberForm(project._id, {
                                email: event.target.value,
                              })
                            }
                            placeholder="Add by email or username"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                          />
                          <div className="grid grid-cols-[1fr_auto] gap-2">
                            <select
                              value={memberForms[project._id]?.role || "member"}
                              onChange={(event) =>
                                updateMemberForm(project._id, {
                                  role: event.target.value,
                                })
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              type="submit"
                              className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
                            >
                              Add
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-black text-ink">Create New Project</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter project name"
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
                  placeholder="Enter project description"
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Team
                </label>
                <select
                  value={formData.team}
                  onChange={(e) =>
                    setFormData({ ...formData, team: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none"
                >
                  <option value="">No team</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
