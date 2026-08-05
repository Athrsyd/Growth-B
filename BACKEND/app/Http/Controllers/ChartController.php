<?php

namespace App\Http\Controllers;

use App\Models\Bisnis;
use App\Models\DataHarian;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ChartController extends Controller
{
    /**
     * Chart 1 — Revenue Line Chart
     * Menampilkan pendapatan, pengeluaran, dan laba harian dalam rentang tanggal.
     *
     * GET /chart/revenue?dari=2024-07-01&sampai=2024-07-14
     */
    public function revenue(Request $request)
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $validate = Validator::make($request->all(), [
            'dari'   => 'required|date|date_format:Y-m-d',
            'sampai' => 'required|date|date_format:Y-m-d|after_or_equal:dari',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors'  => $validate->errors()
            ]);
        }

        $data = DataHarian::where('bisnis_id', $bisnis->id)
            ->periodeEvaluasi($request->dari, $request->sampai)
            ->orderBy('tanggal', 'asc')
            ->get(['tanggal', 'pendapatan', 'pengeluaran']);

        // Bangun dataset per hari — isi 0 untuk hari yang tidak ada datanya
        $periode   = $this->buildDateRange($request->dari, $request->sampai);
        $mapped    = $data->keyBy(fn($d) => $d->tanggal->toDateString());

        $labels      = [];
        $pendapatan  = [];
        $pengeluaran = [];
        $laba        = [];

        foreach ($periode as $tanggal) {
            $labels[]      = $tanggal;
            $row           = $mapped->get($tanggal);
            $pend          = $row ? (float) $row->pendapatan  : 0;
            $peng          = $row ? (float) $row->pengeluaran : 0;
            $pendapatan[]  = $pend;
            $pengeluaran[] = $peng;
            $laba[]        = round($pend - $peng, 2);
        }

        $result = [
            'labels'   => $labels,
            'datasets' => [
                [
                    'key'   => 'pendapatan',
                    'label' => 'Pendapatan',
                    'data'  => $pendapatan,
                ],
                [
                    'key'   => 'pengeluaran',
                    'label' => 'Pengeluaran',
                    'data'  => $pengeluaran,
                ],
                [
                    'key'   => 'laba',
                    'label' => 'Laba Bersih',
                    'data'  => $laba,
                ],
            ],
            'summary' => [
                'total_pendapatan'  => array_sum($pendapatan),
                'total_pengeluaran' => array_sum($pengeluaran),
                'total_laba'        => array_sum($laba),
            ],
        ];

        return $this->success('Data chart revenue berhasil diambil', ['data' => $result]);
    }

    /**
     * Chart 2 — Customer Line Chart
     * Menampilkan jumlah pembeli harian dalam rentang tanggal.
     *
     * GET /chart/customer?dari=2024-07-01&sampai=2024-07-14
     */
    public function customer(Request $request)
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $validate = Validator::make($request->all(), [
            'dari'   => 'required|date|date_format:Y-m-d',
            'sampai' => 'required|date|date_format:Y-m-d|after_or_equal:dari',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors'  => $validate->errors()
            ]);
        }

        $data = DataHarian::where('bisnis_id', $bisnis->id)
            ->periodeEvaluasi($request->dari, $request->sampai)
            ->orderBy('tanggal', 'asc')
            ->get(['tanggal', 'jumlah_pembeli']);

        $periode = $this->buildDateRange($request->dari, $request->sampai);
        $mapped  = $data->keyBy(fn($d) => $d->tanggal->toDateString());

        $labels         = [];
        $jumlahPembeli  = [];

        foreach ($periode as $tanggal) {
            $labels[]        = $tanggal;
            $row             = $mapped->get($tanggal);
            $jumlahPembeli[] = $row ? (int) $row->jumlah_pembeli : 0;
        }

        $totalPembeli = array_sum($jumlahPembeli);
        $totalHari    = count(array_filter($jumlahPembeli, fn($v) => $v > 0));

        $result = [
            'labels'   => $labels,
            'datasets' => [
                [
                    'key'   => 'jumlah_pembeli',
                    'label' => 'Jumlah Pembeli',
                    'data'  => $jumlahPembeli,
                ],
            ],
            'summary' => [
                'total_pembeli'        => $totalPembeli,
                'rata_rata_per_hari'   => $totalHari > 0 ? round($totalPembeli / $totalHari, 1) : 0,
                'hari_tertinggi'       => $this->hariTertinggi($labels, $jumlahPembeli),
            ],
        ];

        return $this->success('Data chart customer berhasil diambil', ['data' => $result]);
    }

    /**
     * Chart 3 — Top Product Bar Chart
     * Menampilkan productProduct yang paling sering tercatat sebagai terlaris.
     *
     * GET /chart/top-product?dari=2024-07-01&sampai=2024-07-14&limit=5
     */
    public function topProduct(Request $request)
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $validate = Validator::make($request->all(), [
            'dari'   => 'required|date|date_format:Y-m-d',
            'sampai' => 'required|date|date_format:Y-m-d|after_or_equal:dari',
            'limit'  => 'nullable|integer|min:1|max:20',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors'  => $validate->errors()
            ]);
        }

        $limit = $request->input('limit', 5);

        // Hitung frekuensi productProduct jadi terlaris dalam periode
        $topProducts = DataHarian::where('bisnis_id', $bisnis->id)
            ->periodeEvaluasi($request->dari, $request->sampai)
            ->whereNotNull('productProduct_terlaris_id')
            ->selectRaw('productProduct_terlaris_id, COUNT(*) as jumlah_hari')
            ->groupBy('productProduct_terlaris_id')
            ->orderByDesc('jumlah_hari')
            ->limit($limit)
            ->with('productProductTerlaris:id,productProduct_nama,productProduct_harga')
            ->get();

        $labels       = [];
        $jumlahHari   = [];
        $hargaProduct  = [];

        foreach ($topProducts as $item) {
            $labels[]      = $item->productProductTerlaris?->productProduct_nama ?? 'Product Dihapus';
            $jumlahHari[]  = (int) $item->jumlah_hari;
            $hargaProduct[] = (float) ($item->productProductTerlaris?->productProduct_harga ?? 0);
        }

        $result = [
            'labels'   => $labels,
            'datasets' => [
                [
                    'key'   => 'jumlah_hari_terlaris',
                    'label' => 'Hari Jadi Terlaris',
                    'data'  => $jumlahHari,
                ],
            ],
            'detail' => $topProducts->map(fn($item) => [
                'productProduct_nama'        => $item->productProductTerlaris?->productProduct_nama ?? 'Product Dihapus',
                'productProduct_harga'       => $item->productProductTerlaris?->productProduct_harga ?? 0,
                'jumlah_hari_terlaris' => (int) $item->jumlah_hari,
            ])->values(),
        ];

        return $this->success('Data chart top product berhasil diambil', ['data' => $result]);
    }

    /**
     * Endpoint gabungan — ambil semua chart dalam 1 request.
     * Berguna untuk load dashboard sekaligus.
     *
     * GET /chart/dashboard?dari=2024-07-01&sampai=2024-07-14&limit=5
     */
    public function dashboard(Request $request)
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $validate = Validator::make($request->all(), [
            'dari'   => 'required|date|date_format:Y-m-d',
            'sampai' => 'required|date|date_format:Y-m-d|after_or_equal:dari',
            'limit'  => 'nullable|integer|min:1|max:20',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors'  => $validate->errors()
            ]);
        }

        $limit   = $request->input('limit', 5);
        $dari    = $request->dari;
        $sampai  = $request->sampai;

        // Ambil semua data harian sekali query
        $allData = DataHarian::where('bisnis_id', $bisnis->id)
            ->periodeEvaluasi($dari, $sampai)
            ->orderBy('tanggal', 'asc')
            ->get();

        $periode = $this->buildDateRange($dari, $sampai);
        $mapped  = $allData->keyBy(fn($d) => $d->tanggal->toDateString());

        // --- Revenue & Customer dari data yang sama ---
        $labels      = [];
        $pendapatan  = [];
        $pengeluaran = [];
        $laba        = [];
        $pembeli     = [];

        foreach ($periode as $tanggal) {
            $row           = $mapped->get($tanggal);
            $pend          = $row ? (float) $row->pendapatan  : 0;
            $peng          = $row ? (float) $row->pengeluaran : 0;
            $labels[]      = $tanggal;
            $pendapatan[]  = $pend;
            $pengeluaran[] = $peng;
            $laba[]        = round($pend - $peng, 2);
            $pembeli[]     = $row ? (int) $row->jumlah_pembeli : 0;
        }

        $totalPembeli = array_sum($pembeli);
        $hariBerdata  = count(array_filter($pembeli, fn($v) => $v > 0));

        // --- Top Product ---
        $topProducts = $allData
            ->whereNotNull('productProduct_terlaris_id')
            ->groupBy('productProduct_terlaris_id')
            ->map(fn($group) => [
                'productProduct_nama'          => $group->first()->productProductTerlaris?->productProduct_nama ?? 'Product Dihapus',
                'productProduct_harga'         => (float) ($group->first()->productProductTerlaris?->productProduct_harga ?? 0),
                'jumlah_hari_terlaris' => $group->count(),
            ])
            ->sortByDesc('jumlah_hari_terlaris')
            ->take($limit)
            ->values();

        $result = [
            'revenue' => [
                'labels'   => $labels,
                'datasets' => [
                    ['key' => 'pendapatan',  'label' => 'Pendapatan',  'data' => $pendapatan],
                    ['key' => 'pengeluaran', 'label' => 'Pengeluaran', 'data' => $pengeluaran],
                    ['key' => 'laba',        'label' => 'Laba Bersih', 'data' => $laba],
                ],
                'summary' => [
                    'total_pendapatan'  => array_sum($pendapatan),
                    'total_pengeluaran' => array_sum($pengeluaran),
                    'total_laba'        => array_sum($laba),
                ],
            ],
            'customer' => [
                'labels'   => $labels,
                'datasets' => [
                    ['key' => 'jumlah_pembeli', 'label' => 'Jumlah Pembeli', 'data' => $pembeli],
                ],
                'summary' => [
                    'total_pembeli'      => $totalPembeli,
                    'rata_rata_per_hari' => $hariBerdata > 0 ? round($totalPembeli / $hariBerdata, 1) : 0,
                    'hari_tertinggi'     => $this->hariTertinggi($labels, $pembeli),
                ],
            ],
            'top_product' => [
                'labels'   => $topProducts->pluck('productProduct_nama')->values()->all(),
                'datasets' => [
                    ['key' => 'jumlah_hari_terlaris', 'label' => 'Hari Jadi Terlaris', 'data' => $topProducts->pluck('jumlah_hari_terlaris')->values()->all()],
                ],
                'detail' => $topProducts,
            ],
        ];

        return $this->success('Data dashboard chart berhasil diambil', ['data' => $result]);
    }

    // -------------------------
    // Helpers
    // -------------------------

    /**
     * Generate array tanggal dari dari → sampai.
     * ['2024-07-01', '2024-07-02', ..., '2024-07-14']
     */
    private function buildDateRange(string $dari, string $sampai): array
    {
        $range   = [];
        $current = \Carbon\Carbon::parse($dari);
        $end     = \Carbon\Carbon::parse($sampai);

        while ($current->lte($end)) {
            $range[] = $current->toDateString();
            $current->addDay();
        }

        return $range;
    }

    /**
     * Cari tanggal dengan nilai tertinggi dari dataset.
     */
    private function hariTertinggi(array $labels, array $data): ?array
    {
        if (empty($data)) return null;

        $maxVal = max($data);
        $maxIdx = array_search($maxVal, $data);

        return [
            'tanggal' => $labels[$maxIdx] ?? null,
            'nilai'   => $maxVal,
        ];
    }
}