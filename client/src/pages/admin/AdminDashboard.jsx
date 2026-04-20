import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  XCircle,
  Trash2,
  Flag,
  Calendar,
  Plus,
  BarChart2,
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const TABS = ["overview", "pending", "resources", "reports", "appointments"];

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const queryClient = useQueryClient();

  const { data: allAppointments } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => (await api.get("/appointments/all")).data,
    enabled: tab === "appointments",
  });

  const confirmMutation = useMutation({
    mutationFn: (id) => api.patch(`/appointments/${id}/confirm`),
    onSuccess: () => {
      toast.success("Appointment confirmed — email sent!");
      queryClient.invalidateQueries(["admin-appointments"]);
    },
  });

  const adminCancelMutation = useMutation({
    mutationFn: (id) => api.patch(`/appointments/${id}/cancel`),
    onSuccess: () => {
      toast.success("Appointment cancelled");
      queryClient.invalidateQueries(["admin-appointments"]);
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/admin/stats")).data,
  });

  const { data: pending } = useQuery({
    queryKey: ["admin-pending"],
    queryFn: async () => (await api.get("/admin/resources/pending")).data,
    enabled: tab === "pending",
  });

  const { data: reports } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => (await api.get("/admin/reports")).data,
    enabled: tab === "reports",
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/resources/${id}/approve`),
    onSuccess: () => {
      toast.success("Resource approved!");
      queryClient.invalidateQueries(["admin-pending"]);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/resources/${id}/reject`),
    onSuccess: () => {
      toast.success("Resource rejected");
      queryClient.invalidateQueries(["admin-pending"]);
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (id) => api.delete(`/resources/${id}`),
    onSuccess: () => {
      toast.success("Deleted");
      queryClient.invalidateQueries(["admin-pending", "admin-stats"]);
    },
  });

  const resolveReportMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/reports/${id}/resolve`),
    onSuccess: () => {
      toast.success("Report resolved");
      queryClient.invalidateQueries(["admin-reports"]);
    },
  });

  const statCards = [
    {
      label: "Total resources",
      value: stats?.totalResources ?? "—",
      color: "text-primary-600",
    },
    {
      label: "Pending review",
      value: stats?.pendingCount ?? "—",
      color: "text-amber-500",
    },
    {
      label: "Total users",
      value: stats?.totalUsers ?? "—",
      color: "text-indigo-500",
    },
    {
      label: "Open reports",
      value: stats?.openReports ?? "—",
      color: "text-rose-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Admin Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage resources, reviews & reports
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 rounded-xl p-1 mb-8 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
              tab === t
                ? "bg-white text-zinc-800 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, color }) => (
            <div key={label} className="card">
              <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
              <p className="text-sm text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pending */}
      {tab === "pending" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">
            {pending?.resources?.length || 0} pending resources
          </p>
          {pending?.resources?.map((r) => (
            <div
              key={r._id}
              className="card flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold text-zinc-800 text-sm">{r.name}</p>
                <p className="text-xs text-zinc-500 capitalize">
                  {r.type} · {r.address}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Added by: {r.addedBy?.name}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => approveMutation.mutate(r._id)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                >
                  <CheckCircle size={13} /> Approve
                </button>
                <button
                  onClick={() => rejectMutation.mutate(r._id)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <XCircle size={13} /> Reject
                </button>
              </div>
            </div>
          ))}
          {pending?.resources?.length === 0 && (
            <div className="text-center py-16 text-zinc-400">
              <CheckCircle size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">All caught up — no pending resources</p>
            </div>
          )}
        </div>
      )}

      {/* Reports */}
      {tab === "reports" && (
        <div className="space-y-3">
          {reports?.reports?.map((rep) => (
            <div
              key={rep._id}
              className="card flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold text-zinc-800 text-sm">
                  {rep.resourceId?.name}
                </p>
                <p className="text-xs text-zinc-500">{rep.reason}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  By: {rep.userId?.name}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => resolveReportMutation.mutate(rep._id)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                >
                  Resolve
                </button>
                <button
                  onClick={() =>
                    deleteResourceMutation.mutate(rep.resourceId?._id)
                  }
                  className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={12} /> Delete resource
                </button>
              </div>
            </div>
          ))}
          {reports?.reports?.length === 0 && (
            <div className="text-center py-16 text-zinc-400">
              <Flag size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No open reports</p>
            </div>
          )}
        </div>
      )}

      {tab === "appointments" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">
            {allAppointments?.appointments?.length || 0} total appointments
          </p>
          {allAppointments?.appointments?.map((appt) => {
            const dateStr = new Date(appt.date).toLocaleDateString("en-IN", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            const STATUS_STYLES = {
              pending: "bg-amber-100 text-amber-700",
              confirmed: "bg-teal-100 text-teal-700",
              cancelled: "bg-red-100 text-red-600",
              completed: "bg-surface-100 text-zinc-500",
            };
            return (
              <div
                key={appt._id}
                className="card flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-zinc-800 text-sm">
                    {appt.resourceId?.name}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {appt.userId?.name} · {appt.userId?.email}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {dateStr} at {appt.slot}
                  </p>
                  {appt.note && (
                    <p className="text-xs text-zinc-400 italic mt-1">
                      "{appt.note}"
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[appt.status]}`}
                  >
                    {appt.status}
                  </span>
                  {appt.status === "pending" && (
                    <>
                      <button
                        onClick={() => confirmMutation.mutate(appt._id)}
                        disabled={confirmMutation.isPending}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => adminCancelMutation.mutate(appt._id)}
                        disabled={adminCancelMutation.isPending}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {allAppointments?.appointments?.length === 0 && (
            <div className="text-center py-16 text-zinc-400">
              <Calendar size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No appointments yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
