<?php

namespace App\Http\Controllers;

use App\Models\Bisnis;
use App\Models\DataHarian;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class DataHarianController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->input('page', 1);
        $per_page = $request->input('per_page', 25);
        $month = $request->input('month');
        $year = $request->input('year');

        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }
        

        $dataHarian = DataHarian::where('bisnis_id', $bisnis->id)
            ->when($month, function ($q) use ($month) {
                $q->whereMonth('tanggal', $month);
            })
            ->when($year, function ($q) use ($year) {
                $q->whereYear('tanggal', $year);
            })
            ->where('is_libur', false) 
            ->with('produkTerlaris')
            ->latest('tanggal')
            ->paginate($per_page, ['*'], 'page', $page);

        $hariLibur = DataHarian::where('bisnis_id', $bisnis->id)
            ->when($month, function ($q) use ($month) {
                $q->whereMonth('tanggal', $month);
            })
            ->when($year, function ($q) use ($year) {
                $q->whereYear('tanggal', $year);
            })
            ->where('is_libur', true)
            ->groupBy('tanggal')
            ->get(['tanggal']);

        $data = [
            'currentPage' => $dataHarian->currentPage(),
            'data' => $dataHarian->map(fn($item) => [
                'id' => $item->id,
                'bisnis_id' => $item->bisnis_id,
                'tanggal' => $item->tanggal,
                'pendapatan' => $item->pendapatan,
                'pengeluaran' => $item->pengeluaran,
                'laba' => $item->laba,
                'jumlah_pembeli' => $item->jumlah_pembeli,
                'produk_terlaris' => $item->produkTerlaris?->produk_nama,
                'kendala' => $item->kendala,
                'note' => $item->note,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
            ]),
            'from' => $dataHarian->firstItem(),
            'last_page' => $dataHarian->lastPage(),
            'to' => $dataHarian->lastItem(),
            'total' => $dataHarian->total(),
            'hari_libur' => $hariLibur->pluck('tanggal')->toArray(),
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
            'tanggal' => 'required|date|date_format:Y-m-d',
            'pendapatan' => 'required|numeric|min:0',
            'pengeluaran' => 'required|numeric|min:0',
            'jumlah_pembeli' => 'required|integer|min:0',
            'produk_terlaris_id' => 'nullable|exists:produk,id',
            'kendala' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ]);
        }

        // Pastikan produk_terlaris milik bisnis yang sama
        if ($request->produk_terlaris_id) {
            $produk = Product::find($request->produk_terlaris_id);
            if ($produk->bisnis_id !== $bisnis->id) {
                return $this->error('Produk tidak ditemukan', 404);
            }
        }

        if (DataHarian::where('bisnis_id', $bisnis->id)->where('tanggal', $request->tanggal)->exists()) {
            return $this->error('Data harian untuk tanggal ini sudah ada', 400);
        }

        if($request->is_libur){
            DataHarian::create([
                'bisnis_id' => $bisnis->id,
                'tanggal' => $request->tanggal,
                'is_libur' => true,
                'pendapatan' => 0,
                'pengeluaran' => 0,
                'jumlah_pembeli' => 0,
            ]);
        }

        $dataHarian = DataHarian::create([
            'bisnis_id' => $bisnis->id,
            ...$request->all()
        ]);

        $data = [
            'id' => $dataHarian->id,
            'bisnis_id' => $dataHarian->bisnis_id,
            'tanggal' => $dataHarian->tanggal,
            'pendapatan' => $dataHarian->pendapatan,
            'pengeluaran' => $dataHarian->pengeluaran,
            'laba' => $dataHarian->laba,
            'jumlah_pembeli' => $dataHarian->jumlah_pembeli,
            'produk_terlaris_id' => $dataHarian->produk_terlaris_id,
            'kendala' => $dataHarian->kendala,
            'note' => $dataHarian->note,
            'created_at' => $dataHarian->created_at,
            'updated_at' => $dataHarian->updated_at,
        ];

        return $this->success('Data harian berhasil ditambahkan', ['data' => $data], 201);
    }

    public function show(int $id)
    {
        $userId = Auth::user()->id;
        $dataHarian = DataHarian::with('produkTerlaris')->find($id);

        if (!$dataHarian) {
            return $this->error('Data harian tidak ditemukan', 404);
        }

        if ($dataHarian->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $data = [
            'id' => $dataHarian->id,
            'bisnis_id' => $dataHarian->bisnis_id,
            'tanggal' => $dataHarian->tanggal,
            'pendapatan' => $dataHarian->pendapatan,
            'pengeluaran' => $dataHarian->pengeluaran,
            'laba' => $dataHarian->laba,
            'jumlah_pembeli' => $dataHarian->jumlah_pembeli,
            'produk_terlaris' => $dataHarian->produkTerlaris?->produk_nama,
            'kendala' => $dataHarian->kendala,
            'note' => $dataHarian->note,
            'created_at' => $dataHarian->created_at,
            'updated_at' => $dataHarian->updated_at,
        ];

        return $this->success('Data harian berhasil diambil', ['data' => $data]);
    }

    public function update(Request $request, int $id)
    {
        $userId = Auth::user()->id;
        $dataHarian = DataHarian::find($id);

        if (!$dataHarian) {
            return $this->error('Data harian tidak ditemukan', 404);
        }

        if ($dataHarian->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $validate = Validator::make($request->all(), [
            'tanggal' => 'date|date_format:Y-m-d',
            'pendapatan' => 'numeric|min:0',
            'pengeluaran' => 'numeric|min:0',
            'jumlah_pembeli' => 'integer|min:0',
            'produk_terlaris_id' => 'nullable|exists:produk,id',
            'kendala' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ]);
        }

        $dataHarian->update($request->all());

        $data = [
            'id' => $dataHarian->id,
            'bisnis_id' => $dataHarian->bisnis_id,
            'tanggal' => $dataHarian->tanggal,
            'pendapatan' => $dataHarian->pendapatan,
            'pengeluaran' => $dataHarian->pengeluaran,
            'laba' => $dataHarian->laba,
            'jumlah_pembeli' => $dataHarian->jumlah_pembeli,
            'produk_terlaris_id' => $dataHarian->produk_terlaris_id,
            'kendala' => $dataHarian->kendala,
            'note' => $dataHarian->note,
            'created_at' => $dataHarian->created_at,
            'updated_at' => $dataHarian->updated_at,
        ];

        return $this->success('Data harian berhasil diupdate', ['data' => $data]);
    }

    public function destroy(int $id)
    {
        $userId = Auth::user()->id;
        $dataHarian = DataHarian::find($id);

        if (!$dataHarian) {
            return $this->error('Data harian tidak ditemukan', 404);
        }

        if ($dataHarian->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $dataHarian->delete();
        return $this->success('Data harian berhasil dihapus');
    }

    // Ringkasan statistik untuk keperluan analisa AI
    public function summary(Request $request)
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $validate = Validator::make($request->all(), [
            'dari' => 'required|date|date_format:Y-m-d',
            'sampai' => 'required|date|date_format:Y-m-d|after_or_equal:dari',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ]);
        }

        $dataHarian = DataHarian::where('bisnis_id', $bisnis->id)
            ->periodeEvaluasi($request->dari, $request->sampai)
            ->with('produkTerlaris')
            ->get();

        if ($dataHarian->isEmpty()) {
            return $this->error('Tidak ada data pada periode ini', 404);
        }

        $totalPendapatan = $dataHarian->sum('pendapatan');
        $totalPengeluaran = $dataHarian->sum('pengeluaran');
        $totalPembeli = $dataHarian->sum('jumlah_pembeli');
        $totalHari = $dataHarian->count();

        // Produk terlaris paling sering muncul
        $produkTerlaris = $dataHarian
            ->whereNotNull('produk_terlaris_id')
            ->groupBy('produk_terlaris_id')
            ->map(fn($group) => [
                'produk_nama' => $group->first()->produkTerlaris?->produk_nama,
                'jumlah_hari' => $group->count(),
            ])
            ->sortByDesc('jumlah_hari')
            ->first();

        $data = [
            'periode' => [
                'dari' => $request->dari,
                'sampai' => $request->sampai,
                'total_hari' => $totalHari,
            ],
            'total_pendapatan' => $totalPendapatan,
            'total_pengeluaran' => $totalPengeluaran,
            'total_laba' => $totalPendapatan - $totalPengeluaran,
            'rata_rata_pendapatan' => round($totalPendapatan / $totalHari, 2),
            'rata_rata_pembeli' => round($totalPembeli / $totalHari, 2),
            'produk_terlaris' => $produkTerlaris,
            'kendala' => $dataHarian->whereNotNull('kendala')->pluck('kendala')->values(),
        ];

        return $this->success('Summary data harian berhasil diambil', ['data' => $data]);
    }
}