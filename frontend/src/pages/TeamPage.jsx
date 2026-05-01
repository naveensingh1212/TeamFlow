import { useEffect, useState } from "react";
import {
  Bell,
  CheckSquare,
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
  addTeamMember,
  createTeam,
  deleteTeam,
  getTeams,
  hasAuthToken,
  removeTeamMember,
  redirectToSignIn,
  searchUsers,
} from "../utils/api.js";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Users, label: "Team", path: "/team", active: true },
];

const getApiErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export default function TeamPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [memberForms, setMemberForms] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchTeams = async () => {
      if (!hasAuthToken()) {
        redirectToSignIn();
        return;
      }

      try {
        setLoading(true);
        const res = await getTeams();
        setTeams(res.data.data || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleNavClick = (path) => {
    window.history.pushState(null, null, path);
    window.dispatchEvent(new Event("teamflow:navigate"));
  };

  const handleCreateTeam = async (event) => {
    event.preventDefault();

    if (!hasAuthToken()) {
      redirectToSignIn();
      return;
    }

    try {
      if (!formData.name.trim()) {
        alert("Please enter a team name");
        return;
      }

      const res = await createTeam({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      setTeams([res.data.data, ...teams]);
      setShowModal(false);
      setFormData({ name: "", description: "" });
    } catch (error) {
      console.error("Error creating team:", error);
      alert(getApiErrorMessage(error, "Failed to create team"));
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      await deleteTeam(teamId);
      setTeams(teams.filter((team) => team._id !== teamId));
    } catch (error) {
      console.error("Error deleting team:", error);
      alert(getApiErrorMessage(error, "Failed to delete team"));
    }
  };

  const canManageTeam = (team) =>
    team.owner?._id === currentUser?.id ||
    team.owner === currentUser?.id ||
    team.members?.some(
      (member) =>
        member.user?._id === currentUser?.id && member.role === "admin"
    );

  const updateMemberForm = (teamId, updates) => {
    setMemberForms((current) => ({
      ...current,
      [teamId]: {
        email: "",
        role: "member",
        ...(current[teamId] || {}),
        ...updates,
      },
    }));
  };

  const handleAddMember = async (event, team) => {
    event.preventDefault();

    const form = memberForms[team._id] || {};
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

      const teamRes = await addTeamMember(team._id, {
        userId: user._id,
        role: form.role || "member",
      });

      setTeams(teams.map((item) => (item._id === team._id ? teamRes.data.data : item)));
      updateMemberForm(team._id, { email: "", role: "member" });
    } catch (error) {
      console.error("Error adding team member:", error);
      alert(getApiErrorMessage(error, "Failed to add team member"));
    }
  };

  const handleRemoveMember = async (team, member) => {
    if (!confirm("Remove this member from the team?")) return;

    try {
      const teamRes = await removeTeamMember(team._id, member.user._id);
      setTeams(teams.map((item) => (item._id === team._id ? teamRes.data.data : item)));
    } catch (error) {
      console.error("Error removing team member:", error);
      alert(getApiErrorMessage(error, "Failed to remove team member"));
    }
  };

  const memberCount = new Set(
    teams.flatMap((team) => team.members?.map((member) => member.user?._id))
  ).size;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-brand-500" />
          <p className="mt-4 text-muted">Loading teams...</p>
        </div>
      </div>
    );
  }

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
                placeholder="Search teams..."
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
                  Team
                </h1>
                <p className="mt-1 text-sm font-medium text-muted">
                  Create teams and manage workspace membership.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setShowModal(true)}
                className="min-h-9 px-4 py-2"
              >
                <Plus size={17} /> New Team
              </Button>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="text-sm font-medium text-muted">Total Teams</p>
                <p className="mt-2 text-3xl font-black text-ink">
                  {teams.length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="text-sm font-medium text-muted">Members</p>
                <p className="mt-2 text-3xl font-black text-ink">
                  {memberCount}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="text-sm font-medium text-muted">Your Role</p>
                <p className="mt-2 text-3xl font-black text-ink">Admin</p>
              </div>
            </section>

            <section>
              {teams.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                  <div className="mb-4 flex justify-center">
                    <Users size={48} className="text-muted opacity-50" />
                  </div>
                  <p className="mb-4 text-muted">
                    No teams yet. Create one to start organizing members.
                  </p>
                  <Button type="button" onClick={() => setShowModal(true)}>
                    <Plus size={17} /> Create First Team
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {teams.map((team) => (
                    <article
                      key={team._id}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:shadow-lg"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-black text-ink">
                            {team.name}
                          </h3>
                          <p className="mt-1 text-xs font-medium text-muted">
                            {team.members?.length || 0} members
                          </p>
                        </div>
                        {canManageTeam(team) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTeam(team._id)}
                            className="rounded-lg p-2 text-muted transition hover:bg-rose-100 hover:text-rose-600"
                            aria-label={`Delete ${team.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      {team.description && (
                        <p className="mb-4 line-clamp-2 text-sm text-muted">
                          {team.description}
                        </p>
                      )}

                      <div className="border-t border-slate-200 pt-3">
                        <p className="mb-3 text-xs font-bold uppercase text-muted">
                          Members
                        </p>
                        <div className="space-y-2">
                          {team.members?.map((member) => (
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
                              {canManageTeam(team) &&
                                member.user?._id !== currentUser?.id && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMember(team, member)}
                                    className="rounded-lg p-1.5 text-muted transition hover:bg-rose-100 hover:text-rose-600"
                                    aria-label={`Remove ${member.user?.username}`}
                                  >
                                    <X size={15} />
                                  </button>
                                )}
                            </div>
                          ))}
                        </div>
                        {canManageTeam(team) && (
                          <form
                            onSubmit={(event) => handleAddMember(event, team)}
                            className="mt-4 space-y-2"
                          >
                            <input
                              type="text"
                              value={memberForms[team._id]?.email || ""}
                              onChange={(event) =>
                                updateMemberForm(team._id, {
                                  email: event.target.value,
                                })
                              }
                              placeholder="Add by email or username"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                            />
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                              <select
                                value={memberForms[team._id]?.role || "member"}
                                onChange={(event) =>
                                  updateMemberForm(team._id, {
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
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-black text-ink">Create New Team</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
                aria-label="Close team form"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-ink">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                  placeholder="Enter team name"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-ink">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      description: event.target.value,
                    })
                  }
                  placeholder="Enter team description"
                  rows="3"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-muted transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-brand-500 to-violetSoft px-4 py-2 text-sm font-bold text-white transition hover:shadow-card"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
