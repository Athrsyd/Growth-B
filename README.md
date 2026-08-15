# GrowthB — Design System & UI/UX Guidelines

> **GrowthB — Grow Smarter, Build Better.**

GrowthB adalah web-based Decision Support System (DSS) untuk membantu pelaku UMKM Indonesia mengambil keputusan bisnis berdasarkan data sederhana yang mereka catat setiap hari.

Dokumen ini menjadi pedoman utama untuk desain antarmuka GrowthB, mencakup visual identity, layout, typography, color system, component, responsive behavior, navigation, data visualization, interaction, serta prinsip desain setiap halaman.

---

# 1. Design Philosophy

## 1.1 Core Principle

GrowthB mengikuti prinsip:

> **Simple Input, Powerful Insight.**

Pengguna UMKM tidak seharusnya merasa sedang menggunakan software analitik yang rumit.

Mereka cukup memasukkan data bisnis yang sederhana, kemudian GrowthB mengubah data tersebut menjadi:

- informasi,
- statistik,
- evaluasi,
- insight,
- rekomendasi,
- dan rencana pengembangan bisnis.

UI harus selalu mengutamakan **pemahaman pengguna**, bukan banyaknya informasi yang dapat ditampilkan.

---

## 1.2 Product Personality

GrowthB harus terasa:

- Modern
- Premium
- Professional
- Trustworthy
- Friendly
- Intelligent
- Simple
- Motivating

GrowthB **tidak boleh** terasa seperti:

- software akuntansi lama,
- aplikasi kasir,
- admin panel generik,
- aplikasi enterprise yang kompleks,
- atau proyek sekolah sederhana.

---

## 1.3 Design Goal

Setiap halaman harus menjawab tiga pertanyaan:

1. **Apa yang sedang terjadi pada bisnis saya?**
2. **Apa yang perlu saya perhatikan?**
3. **Apa yang sebaiknya saya lakukan selanjutnya?**

---

# 2. Design References

GrowthB mengambil prinsip desain dari beberapa produk modern, tetapi **tidak meniru desain mereka secara langsung**.

### Primary references

- Apple Human Interface Guidelines
- Stripe Dashboard
- Linear
- Notion
- Google Analytics
- Vercel
- roadmap.sh

### Reference by purpose

| Product | Inspiration |
|---|---|
| Apple | Simplicity, spacing, typography, interaction |
| Stripe | Analytics, cards, business dashboard |
| Linear | Navigation, hierarchy, productivity UI |
| Notion | Information organization |
| Google Analytics | Data visualization |
| Vercel | Minimal SaaS aesthetic |
| roadmap.sh | Roadmap visualization |

---

# 3. Responsive Strategy

GrowthB menggunakan pendekatan:

> **Mobile First**

Prioritas desain:

1. Mobile
2. Laptop/Desktop
3. Tablet sebagai responsive adaptation

Mobile bukan versi desktop yang diperkecil.

Mobile harus memiliki layout dan interaction yang dirancang khusus untuk penggunaan layar sentuh.

---

# 4. Breakpoints

Gunakan breakpoint berikut:

| Device | Width |
|---|---:|
| Mobile Small | `< 375px` |
| Mobile | `375px – 767px` |
| Tablet | `768px – 1023px` |
| Laptop | `1024px – 1439px` |
| Desktop Large | `≥ 1440px` |

Prioritas utama implementasi:

```text
Mobile
↓
Laptop
```

---

# 5. Color System

GrowthB menggunakan hijau sebagai warna utama karena merepresentasikan:

- pertumbuhan,
- perkembangan,
- keberlanjutan,
- dan keberhasilan bisnis.

## 5.1 Primary

```text
Primary Green
#22C55E

Dark Green
#15803D
```

## 5.2 Background

```text
Background
#F8FAFC

Surface
#FFFFFF
```

## 5.3 Text

```text
Primary Text
#0F172A

Secondary Text
#64748B

Muted Text
#94A3B8
```

