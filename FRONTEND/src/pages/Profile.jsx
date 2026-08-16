import { useState } from "react";
import { LuStore, LuChartBar, LuUser } from "react-icons/lu";
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

// ─── Dummy data ───────────────────────────────────────────────
const BISNIS = {
    id: 1,
    bisnis_nama: "Warung Makan Bu Sari",
    bisnis_tipe: "jasa",
    bisnis_mulai: "2022-03-15",
    bisnis_buka: "07:00",
    bisnis_tutup: "21:00",
    jumlah_pegawai: 4,
    target_market: "Pelajar dan karyawan sekitar kawasan industri",
    tujuan_bisnis: ["menaikkan omset", "menambah pelanggan tetap"],
    reward_threshold: 10,
    QR_image_url: null,
};

const USER = { full_name: "Sari Dewi", email: "sari@example.com" };

const PRODUK_LIST = [
    { id: 1, produk_nama: "Nasi Ayam Goreng", produk_harga: 15000, net_profit_margin: 35, produk_image_url: null },
    { id: 2, produk_nama: "Es Teh Manis", produk_harga: 5000, net_profit_margin: 60, produk_image_url: null },
    { id: 3, produk_nama: "Nasi Capcay", produk_harga: 18000, net_profit_margin: 30, produk_image_url: null },
    { id: 4, produk_nama: "Jus Alpukat", produk_harga: 12000, net_profit_margin: 45, produk_image_url: null },
];

const REVENUE_DATA = [
    { label: "1 Jul", pendapatan: 1350000, pengeluaran: 520000 },
    { label: "2 Jul", pendapatan: 980000, pengeluaran: 430000 },
    { label: "3 Jul", pendapatan: 1120000, pengeluaran: 470000 },
    { label: "4 Jul", pendapatan: 890000, pengeluaran: 390000 },
    { label: "5 Jul", pendapatan: 1450000, pengeluaran: 560000 },
    { label: "6 Jul", pendapatan: 760000, pengeluaran: 340000 },
    { label: "7 Jul", pendapatan: 1100000, pengeluaran: 450000 },
];

const TOP_PRODUK_DATA = [
    { name: "Nasi Ayam", hari: 10 },
    { name: "Es Teh", hari: 7 },
    { name: "Nasi Cap.", hari: 4 },
    { name: "Jus Alpukat", hari: 2 },
];

const TUJUAN_OPTIONS = [
    "menaikkan omset",
    "menambah pelanggan tetap",
    "mengurangi biaya operasional",
    "Meningkatkan keuntungan",
];

// ─── Helpers ──────────────────────────────────────────────────
const fmt = v => new Intl.NumberFormat("id-ID").format(v);
const fmtDate = s => new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const initials = name => name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

// ─── Field component ──────────────────────────────────────────
function Field({ label, error, children, hint }) {
    return (
        <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</label>
            {children}
            {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function Input({ error, ...props }) {
    return (
        <input {...props}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
        ${error ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22C55E] focus:ring-2 focus:ring-[#DCFCE7]"}`}
        />
    );
}

// ─── Modal wrapper ────────────────────────────────────────────
function Modal({ title, subtitle, onClose, onSave, saveLabel = "Simpan", children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
                <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">{title}</h2>
                        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">{children}</div>
                <div className="flex gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">Batal</button>
                    <button onClick={onSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#22C55E] text-white hover:bg-[#15803D] active:scale-95 transition-all">{saveLabel}</button>
                </div>
            </div>
        </div>
    );
}

// ─── Edit Bisnis Modal ────────────────────────────────────────
function EditBisnisModal({ bisnis, onClose, onSave }) {
    const [form, setForm] = useState({ ...bisnis });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const toggleTujuan = (val) => {
        const curr = form.tujuan_bisnis || [];
        set("tujuan_bisnis", curr.includes(val) ? curr.filter(v => v !== val) : [...curr, val]);
    };

    return (
        <Modal title="Edit Info Bisnis" subtitle="Perubahan akan mempengaruhi orientasi analisa AI" onClose={onClose} onSave={() => onSave(form)}>
            <Field label="Nama Bisnis"><Input value={form.bisnis_nama} onChange={e => set("bisnis_nama", e.target.value)} /></Field>

            <Field label="Tipe Bisnis">
                <div className="grid grid-cols-2 gap-2">
                    {["barang", "jasa"].map(t => (
                        <button key={t} type="button" onClick={() => set("bisnis_tipe", t)}
                            className={`py-2.5 rounded-xl border-2 text-sm font-medium capitalize transition-all ${form.bisnis_tipe === t ? "border-[#22C55E] bg-[#F0FDF4] text-[#15803D]" : "border-gray-200 text-gray-500"}`}>
                            {t === "barang" ? "Barang" : "Jasa"}
                        </button>
                    ))}
                </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
                <Field label="Jam Buka"><Input type="time" value={form.bisnis_buka} onChange={e => set("bisnis_buka", e.target.value)} /></Field>
                <Field label="Jam Tutup"><Input type="time" value={form.bisnis_tutup} onChange={e => set("bisnis_tutup", e.target.value)} /></Field>
            </div>

            <Field label="Jumlah Pegawai">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => set("jumlah_pegawai", Math.max(1, form.jumlah_pegawai - 1))}
                        className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-600 text-lg font-bold hover:border-[#86EFAC] transition-all">−</button>
                    <div className="flex-1 text-center py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xl font-bold text-gray-800">{form.jumlah_pegawai}</div>
                    <button type="button" onClick={() => set("jumlah_pegawai", form.jumlah_pegawai + 1)}
                        className="w-10 h-10 rounded-xl border-2 border-gray-200 text-gray-600 text-lg font-bold hover:border-[#86EFAC] transition-all">+</button>
                </div>
            </Field>

            <Field label="Target Market"><Input value={form.target_market} onChange={e => set("target_market", e.target.value)} /></Field>

            <Field label="Reward Threshold" hint="Jumlah kunjungan minimum untuk member dapat reward">
                <Input type="number" min="1" value={form.reward_threshold ?? ""} onChange={e => set("reward_threshold", e.target.value)} placeholder="10" />
            </Field>

            <Field label="Tujuan Bisnis">
                <div className="space-y-2">
                    {TUJUAN_OPTIONS.map(t => {
                        const active = (form.tujuan_bisnis || []).includes(t);
                        return (
                            <button key={t} type="button" onClick={() => toggleTujuan(t)}
                                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 text-left transition-all ${active ? "border-[#22C55E] bg-[#F0FDF4]" : "border-gray-200 bg-white"}`}>
                                <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${active ? "border-[#22C55E] bg-[#F0FDF4]0" : "border-gray-300"}`}>
                                    {active && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className={`text-xs font-medium ${active ? "text-[#15803D]" : "text-gray-600"}`}>{t}</span>
                            </button>
                        );
                    })}
                </div>
            </Field>
        </Modal>
    );
}

// ─── Edit Produk Modal ────────────────────────────────────────
function EditProdukModal({ produk, onClose, onSave }) {
    const [form, setForm] = useState({ ...produk });
    const [preview, setPreview] = useState(produk.produk_image_url);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        set("produk_image", file);
        setPreview(URL.createObjectURL(file));
    };

    return (
        <Modal title="Edit Produk" subtitle={produk.produk_nama} onClose={onClose} onSave={() => onSave(form)}>
            {/* Foto produk */}
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-[#86EFAC] transition-all"
                    onClick={() => document.getElementById("img-upload").click()}>
                    {preview
                        ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                        : <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>}
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-700">Foto Produk</p>
                    <p className="text-xs text-gray-400 mt-0.5">Akan dipotong 1:1 · Max 2MB</p>
                    <button onClick={() => document.getElementById("img-upload").click()}
                        className="mt-2 text-xs text-[#15803D] font-semibold hover:text-[#14532D]">{preview ? "Ganti Foto" : "Upload Foto"}</button>
                </div>
                <input id="img-upload" type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </div>

            <Field label="Nama Produk"><Input value={form.produk_nama} onChange={e => set("produk_nama", e.target.value)} /></Field>

            <div className="grid grid-cols-2 gap-3">
                <Field label="Harga (Rp)"><Input type="number" min="0" value={form.produk_harga} onChange={e => set("produk_harga", e.target.value)} /></Field>
                <Field label="Net Profit Margin (%)" hint="Opsional">
                    <Input type="number" min="0" max="100" step="0.1" value={form.net_profit_margin ?? ""} onChange={e => set("net_profit_margin", e.target.value)} placeholder="35" />
                </Field>
            </div>
        </Modal>
    );
}

// ─── Tambah Produk Modal ──────────────────────────────────────
function TambahProdukModal({ bisnisId, onClose, onSave }) {
    const [form, setForm] = useState({ produk_nama: "", produk_harga: "", net_profit_margin: "", produk_image: null });
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => { const n = { ...e }; delete n[k]; return n; }); };

    const validate = () => {
        const e = {};
        if (!form.produk_nama.trim()) e.produk_nama = "Nama wajib diisi";
        if (!form.produk_harga || Number(form.produk_harga) < 0) e.produk_harga = "Harga tidak valid";
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        set("produk_image", file);
        setPreview(URL.createObjectURL(file));
    };

    return (
        <Modal title="Tambah Produk" onClose={onClose} onSave={() => { if (validate()) onSave({ ...form, id: Date.now() }); }}>
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-[#86EFAC] transition-all"
                    onClick={() => document.getElementById("img-upload-new").click()}>
                    {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> :
                        <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>}
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-700">Foto Produk</p>
                    <p className="text-xs text-gray-400 mt-0.5">Opsional · Dipotong 1:1</p>
                    <button onClick={() => document.getElementById("img-upload-new").click()} className="mt-2 text-xs text-[#15803D] font-semibold hover:text-[#14532D]">Upload</button>
                </div>
                <input id="img-upload-new" type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </div>
            <Field label="Nama Produk" error={errors.produk_nama}>
                <Input value={form.produk_nama} onChange={e => set("produk_nama", e.target.value)} placeholder="Nasi Goreng Spesial" error={errors.produk_nama} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Harga (Rp)" error={errors.produk_harga}>
                    <Input type="number" min="0" value={form.produk_harga} onChange={e => set("produk_harga", e.target.value)} placeholder="15000" error={errors.produk_harga} />
                </Field>
                <Field label="NPM (%)" hint="Opsional">
                    <Input type="number" min="0" max="100" step="0.1" value={form.net_profit_margin} onChange={e => set("net_profit_margin", e.target.value)} placeholder="35" />
                </Field>
            </div>
        </Modal>
    );
}

// ─── Custom tooltip chart ─────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2.5 text-xs">
            <p className="font-bold text-gray-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-medium">
                    {p.name}: Rp {fmt(p.value)}
                </p>
            ))}
        </div>
    );
}

// ─── Tab Bisnis ───────────────────────────────────────────────
function TabBisnis({ bisnis, onEdit }) {
    const INFO = [
        { label: "Tipe Bisnis", value: bisnis.bisnis_tipe === "jasa" ? "Jasa" : "Barang" },
        { label: "Mulai Beroperasi", value: fmtDate(bisnis.bisnis_mulai) },
        { label: "Jam Operasional", value: `${bisnis.bisnis_buka} – ${bisnis.bisnis_tutup}` },
        { label: "Jumlah Pegawai", value: `${bisnis.jumlah_pegawai} orang` },
        { label: "Target Market", value: bisnis.target_market },
        { label: "Reward Threshold", value: bisnis.reward_threshold ? `${bisnis.reward_threshold} kunjungan` : "Belum diatur" },
    ];

    return (
        <div className="space-y-4">
            {/* Info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Info Bisnis</p>
                    <button onClick={onEdit} className="flex items-center gap-1 text-xs font-semibold text-[#15803D] hover:text-[#14532D] transition-colors duration-300">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit
                    </button>
                </div>
                <div className="divide-y divide-gray-50">
                    {INFO.map(r => (
                        <div key={r.label} className="flex items-start justify-between px-4 py-3 gap-3">
                            <span className="text-xs text-gray-400 shrink-0 mt-0.5">{r.label}</span>
                            <span className="text-xs font-semibold text-gray-800 text-right">{r.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tujuan bisnis */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 transition-shadow duration-300 hover:shadow-md">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Tujuan Bisnis</p>
                <div className="flex flex-wrap gap-2">
                    {bisnis.tujuan_bisnis.map(t => (
                        <span key={t} className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]">{t}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Tab Produk ───────────────────────────────────────────────
function TabProduk({ produkList, onEdit, onAdd }) {
    return (
        <div className="space-y-3">
            {produkList.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 transition-all duration-300 hover:shadow-md hover:border-[#DCFCE7]">
                    {/* Foto */}
                    <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                        {p.produk_image_url
                            ? <img src={p.produk_image_url} alt={p.produk_nama} className="w-full h-full object-cover" />
                            : <span className="text-xl text-gray-300 font-bold">?</span>}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{p.produk_nama}</p>
                        <p className="text-sm font-semibold text-[#15803D] mt-0.5">Rp {fmt(p.produk_harga)}</p>
                        {p.net_profit_margin != null && (
                            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] font-semibold border border-[#DCFCE7]">
                                NPM {p.net_profit_margin}%
                            </span>
                        )}
                    </div>

                    {/* Edit */}
                    <button onClick={() => onEdit(p)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#F0FDF4] hover:text-[#15803D] transition-all shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                </div>
            ))}

            {/* Tambah produk */}
            <button onClick={onAdd}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-[#86EFAC] text-[#15803D] text-sm font-semibold hover:bg-[#F0FDF4] hover:border-[#22C55E] transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Tambah Produk
            </button>
        </div>
    );
}

// ─── Tab Chart ────────────────────────────────────────────────
function TabChart() {
    const totalPendapatan = REVENUE_DATA.reduce((s, d) => s + d.pendapatan, 0);
    const totalPengeluaran = REVENUE_DATA.reduce((s, d) => s + d.pengeluaran, 0);
    const totalLaba = totalPendapatan - totalPengeluaran;

    return (
        <div className="space-y-5">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-2.5">
                {[
                    { label: "Pendapatan", value: totalPendapatan, color: "text-[#15803D]", bg: "bg-[#F0FDF4]" },
                    { label: "Pengeluaran", value: totalPengeluaran, color: "text-red-500", bg: "bg-red-50" },
                    { label: "Laba", value: totalLaba, color: "text-[#16A34A]", bg: "bg-[#F0FDF4]" },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
                        <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                        <p className={`text-xs font-black ${s.color} leading-tight`}>Rp {fmt(Math.round(s.value / 1000))}rb</p>
                    </div>
                ))}
            </div>

            {/* Revenue line chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Revenue 7 Hari Terakhir</p>
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip content={<ChartTooltip />} />
                        <Line type="monotone" dataKey="pendapatan" name="Pendapatan" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: "#6366f1" }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#f87171" strokeWidth={2.5} dot={{ r: 3, fill: "#f87171" }} activeDot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-3 justify-center">
                    {[{ color: "#6366f1", label: "Pendapatan" }, { color: "#f87171", label: "Pengeluaran" }].map(l => (
                        <div key={l.label} className="flex items-center gap-1.5">
                            <div className="w-3 h-1.5 rounded-full" style={{ background: l.color }} />
                            <span className="text-xs text-gray-400">{l.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top produk bar chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Top Produk Terlaris</p>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={TOP_PRODUK_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barSize={28}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={20} />
                        <Tooltip formatter={v => [`${v} hari`, "Hari Terlaris"]} labelStyle={{ fontWeight: 700, fontSize: 12 }} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                        <Bar dataKey="hari" fill="#818cf8" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-xs text-gray-400 mt-2">Berdasarkan frekuensi jadi produk terlaris</p>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────
function TabIcon({ name }) {
    if (name === "store") return <LuStore size={12} />;
    if (name === "chart") return <LuChartBar size={12} />;
    if (name === "user")  return <LuUser size={12} />;
    return null;
}

const TABS = [
    { key: "bisnis", label: "Bisnis", icon: "store" },
    { key: "produk", label: "Produk", icon: "user" },
    { key: "chart",  label: "Recap",  icon: "chart" },
];

export default function Profile() {
    const [tab, setTab] = useState("bisnis");
    const [bisnis, setBisnis] = useState(BISNIS);
    const [produkList, setProdukList] = useState(PRODUK_LIST);
    const [modal, setModal] = useState(null); // "edit-bisnis" | "edit-produk" | "tambah-produk"
    const [editTarget, setEditTarget] = useState(null);

    const openEditProduk = (p) => { setEditTarget(p); setModal("edit-produk"); };
    const closeModal = () => { setModal(null); setEditTarget(null); };

    const saveBisnis = (updated) => { setBisnis(updated); closeModal(); };
    const saveProduk = (updated) => {
        setProdukList(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
        closeModal();
    };
    const tambahProduk = (newP) => {
        setProdukList(prev => [...prev, { ...newP, bisnis_id: bisnis.id }]);
        closeModal();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <style>{`
                .profile-layout { display: block; }
                .profile-sidebar { display: none; }
                .profile-mobile-header { display: block; }
                .profile-content { padding: 16px 16px 100px; }
                @media (min-width: 1024px) {
                    .profile-layout {
                        display: grid;
                        grid-template-columns: 280px 1fr;
                        min-height: 100vh;
                        align-items: start;
                    }
                    .profile-sidebar {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        position: sticky;
                        top: 24px;
                        padding: 28px 20px 28px 28px;
                    }
                    .profile-mobile-header { display: none; }
                    .profile-content { padding: 28px 28px 40px 12px; }
                    .profile-tabs-mobile { display: none !important; }
                }
            `}</style>

            <div className="profile-layout">

                {/* ── Desktop Sidebar ── */}
                <aside className="profile-sidebar">

                    {/* Avatar card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 transition-shadow duration-300 hover:shadow-md">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-2xl bg-[#22C55E] flex items-center justify-center text-white text-2xl font-black shadow-sm shadow-[#BBF7D0] mb-3">
                                {initials(USER.full_name)}
                            </div>
                            <h2 className="text-base font-black text-gray-900 leading-snug mb-0.5">{bisnis.bisnis_nama}</h2>
                            <p className="text-xs text-gray-400">{USER.full_name}</p>
                            <p className="text-xs text-gray-400 mb-3">{USER.email}</p>
                            <div className="flex flex-wrap justify-center gap-1.5">
                                <span className="text-xs px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#15803D] font-semibold border border-[#DCFCE7] capitalize">
                                    {bisnis.bisnis_tipe}
                                </span>
                                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-semibold">
                                    {bisnis.jumlah_pegawai} pegawai
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Nav links */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {TABS.map(t => (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-300 border-l-2 ${
                                    tab === t.key
                                        ? 'border-[#22C55E] bg-[#F0FDF4] text-[#15803D]'
                                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}>
                                <TabIcon name={t.icon} />{t.label}
                            </button>
                        ))}
                    </div>

                    {/* Logout */}
                    <button className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-all duration-300 active:scale-95">
                        Logout
                    </button>
                </aside>

                {/* ── Main content area ── */}
                <div>
                    {/* Mobile header (hidden on desktop) */}
                    <div className="profile-mobile-header bg-white border-b border-gray-100 px-4 pt-10 pb-0">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-16 h-16 rounded-2xl bg-[#22C55E] flex items-center justify-center text-white text-xl font-black shrink-0 shadow-sm shadow-[#BBF7D0]">
                                {initials(USER.full_name)}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg font-black text-gray-900 truncate">{bisnis.bisnis_nama}</h1>
                                <p className="text-xs text-gray-400 mt-0.5">{USER.full_name} · {USER.email}</p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D] font-semibold border border-[#DCFCE7] capitalize">
                                        {bisnis.bisnis_tipe}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                                        {bisnis.jumlah_pegawai} pegawai
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-0">
                            {TABS.map(t => (
                                <button key={t.key} onClick={() => setTab(t.key)}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                                        tab === t.key ? 'border-[#22C55E] text-[#15803D]' : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}>
                                    <TabIcon name={t.icon} />{t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab content */}
                    <div className="profile-content">
                        {tab === "bisnis" && <TabBisnis bisnis={bisnis} onEdit={() => setModal("edit-bisnis")} />}
                        {tab === "produk" && <TabProduk produkList={produkList} onEdit={openEditProduk} onAdd={() => setModal("tambah-produk")} />}
                        {tab === "chart" && <TabChart />}
                    </div>
                </div>
            </div>

            {/* Mobile logout (fixed) */}
            <button className="lg:hidden fixed bottom-4 right-4 px-5 py-3.5 rounded-full bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all">
                Logout
            </button>

            {/* ── Modals ── */}
            {modal === "edit-bisnis" && <EditBisnisModal bisnis={bisnis} onClose={closeModal} onSave={saveBisnis} />}
            {modal === "edit-produk" && editTarget && <EditProdukModal produk={editTarget} onClose={closeModal} onSave={saveProduk} />}
            {modal === "tambah-produk" && <TambahProdukModal bisnisId={bisnis.id} onClose={closeModal} onSave={tambahProduk} />}
        </div>
    );
}