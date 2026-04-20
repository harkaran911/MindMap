import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  MapPin,
  X,
  CheckCircle,
  AlertCircle,
  Video,
  Phone
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-teal-100 text-teal-700",
  cancelled: "bg-red-100 text-red-600",
  completed: "bg-surface-100 text-zinc-500",
};

const STATUS_ICONS = {
  pending: AlertCircle,
  confirmed: CheckCircle,
  cancelled: X,
  completed: CheckCircle,
};

export default function MyAppointmentsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: async () => (await api.get("/appointments/my")).data,
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => api.patch(`/appointments/${id}/cancel`),
    onSuccess: () => {
      toast.success("Appointment cancelled");
      queryClient.invalidateQueries(["my-appointments"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to cancel"),
  });

  const appointments = data?.appointments || [];
  const upcoming = appointments.filter((a) =>
    ["pending", "confirmed"].includes(a.status),
  );
  const past = appointments.filter((a) =>
    ["cancelled", "completed"].includes(a.status),
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const AppointmentCard = ({ appt }) => {
    const Icon = STATUS_ICONS[appt.status];
    const dateStr = new Date(appt.date).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return (
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-zinc-800">
                {appt.resourceId?.name}
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex items-center gap-1 ${STATUS_STYLES[appt.status]}`}
              >
                <Icon size={11} /> {appt.status}
              </span>
            </div>
            <p className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
              <MapPin size={11} /> {appt.resourceId?.address}
            </p>
            <p className="text-xs text-zinc-500 flex items-center gap-1 mb-1">
              <Calendar size={11} /> {dateStr}
            </p>
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              <Clock size={11} /> {appt.slot}
            </p>
            {appt.note && (
              <p className="text-xs text-zinc-400 mt-2 italic">"{appt.note}"</p>
            )}
          </div>
          {["pending", "confirmed"].includes(appt.status) && (
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => cancelMutation.mutate(appt._id)}
                disabled={cancelMutation.isPending}
                className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <X size={13} /> Cancel
              </button>
              {appt.status === "confirmed" && (
                <div className="flex items-center gap-2 mt-2">
                  <Link 
                    to={`/room/${appt._id}?mode=audio`}
                    className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2 py-1.5 rounded-full transition-colors"
                  >
                    <Phone size={10} /> Audio
                  </Link>
                  <Link 
                    to={`/room/${appt._id}?mode=video`}
                    className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-primary-100 hover:bg-primary-200 text-primary-700 px-2 py-1.5 rounded-full transition-colors"
                  >
                    <Video size={10} /> Video
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">My appointments</h1>

      {appointments.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No appointments yet</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                Upcoming
              </h2>
              <div className="space-y-3">
                {upcoming.map((a) => (
                  <AppointmentCard key={a._id} appt={a} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                Past
              </h2>
              <div className="space-y-3 opacity-70">
                {past.map((a) => (
                  <AppointmentCard key={a._id} appt={a} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
