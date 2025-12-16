import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// Enhanced conflict detection for import
router.post("/check-data-conflict", async (req, res) => {
  try {
    const { no_id, nik, nama, email, no_hp } = req.body;
    const finalNoId = no_id || nik;

    if (!finalNoId) {
      return res.status(400).json({
        success: false,
        message: "NIK/no_id is required"
      });
    }

    const existingQuery = await pool.query(
      `SELECT 
         p.id as pengajuan_id,
         p.status, 
         p.edit_count,
         p.last_edited_at,
         c.nama,
         c.email,
         c.no_hp,
         c.tempat_lahir,
         c.tanggal_lahir
       FROM cdd_self c
       JOIN pengajuan_tabungan p ON c.pengajuan_id = p.id
       WHERE c.no_id = $1 
       LIMIT 1`,
      [finalNoId]
    );

    if (existingQuery.rows.length === 0) {
      return res.json({ 
        conflict: false, 
        message: "No existing data found" 
      });
    }

    const existing = existingQuery.rows[0];
    const isBlocked = ['pending', 'approved'].includes(existing.status);

    if (!isBlocked) {
      return res.json({ 
        conflict: false, 
        message: "Existing submission is rejected, can be replaced" 
      });
    }

    // Check for data conflicts
    const conflicts = [];
    
    if (nama && existing.nama !== nama) {
      conflicts.push({
        field: 'nama',
        existing: existing.nama,
        new: nama
      });
    }
    
    if (email && existing.email !== email) {
      conflicts.push({
        field: 'email',
        existing: existing.email,
        new: email
      });
    }
    
    if (no_hp && existing.no_hp !== no_hp) {
      conflicts.push({
        field: 'no_hp',
        existing: existing.no_hp,
        new: no_hp
      });
    }

    return res.json({
      conflict: true,
      status: existing.status,
      hasBeenEdited: existing.edit_count > 0,
      editCount: existing.edit_count || 0,
      lastEditedAt: existing.last_edited_at,
      pengajuanId: existing.pengajuan_id,
      dataConflicts: conflicts,
      message: conflicts.length > 0 
        ? `Data conflict detected in ${conflicts.length} field(s)${existing.edit_count > 0 ? ' (submission has been edited)' : ''}`
        : existing.edit_count > 0 
          ? "Submission exists and has been edited"
          : "Submission exists with same data"
    });

  } catch (err) {
    console.error("check-data-conflict error", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/check-nik", async (req, res) => {
  try {
    const { no_id, nik, email, phone } = req.query;

    const finalNoId = no_id || nik; // ✅ support dua-duanya

    if (finalNoId) {
      const cek = await pool.query(
        `SELECT 
           p.status, 
           p.edit_count,
           p.last_edited_at,
           c.nama,
           c.email,
           c.no_hp
         FROM cdd_self c
         JOIN pengajuan_tabungan p ON c.pengajuan_id = p.id
         WHERE c.no_id = $1 
         LIMIT 1`,
        [finalNoId]
      );

      if (cek.rows.length > 0) {
        const { status, edit_count, last_edited_at, nama, email, no_hp } = cek.rows[0];
        const blocked = ['pending', 'approved'].includes(status);
        
        // Enhanced response with edit information
        return res.json({ 
          exists: blocked, 
          status,
          hasBeenEdited: edit_count > 0,
          editCount: edit_count || 0,
          lastEditedAt: last_edited_at,
          existingData: blocked ? {
            nama,
            email,
            no_hp
          } : null
        });
      }

      return res.json({ exists: false, status: null });
    }

    if (email) {
      const cek = await pool.query(
        "SELECT pengajuan_id FROM cdd_self WHERE email = $1 LIMIT 1",
        [email]
      );
      return res.json({ exists: cek.rows.length > 0 });
    }

    if (phone) {
      const cek = await pool.query(
        "SELECT pengajuan_id FROM cdd_self WHERE no_hp = $1 LIMIT 1",
        [phone]
      );
      return res.json({ exists: cek.rows.length > 0 });
    }

    return res.status(400).json({
      success: false,
      message: "Query parameter required: nik/no_id, email, or phone"
    });

  } catch (err) {
    console.error("check-nik error", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// Bulk conflict check for import
router.post("/bulk-conflict-check", async (req, res) => {
  try {
    const { submissions } = req.body; // Array of submission data

    if (!Array.isArray(submissions) || submissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "submissions array is required"
      });
    }

    const results = [];
    
    for (let i = 0; i < submissions.length; i++) {
      const submission = submissions[i];
      const { no_id, nik, nama, email, no_hp } = submission;
      const finalNoId = no_id || nik;
      
      if (!finalNoId) {
        results.push({
          index: i,
          conflict: false,
          error: "Missing NIK/no_id"
        });
        continue;
      }

      try {
        const existingQuery = await pool.query(
          `SELECT 
             p.id as pengajuan_id,
             p.status, 
             p.edit_count,
             p.last_edited_at,
             c.nama,
             c.email,
             c.no_hp
           FROM cdd_self c
           JOIN pengajuan_tabungan p ON c.pengajuan_id = p.id
           WHERE c.no_id = $1 
           LIMIT 1`,
          [finalNoId]
        );

        if (existingQuery.rows.length === 0) {
          results.push({
            index: i,
            no_id: finalNoId,
            conflict: false
          });
          continue;
        }

        const existing = existingQuery.rows[0];
        const isBlocked = ['pending', 'approved'].includes(existing.status);

        if (!isBlocked) {
          results.push({
            index: i,
            no_id: finalNoId,
            conflict: false,
            message: "Can replace rejected submission"
          });
          continue;
        }

        // Check for data conflicts
        const conflicts = [];
        
        if (nama && existing.nama !== nama) {
          conflicts.push({ field: 'nama', existing: existing.nama, new: nama });
        }
        
        if (email && existing.email !== email) {
          conflicts.push({ field: 'email', existing: existing.email, new: email });
        }
        
        if (no_hp && existing.no_hp !== no_hp) {
          conflicts.push({ field: 'no_hp', existing: existing.no_hp, new: no_hp });
        }

        results.push({
          index: i,
          no_id: finalNoId,
          conflict: true,
          status: existing.status,
          hasBeenEdited: existing.edit_count > 0,
          editCount: existing.edit_count || 0,
          lastEditedAt: existing.last_edited_at,
          pengajuanId: existing.pengajuan_id,
          dataConflicts: conflicts,
          severity: existing.edit_count > 0 ? 'high' : 'medium' // High severity if edited
        });

      } catch (err) {
        console.error(`Error checking conflict for index ${i}:`, err);
        results.push({
          index: i,
          no_id: finalNoId,
          conflict: false,
          error: "Database error"
        });
      }
    }

    // Summary
    const conflictCount = results.filter(r => r.conflict).length;
    const editedConflictCount = results.filter(r => r.conflict && r.hasBeenEdited).length;

    return res.json({
      success: true,
      totalChecked: submissions.length,
      conflictCount,
      editedConflictCount,
      results,
      summary: {
        safe: submissions.length - conflictCount,
        conflicts: conflictCount,
        editedConflicts: editedConflictCount
      }
    });

  } catch (err) {
    console.error("bulk-conflict-check error", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
