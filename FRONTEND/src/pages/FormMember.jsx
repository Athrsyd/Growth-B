import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { LuStore, LuGift, LuStar, LuPartyPopper, LuUser } from "react-icons/lu";
import templateImg from "../assets/template_qr.png";

// ─── Helpers ──────────────────────────────────────────────────
function formatPhone(val) {
  // Hapus semua non-digit
  const digits = val.replace(/\D/g, "");
  // Format: 08xx-xxxx-xxxx
  if (digits.length <= 4) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 13)}`;
}

function rawPhone(formatted) {
  return formatted.replace(/\D/g, "");
}

// ─── State machine: idle → loading → success → idle ──────────
// ─── Page ─────────────────────────────────────────────────────
export default function FormMember() {
  const { token } = useParams();
  const [bisnisNama, setBisnisNama] = useState("");
  const [tokenValid, setTokenValid] = useState(true);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setError("");
    setPhone(formatPhone(e.target.value));
  };

  // Scan token saat mount → ambil nama bisnis
  useEffect(() => {
    if (!token) return;
    api.get(`/member/scan/${token}`)
      .then(({ data }) => setBisnisNama(data.data.bisnis_nama ?? ""))
      .catch(() => setTokenValid(false));
  }, [token]);

  const validate = () => {
    const digits = rawPhone(phone);
    if (!digits) return "Nomor HP wajib diisi";
    if (digits.length < 9 || digits.length > 13) return "Nomor HP tidak valid";
    if (!digits.startsWith("08") && !digits.startsWith("628"))
      return "Gunakan format nomor Indonesia (08xx / 628xx)";
    return "";
  };

  const handleSubmit = async () => {

    const err = validate();
    if (err) { setError(err); return; }
    setError("");

    setStatus("loading");
    try {
      const res = await api.post(`/member/checkin/${token}`, {
        member_phone: rawPhone(phone),
      });
      setResult(res.data.data);
      setStatus("success");
    } catch (error) {
      setError(error.response?.data?.message || "Terjadi kesalahan. Coba lagi.");
      setStatus("idle");
    }
  };

  const handleReset = () => {
    setPhone("");
    setError("");
    setResult(null);
    setStatus("idle");
  };

  const progress = result?.reward
    ? Math.min((result.reward.kunjungan_saat_ini / result.reward.kunjungan_dibutuhkan) * 100, 100)
    : 0;

  // ── Render ────────────────────────────────────────────────
  if (!tokenValid) return (
    <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-lg font-bold text-gray-700 mb-2">QR tidak valid</p>
        <p className="text-sm text-gray-400">Link ini sudah kedaluwarsa atau tidak ditemukan.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F0FDF4] via-white to-white flex flex-col">

      {/* ── Header branding ── */}
      <div className="flex items-center flex-row-reverse justify-between px-8 pt-10 pb-6">
        <div className="flex flex-col items-end">
          <p className="text-xs font-bold text-[#16A34A] tracking-widest uppercase">Growth-B</p>
          <p className="text-xs text-gray-400 mt-0.5">Membership System</p>
        </div>
        <div className="w-9 h-9">
          {/* Logo B */}
          <img src="/logo.svg" alt="" />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <div className="w-full max-w-sm">

          {status !== "success" ? (
            /* ── Form state ── */
            <>
              {/* Ilustrasi */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-[#DCFCE7] flex items-center justify-center">
                    <LuUser size={40} className="text-[#16A34A]" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-[#16A34A] flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Judul */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Daftar Member</h1>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  Masukkan nomor HP kamu untuk<br />mencatat kunjungan hari ini
                </p>
                <p className="text-sm font-semibold text-[#16A34A] mt-1">{bisnisNama}</p>
              </div>

              {/* Input nomor HP */}
              <div className="mb-3">
                <div className={`flex items-center gap-3 bg-white border-2 rounded-2xl px-4 py-3.5 transition-all shadow-sm ${error ? "border-red-300" : "border-gray-200 focus-within:border-[#22C55E] focus-within:shadow-[#DCFCE7] focus-within:shadow-md"
                  }`}>
                  {/* Flag + kode negara */}
                  <div className="flex items-center gap-1.5 shrink-0 border-r border-gray-100 pr-3">
                    <span className="text-xs font-black text-[#16A34A] bg-[#F0FDF4] border border-[#DCFCE7] rounded px-1.5 py-0.5">ID</span>
                    <span className="text-sm font-semibold text-gray-500">+62</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={handleChange}
                    placeholder="08xx-xxxx-xxxx"
                    maxLength={14}
                    className="flex-1 text-base font-semibold text-gray-800 outline-none bg-transparent placeholder-gray-300"
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  />
                  {phone && (
                    <button onClick={() => { setPhone(""); setError(""); }}
                      className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {error && (
                  <p className="mt-2 text-xs text-red-500 font-medium flex items-center gap-1.5 px-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {error}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="w-full py-4 rounded-2xl bg-[#22C55E] text-white text-sm font-bold shadow-sm shadow-[#BBF7D0] hover:bg-[#15803D] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
              >
                {status === "loading" ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Memproses…
                  </>
                ) : (
                  <>
                    Catat Kunjungan
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>

              {/* Info */}
              <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed px-4">
                Nomor HP kamu hanya digunakan untuk mencatat kunjungan dan tidak akan dibagikan ke pihak lain.
              </p>
            </>

          ) : (
            /* ── Success state ── */
            <>
              {/* Animasi checkmark */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  {/* Lingkaran luar pulse */}
                  <div className="absolute inset-0 rounded-full bg-[#DCFCE7] animate-ping opacity-40 scale-110" />
                  <div className="w-24 h-24 rounded-full bg-[#22C55E] flex items-center justify-center shadow-lg shadow-[#BBF7D0] relative">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Pesan sukses */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-gray-900">Kunjungan Tercatat!</h1>
                <p className="text-sm text-gray-400 mt-2">
                  Terima kasih sudah berkunjung ke
                </p>
                <p className="text-sm font-bold text-[#16A34A] mt-0.5">{bisnisNama}</p>
              </div>

              {/* Card info kunjungan */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-4">
                {/* Kunjungan ke-N */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Kunjungan kamu ke-</p>
                    <p className="text-4xl font-black text-gray-900 mt-0.5">{result.member_count}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${result.reward?.is_eligible ? "bg-yellow-100" : "bg-[#F0FDF4]"
                    }`}>
                    {result.reward?.is_eligible ? <LuGift size={24} className="text-yellow-600" /> : <LuStar size={24} className="text-[#16A34A]" />}
                  </div>
                </div>

                {result.reward ? (
                  <>
                    {/* Progress bar reward */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-400 font-medium">Progress reward</span>
                        <span className="font-bold text-gray-600">
                          {result.reward.kunjungan_saat_ini}/{result.reward.kunjungan_dibutuhkan} kunjungan
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${result.reward.is_eligible ? "bg-yellow-400" : "bg-[#22C55E]"
                            }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Status reward */}
                    {result.reward.is_eligible ? (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 text-center">
                        <p className="text-sm font-bold text-yellow-700 flex items-center justify-center gap-1.5"><LuPartyPopper size={14} /> Kamu layak dapat reward!</p>
                        <p className="text-xs text-yellow-600 mt-0.5">Tunjukkan halaman ini ke kasir</p>
                      </div>
                    ) : (
                      <div className="mt-3 bg-[#F0FDF4] rounded-2xl px-4 py-3 text-center">
                        <p className="text-xs text-[#15803D] font-medium">
                          Butuh <strong>{result.reward.kunjungan_dibutuhkan - result.reward.kunjungan_saat_ini} kunjungan lagi</strong> untuk dapat reward
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-1 bg-[#F0FDF4] rounded-2xl px-4 py-3 text-center">
                    <p className="text-xs text-[#15803D] font-medium">Terima kasih! Kunjungan kamu sudah tercatat.</p>
                  </div>
                )}
              </div>

              {/* Tombol kembali */}
              <button
                onClick={handleReset}
                className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all"
              >
                Selesai
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="pb-8 text-center">
        <p className="text-xs text-gray-300 font-medium">Powered by Growth-B</p>
      </div>
    </div>
  );
}