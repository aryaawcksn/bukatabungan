import { Document, Page, Text, View, StyleSheet, Image} from '@react-pdf/renderer';
import type { FormSubmission } from './DashboardPage';
import { type JSX } from 'react';

// ===== STYLES (COMPACT & FORMAL) =====
const PRIMARY_COLOR = '#003b80'; 
const ACCENT_COLOR = '#dfe6eeff'; 
const TEXT_DARK = '#003b80';
const TEXT_MUTED = '#64748b';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: TEXT_DARK,
    lineHeight: 1.3, // Dibuat lebih rapat
  },

  // ===== HEADER BAR (Single Definition) =====
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15, // Jarak dikurangi
    borderBottomWidth: 1.5,
    borderBottomColor: PRIMARY_COLOR,
    paddingBottom: 8,
  },
  bankInfo: { flexDirection: 'column' },
  bankName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: PRIMARY_COLOR,
    textTransform: 'uppercase',
  },
  docTitle: {
    fontSize: 10, 
    fontFamily: 'Helvetica-Bold',
    marginTop: 7, // Jarak dikurangi
    color: TEXT_DARK,
  },
  bankSub: {
    fontSize: 8,
    color: '#444',
    marginTop: 1, // Jarak dikurangi
  },
  refCode: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    marginTop: 4,
    color: TEXT_MUTED,
  },
  logo: { width: 100, marginTop: -10},

  // --- SECTION STYLES ---
  section: {
    marginBottom: 10, // Jarak antar section dikurangi
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    breakAfter: 'avoid', 
  },
  sectionHeader: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 4, // Padding dikurangi
    paddingHorizontal: 8,
    color: TEXT_DARK,
    textTransform: 'uppercase',
    borderBottomWidth: 0,
    borderBottomColor: '#e2e8f0',
  },
  sectionBody: {
    padding: 6, // Padding dikurangi
  },

  // --- GRID/ROW STYLES ---
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  col2: { 
    width: '50%', 
    flexDirection: 'column', 
    paddingRight: 8, 
    marginBottom: 0, 
  },

  // --- LABEL & VALUE ---
  label: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: TEXT_MUTED,
    marginBottom: 0, // Dihapus
    textTransform: 'uppercase',
    lineHeight: 1.2,
  },
  value: {
    fontSize: 8, // Ukuran font value diperkecil sedikit
    color: TEXT_DARK,
    fontFamily: 'Helvetica',
    lineHeight: 1.2,
    marginBottom: 4, // Jarak antar field dikurangi
  },

  // --- TABLE STYLES ---
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 4,
    borderRadius: 3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 16, // Tinggi baris dikurangi
    alignItems: 'center',
    breakInside: 'avoid', 
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    fontFamily: 'Helvetica-Bold',
  },
  tableCell: {
    flex: 1,
    padding: 3, // Padding cell dikurangi
    fontSize: 7, // Ukuran font table dikurangi
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    textAlign: 'left',
  },

  // --- SIGNATURE AREA ---
  signatureArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15, // Jarak dikurangi
    paddingTop: 10,
  },
  signatureBox: {
    width: '40%',
    alignItems: 'center',
  },
  signatureLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginTop: 40, // Ruang tanda tangan dikurangi
    marginBottom: 5,
  },
  signatureText: { fontSize: 7, textAlign: 'center' }, // Font signature dikurangi

  // --- FOOTER FIXED ---
  footer: {
    position: 'absolute',
    bottom: 15, 
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 7,
    color: '#94a3b8',
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 5,
  },
bankSection: {
  marginTop: 20,
  borderWidth: 1,
  borderColor: '#000',
  borderStyle: 'solid',
},

bankHeader: {
  backgroundColor: '#003c8f',
  paddingVertical: 4,
  paddingHorizontal: 6,
  borderBottomWidth: 1,
  borderBottomColor: '#000',
},

bankHeaderText: {
  color: '#fff',
  fontSize: 8,
  fontFamily: 'Helvetica-Bold',
  textTransform: 'uppercase',
  textAlign: 'center',
},

bankInfoRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 6,
  paddingVertical: 6,
  flexWrap: 'wrap',
  borderBottomWidth: 1,
  borderBottomColor: '#000',
},

