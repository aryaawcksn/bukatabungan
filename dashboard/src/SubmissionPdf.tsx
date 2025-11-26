import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { FormSubmission } from './DashboardPage';
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#222',
  },
  // HEADER RESMI BANK
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#003b80',
    paddingBottom: 12,
    marginBottom: 25,
  },
  bankInfo: {
    flexDirection: 'column',
  },
  bankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003b80',
  },
  bankSub: {
    fontSize: 9,
    marginTop: 2,
  },
  logo: {
  width: 140,       // perbesar di sini
  objectFit: 'contain',
},
  
  sectionBox: {
    borderWidth: 1,
    borderColor: '#d0d7e2',
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    backgroundColor: '#e7effa',
    padding: 6,
    fontSize: 11,
    fontWeight: 'bold',
    borderRadius: 4,
    marginBottom: 8,
    color: '#003b80',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: '35%',
    fontWeight: 'bold',
  },
  value: {
    width: '65%',
  },
  // FOOTER RESMI
  footerNote: {
    marginTop: 100,
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
  },
  footerContainer: {
  position: 'absolute',
  bottom: 20,
  left: 40,
  right: 40,
},

footerLine: {
  borderBottomWidth: 1,
  borderBottomColor: '#ccc',
  marginBottom: 6,
},

footerText: {
  fontSize: 8,
  color: '#555',
  textAlign: 'center',
},

footerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  fontSize: 8,
  color: '#555',
},


});
// ROW COMPONENT
export const InfoRow = ({ label, value }: { label: string; value?: string }) => {
  const safeValue = value || "-";
  const formatted =
    safeValue.charAt(0).toUpperCase() + safeValue.slice(1);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{formatted}</Text>
    </View>
  );
};

export const SubmissionPdf = ({ submission }: { submission: FormSubmission }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* HEADER */}
      <View style={styles.headerBar}>
        <View style={styles.bankInfo}>
          <Text style={styles.bankName}>{submission.cabangName || `Cabang ${submission.cabangPengambilan}`}</Text>
          <Text style={styles.bankSub}>Bukti Pendaftaran Nasabah</Text>
          <Text style={styles.bankSub}>Ref: {submission.referenceCode}</Text>
        </View>

          <Image
            src="./banksleman.png"
            style={styles.logo}
          />
      </View>
      {/* DATA NASABAH */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>DATA NASABAH</Text>
        <InfoRow label="Jenis Rekening" value={submission.savingsType} />
        <InfoRow label="Jenis Kartu" value={submission.cardType} />
        <InfoRow label="Nama Lengkap" value={submission.personalData.fullName} />
        <InfoRow label="NIK" value={submission.personalData.nik} />
        <InfoRow label="Email" value={submission.personalData.email} />
        <InfoRow label="No. Telepon" value={submission.personalData.phone} />
        <InfoRow label="Tanggal Lahir" value={submission.personalData.birthDate} />
        <InfoRow label="Jenis Kelamin" value={submission.personalData.gender} />
        <InfoRow label="Alamat" value={submission.personalData.address.street} />
        <InfoRow label="Kota" value={submission.personalData.address.city} />
        <InfoRow label="Provinsi" value={submission.personalData.address.province} />
        <InfoRow label="Kode Pos" value={submission.personalData.address.postalCode} />
      </View>
      {/* DATA PEKERJAAN / SEKOLAH */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>
          {submission.cardType === 'Tabungan Simpel' ? 'DATA SEKOLAH' : 'DATA PEKERJAAN'}
        </Text>
        <InfoRow
          label={submission.cardType === 'Tabungan Simpel' ? 'Status' : 'Pekerjaan'}
          value={submission.jobInfo.occupation}
        />
        <InfoRow
          label={submission.cardType === 'Tabungan Simpel' ? 'Nama Sekolah' : 'Nama Instansi'}
          value={submission.jobInfo.workplace}
        />
        <InfoRow
          label={submission.cardType === 'Tabungan Simpel' ? 'Penghasilan Ortu' : 'Penghasilan'}
          value={submission.jobInfo.salaryRange}
        />
        <InfoRow label="Sumber Dana" value={submission.jobInfo.incomeSource} />
        <InfoRow label="Tujuan Pembukaan Rekening" value={submission.jobInfo.accountPurpose} />
      </View>
      {/* KONTAK DARURAT */}
      {submission.emergencyContact && (
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>KONTAK DARURAT</Text>
          <InfoRow label="Nama" value={submission.emergencyContact.name} />
          <InfoRow label="No. Telepon" value={submission.emergencyContact.phone} />
        </View>
      )}
      {/* FOOTER */}
      {/* FOOTER PROFESIONAL */}
<View style={styles.footerContainer}>
  <View style={styles.footerLine} />

  {/* Baris kiri & kanan */}
  <View style={styles.footerRow}>
    <Text>Dicetak: {new Date().toLocaleDateString()}</Text>
    <Text>Halaman <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} /></Text>
  </View>

  {/* Catatan legal */}
  <Text style={{ ...styles.footerText, marginTop: 4 }}>
    Dokumen ini dihasilkan oleh Sistem BukaTabungan Bank Sleman secara otomatis dan sah tanpa tanda tangan basah.
  </Text>

  {/* Info Cabang */}
  <Text style={styles.footerText}>
    {submission.cabangName || `Cabang ${submission.cabangPengambilan}`} • Bank Sleman
  </Text>
</View>

    </Page>
  </Document>
);