## 5.4 Border

```text
Border
#E5E7EB
```

## 5.5 Semantic Colors

```text
Success
#16A34A

Warning
#F59E0B

Danger
#EF4444

Info
#3B82F6
```

### Usage rule

Hijau tidak boleh digunakan pada semua elemen.

Gunakan hijau untuk:

- primary CTA,
- positive growth,
- completed state,
- success,
- active state,
- progress,
- important business highlights.

---

# 6. Typography

Gunakan:

> **Inter**

Typography harus memiliki hierarchy yang jelas.

## Heading

```text
H1
32–40px
Weight 700

H2
24–32px
Weight 700

H3
20–24px
Weight 600
```

## Body

```text
Body Large
16px

Body
14–16px

Caption
12–13px
```

Gunakan line-height yang nyaman.

Jangan menggunakan terlalu banyak variasi font weight.

---

# 7. Spacing System

Gunakan sistem spacing berbasis kelipatan 4 atau 8.

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
80px
```

Prioritaskan whitespace.

Jangan memenuhi halaman dengan komponen hanya karena terdapat ruang kosong.

Whitespace merupakan bagian dari desain.

---

# 8. Border Radius

GrowthB menggunakan rounded UI.

```text
Small
8px

Medium
12px

Card
16–20px

Large Feature Card
20–24px

Pill
9999px
```

Card utama umumnya menggunakan:

```text
20px
```

---

# 9. Shadows

Gunakan shadow yang sangat halus.

UI GrowthB tidak menggunakan heavy shadow.

Contoh prinsip:

```text
Default Card
Subtle shadow

Hover
Slightly stronger shadow

Modal
Medium shadow
```

Shadow digunakan untuk hierarchy, bukan dekorasi.

---

# 10. Icons

Gunakan icon style yang konsisten.

Recommended:

> Lucide Icons

Icon harus:

- sederhana,
- outline-based,
- mudah dikenali,
- tidak terlalu dekoratif.

Jangan mencampurkan berbagai gaya icon dalam satu halaman.

---

# 11. Buttons

## Primary Button

Digunakan untuk tindakan utama.

Contoh:

```text
Input Hari Ini
Buat Roadmap
Aktifkan Membership
Lihat Evaluasi
```

Style:

- Green background
- White text
- Rounded
- Medium/bold weight

---

## Secondary Button

Untuk tindakan pendukung.

Contoh:

```text
Edit
Filter
View Details
```

---

## Outline Button

Digunakan ketika primary action sudah tersedia.

---

## Danger Button

Untuk:

- delete,
- deactivate,
- logout all devices,
- destructive action.

Gunakan merah secara terbatas.

---

# 12. Cards

Card merupakan komponen utama GrowthB.

Card digunakan untuk mengelompokkan informasi.

Jenis card:

### KPI Card

Menampilkan satu metrik utama.

```text
Revenue
Rp 4.250.000
↑ 12.4%
```

### Analytics Card

Berisi chart atau data visual.

### AI Card

Menampilkan insight dan recommendation.

### Action Card

Mengajak user melakukan tindakan.

### Progress Card

Menampilkan target dan progress.

### Feature Card

Menjelaskan fitur.

---

# 13. Navigation

## Desktop

Gunakan left sidebar.

Struktur:

```text
GrowthB

Dashboard
Daily Input
Evaluation
What If
Membership
Customers
Roadmap

────────────

