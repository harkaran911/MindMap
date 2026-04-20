import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Clock, ArrowLeft, CheckCircle } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function DatePicker({ value, onChange }) {
  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {dates.map((d) => {
        const str = d.toISOString().split("T")[0];
        const isSelected = value === str;
        return (
          <button
            key={str}
            onClick={() => onChange(str)}
            className={`flex-shrink-0 flex flex-col items-center w-14 py-3 rounded-xl border transition-all ${
              isSelected
                ? "bg-primary-600 border-primary-600 text-white"
                : "border-surface-300 hover:border-primary-300 text-zinc-600"
            }`}
          >
            <span className="text-xs font-medium">{DAYS[d.getDay()]}</span>
            <span className="text-lg font-bold">{d.getDate()}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [note, setNote] = useState("");
  const [booked, setBooked] = useState(false);

  const { data: resource } = useQuery({
    queryKey: ["resource", id],
    queryFn: async () => (await api.get(`/resources/${id}`)).data.resource,
  });

  const { data: availability, isLoading: slotsLoading } = useQuery({
    queryKey: ["slots", id, date],
    queryFn: async () =>
      (await api.get(`/appointments/availability/${id}?date=${date}`)).data,
    enabled: !!date,
  });

  const bookMutation = useMutation({
    mutationFn: () =>
      api.post("/appointments", { resourceId: id, date, slot, note }),
    onSuccess: () => setBooked(true),
    onError: (err) =>
      toast.error(err.response?.data?.message || "Booking failed"),
  });

  if (booked)
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">
          Appointment requested!
        </h1>
        <p className="text-zinc-500 text-sm mb-6">
          You'll receive a confirmation email once the resource confirms your
          slot.
        </p>
        <button
          onClick={() => navigate("/appointments")}
          className="btn-primary"
        >
          View my appointments
        </button>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">
          Book an appointment
        </h1>
        {resource && <p className="text-zinc-500 mt-1">{resource.name}</p>}
      </div>

      <div className="space-y-6">
        {/* Date picker */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-primary-600" />
            <h2 className="font-semibold text-zinc-800">Select a date</h2>
          </div>
          <DatePicker
            value={date}
            onChange={(d) => {
              setDate(d);
              setSlot("");
            }}
          />
        </div>

        {/* Slot picker */}
        {date && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-primary-600" />
              <h2 className="font-semibold text-zinc-800">
                Select a time slot
              </h2>
            </div>
            {slotsLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : availability?.slots?.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-4">
                No slots available on this date
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availability?.slots?.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={`py-2 text-sm rounded-xl border transition-all ${
                      slot === s
                        ? "bg-primary-600 border-primary-600 text-white font-medium"
                        : "border-surface-300 hover:border-primary-300 text-zinc-600"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Note */}
        {slot && (
          <div className="card">
            <h2 className="font-semibold text-zinc-800 mb-3">
              Reason for visit{" "}
              <span className="text-zinc-400 font-normal text-sm">
                (optional)
              </span>
            </h2>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Brief description of what you'd like to discuss..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button
              onClick={() => bookMutation.mutate()}
              disabled={bookMutation.isPending}
              className="btn-primary w-full mt-4 py-3 disabled:opacity-60"
            >
              {bookMutation.isPending
                ? "Booking..."
                : `Confirm booking — ${date} at ${slot}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
