"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import {
  LuLayoutDashboard,
  LuUsers,
  LuShield,
  LuDatabase,
  LuFileText,
} from "react-icons/lu";
import { API } from "../../../../config/Config";
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const params = useParams();
  const projectId = params.project as string;

  const [activeTab, setActiveTab] = useState("overview");
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "" });
  const [overviewData, setOverviewData] = useState({
    users: 0,
    logs: 0,
    auth: { ep: false, eo: false },
  });

  const { data: session } = useSession();
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isTogglingEp, setIsTogglingEp] = useState(false);
  const [isTogglingEo, setIsTogglingEo] = useState(false);
  const [users, setUsers] = useState<
    Array<{
      _id: string;
      email: string;
      status: string;
      isBlocked?: boolean;
      createdAt?: string;
      updatedAt?: string;
    }>
  >([]);
  const [usersPage, setUsersPage] = useState(1);
  const usersPageSize = 10;
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersHasMore, setUsersHasMore] = useState(true);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [togglingUserEmail, setTogglingUserEmail] = useState<string | null>(
    null
  );

  // Logs state (API shape: {_id, log, createdAt, updatedAt})
  const [logs, setLogs] = useState<
    Array<{
      _id: string;
      log: string;
      createdAt: string;
      updatedAt: string;
    }>
  >([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Database records (from API)
  const [dbRecords, setDbRecords] = useState<
    Array<{
      _id: string;
      type: string;
      data: string;
      createdAt: string;
      updatedAt: string;
    }>
  >([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [dbPage, setDbPage] = useState(1);
  const dbPageSize = 10;
  const [dbHasMore, setDbHasMore] = useState(true);

  // Fetch overview data
  const fetchOverviewData = async () => {
    try {
      const response = await fetch(`${API}/d/overview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch overview data");
      }

      const data = await response.json();
      if (data.success) {
        setOverviewData({
          users: data.users || 0,
          logs: data.logs || 0,
          auth: data.auth || { ep: false, eo: false },
        });
      }
    } catch (error) {
      console.error("Error fetching overview data:", error);
    } finally {
      setIsLoadingOverview(false);
    }
  };

  // Toggle Email/Password individually
  const toggleEp = async () => {
    if (isTogglingEp) return;
    setIsTogglingEp(true);
    try {
      const response = await fetch(`${API}/d/authmethods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          method: "ep",
          value: !overviewData.auth.ep,
        }),
      });
      if (!response.ok) throw new Error("Failed to toggle Email/Password");
      const data = await response.json();
      if (data.success) {
        const nextEp =
          data.auth && typeof data.auth.ep !== "undefined"
            ? !!data.auth.ep
            : !overviewData.auth.ep;
        // Update only EP locally; leave EO as-is
        setOverviewData((prev) => ({
          ...prev,
          auth: { ...prev.auth, ep: nextEp },
        }));
      }
    } catch (error) {
      console.error("Error toggling Email/Password:", error);
    } finally {
      setIsTogglingEp(false);
    }
  };

  // Toggle Email OTP individually
  const toggleEo = async () => {
    if (isTogglingEo) return;
    setIsTogglingEo(true);
    try {
      const response = await fetch(`${API}/d/authmethods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          method: "eo",
          value: !overviewData.auth.eo,
        }),
      });
      if (!response.ok) throw new Error("Failed to toggle Email OTP");
      const data = await response.json();
      if (data.success) {
        const nextEo =
          data.auth && typeof data.auth.eo !== "undefined"
            ? !!data.auth.eo
            : !overviewData.auth.eo;
        // Update only EO locally; leave EP as-is
        setOverviewData((prev) => ({
          ...prev,
          auth: { ...prev.auth, eo: nextEo },
        }));
      }
    } catch (error) {
      console.error("Error toggling Email OTP:", error);
    } finally {
      setIsTogglingEo(false);
    }
  };

  // Fetch overview data on component mount
  useEffect(() => {
    if (projectId) {
      fetchOverviewData();
    }
  }, [projectId]);

  // Fetch logs when Logs tab is active
  const fetchLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const response = await fetch(`${API}/d/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "logs" && projectId) {
      fetchLogs();
    }
  }, [activeTab, projectId]);

  // Fetch users for Users tab with pagination
  const fetchUsers = async (page: number) => {
    try {
      setIsLoadingUsers(true);
      const from = (page - 1) * usersPageSize + 1;
      const to = page * usersPageSize;
      const response = await fetch(`${API}/d/getusers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, from, to }),
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
        const hasMore = data.pagination?.hasMore;
        setUsersHasMore(
          typeof hasMore === "boolean"
            ? hasMore
            : data.users.length === usersPageSize
        );
      } else {
        setUsers([]);
        setUsersHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setUsersHasMore(false);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users" && projectId) {
      fetchUsers(usersPage);
    }
  }, [activeTab, projectId, usersPage]);

  // Fetch database records for Database tab
  const fetchDb = async (page: number) => {
    try {
      setIsLoadingDb(true);
      const from = (page - 1) * dbPageSize + 1;
      const to = page * dbPageSize;
      const email = session?.user?.email || "";
      const response = await fetch(`${API}/d/getinternalDB`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, email, from, to }),
      });
      if (!response.ok) throw new Error("Failed to fetch database records");
      const data = await response.json();
      if (data.success && Array.isArray(data.records)) {
        setDbRecords(data.records);
        setDbHasMore(data.records.length === dbPageSize);
      } else {
        setDbRecords([]);
        setDbHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching database records:", error);
      setDbRecords([]);
      setDbHasMore(false);
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    if (activeTab === "database" && projectId) {
      fetchDb(dbPage);
    }
  }, [activeTab, projectId, dbPage]);

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: LuLayoutDashboard },
    { id: "users", label: "Users", icon: LuUsers },
    { id: "database", label: "Database", icon: LuDatabase },
    { id: "logs", label: "Logs", icon: LuFileText },
  ];

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) return;
    try {
      setAddUserError(null);
      setIsAddingUser(true);
      const response = await fetch(`${API}/d/adduser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          projectId,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to add user");
      }
      const data = await response.json();
      if (data.success && data.user) {
        setUsers((prev) => [
          { _id: data.user._id, email: data.user.email, status: "active" },
          ...prev,
        ]);
        setNewUser({ email: "", password: "" });
        setShowAddUser(false);
      }
    } catch (error) {
      console.error("Add user error:", error);
      setAddUserError("Failed to add user");
    } finally {
      setIsAddingUser(false);
    }
  };

  const toggleUserStatus = async (email: string) => {
    try {
      setTogglingUserEmail(email);
      const response = await fetch(`${API}/d/userstatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, projectId }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update user status");
      }
      const data = await response.json();
      if (data.success && data.status) {
        setUsers((prev) =>
          prev.map((u) =>
            u.email === email ? { ...u, status: data.status } : u
          )
        );
      }
    } catch (error) {
      console.error("User status update error:", error);
    } finally {
      setTogglingUserEmail(null);
    }
  };

  const stats = [
    {
      title: "Number of Users",
      value: isLoadingOverview ? "..." : overviewData.users.toString(),
      change: "+12.5%",
      changeType: "positive",
      icon: LuUsers,
    },
    {
      title: "Total Logs",
      value: isLoadingOverview ? "..." : overviewData.logs.toString(),
      change: "+8.2%",
      changeType: "positive",
      icon: LuFileText,
    },
  ];

  return (
    <div className="h-full w-full flex bg-[#121214] text-white">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-64 bg-[#0F0F0F]/80 border-r border-white/10 backdrop-blur-xl"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-8 text-white">Dashboard</h2>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="text-lg" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex-1 p-6 overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Project Overview
                </h1>
                <p className="text-gray-400">
                  Monitor your projects performance and activity
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-[#141415]/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <stat.icon className="text-xl text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-gray-400 text-sm">{stat.title}</p>
                  </motion.div>
                ))}
              </div>
              {/* Authentication Methods */}
              <div className="bg-[#141415]/60 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Authentication Methods
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center space-x-3">
                      <LuShield className="text-white" />
                      <span className="text-white">Email/Password</span>
                    </div>
                    <button
                      onClick={toggleEp}
                      disabled={isTogglingEp}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        overviewData.auth.ep ? "bg-green-400" : "bg-gray-500"
                      } ${isTogglingEp ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
                      aria-label="Toggle Email/Password"
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                          overviewData.auth.ep ? "right-0.5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center space-x-3">
                      <LuShield className="text-white" />
                      <span className="text-white">Email OTP</span>
                    </div>
                    <button
                      onClick={toggleEo}
                      disabled={isTogglingEo}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        overviewData.auth.eo ? "bg-green-400" : "bg-gray-500"
                      } ${isTogglingEo ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
                      aria-label="Toggle Email OTP"
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                          overviewData.auth.eo ? "right-0.5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                  User Management
                </h1>
                <p className="text-gray-400">
                  Manage users and their permissions
                </p>
              </div>

              <div className="space-y-6">
                {/* Active Users */}
                <div className="bg-[#141415]/60 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">
                      Active Users
                    </h3>
                    <button
                      onClick={() => setShowAddUser(!showAddUser)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all duration-200"
                    >
                      {showAddUser ? "Cancel" : "Add User"}
                    </button>
                  </div>

                  {/* Add User Form */}
                  {showAddUser && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <h4 className="text-white font-medium mb-4">
                        Add New User
                      </h4>
                      <div className="space-y-3">
                        {addUserError && (
                          <div className="text-red-400 text-sm">
                            {addUserError}
                          </div>
                        )}
                        <input
                          type="email"
                          placeholder="Email"
                          value={newUser.email}
                          onChange={(e) =>
                            setNewUser({ ...newUser, email: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          value={newUser.password}
                          onChange={(e) =>
                            setNewUser({ ...newUser, password: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                        />
                        <button
                          onClick={handleAddUser}
                          disabled={isAddingUser}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-all duration-200"
                        >
                          {isAddingUser ? "Saving..." : "Save User"}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    {isLoadingUsers && (
                      <div className="text-gray-400 text-sm">
                        Loading users...
                      </div>
                    )}
                    {users.length === 0 && !isLoadingUsers && (
                      <div className="text-gray-400 text-sm">
                        No users found.
                      </div>
                    )}
                    {users.map((user) => (
                      <motion.div
                        key={user._id}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                            <LuUsers className="text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {user.email}
                            </p>

                            {user.createdAt && (
                              <p className="text-gray-500 text-xs">
                                Joined:{" "}
                                {new Date(user.createdAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleUserStatus(user.email)}
                            disabled={togglingUserEmail === user.email}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                              user.status === "active"
                                ? "bg-green-400/20 text-green-400 hover:bg-red-400/20 hover:text-red-400"
                                : "bg-red-400/20 text-red-400 hover:bg-green-400/20 hover:text-green-400"
                            } ${togglingUserEmail === user.email ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {togglingUserEmail === user.email
                              ? "Updating..."
                              : user.status === "active" && !user.isBlocked
                                ? "Active"
                                : "Blocked"}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                        disabled={usersPage === 1 || isLoadingUsers}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-all duration-200"
                      >
                        Prev
                      </button>
                      <span className="text-gray-400 text-sm">
                        Page {usersPage}
                      </span>
                      <button
                        onClick={() =>
                          setUsersPage((p) => (usersHasMore ? p + 1 : p))
                        }
                        disabled={!usersHasMore || isLoadingUsers}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-all duration-200"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "database" && (
            <motion.div
              key="database"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Database</h1>
                <p className="text-gray-400">
                  Monitor database performance and manage records
                </p>
              </div>

              {/* Records Table (from API) */}
              <div className="bg-[#141415]/60 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    Database Records
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">
                          ID
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">
                          Data
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbRecords.length === 0 && !isLoadingDb && (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-6 px-4 text-center text-gray-400 text-sm"
                          >
                            No records found.
                          </td>
                        </tr>
                      )}
                      {dbRecords.map((r) => (
                        <motion.tr
                          key={r._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-all duration-200"
                        >
                          <td className="py-3 px-4 text-white font-medium">
                            {r._id}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">
                              {r.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300 text-xs max-w-[420px] truncate">
                            {typeof r.data === "string"
                              ? r.data
                              : JSON.stringify(r.data)}
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-sm">
                            {r.createdAt
                              ? new Date(r.createdAt).toLocaleString()
                              : ""}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setDbPage((p) => Math.max(1, p - 1))}
                    disabled={dbPage === 1 || isLoadingDb}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-all duration-200"
                  >
                    Prev
                  </button>
                  <span className="text-gray-400 text-sm">Page {dbPage}</span>
                  <button
                    onClick={() => setDbPage((p) => (dbHasMore ? p + 1 : p))}
                    disabled={!dbHasMore || isLoadingDb}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-all duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                  System Logs
                </h1>
                <p className="text-gray-400">
                  Monitor system activity and debug issues
                </p>
              </div>

              <div className="bg-[#141415]/60 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    Recent Logs
                  </h3>
                  <button
                    onClick={fetchLogs}
                    disabled={isLoadingLogs}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-all duration-200"
                  >
                    {isLoadingLogs ? "Loading..." : "Refresh"}
                  </button>
                </div>

                <div className="space-y-3">
                  {logs.length === 0 && !isLoadingLogs && (
                    <div className="text-gray-400 text-sm">No logs found.</div>
                  )}
                  {logs.map((log) => {
                    const ts = log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : "";
                    return (
                      <motion.div
                        key={log._id}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="px-2 py-1 rounded text-xs font-medium bg-white/10 text-gray-300">
                          LOG
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">{log.log}</p>
                          <p className="text-gray-400 text-xs">{ts}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Dashboard;
