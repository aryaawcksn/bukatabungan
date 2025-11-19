const express = require('express');
const router = express.Router();

router.get('/check-nik', async (req, res) => {
  const { nik } = req.query;

  const cek = await pool.query(
    'SELECT id FROM pengajuan_tabungan WHERE nik = $1 LIMIT 1',
    [nik]
  );

  if (cek.rows.length > 0) {
    return res.json({ exists: true });
  }

  res.json({ exists: false });
});

module.exports = router;
