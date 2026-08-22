import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { LuZap, LuRocket, LuTriangleAlert, LuCheck, LuLightbulb } from "react-icons/lu";

// ─── Helpers ──────────────────────────────────────────────────
const fmt     = (v) => new Intl.NumberFormat("id-ID").format(v);
const fmtDate = (s) => new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
const fmtTime = (s) => new Date(s).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

const TIPE_CONFIG = {
  produk: {
    label: "Harga Produk",
    emoji: "🏷️",
    desc: "Simulasi naik/turun harga",
  },
  biaya: {
    label: "Biaya Operasional",
    emoji: "💸",
    desc: "Simulasi perubahan pengeluaran",
  },
  jam_operasional: {
    label: "Jam Buka",
    emoji: "🕐",
    desc: "Simulasi perubahan jam operasional",
  },
};

const TIPE_ICON_MAP = {
  produk: "🏷️",
  biaya: "💸",
  jam_operasional: "🕐",
};

// ─── Kuota Bar ────────────────────────────────────────────────
function KuotaBar({ kuota }) {
  const pct = Math.round((kuota.terpakai / kuota.batas) * 100);
  const color =
    kuota.sisa === 0
      ? "bg-red-500"
      : kuota.sisa === 1
      ? "bg-amber-400"
      : "bg-green-500";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Kuota Simulasi Hari Ini</span>
          {kuota.sisa === 0 && (
            <span className="text-xs bg-red-50 text-red-500 border border-red-100 rounded-full px-2 py-0.5 font-medium">
              Habis
            </span>
          )}
        </div>
        <span
          className={`text-sm font-bold ${
            kuota.sisa === 0 ? "text-red-500" : kuota.sisa === 1 ? "text-amber-500" : "text-green-600"
          }`}
        >
          {kuota.terpakai}/{kuota.batas}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-400">
        {kuota.sisa === 0
          ? "Batas simulasi hari ini sudah tercapai. Coba lagi besok."
          : `Sisa ${kuota.sisa} simulasi untuk hari ini`}
      </p>
    </div>
  );
}

