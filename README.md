<h1 align="center">🟢 GreenFlag Fuzzy SAW</h1>
<p align="center">Dashboard interaktif buat ngeranking alternatif laboratorium pakai Fuzzy Simple Additive Weighting.</p>
<p align="center">
  <a href="https://skipsi-greenflag.vercel.app/">Demo</a>
  ·
  <a href="https://github.com/whatyuupratama/skipsi-greenflag">Repo</a>
</p>

---

<table>
  <tr>
    <td>

### 🎯 Kenapa GreenFlag?
- Data lapangan seringnya "perkiraan" (rendah, sedang, tinggi) → kita ubah jadi **Triangular Fuzzy Number (TFN)** biar tetep terukur.
- SAW versi fuzzy ngejaga perbandingan antar kriteria walau skalanya beda-beda.
- Semua tahapan (input → normalisasi → pembobotan → defuzzify) kebuka jelas, tinggal tunjuk panelnya pas presentasi.

### 🚀 Quick Features
- Unlimited kriteria/alternatif lengkap dengan input TFN.
- Normalisasi otomatis sesuai tipe `max` (benefit) atau `min` (cost).
- Ringkasan bobot, matriks berbobot, skor fuzzy, ranking crisp, dan interpretasi naratif.
- Pure client-side: tinggal buka di browser, nggak perlu backend.

    </td>
    <td>

### 🧱 Stack Snapshot
| Layer | Tools |
| ----- | ----- |
| UI | Next.js 14, Tailwind, Framer Motion, MagicUI |
| State | Zustand store (`criteria`, `alternatives`) |
| Logika | TypeScript `calculateFuzzySaw` + helper TFN |
| Deploy | Vercel, pnpm/npm scripts |

### 🧑‍🤝‍🧑 Target User
- Kepala lab / QA yang butuh nentuin prioritas cepat.
- Tim pengadaan yang perlu pembobotan transparan.
- Mahasiswa/peneliti yang pengin belajar fuzzy SAW sambil lihat rumusnya live.

    </td>
  </tr>
</table>

---

