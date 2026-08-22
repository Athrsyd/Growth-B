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
            'bisnis_buka' => 'required|date_format:H:i',
            'bisnis_tutup' => 'required|date_format:H:i',
            'jumlah_pegawai' => 'integer|required|min:1|nullable',
            'target_market' => 'string|required',
            'tujuan_bisnis' => 'required',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ], 422);
        };

        $bisnis = Bisnis::create([
            'user_id' => $userId,
            ...$request->all()
        ]);

        $memberToken = Str::random(32);
        $bisnis->member_token = $memberToken;

        $bisnis->save();

        $data = [
            'id'             => $bisnis->id,
            'bisnis_nama'    => $bisnis->bisnis_nama,
            'bisnis_tipe'    => $bisnis->bisnis_tipe,
            'bisnis_mulai'   => $bisnis->bisnis_mulai,
            'bisnis_buka'    => $bisnis->bisnis_buka,
            'bisnis_tutup'   => $bisnis->bisnis_tutup,
            'jumlah_pegawai' => $bisnis->jumlah_pegawai,
            'target_market'  => $bisnis->target_market,
            'tujuan_bisnis'  => $bisnis->tujuan_bisnis,
            'member_token'   => $bisnis->member_token,
        ];

        return $this->success('UMKM berhasil terdaftar', ['data' => $data]);
    }

    public function GenerateQR(string $token)
    {

        $bisnis = Bisnis::where('member_token', $token)->first();

        if (!$bisnis) {
            return $this->error('data tidak di temukan ', 404);
        }

        if ($bisnis->user_id !== Auth::user()->id) {
            return $this->error('Akses Dilarang', 403);
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

    /**
     * Sajikan konten SVG QR langsung lewat Laravel (bukan file statis /storage),
     * supaya middleware CORS bawaan Laravel (config/cors.php) ikut berlaku.
     * File statis di /storage disajikan langsung oleh web server dan tidak pernah
     * melewati Laravel, sehingga tidak pernah dapat header Access-Control-Allow-Origin.
     */
    public function qrImage(string $token)
    {
        $bisnis = Bisnis::where('member_token', $token)->first();

        if (!$bisnis) {
            return $this->error('data tidak di temukan ', 404);
        }

        if ($bisnis->user_id !== Auth::user()->id) {
            return $this->error('Akses Dilarang', 403);
        }

        $filename = "qr/bisnis_{$bisnis->id}.svg";

        if (!Storage::disk('public')->exists($filename)) {
            return $this->error('QR belum digenerate, panggil endpoint generate terlebih dahulu', 404);
        }

        $svg = Storage::disk('public')->get($filename);

        return response($svg, 200)
            ->header('Content-Type', 'image/svg+xml')
            ->header('Cache-Control', 'no-store');
    }

    public function update(Request $request, string $id)
    {
        $bisnis = Bisnis::where('id', $id)->first();
        $userId = Auth::user()->id;

        if (!$bisnis) {
            return $this->error('data tidak di temukan ', 404);
        }

        if ($bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $validate = Validator::make($request->all(), [
            'bisnis_nama' => 'string|required',
            'bisnis_tipe' => 'string|required|in:barang,jasa',
            'bisnis_mulai' => 'date|required|date_format:Y-m-d',
            'bisnis_buka' => 'required|date_format:H:i',
            'bisnis_tutup' => 'required|date_format:H:i',
            'jumlah_pegawai' => 'integer|required|min:1|nullable',
            'target_market' => 'string|required',
            'tujuan_bisnis' => 'required',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ], 422);
        };

        $bisnis->update([
            'user_id' => $userId,
            ...$request->all()
        ]);

        $data = [
            'id'               => $bisnis->id,
            'bisnis_nama'      => $bisnis->bisnis_nama,
            'bisnis_tipe'      => $bisnis->bisnis_tipe,
            'bisnis_mulai'     => $bisnis->bisnis_mulai,
            'bisnis_buka'      => $bisnis->bisnis_buka,
            'bisnis_tutup'     => $bisnis->bisnis_tutup,
            'jumlah_pegawai'   => $bisnis->jumlah_pegawai,
            'target_market'    => $bisnis->target_market,
            'tujuan_bisnis'    => $bisnis->tujuan_bisnis,
            'reward_threshold' => $bisnis->reward_threshold,
            'member_token'     => $bisnis->member_token,
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