// ─── Tipe Selector ────────────────────────────────────────────
function TipeSelector({ selected, onChange }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Pilih Skenario
      </p>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(TIPE_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3 px-2 transition-all duration-200 text-center
              ${
                selected === key
                  ? "border-green-500 bg-green-50 shadow-sm shadow-green-100"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
              }`}
          >
            <span className="text-xl leading-none">{cfg.emoji}</span>
            <span
              className={`text-xs font-semibold leading-tight ${
                selected === key ? "text-green-700" : "text-gray-600"
              }`}
            >
              {cfg.label}
            </span>
            <span className={`text-[10px] leading-tight ${selected === key ? "text-green-500" : "text-gray-400"}`}>
              {cfg.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Form: Produk ──────────────────────────────────────────────
function FormProduk({ form, setForm, errors, produkList, needRating }) {
  const produk = produkList.find((p) => p.id === Number(form.produk_id));
  const hargaBaru =
    produk && form.nilai
      ? form.perubahan === "naik"
        ? produk.produk_harga + Number(form.nilai)
        : produk.produk_harga - Number(form.nilai)
      : null;

  return (
    <div className="space-y-4">
      {/* Pilih produk */}
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          Produk <span className="text-red-400">*</span>
        </label>
        <select
          value={form.produk_id}
          onChange={(e) => setForm((f) => ({ ...f, produk_id: e.target.value }))}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none bg-gray-50 transition-all
            ${errors.produk_id ? "border-red-300 bg-red-50" : "border-gray-200 focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-100"}`}
        >
          <option value="">Pilih produk…</option>
          {produkList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.produk_nama} — Rp {fmt(p.produk_harga)}
            </option>
          ))}
        </select>
        {errors.produk_id && <p className="mt-1 text-xs text-red-500">{errors.produk_id}</p>}
      </div>

      {/* Arah perubahan */}
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          Perubahan Harga <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["naik", "turun"].map((arah) => (
            <button
              key={arah}
              type="button"
              onClick={() => setForm((f) => ({ ...f, perubahan: arah }))}
              className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                ${
                  form.perubahan === arah
                    ? arah === "naik"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-red-400 bg-red-50 text-red-600"
                    : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                }`}
            >
              {arah === "naik" ? "▲ Naik" : "▼ Turun"}
            </button>
          ))}
        </div>
      </div>

      {/* Nominal */}
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          Nominal Perubahan <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">Rp</span>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={form.nilai}
            onChange={(e) => setForm((f) => ({ ...f, nilai: e.target.value }))}
            className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm outline-none bg-gray-50 transition-all
              ${errors.nilai ? "border-red-300 bg-red-50" : "border-gray-200 focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-100"}`}
          />
        </div>
        {errors.nilai && <p className="mt-1 text-xs text-red-500">{errors.nilai}</p>}
      </div>

      {/* Preview harga */}
      {produk && hargaBaru !== null && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 flex items-center justify-between">
          <div className="text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">Harga Saat Ini</p>
            <p className="text-sm font-bold text-gray-700">Rp {fmt(produk.produk_harga)}</p>
          </div>
          <div className="text-gray-300 text-lg">→</div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">Harga Baru</p>
            <p
              className={`text-sm font-bold ${
                form.perubahan === "naik" ? "text-green-600" : "text-red-500"
              }`}
            >
              Rp {fmt(hargaBaru)}
            </p>
          </div>
        </div>
      )}

      {/* Rating manual — muncul jika produk belum punya data historis terlaris */}
      {needRating && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs text-amber-700 mb-2">
            Produk ini belum pernah tercatat sebagai produk terlaris. Beri rating performa produk ini secara manual (1–10).
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm((f) => ({ ...f, rating_manual: n }))}
                className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  Number(form.rating_manual) === n
                    ? "border-amber-500 bg-amber-500 text-white"
                    : "border-amber-200 bg-white text-amber-600 hover:bg-amber-100"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          {errors.rating_manual && <p className="mt-1.5 text-xs text-red-500">{errors.rating_manual}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Form: Biaya ───────────────────────────────────────────────
function FormBiaya({ form, setForm, errors }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          Jenis Biaya <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="cth: Bahan baku, Gaji, Listrik…"
          value={form.jenis_biaya}
          onChange={(e) => setForm((f) => ({ ...f, jenis_biaya: e.target.value }))}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none bg-gray-50 transition-all
            ${errors.jenis_biaya ? "border-red-300 bg-red-50" : "border-gray-200 focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-100"}`}
        />
        {errors.jenis_biaya && <p className="mt-1 text-xs text-red-500">{errors.jenis_biaya}</p>}
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          Arah Perubahan <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["naik", "turun"].map((arah) => (
            <button
              key={arah}
              type="button"
              onClick={() => setForm((f) => ({ ...f, perubahan: arah }))}
              className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                ${
                  form.perubahan === arah
                    ? arah === "naik"
                      ? "border-red-400 bg-red-50 text-red-600"
                      : "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                }`}
            >
              {arah === "naik" ? "▲ Naik" : "▼ Turun"}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[10px] text-gray-400">
          Naik = biaya tambah (buruk untuk laba) · Turun = efisiensi (baik)
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          Persentase Perubahan <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            min={0}
            max={100}
            placeholder="0"
            value={form.persen}
            onChange={(e) => setForm((f) => ({ ...f, persen: e.target.value }))}
            className={`w-full pr-10 pl-3.5 py-2.5 rounded-xl border text-sm outline-none bg-gray-50 transition-all
              ${errors.persen ? "border-red-300 bg-red-50" : "border-gray-200 focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-100"}`}
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">%</span>
        </div>
        {errors.persen && <p className="mt-1 text-xs text-red-500">{errors.persen}</p>}
      </div>
    </div>
  );
}

