# ARINUSA EQUALIZER
**Professional Windows System Equalizer & Dynamic Island Desktop**

- **Pengembang:** Arif Gunawan  
- **Perusahaan:** Arinusa Group  
- **Target Platform:** Windows 10 / 11 (x64)  
- **Versi:** 1.0.0 (Production Build)  

---

## Deskripsi Produk
**ARINUSA EQUALIZER** adalah aplikasi desktop profesional untuk sistem operasi Windows yang dirancang untuk memberikan kontrol audio presisi tinggi, pemrosesan Equalizer 10-Band parametrik real-time, efek DSP tingkat lanjut (Bass Enhancement, Reverb, Echo, Loudness, Virtual Surround), Dynamic Island Desktop interaktif, serta manajemen preset dan perangkat audio komprehensif.

---

## Fitur Utama

1. **Equalizer 10-Band Parametrik Real-Time**
   - Frekuensi standar industri: `31 Hz`, `62 Hz`, `125 Hz`, `250 Hz`, `500 Hz`, `1 kHz`, `2 kHz`, `4 kHz`, `8 kHz`, dan `16 kHz`.
   - Preamp (-12 dB hingga +12 dB) dengan perlindungan kliping otomatis.
   - Tombol Bypass & Reset instan ke konfigurasi netral.
   - Kurva respons frekuensi visual interaktif real-time berdasarkan filter Biquad DSP.

2. **Efek DSP & Dynamic Audio Enhancement**
   - **Bass Enhancement:** Dorongan sub-bass 85Hz yang bertenaga dan jernih.
   - **Loudness Compensation:** Keseimbangan tonal pada volume rendah/tinggi.
   - **Reverb & Echo:** Ruang akustik sintetis dan delay modular.
   - **Virtual Surround & Stereo Width:** Perluasan panggung suara (soundstage).

3. **Dynamic Island Desktop**
   - Jendela melayang desktop terpisah (Always on Top) dengan mode Compact, Expanded, Mini, dan Hidden.
   - Sinkronisasi instan dengan aplikasi utama untuk kontrol preset, bypass, dan status audio engine.
   - Transparansi dan pengaturan posisi yang dapat disesuaikan.

4. **Audio Seluruh Sistem & Audio Engine**
   - Mendukung pemutaran demo sintetis instan (Rock, Synthwave, Bass Test, Frequency Sweep).
   - Mendukung penangkapan audio sistem Windows (YouTube, Spotify, Games) melalui loopback/capture media.
   - Metering level audio puncak & RMS secara real-time.

5. **Manajemen Preset & Penyimpanan Lokal**
   - Preset bawaan: *Flat, Rock, Pop, Jazz, Classical, Hip-Hop, Vocal, Full Bass, Bass Boost*.
   - Pembuatan, pengubahan nama, dan penghapusan preset kustom.
   - Ekspor dan Impor preset format JSON.

6. **Lisensi Komersial & Keamanan**
   - Sistem lisensi berbasis kunci offline (Free / Premium).
   - Isolasi konteks Electron (`contextIsolation: true`, `nodeIntegration: false`) untuk keamanan tingkat tinggi.

---

## Panduan Instalasi & Build

### 1. Menjalankan Mode Pengembangan (Development)
```bash
npm install --legacy-peer-deps
npm run dev
```

### 2. Membangun Installer Windows (.EXE)
```bash
npm run build
npx electron-builder --win --x64
```
File installer akan dihasilkan pada direktori:
`dist_electron/ARINUSA-Equalizer-Setup-1.0.0.exe`

---

## Panduan Troubleshooting Audio Windows

- **Audio tidak merespon:** Pastikan *Audio Engine* dalam keadaan aktif (klik tombol *Power* di pojok kanan atas aplikasi) dan pastikan output audio default Windows mengarah ke perangkat yang benar.
- **Distorsi / Kliping:** Turunkan *Preamp* atau kurangi gain pada band frekuensi rendah jika indikator *Clipping* menyala merah.
- **Izin Administrator:** Beberapa fitur integrasi sistem memerlukan hak akses administrator saat instalasi pertama.

---

## Lisensi & Hak Cipta
Copyright © 2026 ARINUSA GROUP (Arif Gunawan). Seluruh hak cipta dilindungi undang-undang.
