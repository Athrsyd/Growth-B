import { useState, useRef } from "react";
import { LuGift } from "react-icons/lu";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import templateImg from "../assets/template_qr.png";

// ─── QR Code placeholder ──────────────────────────────────────
// Ganti dengan <img src={qrUrl} className="w-full h-full object-contain" />
// saat integrasi dengan BE (qrUrl dari endpoint GET /bisnis/qr/{token})
function QRCode() {
  const size  = 11;
  const cells = Array.from({ length: size * size }, (_, i) => {
    const r = Math.floor(i / size), c = i % size;
    const topL  = r < 3 && c < 3;
    const topR  = r < 3 && c >= size - 3;
    const botL  = r >= size - 3 && c < 3;
    const corner = topL || topR || botL;
    const inner  = (r === 1 && c === 1) || (r === 1 && c === size - 2) || (r === size - 2 && c === 1);
    const data   = !corner && !inner && (r * 17 + c * 11 + r * c * 3) % 4 === 0;
    return { corner, inner, data };
  });
  return (
    <div className="w-full h-full bg-white p-2" style={{ display: "grid", gridTemplateColumns: `repeat(${size}, 1fr)`, gap: "1px" }}>
      {cells.map((cell, i) => (
        <div key={i} style={{ aspectRatio: "1", background: cell.corner && !cell.inner ? "#111" : cell.data ? "#111" : "#fff" }} />
      ))}
    </div>
  );
}

// ─── Dummy data ───────────────────────────────────────────────
const BISNIS = {
  bisnis_nama: "Warung Makan Bu Sari",
  member_token: "abc123xyz",
  reward_threshold: 10,
};

const GROWTH_DATA = [
  { label: "1 Jul", total: 12 },
  { label: "5 Jul", total: 18 },
  { label: "8 Jul", total: 25 },
  { label: "10 Jul", total: 31 },
  { label: "12 Jul", total: 38 },
  { label: "13 Jul", total: 42 },
  { label: "14 Jul", total: 47 },
];

const DUMMY_MEMBERS = [
  { id: 1,  member_phone: "+6281234567890", member_count: 12, created_at: "2024-06-01T09:00:00Z" },
  { id: 2,  member_phone: "+6289876543210", member_count: 7,  created_at: "2024-06-10T11:00:00Z" },
  { id: 3,  member_phone: "+6285551234567", member_count: 15, created_at: "2024-06-15T14:00:00Z" },
  { id: 4,  member_phone: "+6281122334455", member_count: 3,  created_at: "2024-06-20T08:00:00Z" },
  { id: 5,  member_phone: "+6287788990011", member_count: 10, created_at: "2024-07-01T10:00:00Z" },
  { id: 6,  member_phone: "+6282233445566", member_count: 2,  created_at: "2024-07-05T13:00:00Z" },
  { id: 7,  member_phone: "+6283344556677", member_count: 11, created_at: "2024-07-08T09:30:00Z" },
  { id: 8,  member_phone: "+6284455667788", member_count: 5,  created_at: "2024-07-10T16:00:00Z" },
  { id: 9,  member_phone: "+6286677889900", member_count: 8,  created_at: "2024-07-12T11:00:00Z" },
  { id: 10, member_phone: "+6280011223344", member_count: 1,  created_at: "2024-07-14T10:00:00Z" },
];

// ─── Helpers ──────────────────────────────────────────────────
const fmtDate = s => new Date(s).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" });
const maskPhone = p => p.slice(0, 5) + "****" + p.slice(-3);

const totalMember   = DUMMY_MEMBERS.length;
const prevTotal     = 38;
const growthPct     = Math.round(((totalMember - prevTotal) / prevTotal) * 100);
const eligible      = DUMMY_MEMBERS.filter(m => m.member_count >= BISNIS.reward_threshold).length;

// ─── Template QR — pakai gambar asli sebagai background ───────
function QRTemplate() {
  return (
    <div
      id="qr-template"
      className="relative overflow-hidden w-full"
      style={{ aspectRatio: "210/297" }}
    >
      {/* Gambar template asli sebagai background penuh */}
      <img
        src={templateImg}
        alt="QR Template"
        className="absolute inset-0 w-full h-full object-fill"
        draggable={false}
      />
      <div className="text absolute top-[20%] left-[50%] -translate-x-1/2 text-center w-full px-4">
      <h1>{BISNIS.bisnis_nama}</h1>
      <p>token : {BISNIS.member_token}</p>
      </div>

      {/* QR overlay — posisi mengikuti kotak border hijau di template */}
      {/* Sesuaikan top/left/width untuk fine-tune posisi QR */}
      <div
        className="absolute"
        style={{
          top: "32%",
          left: "19%",
          width: "58%",
          aspectRatio: "1/1",
        }}
      >

        <QRCode />
      </div>
        <div className="text absolute top-[75%] left-[50%] -translate-x-1/2 text-center w-full px-4">
        <h1>SCAN UNTUK MENJADI MEMBER</h1>
        </div>
      
    </div>
  );
}

