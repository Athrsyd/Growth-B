<?php

namespace App\Http\Controllers;

use App\Models\Analisis;
use App\Models\Bisnis;
use App\Models\DataHarian;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class AnalisisController extends Controller
{
    // Durasi siklus analisa dalam hari
    const SIKLUS_HARI = 14;

    public function index(Request $request)
    {
        $page = $request->input('page', 1);
        $per_page = $request->input('per_page', 25);

        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $analisa = Analisis::where('bisnis_id', $bisnis->id)
            ->latest()
            ->paginate($per_page, ['*'], 'page', $page);

        $data = [
            'currentPage' => $analisa->currentPage(),
            'data' => $analisa->map(fn($item) => [
                'id' => $item->id,
                'bisnis_id' => $item->bisnis_id,
                'tipe_eval' => $item->tipe_eval,
                'pesan' => $item->pesan,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
            ]),
            'from' => $analisa->firstItem(),
            'last_page' => $analisa->lastPage(),
            'to' => $analisa->lastItem(),
            'total' => $analisa->total(),
        ];

        return $this->success('Data analisa berhasil diambil', $data);
    }

    public function show(int $id)
    {
        $userId = Auth::user()->id;
        $analisa = Analisis::find($id);

        if (!$analisa) {
            return $this->error('Analisa tidak ditemukan', 404);
        }

        if ($analisa->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $data = [
            'id' => $analisa->id,
            'bisnis_id' => $analisa->bisnis_id,
            'tipe_eval' => $analisa->tipe_eval,
            'pesan' => $analisa->pesan,
            'created_at' => $analisa->created_at,
            'updated_at' => $analisa->updated_at,
        ];

        return $this->success('Data analisa berhasil diambil', ['data' => $data]);
    }

    // Ambil analisa terbaru (eval + plan sekaligus)
    public function latest()
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $eval = Analisis::where('bisnis_id', $bisnis->id)->evaluasi()->latest()->first();
        $plan = Analisis::where('bisnis_id', $bisnis->id)->rencana()->latest()->first();

        $data = [
            'eval' => $eval ? [
                'id' => $eval->id,
                'pesan' => $eval->pesan,
                'created_at' => $eval->created_at,
            ] : null,
            'plan' => $plan ? [
                'id' => $plan->id,
                'pesan' => $plan->pesan,
                'created_at' => $plan->created_at,
            ] : null,
        ];

        return $this->success('Analisa terbaru berhasil diambil', ['data' => $data]);
    }

    // Cek status siklus analisa saat ini
    public function status()
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $periodeInfo = $this->hitungPeriodeSaatIni($bisnis);
        $sudahAdaAnalisa = Analisis::where('bisnis_id', $bisnis->id)
            ->whereBetween('created_at', [
                $periodeInfo['dari']->startOfDay(),
                $periodeInfo['sampai']->endOfDay(),
            ])
            ->exists();

        $jumlahDataTerisi = DataHarian::where('bisnis_id', $bisnis->id)
            ->periodeEvaluasi(
                $periodeInfo['dari']->toDateString(),
                $periodeInfo['sampai']->toDateString()
            )
            ->count();

        $data = [
            'periode' => [
                'dari' => $periodeInfo['dari']->toDateString(),
                'sampai' => $periodeInfo['sampai']->toDateString(),
                'siklus_ke' => $periodeInfo['siklus_ke'],
            ],
            'jumlah_data_terisi' => $jumlahDataTerisi,
            'jumlah_data_dibutuhkan' => self::SIKLUS_HARI,
            'data_lengkap' => $jumlahDataTerisi === self::SIKLUS_HARI,
            'sudah_dianalisa' => $sudahAdaAnalisa,
            'bisa_generate' => !$sudahAdaAnalisa && $jumlahDataTerisi === self::SIKLUS_HARI,
        ];

        return $this->success('Status analisa berhasil diambil', ['data' => $data]);
    }

    // Generate analisa otomatis berdasarkan siklus 14 hari
    public function generate()
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        // Hitung periode siklus saat ini
        $periodeInfo = $this->hitungPeriodeSaatIni($bisnis);
        $dari = $periodeInfo['dari']->toDateString();
        $sampai = $periodeInfo['sampai']->toDateString();

        // Cek apakah periode ini sudah pernah dianalisa
        $sudahAdaAnalisa = Analisis::where('bisnis_id', $bisnis->id)
            ->whereBetween('created_at', [
                $periodeInfo['dari']->startOfDay(),
                $periodeInfo['sampai']->endOfDay(),
            ])
            ->exists();

        if ($sudahAdaAnalisa) {
            return $this->error(
                "Periode ini ({$dari} s/d {$sampai}) sudah pernah dianalisa. Analisa berikutnya tersedia pada siklus berikutnya.",
                422
            );
        }

        // Ambil semua data harian dalam periode
        $dataHarian = DataHarian::where('bisnis_id', $bisnis->id)
            ->periodeEvaluasi($dari, $sampai)
            ->with('produkTerlaris')
            ->get();

        // Validasi: semua 14 hari harus terisi
        $jumlahTerisi = $dataHarian->count();
        if ($jumlahTerisi < self::SIKLUS_HARI) {
            $kurang = self::SIKLUS_HARI - $jumlahTerisi;
            return $this->error(
                "Data harian belum lengkap. Masih kurang {$kurang} hari input data (periode {$dari} s/d {$sampai} harus terisi semua {$jumlahTerisi}/" . self::SIKLUS_HARI . " hari).",
                422
            );
        }

        // Susun ringkasan data untuk AI
        $totalPendapatan = $dataHarian->sum('pendapatan');
        $totalPengeluaran = $dataHarian->sum('pengeluaran');
        $totalPembeli = $dataHarian->sum('jumlah_pembeli');
        $kendalaList = $dataHarian->whereNotNull('kendala')->pluck('kendala')->implode('; ');

        $konteksBisnis = "
            Nama bisnis: {$bisnis->bisnis_nama}
            Tipe: {$bisnis->bisnis_tipe}
            Target market: {$bisnis->target_market}
            Tujuan bisnis: " . implode(', ', $bisnis->tujuan_bisnis) . "
            Jumlah pegawai: {$bisnis->jumlah_pegawai}
        ";

        $ringkasanData = "
            Periode: {$dari} s/d {$sampai} (14 hari)
            Total pendapatan: Rp " . number_format($totalPendapatan, 0, ',', '.') . "
            Total pengeluaran: Rp " . number_format($totalPengeluaran, 0, ',', '.') . "
            Total laba: Rp " . number_format($totalPendapatan - $totalPengeluaran, 0, ',', '.') . "
            Rata-rata pendapatan/hari: Rp " . number_format($totalPendapatan / self::SIKLUS_HARI, 0, ',', '.') . "
            Rata-rata pembeli/hari: " . round($totalPembeli / self::SIKLUS_HARI) . "
            Kendala yang tercatat: " . ($kendalaList ?: 'tidak ada') . "
        ";

        $prompt = "
            Kamu adalah konsultan bisnis UMKM yang berpengalaman.
            Berikut data bisnis dan performa periode ini:

            === PROFIL BISNIS ===
            {$konteksBisnis}

            === DATA PERFORMA ===
            {$ringkasanData}

            Berikan:
            1. EVALUASI: Analisis performa bisnis pada periode ini secara ringkas dan jelas (maks 200 kata).
            2. REKOMENDASI: 3 langkah konkret yang bisa dilakukan pemilik UMKM untuk periode berikutnya (maks 200 kata).

            Format jawaban:
            EVALUASI:
            [isi evaluasi]

            REKOMENDASI:
            [isi rekomendasi]

            Gunakan bahasa Indonesia yang sederhana, mudah dipahami pelaku UMKM.
        ";

        // Panggil Gemini 2.5 Flash API
        $apiKey = config('services.gemini.api_key');
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ],
            'generationConfig' => [
                'maxOutputTokens' => 1024,
                'temperature' => 0.7,
            ],
        ]);

        if (!$response->successful()) {
            return $this->error('Gagal menghubungi layanan AI', 500);
        }

        $aiResponse = $response->json('candidates.0.content.parts.0.text');

        if (!$aiResponse) {
            return $this->error('Respons AI tidak valid', 500);
        }

        // Pisahkan evaluasi dan rekomendasi
        preg_match('/EVALUASI:\s*(.*?)\s*REKOMENDASI:/s', $aiResponse, $evalMatch);
        preg_match('/REKOMENDASI:\s*(.*)/s', $aiResponse, $planMatch);

        $pesanEval = trim($evalMatch[1] ?? $aiResponse);
        $pesanPlan = trim($planMatch[1] ?? '');

        // Simpan ke DB
        $eval = Analisis::create([
            'bisnis_id' => $bisnis->id,
            'tipe_eval' => 'eval',
            'pesan' => $pesanEval,
        ]);

        $plan = null;
        if ($pesanPlan) {
            $plan = Analisis::create([
                'bisnis_id' => $bisnis->id,
                'tipe_eval' => 'plan',
                'pesan' => $pesanPlan,
            ]);
        }

        $data = [
            'periode' => ['dari' => $dari, 'sampai' => $sampai],
            'eval' => [
                'id' => $eval->id,
                'pesan' => $eval->pesan,
                'created_at' => $eval->created_at,
            ],
            'plan' => $plan ? [
                'id' => $plan->id,
                'pesan' => $plan->pesan,
                'created_at' => $plan->created_at,
            ] : null,
        ];

        return $this->success('Analisa berhasil digenerate', ['data' => $data], 201);
    }

    public function destroy(int $id)
    {
        $userId = Auth::user()->id;
        $analisa = Analisis::find($id);

        if (!$analisa) {
            return $this->error('Analisa tidak ditemukan', 404);
        }

        if ($analisa->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $analisa->delete();
        return $this->success('Analisa berhasil dihapus');
    }

    // -------------------------
    // Helper
    // -------------------------

    /**
     * Hitung periode siklus 14 hari saat ini berdasarkan tanggal mulai bisnis.
     * Contoh: bisnis_mulai = 1 Juli, siklus 1 = 1-14 Juli, siklus 2 = 15-28 Juli, dst.
     */
    private function hitungPeriodeSaatIni(Bisnis $bisnis): array
    {
        $mulai = Carbon::parse($bisnis->bisnis_mulai)->startOfDay();
        $sekarang = Carbon::now()->startOfDay();

        $selisihHari = $mulai->diffInDays($sekarang);
        $siklusKe = (int) floor($selisihHari / self::SIKLUS_HARI) + 1;

        $periodeStart = $mulai->copy()->addDays(($siklusKe - 1) * self::SIKLUS_HARI);
        $periodeEnd = $periodeStart->copy()->addDays(self::SIKLUS_HARI - 1);

        return [
            'dari' => $periodeStart,
            'sampai' => $periodeEnd,
            'siklus_ke' => $siklusKe,
        ];
    }
}