export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Pastikan user dari token tersedia
      if (!req.user || !req.user.role) {
        return res.status(403).json({
          success: false,
          message: "Role tidak ditemukan di token",
        });
      }

      // Cek apakah role user termasuk yang diizinkan
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak: Anda tidak memiliki izin",
        });
      }

      // ✅ Lolos role
      next();
    } catch (err) {
      console.error("Role Middleware Error:", err);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada middleware role",
      });
    }
  };
};