// ─── Fullscreen modal ─────────────────────────────────────────
function FullscreenModal({ onClose }) {
  return (
    <div onClick={onClose} className="qris fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm">
        {/* <button onClick={onClose}
          className="absolute -top-3 -right-40 text-white text-xs font-semibold flex items-center gap-1.5 hover:text-gray-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          Tutup
        </button> */}
        <div className="shadow-2xl rounded-xl overflow-hidden">
          <QRTemplate />
        </div>
      </div>
    </div>
  );
}

// ─── Hapus confirm ────────────────────────────────────────────
function HapusModal({ member, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </div>
        <p className="text-sm font-bold text-gray-900 mb-1">Hapus Member?</p>
        <p className="text-xs text-gray-400 mb-4">{maskPhone(member.member_phone)} akan dihapus dari daftar member.</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-all">Batal</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 active:scale-95 transition-all">Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail member modal ──────────────────────────────────────
function DetailModal({ member, threshold, onClose }) {
  const isEligible = member.member_count >= threshold;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-xs bg-white sm:rounded-2xl rounded-t-2xl shadow-xl p-5">
        <div className="sm:hidden flex justify-center mb-3"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-900">Detail Member</p>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-0.5">Nomor HP</p>
            <p className="text-sm font-bold text-gray-800">{member.member_phone}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-[#15803D]">{member.member_count}</p>
              <p className="text-xs text-gray-400">Kunjungan</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-gray-800">{threshold}</p>
              <p className="text-xs text-gray-400">Target Reward</p>
            </div>
          </div>
          {/* Progress bar kunjungan */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-400">Progress reward</span>
              <span className="font-semibold text-gray-600">{Math.min(member.member_count, threshold)}/{threshold}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${isEligible ? "bg-[#16A34A]" : "bg-[#F0FDF4]0"}`}
                style={{ width: `${Math.min((member.member_count / threshold) * 100, 100)}%` }}/>
            </div>
          </div>
          <div className={`rounded-xl px-3 py-2.5 text-xs font-semibold text-center ${isEligible ? "bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]" : "bg-gray-50 text-gray-400"}`}>
            {isEligible ? <span className="flex items-center justify-center gap-1"><LuGift size={12} /> Layak mendapat reward!</span> : `Butuh ${threshold - member.member_count} kunjungan lagi`}
          </div>
          <div className="text-xs text-gray-400 text-center">Daftar: {fmtDate(member.created_at)}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Card: QR Template ────────────────────────────────────────
function CardQR({ bisnis }) {
  const [showFull, setShowFull]     = useState(false);
  const [printing, setPrinting]     = useState(false);
  const templateRef                 = useRef(null);

  const handleDownloadPDF = async () => {
    if (printing) return;
    setPrinting(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF }   = await import("jspdf");

      const el = templateRef.current;
      if (!el) return;

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        // Fix: oklch tidak disupport html2canvas — clone DOM dan replace semua warna oklch
        onclone: (clonedDoc) => {
          const allEls = clonedDoc.querySelectorAll("*");
          allEls.forEach((node) => {
            const style = node.style;
            const computed = window.getComputedStyle(node);

            // Properti yang biasanya pakai oklch di Tailwind v4
            const props = [
              "color", "backgroundColor", "borderColor",
              "borderTopColor", "borderBottomColor", "borderLeftColor", "borderRightColor",
              "outlineColor", "fill", "stroke",
            ];

            props.forEach((prop) => {
              const val = computed[prop];
              if (val && val.includes("oklch")) {
                // Fallback ke inherit atau transparent
                style[prop] = "inherit";
              }
            });
          });
        },
      });

      const pdf     = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW   = pdf.internal.pageSize.getWidth();
      const pageH   = pdf.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      pdf.addImage(imgData, "JPEG", 0, 0, pageW, pageH);
      pdf.save(`QR-Member-${bisnis.bisnis_nama.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("Gagal generate PDF:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Template QR</p>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">A4</span>
      </div>

      {/* Preview template — ref dipakai untuk capture */}
      <div className="p-3 flex-1">
        <div ref={templateRef} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
          <QRTemplate />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 px-4 py-3 border-t border-gray-100">
        <button
          onClick={handleDownloadPDF}
          disabled={printing}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#16A34A] text-white text-xs font-semibold hover:bg-[#15803D] active:scale-95 transition-all shadow-sm shadow-[#BBF7D0] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {printing ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Unduh PDF
            </>
          )}
        </button>
        <button
          onClick={() => setShowFull(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 active:scale-95 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
          </svg>
          Fullscreen
        </button>
      </div>

      {showFull && <FullscreenModal onClose={() => setShowFull(false)} />}
    </div>
  );
}

// ─── Card: Pertumbuhan Member ─────────────────────────────────
function CardGrowth() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Pertumbuhan Member</p>

        {/* Summary */}
        <div className="flex items-end gap-3 mb-1">
          <div>
            <p className="text-3xl font-black text-gray-900">{totalMember}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total member</p>
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold mb-1 ${growthPct >= 0 ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-red-50 text-red-500"}`}>
            {growthPct >= 0 ? "↑" : "↓"} {Math.abs(growthPct)}%
          </div>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="text-center">
            <p className="text-sm font-black text-[#16A34A]">{eligible}</p>
            <p className="text-xs text-gray-400">Layak reward</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-center">
            <p className="text-sm font-black text-[#15803D]">{BISNIS.reward_threshold}</p>
            <p className="text-xs text-gray-400">Threshold</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-center">
            <p className="text-sm font-black text-gray-700">{totalMember - eligible}</p>
            <p className="text-xs text-gray-400">Dalam proses</p>
          </div>
        </div>
      </div>

      {/* Mini line chart */}
      <div className="flex-1 px-2 pb-3">
        <ResponsiveContainer width="100%" height={110}>
          <LineChart data={GROWTH_DATA} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              formatter={v => [`${v} member`, "Total"]}
              contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 11 }}
              labelStyle={{ fontWeight: 700 }}
            />
            <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5}
              dot={{ r: 3, fill: "#6366f1" }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Card: Tabel Member ───────────────────────────────────────
function CardTabel({ threshold }) {
  const [members, setMembers]     = useState(DUMMY_MEMBERS);
  const [search, setSearch]       = useState("");
  const [hapusTarget, setHapusTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [filterReward, setFilterReward] = useState(false);

  const filtered = members
    .filter(m => m.member_phone.includes(search))
    .filter(m => !filterReward || m.member_count >= threshold);

  const handleHapus = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setHapusTarget(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Data Member</p>
        <span className="text-xs font-bold text-[#15803D] bg-[#F0FDF4] px-2.5 py-1 rounded-full">{members.length} member</span>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 px-4 py-3 border-b border-gray-100">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nomor HP…"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs outline-none focus:border-[#22C55E] focus:bg-white transition-all"/>
        </div>
        <button onClick={() => setFilterReward(f => !f)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 ${filterReward ? "bg-[#16A34A] text-white border-[#16A34A]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
          <LuGift size={12} /> Reward
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Nomor HP</th>
              <th className="text-center px-3 py-2.5 text-gray-400 font-semibold">Kunjungan</th>
              <th className="text-center px-3 py-2.5 text-gray-400 font-semibold hidden sm:table-cell">Daftar</th>
              <th className="text-center px-3 py-2.5 text-gray-400 font-semibold">Status</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Tidak ada member ditemukan</td></tr>
            ) : filtered.map(m => {
              const isEligible = m.member_count >= threshold;
              return (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  {/* Nomor */}
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800 font-mono">{maskPhone(m.member_phone)}</p>
                  </td>
                  {/* Kunjungan */}
                  <td className="px-3 py-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-black text-gray-900 text-sm">{m.member_count}</span>
                      {/* Mini progress */}
                      <div className="w-10 h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                        <div className={`h-full rounded-full ${isEligible ? "bg-[#16A34A]" : "bg-[#4ADE80]"}`}
                          style={{ width: `${Math.min((m.member_count/threshold)*100, 100)}%` }}/>
                      </div>
                    </div>
                  </td>
                  {/* Tanggal */}
                  <td className="px-3 py-3 text-center text-gray-400 hidden sm:table-cell">{fmtDate(m.created_at)}</td>
                  {/* Badge */}
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${isEligible ? "bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]" : "bg-gray-100 text-gray-400"}`}>
                      {isEligible ? <span className="flex items-center gap-1"><LuGift size={10} /> Reward</span> : "Proses"}
                    </span>
                  </td>
                  {/* Aksi */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setDetailTarget(m)}
                        className="w-7 h-7 rounded-lg bg-[#F0FDF4] flex items-center justify-center text-[#15803D] hover:hover:bg-[#DCFCE7] transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                      <button onClick={() => setHapusTarget(m)}
                        className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hapusTarget  && <HapusModal member={hapusTarget} onClose={() => setHapusTarget(null)} onConfirm={() => handleHapus(hapusTarget.id)} />}
      {detailTarget && <DetailModal member={detailTarget} threshold={threshold} onClose={() => setDetailTarget(null)} />}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function Member() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 lg:px-8 pt-10 lg:pt-6 pb-4">
        <p className="text-xs font-semibold text-[#22C55E] uppercase tracking-widest mb-0.5">Membership</p>
        <h1 className="text-xl font-bold text-gray-900">Member</h1>
      </div>

      {/* ── Content ── */}
      <div className="px-4 lg:px-8 pt-5 pb-28 lg:pb-10 space-y-4">

        {/* Bento atas: mobile = stack, desktop = 2 col */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Kiri: pertumbuhan */}
          <CardGrowth />
          {/* Kanan: QR */}
          <CardQR bisnis={BISNIS} />
        </div>

        {/* Bento bawah: tabel full width */}
        <CardTabel threshold={BISNIS.reward_threshold} />
      </div>
    </div>
  );
}