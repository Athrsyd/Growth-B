<?php

namespace App\Http\Controllers;

use App\Models\Analisis;
use App\Models\Bisnis;
use App\Models\DataHarian;
use App\Models\Roadmap;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class AnalisisController extends Controller
{
    const SIKLUS_HARI = 14;

    public function index(Request $request)
    {
        $page     = $request->input('page', 1);
        $per_page = $request->input('per_page', 25);

        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $Analisis = Analisis::where('bisnis_id', $bisnis->id)
            ->latest()
            ->paginate($per_page, ['*'], 'page', $page);

        $data = [
            'currentPage' => $Analisis->currentPage(),
            'data'        => $Analisis->map(fn($item) => [
                'id'         => $item->id,
                'bisnis_id'  => $item->bisnis_id,
                'tipe_eval'  => $item->tipe_eval,
                'pesan'      => $item->pesan,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
            ]),
            'from'      => $Analisis->firstItem(),
            'last_page' => $Analisis->lastPage(),
            'to'        => $Analisis->lastItem(),
            'total'     => $Analisis->total(),
        ];

        return $this->success('Data Analisis berhasil diambil', $data);
    }

    public function show(int $id)
    {
        $userId  = Auth::user()->id;
        $Analisis = Analisis::find($id);

        if (!$Analisis) {
            return $this->error('Analisis tidak ditemukan', 404);
        }

        if ($Analisis->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $data = [
            'id'         => $Analisis->id,
            'bisnis_id'  => $Analisis->bisnis_id,
            'tipe_eval'  => $Analisis->tipe_eval,
            'pesan'      => $Analisis->pesan,
            'created_at' => $Analisis->created_at,
            'updated_at' => $Analisis->updated_at,
        ];

        return $this->success('Data Analisis berhasil diambil', ['data' => $data]);
    }

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
            'eval' => $eval ? ['id' => $eval->id, 'pesan' => $eval->pesan, 'created_at' => $eval->created_at] : null,
            'plan' => $plan ? ['id' => $plan->id, 'pesan' => $plan->pesan, 'created_at' => $plan->created_at] : null,
        ];

        return $this->success('Analisis terbaru berhasil diambil', ['data' => $data]);
    }

    public function status()
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $periodeInfo     = $this->hitungPeriodeSaatIni($bisnis);
        $sudahAdaAnalisis = Analisis::where('bisnis_id', $bisnis->id)
            ->whereBetween('created_at', [
                $periodeInfo['dari']->copy()->startOfDay(),
                $periodeInfo['sampai']->copy()->endOfDay(),
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
                'dari'      => $periodeInfo['dari']->toDateString(),
                'sampai'    => $periodeInfo['sampai']->toDateString(),
                'siklus_ke' => $periodeInfo['siklus_ke'],
            ],
            'jumlah_data_terisi'    => $jumlahDataTerisi,
            'jumlah_data_dibutuhkan'=> self::SIKLUS_HARI,
            'data_lengkap'          => $jumlahDataTerisi === self::SIKLUS_HARI,
            'sudah_diAnalisis'       => $sudahAdaAnalisis,
            'bisa_generate'         => !$sudahAdaAnalisis && $jumlahDataTerisi === self::SIKLUS_HARI,
        ];

        return $this->success('Status Analisis berhasil diambil', ['data' => $data]);
    }

    public function generate()
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $periodeInfo = $this->hitungPeriodeSaatIni($bisnis);
        $dari        = $periodeInfo['dari']->toDateString();
        $sampai      = $periodeInfo['sampai']->toDateString();

        // Cek sudah diAnalisis di siklus ini
        $sudahAdaAnalisis = Analisis::where('bisnis_id', $bisnis->id)
            ->whereBetween('created_at', [
                $periodeInfo['dari']->copy()->startOfDay(),
                $periodeInfo['sampai']->copy()->endOfDay(),
            ])
            ->exists();

        if ($sudahAdaAnalisis) {
            return $this->error(
                "Periode ini ({$dari} s/d {$sampai}) sudah pernah diAnalisis. Analisis berikutnya tersedia pada siklus berikutnya.",
                422
            );
        }

        // Validasi kelengkapan data harian
        $dataHarian   = DataHarian::where('bisnis_id', $bisnis->id)
            ->periodeEvaluasi($dari, $sampai)
            ->with('produkTerlaris')
            ->get();

        $jumlahTerisi = $dataHarian->count();
        if ($jumlahTerisi < self::SIKLUS_HARI) {
            $kurang = self::SIKLUS_HARI - $jumlahTerisi;
            return $this->error(
                "Data harian belum lengkap. Masih kurang {$kurang} hari input data (periode {$dari} s/d {$sampai} harus terisi semua {$jumlahTerisi}/" . self::SIKLUS_HARI . " hari).",
                422
            );
        }

        // Ringkasan data performa
        $totalPendapatan  = $dataHarian->sum('pendapatan');
        $totalPengeluaran = $dataHarian->sum('pengeluaran');
        $totalPembeli     = $dataHarian->sum('jumlah_pembeli');
        $kendalaList      = $dataHarian->whereNotNull('kendala')->pluck('kendala')->implode('; ');

        $ringkasanData = "
