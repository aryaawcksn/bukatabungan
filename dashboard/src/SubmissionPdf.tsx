import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { FormSubmission } from './DashboardPage';

// ===== STYLES =====
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#222',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#003b80',
    paddingBottom: 12,
    marginBottom: 20,
  },
  bankInfo: { flexDirection: 'column' },
  bankName: { fontSize: 16, fontWeight: 'bold', color: '#003b80' },
  bankSub: { fontSize: 9, marginTop: 2 },
  logo: { width: 140, objectFit: 'contain' },

  sectionBox: { borderWidth: 1, borderColor: '#d0d7e2', borderRadius: 6, padding: 10, marginBottom: 8 },
  sectionTitle: { backgroundColor: '#e7effa', padding: 6, fontSize: 11, fontWeight: 'bold', borderRadius: 4, marginBottom: 8, color: '#003b80' },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: '35%', fontWeight: 'bold' },
  value: { width: '65%' },

  tncRow: { flexDirection: 'row', marginBottom: 3 },
  tncBullet: { width: 10, fontSize: 8, color: '#555' },
  tncText: { fontSize: 8, color: '#555', textAlign: 'justify', flex: 1, lineHeight: 1.3 },

  footerContainer: {
    position: 'absolute', // gunakan absolute, bukan fixed
    bottom: 20,
    left: 40,
    right: 40,
  },
  footerLine: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 6 },
  footerText: { fontSize: 8, color: '#555', textAlign: 'center' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#555' },
});

// ===== ROW COMPONENT =====
const InfoRow = ({ label, value }: { label: string; value?: string }) => {
  const safeValue = value || '-';
  const formatted = safeValue.charAt(0).toUpperCase() + safeValue.slice(1);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{formatted}</Text>
    </View>
  );
};

// ===== TNC ITEM =====
const TncItem = ({ text, number }: { text: string; number: string }) => (
  <View style={styles.tncRow}>
    <Text style={styles.tncBullet}>{number}.</Text>
    <Text style={styles.tncText}>{text}</Text>
  </View>
);

// ===== MAIN PDF COMPONENT =====
export const SubmissionPdf = ({ submission }: { submission: FormSubmission }) => (
  <Document>
    <Page size="A4" style={styles.page} wrap>

      {/* HEADER */}
      <View style={styles.headerBar}>
        <View style={styles.bankInfo}>
          <Text style={styles.bankName}>{submission.cabangName || `Cabang ${submission.cabangPengambilan}`}</Text>
          <Text style={styles.bankSub}>Bukti Pendaftaran Nasabah</Text>
          <Text style={styles.bankSub}>Ref: {submission.referenceCode}</Text>
        </View>
        <Image src="./banksleman.png" style={styles.logo} />
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
        <InfoRow label={submission.cardType === 'Tabungan Simpel' ? 'Status' : 'Pekerjaan'} value={submission.jobInfo.occupation} />
        <InfoRow label={submission.cardType === 'Tabungan Simpel' ? 'Nama Sekolah' : 'Nama Instansi'} value={submission.jobInfo.workplace} />
        <InfoRow label={submission.cardType === 'Tabungan Simpel' ? 'Penghasilan Ortu' : 'Penghasilan'} value={submission.jobInfo.salaryRange} />
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

      {/* SYARAT & KETENTUAN */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>PERNYATAAN & KETENTUAN</Text>
        <TncItem number="1" text="Dengan ini saya menyatakan bahwa data yang saya berikan dalam formulir ini adalah benar, akurat, dan dapat dipertanggungjawabkan." />
        <TncItem number="2" text="Saya setuju untuk tunduk pada syarat dan ketentuan umum pembukaan rekening yang berlaku di Bank Sleman serta peraturan perundang-undangan yang berlaku." />
        <TncItem number="3" text="Bukti pendaftaran ini harap dibawa beserta e-KTP asli (dan NPWP jika ada) ke Kantor Cabang yang dipilih untuk proses verifikasi dan aktivasi rekening." />
        <TncItem number="4" text="Dokumen ini berlaku selama 14 hari kalender sejak tanggal pendaftaran. Jika melewati batas waktu tersebut, nasabah diwajibkan melakukan registrasi ulang." />
        <TncItem number="5" text="Bank berhak menolak permohonan pembukaan rekening apabila ditemukan ketidaksesuaian data atau informasi yang tidak valid." />
      </View>

      {/* ===== FOOTER ===== */}
      <View style={styles.footerContainer} fixed>
        <View style={styles.footerLine} />
        <View style={styles.footerRow}>
          <Text>Dicetak: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          <Text>
            Halaman <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </Text>
        </View>
        <Text style={{ ...styles.footerText, marginTop: 4 }}>
          Dokumen ini dihasilkan oleh Sistem BukaTabungan Bank Sleman secara otomatis dan sah tanpa tanda tangan basah.
        </Text>
        <Text style={styles.footerText}>
          {submission.cabangName || `Cabang ${submission.cabangPengambilan}`} • Bank Sleman
        </Text>
      </View>
    </Page>
  </Document>
);
