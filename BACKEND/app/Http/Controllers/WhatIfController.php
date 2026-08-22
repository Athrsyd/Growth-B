<?php

namespace App\Http\Controllers;

use App\Models\Bisnis;
use App\Models\DataHarian;
use App\Models\Product;
use App\Models\Roadmap;
use App\Models\WhatIf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class WhatIfController extends Controller
{
    const BATAS_HARIAN = 3;

    public function index(Request $request)
    {
        $page = $request->input('page', 1);
        $per_page = $request->input('per_page', 25);

        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $whatIfs = WhatIf::where('bisnis_id', $bisnis->id)
            ->with('produk')
            ->latest()
            ->paginate($per_page, ['*'], 'page', $page);

        $data = [
            'currentPage' => $whatIfs->currentPage(),
            'data' => $whatIfs->map(fn($item) => $this->format($item)),
            'from' => $whatIfs->firstItem(),
            'last_page' => $whatIfs->lastPage(),
            'to' => $whatIfs->lastItem(),
            'total' => $whatIfs->total(),
        ];

        return $this->success('Riwayat what if berhasil diambil', $data);
    }

    public function show(int $id)
    {
        $userId = Auth::user()->id;
        $whatIf = WhatIf::with('produk')->find($id);

        if (!$whatIf) {
            return $this->error('Data tidak ditemukan', 404);
        }

        if ($whatIf->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        return $this->success('Detail what if berhasil diambil', ['data' => $this->format($whatIf)]);
    }

    // Cek sisa kuota what if hari ini
    public function kuota()
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $terpakai = WhatIf::where('bisnis_id', $bisnis->id)->hariIni()->count();

        return $this->success('Kuota what if berhasil diambil', [
            'data' => [
                'terpakai'  => $terpakai,
                'batas'     => self::BATAS_HARIAN,
                'sisa'      => max(0, self::BATAS_HARIAN - $terpakai),
                'bisa_pakai' => $terpakai < self::BATAS_HARIAN,
            ]
        ]);
    }

    public function predict(Request $request)
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        // Cek kuota harian
        $terpakai = WhatIf::where('bisnis_id', $bisnis->id)->hariIni()->count();
        if ($terpakai >= self::BATAS_HARIAN) {
            return $this->error(
                "Batas prediksi harian tercapai. Anda sudah menggunakan {$terpakai}/" . self::BATAS_HARIAN . " prediksi hari ini. Coba lagi besok.",
                429
            );
        }

        // Validasi field umum
        $validate = Validator::make($request->all(), [
            'tipe' => 'required|in:produk,biaya,jam_operasional',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ], 422);
        }

        // Routing ke handler berdasarkan tipe
        return match ($request->tipe) {
            'produk'          => $this->handleProduk($request, $bisnis),
            'biaya'           => $this->handleBiaya($request, $bisnis),
            'jam_operasional' => $this->handleJamOperasional($request, $bisnis),
        };
    }

    // -------------------------
    // Handler per tipe
    // -------------------------

    private function handleProduk(Request $request, Bisnis $bisnis)
    {
        $validate = Validator::make($request->all(), [
            'produk_id'    => 'required|integer|exists:produk,id',
            'perubahan'    => 'required|in:naik,turun',
            'nilai'        => 'required|numeric|min:0',       // nominal perubahan harga
            'rating_manual'=> 'nullable|integer|min:1|max:10', // diisi FE jika tidak ada data terlaris
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ], 422);
        }

        $produk = Product::find($request->produk_id);

        // Pastikan produk milik bisnis ini
        if ($produk->bisnis_id !== $bisnis->id) {
            return $this->error('Produk tidak ditemukan', 404);
        }

        // Cek apakah ada data historis produk ini sebagai terlaris
        $totalHariTerlaris = $produk->totalHariTerlaris();
        $totalDataHarian   = DataHarian::where('bisnis_id', $bisnis->id)->count();

        // Jika tidak pernah jadi terlaris, butuh rating manual dari FE
        if ($totalHariTerlaris === 0 && !$request->filled('rating_manual')) {
            return response()->json([
                'message'  => 'Data historis produk ini tidak tersedia',
                'need_rating' => true,
                'info'     => "Produk \"{$produk->produk_nama}\" belum pernah tercatat sebagai produk terlaris. Berikan rating 1-10 untuk menilai performa produk ini secara manual.",
            ], 422);
        }

        $hargaBaru = $request->perubahan === 'naik'
            ? $produk->produk_harga + $request->nilai
            : $produk->produk_harga - $request->nilai;

        $konteksProduk = "
            Nama produk: {$produk->produk_nama}
            Harga saat ini: Rp " . number_format($produk->produk_harga, 0, ',', '.') . "
            Harga baru (skenario): Rp " . number_format($hargaBaru, 0, ',', '.') . "
            Perubahan: {$request->perubahan} sebesar Rp " . number_format($request->nilai, 0, ',', '.') . "
        ";

        if ($totalHariTerlaris > 0) {
            $persenTerlaris = $totalDataHarian > 0
                ? round(($totalHariTerlaris / $totalDataHarian) * 100, 1)
                : 0;
            $konteksProduk .= "
            Data historis: Produk ini tercatat sebagai terlaris selama {$totalHariTerlaris} hari dari {$totalDataHarian} hari data yang ada ({$persenTerlaris}% hari).
            ";
        } else {
            $konteksProduk .= "
            Rating manual dari pemilik bisnis: {$request->rating_manual}/10 (tidak ada data historis terlaris).
            ";
        }

        $skenario = [
            'perubahan'     => $request->perubahan,
            'nilai'         => $request->nilai,
            'harga_lama'    => $produk->produk_harga,
            'harga_baru'    => $hargaBaru,
            'rating_manual' => $request->rating_manual,
        ];

        return $this->runWhatIf($bisnis, 'produk', $produk->id, $skenario, $konteksProduk);
    }

    private function handleBiaya(Request $request, Bisnis $bisnis)
    {
        $validate = Validator::make($request->all(), [
            'jenis_biaya' => 'required|string|max:100',
            'perubahan'   => 'required|in:naik,turun',
            'persen'      => 'required|numeric|min:0|max:100',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ], 422);
        }

        // Ambil rata-rata pengeluaran 14 hari terakhir sebagai konteks
        $rataRataPengeluaran = DataHarian::where('bisnis_id', $bisnis->id)
            ->latest('tanggal')
            ->limit(14)
            ->avg('pengeluaran') ?? 0;

        $estimasiDampak = $rataRataPengeluaran * ($request->persen / 100);
        $arah = $request->perubahan === 'naik' ? '+' : '-';

        $konteksBiaya = "
            Jenis biaya yang berubah: {$request->jenis_biaya}
            Perubahan: {$request->perubahan} sebesar {$request->persen}%
            Rata-rata pengeluaran harian (14 hari terakhir): Rp " . number_format($rataRataPengeluaran, 0, ',', '.') . "
            Estimasi dampak ke pengeluaran harian: {$arah}Rp " . number_format($estimasiDampak, 0, ',', '.') . "
        ";

        $skenario = [
            'jenis_biaya'            => $request->jenis_biaya,
            'perubahan'              => $request->perubahan,
            'persen'                 => $request->persen,
            'rata_pengeluaran_harian' => $rataRataPengeluaran,
        ];

        return $this->runWhatIf($bisnis, 'biaya', null, $skenario, $konteksBiaya);
    }

    private function handleJamOperasional(Request $request, Bisnis $bisnis)
    {
        $validate = Validator::make($request->all(), [
            'buka_baru'  => 'required|date_format:H:i',
            'tutup_baru' => 'required|date_format:H:i',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ], 422);
        }

        // Hitung durasi operasional lama vs baru
        $bukaLama  = \Carbon\Carbon::createFromFormat('H:i:s', $bisnis->bisnis_buka);
        $tutupLama = \Carbon\Carbon::createFromFormat('H:i:s', $bisnis->bisnis_tutup);
        $durasiLama = $bukaLama->diffInHours($tutupLama);

        $bukaBaru  = \Carbon\Carbon::createFromFormat('H:i', $request->buka_baru);
        $tutupBaru = \Carbon\Carbon::createFromFormat('H:i', $request->tutup_baru);
        $durasiBaru = $bukaBaru->diffInHours($tutupBaru);

        $konteksJam = "
            Jam operasional saat ini: {$bisnis->bisnis_buka} - {$bisnis->bisnis_tutup} ({$durasiLama} jam)
            Jam operasional baru (skenario): {$request->buka_baru} - {$request->tutup_baru} ({$durasiBaru} jam)
            Perubahan durasi: " . ($durasiBaru > $durasiLama ? '+' : '') . ($durasiBaru - $durasiLama) . " jam
        ";

        $skenario = [
            'buka_lama'   => $bisnis->bisnis_buka,
            'tutup_lama'  => $bisnis->bisnis_tutup,
            'buka_baru'   => $request->buka_baru,
            'tutup_baru'  => $request->tutup_baru,
            'durasi_lama' => $durasiLama,
            'durasi_baru' => $durasiBaru,
        ];

        return $this->runWhatIf($bisnis, 'jam_operasional', null, $skenario, $konteksJam);
    }

    // -------------------------
    // Core: panggil AI & simpan
    // -------------------------

    private function runWhatIf(Bisnis $bisnis, string $tipe, ?int $produkId, array $skenario, string $konteksSkenario)
    {
        // Ambil roadmap aktif sebagai acuan AI
        $roadmaps = Roadmap::where('bisnis_id', $bisnis->id)->aktif()->get();

        $konteksRoadmap = '';
        $roadmapAcuan   = [];

        if ($roadmaps->isNotEmpty()) {
            $konteksRoadmap = "\n=== ROADMAP / TARGET BISNIS ===\n";
            foreach ($roadmaps as $r) {
                $targetNilai = $r->target_nilai
                    ? 'Rp ' . number_format($r->target_nilai, 0, ',', '.')
                    : '-';
                $targetTanggal = $r->target_tanggal
                    ? $r->target_tanggal->toDateString()
                    : '-';

                $konteksRoadmap .= "- {$r->judul}: target {$r->target_metrik} {$targetNilai} sebelum {$targetTanggal}\n";

                $roadmapAcuan[] = [
                    'id'            => $r->id,
                    'judul'         => $r->judul,
                    'target_metrik' => $r->target_metrik,
                    'target_nilai'  => $r->target_nilai,
                    'target_tanggal'=> $r->target_tanggal?->toDateString(),
                ];
            }
        }

        // Ringkasan performa bisnis terkini (14 hari terakhir)
        $dataHarian = DataHarian::where('bisnis_id', $bisnis->id)
            ->latest('tanggal')
            ->limit(14)
            ->get();

        $konteksPerforma = '';
        if ($dataHarian->isNotEmpty()) {
            $totalPendapatan  = $dataHarian->sum('pendapatan');
            $totalPengeluaran = $dataHarian->sum('pengeluaran');
            $totalPembeli     = $dataHarian->sum('jumlah_pembeli');
            $totalHari        = $dataHarian->count();

            $konteksPerforma = "
=== PERFORMA BISNIS (14 hari terakhir) ===
Rata-rata pendapatan/hari: Rp " . number_format($totalPendapatan / $totalHari, 0, ',', '.') . "
Rata-rata pengeluaran/hari: Rp " . number_format($totalPengeluaran / $totalHari, 0, ',', '.') . "
Rata-rata laba/hari: Rp " . number_format(($totalPendapatan - $totalPengeluaran) / $totalHari, 0, ',', '.') . "
Rata-rata pembeli/hari: " . round($totalPembeli / $totalHari) . "
            ";
        }

        $tipLabel = match ($tipe) {
            'produk'          => 'perubahan harga produk',
            'biaya'           => 'perubahan biaya operasional',
            'jam_operasional' => 'perubahan jam operasional',
        };

        $prompt = "
Kamu adalah konsultan bisnis UMKM berpengalaman yang ahli dalam analisa skenario bisnis (what-if analysis).

=== PROFIL BISNIS ===
Nama: {$bisnis->bisnis_nama}
Tipe: {$bisnis->bisnis_tipe}
Target market: {$bisnis->target_market}
Tujuan bisnis: " . implode(', ', $bisnis->tujuan_bisnis) . "
Jumlah pegawai: {$bisnis->jumlah_pegawai}
{$konteksPerforma}
{$konteksRoadmap}

=== SKENARIO WHAT IF ===
Tipe: {$tipLabel}
{$konteksSkenario}

=== TUGAS ===
Analisa dampak dari skenario di atas terhadap bisnis ini.
" . ($roadmaps->isNotEmpty() ? "PENTING: Orientasikan analisa dan rekomendasi berdasarkan roadmap/target bisnis yang sudah ditetapkan di atas." : "") . "

Berikan jawaban dengan format:
DAMPAK:
[Jelaskan kemungkinan dampak positif dan negatif dari skenario ini, maks 150 kata]

PELUANG:
[Jelaskan peluang yang bisa dimanfaatkan dari skenario ini, maks 100 kata]

RISIKO:
[Jelaskan risiko yang perlu diantisipasi, maks 100 kata]

REKOMENDASI:
[Berikan 2-3 langkah konkret yang sebaiknya dilakukan, maks 100 kata]

Gunakan bahasa Indonesia yang sederhana dan langsung ke poin.
        ";

        $apiKey  = config('services.gemini.api_key');
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->timeout(30)->post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}",
            [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ],
                'generationConfig' => [
                    'maxOutputTokens' => 1024,
                    'temperature'     => 0.7,
                ],
            ]
        );

        if (!$response->successful()) {
            return $this->error('Gagal menghubungi layanan AI', 500);
        }

        $hasilAnalisa = $response->json('candidates.0.content.parts.0.text');

        if (!$hasilAnalisa) {
            return $this->error('Respons AI tidak valid', 500);
        }

        // Simpan ke DB
        $whatIf = WhatIf::create([
            'bisnis_id'     => $bisnis->id,
            'tipe'          => $tipe,
            'produk_id'     => $produkId,
            'skenario'      => $skenario,
            'hasil_analisa' => $hasilAnalisa,
            'roadmap_acuan' => $roadmapAcuan ?: null,
        ]);

        // Hitung sisa kuota setelah pakai
        $terpakai = WhatIf::where('bisnis_id', $bisnis->id)->hariIni()->count();
        $sisa = max(0, self::BATAS_HARIAN - $terpakai);

        return $this->success('Prediksi what if berhasil', [
            'data' => $this->format($whatIf),
            'kuota' => [
                'terpakai'   => $terpakai,
                'batas'      => self::BATAS_HARIAN,
                'sisa'       => $sisa,
            ],
        ], 201);
    }

    // -------------------------
    // Helper
    // -------------------------

    private function format(WhatIf $item): array
    {
        return [
            'id'            => $item->id,
            'bisnis_id'     => $item->bisnis_id,
            'tipe'          => $item->tipe,
            'produk'        => $item->produk ? [
                'id'           => $item->produk->id,
                'produk_nama'  => $item->produk->produk_nama,
                'produk_harga' => $item->produk->produk_harga,
            ] : null,
            'skenario'      => $item->skenario,
            'hasil_analisa' => $item->hasil_analisa,
            'roadmap_acuan' => $item->roadmap_acuan,
            'created_at'    => $item->created_at,
            'updated_at'    => $item->updated_at,
        ];
    }
}
