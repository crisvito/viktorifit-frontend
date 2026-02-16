# VIKTORIFIT Frontend

**VIKTORIFIT Frontend** adalah aplikasi web client modern yang berfungsi sebagai antarmuka utama platform asisten kebugaran personal. Repositori ini berfokus **sepenuhnya pada pengembangan Frontend**, mencakup UI/UX, client-side logic, state management.

Frontend dirancang untuk memberikan pengalaman pengguna yang responsif, cepat, dan intuitif dalam merencanakan serta memantau aktivitas kebugaran.

> Catatan: Repositori ini **tidak mencakup backend atau machine learning engine**. Backend berperan sebagai external API service.

---

## Application Features

### 🏋️ Personalized Workout Recommendation

Fitur inti yang secara otomatis merancang program latihan berdasarkan kondisi fisik, tujuan, dan preferensi pengguna. Sistem menyesuaikan intensitas, jenis latihan, serta distribusi jadwal agar sesuai dengan profil masing-masing pengguna.

---

### 🔔 Notification System

Pengingat latihan harian yang disesuaikan dengan jadwal pengguna, dilengkapi tips kesehatan atau kutipan motivasi untuk menjaga konsistensi latihan.

---

### 📊 Progress Tracker

Visualisasi perkembangan fisik dan performa pengguna dalam bentuk grafik interaktif. Metrik yang ditampilkan meliputi:

* Perubahan berat badan
* Durasi latihan
* Perbandingan kalori terbakar vs target bulanan

---

### 📅 Workout Calendar

Penjadwalan otomatis yang menyusun agenda latihan mingguan berdasarkan hasil rekomendasi sistem.

---

### 🔄 Re-generate Plan

Memungkinkan pengguna memperbarui atau menyusun ulang rencana latihan secara manual saat terjadi perubahan target, kondisi fisik, atau ketersediaan waktu.

---

### 🕘 Workout History

Menyimpan seluruh riwayat sesi latihan berdasarkan waktu pelaksanaan untuk referensi dan evaluasi progres.

---

### 📋 Workout Movement Library

Daftar lengkap gerakan latihan beserta deskripsi dan manfaatnya untuk mendukung latihan mandiri.

---

### 🎥 Movement Tutorials

Panduan gerakan dalam bentuk gambar atau video agar pengguna dapat melakukan latihan dengan teknik yang benar.

---

### 🛠️ Admin Dashboard

Panel kontrol khusus administrator yang mencakup:

* **FAQ Management**
  CRUD interface untuk mengelola daftar pertanyaan yang sering diajukan.

* **User Feedback Table**
  Tabel pemantauan kritik, saran, dan masukan pengguna.

---

## Frontend Architecture

Aplikasi menggunakan pendekatan **Clean Architecture** di sisi client untuk skalabilitas dan maintainability.

### Core Module

Singleton services seperti:

* Authentication Service
* JWT Interceptor
* Global Error Handling

### Shared Module

Reusable UI components:

* Button, Modal, Card
* Pipes & Directives

### Feature Modules

Modul berbasis fitur dengan **lazy loading**:

* User Dashboard
* Workout Planner
* Admin Panel


## Key Frontend Capabilities

* Dynamic multi-step form wizard
* Real-time validation
* Client-side data transformation
* Interactive charts & analytics
* Role-based route protection
* REST API integration
* Responsive UI design

---

## Technical Stack

* **Framework:** Angular 17+ (Standalone Components)
* **Language:** TypeScript
* **State Management:** RxJS
* **Styling:** Tailwind CSS
* **Charts:** Ng2-charts / Chart.js
* **HTTP Client:** Angular HttpClient
* **Authentication:** JWT via Interceptor

---

## 📂 Project Structure

```bash
src/
├── app/
│   ├── pages/       # Singleton services & interceptors
│   ├── shared/      # Reusable UI components
│   ├── features/    # Feature modules (lazy-loaded)
│   └── app.routes.ts
├── environments/
└── assets/
```

---

## Installation & Setup

### Prerequisites

* Node.js v18.x+
* Angular CLI v17.x
* Backend API service running

### Clone Repository

```bash
git clone https://github.com/username/viktorifit-frontend.git
cd viktorifit-frontend
```

### Install Dependencies

```bash
npm install
```

### Environment Configuration

Edit endpoint API di:

```
src/environments/environment.ts
```

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

---

## Run Development Server

```bash
ng serve
```

Aplikasi dapat diakses di:

```
http://localhost:4200
```

---

## API Integration

Frontend berkomunikasi dengan backend melalui RESTful API:

* `POST /auth/login` — Login & token retrieval
* `GET /workouts/recommendations` — Data rencana latihan
* `GET /admin/feedback` — Data feedback (Admin)

Backend berfungsi sebagai external data provider.

---

## Production Build

Untuk membuat build produksi:

```bash
ng build --configuration production
```

Output tersedia di:

```
dist/
```

Siap di-deploy ke platform seperti:

* Vercel
* Netlify
* Nginx / Static Web Server

---

## 🤝 Contribution

Kontribusi terbuka untuk perbaikan UI, optimasi performa, dan peningkatan pengalaman pengguna.

1. Fork repository
2. Buat branch fitur baru
3. Commit perubahan
4. Submit pull request

---

## 📄 License

Proyek ini dikembangkan untuk tujuan pembelajaran dan pengembangan aplikasi kebugaran modern.
