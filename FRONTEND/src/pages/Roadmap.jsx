import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { LuZap, LuTarget, LuMap, LuCheck, LuCalendar } from "react-icons/lu";

const METRIK_LABELS = {
  omset: "Target Omset",
  jumlah_pembeli: "Target Pembeli",
  pengeluaran: "Target Pengeluaran",
  laba: "Target Laba",
};

function StatusIcon({ name }) {
  if (name === "zap")   return <LuZap size={10} />;
  if (name === "check") return <LuCheck size={10} />;
  return null;
}

const STATUS_CONFIG = {
  aktif: {
    label: "Aktif",
    dot: "bg-[#22C55E]",
    dotRing: "ring-[#BBF7D0]",
    badge: "bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]",
    border: "border-[#DCFCE7]",
    icon: "zap",
  },
  tercapai: {
    label: "Tercapai",
    dot: "bg-[#16A34A]",
    dotRing: "ring-[#BBF7D0]",
    badge: "bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]",
    border: "border-[#DCFCE7]",
    icon: "check",
  },
  dibatalkan: {
    label: "Dibatalkan",
    dot: "bg-gray-300",
    dotRing: "ring-gray-100",
    badge: "bg-gray-50 text-gray-400 border-gray-200",
    border: "border-gray-100",
    icon: null,
  },
};

// ─── Helpers ──────────────────────────────────────────────────
const fmt     = v => v != null ? new Intl.NumberFormat("id-ID").format(v) : null;
const fmtDate = s => s ? new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : null;
const daysLeft = s => s ? Math.ceil((new Date(s) - new Date()) / 86400000) : null;
const sortByDate = list => [...list].sort((a, b) => {
  if (!a.target_tanggal) return 1;
  if (!b.target_tanggal) return -1;
  return new Date(a.target_tanggal) - new Date(b.target_tanggal);
});

// ─── Add Modal ────────────────────────────────────────────────
const EMPTY = { judul: "", deskripsi: "", target_metrik: "", target_nilai: "", target_tanggal: "" };

