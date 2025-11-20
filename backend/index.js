import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Import routes
import uploadRouter from "./upload.js";
import authRoutes from "./routes/authRoutes.js";
import pengajuanRoutes from "./routes/pengajuanRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import checkNikRoute from "./routes/check-nik.js";

dotenv.config();

const app = express();

// ===== GLOBAL CORS =====
const allowedOrigins = [
  "https://bukatabungan.vercel.app",
  "https://dashboard-bs.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS not allowed"));
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true,
}));

// ===== HANDLE PRELIGHT OPTIONS =====
app.options("*", cors());

// ===== BODY PARSER =====
app.use(express.json());

// ===== STATIC FILES =====
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ===== ROUTES =====
app.use("/upload", uploadRouter); // ikut global CORS

app.use("/api", checkNikRoute);
app.use("/api", authRoutes); // login route
app.use("/api/pengajuan", pengajuanRoutes);
app.use("/api", testRoutes);

// ===== 404 =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route tidak ditemukan: ${req.method} ${req.path}`
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server berjalan di http://localhost:${PORT}`));