bankInfoLabel: {
  fontSize: 7,
  marginRight: 4,
},

bankInfoLine: {
  flexGrow: 1,
  borderBottomWidth: 1,
  borderBottomColor: '#000',
  marginRight: 10,
  height: 12,
},

riskOptions: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
},

checkbox: {
  width: 8,
  height: 8,
  borderWidth: 1,
  borderColor: '#000',
  marginRight: 2,
},

bankTable: {
  flexDirection: 'row',
  height: 80,
},

tableCol: {
  flex: 1,
  borderRightWidth: 1,
  borderRightColor: '#000',
  paddingHorizontal: 6,
  paddingVertical: 8,
  alignItems: 'center',
  justifyContent: 'space-between',
},

tableColTitle: {
  fontSize: 7,
  textAlign: 'center',
  marginBottom: 8,
},

tableSignature: {
  width: '100%',
  height: 40,
  marginTop: 'auto',
},
});

// ===== HELPER COMPONENTS (NO CHANGE IN LOGIC, FONT SIZE ADJUSTED) =====

const DataField = ({ label, value }: { label: string; value?: string | number | null }) => {
  const safeValue = value === 0 ? '0' : String(value || '').trim();
  if (safeValue === '' || safeValue.toLowerCase() === 'null' || safeValue.toLowerCase() === 'undefined') {
    return (
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>-</Text>
      </View>
    );
  }

  let displayValue = safeValue;
const lowerLabel = label.toLowerCase();

// 1. Email, angka, rupiah, kode pos → tampilkan apa adanya
if (
  safeValue.includes('@') ||
  !isNaN(Number(safeValue)) ||
  safeValue.startsWith('Rp') ||
  lowerLabel.includes('kode pos') ||
  lowerLabel.includes('rekening')
) {
  displayValue = safeValue;
}

// 2. Pendidikan → UPPERCASE (SD, SMP, SMA, S1, S2)
else if (lowerLabel.includes('pendidikan')) {
  displayValue = safeValue.toUpperCase();
}

// 3. Nama → Kapital depan (titlecase)
else if (lowerLabel.includes('nama')) {
  displayValue = safeValue
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// 4. agama, jenis kelamin, pekerjaan → kapital depan
else if (
  lowerLabel.includes('agama') ||
  lowerLabel.includes('kelamin') ||
  lowerLabel.includes('pekerjaan')
) {
  displayValue = safeValue.charAt(0).toUpperCase() + safeValue.slice(1).toLowerCase();
}

// 5. Default (alamat, sekolah, pekerjaan lain) → biarkan apa adanya
else {
  displayValue = safeValue;
}


  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{displayValue}</Text>
    </View>
  );
};

