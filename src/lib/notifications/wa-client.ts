export const sendWhatsAppMessage = async (phone: string, scanId: string, diagnosis: string, confidence: number) => {
  // Karena ini adalah simulasi (demo) untuk Gemastik, kita mencetaknya dengan indah di terminal
  // Jika nanti memakai API Asli (seperti Fonnte/Wablas), logika Fetch diletakkan di sini.
  
  const waText = `🚨 *PERINGATAN DARURAT OCUSENSE* 🚨\n\nPasien terdeteksi *${diagnosis}* dengan akurasi ${confidence}%.\n\nScan ID: ${scanId}\nSegera buka dashboard untuk meninjau citra medis dan memberikan validasi klinis.`;

  console.log(`\n=========================================`);
  console.log(`📱 [DEMO WA GATEWAY] MENGIRIM PESAN...`);
  console.log(`➡️  Tujuan : ${phone}`);
  console.log(`💬 Isi Pesan:\n${waText}`);
  console.log(`=========================================\n`);

  // Simulasi penundaan jaringan (network delay) 1 detik
  await new Promise((resolve) => setTimeout(resolve, 1000)); 

  return { success: true, status: "Terkirim (Simulasi)" };
};