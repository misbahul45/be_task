Berikut versi **README.md final tanpa ikon/emotikon**, disusun secara profesional dan sepenuhnya menyesuaikan isi *Case Assessment – Back End*.
Bahasanya tetap natural dan jelas untuk evaluasi teknis, tanpa hiasan visual:

---

# Mood Check-In API — Backend Assessment for EmergencyyCall

**Case Assessment: Back-End (EmergencyyCall Mental Health Platform)**
Disusun dengan pendekatan arsitektur modular ala **NestJS**, ditulis menggunakan **Express + TypeScript + Prisma**.

---

## Deskripsi Singkat

Mood Check-In API adalah sistem backend yang dirancang untuk mendukung fitur pelaporan suasana hati (*Mood Tracking*) pada platform **EmergencyyCall**, bagian dari solusi *mental health-tech* yang menggabungkan teknologi *AI Support* dengan data emosi pengguna.

Aplikasi ini menangani:

* Pencatatan suasana hati harian pengguna.
* Penghitungan tren mood mingguan atau bulanan.
* Integrasi *AI recommendation system* berbasis *mood history*.

Proyek ini dikembangkan dengan filosofi **Clean Architecture** dan **modular design**, mengikuti gaya struktural *NestJS*, tetapi diimplementasikan menggunakan **Express + TypeScript** untuk menjaga kesederhanaan dan fleksibilitas integrasi.

---

## Tujuan dan Fokus Desain

Sesuai dokumen *Case Assessment – Back End*, sistem ini dibangun dengan fokus pada:

* **Keamanan:** Perlindungan data pribadi dengan JWT dan validasi input menggunakan Zod.
* **Performa:** Optimasi Prisma + PostgreSQL agar mampu menampung hingga 50.000 entri per hari.
* **Integrasi AI:** Siap dihubungkan ke sistem rekomendasi AI menggunakan LangChain + Groq.
* **Keterpaduan:** API konsisten dan mudah diintegrasikan dengan front-end web maupun mobile.

---

## Struktur Proyek

```
src/
├── config/              # Konfigurasi environment, database, dan prisma client
├── lib/                 # Integrasi eksternal (AI, email, dll.)
├── middlewares/         # Middleware untuk auth, validasi, dan error handling
├── types/               # Definisi tipe global TypeScript
├── utils/               # Fungsi bantu (helper functions)
├── v1/
│   ├── auth/            # Modul autentikasi dan verifikasi email
│   ├── users/           # Modul pengguna
│   ├── moods/           # Modul utama mood check-in dan analisis AI
│   └── v1.router.ts     # Routing utama versi API
└── main.ts              # Entry point aplikasi
```

Struktur di atas mengikuti pola **modular feature-based**, mirip seperti pendekatan modul di NestJS.

---

## Arsitektur dan Flow

Alur request dalam sistem:

1. Client (web atau mobile) mengirim request ke `Express Router`.
2. Middleware `AuthGuard` memvalidasi JWT.
3. Zod Schema melakukan validasi payload.
4. Controller memanggil Service sesuai domain.
5. Service berinteraksi dengan **Prisma ORM** menuju PostgreSQL.
6. (Opsional) Service AI memproses data mood menggunakan **LangChain + Groq**.
7. Response dikembalikan ke client dalam format JSON.

```
Client → Controller → Service → Repository → Prisma → Database
```

---

## Skema Database (Prisma)

### Tabel User

| Kolom         | Tipe          | Deskripsi          |
| ------------- | ------------- | ------------------ |
| id            | String (UUID) | Primary key        |
| name          | String        | Nama pengguna      |
| email         | String        | Unik               |
| password      | String        | Hash (bcrypt)      |
| emailVerified | DateTime?     | Tanggal verifikasi |
| createdAt     | DateTime      | Otomatis           |

### Tabel Mood

