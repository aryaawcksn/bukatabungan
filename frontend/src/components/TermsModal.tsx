import React from 'react';
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TermsModal({ open, onClose }: TermsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-emerald-900">Syarat dan Ketentuan</h2>
            <p className="text-xs text-gray-500 mt-1">PT BPR Bank Sleman (Perseroda)</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto text-gray-600 space-y-6 leading-relaxed text-sm">
          
          {/* SECTION: KETENTUAN UMUM */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2">Ketentuan Umum</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-gray-800">I. Definisi Rekening</h4>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li><strong>Tabungan</strong> adalah simpanan yang penarikannya hanya dapat dilakukan menurut syarat tertentu.</li>
                  <li><strong>Deposito</strong> adalah simpanan nasabah kepada Bank yang dapat dicairkan kembali setelah jangka waktu tertentu dan dapat diperpanjang (roll over) penempatannya, dengan jangka waktu yang sama dan diatur menurut perjanjian.</li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-gray-800">II. Kepemilikan Rekening</h4>
                <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li>Pembukaan rekening dapat berupa perorangan, Badan Usaha dan Gabungan.</li>
                  <li>Rekening Gabungan dapat dibuka dengan kombinasi/syarat "AND" atau "OR", apabila:
                    <ul className="list-[lower-alpha] pl-5 mt-1 space-y-1">
                      <li>Seluruh perintah yang diberikan oleh nasabah terkait dengan rekening Gabungan harus disetujui dan ditandatangani nasabah pemilik rekening, kecuali untuk rekening Gabungan "OR" maka transaksi dapat dilakukan oleh salah satu pihak atau sesuai kesepakatan tertulis dari nasabah pemilik rekening yang diterima oleh Bank.</li>
                      <li>Tindakan yang dilakukan oleh salah satu nasabah pemilik rekening Gabungan tersebut mengikat semua pihak secara bersama-sama/bertanggung jawab terhadap Bank atas semua akibat yang timbul.</li>
                    </ul>
                  </li>
                  <li>Bank dibebaskan dari segala tuntutan dan tanggung jawab yang timbul dari setiap risiko dan kerugian serta dampak lainnya yang timbul karena perselisihan dan penyalahgunaan rekening oleh nasabah pemilik rekening termasuk Force Majeure (kejadian di luar kekuasaan Bank).</li>
                  <li>Nasabah wajib untuk menginformasikan kepada Bank apabila terdapat perubahan data, antara lain perubahan nama,alamat,nomor telepon dan/atau NPWP.</li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-gray-800">III. Bunga dan Biaya</h4>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Perhitungan bunga atas rekening mengikuti peraturan yang berlaku.</li>
                  <li>Bunga atas rekening nasabah akan dikenakan pajak atau pungutan lain sesuai dengan peraturan yang berlaku</li>
                  <li>Nasabah menanggung risiko dan kerugian atas penurunan nilai dana pada rekening yang disebabkan oleh pembebanan,pemotongan pajak yang dikenakan berdasarkan peraturan yang berlaku.</li>
                  <li>Besarnya bunga dan biaya yang dibebankan kepada nasabah akan mengikuti ketentuan yang berlaku dan dapat berubah sewaktu-waktu.</li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-gray-800">IV. Penyetoran, Penarikan, Pemindahbukuan dan Transfer</h4>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Penyetoran, Penarikan, Pemindahbukuan dan Transfer dilakukan oleh Bank sesuai dengan tata cara yang diatur oleh Bank</li>
                  <li>Penyetoran berlaku setelah dana nasabah diterima secara efektif oleh Bank dan Penarikan hanya dapat dilakukan bila telah tersedia saldo efektif dalam rekening nasabah.</li>
                  <li>Bila Bank menerima beberapa instruksi/perintah transaksi penarikan dan/atau transfer sekaligus dari nasabah, maka Bank hanya akan menjalankan instruksi/perintah transaksi sesuai dengan kecukupan dana nasabah.</li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-gray-800">V. Rekening Pasif, Pemblokiran dan Penutupan Rekening</h4>
                <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li>Perintah pemblokiran rekening dapat diberikan atas perintah nasabah,perintah dari Pejabat maupun instansi Pemerintah yang memiliki kewenangan sesuai peraturan yang berlaku serta berdasarkan pertimbangan Bank.</li>
                  <li>Rekening nasabah yang tergolong rekening pasif yaitu rekening tidak bermutasi selama jangka waktu tertentu sesuai dengan kebijakan Bank maka rekening tersebut tidak dapat dilakukan transaksi pendebetan rekening sebelum nasabah melakukan aktifasi. Rekening pasif dikenai biaya administrasi rekening pasif sesuai ketentuan yang berlaku pada Bank.</li>
                  <li>Bank melarang segala bentuk penyalahgunaan rekening, termasuk sebagai sarana tindakan berindikasi pidana. Dalam hal terdapat indikasi penyalahgunaan rekening oleh nasabah, maka Bank berhak untuk melakukan pemblokiran rekening, mendebet kembali dana untuk diselesaikan sesuai dengan ketentuan yang berlaku dan atau sesuai kebijakan Bank, dan/atau penutupan rekening.</li>
                  <li>Penutupan rekening oleh nasabah:
                    <ul className="list-[lower-alpha] pl-5 mt-1 space-y-1">
                      <li>Perintah penutupan atas rekening dilakukan oleh nasabah yang bersangkutan, untuk penutupan rekening gabungan dengan syarat "AND" atau "OR" harus disetujui oleh seluruh pemilik rekening.</li>
                      <li>Saldo tersisa pada rekening yang ditutup akan diserahkan kepada nasabah yang berhak setelah dikurangi dengan biaya penutupan rekening dan biaya lainnya.</li>
                      <li>Nasabah wajib menyerahkan segala bentuk fasilitas,dokumen dan warkat yang diberikan oleh Bank antara lain buku tabungan,kartu ATM dan bilyet deposito sebelum penutupan rekening.</li>
                      <li>Nasabah bertanggung jawab terhadap seluruh kewajiban tersisa yang melekat atas rekening nasabah yang telah ditutup.</li>
                      <li>Dalam hal pemilik rekening meninggal dunia, maka penutupan rekening dapat dilakukan oleh ahli waris pemilik rekening sesuai dengan ketentuan yang berlaku di Bank.</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-gray-800">VI. Pengaduan Nasabah</h4>
                <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li>Nasabah dapat menyampaikan pengaduan kepada Bank melalui:</li>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Customer Service Kantor Cabang Bank Sleman terdekat</li>
                  <li>Surat tertulis melalui alamat Kantor PT BPR Bank Sleman (Perseroda) di Jalan Magelang KM 10 Tridadi, Sleman, DIY.</li>
                  <li>Email: info@banksleman.co.id atau telepon: (0274) 868321.</li>
                  <li>Aplikasi Portal Pelindungan Konsumen (APPK) : https://kontak157.ojk.go.id///li</li>
                </ul>
                <li>Bank akan menindaklanjuti dan menyelesaikan pengaduan nasabah sesuai dengan jangka waktu penyelesaian berdasarkan jenis pengaduan yang disampaikan.</li>
                </ol>

              </div>

              <div>
                <h4 className="font-bold text-gray-800">VII. Lain-Lain</h4>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Jika terjadi permasalahan hukum antara nasabah dengan Bank, maka kedua belah pihak setuju untuk memilih tempat kediaman hukum yang tetap dan secara umum pada Kantor Panitera Pengadilan Negeri yang wewenangnya meliputi wilayah tempat kantor Bank dimana rekening dibuka atau melalui Lembaga Alternatif Penyelesaian Sengketa yang difasilitasi oleh Otoritas Jasa Keuangan.</li>
                  <li>Bank berhak untuk memperbaiki/mengubah/melengkapi Ketentuan Umum dan Pernyataan Nasabah serta ketentuan lainnya setiap waktu. Atas perubahan tersebut Bank akan menyampaikan pemberitahuan kepada nasabah melalui media resmi Bank sesuai ketentuan yang berlaku pada Bank.</li>
                  <li>Bank wajib menjaga kerahasiaan data pribadi nasabah sesuai ketentuan perundang-undangan.</li>
                </ol>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* SECTION: PERNYATAAN NASABAH */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2">Pernyataan Nasabah</h3>
            <p className="mb-3 italic font-medium">Dengan menyetujui layanan ini, Saya/Kami menyatakan bahwa:</p>
            <ol className="list-decimal pl-5 space-y-3">
              <li>Data yang saya/kami isi dan dokumen pendukung pada Formulir Pembukaan Rekening PT BPR Bank Sleman (Perseroda) ini akurat, lengkap dan benar. Dalam hal ada perubahan terhadap data atau dokumen tersebut di kemudian hari, maka Saya/kami bersedia segera memberitahukan serta menyerahkan perubahan atas dokumen tersebut kepada Bank.</li>
              <li>Saya/Kami menyatakan bahwa data dan informasi Beneficial Owner (BO) yang disampaikan di atas adalah benar dan dapat dipertanggung jawabkan.</li>
              <li>Untuk kepentingan PT BPR Bank Sleman (Perseroda) dan/atau memenuhi ketentuan perundang-undangan, saya/kami menyetujui data pribadi Saya/Kami diberikan oleh PT BPR Bank Sleman (Perseroda) kepada pihak lain.</li>
              <li>Atas persetujuan data pribadi yang saya/kami berikan tersebut, PT BPR Bank Sleman (Perseroda) telah memberikan penjelasan kepada saya/kami tentang konsekuensi dari persetujuan yang saya/kami berikan dan saya/kami telah memahaminya. Apabila dikemudian hari saya/kami akan membatalkan persetujuan ini, maka saya/kami akan memberitahukan pembatalannya dengan surat tertulis atau dengan media elektronik kepada PT BPR Bank Sleman (Perseroda).</li>
              <li>Saya/Kami bersedia untuk diperiksa oleh PT BPR Bank Sleman (Perseroda) terhadap kebenaran data yang telah Saya/Kami berikan.</li>
              <li>PT BPR Bank Sleman (Perseroda) telah memberikan penjelasan yang cukup mengenai karakteristik produk yang akan Saya/Kami gunakan dan Saya/Kami telah mengerti dan memahami segala konsekuensi penggunaan produk dimaksud, termasuk manfaat, risiko dan biaya yang melekat pada produk dimaksud.</li>
              <li>Saya/Kami telah menerima,membaca,mengerti dan menyetujui serta bersedia untuk mentaati Ketentuan Umum Rekening dan Ketentuan Khusus produk serta ketentuan terkait lainnya yang berlaku di PT BPR Bank Sleman (Perseroda).</li>
              <li>Saya/Kami mengetahui dan menyetujui segala bentuk pernyataan dan/atau dokumen tertulis lainnya dan/atau ketentuan-ketentuan sebagaimana dimaksud dalam point 7 berikut seluruh lampiran yang melekat pada formulir ini merupakan satu kesatuan dan bagian yang tidak terpisahkan dari formulir aplikasi ini.</li>
              <li>Saya/kami memberikan hak dan wewenang kepada PT BPR Bank Sleman (Perseroda) untuk melakukan pemblokiran,pembatalan transaksi dan/atau penutupan rekening Saya/kami apabila Saya/kami:</li>
            
            <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Tidak mematuhi ketentuan prinsip APU-PPT dan PPPSPM,</li>
                  <li>Tidak memenuhi ketentuan hukum yang berlaku,</li>
                  <li>Data dan dokumen yang Saya/kami diberikan kepada PT BPR Bank Sleman (Perseroda) tidak benar atau diragukan kebenarannya,</li>
                  <li>Diindikasikan telah terjadi penyalahgunaan rekening,</li>
                  <li>Memiliki sumber dana transaksi yang diketahui dan/atau patut diduga berasal dari hasil tindak pidana</li>
                </ul>
              <li>Saya/kami mengetahui simpanan Saya/kami yang tersimpan dalam rekening Bank dijamin dalam program Penjaminan yang diselenggarakan Lembaga Penjamin Simpanan (LPS) sesuai dengan syarat dan ketentuan yang ditetapkan oleh LPS dan mengetahui bahwa nilai simpanan paling tinggi milik Saya/Kami yang dijamin ditentukan dalam ketentuan LPS yang berlaku serta mengetahui apabila Saya/Kami memperoleh bunga simpanan yang melebihi suku bunga wajar yang ditetapkan oleh LPS, maka simpanan tersebut tidak dijamin oleh LPS secara keseluruhan (baik pokok maupun bunga)</li>
                </ol>
            <p className="mt-6 font-semibold text-gray-800">
              Demikian pernyataan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end bg-gray-50 rounded-b-2xl">
          <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 shadow-lg shadow-emerald-200">
            Saya telah membaca dan memahami

          </Button>
        </div>

      </div>
    </div>
  );
}