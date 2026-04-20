import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Phone,
  Globe,
  Star,
  ArrowLeft,
  Flag,
  Heart,
  Calendar,
} from "lucide-react";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} onClick={() => onChange(s)} type="button">
          <Star
            size={20}
            className={
              s <= value ? "text-amber-400 fill-amber-400" : "text-zinc-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: resource, isLoading } = useQuery({
    queryKey: ["resource", id],
    queryFn: async () => {
      const { data } = await api.get(`/resources/${id}`);
      return data.resource;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () => api.post(`/reviews`, { resourceId: id, rating, comment, isAnonymous }),
    onSuccess: () => {
      toast.success("Review submitted!");
      setRating(0);
      setComment("");
      setIsAnonymous(false);
      queryClient.invalidateQueries(["resource", id]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to submit review"),
  });

  const reportMutation = useMutation({
    mutationFn: () =>
      api.post(`/reports`, { resourceId: id, reason: "Incorrect information" }),
    onSuccess: () =>
      toast.success("Reported — thanks for keeping the map accurate!"),
    onError: () => toast.error("Already reported"),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!resource)
    return (
      <div className="text-center py-20 text-zinc-400">Resource not found</div>
    );

  const TYPE_COLORS = {
    therapist: "bg-teal-100 text-teal-700",
    hotline: "bg-rose-100 text-rose-700",
    hospital: "bg-indigo-100 text-indigo-700",
    ngo: "bg-amber-100 text-amber-700",
    online: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header card */}
      <div className="card mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[resource.type] || "bg-surface-100 text-zinc-600"}`}
            >
              {resource.type}
            </span>
            <h1 className="text-2xl font-bold text-zinc-900 mt-2">
              {resource.name}
            </h1>
            {resource.avgRating > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium text-zinc-700">
                  {resource.avgRating.toFixed(1)}
                </span>
                <span className="text-xs text-zinc-400">
                  ({resource.reviews?.length || 0} reviews)
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => reportMutation.mutate()}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-500 transition-colors"
          >
            <Flag size={13} /> Report
          </button>
        </div>

        <div className="space-y-2 text-sm text-zinc-600">
          {resource.address && (
            <p className="flex items-start gap-2">
              <MapPin
                size={15}
                className="mt-0.5 flex-shrink-0 text-primary-500"
              />
              {resource.address}
            </p>
          )}
          {resource.phone && (
            <p className="flex items-center gap-2">
              <Phone size={15} className="text-primary-500" />
              <a
                href={`tel:${resource.phone}`}
                className="hover:text-primary-600 hover:underline"
              >
                {resource.phone}
              </a>
            </p>
          )}
          {resource.website && (
            <p className="flex items-center gap-2">
              <Globe size={15} className="text-primary-500" />
              <a
                href={resource.website}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary-600 hover:underline truncate"
              >
                {resource.website}
              </a>
            </p>
          )}
        </div>

        {resource.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-surface-100 text-zinc-600 px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {resource.languages?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-surface-200">
            <p className="text-xs text-zinc-500 mb-2">Languages supported</p>
            <div className="flex flex-wrap gap-2">
              {resource.languages.map((l) => (
                <span
                  key={l}
                  className="text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {["therapist", "hospital"].includes(resource.type) && (
        <div className="mb-6">
          <button
            onClick={() => navigate(`/resources/${id}/book`)}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            <Calendar size={18} /> Book an appointment
          </button>
        </div>
      )}

      {/* Reviews */}
      <div className="card mb-6">
        <h2 className="font-semibold text-zinc-800 mb-4">Reviews</h2>
        {resource.reviews?.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-6">
            No reviews yet — be the first!
          </p>
        ) : (
          <div className="space-y-4">
            {resource.reviews?.map((rev) => (
              <div
                key={rev._id}
                className="pb-4 border-b border-surface-200 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-zinc-700">
                    {rev.isAnonymous ? "Anonymous User" : rev.userId?.name || "Anonymous User"}
                  </p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={
                          s <= rev.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-zinc-200"
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-zinc-500">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave a review */}
      {user ? (
        <div className="card">
          <h2 className="font-semibold text-zinc-800 mb-4">Leave a review</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-600 mb-2">Your rating</p>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1.5">
                Comment
              </label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input 
                type="checkbox" 
                checked={isAnonymous} 
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="accent-primary-600 w-4 h-4 rounded border-zinc-300"
              />
              <span className="text-sm font-medium text-zinc-600">Post Anonymously</span>
            </label>
            <button
              onClick={() => {
                if (!rating) return toast.error("Please select a rating");
                reviewMutation.mutate();
              }}
              disabled={reviewMutation.isPending}
              className="btn-primary disabled:opacity-60 w-full mt-2"
            >
              {reviewMutation.isPending ? "Submitting..." : "Submit review"}
            </button>
          </div>
        </div>
      ) : (
        <div className="card text-center text-sm text-zinc-500">
          <Heart size={20} className="mx-auto mb-2 text-primary-400" />
          <Link
            to="/login"
            className="text-primary-600 font-medium hover:underline"
          >
            Sign in
          </Link>{" "}
          to leave a review
        </div>
      )}
    </div>
  );
}
