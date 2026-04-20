import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import ResourceDetailPage from "./pages/ResourceDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import BookingPage from "./pages/BookingPage";
import MyAppointmentsPage from "./pages/MyAppointmentsPage";
import EmergencyOverlay from "./components/ui/EmergencyOverlay";
import TelehealthRoom from "./pages/TelehealthRoom";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <EmergencyOverlay />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/resources/:id" element={<ResourceDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources/:id/book"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <MyAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute>
              <TelehealthRoom />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
