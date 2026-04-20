import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
import express      from "express";
import dotenv       from "dotenv";
import cors         from "cors";
import cookieParser from "cookie-parser";
import http         from "http";
import { Server }   from "socket.io";
import helmet       from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss          from "xss-clean";
import { connectDB } from "./config/db.js";

import authRoutes     from "./routes/auth.routes.js";
import resourceRoutes from "./routes/resource.routes.js";
import reviewRoutes   from "./routes/review.routes.js";
import reportRoutes   from "./routes/report.routes.js";
import adminRoutes    from "./routes/admin.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(helmet());
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use(cookieParser());

app.use("/api/auth",      authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/reviews",   reviewRoutes);
app.use("/api/reports",   reportRoutes);
app.use("/api/admin",     adminRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke on our end" });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    // Notify others in room
    socket.to(roomId).emit("user-connected", socket.id);

    // Relay WebRTC flows
    socket.on("offer", (payload) => socket.to(roomId).emit("offer", payload));
    socket.on("answer", (payload) => socket.to(roomId).emit("answer", payload));
    socket.on("ice-candidate", (candidate) => socket.to(roomId).emit("ice-candidate", candidate));
    
    // Relay UI state (camera/mic toggles)
    socket.on("toggle-media", (status) => {
      socket.to(roomId).emit("user-toggled-media", { userId: socket.id, ...status });
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", socket.id);
    });
  });
});

server.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);