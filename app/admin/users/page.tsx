"use client";

import { useState, useEffect } from "react";
import {
  getAllUsers,
  updateUserRole,
  banUser,
  unbanUser,
  deleteUser,
} from "@/actions";
import { FormModal } from "@/components/admin/FormModal";
import {
  Users,
  Shield,
  Ban,
  Trash2,
  Search,
  UserCheck,
  UserX,
  MessageSquare,
  CheckCircle,
  GraduationCap,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [bannedFilter, setBannedFilter] = useState("all");
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const loadUsers = async () => {
    setLoading(true);
    const result = await getAllUsers({
      role: roleFilter === "all" ? undefined : roleFilter,
      banned: bannedFilter === "all" ? undefined : bannedFilter === "banned",
      search: searchTerm || undefined,
    });
    if (result.success && result.data) {
      setUsers(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, bannedFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleUpdateRole = async (userId: string, newRole: "user" | "teacher" | "admin") => {
    const confirmMessage = `Are you sure you want to change this user's role to ${newRole}?`;

    if (!confirm(confirmMessage)) return;

    const result = await updateUserRole(userId, newRole);
    if (result.success) {
      await loadUsers();
    } else {
      alert(result.error);
    }
  };

  const handleBan = (user: any) => {
    setSelectedUser(user);
    setIsBanModalOpen(true);
  };

  const handleUnban = async (userId: string) => {
    if (!confirm("Are you sure you want to unban this user?")) return;

    const result = await unbanUser(userId);
    if (result.success) {
      await loadUsers();
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone and will delete all their data."
      )
    )
      return;

    const result = await deleteUser(userId);
    if (result.success) {
      await loadUsers();
    } else {
      alert(result.error);
    }
  };

  const handleBanSubmit = async (data: { reason: string; expiresAt?: string }) => {
    if (!selectedUser) return;

    const result = await banUser(selectedUser.id, data);
    if (result.success) {
      setIsBanModalOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gold text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-gold mb-2">Users & Teachers</h1>
        <p className="text-gray-300">Manage user accounts and promote teachers to answer spiritual questions</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <form onSubmit={handleSearch} className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50"
            />
          </div>
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-gold/50"
        >
          <option value="all" className="bg-primary-dark">
            All Roles
          </option>
          <option value="user" className="bg-primary-dark">
            Users
          </option>
          <option value="teacher" className="bg-primary-dark">
            Teachers
          </option>
          <option value="admin" className="bg-primary-dark">
            Admins
          </option>
        </select>

        <select
          value={bannedFilter}
          onChange={(e) => setBannedFilter(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-gold/50"
        >
          <option value="all" className="bg-primary-dark">
            All Status
          </option>
          <option value="active" className="bg-primary-dark">
            Active
          </option>
          <option value="banned" className="bg-primary-dark">
            Banned
          </option>
        </select>
      </div>

      {/* Users Count */}
      <div className="text-gray-400">
        Showing {users.length} user{users.length !== 1 ? "s" : ""}
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/20">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No users found</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                    User
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                    Role
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                    Activity
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                    Joined
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || user.email}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-gold" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white">
                            {user.name || "No name"}
                          </div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-red-500/20 text-red-400"
                            : user.role === "teacher"
                            ? "bg-gold/20 text-gold"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {user.role === "admin" ? "Super Admin" : user.role === "teacher" ? "Teacher" : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.banned ? (
                        <div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                            Banned
                          </span>
                          {user.banReason && (
                            <p className="text-xs text-gray-500 mt-1">
                              {user.banReason}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {user._count.questions}
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {user._count.answers}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Role Management */}
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleUpdateRole(user.id, "admin")}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Promote to Super Admin (Full access to all settings)"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}

                        {user.role !== "teacher" && (
                          <button
                            onClick={() => handleUpdateRole(user.id, "teacher")}
                            className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                            title="Promote to Teacher (Restricted to answering questions)"
                          >
                            <GraduationCap className="w-4 h-4" />
                          </button>
                        )}

                        {user.role !== "user" && (
                          <button
                            onClick={() => handleUpdateRole(user.id, "user")}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Demote to Regular User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}

                        {user.banned ? (
                          <button
                            onClick={() => handleUnban(user.id)}
                            className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Unban User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBan(user)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Ban User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      <FormModal
        isOpen={isBanModalOpen}
        onClose={() => {
          setIsBanModalOpen(false);
          setSelectedUser(null);
        }}
        title="Ban User"
      >
        <BanForm
          onSubmit={handleBanSubmit}
          onCancel={() => {
            setIsBanModalOpen(false);
            setSelectedUser(null);
          }}
        />
      </FormModal>
    </div>
  );
}

function BanForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: { reason: string; expiresAt?: string }) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    reason: "",
    expiresAt: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      reason: formData.reason,
      expiresAt: formData.expiresAt || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Ban Reason *
        </label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50"
          placeholder="Reason for banning this user..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Ban Expires (Optional)
        </label>
        <input
          type="datetime-local"
          name="expiresAt"
          value={formData.expiresAt}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-gold/50"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty for permanent ban
        </p>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          Ban User
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
