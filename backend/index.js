import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser"; // ✅ WAJIB ADA

// Import routes
import uploadRouter from "./upload.js";
import authRoutes from "./routes/authRoutes.js";
import pengajuanRoutes from "./routes/pengajuanRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import checkNikRoute from "./routes/check-nik.js";
import otpRoutes from "./routes/otpRoutes.js";
import cabangRoutes from "./routes/cabangRoutes.js";
import userLogRoutes from "./routes/userLogRoutes.js";

dotenv.config();

const app = express();

/* ✅ FIX ERROR RATE LIMIT + PROXY */
app.set("trust proxy", 1);

// ===== GLOBAL CORS =====
const allowedOrigins = [
  "https://bukatabungan.vercel.app",
  "https://dashboard-bs.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:8080"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS not allowed"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// ===== BODY PARSER =====
app.use(express.json());
app.use(cookieParser());

// ===== GLOBAL OPTIONS HANDLER =====
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// ===== STATIC FILES =====
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ===== ROUTES =====
app.use("/upload", uploadRouter);
app.use("/api", checkNikRoute);
app.use("/api/auth", authRoutes); // login route
app.use("/api/pengajuan", pengajuanRoutes);
app.use("/api", testRoutes);
app.use("/otp", otpRoutes);
app.use("/api/cabang", cabangRoutes);
app.use("/api", userLogRoutes);


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
