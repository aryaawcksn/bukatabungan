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
app.use(cors({
  origin: [
    "https://bukatabungan.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// Static files - agar file di folder uploads bisa diakses langsung
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use('/api', checkNikRoute);
app.use("/upload", uploadRouter);
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