## 🗂️ Isi Halaman
1. [Alur Cerita Pengguna](#-alur-cerita-pengguna)
2. [Mesin Fuzzy SAW](#-mesin-fuzzy-saw)
3. [Rumus & Formula](#-rumus--formula)
4. [Tutorial Hitung Manual (Ringan)](#-tutorial-hitung-manual-ringan)
5. [Cara Baca Tiap Panel](#-cara-baca-tiap-panel)
6. [File Penting](#-file-penting)
7. [Timeline & Tim](#-timeline--tim)
8. [Risiko & Catatan](#-risiko--catatan)

---

## 🧭 Alur Cerita Pengguna
| Tahap | Yang Terjadi di UI | Apa yang Dilakukan Dev |
| ----- | ------------------ | ---------------------- |
| 1. Setup Kriteria | User tambah nama kriteria, bobot, dan tipe max/min. | Zustand store bikin ID baru + TFN kosong buat semua alternatif (`blankValue`). |
| 2. Isi TFN | User masukin `low-mid-high` per alternatif. | Handler di `FsawDetectionClient` nyimpen input sementara → commit ke store begitu angka valid. |
| 3. Lihat Hasil | UI otomatis nunjukin tabel normalisasi, pembobotan, agregasi, ranking. | `useMemo` panggil `calculateFuzzySaw(criteria, alternatives)` tiap ada perubahan. |
| 4. Interpretasi | User buka halaman interpretasi untuk narasi. | `interpretasi/page.tsx` generate kalimat dari skor fuzzy & crisp. |

---

## 🧠 Mesin Fuzzy SAW
Semua inti logika ada di `src/utils/fuzzy/fuzzySaw.ts`. Flow-nya gampang banget buat ceritain ke audience:

1. **Decision Matrix** – kumpulin semua TFN dari store (pakai `ensureFuzzy` biar nggak ada undefined). Output-nya `MatrixRow[]`.
2. **Normalisasi** – bikin referensi `max/min` per kriteria (`buildNormalizationReference`), lalu setiap nilai dinormalisasi sesuai tipe.
3. **Bobot** – jumlah bobot dihitung → dinormalisasi. TFN ternormalisasi dikali bobot pakai `multiplyFuzzy`.
4. **Agregasi** – TFN berbobot dijumlahin (`addFuzzy`) per alternatif → dapet tf suatu alternatif saja.
5. **Defuzzify** – TFN akhir diubah ke angka crisp `(a + 4m + b)/6`, lalu diurutkan untuk ranking.

Bonus helper: `formatFuzzyValue` buat nampilin TFN di UI, `safeDivide` supaya nggak meledak waktu bagi 0.

---

## 📐 Rumus & Formula
Tulisan santai tapi tetep matematis biar gampang nginget.

### 1. Triangular Fuzzy Number (TFN)
Ditulis sebagai `A = (a, m, b)` dengan `a ≤ m ≤ b`. Maknanya:
- `a (low)` → nilai terendah yang masih masuk akal.
- `m (mid)` → nilai paling dipercaya.
- `b (high)` → skenario terbaik.

### 2. Normalisasi
Untuk setiap kriteria `Cj` dengan tipe **benefit (`max`)**:
```
ŝ_low = a_low / max_low
ŝ_mid = a_mid / max_mid
ŝ_high = a_high / max_high
```

Untuk kriteria **cost (`min`)**:
```
ŝ_low = min_low / a_low
ŝ_mid = min_mid / a_mid
ŝ_high = min_high / a_high
```
Kalau denominator 0 → hasil dikunci 0 biar aman.

### 3. Normalisasi Bobot
Bobot asli `wj` dijumlahkan (`Σ wj`). Bobot normal = `wj / Σ wj`. Kalau total 0, fallback `1 / jumlah_kriteria`.

### 4. Pembobotan TFN
TFN ternormalisasi `S = (ŝ_low, ŝ_mid, ŝ_high)` dikali bobot `wj`:
```
S* = (ŝ_low * wj, ŝ_mid * wj, ŝ_high * wj)
```

### 5. Agregasi per Alternatif
Jumlahkan semua TFN berbobot dalam satu alternatif:
```
F_alt = Σ_j S*_j
```
Penjumlahan dilakukan per titik (`low`, `mid`, `high`).

### 6. Defuzzification
Rumus yang dipakai: `C = (a + 4m + b) / 6`. Bobot 4 di tengah bikin nilai mid lebih dominan.

### 7. Ranking
Sorting menurun berdasarkan `C`. Kalau dua nilai sama, bisa lihat TFN untuk keputusan akhir (misal bandingin range terendah).

---

## 📊 Tutorial Hitung Manual (Ringan)
Biar siap ditanya, berikut contoh mini (angka fiktif):

1. **Input**
   - Dua kriteria: `Kualitas (max, bobot 0.6)` dan `Biaya (min, bobot 0.4)`.
   - Alternatif X: `Kualitas = (60, 70, 80)`, `Biaya = (20, 30, 40)`.
   - Alternatif Y: `Kualitas = (50, 60, 70)`, `Biaya = (15, 25, 35)`.

2. **Decision Matrix**
   - Tinggal susun pasangan TFN sesuai tabel.

3. **Cari Referensi**
   - Kualitas maks = `(60 vs 50)` → max = `(60, 70, 80)`.
   - Biaya min = `(20 vs 15)` → min = `(15, 25, 35)`.

4. **Normalisasi**
   - Kualitas X (max): `(60/60, 70/70, 80/80) = (1,1,1)`.
   - Kualitas Y: `(50/60, 60/70, 70/80) ≈ (0.833, 0.857, 0.875)`.
   - Biaya X (min): `(15/20, 25/30, 35/40) ≈ (0.75, 0.833, 0.875)`.
   - Biaya Y: `(15/15, 25/25, 35/35) = (1,1,1)`.

5. **Bobot Normal**
   - Total bobot = 1.0 → tetap (0.6 dan 0.4).

6. **Pembobotan**
   - Kualitas X: `(1,1,1) * 0.6 = (0.6,0.6,0.6)`.
   - Kualitas Y: `(0.833, 0.857, 0.875) * 0.6 ≈ (0.5, 0.514, 0.525)`.
   - Biaya X: `(0.75, 0.833, 0.875) * 0.4 ≈ (0.3, 0.333, 0.35)`.
   - Biaya Y: `(1,1,1) * 0.4 = (0.4,0.4,0.4)`.

7. **Agregasi**
   - X: `(0.6+0.3, 0.6+0.333, 0.6+0.35) = (0.9, 0.933, 0.95)`.
   - Y: `(0.5+0.4, 0.514+0.4, 0.525+0.4) = (0.9, 0.914, 0.925)`.

8. **Defuzzify**
   - X: `(0.9 + 4*0.933 + 0.95)/6 ≈ 0.93`.
   - Y: `(0.9 + 4*0.914 + 0.925)/6 ≈ 0.914`.

9. **Ranking**
   - Alternatif X unggul tipis. Jelasin juga kenapa: kualitas Y lebih rendah, biaya Y rendah tapi bobot biaya cuma 0.4.

Dengan contoh ini kamu bisa jelasin proses manual sambil nunjuk panel di aplikasi (hasilnya bakal mirip karena rumusnya sama).

---

## 🖼️ Cara Baca Tiap Panel
| Panel | Tips Penjelasan | Insight Teknis |
| ----- | --------------- | -------------- |
| **Kriteria & Bobot** | Bebas isi bobot, sistem normalisasi otomatis. Tunjuk toggle `max/min` buat bedain benefit vs cost. | Data sumber: `useFuzzySawStore.criteria`. Fungsi `updateCriterion` ubah `weight` dan `type`. |
| **Matriks Nilai Fuzzy** | Ingatkan urutan `low ≤ mid ≤ high`. Bisa share rule-of-thumb (low = minimal realistis). | `updateAlternativeValue` pastiin properti TFN selalu ada (pakai `ensureValue`). |
| **Normalisasi** | Jelasin kenapa beberapa baris punya angka 1 penuh (karena paling tinggi/paling rendah). | `normalizeValue` baca referensi `max/min` dari `buildNormalizationReference`. |
| **Matriks Berbobot** | Ganti bobot besar dan lihat dampaknya. Panel ini yang menunjukkan "kontribusi akhir" tiap kriteria. | Hasil dari `multiplyFuzzy(value, weight)`. |
| **Agregasi & Ranking** | TFN agregat = jumlah semua kriteria. Nilai crisp = defuzzify. Ranking diurutkan descending. | `aggregatedScores` diisi di `calculateFuzzySaw` dan dipakai juga buat interpretasi. |
| **Interpretasi** | Narasi otomatis bantu jelasin ke stakeholder awam. Sebut skor crisp + TFN untuk menegaskan confidence. | `interpretasi/page.tsx` memanggil `calculateFuzzySaw` lagi lalu bikin bullet insight. |

> Tips demo: ubah salah satu nilai `mid` atau bobot, lalu ajak audiens lihat perubahan dari panel input sampai interpretasi untuk menunjukkan keterkaitan semuanya.

---

## 📁 File Penting
| Path | Fungsi Singkat |
| ---- | -------------- |
| `src/utils/fuzzy/fuzzySaw.ts` | Mesin utama: normalisasi, pembobotan, agregasi, defuzzify. |
| `src/store/fuzzySawStore.ts` | Zustand store (CRUD kriteria & alternatif, TFN default). |
| `src/app/fsaw-detection/FsawDetectionClient.tsx` | UI kalkulator + handler input. |
| `src/app/fsaw-detection/interpretasi/page.tsx` | Halaman narasi hasil. |
| `src/components/section.tsx` & kawan-kawan | Komponen layout & kartu. |

---

## 🗓️ Timeline & Tim

<table>
  <tr>
    <td valign="top">

### Timeline Cepat
| Minggu | Fokus |
| ------ | ----- |
| W1 | Riset teori Fuzzy SAW + kumpulin kriteria real | 
| W2 | Desain UI + setup store Zustand |
| W3 | Implementasi kalkulator, tabel, dan animasi | 
| W4 | Halaman interpretasi, polishing, dokumentasi presentasi |

    </td>
    <td valign="top">

### Tim
| Role | Nama | Institusi | Catatan |
| ---- | ---- | --------- | ------- |
| PM / FE | Wahyu Pratama | ITB Asia Malang | Koordinasi & UI/UX |
| FE | (Isi sesuai kebutuhan) | - | Implementasi komponen |
| Research | (Isi sesuai kebutuhan) | - | Validasi kriteria & bobot |

*(update tabel sesuai formasi terbaru ya!)*

    </td>
  </tr>
</table>

---

## ⚠️ Risiko & Catatan
- **TFN tidak urut** → bikin bentuk segitiga kebalik, defuzzify jadi nggak logis. Bisa tambahin validasi sebelum submit.
- **Bobot ekstrem** → satu kriteria bisa mendominasi; jelasin ke user supaya nggak asal taruh 0.99.
- **Client-only** → super ringan buat data kecil, tapi dataset ratusan baris mungkin perlu pagination atau worker.
- **Transparansi** → semua rumus kelihatan, jadi siap-siap jawab detail (README ini bisa jadi contekan).

---

## 📚 Sumber Belajar
- Buku Kusumadewi dkk. tentang Fuzzy MADM (bab SAW).
- Artikel Triangular Fuzzy Number & defuzzification `(a + 4m + b)/6`.
- Dataset laboratorium internal untuk uji coba bobot dan verifikasi hasil.

---

## 🪪 Lisensi
Proyek edukasi & riset internal. Bebas dipakai buat belajar / demo. Untuk keputusan kritikal, lakukan validasi tambahan dan koordinasi dengan tim.

---
