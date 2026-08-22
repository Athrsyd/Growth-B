<?php

namespace App\Http\Controllers;

use App\Models\Bisnis;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class MemberController extends Controller
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

        $members = Member::where('bisnis_id', $bisnis->id)
            ->latest()
            ->paginate($per_page, ['*'], 'page', $page);

        $data = [
            'currentPage' => $members->currentPage(),
            'data' => $members->map(fn($item) => [
                'id' => $item->id,
                'bisnis_id' => $item->bisnis_id,
                'member_phone' => $item->member_phone,
                'member_count' => $item->member_count,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
            ]),
            'from' => $members->firstItem(),
            'last_page' => $members->lastPage(),
            'to' => $members->lastItem(),
            'total' => $members->total(),
        ];

        return $this->success('Data member berhasil diambil', $data);
    }

    // Dipanggil saat pelanggan scan QR code (tidak butuh auth)
    public function scan(string $token)
    {
        $bisnis = Bisnis::where('member_token', $token)->first();

        if (!$bisnis) {
            return $this->error('QR tidak valid', 404);
        }

        return $this->success('QR valid', [
            'data' => [
                'bisnis_id' => $bisnis->id,
                'bisnis_nama' => $bisnis->bisnis_nama,
                'member_token' => $token,
            ]
        ]);
    }

    // Dipanggil saat pelanggan submit nomor HP setelah scan QR
    public function checkin(Request $request, string $token)
    {
        $bisnis = Bisnis::where('member_token', $token)->first();

        if (!$bisnis) {
            return $this->error('QR tidak valid', 404);
        }

        $validate = Validator::make($request->all(), [
            'member_phone' => 'required|string|max:20',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ], 422);
        }

        $member = Member::where('bisnis_id', $bisnis->id)
            ->where('member_phone', $request->member_phone)
            ->first();

            $lastCheckin = $member ? $member->updated_at : null;

            // minimmal 1 hari antara check-in sebelumnya dan check-in saat ini
            if( $lastCheckin && now()->diffInDays($lastCheckin) < 1) {
                return $this->error('Anda sudah melakukan check-in hari ini. Silakan coba lagi besok.', 429);
            }

        if ($member) {
            $member->tambahKunjungan();
        } else {
            $member = Member::create([
                'bisnis_id' => $bisnis->id,
                'member_phone' => $request->member_phone,
                'member_count' => 1,
            ]);
        }

        // Cek kelayakan reward hanya jika user sudah mengatur threshold
        $rewardInfo = null;
        if ($bisnis->reward_threshold !== null) {
            $rewardInfo = [
                'is_eligible' => $member->member_count >= $bisnis->reward_threshold,
                'kunjungan_saat_ini' => $member->member_count,
                'kunjungan_dibutuhkan' => $bisnis->reward_threshold,
            ];
        }

        $data = [
            'member_phone' => $member->member_phone,
            'member_count' => $member->member_count,
            'reward' => $rewardInfo,
        ];

        return $this->success('Check-in berhasil', ['data' => $data]);
    }

    public function show(int $id)
    {
        $userId = Auth::user()->id;
        $member = Member::find($id);

        if (!$member) {
            return $this->error('Member tidak ditemukan', 404);
        }

        if ($member->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $bisnis = $member->bisnis;

        $data = [
            'id' => $member->id,
            'bisnis_id' => $member->bisnis_id,
            'member_phone' => $member->member_phone,
            'member_count' => $member->member_count,
            'reward' => $bisnis->reward_threshold !== null ? [
                'is_eligible' => $member->member_count >= $bisnis->reward_threshold,
                'kunjungan_saat_ini' => $member->member_count,
                'kunjungan_dibutuhkan' => $bisnis->reward_threshold,
            ] : null,
            'created_at' => $member->created_at,
            'updated_at' => $member->updated_at,
        ];

        return $this->success('Data member berhasil diambil', ['data' => $data]);
    }

    public function destroy(int $id)
    {
        $userId = Auth::user()->id;
        $member = Member::find($id);

        if (!$member) {
            return $this->error('Member tidak ditemukan', 404);
        }

        if ($member->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $member->delete();
        return $this->success('Member berhasil dihapus');
    }

    // Daftar member yang layak dapat reward (butuh reward_threshold sudah diatur)
    public function eligibleReward()
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        // Blok fitur jika threshold belum diatur
        if ($bisnis->reward_threshold === null) {
            return $this->error(
                'Fitur reward belum diaktifkan. Silakan atur reward_threshold di pengaturan bisnis terlebih dahulu.',
                422
            );
        }

        $members = Member::where('bisnis_id', $bisnis->id)
            ->where('member_count', '>=', $bisnis->reward_threshold)
            ->latest()
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'member_phone' => $item->member_phone,
                'member_count' => $item->member_count,
            ]);

        return $this->success('Data member eligible reward berhasil diambil', [
            'reward_threshold' => $bisnis->reward_threshold,
            'total' => $members->count(),
            'data' => $members,
        ]);
    }

    // User mengatur threshold reward di bisnis mereka
    public function setRewardThreshold(Request $request)
    {
        $userId = Auth::user()->id;
        $bisnis = Bisnis::where('user_id', $userId)->first();

        if (!$bisnis) {
            return $this->error('Bisnis tidak ditemukan', 404);
        }

        $validate = Validator::make($request->all(), [
            'reward_threshold' => 'required|integer|min:1',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ], 422);
        }

        $bisnis->update(['reward_threshold' => $request->reward_threshold]);

        return $this->success('Reward threshold berhasil diatur', [
            'data' => ['reward_threshold' => $bisnis->reward_threshold]
        ]);
    }
}