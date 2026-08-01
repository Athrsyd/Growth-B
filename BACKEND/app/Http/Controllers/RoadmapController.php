<?php

namespace App\Http\Controllers;

use App\Models\Roadmap;
use App\Models\Bisnis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class RoadmapController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->input('page', 1);
        $per_page = $request->input('per_page', 25);

        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $roadmaps = Roadmap::where('bisnis_id', $bisnis->id)
            ->latest()
            ->paginate($per_page, ['*'], 'page', $page);

        $data = [
            'currentPage' => $roadmaps->currentPage(),
            'data' => $roadmaps->map(fn($item) => $this->format($item)),
            'from' => $roadmaps->firstItem(),
            'last_page' => $roadmaps->lastPage(),
            'to' => $roadmaps->lastItem(),
            'total' => $roadmaps->total(),
        ];

        return $this->success('Data roadmap berhasil diambil', $data);
    }

    public function store(Request $request)
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $validate = Validator::make($request->all(), [
            'judul'          => 'required|string|max:255',
            'deskripsi'      => 'nullable|string',
            'target_metrik'  => 'nullable|string|max:100',
            'target_nilai'   => 'nullable|numeric|min:0',
            'target_tanggal' => 'nullable|date|date_format:Y-m-d|after:today',
            'status'         => 'nullable|in:aktif,tercapai,dibatalkan',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ]);
        }

        $roadmap = Roadmap::create([
            'bisnis_id' => $bisnis->id,
            ...$request->only(['judul', 'deskripsi', 'target_metrik', 'target_nilai', 'target_tanggal', 'status'])
        ]);

        return $this->success('Roadmap berhasil dibuat', ['data' => $this->format($roadmap)], 201);
    }

    public function show(int $id)
    {
        $userId = Auth::user()->id;
        $roadmap = Roadmap::find($id);

        if (!$roadmap) {
            return $this->error('Roadmap tidak ditemukan', 404);
        }

        if ($roadmap->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        return $this->success('Roadmap berhasil diambil', ['data' => $this->format($roadmap)]);
    }

    public function update(Request $request, int $id)
    {
        $userId = Auth::user()->id;
        $roadmap = Roadmap::find($id);

        if (!$roadmap) {
            return $this->error('Roadmap tidak ditemukan', 404);
        }

        if ($roadmap->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $validate = Validator::make($request->all(), [
            'judul'          => 'string|max:255',
            'deskripsi'      => 'nullable|string',
            'target_metrik'  => 'nullable|string|max:100',
            'target_nilai'   => 'nullable|numeric|min:0',
            'target_tanggal' => 'nullable|date|date_format:Y-m-d',
            'status'         => 'nullable|in:aktif,tercapai,dibatalkan',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ]);
        }

        $roadmap->update(
            $request->only(['judul', 'deskripsi', 'target_metrik', 'target_nilai', 'target_tanggal', 'status'])
        );

        return $this->success('Roadmap berhasil diupdate', ['data' => $this->format($roadmap)]);
    }

    public function destroy(int $id)
    {
        $userId = Auth::user()->id;
        $roadmap = Roadmap::find($id);

        if (!$roadmap) {
            return $this->error('Roadmap tidak ditemukan', 404);
        }

        if ($roadmap->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $roadmap->delete();
        return $this->success('Roadmap berhasil dihapus');
    }

    private function format(Roadmap $item): array
    {
        return [
            'id'             => $item->id,
            'bisnis_id'      => $item->bisnis_id,
            'judul'          => $item->judul,
            'deskripsi'      => $item->deskripsi,
            'target_metrik'  => $item->target_metrik,
            'target_nilai'   => $item->target_nilai,
            'target_tanggal' => $item->target_tanggal?->toDateString(),
            'status'         => $item->status,
            'created_at'     => $item->created_at,
            'updated_at'     => $item->updated_at,
        ];
    }
}