Profile
Settings
Logout
```

Active page menggunakan primary green sebagai visual indicator.

---

## Mobile

Gunakan bottom navigation.

Prioritas:

```text
Dashboard
Input
Roadmap
Membership
Profile
```

Daily Input dapat memiliki Floating Action Button jika diperlukan.

---

# 14. Dashboard Design

Dashboard adalah:

> **Business Command Center**

Dashboard bukan sekadar kumpulan chart.

Prioritas informasi:

```text
AI Insight
↓
Business Health
↓
KPI
↓
Analytics
↓
Roadmap
↓
Customer
↓
Recent Activity
```

## Main components

### Greeting

Menampilkan:

- nama pengguna,
- nama bisnis,
- tanggal.

### AI Business Insight

Menampilkan:

- kondisi bisnis,
- insight utama,
- masalah,
- rekomendasi,
- confidence.

### Business Health Score

Score:

```text
0–100
```

### KPI

Minimal menampilkan data yang tersedia dari sistem, seperti:

- Revenue
- Expense
- Profit
- Customers
- Products/Services Sold
- Growth

### Analytics

Contoh:

- Revenue Trend
- Expense Trend
- Profit Trend
- Customer Trend
- Product Performance

### Roadmap Progress

Menampilkan:

- current goal,
- current milestone,
- progress,
- deadline.

---

# 15. Daily Input Design

Daily Input harus menjadi salah satu halaman paling sederhana.

Target:

> **Selesai dalam beberapa menit.**

Jangan membuat form terasa seperti laporan keuangan.

## Input utama

- Pendapatan
- Pengeluaran
- Pelanggan
- Produk terjual / layanan selesai

## Optional

- Aktivitas
- Kendala
- Catatan

Gunakan wizard atau step-based form jika diperlukan.

---

# 16. AI Business Analysis Design

AI Analysis adalah salah satu fitur utama GrowthB.

AI tidak boleh hanya menghasilkan paragraf panjang.

Hasil harus memiliki struktur.

```text
Business Summary

Key Insights

Strengths

Weaknesses

Root Cause

Recommendations

Priority Actions

Opportunities

Risks

Goal Progress

Next Steps
```

AI harus terasa seperti business analyst.

---

## AI Insight Card

Format ideal:

```text
What happened?

Why did it happen?

What should I do?

What could happen next?
```

Gunakan data visual untuk mendukung insight.

Jangan menampilkan AI sebagai chatbot biasa.

---

# 17. Evaluation Design

Evaluasi dilakukan berdasarkan periode bisnis.

UI harus memungkinkan user memahami perubahan antarperiode.

Tampilkan:

- current performance,
- previous performance,
- growth,
- strengths,
- weaknesses,
- recommendation,
- priority action.

Gunakan comparison chart.

---

# 18. What If Design

What If merupakan fitur simulasi bisnis.

Tujuan:

> Membantu user memahami kemungkinan dampak dari sebuah perubahan bisnis.

Contoh:

```text
Harga produk naik 5%
```

Kemudian tampilkan:

```text
Current Condition

↓

Simulation

↓

Potential Impact

↓

AI Explanation

↓

Risk

↓

Opportunity
```

Gunakan visual before/after.

---

# 19. Membership Design

Membership bukan sekadar QR generator.

Membership adalah:

> **Customer Loyalty Center**

Informasi utama:

- Total Members
- Repeat Customers
- Voucher Redeemed
- Average Visits
- Member Growth

QR Code harus tetap menjadi komponen penting, tetapi tidak mengambil seluruh halaman.

---

## Customer Loyalty

Customer dapat memiliki progress:

```text
4 / 5 Visits

████████░░

