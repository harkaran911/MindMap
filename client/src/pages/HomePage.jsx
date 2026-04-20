import { Link } from "react-router-dom";
import { MapPin, Search, ShieldCheck, Heart, ArrowRight, Phone, Globe, Building2 } from "lucide-react";

const stats = [
  { label: "Resources listed", value: "500+" },
  { label: "Cities covered", value: "80+" },
  { label: "People helped", value: "10k+" },
];

const categories = [
  { icon: Heart,      label: "Therapists",  desc: "Licensed mental health professionals", color: "bg-teal-50 text-primary-600",  type: "therapist" },
  { icon: Phone,      label: "Hotlines",    desc: "24/7 crisis support lines",            color: "bg-rose-50 text-rose-500",     type: "hotline"   },
  { icon: Building2,  label: "Hospitals",   desc: "Inpatient & outpatient facilities",    color: "bg-indigo-50 text-indigo-500", type: "hospital"  },
  { icon: Globe,      label: "Online",      desc: "Remote sessions & digital tools",      color: "bg-amber-50 text-amber-500",   type: "online"    },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-white pt-20 pb-28 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100/40 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <ShieldCheck size={13} /> Free & confidential
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold text-zinc-900 leading-tight tracking-tight mb-6">
            Find mental health <br />
            <span className="text-primary-600">support near you</span>
          </h1>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto mb-10 leading-relaxed">
            A free, community-driven map of therapists, hotlines, hospitals,
            and online resources — because getting help shouldn't be hard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/map" className="btn-primary flex items-center justify-center gap-2 text-base px-6 py-3">
              <MapPin size={18} /> Explore the map
            </Link>
            <Link to="/map" className="btn-ghost flex items-center justify-center gap-2 text-base px-6 py-3 border border-surface-300">
              <Search size={18} /> Search resources
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-surface-200 py-10">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-zinc-900">{s.value}</p>
              <p className="text-sm text-zinc-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Browse by category</h2>
        <p className="text-zinc-500 mb-8">Find the right type of support for your needs.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(({ icon: Icon, label, desc, color, type }) => (
            <Link
              key={label}
              to={`/map?type=${type}`}
              className="card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={20} />
              </div>
              <p className="font-semibold text-zinc-800 mb-1">{label}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Browse <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Know a resource that's missing?</h2>
        <p className="text-primary-100 mb-6 text-sm max-w-md mx-auto">
          Help the community by adding therapists, hotlines, or support groups in your area.
        </p>
        <Link to="/map" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors text-sm">
          <MapPin size={16} /> Add a resource
        </Link>
      </section>
    </div>
  );
}