const RowTwoCol = ({ children }: { children: (JSX.Element | null)[] }) => {
  const validChildren = children.filter(child => child !== null) as JSX.Element[];

  if (validChildren.length === 0) return null;

  if (validChildren.length === 1) {
    return (
      <View style={styles.row}>
        <View style={{ width: '100%', flexDirection: 'column' }}>
          {validChildren[0]}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {validChildren.map((child, index) => (
        <View style={styles.col2} key={index}>
          {child}
        </View>
      ))}
    </View>
  );
};

// Helper component for numbered lists
const ListItem = ({ number, text }: { number: string; text: string }) => (
  <View style={{ flexDirection: 'row', marginBottom: 2 }}>
    <Text style={{ width: 14, fontSize: 7, lineHeight: 1.3 }}>{number}.</Text>
    <Text style={{ flex: 1, fontSize: 7, lineHeight: 1.3 }}>{text}</Text>
  </View>
);

// ===== MAIN COMPONENT (LOGIC REMAINS, IMPLEMENTATION IS COMPACT) =====
export const SubmissionPdf = ({ submission }: { submission: FormSubmission }) => {
  const isSimpel = submission.cardType === 'Tabungan Simpel' || submission.savingsType === 'SimPel';
  


  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        
        {/* HEADER (Hanya 1) TAMBAH FIXED DISAMPING HEADER BAR BIAR 2 HEADER*/}
        <View style={[styles.headerBar, { position: 'relative' }]}> 
  <View style={styles.bankInfo}>
    <Text style={styles.bankName}>
      {submission.cabangName ? `${submission.cabangName.toUpperCase()}` : `PT BPR BANK SLEMAN`}
    </Text>
    <Text style={styles.docTitle}>FORMULIR PEMBUKAAN REKENING PERORANGAN</Text>
    <Text style={styles.bankSub}>Formulir CDD / EDD / Beneficial Owner (BO)</Text>
    <Text style={styles.refCode}>{submission.referenceCode}</Text>
  </View>

  {/* LOGO POSISI ABSOLUTE — AMAN 100% */}
  <Image
  src="./logo.png"
  style={{
    width: 130,       // perbesar sesuka kamu
    height: 130,      // WAJIB ada untuk memaksa scale up
    objectFit: 'contain',
    position: 'absolute',
    top: -40,
    right: -2,
  }}
/>

</View>






        {/* SECTION 1: DATA PRIBADI */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DATA PEMEGANG</Text>
          <View style={styles.sectionBody}>

            <RowTwoCol>
              <DataField label="Nama Lengkap" value={submission.personalData.fullName} />
              <DataField label="Nama Alias" value={submission.personalData.alias} />
            </RowTwoCol>
            
            <RowTwoCol>
              <DataField label="NIK / No. Identitas" value={submission.personalData.nik} />
              <DataField label="Jenis Identitas" value={submission.personalData.identityType} />
            </RowTwoCol>

            <RowTwoCol>
              <DataField label="Tempat Lahir" value={submission.personalData.birthPlace} />
              <DataField label="Tanggal Lahir" value={submission.personalData.birthDate} />
            </RowTwoCol>

            <RowTwoCol>
              <DataField label="Jenis Kelamin" value={submission.personalData.gender} />
              <DataField label="Agama" value={submission.personalData.religion} />
            </RowTwoCol>

            <RowTwoCol>
              <DataField label="Status Perkawinan" value={submission.personalData.maritalStatus} />
              <DataField label="Pendidikan Terakhir" value={submission.personalData.education} />
            </RowTwoCol>

            <RowTwoCol>
               <DataField label="Nama Ibu Kandung" value={submission.personalData.motherName} />
               <DataField label="NPWP" value={submission.personalData.npwp} />
            </RowTwoCol>

            

            {/* ALAMAT */}
            <Text style={{ ...styles.label, marginTop: 4, marginBottom: 2, color: PRIMARY_COLOR }}>ALAMAT IDENTITAS (KTP)</Text>
            <RowTwoCol>
               <DataField label="Kode Pos" value={submission.personalData.address.postalCode} />
               <DataField label="Kewarganegaraan" value={submission.personalData.citizenship} />
            </RowTwoCol>

            {submission.personalData.address.domicile && (
              <>
                 <Text style={{ ...styles.label, marginTop: 6, marginBottom: 2, color: PRIMARY_COLOR }}>ALAMAT DOMISILI</Text>
                 <DataField label="Alamat Lengkap" value={submission.personalData.address.domicile} />
              </>
            )}
            <DataField label="Status Rumah" value={submission.personalData.homeStatus} />


            
            <Text style={{ ...styles.label, marginTop: 6, marginBottom: 2, color: PRIMARY_COLOR }}>KONTAK</Text>
            <RowTwoCol>
              <DataField label="Email" value={submission.personalData.email} />
              <DataField label="No. Handphone" value={submission.personalData.phone} />
            </RowTwoCol>
          </View>
        </View>

        {/* SECTION 2: DATA PEKERJAAN / SEKOLAH */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            {isSimpel ? 'DATA SEKOLAH & ORANG TUA' : 'DATA PEKERJAAN & KEUANGAN'}
          </Text>
          <View style={styles.sectionBody}>

            <RowTwoCol>
               <DataField label="Pekerjaan / Status" value={submission.jobInfo.occupation} />
               <DataField label="Bidang Usaha" value={submission.jobInfo.businessField} />
            </RowTwoCol>

            <RowTwoCol>
               <DataField 
                 label={isSimpel ? 'Nama Sekolah' : 'Nama Instansi / Perusahaan'} 
                 value={submission.jobInfo.workplace} 
               />
               <DataField label="Jabatan / Kelas" value={submission.jobInfo.position} />
            </RowTwoCol>

            <RowTwoCol>
               <DataField 
                 label={isSimpel ? 'Penghasilan Orang Tua' : 'Range Pendapatan'} 
                 value={submission.jobInfo.salaryRange} 
               />
               <DataField label="Sumber Dana" value={submission.jobInfo.incomeSource} />
            </RowTwoCol>

            {submission.jobInfo.officeAddress && (
              <DataField 
                label={isSimpel ? 'Alamat Sekolah' : 'Alamat Kantor/Usaha'} 
                value={submission.jobInfo.officeAddress} 
              />
            )}
            
            <RowTwoCol>
               <DataField 
                 label={isSimpel ? 'Telepon Sekolah' : 'Telepon Kantor'} 
                 value={submission.jobInfo.officePhone} 
               />
               <DataField label="Estimasi Transaksi/Bulan" value={submission.jobInfo.averageTransaction} />
            </RowTwoCol>
          </View>
        </View>

        {/* SECTION 3: DATA REKENING */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT INFORMATION (Informasi Rekening)</Text>
          <View style={styles.sectionBody}>
            <RowTwoCol>
               <DataField label="Jenis Tabungan" value={submission.savingsType} />
               <DataField label="Jenis Kartu ATM" value={submission.cardType} />
            </RowTwoCol>
            <RowTwoCol>
               <DataField label="Tipe Nasabah" value={submission.personalData.tipeNasabah} />
               {submission.personalData.tipeNasabah === 'lama' ? (
                 <DataField label="Nomor Rekening Lama" value={submission.personalData.nomorRekeningLama} />
               ) : null}
            </RowTwoCol>
            <RowTwoCol>
               <DataField 
              label="Kepemilikan Dana" 
              value={submission.accountInfo.isForSelf ? 'Milik Sendiri' : 'Mewakili Pihak Lain (Lihat Bagian Beneficial Owner)'} 
            />
               <DataField label="Tujuan Pembukaan" value={submission.jobInfo.accountPurpose} />
            </RowTwoCol>
            
          </View>
        </View>

        {/* SECTION 4: KONTAK DARURAT (Mulai dikompaksi) */}
        {submission.emergencyContact && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>EMERGENCY CONTACT (Kontak Darurat)</Text>
            <View style={styles.sectionBody}>
              <RowTwoCol>
                 <DataField label="Nama Kontak" value={submission.emergencyContact.name} />
                 <DataField label="Hubungan" value={submission.emergencyContact.relationship} />
              </RowTwoCol>
              <RowTwoCol>
                <DataField label="Alamat" value={submission.emergencyContact.address} />
                <DataField label="Nomor Telepon" value={submission.emergencyContact.phone} />
              </RowTwoCol>
              
            </View>
          </View>
        )}

        {/* SECTION 5: BENEFICIAL OWNER (Jika Ada) */}
        {submission.beneficialOwner ? (
  <View style={styles.section} break>
    <Text style={styles.sectionHeader}>
      PEMILIK MANFAAT (BENEFICIAL OWNER)
    </Text>

    <View style={styles.sectionBody}>
      <DataField
        label="Nama Lengkap"
        value={submission.beneficialOwner.name}
      />
      <DataField
        label="Alamat"
        value={submission.beneficialOwner.address}
      />

      <RowTwoCol>
        <DataField
          label="Tempat, Tgl Lahir"
          value={submission.beneficialOwner.birthPlace && submission.beneficialOwner.birthDate 
            ? `${submission.beneficialOwner.birthPlace}, ${submission.beneficialOwner.birthDate}`
            : submission.beneficialOwner.birthPlace || submission.beneficialOwner.birthDate || '-'
          }
        />
        <DataField
          label="Jenis Kelamin"
          value={submission.beneficialOwner.gender}
        />
      </RowTwoCol>

      <RowTwoCol>
        <DataField
          label="Kewarganegaraan"
          value={submission.beneficialOwner.citizenship}
        />
        <DataField
          label="Status Pernikahan"
          value={submission.beneficialOwner.maritalStatus}
        />
      </RowTwoCol>

      <RowTwoCol>
        <DataField
          label="Jenis Identitas"
          value={submission.beneficialOwner.identityType}
        />
        <DataField
          label="Nomor Identitas"
          value={submission.beneficialOwner.identityNumber}
        />
      </RowTwoCol>

      <RowTwoCol>
        <DataField
          label="Pekerjaan"
          value={submission.beneficialOwner.occupation}
        />
        <DataField
          label="Sumber Dana"
          value={submission.beneficialOwner.incomeSource}
        />
      </RowTwoCol>

      <RowTwoCol>
        <DataField
          label="Hubungan"
          value={submission.beneficialOwner.relationship}
        />
        <DataField
          label="No HP"
          value={submission.beneficialOwner.phone}
        />
      </RowTwoCol>

      <DataField
        label="Pendapatan Tahunan"
        value={submission.beneficialOwner.annualIncome}
      />
    </View>
  </View>
) : null}


        {/* SECTION 6: TABEL BANK LAIN */}
        {submission.eddBankLain && submission.eddBankLain.length > 0 && (
           <View style={styles.section}>
              <Text style={styles.sectionHeader}>KEPEMILIKAN REKENING BANK LAIN (EDD)</Text>
              <View style={styles.sectionBody}>
                <View style={styles.table}>
                   <View style={[styles.tableRow, styles.tableHeader]}>
                      <Text style={[styles.tableCell, { flex: 0.3 }]}>No.</Text>
                      <Text style={[styles.tableCell, { flex: 2 }]}>Nama Bank</Text>
                      <Text style={[styles.tableCell, { flex: 2 }]}>Jenis Rekening</Text>
                      <Text style={[styles.tableCell, { borderRightWidth: 0, flex: 3 }]}>No. Rekening</Text>
                   </View>
                   {submission.eddBankLain.map((item, idx) => (
                      <View style={styles.tableRow} key={idx}>
                         <Text style={[styles.tableCell, { flex: 0.3 }]}>{idx + 1}</Text>
                         <Text style={[styles.tableCell, { flex: 2 }]}>{item.bank_name}</Text>
                         <Text style={[styles.tableCell, { flex: 2 }]}>{item.jenis_rekening}</Text>
                         <Text style={[styles.tableCell, { borderRightWidth: 0, flex: 3 }]}>{item.nomor_rekening}</Text>
                      </View>
                   ))}
                </View>
              </View>
           </View>
        )}

        {/* SECTION 7: PEKERJAAN LAIN */}
        {submission.eddPekerjaanLain && submission.eddPekerjaanLain.length > 0 && (
           <View style={styles.section}>
              <Text style={styles.sectionHeader}>INFORMASI PEKERJAAN / USAHA LAIN (EDD)</Text>
              <View style={styles.sectionBody}>
                <View style={styles.table}>
                   <View style={[styles.tableRow, styles.tableHeader]}>
                      <Text style={[styles.tableCell, { flex: 0.3 }]}>No.</Text>
                      <Text style={[styles.tableCell, { borderRightWidth: 0, flex: 10 }]}>Jenis Usaha / Pekerjaan</Text>
                   </View>
                   {submission.eddPekerjaanLain.map((item, idx) => (
                      <View style={styles.tableRow} key={idx}>
                         <Text style={[styles.tableCell, { flex: 0.3 }]}>{idx + 1}</Text>
                         <Text style={[styles.tableCell, { borderRightWidth: 0, flex: 10 }]}>{item.jenis_usaha}</Text>
                      </View>
                   ))}
                </View>
              </View>
           </View>
        )}

{/* SECTION 9: SPECIMEN TANDA TANGAN */}
        <View style={styles.section} wrap={false}>
          <Text style={[styles.sectionHeader, { textAlign: 'center', fontSize: 8 }]}>
            {/* Gunakan Helvetica-BoldOblique */}
          <Text style={{ fontFamily: 'Helvetica-BoldOblique' }}>SPECIMEN </Text>

          {/* Gunakan Helvetica-Bold */}
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>TANDA TANGAN</Text>
            </Text>
          <View style={styles.sectionBody}>
           <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'center', // Mengumpul ke tengah
            gap: 2 // Kontrol jarak hanya dari sini
          }}>
            {/* Kolom Kiri */}
            <View style={{ 
              flex: 1, 
              height: 80, 
              borderWidth: 1.5,
              borderColor: '#D1D5DB',
              // marginRight dihapus
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            </View>
            
            {/* Kolom Kanan */}
            <View style={{ 
              flex: 1,
              height: 80,
              borderWidth: 1.5,
              borderColor: '#D1D5DB',
              // marginLeft dihapus
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            </View>
          </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SYARAT DAN KETENTUAN</Text>
          <View style={styles.sectionBody}>


            {/* KETENTUAN UMUM */}
            <Text style={{ ...styles.label, marginBottom: 4, color: PRIMARY_COLOR, fontSize: 8 }}>KETENTUAN UMUM</Text>
            
            <Text style={{ ...styles.label, marginTop: 4, marginBottom: 2 }}>I. DEFINISI REKENING</Text>
            <View style={{ marginLeft: 4 }}>
              <ListItem number="1" text="Tabungan adalah simpanan yang penarikannya hanya dapat dilakukan menurut syarat tertentu." />
              <ListItem number="2" text="Deposito adalah simpanan nasabah kepada Bank yang dapat dicairkan kembali setelah jangka waktu tertentu dan dapat diperpanjang (roll over) penempatannya, dengan jangka waktu yang sama dan diatur menurut perjanjian." />
            </View>

            <Text style={{ ...styles.label, marginTop: 4, marginBottom: 2 }}>II. KEPEMILIKAN REKENING</Text>
            <View style={{ marginLeft: 4 }}>
              <ListItem number="1" text="Pembukaan rekening dapat berupa perorangan, Badan Usaha dan Gabungan." />
              <ListItem number="2" text='Rekening Gabungan dapat dibuka dengan kombinasi/syarat "AND" atau "OR".' />
              <ListItem number="3" text="Bank dibebaskan dari segala tuntutan dan tanggung jawab yang timbul dari setiap risiko dan kerugian serta dampak lainnya yang timbul karena perselisihan dan penyalahgunaan rekening oleh nasabah pemilik rekening termasuk Force Majeure." />
              <ListItem number="4" text="Nasabah wajib untuk menginformasikan kepada Bank apabila terdapat perubahan data, antara lain perubahan nama, alamat, nomor telepon dan/atau NPWP." />
            </View>

            <Text style={{ ...styles.label, marginTop: 4, marginBottom: 2 }}>III. BUNGA DAN BIAYA</Text>
            <View style={{ marginLeft: 4 }}>
              <ListItem number="1" text="Perhitungan bunga atas rekening mengikuti peraturan yang berlaku." />
              <ListItem number="2" text="Bunga atas rekening nasabah akan dikenakan pajak atau pungutan lain sesuai dengan peraturan yang berlaku." />
              <ListItem number="3" text="Nasabah menanggung risiko dan kerugian atas penurunan nilai dana pada rekening yang disebabkan oleh pembebanan, pemotongan pajak yang dikenakan berdasarkan peraturan yang berlaku." />
              <ListItem number="4" text="Besarnya bunga dan biaya yang dibebankan kepada nasabah akan mengikuti ketentuan yang berlaku dan dapat berubah sewaktu-waktu." />
            </View>

            <Text style={{ ...styles.label, marginTop: 4, marginBottom: 2 }}>IV. PENYETORAN, PENARIKAN, PEMINDAHBUKUAN DAN TRANSFER</Text>
            <View style={{ marginLeft: 4 }}>
              <ListItem number="1" text="Penyetoran, Penarikan, Pemindahbukuan dan Transfer dilakukan oleh Bank sesuai dengan tata cara yang diatur oleh Bank." />
              <ListItem number="2" text="Penyetoran berlaku setelah dana nasabah diterima secara efektif oleh Bank dan Penarikan hanya dapat dilakukan bila telah tersedia saldo efektif dalam rekening nasabah." />
              <ListItem number="3" text="Bila Bank menerima beberapa instruksi/perintah transaksi penarikan dan/atau transfer sekaligus dari nasabah, maka Bank hanya akan menjalankan instruksi/perintah transaksi sesuai dengan kecukupan dana nasabah." />
            </View>

            <Text style={{ ...styles.label, marginTop: 4, marginBottom: 2 }}>V. REKENING PASIF, PEMBLOKIRAN DAN PENUTUPAN REKENING</Text>
            <View style={{ marginLeft: 4 }}>
              <ListItem number="1" text="Perintah pemblokiran rekening dapat diberikan atas perintah nasabah, perintah dari Pejabat maupun instansi Pemerintah yang memiliki kewenangan sesuai peraturan yang berlaku serta berdasarkan pertimbangan Bank." />
              <ListItem number="2" text="Rekening nasabah yang tergolong rekening pasif yaitu rekening tidak bermutasi selama jangka waktu tertentu sesuai dengan kebijakan Bank maka rekening tersebut tidak dapat dilakukan transaksi pendebetan rekening sebelum nasabah melakukan aktifasi." />
              <ListItem number="3" text="Bank melarang segala bentuk penyalahgunaan rekening, termasuk sebagai sarana tindakan berindikasi pidana." />
              <ListItem number="4" text="Penutupan rekening oleh nasabah dilakukan sesuai dengan ketentuan yang berlaku di Bank." />
            </View>

            <Text style={{ ...styles.label, marginTop: 4, marginBottom: 2 }}>VI. PENGADUAN NASABAH</Text>
            <View style={{ marginLeft: 4 }}>
              <ListItem number="1" text="Nasabah dapat menyampaikan pengaduan kepada Bank melalui Customer Service Kantor Cabang Bank Sleman terdekat, surat tertulis, email: info@banksleman.co.id atau telepon: (0274) 868321." />
              <ListItem number="2" text="Bank akan menindaklanjuti dan menyelesaikan pengaduan nasabah sesuai dengan jangka waktu penyelesaian berdasarkan jenis pengaduan yang disampaikan." />
            </View>

            <Text style={{ ...styles.label, marginTop: 4, marginBottom: 2 }}>VII. LAIN-LAIN</Text>
            <View style={{ marginLeft: 4 }}>
              <ListItem number="1" text="Jika terjadi permasalahan hukum antara nasabah dengan Bank, maka kedua belah pihak setuju untuk memilih tempat kediaman hukum yang tetap dan secara umum pada Kantor Panitera Pengadilan Negeri yang wewenangnya meliputi wilayah tempat kantor Bank dimana rekening dibuka." />
              <ListItem number="2" text="Bank berhak untuk memperbaiki/mengubah/melengkapi Ketentuan Umum dan Pernyataan Nasabah serta ketentuan lainnya setiap waktu." />
              <ListItem number="3" text="Bank wajib menjaga kerahasiaan data pribadi nasabah sesuai ketentuan perundang-undangan." />
            </View>

            {/* PERNYATAAN NASABAH */}
            <Text style={{ ...styles.label, marginTop: 8, marginBottom: 4, color: PRIMARY_COLOR, fontSize: 8 }}>PERNYATAAN NASABAH</Text>
            <Text style={{ ...styles.value, fontSize: 7, fontFamily: 'Helvetica-Oblique', marginBottom: 2 }}>
              Dengan menyetujui layanan ini, Saya/Kami menyatakan bahwa:
            </Text>
            
            <View style={{ marginLeft: 4 }}>
              <ListItem number="1" text="Data yang saya/kami isi dan dokumen pendukung pada Formulir Pembukaan Rekening PT BPR Bank Sleman (Perseroda) ini akurat, lengkap dan benar." />
              <ListItem number="2" text="Saya/Kami menyatakan bahwa data dan informasi Beneficial Owner (BO) yang disampaikan di atas adalah benar dan dapat dipertanggung jawabkan." />
              <ListItem number="3" text="Untuk kepentingan PT BPR Bank Sleman (Perseroda) dan/atau memenuhi ketentuan perundang-undangan, saya/kami menyetujui data pribadi Saya/Kami diberikan oleh PT BPR Bank Sleman (Perseroda) kepada pihak lain." />
              <ListItem number="4" text="PT BPR Bank Sleman (Perseroda) telah memberikan penjelasan kepada saya/kami tentang konsekuensi dari persetujuan yang saya/kami berikan dan saya/kami telah memahaminya." />
              <ListItem number="5" text="Saya/Kami bersedia untuk diperiksa oleh PT BPR Bank Sleman (Perseroda) terhadap kebenaran data yang telah Saya/Kami berikan." />
              <ListItem number="6" text="PT BPR Bank Sleman (Perseroda) telah memberikan penjelasan yang cukup mengenai karakteristik produk yang akan Saya/Kami gunakan." />
              <ListItem number="7" text="Saya/Kami telah menerima, membaca, mengerti dan menyetujui serta bersedia untuk mentaati Ketentuan Umum Rekening dan Ketentuan Khusus produk serta ketentuan terkait lainnya yang berlaku di PT BPR Bank Sleman (Perseroda)." />
              <ListItem number="8" text="Saya/kami memberikan hak dan wewenang kepada PT BPR Bank Sleman (Perseroda) untuk melakukan pemblokiran, pembatalan transaksi dan/atau penutupan rekening Saya/kami apabila tidak mematuhi ketentuan yang berlaku." />
              <ListItem number="9" text="Saya/kami mengetahui simpanan Saya/kami yang tersimpan dalam rekening Bank dijamin dalam program Penjaminan yang diselenggarakan Lembaga Penjamin Simpanan (LPS) sesuai dengan syarat dan ketentuan yang ditetapkan oleh LPS." />
            </View>

            <Text style={{ ...styles.value, fontSize: 7, fontFamily: 'Helvetica-Bold', marginTop: 4 }}>
              Demikian pernyataan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
            </Text>

            {/* Tanda Tangan di bawah Terms */}
            <View style={{ marginTop: 20, alignItems: 'flex-end', paddingRight: 10 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 7, marginBottom: 15 }}>
                  {new Date().toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                  }).replace(/(\d+) (\w+) (\d+)/, '$1, $2 $3')}
                </Text>
                
                <View style={{ width: 140, height: 40 }} />
                <View style={{ borderBottomWidth: 1, borderBottomColor: '#000', width: 140, marginBottom: 4 }} />
                <Text style={{ fontSize: 7 }}>Tanda Tangan dan Nama Jelas</Text>
              </View>
            </View>
          </View>
        </View>

        

        {/* SECTION 10: DIISI OLEH BANK */}
<View style={styles.bankSection} wrap={false}>

  {/* BAR BIRU */}
  <View style={styles.bankHeader}>
    <Text style={styles.bankHeaderText}>DIISI OLEH BANK</Text>
  </View>

  {/* ROW INFORMASI ATAS */}
  <View style={styles.bankInfoRow}>
    <Text style={styles.bankInfoLabel}>CIF :</Text>
    <View style={styles.bankInfoLine} />

    <Text style={styles.bankInfoLabel}>Gol Pemilik :</Text>
    <View style={styles.bankInfoLine} />

    <Text style={styles.bankInfoLabel}>Risiko Nasabah/Calon Nasabah :</Text>

    <View style={styles.riskOptions}>
      <View style={styles.checkbox} /><Text style={styles.bankInfoLabel}> Rendah</Text>
      <View style={styles.checkbox} /><Text style={styles.bankInfoLabel}> Sedang</Text>
      <View style={styles.checkbox} /><Text style={styles.bankInfoLabel}> Tinggi</Text>
    </View>
  </View>

  {/* TABEL 3 KOLOM */}
  <View style={styles.bankTable}>
    <View style={styles.tableCol}>
      <Text style={styles.tableColTitle}>Diproses Oleh</Text>
      <View style={styles.tableSignature} />
    </View>

    <View style={styles.tableCol}>
      <Text style={styles.tableColTitle}>Diperiksa Oleh</Text>
      <View style={styles.tableSignature} />
    </View>

    <View style={[styles.tableCol, { borderRightWidth: 0 }]}>
      <Text style={styles.tableColTitle}>Disetujui Oleh</Text>
      <View style={styles.tableSignature} />
    </View>
  </View>

</View>


        {/* FOOTER FIXED */}
        <Text style={styles.footer} fixed>
           Dicetak pada {new Date().toLocaleString('id-ID')} • Dokumen ini dihasilkan secara elektronik oleh Sistem BukaTabungan Bank Sleman • Ref: {submission.referenceCode}
        </Text>

      </Page>
    </Document>
  );
};