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

// Middleware
// Global CORS
app.use(cors({
  origin: [
    "https://bukatabungan.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

app.use(express.json());

// Static
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// CORS khusus untuk upload route
app.use("/upload", cors({
  origin: [
    "https://bukatabungan.vercel.app",
    "http://localhost:5174",
    "http://localhost:5173"
  ],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// Upload route
app.use("/upload", uploadRouter);

// API routes
app.use('/api', checkNikRoute);
app.use("/api", authRoutes);
app.use("/api/pengajuan", pengajuanRoutes);
app.use("/api", testRoutes);



// ✅ Route untuk handle 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route tidak ditemukan: ${req.method} ${req.path}` 
  });
});

// Jalankan server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`)
);
