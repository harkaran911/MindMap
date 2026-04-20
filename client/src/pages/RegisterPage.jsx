import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { MapPin, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      toast.success("Account created! Please verify your email.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-surface-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Create an account</h1>
          <p className="text-sm text-zinc-500 mt-1">Join MindMap and help your community</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Full name</label>
              <input
                type="text"
                className="input"
                placeholder="Karan Singh"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}