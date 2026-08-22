<?php

namespace App\Http\Controllers;

use App\Models\Bisnis;
use App\Models\DataHarian;
use App\Models\PenjualanHarian;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DataHarianController extends Controller
{
    public function index(Request $request)
    {
        $page     = $request->input('page', 1);
        $per_page = $request->input('per_page', 25);

        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $dataHarian = DataHarian::where('bisnis_id', $bisnis->id)
            ->with(['produkTerlaris', 'penjualanHarian.produk'])
            ->latest('tanggal')
            ->paginate($per_page, ['*'], 'page', $page);

        $data = [
            'currentPage' => $dataHarian->currentPage(),
            'data'        => $dataHarian->map(fn($item) => $this->format($item)),
            'from'        => $dataHarian->firstItem(),
            'last_page'   => $dataHarian->lastPage(),
            'to'          => $dataHarian->lastItem(),
            'total'       => $dataHarian->total(),
        ];

        return $this->success('Data harian berhasil diambil', $data);
    }

    public function store(Request $request)
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $validate = Validator::make($request->all(), [
            'tanggal'            => 'required|date|date_format:Y-m-d',
            'pendapatan'         => 'required|numeric|min:0',
            'pengeluaran'        => 'required|numeric|min:0',
            'jumlah_pembeli'     => 'required|integer|min:0',
            'produk_terlaris_id' => 'nullable|exists:produk,id',
            'kendala'            => 'nullable|string',
            'note'               => 'nullable|string',

            // Penjualan per produk — opsional, array of objects
            'penjualan'                => 'nullable|array',
            'penjualan.*.produk_id'    => 'required_with:penjualan|integer|exists:produk,id',
            'penjualan.*.qty'          => 'required_with:penjualan|integer|min:1',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors'  => $validate->errors()
            ], 422);
        }

        // Validasi produk terlaris milik bisnis ini
        if ($request->produk_terlaris_id) {
            $produk = Product::find($request->produk_terlaris_id);
            if ($produk->bisnis_id !== $bisnis->id) {
                return $this->error('Produk tidak ditemukan', 404);
            }
        }

        // Validasi semua produk di penjualan milik bisnis ini
        if ($request->filled('penjualan')) {
            $produkIds    = collect($request->penjualan)->pluck('produk_id');
            $validProduk  = Product::where('bisnis_id', $bisnis->id)
                ->whereIn('id', $produkIds)
                ->pluck('id');

            $invalid = $produkIds->diff($validProduk);
            if ($invalid->isNotEmpty()) {
                return $this->error('Beberapa produk tidak ditemukan atau bukan milik bisnis ini', 404);
            }
        }

        DB::transaction(function () use ($request, $bisnis, &$dataHarian) {
            $dataHarian = DataHarian::create([
                'bisnis_id'          => $bisnis->id,
                'tanggal'            => $request->tanggal,
                'pendapatan'         => $request->pendapatan,
                'pengeluaran'        => $request->pengeluaran,
                'jumlah_pembeli'     => $request->jumlah_pembeli,
                'produk_terlaris_id' => $request->produk_terlaris_id,
                'kendala'            => $request->kendala,
                'note'               => $request->note,
            ]);

            if ($request->filled('penjualan')) {
                $penjualanData = collect($request->penjualan)->map(fn($p) => [
                    'data_harian_id' => $dataHarian->id,
                    'produk_id'      => $p['produk_id'],
                    'qty'            => $p['qty'],
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ])->toArray();

                PenjualanHarian::insert($penjualanData);
            }
        });

        $dataHarian->load('produkTerlaris', 'penjualanHarian.produk');

        return $this->success('Data harian berhasil ditambahkan', ['data' => $this->format($dataHarian)], 201);
    }

    public function show(int $id)
    {
        $userId     = Auth::user()->id;
        $dataHarian = DataHarian::with(['produkTerlaris', 'penjualanHarian.produk'])->find($id);

        if (!$dataHarian) {
            return $this->error('Data harian tidak ditemukan', 404);
        }
        if ($dataHarian->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        return $this->success('Data harian berhasil diambil', ['data' => $this->format($dataHarian)]);
    }

    public function update(Request $request, int $id)
    {
        $userId     = Auth::user()->id;
        $dataHarian = DataHarian::find($id);

        if (!$dataHarian) {
            return $this->error('Data harian tidak ditemukan', 404);
        }
        if ($dataHarian->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $validate = Validator::make($request->all(), [
            'tanggal'            => 'date|date_format:Y-m-d',
            'pendapatan'         => 'numeric|min:0',
            'pengeluaran'        => 'numeric|min:0',
            'jumlah_pembeli'     => 'integer|min:0',
            'produk_terlaris_id' => 'nullable|exists:produk,id',
            'kendala'            => 'nullable|string',
            'note'               => 'nullable|string',

            // Jika penjualan dikirim saat update, akan replace semua data lama
            'penjualan'             => 'nullable|array',
            'penjualan.*.produk_id' => 'required_with:penjualan|integer|exists:produk,id',
            'penjualan.*.qty'       => 'required_with:penjualan|integer|min:1',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors'  => $validate->errors()
            ], 422);
        }

        DB::transaction(function () use ($request, $dataHarian) {
            $dataHarian->update(
                $request->only(['tanggal', 'pendapatan', 'pengeluaran', 'jumlah_pembeli', 'produk_terlaris_id', 'kendala', 'note'])
            );

            // Jika penjualan dikirim → hapus lama, insert baru (replace all)
            if ($request->has('penjualan')) {
                $dataHarian->penjualanHarian()->delete();

                if ($request->filled('penjualan')) {
                    $bisnis       = $dataHarian->bisnis;
                    $produkIds    = collect($request->penjualan)->pluck('produk_id');
                    $validProduk  = Product::where('bisnis_id', $bisnis->id)->whereIn('id', $produkIds)->pluck('id');

                    $penjualanData = collect($request->penjualan)
                        ->filter(fn($p) => $validProduk->contains($p['produk_id']))
                        ->map(fn($p) => [
                            'data_harian_id' => $dataHarian->id,
                            'produk_id'      => $p['produk_id'],
                            'qty'            => $p['qty'],
                            'created_at'     => now(),
                            'updated_at'     => now(),
                        ])->toArray();

                    PenjualanHarian::insert($penjualanData);
                }
            }
        });

        $dataHarian->load('produkTerlaris', 'penjualanHarian.produk');

        return $this->success('Data harian berhasil diupdate', ['data' => $this->format($dataHarian)]);
    }

    public function destroy(int $id)
    {
        $userId     = Auth::user()->id;
        $dataHarian = DataHarian::find($id);

        if (!$dataHarian) {
            return $this->error('Data harian tidak ditemukan', 404);
        }
        if ($dataHarian->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        // penjualan_harian ikut terhapus via cascadeOnDelete
        $dataHarian->delete();
        return $this->success('Data harian berhasil dihapus');
    }

    public function summary(Request $request)
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
            ], 422);
        }

        $dataHarian = DataHarian::where('bisnis_id', $bisnis->id)
            ->periodeEvaluasi($request->dari, $request->sampai)
            ->with(['produkTerlaris', 'penjualanHarian.produk'])
            ->get();

        if ($dataHarian->isEmpty()) {
            return $this->error('Tidak ada data pada periode ini', 404);
        }

        $totalPendapatan  = $dataHarian->sum('pendapatan');
        $totalPengeluaran = $dataHarian->sum('pengeluaran');
        $totalPembeli     = $dataHarian->sum('jumlah_pembeli');
        $totalHari        = $dataHarian->count();

        // Rangkuman penjualan per produk
        $penjualanPerProduk = $dataHarian
            ->flatMap(fn($d) => $d->penjualanHarian)
            ->groupBy('produk_id')
            ->map(fn($group) => [
                'produk_id'         => $group->first()->produk_id,
                'produk_nama'       => $group->first()->produk?->produk_nama ?? 'Produk Dihapus',
                'produk_harga'      => $group->first()->produk?->produk_harga ?? 0,
                'net_profit_margin' => $group->first()->produk?->net_profit_margin,
                'total_qty'         => $group->sum('qty'),
                'total_pendapatan'  => $group->sum(fn($p) => $p->qty * (float)($p->produk?->produk_harga ?? 0)),
                'estimasi_laba'     => $group->first()->produk?->net_profit_margin
                    ? $group->sum(fn($p) => $p->qty * (float)($p->produk?->produk_harga ?? 0)) * ($group->first()->produk->net_profit_margin / 100)
                    : null,
            ])
            ->sortByDesc('total_qty')
            ->values();

        // Produk terlaris berdasarkan qty
        $produkTerlaris = $penjualanPerProduk->first();

        $data = [
            'periode' => [
                'dari'       => $request->dari,
                'sampai'     => $request->sampai,
                'total_hari' => $totalHari,
            ],
            'total_pendapatan'         => $totalPendapatan,
            'total_pengeluaran'        => $totalPengeluaran,
            'total_laba'               => $totalPendapatan - $totalPengeluaran,
            'rata_rata_pendapatan'     => round($totalPendapatan / $totalHari, 2),
            'rata_rata_pembeli'        => round($totalPembeli / $totalHari, 2),
            'produk_terlaris_qty'      => $produkTerlaris,
            'penjualan_per_produk'     => $penjualanPerProduk,
            'kendala'                  => $dataHarian->whereNotNull('kendala')->pluck('kendala')->values(),
        ];

        return $this->success('Summary data harian berhasil diambil', ['data' => $data]);
    }

    // -------------------------
    // Helper
    // -------------------------

    private function format(DataHarian $item): array
    {
        return [
            'id'                 => $item->id,
            'bisnis_id'          => $item->bisnis_id,
            'tanggal'            => $item->tanggal?->toDateString(),
            'pendapatan'         => $item->pendapatan,
            'pengeluaran'        => $item->pengeluaran,
            'laba'               => $item->laba,
            'jumlah_pembeli'     => $item->jumlah_pembeli,
            'produk_terlaris_id' => $item->produk_terlaris_id,
            'produk_terlaris'    => $item->produkTerlaris?->produk_nama,
            'kendala'            => $item->kendala,
            'note'               => $item->note,
            'penjualan'          => $item->penjualanHarian->map(fn($p) => [
                'produk_id'         => $p->produk_id,
                'produk_nama'       => $p->produk?->produk_nama,
                'produk_harga'      => $p->produk?->produk_harga,
                'net_profit_margin' => $p->produk?->net_profit_margin,
                'qty'               => $p->qty,
                'total_pendapatan'  => $p->total_pendapatan,
                'estimasi_laba'     => $p->estimasi_laba,
            ])->values(),
            'created_at'         => $item->created_at,
            'updated_at'         => $item->updated_at,
        ];
    }
}