function AddModal({ onClose, onSave, saving }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [globalErr, setGlobalErr] = useState("");

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.judul.trim()) e.judul = "Judul wajib diisi";
    if (form.target_nilai && isNaN(Number(form.target_nilai))) e.target_nilai = "Harus angka";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setGlobalErr("");
    try {
      await onSave({
        judul: form.judul,
        deskripsi: form.deskripsi || null,
        target_metrik: form.target_metrik || null,
        target_nilai: form.target_nilai ? Number(form.target_nilai) : null,
        target_tanggal: form.target_tanggal || null,
        status: "aktif",
      });
      onClose();
    } catch (err) {
      setGlobalErr(err.response?.data?.message ?? "Gagal menyimpan goal");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden">
        {/* Handle (mobile only) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Tambah Goal</h2>
            <p className="text-xs text-gray-400 mt-0.5">AI akan mengacu pada goal ini saat analisa</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Judul Goal <span className="text-red-400">*</span>
            </label>
            <input
              value={form.judul}
              onChange={e => set("judul", e.target.value)}
              placeholder="Contoh: Capai omset 50 juta bulan September"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
                ${errors.judul ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#DCFCE7]"}`}
            />
            {errors.judul && <p className="mt-1 text-xs text-red-500">{errors.judul}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Deskripsi</label>
            <textarea
              value={form.deskripsi}
              onChange={e => set("deskripsi", e.target.value)}
              placeholder="Langkah-langkah atau catatan tambahan…"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#DCFCE7] text-sm outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Metrik Target</label>
              <select
                value={form.target_metrik}
                onChange={e => set("target_metrik", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22C55E] text-sm outline-none appearance-none"
              >
                <option value="">— Pilih —</option>
                <option value="omset">Omset</option>
                <option value="jumlah_pembeli">Jumlah Pembeli</option>
                <option value="laba">Laba</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nilai Target</label>
              <input
                type="number"
                value={form.target_nilai}
                onChange={e => set("target_nilai", e.target.value)}
                placeholder="50000000"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
                  ${errors.target_nilai ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#DCFCE7]"}`}
              />
              {errors.target_nilai && <p className="mt-1 text-xs text-red-500">{errors.target_nilai}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Deadline</label>
            <input
              type="date"
              value={form.target_tanggal}
              onChange={e => set("target_tanggal", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#DCFCE7] text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4">
          {globalErr && <p className="text-xs text-red-500 mb-2">{globalErr}</p>}
          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50">
              Batal
            </button>
            <button onClick={submit} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#22C55E] text-white hover:bg-[#15803D] active:scale-95 transition-all disabled:opacity-60">
              {saving ? "Menyimpan…" : "Simpan Goal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Card (shared) ────────────────────────────────────────────
function CardContent({ item, onMarkDone }) {
  const [confirming, setConfirming] = useState(false);
  const cfg         = STATUS_CONFIG[item.status];
  const days        = daysLeft(item.target_tanggal);
  const isDone      = item.status === "tercapai";
  const isCancelled = item.status === "dibatalkan";

  return (
    <div className={`bg-white rounded-2xl border p-4 shadow-sm shadow-gray-100/60 ${cfg.border} ${isCancelled ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className={`text-sm font-bold leading-snug ${isCancelled ? "line-through text-gray-400" : "text-gray-800"}`}>
          {item.judul}
        </h3>
        <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
          <StatusIcon name={cfg.icon} /> {cfg.label}
        </span>
      </div>

      {item.deskripsi && (
        <p className="text-xs text-gray-500 leading-relaxed mb-3">{item.deskripsi}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {item.target_metrik && item.target_nilai && (
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5">
            <LuTarget size={12} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 leading-none">{METRIK_LABELS[item.target_metrik]}</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">
                {item.target_metrik === "jumlah_pembeli" ? fmt(item.target_nilai) + " orang" : "Rp " + fmt(item.target_nilai)}
              </p>
            </div>
          </div>
        )}

        {item.target_tanggal && (
          <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 ${
            isDone ? "bg-[#F0FDF4]" :
            !isCancelled && days < 0 ? "bg-red-50" :
            !isCancelled && days <= 7 ? "bg-amber-50" : "bg-gray-50"
          }`}>
            <LuCalendar size={14} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 leading-none">Deadline</p>
              <p className={`text-xs font-bold mt-0.5 ${
                isDone ? "text-[#16A34A]" :
                !isCancelled && days < 0 ? "text-red-600" :
                !isCancelled && days <= 7 ? "text-amber-600" : "text-gray-700"
              }`}>{fmtDate(item.target_tanggal)}</p>
            </div>
          </div>
        )}
      </div>

      {!isDone && !isCancelled && days !== null && (
        <div className={`mt-3 text-xs font-medium px-2.5 py-1.5 rounded-lg inline-block ${
          days < 0   ? "bg-red-50 text-red-500" :
          days === 0 ? "bg-amber-50 text-amber-600" :
          days <= 7  ? "bg-amber-50 text-amber-600" :
          "bg-[#F0FDF4] text-[#22C55E]"
        }`}>
          {days < 0 ? `Lewat ${Math.abs(days)} hari` : days === 0 ? "Hari ini!" : days <= 7 ? `${days} hari lagi — segera!` : `${days} hari lagi`}
        </div>
      )}

      {/* Tombol Tandai Tercapai — hanya untuk status aktif */}
      {!isDone && !isCancelled && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          {confirming ? (
            // Konfirmasi sebelum tandai tercapai
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 flex-1">Tandai sebagai tercapai?</p>
              <button
                onClick={() => setConfirming(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => { onMarkDone?.(item.id); setConfirming(false); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F0FDF4]0 text-white hover:bg-[#15803D] active:scale-95 transition-all flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                Ya, tercapai!
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#16A34A] border border-[#BBF7D0] bg-[#F0FDF4] hover:bg-[#DCFCE7] active:scale-95 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              Tandai Tercapai
            </button>
          )}
        </div>
      )}

      {/* Badge sudah tercapai */}
      {isDone && (
        <div className="mt-4 pt-3 border-t border-[#DCFCE7] flex items-center gap-2 text-[#16A34A]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span className="text-xs font-semibold">Goal ini sudah tercapai</span>
        </div>
      )}
    </div>
  );
}

// ─── Mobile: linear timeline ──────────────────────────────────
function MobileTimeline({ items, onMarkDone }) {
  return (
    <div>
      {items.map((item, i) => {
        const cfg    = STATUS_CONFIG[item.status];
        const isLast = i === items.length - 1;
        return (
          <div key={item.id} className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0 pt-1">
              <div className={`w-3 h-3 rounded-full ring-2 ${cfg.dot} ${cfg.dotRing} flex-shrink-0 z-10`} />
              {!isLast && <div className="w-px flex-1 mt-1.5 bg-gray-200" />}
            </div>
            <div className="flex-1 mb-5">
              <CardContent item={item} onMarkDone={onMarkDone} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Desktop: zigzag timeline ─────────────────────────────────
function DesktopTimeline({ items, onMarkDone }) {
  return (
    <div className="relative">
      {/* Garis tengah */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gray-200" />

      {items.map((item, i) => {
        const isLeft = i % 2 === 0;
        const cfg    = STATUS_CONFIG[item.status];

        return (
          <div key={item.id} className="relative flex items-start mb-10">
            {isLeft ? (
              <>
                {/* Card kiri */}
                <div className="w-[calc(50%-2rem)] pr-6">
                  <CardContent item={item} onMarkDone={onMarkDone} />
                </div>
                {/* Dot + tanggal tengah */}
                <div className="w-16 flex-shrink-0 flex flex-col items-center z-10 pt-4">
                  <div className={`w-4 h-4 rounded-full ring-4 ring-white ${cfg.dot} shadow-sm`} />
                  {item.target_tanggal && (
                    <span className="mt-1.5 text-xs text-gray-400 font-medium text-center leading-tight whitespace-nowrap">
                      {fmtDate(item.target_tanggal)}
                    </span>
                  )}
                </div>
                {/* Spacer kanan */}
                <div className="w-[calc(50%-2rem)]" />
              </>
            ) : (
              <>
                {/* Spacer kiri */}
                <div className="w-[calc(50%-2rem)]" />
                {/* Dot + tanggal tengah */}
                <div className="w-16 flex-shrink-0 flex flex-col items-center z-10 pt-4">
                  <div className={`w-4 h-4 rounded-full ring-4 ring-white ${cfg.dot} shadow-sm`} />
                  {item.target_tanggal && (
                    <span className="mt-1.5 text-xs text-gray-400 font-medium text-center leading-tight whitespace-nowrap">
                      {fmtDate(item.target_tanggal)}
                    </span>
                  )}
                </div>
                {/* Card kanan */}
                <div className="w-[calc(50%-2rem)] pl-6">
                  <CardContent item={item} onMarkDone={onMarkDone} />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#F0FDF4] flex items-center justify-center mb-4"><LuMap size={28} className="text-[#22C55E]" /></div>
      <h3 className="text-base font-bold text-gray-800 mb-1">Belum ada roadmap</h3>
      <p className="text-sm text-gray-400 max-w-xs mb-6">
        Buat goal pertamamu. AI akan menggunakannya sebagai acuan saat menganalisa bisnismu.
      </p>
      <button
        onClick={onAdd}
        className="px-5 py-2.5 bg-[#22C55E] text-white rounded-xl text-sm font-semibold hover:bg-[#15803D] active:scale-95 transition-all"
      >
        + Buat Goal Pertama
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function Roadmap() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  const fetchRoadmap = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/roadmap?per_page=50')
      setItems(data.data ?? [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchRoadmap() }, [fetchRoadmap])

  const apiCreate = async (payload) => {
    setSaving(true)
    try {
      const { data } = await api.post('/roadmap', payload)
      setItems(prev => [data.data, ...prev])
    } finally { setSaving(false) }
  }

  const apiUpdate = async (id, payload) => {
    setSaving(true)
    try {
      const { data } = await api.put(`/roadmap/${id}`, payload)
      setItems(prev => prev.map(r => r.id === id ? data.data : r))
    } finally { setSaving(false) }
  }

  const apiDelete = async (id) => {
    try {
      await api.delete(`/roadmap/${id}`)
      setItems(prev => prev.filter(r => r.id !== id))
    } catch { /* ignore */ }
  }

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter]      = useState("semua");

  const handleMarkDone = (id) => {
    apiUpdate(id, { status: "tercapai" })
  };

  const sorted   = sortByDate(items);
  const filtered = filter === "semua" ? sorted : sorted.filter(r => r.status === filter);
  const counts   = {
    semua:      items.length,
    aktif:      items.filter(r => r.status === "aktif").length,
    tercapai:   items.filter(r => r.status === "tercapai").length,
    dibatalkan: items.filter(r => r.status === "dibatalkan").length,
  };

  const FILTERS = [
    { key: "semua",      label: "Semua" },
    { key: "aktif",      label: "Aktif" },
    { key: "tercapai",   label: "Tercapai" },
    { key: "dibatalkan", label: "Dibatalkan" },
  ];

  return (
    <>
      {/* ── Header ── */}
      <div className=" top-0 z-30 bg-white border-b border-gray-100 px-4 lg:px-0 pt-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-[#22C55E] uppercase tracking-widest mb-0.5">Roadmap</p>
            <h1 className="text-xl font-bold text-gray-900">Goal Bisnis</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[#22C55E] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm shadow-[#BBF7D0] hover:bg-[#15803D] active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto pb-3 scrollbar-none -mx-1 px-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                filter === f.key
                  ? "bg-[#22C55E] text-white border-[#22C55E]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {f.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                filter === f.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="pt-6 pb-6 px-4 lg:px-0">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <svg className="w-6 h-6 animate-spin text-[#22C55E]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onAdd={() => setShowModal(true)} />
        ) : (
          <>
            {filter === "semua" && counts.aktif > 0 && (
              <div className="flex items-center gap-2 bg-[#F0FDF4] rounded-xl px-3.5 py-2.5 mb-6 border border-[#DCFCE7]">
                <LuZap size={14} className="text-[#22C55E] shrink-0" />
                <p className="text-xs text-[#15803D] font-medium">
                  <span className="font-bold">{counts.aktif} goal aktif</span> — AI mengacu pada goal ini saat analisa.
                </p>
              </div>
            )}

            {/* Mobile */}
            <div className="lg:hidden">
              <MobileTimeline items={filtered} onMarkDone={handleMarkDone} />
            </div>

            {/* Desktop */}
            <div className="hidden lg:block">
              <DesktopTimeline items={filtered} onMarkDone={handleMarkDone} />
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onSave={apiCreate}
          saving={saving}
        />
      )}
    </>
  );
}