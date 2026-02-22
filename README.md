# Website Himpunan Mahasiswa Teknologi Konstruksi Bangunan Air (HMTKBA)

Selamat datang di repositori resmi Website HMTKBA. Proyek ini dibangun dengan standar arsitektur tingkat tinggi untuk memastikan performa, skalabilitas, dan kemudahan pemeliharaan jangka panjang.

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4 (Modern Engine)
- **Animations:** Framer Motion (Wave Transitions)
- **Icons:** Lucide React
- **Language:** TypeScript (Strict Mode)

---

## 🏗 Arsitektur Proyek (Clean Architecture)

Web ini menggunakan prinsip **Clean Architecture** untuk memisahkan logika bisnis dari UI dan layanan eksternal. Berikut adalah struktur layer-nya:

### 1. Domain Layer (`src/domain`)
- **Entities:** Definisi data dasar (misal: `Member`, `Document`).
- **Repositories:** Interface (kontrak) untuk akses data. Layer ini tidak tahu data datang dari mana (API/DB), ia hanya mendefinisikan "apa" yang dibutuhkan.

### 2. Application Layer (`src/application`)
- **Use Cases:** Berisi logika alur kerja aplikasi (misal: `GetLandingPageData`, `AskAIAssistant`). Layer ini yang menghubungkan Domain dengan Infrastructure.

### 3. Infrastructure Layer (`src/infrastructure`)
- **Repositories:** Implementasi nyata dari interface di Domain. Saat ini menggunakan `Mock Repository` untuk data statis, namun siap diganti ke API asli atau Database (Supabase/Firebase) tanpa merusak layer lain.

### 4. Presentation Layer (`src/presentation`)
- **Components/UI:** Komponen kecil yang "bodoh" (hanya menerima props), seperti `Button` dan `Typography`.
- **Components/Animations:** Komponen khusus visual seperti `WaveLoadingScreen`.
- **Containers:** Komponen besar yang memiliki logika atau memanggil Use Case (misal: `HeroContainer`, `AIAssistantTeaserContainer`).
- **App:** Struktur routing Next.js. Note: File di `src/app` hanyalah proxy/jembatan ke `src/presentation/app`.

---

## 🎨 Identitas Brand (Warna & Font)

Gunakan variabel CSS yang sudah didaftarkan di `src/presentation/styles/globals.css` untuk menjaga konsistensi:

- **Navy (#102a6b):** `bg-primary` atau `text-primary`. Digunakan untuk elemen dominan dan kesan kokoh.
- **Cream (#fcedd3):** `bg-background` atau `bg-cream`. Digunakan sebagai latar belakang utama agar nyaman di mata.
- **Gold (#cea273):** `bg-cta` atau `text-cta`. Digunakan untuk tombol aksi (CTA) dan aksen logo.
- **Font:** Montserrat (Tegas dan profesional untuk engineering).

---

## ⚙️ Panduan Maintenance (Pemeliharaan)

### A. Cara Update Data (Mock)
Selama API asli belum tersedia, data diatur melalui `src/infrastructure/repositories/MockLandingRepository.ts`.
1. Buka file tersebut.
2. Ubah teks pada method `getHeroContent`, `getVisionMission`, atau daftar member di `getOrganizationStructure`.
3. Simpan, dan web akan terupdate otomatis.

### B. Menambah Fitur Baru (Workflow)
Untuk menjaga kebersihan kode, ikuti langkah ini:
1. **Domain:** Buat entitas/interface baru jika ada model data baru.
2. **Infrastructure:** Buat mock implementation-nya.
3. **Application:** Buat Use Case baru untuk fitur tersebut.
4. **Library DI:** Daftarkan Use Case baru di `src/lib/di.ts`.
5. **Presentation:** Buat Container/Page untuk menampilkan data tersebut.

### C. Menghubungkan ke API Asli
Jika nanti ingin menggunakan database asli:
1. Buat file repository baru di `src/infrastructure/repositories/RealApiRepository.ts`.
2. Implementasikan interface yang sama dari Domain.
3. Ganti instansiasi di `src/lib/di.ts` dari `MockRepository` ke `RealApiRepository`.
4. **Selesai.** Anda tidak perlu menyentuh file UI sama sekali.

### D. Maintenance Animasi Loading
Jika ingin mengubah durasi loading:
- Buka `src/presentation/components/animations/WaveLoadingScreen.tsx`.
- Ubah angka pada `setTimeout` (dalam milidetik).
- Pastikan delay pada `src/presentation/containers/HeroContainer.tsx` juga disesuaikan agar transisinya sinkron.

---

## 🚀 Cara Menjalankan

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Run Development Server:**
   ```bash
   npm run dev
   ```
3. **Build for Production:**
   ```bash
   npm run build
   ```

---

Dibuat dengan dedikasi untuk **HMTKBA**. Pastikan arsitektur ini tetap dijaga agar web tidak menjadi "Spaghetti Code" di masa depan.