| Kolom     | Tipe          | Deskripsi                |
| --------- | ------------- | ------------------------ |
| id        | String (UUID) | Primary key              |
| userId    | String        | Relasi ke User           |
| date      | DateTime      | Tanggal mood             |
| moodScore | Int           | Skor (1–5)               |
| moodLabel | String?       | Label suasana hati       |
| notes     | String?       | Catatan pengguna         |
| embedding | Float[]       | Vektor untuk analisis AI |
| createdAt | DateTime      | Timestamp                |

---

## Endpoint API (v1)

### Auth

| Method | Endpoint             | Deskripsi                  |
| ------ | -------------------- | -------------------------- |
| POST   | /auth/register       | Registrasi akun baru       |
| POST   | /auth/login          | Login dan token JWT        |
| GET    | /auth/verify-email   | Verifikasi email           |
| POST   | /auth/reset-password | Kirim email reset password |
| GET    | /auth/me             | Ambil data user aktif      |

### Moods

| Method | Endpoint       | Deskripsi                         |
| ------ | -------------- | --------------------------------- |
| POST   | /moods         | Tambah laporan mood               |
| GET    | /moods         | Ambil semua mood pengguna         |
| GET    | /moods/:id     | Detail mood tertentu              |
| GET    | /moods/summary | Rata-rata mood mingguan/bulanan   |
| POST   | /moods/ask     | Tanya AI berdasarkan riwayat mood |

---

## Pertimbangan Keamanan

* Menggunakan **JWT Authentication** dengan cookie HTTP-only.
* Validasi input menggunakan **Zod**.
* Password di-hash menggunakan **bcrypt**.
* (Opsional) **Rate Limit** untuk mencegah spam API.
* **Data Ownership Check** agar pengguna hanya dapat mengakses datanya sendiri.
* **Email Verification Flow** menggunakan Resend API.

---

## Pertimbangan Skalabilitas

* Prisma + PostgreSQL dengan indexing di kolom `userId` dan `date`.
* *Connection pooling* otomatis melalui Prisma.
* Siap untuk horizontal scaling melalui load balancer.
* Non-blocking I/O dengan Express.
* Arsitektur modular memudahkan penambahan fitur baru.

---

## Integrasi AI (LangChain + Groq)

Sistem ini menggunakan **LangChain** dan **Groq** untuk menganalisis pola suasana hati pengguna serta memberikan respons yang empatik dan kontekstual.
Pendekatan yang digunakan:

* LangChain untuk manajemen prompt dan penyusunan *reasoning chain*.
* Groq sebagai model reasoning cepat.
* Data mood diubah menjadi embedding vector untuk mendukung pencarian semantik.

---

## Alasan Teknis di Balik Desain

| Aspek          | Keputusan            | Alasan                                          |
| -------------- | -------------------- | ----------------------------------------------- |
| Framework      | Express + TypeScript | Fleksibel, cepat, dan mudah diuji               |
| Arsitektur     | Modular ala NestJS   | Memudahkan scaling dan maintainability          |
| ORM            | Prisma               | Type-safe, cepat, dan efisien                   |
| Database       | PostgreSQL           | Stabil untuk data relasional dan kueri kompleks |
| AI             | LangChain + Groq     | Integrasi mudah dan performa tinggi             |
| Validasi Input | Zod                  | Mencegah bug runtime melalui validasi tipe kuat |

---

## Pengujian API

Pengujian dapat dilakukan menggunakan Postman atau Hoppscotch.

Contoh endpoint:

```
POST /api/v1/auth/register
POST /api/v1/moods
GET  /api/v1/moods/summary
```

Contoh format respons:

```json
{
  "status": "success",
  "data": { ... }
}
```

---

## Cara Menjalankan Proyek

```bash
# 1. Clone repository
git clone <repo-url>
cd mood-checkin-api

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env

# 4. Jalankan migrasi database
pnpm prisma migrate dev

# 5. Jalankan server
pnpm dev
```

Server berjalan di:
[http://localhost:3000](http://localhost:3000)

---

## Kontributor

**Developer:** Misbahul Muttaqin
**Platform:** EmergencyyCall — Mental Health & AI Support System
**Inspirasi Arsitektur:** Pendekatan modular dan clean architecture ala NestJS, diimplementasikan menggunakan Express + TypeScript.

---