Next Reward
```

Hal ini membuat membership terasa lebih hidup daripada sekadar tabel nomor telepon.

---

# 20. Customer Page

Customer page digunakan untuk melihat data member.

Data dapat mencakup:

- phone number,
- visit count,
- member since,
- last visit,
- voucher history,
- reward progress.

Gunakan:

- search,
- filter,
- customer cards pada mobile,
- table pada laptop.

---

# 21. Voucher Design

Voucher menggunakan card-based UI.

Informasi:

- Voucher name
- Reward
- Required visits
- Expiration
- Status
- Usage

Status:

```text
Active
Expired
Available
Redeemed
```

---

# 22. Roadmap Design

Roadmap bukan todo list biasa.

Roadmap merupakan:

> **Business Growth Journey**

Inspirasi visual:

> roadmap.sh

Struktur:

```text
Business Goal
↓
Milestone
↓
Tasks
↓
Progress
```

## Desktop

Gunakan horizontal timeline apabila memungkinkan.

## Mobile

Gunakan vertical timeline.

Completed milestone:

```text
Green
```

Current milestone:

```text
Highlighted
```

Upcoming:

```text
Neutral / Gray
```

Progress harus terasa rewarding.

---

# 23. Profile Design

Profile bukan sekadar account page.

Profile merupakan:

> **Business Identity Center**

Tampilkan:

- profile information,
- business information,
- business summary,
- membership status,
- roadmap progress,
- account security,
- preferences.

---

# 24. Empty States

Empty state harus memberikan arah.

Jangan hanya:

```text
No data.
```

Gunakan:

```text
Title

Explanation

Action
```

Contoh:

```text
Let's grow your business!

Record today's business activity
to unlock your first AI insight.

