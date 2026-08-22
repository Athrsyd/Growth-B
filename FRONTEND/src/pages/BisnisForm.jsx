import { useState, useRef } from "react";
import api from "../api/axios";
import { LuTrendingUp, LuTrendingDown, LuTrophy, LuUsers, LuCheck } from "react-icons/lu";

function GoalIcon({ name }) {
  if (name === "trending_up")   return <LuTrendingUp  size={18} />;
  if (name === "trending_down") return <LuTrendingDown size={18} />;
  if (name === "trophy")        return <LuTrophy       size={18} />;
  if (name === "users")         return <LuUsers        size={18} />;
  return null;
}

// ─── Konstanta ────────────────────────────────────────────────
const TUJUAN_OPTIONS = [
  "menaikkan omset",
  "menambah pelanggan tetap",
  "mengurangi biaya operasional",
  "Meningkatkan keuntungan",
];
const STEPS = ["Info Bisnis", "Jam & Tim", "Target", "Produk", "Selesai"];


// ─── Sub-components ───────────────────────────────────────────
function StepIndicator({ current, steps }) {
  return (
 <div className="w-full mb-8 px-1">
 
      {/* Row 1 — Dots + connectors */}
      <div className="flex items-center w-full">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`flex items-center ${i < steps.length - 1 ? "flex-1" : "flex-none"}`}
          >
            {/* Dot */}
            <div className={`
              shrink w-7 h-7 rounded-full
              flex items-center justify-center
              text-xs font-bold transition-all duration-300
              ${i < current  ? "bg-[#16A34A] text-white shadow-sm shadow-[#BBF7D0]" : ""}
              ${i === current ? "bg-[#22C55E] text-white ring-4 ring-[#DCFCE7]" : ""}
              ${i > current  ? "bg-gray-100 text-gray-400" : ""}
            `}>
              {i < current
                ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                : i + 1
              }
            </div>
 
            {/* Connector */}
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${i < current ? "bg-[#4ADE80]" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>
 
      {/* Row 2 — Labels (grid agar tepat di bawah dot) */}
      <div
        className="mt-2 grid w-full gap-20"
        style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
      >
        {steps.map((label, i) => (
          <span
            key={i}
            className={`
              block text-center text-xs font-medium leading-tight px-0.5 truncate
              transition-colors duration-200
              ${i < current  ? "text-[#22C55E]" : ""}
              ${i === current ? "text-[#15803D]" : ""}
              ${i > current  ? "text-gray-300 hidden sm:block" : ""}
            `}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Field({ label, error, required, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Input({ error, ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none
        ${error ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200" : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#DCFCE7]"}`}
    />
  );
}

function NavButtons({ onBack, onNext, loading, nextLabel = "Lanjut", showBack = true }) {
  return (
    <div className="flex justify-between pt-6 mt-2 border-t border-gray-100">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
        >
          ← Kembali
        </button>
      ) : (
        <div />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={loading}
        className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#22C55E] text-white hover:bg-[#15803D] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
        {nextLabel}
        {!loading && nextLabel !== "Selesai" && <span>→</span>}
      </button>
    </div>
  );
}

// ─── Step 1: Info Bisnis ───────────────────────────────────────
function StepInfoBisnis({ data, onChange, errors }) {
  return (
    <div className="space-y-5">
      <Field label="Nama Bisnis" required error={errors.bisnis_nama}>
        <Input
          value={data.bisnis_nama}
          onChange={(e) => onChange("bisnis_nama", e.target.value)}
          placeholder="Contoh: Warung Makan Bu Sari"
          error={errors.bisnis_nama}
        />
      </Field>

      <Field label="Tipe Bisnis" required error={errors.bisnis_tipe}>
        <div className="grid grid-cols-2 gap-3">
          {["barang", "jasa"].map((tipe) => (
            <button
              key={tipe}
              type="button"
              onClick={() => onChange("bisnis_tipe", tipe)}
              className={`py-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                data.bisnis_tipe === tipe
                  ? "border-[#22C55E] bg-[#F0FDF4] text-[#15803D]"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {tipe === "barang" ? "Barang" : "Jasa"}
            </button>
          ))}
        </div>
        {errors.bisnis_tipe && <p className="mt-1 text-xs text-red-500">{errors.bisnis_tipe}</p>}
      </Field>

      <Field label="Tanggal Mulai Bisnis" required error={errors.bisnis_mulai} hint="Digunakan sebagai titik awal siklus analisa 14 hari">
        <Input
          type="date"
          value={data.bisnis_mulai}
          onChange={(e) => onChange("bisnis_mulai", e.target.value)}
          error={errors.bisnis_mulai} 
        />
      </Field>

      <Field label="Target Market" required error={errors.target_market} hint="Siapa pelanggan utama bisnis kamu?">
        <Input
          value={data.target_market}
          onChange={(e) => onChange("target_market", e.target.value)}
          placeholder="Contoh: Pelajar dan karyawan sekitar kawasan industri"
          error={errors.target_market}
        />
      </Field>
    </div>
  );
}

// ─── Step 2: Jam & Tim ─────────────────────────────────────────
function StepJamTim({ data, onChange, errors }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Jam Buka" required error={errors.bisnis_buka}>
          <Input
            type="time"
            value={data.bisnis_buka}
            onChange={(e) => onChange("bisnis_buka", e.target.value)}
            error={errors.bisnis_buka}
          />
        </Field>
        <Field label="Jam Tutup" required error={errors.bisnis_tutup}>
          <Input
            type="time"
            value={data.bisnis_tutup}
            onChange={(e) => onChange("bisnis_tutup", e.target.value)}
            error={errors.bisnis_tutup}
          />
        </Field>
      </div>

      <Field label="Jumlah Pegawai" required error={errors.jumlah_pegawai} hint="Termasuk kamu sebagai pemilik">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange("jumlah_pegawai", Math.max(1, (data.jumlah_pegawai || 1) - 1))}
            className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-600 text-lg font-bold hover:border-[#86EFAC] hover:text-[#15803D] transition-all shrink-0"
          >
            −
          </button>
          <div className="flex-1 text-center py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xl font-bold text-gray-800">
            {data.jumlah_pegawai || 1}
          </div>
          <button
            type="button"
            onClick={() => onChange("jumlah_pegawai", (data.jumlah_pegawai || 1) + 1)}
            className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-600 text-lg font-bold hover:border-[#86EFAC] hover:text-[#15803D] transition-all shrink-0"
          >
            +
          </button>
        </div>
        {errors.jumlah_pegawai && <p className="mt-1 text-xs text-red-500">{errors.jumlah_pegawai}</p>}
      </Field>
    </div>
  );
}

// ─── Step 3: Target Bisnis ─────────────────────────────────────
function StepTarget({ data, onChange, errors }) {
  const toggle = (val) => {
    const current = data.tujuan_bisnis || [];
    const next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val];
    onChange("tujuan_bisnis", next);
  };

  const icons = {
    "menaikkan omset": "trending_up",
    "menambah pelanggan tetap": "users",
    "mengurangi biaya operasional": "trending_down",
    "Meningkatkan keuntungan": "trophy",
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Pilih satu atau lebih tujuan bisnis kamu saat ini.</p>
      {errors.tujuan_bisnis && <p className="text-xs text-red-500">{errors.tujuan_bisnis}</p>}
      <div className="grid grid-cols-1 gap-3">
        {TUJUAN_OPTIONS.map((tujuan) => {
          const selected = (data.tujuan_bisnis || []).includes(tujuan);
          return (
            <button
              key={tujuan}
              type="button"
              onClick={() => toggle(tujuan)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                selected
                  ? "border-[#22C55E] bg-[#F0FDF4]"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <GoalIcon name={icons[tujuan]} />
              <span className={`text-sm font-medium capitalize ${selected ? "text-[#15803D]" : "text-gray-600"}`}>
                {tujuan}
              </span>
              {selected && (
                <div className="ml-auto w-5 h-5 rounded-full bg-[#F0FDF4]0 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 4: Produk ────────────────────────────────────────────
function StepProduk({ produk, onAdd, onRemove, onChange, bisnisId, errors }) {
  const fileRefs = useRef({});
  const [previews, setPreviews] = useState({});

  const handleImageChange = (idx, file) => {
    if (!file) return;
    onChange(idx, "produk_image", file);
    const url = URL.createObjectURL(file);
    setPreviews((p) => ({ ...p, [idx]: url }));
  };

  const removePreview = (idx) => {
    onChange(idx, "produk_image", null);
    setPreviews((p) => {
      const next = { ...p };
      delete next[idx];
      return next;
    });
    if (fileRefs.current[idx]) fileRefs.current[idx].value = "";
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Tambahkan produk atau layanan yang kamu jual. Bisa ditambah atau diubah nanti.
      </p>

      {produk.map((p, idx) => (
        <div key={idx} className="p-4 rounded-2xl border border-gray-200 bg-gray-50 space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Produk {idx + 1}
            </span>
            {produk.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Gambar produk */}
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-[#22C55E] transition-all shrink-0 overflow-hidden"
              onClick={() => fileRefs.current[idx]?.click()}
            >
              {previews[idx] ? (
                <img src={previews[idx]} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Foto produk (opsional)</p>
              <p className="text-xs text-gray-400">Akan dipotong otomatis 1:1 · Max 2MB</p>
              <div className="flex gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => fileRefs.current[idx]?.click()}
                  className="text-xs text-[#15803D] font-medium hover:text-[#14532D]"
                >
                  {previews[idx] ? "Ganti" : "Upload"}
                </button>
                {previews[idx] && (
                  <button
                    type="button"
                    onClick={() => removePreview(idx)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={(el) => (fileRefs.current[idx] = el)}
              onChange={(e) => handleImageChange(idx, e.target.files[0])}
            />
          </div>

          <Field label="Nama Produk / Layanan" required error={errors[`produk_${idx}_nama`]}>
            <Input
              value={p.produk_nama}
              onChange={(e) => onChange(idx, "produk_nama", e.target.value)}
              placeholder="Contoh: Nasi Ayam Goreng"
              error={errors[`produk_${idx}_nama`]}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Harga (Rp)" required error={errors[`produk_${idx}_harga`]}>
              <Input
                type="number"
                min="0"
                value={p.produk_harga}
                onChange={(e) => onChange(idx, "produk_harga", e.target.value)}
                placeholder="15000"
                error={errors[`produk_${idx}_harga`]}
              />
            </Field>
            <Field label="Net Profit Margin (%)" error={errors[`produk_${idx}_npm`]} hint="Opsional">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={p.net_profit_margin}
                onChange={(e) => onChange(idx, "net_profit_margin", e.target.value)}
                placeholder="35"
                error={errors[`produk_${idx}_npm`]}
              />
            </Field>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="w-full py-3 rounded-xl border-2 border-dashed border-[#86EFAC] text-[#15803D] text-sm font-medium hover:bg-[#F0FDF4] hover:border-[#22C55E] transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Tambah Produk
      </button>
    </div>
  );
}

// ─── Step 5: Selesai ───────────────────────────────────────────
function StepSelesai({ bisnis }) {
  return (
    <div className="text-center py-6 space-y-4">
      <div className="w-20 h-20 mx-auto rounded-full bg-[#DCFCE7] flex items-center justify-center">
        <svg className="w-10 h-10 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-800">Bisnis berhasil didaftarkan!</h3>
        <p className="text-sm text-gray-500 mt-1">
          <span className="font-medium text-gray-700">{bisnis?.bisnis_nama}</span> sudah siap digunakan.
        </p>
      </div>
      <div className="bg-[#F0FDF4] rounded-2xl p-4 text-left space-y-2">
        <p className="text-xs font-semibold text-[#15803D] uppercase tracking-wide">Langkah selanjutnya</p>
        {[
          "Input data harian pertamamu",
          "Scan QR code untuk mulai kumpulkan member",
          "Pantau dashboard setiap hari",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[#BBF7D0] text-[#15803D] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-sm text-[#14532D]">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function BisnisForm({ onFinish }) {
  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [bisnisResult, setBisnisResult] = useState(null);

  const [bisnis, setBisnis] = useState({
    bisnis_nama: "",
    bisnis_tipe: "",
    bisnis_mulai: "",
    target_market: "",
    bisnis_buka: "",
    bisnis_tutup: "",
    jumlah_pegawai: 1,
    tujuan_bisnis: [],
  });

  const [produkList, setProdukList] = useState([
    { produk_nama: "", produk_harga: "", net_profit_margin: "", produk_image: null },
  ]);

  const onBisnisChange = (key, val) => {
    setBisnis((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((e) => { const n = {...e}; delete n[key]; return n; });
  };

  const onProdukChange = (idx, key, val) => {
    setProdukList((prev) => prev.map((p, i) => i === idx ? { ...p, [key]: val } : p));
    const errKey = `produk_${idx}_${key === "produk_nama" ? "nama" : key === "produk_harga" ? "harga" : "npm"}`;
    if (errors[errKey]) setErrors((e) => { const n = {...e}; delete n[errKey]; return n; });
  };

  const addProduk = () =>
    setProdukList((p) => [...p, { produk_nama: "", produk_harga: "", net_profit_margin: "", produk_image: null }]);

  const removeProduk = (idx) =>
    setProdukList((p) => p.filter((_, i) => i !== idx));

  // ── Validasi per step ──────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (step === 0) {
      if (!bisnis.bisnis_nama.trim()) errs.bisnis_nama = "Nama bisnis wajib diisi";
      if (!bisnis.bisnis_tipe)        errs.bisnis_tipe  = "Pilih tipe bisnis";
      if (!bisnis.bisnis_mulai)       errs.bisnis_mulai = "Tanggal mulai wajib diisi";
      if (!bisnis.target_market.trim()) errs.target_market = "Target market wajib diisi";
    }
    if (step === 1) {
      if (!bisnis.bisnis_buka)  errs.bisnis_buka  = "Jam buka wajib diisi";
      if (!bisnis.bisnis_tutup) errs.bisnis_tutup = "Jam tutup wajib diisi";
      if (!bisnis.jumlah_pegawai || bisnis.jumlah_pegawai < 1) errs.jumlah_pegawai = "Min. 1 pegawai";
    }
    if (step === 2) {
      if (!bisnis.tujuan_bisnis.length) errs.tujuan_bisnis = "Pilih minimal satu tujuan";
    }
    if (step === 3) {
      produkList.forEach((p, i) => {
        if (!p.produk_nama.trim()) errs[`produk_${i}_nama`] = "Nama produk wajib diisi";
        if (!p.produk_harga || Number(p.produk_harga) < 0) errs[`produk_${i}_harga`] = "Harga tidak valid";
        if (p.net_profit_margin !== "" && (Number(p.net_profit_margin) < 0 || Number(p.net_profit_margin) > 100)) {
          errs[`produk_${i}_npm`] = "NPM harus antara 0–100";
        }
      });
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit bisnis ke API ───────────────────────────────────
  const submitBisnis = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/bisnis", bisnis);
      return data;
    } finally {
      setLoading(false);
    }
  };

  // ── Submit produk satu per satu ────────────────────────────
  const submitProduk = async (bisnisId) => {
    setLoading(true);
    try {
      for (const p of produkList) {
        if (!p.produk_nama.trim()) continue;
        const fd = new FormData();
        fd.append("bisnis_id", bisnisId);
        fd.append("produk_nama", p.produk_nama);
        fd.append("produk_harga", p.produk_harga);
        if (p.net_profit_margin) fd.append("net_profit_margin", p.net_profit_margin);
        if (p.produk_image)      fd.append("produk_image", p.produk_image);
        await api.post("/produk", fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Handle next per step ───────────────────────────────────
  const handleNext = async () => {
    if (!validate()) return;

    // Step 3 (produk) → submit bisnis dulu, lalu produk, lalu lanjut
    if (step === 3) {
      try {
        const result = await submitBisnis();
        const bisnisId = result?.data?.id ?? result?.id;
        setBisnisResult(result?.data ?? result);
        await submitProduk(bisnisId);
        setStep(4);
      } catch (err) {
        const apiErrors = err?.response?.data?.errors ?? {};
        const msg = err?.response?.data?.message ?? "Terjadi kesalahan, coba lagi.";
        setErrors({ ...apiErrors, _global: msg });
      }
      return;
    }

    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  // ── Render ─────────────────────────────────────────────────
  const stepTitles = [
    { title: "Info Bisnis", sub: "Ceritakan sedikit tentang bisnis kamu" },
    { title: "Jam Operasional & Tim", sub: "Kapan bisnis kamu buka dan berapa orang yang terlibat?" },
    { title: "Tujuan Bisnis", sub: "Apa yang ingin kamu capai? AI akan mengacu pada ini" },
    { title: "Daftar Produk", sub: "Produk atau layanan apa yang kamu jual?" },
    { title: "Semua Beres!", sub: "" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-[#F0FDF4]/30 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-xl lg:max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 border border-gray-200 shadow-sm mb-4">
            <div className="w-2 h-2 rounded-full bg-[#F0FDF4]0" />
            <span className="text-xs font-semibold text-gray-600 tracking-wide">GROWTHB</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{stepTitles[step].title}</h1>
          {stepTitles[step].sub && (
            <p className="text-sm text-gray-400 mt-1">{stepTitles[step].sub}</p>
          )}
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} steps={STEPS} />

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#DCFCE7]/40 border border-gray-100 overflow-hidden">

          {/* Desktop two-col layout */}
          <div className="flex flex-col lg:flex-row">

            {/* Left: step progress (desktop sidebar) */}
            <div className="hidden lg:flex flex-col gap-1 w-56 shrink-0 bg-gray-50 border-r border-gray-100 p-6 pt-8">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Langkah</p>
              {STEPS.map((label, i) => {
                const done = i < step
                const active = i === step
                return (
                  <div key={i} className="flex items-start gap-3 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-all duration-300 ${
                      done ? 'bg-[#22C55E] text-white' : active ? 'bg-[#F0FDF4] border-2 border-[#22C55E] text-[#15803D]' : 'bg-white border-2 border-gray-200 text-gray-400'
                    }`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold leading-snug transition-colors duration-300 ${active ? 'text-[#15803D]' : done ? 'text-gray-400' : 'text-gray-400'}`}>
                        {label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right: form content */}
            <div className="flex-1 p-6 sm:p-8">
              {errors._global && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                  {errors._global}
                </div>
              )}

              {step === 0 && <StepInfoBisnis data={bisnis} onChange={onBisnisChange} errors={errors} />}
              {step === 1 && <StepJamTim data={bisnis} onChange={onBisnisChange} errors={errors} />}
              {step === 2 && <StepTarget data={bisnis} onChange={onBisnisChange} errors={errors} />}
              {step === 3 && (
                <StepProduk
                  produk={produkList}
                  onAdd={addProduk}
                  onRemove={removeProduk}
                  onChange={onProdukChange}
                  errors={errors}
                />
              )}
              {step === 4 && <StepSelesai bisnis={bisnisResult} />}

              {step < 4 ? (
                <NavButtons
                  onBack={handleBack}
                  onNext={handleNext}
                  loading={loading}
                  showBack={step > 0}
                  nextLabel={step === 3 ? "Daftarkan Bisnis" : "Lanjut"}
                />
              ) : (
                <div className="pt-6 mt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => { if (onFinish) onFinish(bisnisResult); else window.location.href = '/'; }}
                    className="w-full py-3 rounded-xl bg-[#22C55E] text-white text-sm font-semibold hover:bg-[#15803D] active:scale-95 transition-all"
                  >
                    Masuk ke Dashboard →
                  </button>
                </div>
              )}
            </div>{/* /Right */}
          </div>{/* /two-col */}
        </div>{/* /Card */}

        {/* Progress text (mobile only) */}
        {step < 4 && (
          <p className="text-center text-xs text-gray-400 mt-4 lg:hidden">
            Langkah {step + 1} dari {STEPS.length - 1}
          </p>
        )}
      </div>
    </div>
  );
}