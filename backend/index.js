import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "./middleware/auth.js";
import uploadRouter from "./upload.js";  // ⬅️ tambahkan ini di paling atas
import path from "path";    
import nodemailer from "nodemailer";
import axios from "axios";
import { Resend } from 'resend';



dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 Koneksi ke PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});


// ✅ Route test koneksi
app.get("/api/cek-koneksi", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route login admin
// ✅ Route login admin
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM admin WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Username tidak ditemukan" });
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Password salah" });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, cabang: admin.cabang },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      message: "Login berhasil",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        cabang: admin.cabang,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
});

// route upload
app.use("/upload", uploadRouter); // <--- hubungkan router upload

// agar file di folder uploads bisa diakses langsung
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Route register admin (baru)
app.post("/api/register", async (req, res) => {
  try {
    const { username, password, cabang } = req.body;

    if (!username || !password || !cabang) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
    }

    // Cek apakah username sudah ada
    const existing = await pool.query("SELECT * FROM admin WHERE username = $1", [username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Username sudah digunakan" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke database
    const result = await pool.query(
      "INSERT INTO admin (username, password, cabang) VALUES ($1, $2, $3) RETURNING id, username, cabang",
      [username, hashedPassword, cabang]
    );

    res.json({ success: true, message: "Admin berhasil didaftarkan", admin: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Route kirim form
app.post("/api/pengajuan", async (req, res) => {
  try {
    const {
      nama_lengkap,
      nik,
      email,
      no_hp,
      tanggal_lahir,
      alamat,
      provinsi,
      kota,
      kode_pos,
      pekerjaan,
      penghasilan,
      cabang_pengambilan,
      foto_ktp,       // 🟢 tambahkan ini
      foto_selfie,    // 🟢 dan ini
    } = req.body;

    // dukung beberapa nama field dari frontend
    const jenis_kartu = req.body.jenis_kartu || req.body.card_type || req.body.cardType;

    // Generate kode referensi unik
    const kode_referensi = `REF-${Math.floor(Math.random() * 1000000)}`;

    // Cek apakah kolom status ada di tabel
    let hasStatusColumn = false;
    try {
      const checkColumn = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'pengajuan_tabungan' AND column_name = 'status'
      `);
      hasStatusColumn = checkColumn.rows.length > 0;
    } catch (err) {
      hasStatusColumn = false;
    }

    // 🟢 Query SQL baru dengan kolom foto_ktp dan foto_selfie
    let query, values;
    if (hasStatusColumn) {
      query = `
        INSERT INTO pengajuan_tabungan 
        (kode_referensi, nama_lengkap, nik, email, no_hp, tanggal_lahir, alamat, provinsi, kota, kode_pos, pekerjaan, penghasilan, cabang_pengambilan, jenis_kartu, status, foto_ktp, foto_selfie)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        RETURNING *;
      `;
      values = [
        kode_referensi,
        nama_lengkap,
        nik,
        email,
        no_hp,
        tanggal_lahir,
        alamat,
        provinsi,
        kota,
        kode_pos,
        pekerjaan,
        penghasilan,
        cabang_pengambilan,
        jenis_kartu,
        req.body.status || "pending",
        foto_ktp,
        foto_selfie,
      ];
    } else {
      query = `
        INSERT INTO pengajuan_tabungan 
        (kode_referensi, nama_lengkap, nik, email, no_hp, tanggal_lahir, alamat, provinsi, kota, kode_pos, pekerjaan, penghasilan, cabang_pengambilan, jenis_kartu, foto_ktp, foto_selfie)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        RETURNING *;
      `;
      values = [
        kode_referensi,
        nama_lengkap,
        nik,
        email,
        no_hp,
        tanggal_lahir,
        alamat,
        provinsi,
        kota,
        kode_pos,
        pekerjaan,
        penghasilan,
        cabang_pengambilan,
        jenis_kartu,
        foto_ktp,
        foto_selfie,
      ];
    }

    const result = await pool.query(query, values);

    res.json({
      success: true,
      message: "Data berhasil disimpan",
      kode_referensi,
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ✅ Route ambil semua pengajuan
app.get("/api/pengajuan", verifyToken, async (req, res) => {
  try {
    const adminCabang = req.user.cabang; // cabang dari token login

    // Cek apakah kolom status ada
    let hasStatusColumn = false;
    try {
      const checkColumn = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'pengajuan_tabungan' AND column_name = 'status'
      `);
      hasStatusColumn = checkColumn.rows.length > 0;
    } catch (err) {
      hasStatusColumn = false;
    }

    // 🟢 Tambahkan kolom foto_ktp dan foto_selfie di SELECT
    const query = hasStatusColumn
      ? `
        SELECT 
          id,
          kode_referensi,
          nama_lengkap,
          nik,
          email,
          no_hp,
          tanggal_lahir,
          alamat,
          provinsi,
          kota,
          kode_pos,
          pekerjaan,
          penghasilan,
          cabang_pengambilan,
          jenis_kartu,
          COALESCE(status, 'pending') AS status,
          foto_ktp,
          foto_selfie,
          created_at
        FROM pengajuan_tabungan
        WHERE cabang_pengambilan = $1
        ORDER BY created_at DESC;
      `
      : `
        SELECT 
          id,
          kode_referensi,
          nama_lengkap,
          nik,
          email,
          no_hp,
          tanggal_lahir,
          alamat,
          provinsi,
          kota,
          kode_pos,
          pekerjaan,
          penghasilan,
          cabang_pengambilan,
          jenis_kartu,
          'pending' AS status,
          foto_ktp,
          foto_selfie,
          created_at
        FROM pengajuan_tabungan
        WHERE cabang_pengambilan = $1
        ORDER BY created_at DESC;
      `;

    const result = await pool.query(query, [adminCabang]);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ✅ Route update status pengajuan
app.put("/api/pengajuan/:id", async (req, res) => {
  const { id } = req.params;
  const { status, sendEmail, sendWhatsApp, message } = req.body;
  const resend = new Resend(process.env.RESEND_API_KEY);

console.log("REQUEST BODY:", req.body);
console.log("sendEmail:", sendEmail, "sendWhatsApp:", sendWhatsApp, "message:", message);

  try {
    // 🔹 Update status di database
    const result = await pool.query(
      "UPDATE pengajuan_tabungan SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

    const user = result.rows[0];
    const fullName = user.nama_lengkap;
    const email = user.email;
    const phone = user.no_hp;

    // 🔹 Kirim Email (kalau dipilih)
    if (sendEmail) {
      try {
        const emailMessage = message || (status === "approved"
          ? "Selamat! Permohonan pembukaan rekening tabungan Anda telah disetujui.\n\nSilakan kunjungi kantor cabang terdekat dengan membawa dokumen asli untuk proses aktivasi rekening.\n\nTerima kasih telah mempercayai layanan kami."
          : "Mohon maaf, permohonan pembukaan rekening tabungan Anda tidak dapat kami setujui saat ini.\n\nHal ini dikarenakan data atau dokumen yang Anda berikan belum memenuhi persyaratan.\n\nAnda dapat mengajukan permohonan kembali setelah melengkapi dokumen yang diperlukan.");

        const emailHtml = emailMessage.replace(/\n/g, '<br/>');

        const response = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: email,
          subject: status === "approved"
            ? "Permohonan Rekening Anda Disetujui ✅"
            : "Permohonan Rekening Anda Ditolak ❌",
          html: `
            <h3>Halo ${fullName},</h3>
            <p>${emailHtml}</p>
            <br/>
            <small>Pesan otomatis dari sistem Bank Sleman</small>
          `,
        });

        console.log("✅ Email berhasil dikirim:", response);
      } catch (emailError) {
        console.error("❌ Error saat mengirim email:", emailError.message);
        // jangan gagalkan request
      }
    }

    // 🔹 Kirim WhatsApp (kalau dipilih)
    if (sendWhatsApp) {
      try {
        if (!process.env.FONNTE_TOKEN) {
          console.error("❌ FONNTE_TOKEN tidak ditemukan di .env");
          throw new Error("Konfigurasi WhatsApp tidak lengkap. Pastikan FONNTE_TOKEN sudah diatur di file .env");
        }

        // Gunakan custom message jika ada, atau default message
        const whatsappMessage = message || (status === "approved"
          ? `Halo ${fullName}! 🎉 Permohonan rekening Anda telah disetujui. Silakan kunjungi kantor cabang untuk aktivasi.`
          : `Halo ${fullName}, permohonan rekening Anda belum disetujui. Silakan hubungi cabang terdekat untuk info lebih lanjut.`);

        await axios.post(
          "https://api.fonnte.com/send",
          {
            target: phone,
            message: whatsappMessage,
          },
          {
            headers: { Authorization: process.env.FONNTE_TOKEN },
          }
        );
        console.log("✅ WhatsApp berhasil dikirim ke:", phone);
      } catch (whatsappError) {
        console.error("❌ Error saat mengirim WhatsApp:", whatsappError.message);
        // Jangan gagalkan seluruh request jika WhatsApp gagal
      }
    }

    res.json({ success: true, message: "Status diperbarui dan notifikasi dikirim" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

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