Periode: {$dari} s/d {$sampai} (14 hari)
Total pendapatan: Rp " . number_format($totalPendapatan, 0, ',', '.') . "
Total pengeluaran: Rp " . number_format($totalPengeluaran, 0, ',', '.') . "
Total laba: Rp " . number_format($totalPendapatan - $totalPengeluaran, 0, ',', '.') . "
Rata-rata pendapatan/hari: Rp " . number_format($totalPendapatan / self::SIKLUS_HARI, 0, ',', '.') . "
Rata-rata pembeli/hari: " . round($totalPembeli / self::SIKLUS_HARI) . "
Kendala yang tercatat: " . ($kendalaList ?: 'tidak ada');

        // Bangun konteks orientasi: roadmap aktif ATAU tujuan bisnis
        $konteksOrientasi = $this->buildKonteksOrientasi($bisnis);

        $prompt = "
Kamu adalah konsultan bisnis UMKM yang berpengalaman.

=== PROFIL BISNIS ===
Nama bisnis: {$bisnis->bisnis_nama}
Tipe: {$bisnis->bisnis_tipe}
Target market: {$bisnis->target_market}
Jumlah pegawai: {$bisnis->jumlah_pegawai}

=== DATA PERFORMA 14 HARI ===
{$ringkasanData}

{$konteksOrientasi['teks']}

=== TUGAS ===
Berikan evaluasi dan rekomendasi bisnis periode ini.
PENTING: {$konteksOrientasi['instruksi']}

Format jawaban:
EVALUASI:
[Analisis performa bisnis periode ini, kaitkan dengan orientasi di atas, maks 200 kata]

REKOMENDASI:
[3 langkah konkret untuk periode berikutnya yang mengarah pada pencapaian orientasi di atas, maks 200 kata]

