import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { MapPin, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`text-sm font-medium transition-colors duration-200 ${
        location.pathname === to
          ? "text-primary-600"
          : "text-zinc-500 hover:text-zinc-800"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="font-semibold text-zinc-800 text-sm">MindMap</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLink("/", "Home")}
            {navLink("/map", "Find Resources")}
            {user?.role === "admin" && navLink("/admin", "Admin")}
            {user && navLink("/appointments", "My Appointments")}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-zinc-500">
                  Hey, {user.name.split(" ")[0]}
                </span>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="btn-ghost flex items-center gap-1.5 text-sm"
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn-ghost flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-surface-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white px-4 py-4 flex flex-col gap-4">
          {navLink("/", "Home")}
          {navLink("/map", "Find Resources")}
          {user?.role === "admin" && navLink("/admin", "Admin")}
          <div className="border-t border-surface-200 pt-4 flex flex-col gap-3">
            {user ? (
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 text-left font-medium"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-zinc-600"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary text-sm text-center"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
