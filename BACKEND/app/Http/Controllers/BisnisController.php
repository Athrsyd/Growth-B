<?php

namespace App\Http\Controllers;

use App\Models\Bisnis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;


class BisnisController extends Controller
{

    public function store(Request $request)
    {
        $userId = Auth::user()->id;
        $validate = Validator::make($request->all(), [
            'bisnis_nama' => 'string|required',
            'bisnis_tipe' => 'string|required|in:barang,jasa',
            'bisnis_mulai' => 'date|required|date_format:Y-m-d',
            'bisnis_buka' => 'time|required',
            'bisnis_tutup' => 'time|required',
            'jumlah_pegawai' => 'integer|required|min:1|nullable',
            'target_market' => 'string|required',
            'tujuan_bisnis' => 'required',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ]);
        };

        $bisnis = Bisnis::create([
            'user_id' => $userId,
            ...$request->all()
        ]);

        $memberToken = Str::random(32);
        $bisnis->member_token = $memberToken;

        $bisnis->save();

        $data = [
            'bisnis_nama' => $bisnis->bisnis_nama,
            'bisnis_tipe' => $bisnis->bisnis_tipe,
            'bisnis_mulai' => $bisnis->bisnis_mulai,
            'bisnis_buka' => $bisnis->bisnis_buka,
            'bisnis_tutup' => $bisnis->bisnis_tutup,
            'jumlah_pegawai' => $bisnis->jumlah_pegawai,
            'target_market' => $bisnis->target_market,
            'tujuan_bisnis' => $bisnis->tujuan_bisnis,
        ];

        return $this->success('UMKM berhasil terdaftar', ['data' => $data]);
    }

    public function GenerateQR(string $token)
    {

        $bisnis = Bisnis::where('member_token', $token)->first();

        if (!$bisnis) {
            return $this->error('data tidak di temukan ', 404);
        }
        $pathWeb = "http://localhost:5173/input-member/$token";

        $svg = QrCode::format('svg')
            ->size(300)
            ->generate($pathWeb);

        // Simpan ke storage/app/public/qr/
        $filename = "qr/bisnis_{$bisnis->id}.svg";
        Storage::disk('public')->put($filename, $svg);

        // Simpan URL-nya ke DB
        $bisnis->update([
            'QR_image_url' => Storage::url($filename)
        ]);

        return response()->json([
            'qr_url' => Storage::url($filename)
        ]);
    }

    public function update(Request $request, string $id)
    {
        $bisnis = Bisnis::where('id', $id)->first();
        $userId = Auth::user()->id;
        if ($bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        if (!$bisnis) {
            return $this->error('data tidak di temukan ', 404);
        }

        $validate = Validator::make($request->all(), [
            'bisnis_nama' => 'string|required',
            'bisnis_tipe' => 'string|required|in:barang,jasa',
            'bisnis_mulai' => 'date|required|date_format:Y-m-d',
            'bisnis_buka' => 'time|required',
            'bisnis_tutup' => 'time|required',
            'jumlah_pegawai' => 'integer|required|min:1|nullable',
            'target_market' => 'string|required',
            'tujuan_bisnis' => 'required',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ]);
        };

        $bisnis->update([
            'user_id' => $userId,
            ...$request->all()
        ]);

        $data = [
            'bisnis_nama' => $bisnis->bisnis_nama,
            'bisnis_tipe' => $bisnis->bisnis_tipe,
            'bisnis_mulai' => $bisnis->bisnis_mulai,
            'bisnis_buka' => $bisnis->bisnis_buka,
            'bisnis_tutup' => $bisnis->bisnis_tutup,
            'jumlah_pegawai' => $bisnis->jumlah_pegawai,
            'target_market' => $bisnis->target_market,
            'tujuan_bisnis' => $bisnis->tujuan_bisnis,
        ];

        return $this->success('UMKM berhasil di edit', ['data' => $data]);
    }

    public function show(int $id)
    {
        $bisnis = Bisnis::where('id', $id)->first();
        $userId = Auth::user()->id;

        if (!$bisnis) {
            return $this->error('data tidak di temukan ', 404);
        }

        if ($bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        return $this->success('data bisnis didapatkan', ['data' => $bisnis]);
    }

}
