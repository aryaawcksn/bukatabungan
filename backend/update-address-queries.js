import fs from 'fs';

// Read the controller file
let content = fs.readFileSync('./controllers/pengajuanController.js', 'utf8');

// Pattern to find and replace address queries
const patterns = [
  {
    // Pattern 1: Basic alamat_id AS alamat pattern
    find: /cs\.alamat_id AS alamat,\s*cs\.alamat_now AS alamat_domisili,\s*cs\.kode_pos_id AS kode_pos,/g,
    replace: `cs.alamat_id AS alamat,
        cs.alamat_jalan,
        cs.provinsi,
        cs.kota,
        cs.kecamatan,
        cs.kelurahan,
        cs.alamat_now AS alamat_domisili,
        cs.kode_pos_id AS kode_pos,`
  }
];

// Apply replacements
patterns.forEach(pattern => {
  const matches = content.match(pattern.find);
  if (matches) {
    console.log(`Found ${matches.length} matches for pattern`);
    content = content.replace(pattern.find, pattern.replace);
  }
});

// Write back to file
fs.writeFileSync('./controllers/pengajuanController.js', content);
console.log('✅ Updated address queries in pengajuanController.js');