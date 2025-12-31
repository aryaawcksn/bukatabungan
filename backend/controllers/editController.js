import pool from "../config/db.js";
import { logUserActivity } from "./userLogController.js";

/**
 * Edit submission data (only for approved submissions) - Simplified version
 */
export const editSubmission = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { editReason, ...editData } = req.body;
    const { cabang_id: adminCabang, role: userRole, id: userId } = req.user;

    console.log('✏️ Edit submission request:', {
      submissionId: id,
      userId,
      userRole,
      fieldsToEdit: Object.keys(editData)
    });

    // Check if submission exists and is approved
    const submissionQuery = `
      SELECT p.*, cs.kode_referensi, cs.nama
      FROM pengajuan_tabungan p
      LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
      WHERE p.id = $1 ${userRole === 'super' ? '' : 'AND p.cabang_id = $2'}
    `;
    
    const queryParams = userRole === 'super' ? [id] : [id, adminCabang];
    const submissionResult = await client.query(submissionQuery, queryParams);

    if (submissionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission tidak ditemukan atau tidak memiliki akses'
      });
    }

    const submission = submissionResult.rows[0];

    // Only allow editing approved submissions
    if (submission.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Hanya submission yang sudah disetujui yang dapat diedit'
      });
    }

    await client.query('BEGIN');

    // Simplified field mapping - only handle basic fields without complex validation
    const fieldMapping = {
      // cdd_self fields
      nama: { table: 'cdd_self', column: 'nama' },
      alias: { table: 'cdd_self', column: 'alias' },
      tipe_nasabah: { table: 'cdd_self', column: 'tipe_nasabah' },
      nomor_rekening_lama: { table: 'cdd_self', column: 'nomor_rekening_lama' },
      jenis_id: { table: 'cdd_self', column: 'jenis_id' },
      no_id: { table: 'cdd_self', column: 'no_id' },
      berlaku_id: { table: 'cdd_self', column: 'berlaku_id' },
      tempat_lahir: { table: 'cdd_self', column: 'tempat_lahir' },
      tanggal_lahir: { table: 'cdd_self', column: 'tanggal_lahir' },
      alamat_id: { table: 'cdd_self', column: 'alamat_id' },
      alamat_jalan: { table: 'cdd_self', column: 'alamat_jalan' },
      provinsi: { table: 'cdd_self', column: 'provinsi' },
      kota: { table: 'cdd_self', column: 'kota' },
      kecamatan: { table: 'cdd_self', column: 'kecamatan' },
      kelurahan: { table: 'cdd_self', column: 'kelurahan' },
      kode_pos_id: { table: 'cdd_self', column: 'kode_pos_id' },
      alamat_now: { table: 'cdd_self', column: 'alamat_now' },
      jenis_kelamin: { table: 'cdd_self', column: 'jenis_kelamin' },
      status_kawin: { table: 'cdd_self', column: 'status_kawin' },
      agama: { table: 'cdd_self', column: 'agama' },
      pendidikan: { table: 'cdd_self', column: 'pendidikan' },
      nama_ibu_kandung: { table: 'cdd_self', column: 'nama_ibu_kandung' },
      npwp: { table: 'cdd_self', column: 'npwp' },
      email: { table: 'cdd_self', column: 'email' },
      no_hp: { table: 'cdd_self', column: 'no_hp' },
      kewarganegaraan: { table: 'cdd_self', column: 'kewarganegaraan' },
      status_rumah: { table: 'cdd_self', column: 'status_rumah' },
      rekening_untuk_sendiri: { table: 'cdd_self', column: 'rekening_untuk_sendiri' },
      
      // cdd_job fields
      pekerjaan: { table: 'cdd_job', column: 'pekerjaan' },
      gaji_per_bulan: { table: 'cdd_job', column: 'gaji_per_bulan' },
      sumber_dana: { table: 'cdd_job', column: 'sumber_dana' },
      rata_transaksi_per_bulan: { table: 'cdd_job', column: 'rata_transaksi_per_bulan' },
      nama_perusahaan: { table: 'cdd_job', column: 'nama_perusahaan' },
      alamat_perusahaan: { table: 'cdd_job', column: 'alamat_perusahaan' },
      alamat_kantor: { table: 'cdd_job', column: 'alamat_kantor' },
      telepon_kantor: { table: 'cdd_job', column: 'telepon_kantor' },
      no_telepon: { table: 'cdd_job', column: 'no_telepon' },
      jabatan: { table: 'cdd_job', column: 'jabatan' },
      bidang_usaha: { table: 'cdd_job', column: 'bidang_usaha' },
      
      // account fields
      tabungan_tipe: { table: 'account', column: 'tabungan_tipe' },
      jenis_tabungan: { table: 'account', column: 'jenis_tabungan' },
      atm_tipe: { table: 'account', column: 'atm_tipe' },
      nominal_setoran: { table: 'account', column: 'nominal_setoran' },
      tujuan_pembukaan: { table: 'account', column: 'tujuan_pembukaan' },
      
      // cdd_reference fields
      kontak_darurat_nama: { table: 'cdd_reference', column: 'nama' },
      kontak_darurat_hp: { table: 'cdd_reference', column: 'no_hp' },
      kontak_darurat_alamat: { table: 'cdd_reference', column: 'alamat' },
      kontak_darurat_hubungan: { table: 'cdd_reference', column: 'hubungan' },
      
      // bo fields
      bo_nama: { table: 'bo', column: 'nama' },
      bo_alamat: { table: 'bo', column: 'alamat' },
      bo_tempat_lahir: { table: 'bo', column: 'tempat_lahir' },
      bo_tanggal_lahir: { table: 'bo', column: 'tanggal_lahir' },
      bo_jenis_kelamin: { table: 'bo', column: 'jenis_kelamin' },
      bo_kewarganegaraan: { table: 'bo', column: 'kewarganegaraan' },
      bo_status_pernikahan: { table: 'bo', column: 'status_pernikahan' },
      bo_jenis_id: { table: 'bo', column: 'jenis_id' },
      bo_nomor_id: { table: 'bo', column: 'nomor_id' },
      bo_sumber_dana: { table: 'bo', column: 'sumber_dana' },
      bo_hubungan: { table: 'bo', column: 'hubungan' },
      bo_nomor_hp: { table: 'bo', column: 'nomor_hp' },
      bo_pekerjaan: { table: 'bo', column: 'pekerjaan' },
      bo_pendapatan_tahun: { table: 'bo', column: 'pendapatan_tahunan' }
      
      // Note: EDD fields (edd_bank_lain, edd_pekerjaan_lain) are handled separately
      // as they use separate tables, not columns in existing tables
    };

    // Helper function to process field values - simplified with better data cleaning
    const processFieldValue = (value, fieldName) => {
      if (value === null || value === undefined || value === '') {
        return null;
      }
      
      // Handle currency values (remove "Rp" and convert to proper format)
      if (typeof value === 'string' && value.includes('Rp')) {
        // Remove "Rp", spaces, dots, and commas, then convert to number
        const cleanValue = value.replace(/Rp\s?/g, '').replace(/[.,]/g, '');
        const numValue = parseInt(cleanValue);
        return isNaN(numValue) ? null : numValue.toString();
      }
      
      // Handle boolean values
      if (fieldName === 'rekening_untuk_sendiri') {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true' || value === '1';
        }
        return Boolean(value);
      }
      
      return value;
    };

    const tableUpdates = {};
    let hasChanges = false;
    let eddBankLainData = null;
    let eddPekerjaanLainData = null;

    // Process each field to edit
    for (const [fieldName, rawValue] of Object.entries(editData)) {
      // Skip system fields that shouldn't be edited
      if (fieldName === 'isEdit') {
        continue;
      }
      
      // Skip custom fields - they are handled by frontend logic and sent as main field values
      if (fieldName.endsWith('_custom')) {
        console.log(`⚠️ Skipping custom field: ${fieldName}`);
        continue;
      }
      
      // Handle EDD fields separately
      if (fieldName === 'edd_bank_lain') {
        eddBankLainData = rawValue;
        hasChanges = true;
        continue;
      }
      
      if (fieldName === 'edd_pekerjaan_lain') {
        eddPekerjaanLainData = rawValue;
        hasChanges = true;
        continue;
      }
      
      const fieldInfo = fieldMapping[fieldName];
      
      if (!fieldInfo) {
        console.log(`⚠️ Unknown field: ${fieldName}`);
        continue;
      }

      const newValue = processFieldValue(rawValue, fieldName);
      
      // Group updates by table
      if (!tableUpdates[fieldInfo.table]) {
        tableUpdates[fieldInfo.table] = {};
      }
      tableUpdates[fieldInfo.table][fieldInfo.column] = newValue;
      hasChanges = true;
    }

    if (!hasChanges) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data yang akan diubah'
      });
    }

    // Execute table updates
    for (const [tableName, updates] of Object.entries(tableUpdates)) {
      // Skip BO table here - it will be handled separately with UPSERT
      if (tableName === 'bo') continue;
      
      const setClause = Object.keys(updates).map((col, idx) => `${col} = $${idx + 2}`).join(', ');
      const values = [id, ...Object.values(updates)];
      
      const updateQuery = `UPDATE ${tableName} SET ${setClause} WHERE pengajuan_id = $1`;
      await client.query(updateQuery, values);
    }

    // Special handling for BO table - use UPSERT
    if (tableUpdates.bo) {
      const updates = tableUpdates.bo;
      const columns = Object.keys(updates);
      const placeholders = columns.map((_, idx) => `$${idx + 2}`).join(', ');
      const updateClause = columns.map(col => `${col} = EXCLUDED.${col}`).join(', ');
      
      const upsertQuery = `
        INSERT INTO bo (pengajuan_id, ${columns.join(', ')}) 
        VALUES ($1, ${placeholders})
        ON CONFLICT (pengajuan_id) 
        DO UPDATE SET ${updateClause}
      `;
      const values = [id, ...Object.values(updates)];
      
      await client.query(upsertQuery, values);
    }

    // Special handling: Delete BO record if rekening_untuk_sendiri is changed to true
    if (tableUpdates.cdd_self && tableUpdates.cdd_self.rekening_untuk_sendiri === true) {
      const deleteBoQuery = 'DELETE FROM bo WHERE pengajuan_id = $1';
      await client.query(deleteBoQuery, [id]);
    }

    // Handle EDD Bank Lain updates
    if (eddBankLainData !== null) {
      // Delete existing EDD bank records
      await client.query('DELETE FROM edd_bank_lain WHERE pengajuan_id = $1', [id]);
      
      // Insert new EDD bank records if data exists
      if (Array.isArray(eddBankLainData) && eddBankLainData.length > 0) {
        for (let i = 0; i < eddBankLainData.length; i++) {
          const bank = eddBankLainData[i];
          if (bank.bank_name && bank.jenis_rekening && bank.nomor_rekening) {
            await client.query(`
              INSERT INTO edd_bank_lain (edd_id, pengajuan_id, bank_name, jenis_rekening, nomor_rekening)
              VALUES ($1, $2, $3, $4, $5)
            `, [i + 1, id, bank.bank_name, bank.jenis_rekening, bank.nomor_rekening]);
          }
        }
      }
    }

    // Handle EDD Pekerjaan Lain updates
    if (eddPekerjaanLainData !== null) {
      // Delete existing EDD pekerjaan records
      await client.query('DELETE FROM edd_pekerjaan_lain WHERE pengajuan_id = $1', [id]);
      
      // Insert new EDD pekerjaan records if data exists
      if (Array.isArray(eddPekerjaanLainData) && eddPekerjaanLainData.length > 0) {
        for (let i = 0; i < eddPekerjaanLainData.length; i++) {
          const pekerjaan = eddPekerjaanLainData[i];
          if (pekerjaan.jenis_usaha) {
            await client.query(`
              INSERT INTO edd_pekerjaan_lain (edd_id, pengajuan_id, jenis_usaha)
              VALUES ($1, $2, $3)
            `, [i + 1, id, pekerjaan.jenis_usaha]);
          }
        }
      }
    }

    // Update main submission record - simplified tracking
    await client.query(`
      UPDATE pengajuan_tabungan 
      SET last_edited_at = NOW(), 
          last_edited_by = $1, 
          edit_count = COALESCE(edit_count, 0) + 1
      WHERE id = $2
    `, [userId, id]);

    await client.query('COMMIT');

    // Log activity
    await logUserActivity(
      userId,
      'EDIT_SUBMISSION',
      `Edit submission ${submission.kode_referensi} (${submission.nama})`,
      adminCabang,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'Data berhasil diedit',
      editCount: (submission.edit_count || 0) + 1
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Edit submission error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengedit data',
      error: err.message
    });
  } finally {
    client.release();
  }
};

/**
 * Get simplified edit history for a submission
 */
export const getEditHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { cabang_id: adminCabang, role: userRole } = req.user;

    // Check access to submission
    const accessQuery = `
      SELECT p.id, p.edit_count, p.last_edited_at, p.last_edited_by, 
             cs.kode_referensi, cs.nama,
             u.username as last_edited_by_username
      FROM pengajuan_tabungan p
      LEFT JOIN cdd_self cs ON p.id = cs.pengajuan_id
      LEFT JOIN users u ON p.last_edited_by = u.id
      WHERE p.id = $1 ${userRole === 'super' ? '' : 'AND p.cabang_id = $2'}
    `;
    
    const accessParams = userRole === 'super' ? [id] : [id, adminCabang];
    const accessResult = await pool.query(accessQuery, accessParams);

    if (accessResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission tidak ditemukan atau tidak memiliki akses'
      });
    }

    const submission = accessResult.rows[0];

    res.json({
      success: true,
      data: {
        submission: {
          id: submission.id,
          kode_referensi: submission.kode_referensi,
          nama: submission.nama,
          edit_count: submission.edit_count || 0,
          last_edited_at: submission.last_edited_at,
          last_edited_by: submission.last_edited_by_username,
          has_been_edited: (submission.edit_count || 0) > 0
        }
      }
    });

  } catch (err) {
    console.error('❌ Get edit history error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat edit',
      error: err.message
    });
  }
};