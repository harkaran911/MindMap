import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, MapPin, Star, X, Locate } from "lucide-react";
import api from "../api/axios";
import MapView from "../components/map/MapView";
import toast from "react-hot-toast";

const TYPES    = ["all", "therapist", "hotline", "hospital", "ngo", "online"];
const LANGS    = ["English", "Hindi", "Bengali", "Tamil", "Telugu", "Punjabi"];
const INSURANCES = ["Star Health", "HDFC ERGO", "ICICI Lombard", "Niva Bupa", "Care Health"];
const TYPE_COLORS = {
  therapist: "bg-teal-100 text-teal-700",
  hotline:   "bg-rose-100 text-rose-700",
  hospital:  "bg-indigo-100 text-indigo-700",
  ngo:       "bg-amber-100 text-amber-700",
  online:    "bg-purple-100 text-purple-700",
};

function ResourceCard({ resource, onClick }) {
  return (
    <button
      onClick={() => onClick(resource._id)}
      className="w-full text-left p-4 rounded-xl border border-surface-200 bg-white hover:border-primary-300 hover:shadow-sm transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-zinc-800 text-sm leading-tight group-hover:text-primary-700 transition-colors">
          {resource.name}
        </p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap capitalize ${TYPE_COLORS[resource.type] || "bg-surface-100 text-zinc-600"}`}>
          {resource.type}
        </span>
      </div>
      <p className="text-xs text-zinc-500 flex items-center gap-1 mb-2">
        <MapPin size={11} /> {resource.address}
      </p>
      <div className="flex items-center gap-3">
        {resource.avgRating > 0 && (
          <p className="text-xs text-amber-500 flex items-center gap-1">
            <Star size={11} fill="currentColor" /> {resource.avgRating.toFixed(1)}
          </p>
        )}
        {resource.isFree ? (
          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">FREE</span>
        ) : resource.costPerSession ? (
          <span className="text-[10px] font-medium text-zinc-500 font-mono">₹{resource.costPerSession}/session</span>
        ) : null}
      </div>
    </button>
  );
}

export default function MapPage() {
  const navigate              = useNavigate();
  const [searchParams]        = useSearchParams();
  const [search, setSearch]   = useState("");
  const [type, setType]       = useState(searchParams.get("type") || "all");
  const [lang, setLang]       = useState("");
  const [minRating, setMinRating] = useState(0);
  const [insurance, setInsurance] = useState("");
  const [maxCost, setMaxCost] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showFilters, setShowFilters]   = useState(false);
  const [mapCenter, setMapCenter]       = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["resources", { search, type, lang, minRating, insurance, maxCost, isFree }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search)            params.set("search", search);
      if (type !== "all")    params.set("type", type);
      if (lang)              params.set("language", lang);
      if (minRating > 0)     params.set("minRating", minRating);
      if (insurance)         params.set("insurance", insurance);
      if (maxCost > 0)       params.set("maxCost", maxCost);
      if (isFree)            params.set("isFree", true);
      const { data } = await api.get(`/resources?${params}`);
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const resources = data?.resources || [];

  const locateMe = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation([coords.latitude, coords.longitude]);
        setMapCenter([coords.latitude, coords.longitude]);
        toast.success("Showing resources near you");
      },
      () => toast.error("Couldn't get your location")
    );
  };

  const clearFilters = () => {
    setSearch(""); setType("all"); setLang(""); setMinRating(0);
    setInsurance(""); setMaxCost(0); setIsFree(false);
  };

  const hasFilters = search || type !== "all" || lang || minRating > 0 || insurance || maxCost > 0 || isFree;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left panel */}
      <div className="w-full md:w-[380px] lg:w-[420px] flex-shrink-0 flex flex-col border-r border-surface-200 bg-white overflow-hidden">

        {/* Search bar */}
        <div className="p-4 border-b border-surface-200">
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              className="input pl-9 pr-4"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                showFilters ? "bg-primary-50 border-primary-300 text-primary-700" : "border-surface-300 text-zinc-600 hover:bg-surface-50"
              }`}
            >
              <SlidersHorizontal size={13} /> Filters
            </button>
            <button
              onClick={locateMe}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-surface-300 text-zinc-600 hover:bg-surface-50 transition-colors"
            >
              <Locate size={13} /> Near me
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 ml-auto font-medium">
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="px-4 py-3 border-b border-surface-200 bg-surface-50 space-y-3">
            {/* Type pills */}
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-2">Type</p>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`text-xs px-2.5 py-1 rounded-full border capitalize transition-colors ${
                      type === t
                        ? "bg-primary-600 text-white border-primary-600"
                        : "border-surface-300 text-zinc-600 hover:bg-surface-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Language */}
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-2">Language</p>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="input text-xs py-1.5"
              >
                <option value="">Any language</option>
                {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            {/* Min rating */}
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-2">
                Min rating: {minRating > 0 ? `${minRating}★` : "Any"}
              </p>
              <input
                type="range" min={0} max={5} step={0.5}
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
            </div>
            {/* Cost & Insurance */}
            <div className="pt-2 border-t border-surface-200">
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isFree} 
                  onChange={(e) => { setIsFree(e.target.checked); if(e.target.checked) setMaxCost(0); }}
                  className="accent-primary-600 w-4 h-4 rounded"
                />
                <span className="text-xs font-bold text-green-600">Show Free Services Only</span>
              </label>
              
              {!isFree && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 mb-1">
                      Max Cost per Session: {maxCost > 0 ? `₹${maxCost}` : "Any"}
                    </p>
                    <input
                      type="range" min={0} max={5000} step={100}
                      value={maxCost}
                      onChange={(e) => setMaxCost(Number(e.target.value))}
                      className="w-full accent-primary-600"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 mb-1">Accepted Insurance</p>
                    <select
                      value={insurance}
                      onChange={(e) => setInsurance(e.target.value)}
                      className="input text-xs py-1.5"
                    >
                      <option value="">Any Insurance</option>
                      {INSURANCES.map((ins) => <option key={ins} value={ins}>{ins}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resource list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <MapPin size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No resources found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-zinc-400 mb-3">{resources.length} results</p>
              {resources.map((r) => (
                <ResourceCard
                  key={r._id}
                  resource={r}
                  onClick={(id) => navigate(`/resources/${id}`)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative hidden md:block">
        <MapView
          resources={resources}
          center={mapCenter}
          onResourceClick={(id) => navigate(`/resources/${id}`)}
        />
      </div>
    </div>
  );
}