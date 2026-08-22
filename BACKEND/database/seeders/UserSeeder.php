<?php

namespace Database\Seeders;

use App\Models\Bisnis;
use App\Models\DataHarian;
use App\Models\Member;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class UserSeeder extends Seeder
{
    // ── Helper: register user seperti AuthController::register ───────
    private function registerUser(array $data): User
    {
        return User::create([
            'full_name' => $data['name'],
            'email'     => $data['email'],
            'password'  => Hash::make($data['password']),
        ]);
    }

    // ── Helper: buat bisnis + generate member_token + QR ─────────────
    private function createBisnis(User $user, array $data): Bisnis
    {
        // Buat bisnis seperti BisnisController::store
        $bisnis = Bisnis::create([
            'user_id'          => $user->id,
            'bisnis_nama'      => $data['bisnis_nama'],
            'bisnis_tipe'      => $data['bisnis_tipe'],
            'bisnis_mulai'     => $data['bisnis_mulai'],
            'bisnis_buka'      => $data['bisnis_buka'],
            'bisnis_tutup'     => $data['bisnis_tutup'],
            'jumlah_pegawai'   => $data['jumlah_pegawai'],
            'target_market'    => $data['target_market'],
            'tujuan_bisnis'    => $data['tujuan_bisnis'],
            'reward_threshold' => $data['reward_threshold'],
        ]);

        // Generate member_token seperti BisnisController::store
        $memberToken = Str::random(32);
        $bisnis->member_token = $memberToken;
        $bisnis->save();

        // Generate QR seperti BisnisController::GenerateQR
        $this->generateQR($bisnis, $memberToken);

        return $bisnis->fresh();
    }

    // ── Helper: generate QR Code seperti BisnisController::GenerateQR ─
    private function generateQR(Bisnis $bisnis, string $token): void
    {
        $url = "http://localhost:5173/input-member/{$token}";

        $svg = QrCode::format('svg')
            ->size(300)
            ->generate($url);

        $filename = "qr/bisnis_{$bisnis->id}.svg";
        Storage::disk('public')->put($filename, $svg);

        $bisnis->update([
            'QR_image_url' => Storage::url($filename),
        ]);
    }

    // ── Helper: tambah produk seperti ProductController::store ────────
    private function createProduk(Bisnis $bisnis, array $produkList): array
    {
        $produkIds = [];

        foreach ($produkList as $p) {
            $produk = Product::create([
                'bisnis_id'         => $bisnis->id,
                'produk_nama'       => $p['produk_nama'],
                'produk_harga'      => $p['produk_harga'],
                'net_profit_margin' => $p['net_profit_margin'] ?? null,
                'produk_image_url'  => null,
            ]);

            $produkIds[] = $produk->id;
        }

        return $produkIds;
    }

    // ── Helper: insert data harian + penjualan harian ─────────────────
    private function createDataHarian(Bisnis $bisnis, array $dataList, array $produkIds): void
    {
        $baseDate = Carbon::now()->startOfDay()->subDays(count($dataList) - 1);

        foreach ($dataList as $index => [$pendapatan, $pengeluaran, $jumlah_pembeli, $produkIndex, $kendala]) {
            $tanggal          = $baseDate->copy()->addDays($index)->format('Y-m-d');
            $terlarisProdukId = $produkIds[$produkIndex];

            $harian = DataHarian::create([
                'bisnis_id'          => $bisnis->id,
                'tanggal'            => $tanggal,
                'pendapatan'         => $pendapatan,
                'pengeluaran'        => $pengeluaran,
                'jumlah_pembeli'     => $jumlah_pembeli,
                'produk_terlaris_id' => $terlarisProdukId,
                'kendala'            => $kendala,
            ]);

            // Penjualan harian: bagi merata, produk terlaris dapat 3x
            $qtyPerProduk = max(1, (int) ($jumlah_pembeli / count($produkIds)));
            foreach ($produkIds as $pid) {
                \Illuminate\Support\Facades\DB::table('penjualan_harian')->insert([
                    'data_harian_id' => $harian->id,
                    'produk_id'      => $pid,
                    'qty'            => $pid === $terlarisProdukId
                        ? $qtyPerProduk * 3
                        : $qtyPerProduk,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);
            }
        }
    }

    // ── Helper: insert members ─────────────────────────────────────────
    private function createMembers(Bisnis $bisnis, array $memberList): void
    {
        foreach ($memberList as $m) {
            Member::create([
                'bisnis_id'    => $bisnis->id,
                'member_phone' => $m['member_phone'],
                'member_count' => $m['member_count'],
                'created_at'   => Carbon::now()->subDays(rand(5, 60)),
                'updated_at'   => now(),
            ]);
        }
    }

    // ── Helper: insert roadmap ─────────────────────────────────────────
    private function createRoadmap(Bisnis $bisnis, array $roadmapList): void
    {
        foreach ($roadmapList as $r) {
            \Illuminate\Support\Facades\DB::table('roadmap')->insert([
                'bisnis_id'      => $bisnis->id,
                'judul'          => $r['judul'],
                'deskripsi'      => null,
                'target_metrik'  => $r['target_metrik'] ?? null,
                'target_nilai'   => $r['target_nilai'] ?? null,
                'target_tanggal' => $r['target_tanggal'],
                'status'         => $r['status'],
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // run()
    // ─────────────────────────────────────────────────────────────────
    public function run(): void
    {
        $users = [

            // ── 1. Warung Makan ──────────────────────────────────────────
            [
                'user' => [
                    'name'     => 'Sari Dewi',
                    'email'    => 'sari@example.com',
                    'password' => 'password',
                ],
                'bisnis' => [
                    'bisnis_nama'      => 'Warung Makan Bu Sari',
                    'bisnis_tipe'      => 'jasa',
                    'bisnis_mulai'     => '2022-03-15',
                    'bisnis_buka'      => '07:00',
                    'bisnis_tutup'     => '21:00',
                    'jumlah_pegawai'   => 4,
                    'target_market'    => 'Pelajar dan karyawan sekitar kawasan industri',
                    'tujuan_bisnis'    => ['menaikkan omset', 'menambah pelanggan tetap'],
                    'reward_threshold' => 8,
                ],
                'produk' => [
                    ['produk_nama' => 'Nasi Ayam Goreng', 'produk_harga' => 15000, 'net_profit_margin' => 40],
                    ['produk_nama' => 'Es Teh Manis',      'produk_harga' => 5000,  'net_profit_margin' => 70],
                    ['produk_nama' => 'Nasi Capcay',       'produk_harga' => 18000, 'net_profit_margin' => 35],
                    ['produk_nama' => 'Jus Alpukat',       'produk_harga' => 12000, 'net_profit_margin' => 50],
                ],
                'data_harian' => [
                    [1350000, 520000, 87, 0, 'Kompor sempat mati 1 jam'],
                    [980000,  430000, 63, 1, null],
                    [1120000, 470000, 74, 2, null],
                    [890000,  390000, 58, 1, 'Bahan baku terlambat'],
                    [1450000, 560000, 95, 0, null],
                    [760000,  340000, 49, 2, null],
                    [1100000, 450000, 71, 0, null],
                    [1250000, 500000, 80, 0, null],
                    [930000,  410000, 61, 1, null],
                    [1380000, 540000, 88, 0, null],
                    [870000,  370000, 55, 2, 'Hujan lebat pelanggan sepi'],
                    [1200000, 490000, 77, 0, null],
                    [1050000, 440000, 68, 1, null],
                    [1420000, 550000, 91, 0, null],
                ],
                'members' => [
                    ['member_phone' => '08121234001', 'member_count' => 12],
                    ['member_phone' => '08121234002', 'member_count' => 5],
                    ['member_phone' => '08121234003', 'member_count' => 9],
                    ['member_phone' => '08121234004', 'member_count' => 3],
                    ['member_phone' => '08121234005', 'member_count' => 15],
                ],
                'roadmap' => [
                    ['judul' => 'Capai omset Rp 50 juta/bulan', 'target_metrik' => 'omset',           'target_nilai' => 50000000, 'target_tanggal' => '2025-12-31', 'status' => 'aktif'],
                    ['judul' => 'Tambah 50 member baru',         'target_metrik' => 'jumlah_pembeli', 'target_nilai' => 50,       'target_tanggal' => '2025-09-30', 'status' => 'tercapai'],
                ],
            ],

            // ── 2. Toko Pakaian ──────────────────────────────────────────
            [
                'user' => [
                    'name'     => 'Budi Santoso',
                    'email'    => 'budi@example.com',
                    'password' => 'password',
                ],
                'bisnis' => [
                    'bisnis_nama'      => 'Butik Mode Budi',
                    'bisnis_tipe'      => 'barang',
                    'bisnis_mulai'     => '2021-06-01',
                    'bisnis_buka'      => '09:00',
                    'bisnis_tutup'     => '20:00',
                    'jumlah_pegawai'   => 3,
                    'target_market'    => 'Wanita usia 20-40 tahun kalangan menengah',
                    'tujuan_bisnis'    => ['menaikkan omset', 'mengurangi biaya operasional'],
                    'reward_threshold' => 5,
                ],
                'produk' => [
                    ['produk_nama' => 'Dress Casual',     'produk_harga' => 185000, 'net_profit_margin' => 45],
                    ['produk_nama' => 'Blouse Batik',     'produk_harga' => 120000, 'net_profit_margin' => 50],
                    ['produk_nama' => 'Celana Kulot',     'produk_harga' => 145000, 'net_profit_margin' => 42],
                    ['produk_nama' => 'Kerudung Premium', 'produk_harga' => 75000,  'net_profit_margin' => 60],
                ],
                'data_harian' => [
                    [2100000, 900000,  14, 0, null],
                    [1750000, 780000,  11, 1, null],
                    [3200000, 1100000, 22, 0, 'Ada event fashion lokal'],
                    [1400000, 650000,  9,  2, null],
                    [2600000, 980000,  18, 0, null],
                    [1900000, 820000,  13, 1, null],
                    [2300000, 870000,  16, 0, null],
                    [1600000, 700000,  10, 2, null],
                    [2800000, 1050000, 19, 0, null],
                    [1500000, 680000,  10, 1, 'Stok baju kurang'],
                    [2200000, 840000,  15, 0, null],
                    [1850000, 790000,  12, 2, null],
                    [2450000, 920000,  17, 0, null],
                    [3100000, 1080000, 21, 0, 'Weekend ramai'],
                ],
                'members' => [
                    ['member_phone' => '08221234001', 'member_count' => 7],
                    ['member_phone' => '08221234002', 'member_count' => 2],
                    ['member_phone' => '08221234003', 'member_count' => 6],
                ],
                'roadmap' => [
                    ['judul' => 'Buka cabang kedua', 'target_metrik' => 'omset', 'target_nilai' => 100000000, 'target_tanggal' => '2026-06-01', 'status' => 'aktif'],
                ],
            ],

            // ── 3. Kopi & Minuman ─────────────────────────────────────────
            [
                'user' => [
                    'name'     => 'Rina Kusuma',
                    'email'    => 'rina@example.com',
                    'password' => 'password',
                ],
                'bisnis' => [
                    'bisnis_nama'      => 'Kopi Nusantara Rina',
                    'bisnis_tipe'      => 'barang',
                    'bisnis_mulai'     => '2023-01-10',
                    'bisnis_buka'      => '06:00',
                    'bisnis_tutup'     => '22:00',
                    'jumlah_pegawai'   => 2,
                    'target_market'    => 'Mahasiswa dan pekerja remote usia 18-35 tahun',
                    'tujuan_bisnis'    => ['menambah pelanggan tetap', 'Meningkatkan keuntungan'],
                    'reward_threshold' => 10,
                ],
                'produk' => [
                    ['produk_nama' => 'Kopi Susu Gula Aren', 'produk_harga' => 22000, 'net_profit_margin' => 55],
                    ['produk_nama' => 'Americano',            'produk_harga' => 18000, 'net_profit_margin' => 65],
                    ['produk_nama' => 'Matcha Latte',         'produk_harga' => 25000, 'net_profit_margin' => 50],
                    ['produk_nama' => 'Croissant',            'produk_harga' => 15000, 'net_profit_margin' => 40],
                    ['produk_nama' => 'Sandwich Tuna',        'produk_harga' => 28000, 'net_profit_margin' => 38],
                ],
                'data_harian' => [
                    [1800000, 600000, 82,  0, null],
                    [2100000, 720000, 95,  0, 'Hari Senin ramai'],
                    [1650000, 550000, 75,  1, null],
                    [1900000, 640000, 86,  0, null],
                    [2300000, 780000, 105, 0, null],
                    [1400000, 490000, 64,  2, 'Mesin kopi mati 2 jam'],
                    [2050000, 700000, 93,  0, null],
                    [2400000, 810000, 109, 0, 'Promo weekend'],
                    [1750000, 590000, 80,  1, null],
                    [1950000, 660000, 89,  0, null],
                    [2200000, 750000, 100, 0, null],
                    [1600000, 540000, 73,  2, null],
                    [2000000, 680000, 91,  0, null],
                    [2350000, 790000, 107, 0, null],
                ],
                'members' => [
                    ['member_phone' => '08331234001', 'member_count' => 14],
                    ['member_phone' => '08331234002', 'member_count' => 11],
                    ['member_phone' => '08331234003', 'member_count' => 8],
                    ['member_phone' => '08331234004', 'member_count' => 3],
                    ['member_phone' => '08331234005', 'member_count' => 6],
                    ['member_phone' => '08331234006', 'member_count' => 10],
                    ['member_phone' => '08331234007', 'member_count' => 2],
                ],
                'roadmap' => [
                    ['judul' => 'Raih 500 pelanggan aktif',  'target_metrik' => 'jumlah_pembeli', 'target_nilai' => 500,  'target_tanggal' => '2025-10-31', 'status' => 'aktif'],
                    ['judul' => 'Kurangi biaya bahan 20%',   'target_metrik' => 'pengeluaran',    'target_nilai' => null, 'target_tanggal' => '2025-08-31', 'status' => 'aktif'],
                    ['judul' => 'Tambah 1 barista baru',     'target_metrik' => null,             'target_nilai' => null, 'target_tanggal' => '2025-09-01', 'status' => 'tercapai'],
                ],
            ],

            // ── 4. Laundry ────────────────────────────────────────────────
            [
                'user' => [
                    'name'     => 'Agus Priyanto',
                    'email'    => 'agus@example.com',
                    'password' => 'password',
                ],
                'bisnis' => [
                    'bisnis_nama'      => 'Laundry Bersih Agus',
                    'bisnis_tipe'      => 'jasa',
                    'bisnis_mulai'     => '2020-08-20',
                    'bisnis_buka'      => '08:00',
                    'bisnis_tutup'     => '18:00',
                    'jumlah_pegawai'   => 5,
                    'target_market'    => 'Mahasiswa kos dan keluarga muda sekitar perumahan',
                    'tujuan_bisnis'    => ['mengurangi biaya operasional', 'Meningkatkan keuntungan'],
                    'reward_threshold' => 6,
                ],
                'produk' => [
                    ['produk_nama' => 'Cuci Kiloan Reguler', 'produk_harga' => 7000,  'net_profit_margin' => 45],
                    ['produk_nama' => 'Cuci Express',         'produk_harga' => 12000, 'net_profit_margin' => 50],
                    ['produk_nama' => 'Setrika Saja',         'produk_harga' => 5000,  'net_profit_margin' => 60],
                    ['produk_nama' => 'Dry Cleaning',         'produk_harga' => 25000, 'net_profit_margin' => 55],
                ],
                'data_harian' => [
                    [850000,  320000, 38, 0, null],
                    [920000,  350000, 42, 0, null],
                    [780000,  300000, 35, 1, null],
                    [1050000, 400000, 48, 0, null],
                    [690000,  270000, 31, 2, 'Mesin cuci 1 rusak'],
                    [1100000, 420000, 50, 0, null],
                    [950000,  360000, 43, 0, null],
                    [870000,  330000, 39, 1, null],
                    [1020000, 390000, 46, 0, null],
                    [750000,  290000, 34, 2, null],
                    [980000,  370000, 44, 0, null],
                    [830000,  315000, 37, 0, null],
                    [1080000, 410000, 49, 1, null],
                    [900000,  345000, 40, 0, null],
                ],
                'members' => [
                    ['member_phone' => '08441234001', 'member_count' => 8],
                    ['member_phone' => '08441234002', 'member_count' => 4],
                    ['member_phone' => '08441234003', 'member_count' => 7],
                    ['member_phone' => '08441234004', 'member_count' => 2],
                ],
                'roadmap' => [
                    ['judul' => 'Beli 2 mesin cuci baru', 'target_metrik' => null,    'target_nilai' => null,     'target_tanggal' => '2025-11-01', 'status' => 'aktif'],
                    ['judul' => 'Omset Rp 35 juta/bulan', 'target_metrik' => 'omset', 'target_nilai' => 35000000, 'target_tanggal' => '2026-01-01', 'status' => 'aktif'],
                ],
            ],

            // ── 5. Toko Sembako ───────────────────────────────────────────
            [
                'user' => [
                    'name'     => 'Dewi Rahayu',
                    'email'    => 'dewi@example.com',
                    'password' => 'password',
                ],
                'bisnis' => [
                    'bisnis_nama'      => 'Toko Sembako Makmur',
                    'bisnis_tipe'      => 'barang',
                    'bisnis_mulai'     => '2019-04-01',
                    'bisnis_buka'      => '06:00',
                    'bisnis_tutup'     => '21:00',
                    'jumlah_pegawai'   => 2,
                    'target_market'    => 'Warga perumahan dan ibu rumah tangga sekitar toko',
                    'tujuan_bisnis'    => ['menaikkan omset', 'menambah pelanggan tetap'],
                    'reward_threshold' => 12,
                ],
                'produk' => [
                    ['produk_nama' => 'Beras 5 kg',       'produk_harga' => 75000, 'net_profit_margin' => 12],
                    ['produk_nama' => 'Minyak Goreng 2L',  'produk_harga' => 38000, 'net_profit_margin' => 10],
                    ['produk_nama' => 'Gula Pasir 1 kg',  'produk_harga' => 16000, 'net_profit_margin' => 15],
                    ['produk_nama' => 'Telur 1 kg',       'produk_harga' => 28000, 'net_profit_margin' => 8],
                    ['produk_nama' => 'Mie Instan',       'produk_harga' => 3500,  'net_profit_margin' => 20],
                ],
                'data_harian' => [
                    [3200000, 2700000, 120, 0, null],
                    [2900000, 2450000, 108, 0, null],
                    [3500000, 2950000, 132, 1, 'Restock beras'],
                    [2700000, 2280000, 100, 2, null],
                    [3100000, 2620000, 116, 0, null],
                    [3800000, 3200000, 143, 0, 'Akhir bulan ramai'],
                    [2600000, 2200000, 97,  1, null],
                    [3000000, 2530000, 112, 0, null],
                    [2800000, 2360000, 105, 2, null],
                    [3300000, 2790000, 124, 0, null],
                    [2950000, 2490000, 110, 0, null],
                    [3150000, 2660000, 118, 1, null],
                    [2750000, 2320000, 103, 2, 'Supplier terlambat'],
                    [3400000, 2870000, 128, 0, null],
                ],
                'members' => [
                    ['member_phone' => '08551234001', 'member_count' => 18],
                    ['member_phone' => '08551234002', 'member_count' => 14],
                    ['member_phone' => '08551234003', 'member_count' => 9],
                    ['member_phone' => '08551234004', 'member_count' => 5],
                    ['member_phone' => '08551234005', 'member_count' => 13],
                    ['member_phone' => '08551234006', 'member_count' => 7],
                ],
                'roadmap' => [
                    ['judul' => 'Pasang CCTV & kasir digital', 'target_metrik' => null,    'target_nilai' => null,      'target_tanggal' => '2025-10-01', 'status' => 'dibatalkan'],
                    ['judul' => 'Omset Rp 100 juta/bulan',     'target_metrik' => 'omset', 'target_nilai' => 100000000, 'target_tanggal' => '2026-06-01', 'status' => 'aktif'],
                ],
            ],

            // ── 6. Barbershop ─────────────────────────────────────────────
            [
                'user' => [
                    'name'     => 'Fajar Wicaksono',
                    'email'    => 'fajar@example.com',
                    'password' => 'password',
                ],
                'bisnis' => [
                    'bisnis_nama'      => 'Fade & Fresh Barbershop',
                    'bisnis_tipe'      => 'jasa',
                    'bisnis_mulai'     => '2022-11-05',
                    'bisnis_buka'      => '09:00',
                    'bisnis_tutup'     => '21:00',
                    'jumlah_pegawai'   => 3,
                    'target_market'    => 'Pria usia 15-45 tahun, pelajar dan pekerja kantoran',
                    'tujuan_bisnis'    => ['menambah pelanggan tetap', 'Meningkatkan keuntungan'],
                    'reward_threshold' => 7,
                ],
                'produk' => [
                    ['produk_nama' => 'Cukur Rambut',    'produk_harga' => 35000,  'net_profit_margin' => 70],
                    ['produk_nama' => 'Cukur + Keramas', 'produk_harga' => 55000,  'net_profit_margin' => 65],
                    ['produk_nama' => 'Warna Rambut',    'produk_harga' => 120000, 'net_profit_margin' => 55],
                    ['produk_nama' => 'Cukur Jenggot',   'produk_harga' => 25000,  'net_profit_margin' => 75],
                ],
                'data_harian' => [
                    [1050000, 280000, 30, 0, null],
                    [875000,  235000, 25, 1, null],
                    [1225000, 330000, 35, 0, null],
                    [700000,  190000, 20, 2, 'Listrik mati seharian'],
                    [1400000, 375000, 40, 0, 'Promo cuci rambut gratis'],
                    [1050000, 280000, 30, 1, null],
                    [1575000, 420000, 45, 0, 'Weekend rame'],
                    [875000,  235000, 25, 0, null],
                    [1225000, 330000, 35, 2, null],
                    [980000,  262000, 28, 0, null],
                    [1400000, 375000, 40, 0, null],
                    [770000,  207000, 22, 1, null],
                    [1120000, 300000, 32, 0, null],
                    [1575000, 420000, 45, 0, null],
                ],
                'members' => [
                    ['member_phone' => '08661234001', 'member_count' => 9],
                    ['member_phone' => '08661234002', 'member_count' => 7],
                    ['member_phone' => '08661234003', 'member_count' => 4],
                    ['member_phone' => '08661234004', 'member_count' => 8],
                    ['member_phone' => '08661234005', 'member_count' => 1],
                ],
                'roadmap' => [
                    ['judul' => 'Beli kursi barber ke-4',        'target_metrik' => null,             'target_nilai' => null, 'target_tanggal' => '2025-09-01', 'status' => 'tercapai'],
                    ['judul' => '50 member loyal dalam 3 bulan', 'target_metrik' => 'jumlah_pembeli', 'target_nilai' => 50,   'target_tanggal' => '2025-11-30', 'status' => 'aktif'],
                ],
            ],

            // ── 7. Toko Elektronik ────────────────────────────────────────
            [
                'user' => [
                    'name'     => 'Hendra Gunawan',
                    'email'    => 'hendra@example.com',
                    'password' => 'password',
                ],
                'bisnis' => [
                    'bisnis_nama'      => 'Elektronik Jaya Hendra',
                    'bisnis_tipe'      => 'barang',
                    'bisnis_mulai'     => '2018-07-17',
                    'bisnis_buka'      => '09:00',
                    'bisnis_tutup'     => '18:00',
                    'jumlah_pegawai'   => 6,
                    'target_market'    => 'Rumah tangga dan UKM sekitar kota yang butuh elektronik',
                    'tujuan_bisnis'    => ['menaikkan omset', 'mengurangi biaya operasional'],
                    'reward_threshold' => 4,
                ],
                'produk' => [
                    ['produk_nama' => 'Rice Cooker',  'produk_harga' => 350000, 'net_profit_margin' => 18],
                    ['produk_nama' => 'Kipas Angin',  'produk_harga' => 280000, 'net_profit_margin' => 20],
                    ['produk_nama' => 'Setrika',      'produk_harga' => 195000, 'net_profit_margin' => 22],
                    ['produk_nama' => 'Blender',      'produk_harga' => 320000, 'net_profit_margin' => 19],
                    ['produk_nama' => 'Aksesoris HP', 'produk_harga' => 45000,  'net_profit_margin' => 40],
                ],
                'data_harian' => [
                    [5200000, 3900000, 18, 0, null],
                    [3800000, 2850000, 13, 1, null],
                    [6500000, 4875000, 22, 0, 'Dapat order partai besar'],
                    [2900000, 2175000, 10, 2, null],
                    [4700000, 3525000, 16, 0, null],
                    [5500000, 4125000, 19, 0, null],
                    [3200000, 2400000, 11, 1, null],
                    [4100000, 3075000, 14, 0, null],
                    [2600000, 1950000, 9,  2, 'Stok kipas angin habis'],
                    [5800000, 4350000, 20, 0, null],
                    [4400000, 3300000, 15, 0, null],
                    [3600000, 2700000, 12, 1, null],
                    [5100000, 3825000, 17, 0, null],
                    [6200000, 4650000, 21, 0, 'Akhir bulan banyak beli'],
                ],
                'members' => [
                    ['member_phone' => '08771234001', 'member_count' => 5],
                    ['member_phone' => '08771234002', 'member_count' => 4],
                    ['member_phone' => '08771234003', 'member_count' => 2],
                ],
                'roadmap' => [
                    ['judul' => 'Omset Rp 200 juta/bulan',       'target_metrik' => 'omset', 'target_nilai' => 200000000, 'target_tanggal' => '2026-12-31', 'status' => 'aktif'],
                    ['judul' => 'Mulai jual online di Tokopedia', 'target_metrik' => null,    'target_nilai' => null,      'target_tanggal' => '2025-10-01', 'status' => 'aktif'],
                ],
            ],

            // ── 8. Salon Kecantikan ───────────────────────────────────────
            [
                'user' => [
                    'name'     => 'Indah Permata',
                    'email'    => 'indah@example.com',
                    'password' => 'password',
                ],
                'bisnis' => [
                    'bisnis_nama'      => 'Salon Cantik Indah',
                    'bisnis_tipe'      => 'jasa',
                    'bisnis_mulai'     => '2023-03-08',
                    'bisnis_buka'      => '09:00',
                    'bisnis_tutup'     => '19:00',
                    'jumlah_pegawai'   => 4,
                    'target_market'    => 'Wanita usia 18-50 tahun di sekitar pusat perbelanjaan',
                    'tujuan_bisnis'    => ['menambah pelanggan tetap', 'menaikkan omset'],
                    'reward_threshold' => 5,
                ],
                'produk' => [
                    ['produk_nama' => 'Creambath',       'produk_harga' => 75000,  'net_profit_margin' => 60],
                    ['produk_nama' => 'Cat Rambut',      'produk_harga' => 250000, 'net_profit_margin' => 50],
                    ['produk_nama' => 'Manikur Pedikur', 'produk_harga' => 85000,  'net_profit_margin' => 65],
                    ['produk_nama' => 'Facial Wajah',    'produk_harga' => 120000, 'net_profit_margin' => 55],
                    ['produk_nama' => 'Blow Dry',        'produk_harga' => 45000,  'net_profit_margin' => 70],
                ],
                'data_harian' => [
                    [1350000, 450000, 18, 0, null],
                    [1650000, 550000, 22, 0, null],
                    [900000,  300000, 12, 1, null],
                    [1800000, 600000, 24, 0, 'Hari Sabtu rame'],
                    [1200000, 400000, 16, 0, null],
                    [1500000, 500000, 20, 2, null],
                    [750000,  250000, 10, 1, 'Hujan seharian'],
                    [1950000, 650000, 26, 0, 'Promo facial'],
                    [1350000, 450000, 18, 0, null],
                    [1050000, 350000, 14, 2, null],
                    [1650000, 550000, 22, 0, null],
                    [1200000, 400000, 16, 1, null],
                    [1800000, 600000, 24, 0, null],
                    [2100000, 700000, 28, 0, 'Weekend penuh booking'],
                ],
                'members' => [
                    ['member_phone' => '08881234001', 'member_count' => 6],
                    ['member_phone' => '08881234002', 'member_count' => 5],
                    ['member_phone' => '08881234003', 'member_count' => 3],
                    ['member_phone' => '08881234004', 'member_count' => 8],
                    ['member_phone' => '08881234005', 'member_count' => 1],
                    ['member_phone' => '08881234006', 'member_count' => 4],
                ],
                'roadmap' => [
                    ['judul' => 'Tambah layanan eyelash', 'target_metrik' => null,             'target_nilai' => null, 'target_tanggal' => '2025-09-01', 'status' => 'tercapai'],
                    ['judul' => '100 member aktif',       'target_metrik' => 'jumlah_pembeli', 'target_nilai' => 100,  'target_tanggal' => '2026-03-08', 'status' => 'aktif'],
                ],
            ],

            // ── 9. Jasa Percetakan ────────────────────────────────────────
            [
                'user' => [
                    'name'     => 'Joko Widodo',
                    'email'    => 'joko@example.com',
                    'password' => 'password',
                ],
                'bisnis' => [
                    'bisnis_nama'      => 'Cetak Cepat Joko',
                    'bisnis_tipe'      => 'jasa',
                    'bisnis_mulai'     => '2017-02-14',
                    'bisnis_buka'      => '08:00',
                    'bisnis_tutup'     => '17:00',
                    'jumlah_pegawai'   => 7,
                    'target_market'    => 'Perusahaan, kampus, dan UMKM yang butuh cetak massal',
                    'tujuan_bisnis'    => ['menaikkan omset', 'mengurangi biaya operasional', 'Meningkatkan keuntungan'],
                    'reward_threshold' => 3,
                ],
                'produk' => [
                    ['produk_nama' => 'Cetak Brosur A5',    'produk_harga' => 500,   'net_profit_margin' => 35],
                    ['produk_nama' => 'Banner 3x1m',         'produk_harga' => 85000, 'net_profit_margin' => 40],
                    ['produk_nama' => 'Undangan Pernikahan', 'produk_harga' => 3500,  'net_profit_margin' => 45],
                    ['produk_nama' => 'Nota 2 Rangkap',     'produk_harga' => 45000, 'net_profit_margin' => 38],
                    ['produk_nama' => 'ID Card',             'produk_harga' => 15000, 'net_profit_margin' => 50],
                ],
                'data_harian' => [
                    [4500000, 2700000, 25, 0, null],
                    [3200000, 1920000, 18, 1, null],
                    [6800000, 4080000, 38, 0, 'Order banner besar masuk'],
                    [2900000, 1740000, 16, 0, null],
                    [3700000, 2220000, 21, 2, null],
                    [5100000, 3060000, 29, 0, null],
                    [2500000, 1500000, 14, 1, 'Tinta printer habis'],
                    [4200000, 2520000, 24, 0, null],
                    [5800000, 3480000, 33, 0, 'Order undangan massal'],
                    [3100000, 1860000, 17, 2, null],
                    [4600000, 2760000, 26, 0, null],
                    [3500000, 2100000, 20, 1, null],
                    [5200000, 3120000, 30, 0, null],
                    [4900000, 2940000, 28, 0, null],
                ],
                'members' => [
                    ['member_phone' => '08991234001', 'member_count' => 4],
                    ['member_phone' => '08991234002', 'member_count' => 3],
                    ['member_phone' => '08991234003', 'member_count' => 5],
                    ['member_phone' => '08991234004', 'member_count' => 2],
                ],
                'roadmap' => [
                    ['judul' => 'Beli mesin cutting plotter', 'target_metrik' => null,    'target_nilai' => null,      'target_tanggal' => '2025-12-01', 'status' => 'aktif'],
                    ['judul' => 'Omset Rp 150 juta/bulan',    'target_metrik' => 'omset', 'target_nilai' => 150000000, 'target_tanggal' => '2026-06-01', 'status' => 'aktif'],
                    ['judul' => 'Sertifikasi ISO percetakan', 'target_metrik' => null,    'target_nilai' => null,      'target_tanggal' => '2026-01-01', 'status' => 'dibatalkan'],
                ],
            ],

            // ── 10. Toko Roti & Bakery ────────────────────────────────────
            [
                'user' => [
                    'name'     => 'Kartika Sari',
                    'email'    => 'kartika@example.com',
                    'password' => 'password',
                ],
                'bisnis' => [
                    'bisnis_nama'      => 'Bakery Lezat Kartika',
                    'bisnis_tipe'      => 'barang',
                    'bisnis_mulai'     => '2024-01-02',
                    'bisnis_buka'      => '06:00',
                    'bisnis_tutup'     => '20:00',
                    'jumlah_pegawai'   => 3,
                    'target_market'    => 'Keluarga dan pekerja yang ingin sarapan atau camilan sehat',
                    'tujuan_bisnis'    => ['menambah pelanggan tetap', 'menaikkan omset'],
                    'reward_threshold' => 10,
                ],
                'produk' => [
                    ['produk_nama' => 'Roti Tawar Spesial', 'produk_harga' => 22000, 'net_profit_margin' => 45],
                    ['produk_nama' => 'Croissant Butter',   'produk_harga' => 18000, 'net_profit_margin' => 50],
                    ['produk_nama' => 'Kue Bolu Gulung',    'produk_harga' => 35000, 'net_profit_margin' => 42],
                    ['produk_nama' => 'Donat Coklat',       'produk_harga' => 8000,  'net_profit_margin' => 55],
                    ['produk_nama' => 'Cheese Cake Slice',  'produk_harga' => 28000, 'net_profit_margin' => 48],
                ],
                'data_harian' => [
                    [1100000, 500000, 55, 0, null],
                    [1350000, 615000, 68, 0, null],
                    [900000,  410000, 45, 1, null],
                    [1600000, 730000, 80, 0, 'Promo buy 2 get 1'],
                    [1050000, 480000, 53, 2, null],
                    [1450000, 660000, 73, 0, null],
                    [1250000, 570000, 63, 1, 'Oven mati 1 jam'],
                    [1750000, 800000, 88, 0, 'Sabtu paling rame'],
                    [1150000, 525000, 58, 0, null],
                    [1000000, 456000, 50, 2, null],
                    [1400000, 638000, 70, 0, null],
                    [1300000, 593000, 65, 1, null],
                    [1550000, 707000, 78, 0, null],
                    [1900000, 866000, 95, 0, 'Pesanan custom kue ulang tahun'],
                ],
                'members' => [
                    ['member_phone' => '08001234001', 'member_count' => 3],
                    ['member_phone' => '08001234002', 'member_count' => 11],
                    ['member_phone' => '08001234003', 'member_count' => 6],
                    ['member_phone' => '08001234004', 'member_count' => 9],
                    ['member_phone' => '08001234005', 'member_count' => 2],
                ],
                'roadmap' => [
                    ['judul' => 'Tambah menu kue kering lebaran', 'target_metrik' => null,    'target_nilai' => null,     'target_tanggal' => '2025-03-01', 'status' => 'tercapai'],
                    ['judul' => 'Omset Rp 45 juta/bulan',         'target_metrik' => 'omset', 'target_nilai' => 45000000, 'target_tanggal' => '2025-12-31', 'status' => 'aktif'],
                    ['judul' => 'Buka outlet ke-2 di mal',        'target_metrik' => null,    'target_nilai' => null,     'target_tanggal' => '2026-06-01', 'status' => 'aktif'],
                ],
            ],

        ];

        // ── Pastikan storage symlink sudah ada ────────────────────────
        if (!file_exists(public_path('storage'))) {
            $this->command->warn('Symlink storage belum ada. Jalankan: php artisan storage:link');
        }

        foreach ($users as $data) {
            $this->command->info("Seeding: {$data['bisnis']['bisnis_nama']}...");

            // 1. Register user
            $user = $this->registerUser($data['user']);

            // 2. Buat bisnis + generate token + QR
            $bisnis = $this->createBisnis($user, $data['bisnis']);

            // 3. Tambah produk
            $produkIds = $this->createProduk($bisnis, $data['produk']);

            // 4. Data harian + penjualan harian
            $this->createDataHarian($bisnis, $data['data_harian'], $produkIds);

            // 5. Members
            $this->createMembers($bisnis, $data['members']);

            // 6. Roadmap
            $this->createRoadmap($bisnis, $data['roadmap']);

            $this->command->info("  ✓ Token: {$bisnis->member_token}");
            $this->command->info("  ✓ QR   : {$bisnis->QR_image_url}");
        }

        $this->command->info("\n✅ Selesai! " . count($users) . " bisnis berhasil di-seed.");
    }
}