// ─── Form: Jam Operasional ────────────────────────────────────
function FormJam({ form, setForm, errors, bisnis }) {
  const bukaLama  = bisnis?.bisnis_buka  ?? "00:00:00";
  const tutupLama = bisnis?.bisnis_tutup ?? "00:00:00";

  const durasiLama = (() => {
    const [bh, bm] = bukaLama.split(":").map(Number);
    const [th, tm] = tutupLama.split(":").map(Number);
    return th * 60 + tm - (bh * 60 + bm);
  })();

  const durasiBaru = (() => {
    if (!form.buka_baru || !form.tutup_baru) return null;
    const [bh, bm] = form.buka_baru.split(":").map(Number);
    const [th, tm] = form.tutup_baru.split(":").map(Number);
    const menit = th * 60 + tm - (bh * 60 + bm);
    return menit > 0 ? menit : null;
  })();

  const selisih = durasiBaru !== null ? Math.round((durasiBaru - durasiLama) / 60 * 10) / 10 : null;

  return (
    <div className="space-y-4">
      {/* Info jam sekarang */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
        <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wide">Jam Saat Ini</p>
        <p className="text-sm font-bold text-gray-700">
          {bukaLama.slice(0, 5)} – {tutupLama.slice(0, 5)}
          <span className="ml-2 text-xs font-normal text-gray-400">({Math.round(durasiLama / 60)} jam)</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">
            Jam Buka Baru <span className="text-red-400">*</span>
          </label>
          <input
            type="time"
            value={form.buka_baru}
            onChange={(e) => setForm((f) => ({ ...f, buka_baru: e.target.value }))}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none bg-gray-50 transition-all
              ${errors.buka_baru ? "border-red-300 bg-red-50" : "border-gray-200 focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-100"}`}
          />
          {errors.buka_baru && <p className="mt-1 text-xs text-red-500">{errors.buka_baru}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">
            Jam Tutup Baru <span className="text-red-400">*</span>
          </label>
          <input
            type="time"
            value={form.tutup_baru}
            onChange={(e) => setForm((f) => ({ ...f, tutup_baru: e.target.value }))}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none bg-gray-50 transition-all
              ${errors.tutup_baru ? "border-red-300 bg-red-50" : "border-gray-200 focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-100"}`}
          />
          {errors.tutup_baru && <p className="mt-1 text-xs text-red-500">{errors.tutup_baru}</p>}
        </div>
      </div>

      {/* Preview durasi */}
      {durasiBaru !== null && (
        <div className={`rounded-xl border p-3 flex items-center justify-between
          ${selisih > 0 ? "bg-green-50 border-green-100" : selisih < 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}
        >
          <div className="text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">Durasi Sekarang</p>
            <p className="text-sm font-bold text-gray-700">{Math.round(durasiLama / 60)} jam</p>
          </div>
          <div className="text-gray-300 text-lg">→</div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">Durasi Baru</p>
            <p className={`text-sm font-bold ${selisih > 0 ? "text-green-600" : selisih < 0 ? "text-red-500" : "text-gray-700"}`}>
              {Math.round(durasiBaru / 60 * 10) / 10} jam
              {selisih !== 0 && (
                <span className="ml-1 text-xs">({selisih > 0 ? "+" : ""}{selisih} jam)</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Result Card ───────────────────────────────────────────
function parseHasil(teks) {
  const sections = {};
  const keys = ["DAMPAK", "PELUANG", "RISIKO", "REKOMENDASI"];
  keys.forEach((k, i) => {
    const next = keys[i + 1];
    const regex = next
      ? new RegExp(`${k}:\\s*([\\s\\S]*?)(?=\\n${next}:|$)`)
      : new RegExp(`${k}:\\s*([\\s\\S]*?)$`);
    const match = teks.match(regex);
    if (match) sections[k] = match[1].trim();
  });
  return sections;
}

function SectionIcon({ name, size = 14 }) {
  if (name === "zap")    return <LuZap size={size} />;
  if (name === "rocket") return <LuRocket size={size} />;
  if (name === "alert")  return <LuTriangleAlert size={size} />;
  if (name === "check")  return <LuCheck size={size} />;
  return null;
}

const SECTION_CONFIG = {
  DAMPAK:       { label: "Dampak",       icon: "zap",     color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100" },
  PELUANG:      { label: "Peluang",      icon: "rocket",  color: "text-[#15803D]",  bg: "bg-[#F0FDF4]",  border: "border-[#DCFCE7]" },
  RISIKO:       { label: "Risiko",       icon: "alert",   color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-100" },
  REKOMENDASI:  { label: "Rekomendasi",  icon: "check",   color: "text-[#15803D]",  bg: "bg-[#F0FDF4]",  border: "border-[#DCFCE7]" },
};

function AIResultCard({ hasil, tipe, skenario, onClose }) {
  const sections = parseHasil(hasil);

  return (
    <div className="bg-white rounded-2xl border border-green-100 shadow-lg overflow-hidden mb-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{TIPE_ICON_MAP[tipe]}</span>
          <div>
            <p className="text-white text-xs font-semibold opacity-80">Hasil Analisa AI</p>
            <p className="text-white text-sm font-bold leading-tight">
              {TIPE_CONFIG[tipe].label}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Sections */}
      <div className="p-4 space-y-3">
        {Object.entries(SECTION_CONFIG).map(([key, cfg]) => {
          const text = sections[key];
          if (!text) return null;
          return (
            <div key={key} className={`rounded-xl border p-3 ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <SectionIcon name={cfg.icon} />
                <p className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</p>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Riwayat Item ─────────────────────────────────────────────
function RiwayatLabel({ item }) {
  if (item.tipe === "produk" && item.produk) {
    const arah = item.skenario.perubahan === "naik" ? "▲" : "▼";
    return (
      <span>
        {item.produk.produk_nama} — harga {arah} Rp {fmt(item.skenario.nilai)}
      </span>
    );
  }
  if (item.tipe === "biaya") {
    const arah = item.skenario.perubahan === "naik" ? "▲" : "▼";
    return (
      <span>
        {item.skenario.jenis_biaya} {arah} {item.skenario.persen}%
      </span>
    );
  }
  if (item.tipe === "jam_operasional") {
    return (
      <span>
        Jam buka {item.skenario.buka_baru} – {item.skenario.tutup_baru}
      </span>
    );
  }
  return <span>—</span>;
}

function RiwayatCard({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg shrink-0">{TIPE_ICON_MAP[item.tipe]}</span>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">{TIPE_CONFIG[item.tipe].label} · {fmtDate(item.created_at)}</p>
            <p className="text-sm font-semibold text-gray-700 truncate">
              <RiwayatLabel item={item} />
            </p>
          </div>
        </div>
        <span
          className={`text-gray-400 text-xs ml-2 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          <AIResultCard hasil={item.hasil_analisa} tipe={item.tipe} skenario={item.skenario} />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function Simulation() {
  const { bisnis } = useAuth()
  const [riwayat, setRiwayat]     = useState([])
  const [kuota, setKuota]         = useState(null)
  const [produkList, setProdukList] = useState([])
  const [initLoading, setInitLoading] = useState(true)

  const fetchInit = useCallback(async () => {
    setInitLoading(true)
    try {
      const [riwRes, kuotaRes, prodRes] = await Promise.all([
        api.get('/what-if?per_page=20').catch(() => null),
        api.get('/what-if/kuota').catch(() => null),
        api.get('/produk').catch(() => null),
      ])
      if (riwRes?.data?.data)   setRiwayat(riwRes.data.data)
      if (kuotaRes?.data?.data) setKuota(kuotaRes.data.data)
      if (prodRes?.data?.data)  setProdukList(prodRes.data.data)
    } finally { setInitLoading(false) }
  }, [])

  useEffect(() => { fetchInit() }, [fetchInit])

  const handlePredict = async (payload) => {
    const { data } = await api.post('/what-if/predict', payload)
    setRiwayat(prev => [data.data, ...prev])
    if (data.kuota) setKuota(data.kuota)
    return data.data
  }

  const [tipe, setTipe] = useState("produk");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState(null);
  const [errors, setErrors] = useState({});
  const [globalErr, setGlobalErr] = useState("");
  const [tab, setTab] = useState("simulasi"); // "simulasi" | "riwayat"
  const [needRating, setNeedRating] = useState(false);

  const [formProduk, setFormProduk] = useState({ produk_id: "", perubahan: "naik", nilai: "", rating_manual: "" });
  const [formBiaya, setFormBiaya] = useState({ jenis_biaya: "", perubahan: "naik", persen: "" });
  const [formJam, setFormJam] = useState({ buka_baru: "", tutup_baru: "" });

  const validate = () => {
    const e = {};
    if (tipe === "produk") {
      if (!formProduk.produk_id) e.produk_id = "Pilih produk terlebih dahulu";
      if (!formProduk.nilai || Number(formProduk.nilai) <= 0) e.nilai = "Masukkan nominal perubahan";
      if (needRating && !formProduk.rating_manual) e.rating_manual = "Beri rating 1-10 terlebih dahulu";
    }
    if (tipe === "biaya") {
      if (!formBiaya.jenis_biaya.trim()) e.jenis_biaya = "Jenis biaya wajib diisi";
      if (!formBiaya.persen || Number(formBiaya.persen) <= 0) e.persen = "Masukkan persentase perubahan";
    }
    if (tipe === "jam_operasional") {
      if (!formJam.buka_baru) e.buka_baru = "Pilih jam buka baru";
      if (!formJam.tutup_baru) e.tutup_baru = "Pilih jam tutup baru";
    }
    return e;
  };

  const buildPayload = () => {
    if (tipe === "produk") {
      return {
        tipe: "produk",
        produk_id: Number(formProduk.produk_id),
        perubahan: formProduk.perubahan,
        nilai: Number(formProduk.nilai),
        ...(needRating && formProduk.rating_manual ? { rating_manual: Number(formProduk.rating_manual) } : {}),
      };
    }
    if (tipe === "biaya") {
      return {
        tipe: "biaya",
        jenis_biaya: formBiaya.jenis_biaya,
        perubahan: formBiaya.perubahan,
        persen: Number(formBiaya.persen),
      };
    }
    return {
      tipe: "jam_operasional",
      buka_baru: formJam.buka_baru,
      tutup_baru: formJam.tutup_baru,
    };
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setGlobalErr("");
    setLoading(true);
    setHasil(null);

    try {
      const result = await handlePredict(buildPayload());
      setHasil(result.hasil_analisa);
      setNeedRating(false);
    } catch (err) {
      const res = err.response?.data;
      if (res?.need_rating) {
        setNeedRating(true);
        setErrors({ rating_manual: null });
        setGlobalErr(res.info ?? "Produk ini butuh rating manual — lihat form di bawah.");
      } else {
        setGlobalErr(res?.message ?? "Gagal menjalankan simulasi");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setHasil(null);
    setErrors({});
    setGlobalErr("");
    setNeedRating(false);
    setFormProduk({ produk_id: "", perubahan: "naik", nilai: "", rating_manual: "" });
    setFormBiaya({ jenis_biaya: "", perubahan: "naik", persen: "" });
    setFormJam({ buka_baru: "", tutup_baru: "" });
  };

  return (
    <div
      className="min-h-screen bg-[#F8FAFC]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-0 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#22C55E] flex items-center justify-center text-white shadow-sm shadow-[#BBF7D0]">
              <LuLightbulb size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">What If</h1>
              <p className="text-xs text-gray-400">Simulasi skenario bisnis dengan AI</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {[
              { key: "simulasi", label: "Simulasi Baru" },
              { key: "riwayat", label: `Riwayat (${riwayat.length})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all
                  ${tab === t.key
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">

        {/* ── Tab: Simulasi ── */}
        {tab === "simulasi" && (
          <div>
            {/* Kuota */}
            {kuota && <KuotaBar kuota={kuota} />}

            {/* Form card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
              {/* Tipe selector */}
              <TipeSelector selected={tipe} onChange={(t) => { setTipe(t); resetForm(); }} />

              <div className="w-full h-px bg-gray-100 mb-4" />

              {/* Form dinamis */}
              {tipe === "produk" && (
                <FormProduk form={formProduk} setForm={setFormProduk} errors={errors} produkList={produkList} needRating={needRating} />
              )}
              {tipe === "biaya" && (
                <FormBiaya form={formBiaya} setForm={setFormBiaya} errors={errors} />
              )}
              {tipe === "jam_operasional" && (
                <FormJam form={formJam} setForm={setFormJam} errors={errors} bisnis={bisnis} />
              )}

              {globalErr && (
                <div className="mt-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-3 py-2.5">
                  {globalErr}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading || initLoading || (kuota && kuota.sisa === 0)}
                className={`mt-5 w-full py-3 rounded-xl text-sm font-bold transition-all
                  ${loading || initLoading || (kuota && kuota.sisa === 0)
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white shadow-sm shadow-green-200 active:scale-[0.98]"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Menganalisa…
                  </span>
                ) : kuota && kuota.sisa === 0 ? (
                  "Kuota hari ini sudah habis"
                ) : (
                  `Analisa Skenario${kuota ? ` · Sisa ${kuota.sisa}x` : ""}`
                )}
              </button>
            </div>

            {/* AI Result */}
            {hasil && (
              <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                <AIResultCard
                  hasil={hasil}
                  tipe={tipe}
                  onClose={resetForm}
                />
                <button
                  onClick={resetForm}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition-all mb-4"
                >
                  + Buat Simulasi Baru
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Riwayat ── */}
        {tab === "riwayat" && (
          <div>
            {riwayat.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F0FDF4] flex items-center justify-center mb-3"><LuLightbulb size={28} className="text-[#22C55E]" /></div>
                <p className="text-base font-semibold text-gray-700 mb-1">Belum ada simulasi</p>
                <p className="text-sm text-gray-400 mb-4">
                  Buat simulasi pertama kamu untuk melihat dampak perubahan bisnis.
                </p>
                <button
                  onClick={() => setTab("simulasi")}
                  className="px-5 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors"
                >
                  Mulai Simulasi
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {riwayat.map((item) => (
                  <RiwayatCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop: wide layout override */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (min-width: 768px) {
          .what-if-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            align-items: start;
          }
        }
      `}</style>
    </div>
  );
}