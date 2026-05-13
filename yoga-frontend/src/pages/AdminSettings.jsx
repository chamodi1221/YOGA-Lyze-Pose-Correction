import { useEffect, useState } from "react";
import {
  UserCircle,
  ShieldCheck,
  Users,
  Trash2,
  Mail,
  BadgeCheck,
} from "lucide-react";
import { userService, adminService } from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AdminSettings() {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const profile = await userService.me();
      const allUsers = await adminService.getAllUsers();

      setAdmin(profile);
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to load settings:", error);
      setErrorMessage("Failed to load settings data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(userId);
      setErrorMessage("");
      setSuccessMessage("");

      await adminService.deleteUser(userId);

      setSuccessMessage("User deleted successfully.");
      await loadSettingsData();
    } catch (error) {
      const detail = error?.response?.data?.detail;

      setErrorMessage(
        typeof detail === "string" ? detail : "Failed to delete user."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-[#F47C3C]">
          Admin Dashboard
        </p>

        <h1 className="mt-2 text-4xl font-extrabold text-[#2E2E2E]">
          Settings
        </h1>

        <p className="mt-3 max-w-2xl text-gray-600">
          Manage admin profile details and registered users from one place.
        </p>

        {successMessage && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            Loading settings...
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-orange-100 p-3 text-[#F47C3C]">
                    <UserCircle size={24} />
                  </div>

                  <h2 className="text-xl font-bold text-[#2E2E2E]">
                    Admin Profile
                  </h2>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-500">Username</p>
                    <p className="mt-1 font-semibold text-gray-800">
                      {admin?.username || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="mt-1 font-semibold text-gray-800">
                      {admin?.email || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Role</p>
                    <p className="mt-1 font-semibold capitalize text-[#F47C3C]">
                      {admin?.role || "admin"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-green-100 p-3 text-green-600">
                    <ShieldCheck size={24} />
                  </div>

                  <h2 className="text-xl font-bold text-[#2E2E2E]">
                    Account Status
                  </h2>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span className="mt-2 inline-flex rounded-full bg-green-100 px-4 py-1 text-xs font-bold text-green-700">
                      {admin?.is_active === false ? "Inactive" : "Active"}
                    </span>
                  </div>

                  <div>
                    <p className="text-gray-500">User ID</p>
                    <p className="mt-1 font-semibold text-gray-800">
                      {admin?.id || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-100 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-orange-100 p-3 text-[#F47C3C]">
                    <Users size={24} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-[#2E2E2E]">
                      User Management
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      View registered users and delete user accounts.
                    </p>
                  </div>
                </div>

                <div className="rounded-full bg-[#FFF3EC] px-4 py-2 text-sm font-bold text-[#F47C3C]">
                  {users.length} Users
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAFAFA] text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => {
                      const isCurrentAdmin = user.id === admin?.id;
                      const isAdmin = user.role === "admin";

                      return (
                        <tr key={user.id} className="hover:bg-[#FFF8F3]">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0E7] font-bold text-[#F47C3C]">
                                {user.username?.charAt(0)?.toUpperCase() || "U"}
                              </div>

                              <div>
                                <p className="font-bold text-[#2E2E2E]">
                                  {user.username}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID: {user.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail size={14} />
                              {user.email}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold capitalize text-[#F47C3C]">
                              {user.role || "user"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                              <BadgeCheck size={13} />
                              {user.is_active === false ? "Inactive" : "Active"}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={
                                deletingId === user.id ||
                                isCurrentAdmin ||
                                isAdmin
                              }
                              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 size={14} />
                              {deletingId === user.id ? "Deleting..." : "Delete"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {users.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No users found.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminSettings;