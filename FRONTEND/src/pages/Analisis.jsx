import { useState } from "react";
import { LuTrophy, LuTriangleAlert , LuZap, LuTarget,
   LuSparkles, LuMap, LuChartColumnBig , LuClipboardList, 
   LuCheck, LuPencilLine } from "react-icons/lu";
   import { SlCalender } from "react-icons/sl";


// ─── Dummy data ───────────────────────────────────────────────
const DUMMY_PRODUK = [
  { id: 1, produk_nama: "Nasi Ayam Goreng", produk_harga: 15000 },
  { id: 2, produk_nama: "Es Teh Manis",     produk_harga: 5000  },
  { id: 3, produk_nama: "Nasi Capcay",      produk_harga: 18000 },
  { id: 4, produk_nama: "Jus Alpukat",      produk_harga: 12000 },
];

const DUMMY_DATA_HARIAN = [
  { id: 7, tanggal: "2024-07-14", pendapatan: 1350000, pengeluaran: 520000, jumlah_pembeli: 87, produk_terlaris: "Nasi Ayam Goreng", kendala: "Kompor sempat mati 1 jam" },
  { id: 6, tanggal: "2024-07-13", pendapatan: 980000,  pengeluaran: 430000, jumlah_pembeli: 63, produk_terlaris: "Nasi Ayam Goreng", kendala: null },
  { id: 5, tanggal: "2024-07-12", pendapatan: 1120000, pengeluaran: 470000, jumlah_pembeli: 74, produk_terlaris: "Es Teh Manis",     kendala: null },
  { id: 4, tanggal: "2024-07-11", pendapatan: 890000,  pengeluaran: 390000, jumlah_pembeli: 58, produk_terlaris: "Nasi Capcay",      kendala: "Bahan baku terlambat" },
  { id: 3, tanggal: "2024-07-10", pendapatan: 1450000, pengeluaran: 560000, jumlah_pembeli: 95, produk_terlaris: "Nasi Ayam Goreng", kendala: null },
  { id: 2, tanggal: "2024-07-09", pendapatan: 760000,  pengeluaran: 340000, jumlah_pembeli: 49, produk_terlaris: "Es Teh Manis",     kendala: null },
  { id: 1, tanggal: "2024-07-08", pendapatan: 1100000, pengeluaran: 450000, jumlah_pembeli: 71, produk_terlaris: "Nasi Ayam Goreng", kendala: null },
];

const DUMMY_ANALISA = [
  { id: 2, tipe_eval: "eval", orientasi_pakai: "roadmap", pesan: "Selama periode 1–14 Juli 2024, rata-rata pendapatan harian mencapai Rp 1.092.857 dengan 71 pembeli per hari. Produk terlaris adalah Nasi Ayam Goreng yang dominan selama 5 dari 7 hari. Tingkat pengeluaran masih 39%, perlu ditekan ke bawah 30%.", created_at: "2024-07-15T06:00:00Z" },
  { id: 3, tipe_eval: "plan",  orientasi_pakai: "roadmap", pesan: "1. Buat bundling Nasi Ayam + Es Teh dengan harga spesial Rp 18.000.\n2. Lakukan pengecekan peralatan masak setiap pagi.\n3. Aktifkan promosi QR membership untuk pelanggan yang sudah kunjung lebih dari 8 kali.", created_at: "2024-07-15T06:01:00Z" },
  { id: 1, tipe_eval: "eval",  orientasi_pakai: "tujuan_bisnis", pesan: "Periode 15–28 Juni menunjukkan performa stabil dengan rata-rata 68 pembeli/hari. Total laba bersih Rp 8.2 juta.", created_at: "2024-07-01T06:00:00Z" },
];

const SIKLUS_INFO = {
  dari: "2024-07-01", sampai: "2024-07-14", siklus_ke: 3,
  jumlah_data_terisi: 7, jumlah_data_dibutuhkan: 14,
  data_lengkap: false, sudah_dianalisa: false, bisa_generate: false,
};

// ─── Helpers ──────────────────────────────────────────────────
const fmt     = v => new Intl.NumberFormat("id-ID").format(v);
const fmtDate = s => new Date(s).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" });
const fmtTime = s => new Date(s).toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" });
const toYMD   = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

const HARI   = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
const BULAN  = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

// ─── Kalender ─────────────────────────────────────────────────
function Kalender({ dataHarian, siklusInfo, onPilihTanggal }) {
  const now   = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const firstDay   = new Date(view.year, view.month, 1).getDay();
  const daysInMonth= new Date(view.year, view.month + 1, 0).getDate();

  const inputDates  = new Set(dataHarian.map(d => d.tanggal));
  const siklusDates = (() => {
    const set = new Set();
    let cur = new Date(siklusInfo.dari);
    const end = new Date(siklusInfo.sampai);
    while (cur <= end) { set.add(toYMD(cur)); cur.setDate(cur.getDate()+1); }
    return set;
  })();

  const prevMonth = () => setView(v => v.month === 0 ? { year: v.year-1, month: 11 } : { ...v, month: v.month-1 });
  const nextMonth = () => setView(v => v.month === 11 ? { year: v.year+1, month: 0  } : { ...v, month: v.month+1 });

  // cells: null for empty, number for day
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const todayYMD = toYMD(now);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Kalender header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button onClick={prevMonth} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <p className="text-sm font-bold text-gray-800">{BULAN[view.month]} {view.year}</p>
        <button onClick={nextMonth} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>

      {/* Nama hari */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {HARI.map(h => (
          <div key={h} className="text-center py-2 text-xs font-semibold text-gray-400">{h}</div>
        ))}
      </div>

      {/* Grid tanggal */}
      <div className="grid grid-cols-7 px-2 pb-3 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const ymd        = `${view.year}-${String(view.month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isToday    = ymd === todayYMD;
          const isInput    = inputDates.has(ymd);
          const isSiklus   = siklusDates.has(ymd);
          const isFuture   = ymd > todayYMD;
          const dataHari   = dataHarian.find(d => d.tanggal === ymd);

          return (
            <button
              key={ymd}
              onClick={() => !isFuture && onPilihTanggal(ymd, dataHari)}
              disabled={isFuture}
              className={`relative flex flex-col items-center justify-center rounded-xl py-3 transition-all
                ${isFuture ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer active:scale-95"}
                ${isToday ? "ring-2 ring-[#22C55E] ring-offset-1" : ""}
              `}
            >
              <span className={`text-xs font-bold leading-none
                ${isInput  ? "text-white" : isToday ? "text-[#15803D]" : isSiklus ? "text-[#22C55E]" : "text-gray-700"}
              `}>
                {/* Background dot untuk hari yang sudah diinput */}
                {isInput && (
                  <span className={`absolute inset-1 rounded-lg ${dataHari && (dataHari.pendapatan - dataHari.pengeluaran) >= 0 ? "bg-[#16A34A]" : "bg-red-400"}`} />
                )}
                {/* Background samar untuk range siklus */}
                {!isInput && isSiklus && (
                  <span className="absolute inset-1 rounded-lg bg-[#F0FDF4]" />
                )}
                <span className="relative z-10">{day}</span>
              </span>

              {/* Dot kendala */}
              {isInput && dataHari?.kendala && (
                <span className="relative z-10 w-1 h-1 rounded-full bg-amber-300 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-4 py-2.5 border-t border-gray-100 bg-gray-50">
        {[
          { color: "bg-[#16A34A]", label: "Laba positif" },
          { color: "bg-red-400",     label: "Laba negatif" },
          { color: "bg-[#F0FDF4] border border-[#BBF7D0]", label: "Range siklus" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${l.color}`} />
            <span className="text-xs text-gray-400">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Detail Hari Card (muncul setelah klik kalender) ──────────
function DetailHariCard({ tanggal, data, onInput, onClose }) {
  const laba = data ? data.pendapatan - data.pengeluaran : null;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-400">Detail Hari</p>
          <p className="text-sm font-bold text-gray-800">{fmtDate(tanggal)}</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      {data ? (
        <div className="p-4 space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Pendapatan", value: `Rp ${fmt(data.pendapatan)}`, color: "text-gray-800" },
              { label: "Pengeluaran", value: `Rp ${fmt(data.pengeluaran)}`, color: "text-gray-800" },
              { label: "Pembeli", value: `${data.jumlah_pembeli} org`, color: "text-gray-800" },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
                <p className={`text-xs font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Laba */}
          <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold ${laba >= 0 ? "bg-[#F0FDF4] text-[#15803D]" : "bg-red-50 text-red-600"}`}>
            <span className="text-xs font-medium">Laba Bersih</span>
            <span>{laba >= 0 ? "+" : ""}Rp {fmt(laba)}</span>
          </div>

          {/* Produk terlaris */}
          {data.produk_terlaris && (
            <div className="flex items-center gap-2 text-xs text-[#15803D] bg-[#F0FDF4] rounded-xl px-3 py-2">
              <LuTrophy size={14} className="shrink-0" /><span>Terlaris: <strong>{data.produk_terlaris}</strong></span>
            </div>
          )}

          {/* Kendala */}
          {data.kendala && (
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
              <LuTriangleAlert  size={14} className="shrink-0" /><span>{data.kendala}</span>
            </div>
          )}

          {/* Edit button */}
          <button onClick={() => onInput(tanggal)}
            className="w-full py-2.5 rounded-xl border border-[#BBF7D0] text-[#15803D] text-xs font-semibold hover:bg-[#F0FDF4] transition-all flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit Data Ini
          </button>
        </div>
      ) : (
        <div className="p-4 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl mx-auto">📭</div>
          <p className="text-sm font-semibold text-gray-700">Belum ada data</p>
          <p className="text-xs text-gray-400">Klik tombol di bawah untuk mengisi data hari ini</p>
          <button onClick={() => onInput(tanggal)}
            className="w-full py-2.5 rounded-xl bg-[#22C55E] text-white text-xs font-semibold hover:bg-[#15803D] active:scale-95 transition-all flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Input Data Hari Ini
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Wizard Modal ─────────────────────────────────────────────
const WIZARD_STEPS = ["Info Hari", "Penjualan", "Catatan"];

function InputHarianModal({ tanggalAwal, onClose, onSave }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    tanggal: tanggalAwal || new Date().toISOString().split("T")[0],
    pendapatan: "", pengeluaran: "", jumlah_pembeli: "",
    produk_terlaris_id: "",
    penjualan: DUMMY_PRODUK.map(p => ({ produk_id: p.id, produk_nama: p.produk_nama, produk_harga: p.produk_harga, qty: "" })),
    kendala: "", note: "",
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({...f,[k]:v})); setErrors(e => { const n={...e}; delete n[k]; return n; }); };
  const setPenjualan = (idx, qty) => setForm(f => ({ ...f, penjualan: f.penjualan.map((p,i) => i===idx ? {...p,qty} : p) }));

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.tanggal)        e.tanggal        = "Tanggal wajib diisi";
      if (!form.pendapatan)     e.pendapatan     = "Pendapatan wajib diisi";
      if (!form.pengeluaran)    e.pengeluaran    = "Pengeluaran wajib diisi";
      if (!form.jumlah_pembeli) e.jumlah_pembeli = "Jumlah pembeli wajib diisi";
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next   = () => { if (validate()) setStep(s => s+1); };
  const back   = () => { setErrors({}); setStep(s => s-1); };
  const submit = () => { onSave(form); onClose(); };

  const totalPenjualan = form.penjualan.reduce((sum,p) => sum + (parseInt(p.qty)||0)*p.produk_harga, 0);

  const inputCls = (err) => `w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${err ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#DCFCE7]"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 rounded-full bg-gray-200"/></div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Input Data Harian</h2>
            <p className="text-xs text-gray-400 mt-0.5">Langkah {step+1} dari {WIZARD_STEPS.length}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Step bar */}
        <div className="flex px-5 py-3 gap-1.5 shrink-0">
          {WIZARD_STEPS.map((label,i) => (
            <div key={i} className="flex-1 flex flex-col gap-1">
              <div className={`h-1 rounded-full transition-all duration-300 ${i<=step?"bg-[#22C55E]":"bg-gray-100"}`}/>
              <span className={`text-xs font-medium ${i===step?"text-[#15803D]":i<step?"text-[#22C55E]":"text-gray-300"}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-2 pb-4">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tanggal <span className="text-red-400">*</span></label>
                <input type="date" value={form.tanggal} onChange={e=>set("tanggal",e.target.value)} className={inputCls(errors.tanggal)}/>
                {errors.tanggal && <p className="mt-1 text-xs text-red-500">{errors.tanggal}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{key:"pendapatan",label:"Pendapatan (Rp)",ph:"1350000"},{key:"pengeluaran",label:"Pengeluaran (Rp)",ph:"520000"}].map(f=>(
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{f.label} <span className="text-red-400">*</span></label>
                    <input type="number" min="0" value={form[f.key]} onChange={e=>set(f.key,e.target.value)} placeholder={f.ph} className={inputCls(errors[f.key])}/>
                    {errors[f.key] && <p className="mt-1 text-xs text-red-500">{errors[f.key]}</p>}
                  </div>
                ))}
              </div>
              {form.pendapatan && form.pengeluaran && (
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold ${Number(form.pendapatan)-Number(form.pengeluaran)>=0?"bg-[#F0FDF4] text-[#15803D]":"bg-red-50 text-red-600"}`}>
                  <span className="text-xs font-medium">Estimasi Laba</span>
                  <span>Rp {fmt(Number(form.pendapatan)-Number(form.pengeluaran))}</span>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Jumlah Pembeli <span className="text-red-400">*</span></label>
                <input type="number" min="0" value={form.jumlah_pembeli} onChange={e=>set("jumlah_pembeli",e.target.value)} placeholder="87" className={inputCls(errors.jumlah_pembeli)}/>
                {errors.jumlah_pembeli && <p className="mt-1 text-xs text-red-500">{errors.jumlah_pembeli}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Produk Terlaris</label>
                <select value={form.produk_terlaris_id} onChange={e=>set("produk_terlaris_id",e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22C55E] text-sm outline-none appearance-none">
                  <option value="">— Pilih produk —</option>
                  {DUMMY_PRODUK.map(p=><option key={p.id} value={p.id}>{p.produk_nama}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">Isi jumlah unit terjual per produk. Kosongkan jika tidak terjual.</p>
              {totalPenjualan > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#F0FDF4] text-[#15803D] text-sm font-semibold">
                  <span className="text-xs font-medium">Total penjualan produk</span>
                  <span>Rp {fmt(totalPenjualan)}</span>
                </div>
              )}
              {form.penjualan.map((p,idx) => (
                <div key={p.produk_id} className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.produk_nama}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Rp {fmt(p.produk_harga)} / unit</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={()=>setPenjualan(idx,Math.max(0,(parseInt(p.qty)||0)-1).toString())}
                      className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-500 flex items-center justify-center font-bold hover:border-[#86EFAC] transition-all">−</button>
                    <input type="number" min="0" value={p.qty} onChange={e=>setPenjualan(idx,e.target.value)} placeholder="0"
                      className="w-14 text-center px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-bold outline-none focus:border-[#22C55E]"/>
                    <button type="button" onClick={()=>setPenjualan(idx,((parseInt(p.qty)||0)+1).toString())}
                      className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-500 flex items-center justify-center font-bold hover:border-[#86EFAC] transition-all">+</button>
                  </div>
                  {p.qty > 0 && <div className="text-xs text-right text-[#15803D] font-semibold w-20 shrink-0">Rp {fmt((parseInt(p.qty)||0)*p.produk_harga)}</div>}
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {[{key:"kendala",label:"Kendala Hari Ini",ph:"Contoh: Kompor sempat mati 1 jam…"},{key:"note",label:"Catatan Tambahan",ph:"Hal menarik yang terjadi, atau rencana besok…"}].map(f=>(
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{f.label}</label>
                  <textarea value={form[f.key]} onChange={e=>set(f.key,e.target.value)} placeholder={f.ph} rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#DCFCE7] text-sm outline-none transition-all resize-none"/>
                </div>
              ))}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Ringkasan</p>
                {[
                  { label:"Tanggal",    value: fmtDate(form.tanggal) },
                  { label:"Pendapatan", value:`Rp ${fmt(form.pendapatan||0)}` },
                  { label:"Pengeluaran",value:`Rp ${fmt(form.pengeluaran||0)}` },
                  { label:"Laba",       value:`Rp ${fmt((form.pendapatan||0)-(form.pengeluaran||0))}` },
                  { label:"Pembeli",    value:`${form.jumlah_pembeli||0} orang` },
                ].map(r=>(
                  <div key={r.label} className="flex justify-between text-xs">
                    <span className="text-gray-400">{r.label}</span>
                    <span className="font-semibold text-gray-700">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
          {step > 0
            ? <button onClick={back} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">← Kembali</button>
            : <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">Batal</button>
          }
          {step < WIZARD_STEPS.length - 1
            ? <button onClick={next} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#22C55E] text-white hover:bg-[#15803D] active:scale-95 transition-all">Lanjut →</button>
            : <button onClick={submit} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#16A34A] text-white hover:bg-[#15803D] active:scale-95 transition-all flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                Simpan Data
              </button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Input Harian ────────────────────────────────────────
function TabInputHarian({ onOpenModal }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  const handlePilihTanggal = (ymd, data) => {
    if (selectedDate === ymd) { setSelectedDate(null); setSelectedData(null); return; }
    setSelectedDate(ymd);
    setSelectedData(data || null);
  };

  const progress = (SIKLUS_INFO.jumlah_data_terisi / SIKLUS_INFO.jumlah_data_dibutuhkan) * 100;

  return (
    <div className="space-y-4">
      {/* Progress siklus mini */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-gray-400">Siklus #{SIKLUS_INFO.siklus_ke} · {fmtDate(SIKLUS_INFO.dari)} — {fmtDate(SIKLUS_INFO.sampai)}</p>
          </div>
          <p className="text-sm font-black text-[#15803D]">{SIKLUS_INFO.jumlah_data_terisi}<span className="text-xs font-semibold text-gray-400">/{SIKLUS_INFO.jumlah_data_dibutuhkan}</span></p>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#22C55E] rounded-full transition-all duration-700" style={{ width:`${progress}%` }}/>
        </div>
        {!SIKLUS_INFO.data_lengkap && (
          <p className="mt-2 text-xs text-[#22C55E] font-medium">Lengkapi {SIKLUS_INFO.jumlah_data_dibutuhkan - SIKLUS_INFO.jumlah_data_terisi} hari lagi untuk generate analisa AI</p>
        )}
      </div>

      {/* Kalender */}
      <Kalender
        dataHarian={DUMMY_DATA_HARIAN}
        siklusInfo={SIKLUS_INFO}
        onPilihTanggal={handlePilihTanggal}
      />

      {/* Detail hari yang dipilih */}
      {selectedDate && (
        <DetailHariCard
          tanggal={selectedDate}
          data={selectedData}
          onInput={(tgl) => onOpenModal(tgl)}
          onClose={() => { setSelectedDate(null); setSelectedData(null); }}
        />
      )}

      {/* Tombol input hari ini shortcut */}
      {!selectedDate && (
        <button onClick={() => onOpenModal(toYMD(new Date()))}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#22C55E] text-white text-sm font-semibold shadow-sm shadow-[#BBF7D0] hover:bg-[#15803D] active:scale-95 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Input Data Hari Ini
        </button>
      )}
    </div>
  );
}

// ─── Tab: Generate ────────────────────────────────────────────
function TabGenerate() {
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const progress = (SIKLUS_INFO.jumlah_data_terisi / SIKLUS_INFO.jumlah_data_dibutuhkan) * 100;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Status Siklus #{SIKLUS_INFO.siklus_ke}</p>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-3xl font-black text-gray-900">{SIKLUS_INFO.jumlah_data_terisi}</span>
          <span className="text-sm text-gray-400 mb-1">/ {SIKLUS_INFO.jumlah_data_dibutuhkan} hari terisi</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className={`h-full rounded-full transition-all duration-700 ${progress>=100?"bg-[#16A34A]":"bg-[#22C55E]"}`} style={{width:`${progress}%`}}/>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            {label:"Data terisi",value:SIKLUS_INFO.jumlah_data_terisi,icon:<SlCalender size={16} className="text-gray-400" />},
            {label:"Dibutuhkan", value:SIKLUS_INFO.jumlah_data_dibutuhkan,icon:"target"},
            {label:"Sisa hari",  value:SIKLUS_INFO.jumlah_data_dibutuhkan-SIKLUS_INFO.jumlah_data_terisi,icon:"⏳"},
          ].map(s=>(
            <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-lg">{s.icon}</span>
              <p className="text-base font-black text-gray-800 mt-0.5">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2"><LuMap size={14} className="text-[#15803D] shrink-0" /><p className="text-xs font-bold text-[#15803D]">Orientasi AI Aktif</p></div>
        <p className="text-xs text-[#15803D] leading-relaxed">AI akan menganalisa berdasarkan <strong>roadmap aktif</strong> kamu. Jika tidak ada roadmap, analisa mengacu pada tujuan bisnis.</p>
      </div>

      {!done ? (
        <button onClick={() => { setLoading(true); setTimeout(()=>{setLoading(false);setDone(true);},2500); }}
          disabled={loading || !SIKLUS_INFO.bisa_generate}
          className={`w-full py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${SIKLUS_INFO.bisa_generate?"bg-[#22C55E] text-white shadow-sm shadow-[#BBF7D0] hover:bg-[#15803D] active:scale-95":"bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
          {loading ? (<><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Gemini sedang menganalisa…</>)
            : (<><LuSparkles size={16} />{SIKLUS_INFO.bisa_generate?"Generate Analisa AI":`Data kurang ${SIKLUS_INFO.jumlah_data_dibutuhkan-SIKLUS_INFO.jumlah_data_terisi} hari lagi`}</>)}
        </button>
      ) : (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-5 text-center space-y-2">
          <div className="w-12 h-12 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto"><LuCheck size={24} className="text-[#16A34A]" /></div>
          <p className="text-sm font-bold text-[#15803D]">Analisa berhasil digenerate!</p>
          <p className="text-xs text-[#16A34A]">Lihat hasilnya di tab Riwayat</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Syarat Generate</p>
        <div className="space-y-2">
          {[
            {label:"Data 14 hari terisi semua",    ok:SIKLUS_INFO.data_lengkap},
            {label:"Belum dianalisa siklus ini",   ok:!SIKLUS_INFO.sudah_dianalisa},
            {label:"Ada koneksi internet",         ok:true},
          ].map(s=>(
            <div key={s.label} className="flex items-center gap-2.5">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${s.ok?"bg-[#DCFCE7]":"bg-gray-100"}`}>
                {s.ok ? <svg className="w-2.5 h-2.5 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300"/>}
              </div>
              <span className={`text-xs font-medium ${s.ok?"text-gray-700":"text-gray-400"}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Riwayat ─────────────────────────────────────────────
function TabRiwayat() {
  const [expanded, setExpanded] = useState(null);
  const grouped = DUMMY_ANALISA.reduce((acc,a) => {
    const key = a.created_at.split("T")[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).sort(([a],[b])=>new Date(b)-new Date(a)).map(([date,items]) => {
        const eval_ = items.find(i=>i.tipe_eval==="eval");
        const plan  = items.find(i=>i.tipe_eval==="plan");
        const isOpen = expanded === date;
        return (
          <div key={date} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 text-left" onClick={()=>setExpanded(isOpen?null:date)}>
              <div>
                <p className="text-xs text-gray-400 font-medium">Analisa Siklus</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{fmtDate(date)}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${eval_?.orientasi_pakai==="roadmap"?"bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]":"bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]"}`}>
                    {eval_?.orientasi_pakai==="roadmap" ? <><LuMap size={11} /> Roadmap</> : <><LuTarget size={11} /> Tujuan Bisnis</>}
                  </span>
                  {eval_ && <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><LuChartColumnBig  size={10} /> Evaluasi</span>}
                  {plan  && <span className="text-xs bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><LuClipboardList size={10} /> Rencana</span>}
                </div>
              </div>
              <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen?"rotate-180":""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                {eval_ && (
                  <div>
                    <div className="flex items-center gap-2 mb-2"><LuChartColumnBig  size={14} className="text-gray-500 shrink-0" /><p className="text-xs font-bold text-gray-700">Evaluasi</p><span className="text-xs text-gray-400">{fmtTime(eval_.created_at)}</span></div>
                    <div className="bg-blue-50 rounded-xl p-3.5 text-xs text-blue-900 leading-relaxed border border-blue-100">{eval_.pesan}</div>
                  </div>
                )}
                {plan && (
                  <div>
                    <div className="flex items-center gap-2 mb-2"><LuClipboardList size={14} className="text-gray-500 shrink-0" /><p className="text-xs font-bold text-gray-700">Rekomendasi</p><span className="text-xs text-gray-400">{fmtTime(plan.created_at)}</span></div>
                    <div className="bg-[#F0FDF4] rounded-xl p-3.5 border border-[#DCFCE7]">
                      {plan.pesan.split("\n").filter(Boolean).map((line,i)=>(
                        <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                          <div className="w-5 h-5 rounded-full bg-[#BBF7D0] text-[#15803D] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</div>
                          <p className="text-xs text-[#14532D] leading-relaxed">{line.replace(/^\d+\.\s*/,"")}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
const TABS = [
  { key:"input",    label:"Input Harian", icon:<SlCalender size={14} /> },
  { key:"generate", label:"Generate",     icon:<LuSparkles size={14} /> },
  { key:"riwayat",  label:"Riwayat",      icon:<LuClipboardList size={14} /> },
];

export default function Analisis() {
  const [tab, setTab]             = useState("input");
  const [showModal, setShowModal] = useState(false);
  const [modalTanggal, setModalTanggal] = useState(null);

  const openModal = (tgl) => { setModalTanggal(tgl); setShowModal(true); };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 lg:px-8 pt-10 lg:pt-6 pb-0">
        <div className="max-w-2xl lg:mx-0">
          <p className="text-xs font-semibold text-[#22C55E] uppercase tracking-widest mb-0.5">AI Insights</p>
          <h1 className="text-xl font-bold text-gray-900 mb-4">Analisa Bisnis</h1>
        </div>
        <div className="flex gap-0 max-w-2xl lg:mx-0">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${tab===t.key?"border-[#22C55E] text-[#15803D]":"border-transparent text-gray-400 hover:text-gray-600"}`}>
              <span>{t.icon}</span>{t.label}
              {t.key==="input" && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab==="input"?"bg-[#DCFCE7] text-[#15803D]":"bg-gray-100 text-gray-400"}`}>
                  {SIKLUS_INFO.jumlah_data_terisi}/{SIKLUS_INFO.jumlah_data_dibutuhkan}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 lg:px-8 pt-5 pb-28 lg:pb-10 max-w-2xl lg:mx-0">
        {tab==="input"    && <TabInputHarian onOpenModal={openModal} />}
        {tab==="generate" && <TabGenerate />}
        {tab==="riwayat"  && <TabRiwayat />}
      </div>

      {showModal && (
        <InputHarianModal
          tanggalAwal={modalTanggal}
          onClose={() => { setShowModal(false); setModalTanggal(null); }}
          onSave={data => console.log("Simpan:", data)}
        />
      )}
    </div>
  );
}