Gunakan bahasa Indonesia yang sederhana dan mudah dipahami pelaku UMKM.
        ";

        $apiKey   = config('services.gemini.api_key');
        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents'         => [['parts' => [['text' => $prompt]]]],
                'generationConfig' => ['maxOutputTokens' => 1024, 'temperature' => 0.7],
            ]);

        if (!$response->successful()) {
            return $this->error('Gagal menghubungi layanan AI', 500);
        }

        $aiResponse = $response->json('candidates.0.content.parts.0.text');

        if (!$aiResponse) {
            return $this->error('Respons AI tidak valid', 500);
        }

        preg_match('/EVALUASI:\s*(.*?)\s*REKOMENDASI:/s', $aiResponse, $evalMatch);
        preg_match('/REKOMENDASI:\s*(.*)/s', $aiResponse, $planMatch);

        $pesanEval = trim($evalMatch[1] ?? $aiResponse);
        $pesanPlan = trim($planMatch[1] ?? '');

        $eval = Analisis::create([
            'bisnis_id' => $bisnis->id,
            'tipe_eval' => 'eval',
            'pesan'     => $pesanEval,
        ]);

        $plan = null;
        if ($pesanPlan) {
            $plan = Analisis::create([
                'bisnis_id' => $bisnis->id,
                'tipe_eval' => 'plan',
                'pesan'     => $pesanPlan,
            ]);
        }

        $data = [
            'periode'          => ['dari' => $dari, 'sampai' => $sampai],
            'orientasi_pakai'  => $konteksOrientasi['sumber'], // 'roadmap' atau 'tujuan_bisnis'
            'eval' => [
                'id'         => $eval->id,
                'pesan'      => $eval->pesan,
                'created_at' => $eval->created_at,
            ],
            'plan' => $plan ? [
                'id'         => $plan->id,
                'pesan'      => $plan->pesan,
                'created_at' => $plan->created_at,
            ] : null,
        ];

        return $this->success('Analisis berhasil digenerate', ['data' => $data], 201);
    }

    public function destroy(int $id)
    {
        $userId  = Auth::user()->id;
        $Analisis = Analisis::find($id);

        if (!$Analisis) {
            return $this->error('Analisis tidak ditemukan', 404);
        }

        if ($Analisis->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $Analisis->delete();
        return $this->success('Analisis berhasil dihapus');
    }

    // -------------------------
    // Helpers
    // -------------------------

    /**
     * Bangun konteks orientasi untuk prompt AI.
     * Prioritas: roadmap aktif → tujuan bisnis dari profil.
     */
    private function buildKonteksOrientasi(Bisnis $bisnis): array
    {
        $roadmaps = Roadmap::where('bisnis_id', $bisnis->id)->aktif()->get();

        if ($roadmaps->isNotEmpty()) {
            // Pakai roadmap aktif
            $baris = $roadmaps->map(function ($r) {
                $targetNilai   = $r->target_nilai
                    ? 'Rp ' . number_format($r->target_nilai, 0, ',', '.')
                    : '-';
                $targetTanggal = $r->target_tanggal
                    ? $r->target_tanggal->toDateString()
                    : 'tidak ditentukan';

                return "- {$r->judul}" .
                    ($r->target_metrik ? " | target {$r->target_metrik}: {$targetNilai}" : '') .
                    " | deadline: {$targetTanggal}";
            })->implode("\n");

            return [
                'sumber'    => 'roadmap',
                'teks'      => "=== ROADMAP AKTIF (orientasi Analisis) ===\n{$baris}",
                'instruksi' => 'Evaluasi dan rekomendasi HARUS berorientasi pada roadmap aktif di atas. Nilai seberapa jauh performa saat ini mendukung pencapaian setiap target roadmap, dan arahkan rekomendasi untuk mempercepat pencapaiannya.',
            ];
        }

        // Fallback: pakai tujuan bisnis dari profil
        $tujuan = implode(', ', $bisnis->tujuan_bisnis);

        return [
            'sumber'    => 'tujuan_bisnis',
            'teks'      => "=== TUJUAN BISNIS (orientasi Analisis) ===\n{$tujuan}",
            'instruksi' => 'Evaluasi dan rekomendasi HARUS berorientasi pada tujuan bisnis di atas. Nilai seberapa jauh performa saat ini mendukung tujuan tersebut, dan arahkan rekomendasi untuk lebih mendekat ke tujuan itu.',
        ];
    }

    /**
     * Hitung periode siklus 14 hari saat ini berdasarkan tanggal mulai bisnis.
     */
    private function hitungPeriodeSaatIni(Bisnis $bisnis): array
    {
        $mulai    = Carbon::parse($bisnis->bisnis_mulai)->startOfDay();
        $sekarang = Carbon::now()->startOfDay();

        $selisihHari = $mulai->diffInDays($sekarang);
        $siklusKe    = (int) floor($selisihHari / self::SIKLUS_HARI) + 1;

        $periodeStart = $mulai->copy()->addDays(($siklusKe - 1) * self::SIKLUS_HARI);
        $periodeEnd   = $periodeStart->copy()->addDays(self::SIKLUS_HARI - 1);

        return [
            'dari'      => $periodeStart,
            'sampai'    => $periodeEnd,
            'siklus_ke' => $siklusKe,
        ];
    }
}