[Input Today's Data]
```

---

# 25. Loading States

Jangan menampilkan halaman kosong saat loading.

Gunakan:

- skeleton cards,
- skeleton charts,
- button loading,
- progress indicator.

AI analysis dapat menggunakan:

```text
Analyzing your business...
```

---

# 26. Error States

Error harus informatif dan tidak membuat panik.

Contoh:

```text
Something went wrong.

We couldn't load your business data.

[Try Again]
```

Hindari technical error message kepada pengguna umum.

---

# 27. Data Visualization

Chart harus memiliki tujuan.

Jangan menambahkan chart hanya agar dashboard terlihat kompleks.

Gunakan:

### Line Chart

Untuk:

- revenue trend,
- customer trend,
- expense trend.

### Bar Chart

Untuk:

- product performance,
- comparison.

### Area Chart

Untuk:

- financial growth.

### Progress Ring

Untuk:

- business score,
- roadmap progress.

### Heatmap

Untuk:

- activity pattern,
- peak business time.

### Comparison

Untuk:

- current vs previous evaluation.

---

# 28. Mobile UX Rules

Mobile adalah prioritas utama.

Gunakan:

- large touch targets,
- stacked cards,
- horizontal scrolling hanya jika diperlukan,
- bottom navigation,
- sticky important action,
- simplified charts.

Jangan memaksakan desktop layout ke mobile.

---

# 29. Laptop UX Rules

Laptop menggunakan:

- sidebar,
- multi-column cards,
- wider analytics,
- larger charts,
- timeline visualization,
- denser information hierarchy.

Laptop tetap harus memiliki whitespace yang cukup.

---

# 30. Forms

Form harus:

- sederhana,
- memiliki label jelas,
- memiliki validation,
- memiliki helper text jika diperlukan,
- menggunakan input yang sesuai tipe data.

Untuk nominal uang:

```text
Rp
```

Untuk nomor telepon:

```text
+62 / 08...
```

Untuk waktu:

```text
Time picker
```

Untuk kategori:

```text
Select
```

---

# 31. UX Writing

Gunakan Bahasa Indonesia yang:

- sederhana,
- jelas,
- ramah,
- tidak terlalu formal.

Hindari jargon teknis.

Contoh:

Jangan:

```text
Execute business analytics computation.
```

Gunakan:

```text
Analisis bisnis Anda sedang diproses.
```

---

# 32. Animation

Animation harus subtle.

Gunakan:

- fade,
- slide,
- scale,
- progress animation,
- number count-up.

Jangan menggunakan animasi berlebihan.

Animation harus membantu memahami perubahan status.

---

# 33. Accessibility

Pastikan:

- contrast cukup,
- font mudah dibaca,
- touch target cukup besar,
- keyboard navigation tersedia,
- focus state jelas,
- icon tidak menjadi satu-satunya indikator.

---

# 34. Consistency Rules

Semua halaman harus menggunakan:

- typography yang sama,
- color system yang sama,
- radius yang sama,
- icon style yang sama,
- spacing system yang sama,
- button system yang sama,
- card system yang sama.

Jangan membuat setiap halaman memiliki gaya visual berbeda.

---

# 35. Responsive Component Rules

Setiap komponen harus memiliki responsive behavior.

Contoh:

### KPI Cards

Desktop:

```text
4–6 columns
```

Mobile:

```text
1–2 columns
```

### Sidebar

Desktop:

```text
Visible
```

Mobile:

```text
Hidden
```

### Bottom Navigation

Desktop:

```text
Hidden
```

Mobile:

```text
Visible
```

### Tables

Desktop:

```text
Full table
```

Mobile:

```text
Card / expandable row
```

---

# 36. Visual Hierarchy

Prioritas visual:

```text
Primary Action
↓
Important Insight
↓
Key Metric
↓
Supporting Data
↓
Secondary Information
```

Jangan membuat semua elemen memiliki visual weight yang sama.

---

# 37. Information Density

GrowthB harus:

> **Data-rich, but not visually overwhelming.**

Informasi kompleks harus dipecah menjadi:

- cards,
- sections,
- tabs,
- accordions,
- progressive disclosure.

Jangan menampilkan seluruh data sekaligus.

---

# 38. Design Principle

Seluruh desain GrowthB harus mengikuti prinsip:

### 01 — Clarity

User harus memahami informasi tanpa harus mempelajari aplikasi terlebih dahulu.

### 02 — Simplicity

Input sesedikit mungkin.

### 03 — Actionability

Insight harus menghasilkan tindakan.

### 04 — Motivation

Progress harus membuat user ingin kembali menggunakan aplikasi.

### 05 — Trust

Data dan AI harus terlihat dapat dipercaya.

### 06 — Consistency

Semua halaman harus terasa sebagai satu produk.

### 07 — Mobile First

Pengguna UMKM kemungkinan besar mengakses GrowthB melalui smartphone.

---

# 39. Final Design Direction

GrowthB harus terlihat seperti:

> **A premium AI-powered business companion for Indonesian entrepreneurs.**

Bukan:

> Accounting software.

Bukan:

> POS.

Bukan:

> Generic admin dashboard.

Bukan:

> Todo application.

Bukan:

> AI chatbot.

GrowthB harus menggabungkan:

```text
Simple Business Recording
        +
Business Analytics
        +
AI Business Analysis
        +
What If Simulation
        +
Customer Loyalty
        +
Business Roadmap
```

Semua fitur harus terasa sebagai bagian dari satu pengalaman produk.

---

# 40. Design Quality Checklist

Sebelum sebuah halaman dianggap selesai, pastikan:

- [ ] Mobile layout sudah diprioritaskan.
- [ ] Laptop layout tersedia.
- [ ] Visual hierarchy jelas.
- [ ] Primary action mudah ditemukan.
- [ ] Tidak terlalu banyak informasi dalam satu area.
- [ ] Card style konsisten.
- [ ] Typography konsisten.
- [ ] Color system konsisten.
- [ ] Empty state tersedia.
- [ ] Loading state tersedia.
- [ ] Error state tersedia.
- [ ] Touch target cukup besar.
- [ ] Chart memiliki tujuan.
- [ ] AI output mudah dibaca.
- [ ] User selalu tahu tindakan berikutnya.
- [ ] Tidak ada komponen dekoratif yang tidak memiliki fungsi.

---

# 41. Golden Rule

> **GrowthB should never make the user feel like they are doing more work than they already do in their business.**

Jika sebuah fitur membutuhkan banyak input tetapi memberikan sedikit insight, sederhanakan.

Jika sebuah dashboard memiliki banyak data tetapi tidak membantu mengambil keputusan, sederhanakan.

Jika sebuah AI memberikan banyak teks tetapi tidak menghasilkan tindakan, sederhanakan.

GrowthB harus selalu mengubah:

**Data → Understanding → Decision → Action → Growth.**
