import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { LuStore, LuChartBar, LuUser, LuDownload } from "react-icons/lu";
import * as XLSX from "xlsx";
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

// ─── Opsi statis ────────────────────────────────────────────────
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

// ─── Export Excel ─────────────────────────────────────────────
function exportToExcel({ bisnis, produkList, revenueData }) {
    const wb = XLSX.utils.book_new();

    // ── Helper: style header row ──
    const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" }, name: "Arial", sz: 10 },
        fill: { fgColor: { rgb: "16A34A" }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
            top: { style: "thin", color: { rgb: "D1FAE5" } },
            bottom: { style: "thin", color: { rgb: "D1FAE5" } },
            left: { style: "thin", color: { rgb: "D1FAE5" } },
            right: { style: "thin", color: { rgb: "D1FAE5" } },
        },
    };
    const cellStyle = {
        font: { name: "Arial", sz: 10 },
        alignment: { vertical: "center" },
        border: {
            top: { style: "thin", color: { rgb: "E5E7EB" } },
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } },
            right: { style: "thin", color: { rgb: "E5E7EB" } },
        },
    };
    const currencyFmt = '"Rp "#,##0';

    function applyStyles(ws, headerRow, dataRows, cols) {
        // Header
        cols.forEach((_, ci) => {
            const addr = XLSX.utils.encode_cell({ r: headerRow, c: ci });
            if (ws[addr]) ws[addr].s = headerStyle;
        });
        // Data rows
        for (let ri = headerRow + 1; ri <= headerRow + dataRows; ri++) {
            cols.forEach((col, ci) => {
                const addr = XLSX.utils.encode_cell({ r: ri, c: ci });
                if (ws[addr]) {
                    ws[addr].s = { ...cellStyle };
                    if (col.currency) ws[addr].z = currencyFmt;
                    if (col.pct) ws[addr].z = "0.0%";
                }
            });
        }
        // Col widths
        ws["!cols"] = cols.map(c => ({ wch: c.w || 20 }));
    }

    // ── Sheet 1: Info Bisnis ──
    const infoRows = [
        ["Field", "Data"],
        ["Nama Bisnis", bisnis.bisnis_nama],
        ["Tipe", bisnis.bisnis_tipe],
        ["Tanggal Mulai", bisnis.bisnis_mulai ? fmtDate(bisnis.bisnis_mulai) : "-"],
        ["Jam Buka", bisnis.bisnis_buka],
        ["Jam Tutup", bisnis.bisnis_tutup],
        ["Jumlah Pegawai", bisnis.jumlah_pegawai],
        ["Target Market", bisnis.target_market],
        ["Tujuan Bisnis", (bisnis.tujuan_bisnis || []).join(", ")],
        ["Reward Threshold", bisnis.reward_threshold + " kunjungan"],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(infoRows);
    applyStyles(ws1, 0, infoRows.length - 1, [
        { w: 22 }, { w: 40 },
    ]);
    ws1["!rows"] = infoRows.map(() => ({ hpt: 18 }));
    XLSX.utils.book_append_sheet(wb, ws1, "Info Bisnis");

    // ── Sheet 2: Daftar Produk ──
    const produkHeader = ["No", "Nama Produk", "Harga (Rp)", "Net Profit Margin (%)"];
    const produkRows = produkList.map((p, i) => [
        i + 1,
        p.produk_nama,
        p.produk_harga,
        p.net_profit_margin != null ? p.net_profit_margin / 100 : null,
    ]);
    const ws2 = XLSX.utils.aoa_to_sheet([produkHeader, ...produkRows]);
    applyStyles(ws2, 0, produkRows.length, [
        { w: 6 }, { w: 28 }, { w: 18, currency: true }, { w: 24, pct: true },
    ]);
    XLSX.utils.book_append_sheet(wb, ws2, "Produk");

    // ── Sheet 3: Rekap Pendapatan ──
    const rekapHeader = ["Tanggal", "Pendapatan (Rp)", "Pengeluaran (Rp)", "Laba Bersih (Rp)"];
    const rekapRows = revenueData.map(r => [
        r.label,
        r.pendapatan,
        r.pengeluaran,
        r.pendapatan - r.pengeluaran,
    ]);
    // Totals row
    const totalPendapatan = revenueData.reduce((s, r) => s + r.pendapatan, 0);
    const totalPengeluaran = revenueData.reduce((s, r) => s + r.pengeluaran, 0);
    rekapRows.push(["TOTAL", totalPendapatan, totalPengeluaran, totalPendapatan - totalPengeluaran]);

    const ws3 = XLSX.utils.aoa_to_sheet([rekapHeader, ...rekapRows]);
    applyStyles(ws3, 0, rekapRows.length, [
        { w: 14 }, { w: 22, currency: true }, { w: 22, currency: true }, { w: 22, currency: true },
    ]);

    // Bold the totals row
    const totalRowIdx = rekapRows.length; // 0-indexed after header
    [0, 1, 2, 3].forEach(ci => {
        const addr = XLSX.utils.encode_cell({ r: totalRowIdx, c: ci });
        if (ws3[addr]) {
            ws3[addr].s = {
                ...cellStyle,
                font: { ...cellStyle.font, bold: true },
                fill: { fgColor: { rgb: "F0FDF4" }, patternType: "solid" },
            };
        }
    });

    XLSX.utils.book_append_sheet(wb, ws3, "Rekap Pendapatan");

    // ── Download ──
    const fileName = `Data_Bisnis_${bisnis.bisnis_nama.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

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
function Modal({ title, subtitle, onClose, onSave, saveLabel = "Simpan", error, children }) {
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
                {error && (
                    <div className="px-5 pb-2 shrink-0">
                        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                    </div>
                )}
                <div className="flex gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">Batal</button>
                    <button onClick={onSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#22C55E] text-white hover:bg-[#15803D] active:scale-95 transition-all">{saveLabel}</button>
                </div>
            </div>
        </div>
    );
}

// ─── Edit Bisnis Modal ────────────────────────────────────────
function EditBisnisModal({ bisnis, onClose, onSave, error }) {
    // bisnis_mulai bisa berupa string "2024-01-15" atau objek Carbon dari backend
    const normDate = (val) => {
        if (!val) return "";
        if (typeof val === "string") return val.slice(0, 10);
        return "";
    };

    const [form, setForm] = useState({
        ...bisnis,
        bisnis_mulai: normDate(bisnis.bisnis_mulai),
    });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const toggleTujuan = (val) => {
        const curr = form.tujuan_bisnis || [];
        set("tujuan_bisnis", curr.includes(val) ? curr.filter(v => v !== val) : [...curr, val]);
    };

    return (
        <Modal title="Edit Info Bisnis" subtitle="Perubahan akan mempengaruhi orientasi analisa AI" onClose={onClose} onSave={() => onSave(form)} error={error}>
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

            <Field label="Tanggal Mulai Bisnis" required hint="Digunakan sebagai titik awal siklus analisa 14 hari">
                <Input
                    type="date"
                    value={form.bisnis_mulai}
                    onChange={e => set("bisnis_mulai", e.target.value)}
                />
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
function EditProdukModal({ produk, onClose, onSave, error }) {
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
        <Modal title="Edit Produk" subtitle={produk.produk_nama} onClose={onClose} onSave={() => onSave(form)} error={error}>
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
function TambahProdukModal({ bisnisId, onClose, onSave, error }) {
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
        <Modal title="Tambah Produk" onClose={onClose} onSave={() => { if (validate()) onSave(form); }} error={error}>
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
function TabChart({ revenueData, topProdukData, loading }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <svg className="w-6 h-6 animate-spin text-[#22C55E]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            </div>
        );
    }

    const totalPendapatan = revenueData.reduce((s, d) => s + d.pendapatan, 0);
    const totalPengeluaran = revenueData.reduce((s, d) => s + d.pengeluaran, 0);
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
                {revenueData.length === 0 ? (
                    <p className="text-center text-xs text-gray-400 py-8">Belum ada data</p>
                ) : (
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip content={<ChartTooltip />} />
                        <Line type="monotone" dataKey="pendapatan" name="Pendapatan" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: "#6366f1" }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#f87171" strokeWidth={2.5} dot={{ r: 3, fill: "#f87171" }} activeDot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
                )}
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
                {topProdukData.length === 0 ? (
                    <p className="text-center text-xs text-gray-400 py-8">Belum ada data</p>
                ) : (
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={topProdukData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barSize={28}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={20} />
                        <Tooltip formatter={v => [`${v} hari`, "Hari Terlaris"]} labelStyle={{ fontWeight: 700, fontSize: 12 }} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                        <Bar dataKey="hari" fill="#818cf8" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                )}
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
    const { user, bisnis, setBisnis, logout } = useAuth();
    const [tab, setTab] = useState("bisnis");
    const [produkList, setProdukList] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [topProdukData, setTopProdukData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // "edit-bisnis" | "edit-produk" | "tambah-produk"
    const [editTarget, setEditTarget] = useState(null);
    const [saveErr, setSaveErr] = useState("");

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const today = new Date();
            const sampai = today.toISOString().slice(0, 10);
            const dari = new Date(new Date().setDate(today.getDate() - 6)).toISOString().slice(0, 10);

            const [produkRes, revRes, topRes] = await Promise.all([
                api.get('/produk?per_page=100').catch(() => null),
                api.get(`/chart/revenue?dari=${dari}&sampai=${sampai}`).catch(() => null),
                api.get(`/chart/top-product?dari=${dari}&sampai=${sampai}`).catch(() => null),
            ]);
            if (produkRes?.data?.data) setProdukList(produkRes.data.data);
            if (revRes?.data?.data) {
                const d = revRes.data.data;
                const pend = d.datasets?.find(ds => ds.key === 'pendapatan')?.data ?? [];
                const peng = d.datasets?.find(ds => ds.key === 'pengeluaran')?.data ?? [];
                setRevenueData((d.labels ?? []).map((label, i) => ({ label, pendapatan: pend[i] ?? 0, pengeluaran: peng[i] ?? 0 })));
            }
            if (topRes?.data?.data) {
                const d = topRes.data.data;
                const vals = d.datasets?.[0]?.data ?? [];
                setTopProdukData((d.labels ?? []).map((name, i) => ({ name, hari: vals[i] ?? 0 })));
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll() }, [fetchAll]);

    const openEditProduk = (p) => { setEditTarget(p); setModal("edit-produk"); };
    const closeModal = () => { setModal(null); setEditTarget(null); setSaveErr(""); };

    const saveBisnis = async (form) => {
        setSaveErr("");
        try {
            const payload = {
                bisnis_nama: form.bisnis_nama,
                bisnis_tipe: form.bisnis_tipe,
                bisnis_mulai: form.bisnis_mulai,
                bisnis_buka: form.bisnis_buka?.length === 8 ? form.bisnis_buka.slice(0, 5) : form.bisnis_buka,
                bisnis_tutup: form.bisnis_tutup?.length === 8 ? form.bisnis_tutup.slice(0, 5) : form.bisnis_tutup,
                jumlah_pegawai: Number(form.jumlah_pegawai),
                target_market: form.target_market,
                tujuan_bisnis: form.tujuan_bisnis,
            };
            const { data } = await api.put(`/bisnis/${bisnis.id}`, payload);

            // reward_threshold disimpan lewat endpoint khusus karena bukan kolom fillable di /bisnis
            if (form.reward_threshold && Number(form.reward_threshold) !== bisnis.reward_threshold) {
                await api.post('/member/reward/set', { reward_threshold: Number(form.reward_threshold) });
            }

            setBisnis(prev => ({ ...prev, ...data.data, reward_threshold: form.reward_threshold ? Number(form.reward_threshold) : prev.reward_threshold }));
            closeModal();
        } catch (err) {
            setSaveErr(err.response?.data?.message ?? 'Gagal menyimpan perubahan bisnis');
        }
    };

    const buildProdukFormData = (form) => {
        const fd = new FormData();
        fd.append('bisnis_id', bisnis.id);
        fd.append('produk_nama', form.produk_nama);
        fd.append('produk_harga', form.produk_harga);
        if (form.net_profit_margin !== "" && form.net_profit_margin != null) {
            fd.append('net_profit_margin', form.net_profit_margin);
        }
        if (form.produk_image instanceof File) {
            fd.append('produk_image', form.produk_image);
        }
        return fd;
    };

    const saveProduk = async (form) => {
        setSaveErr("");
        try {
            const fd = buildProdukFormData(form);
            fd.append('_method', 'PUT'); // Laravel method-spoofing agar multipart bisa diterima PUT
            const { data } = await api.post(`/produk/${form.id}`, fd);
            setProdukList(prev => prev.map(p => p.id === form.id ? data.data : p));
            closeModal();
        } catch (err) {
            setSaveErr(err.response?.data?.message ?? 'Gagal menyimpan produk');
        }
    };

    const tambahProduk = async (form) => {
        setSaveErr("");
        try {
            const fd = buildProdukFormData(form);
            const { data } = await api.post('/produk', fd);
            setProdukList(prev => [data.data, ...prev]);
            closeModal();
        } catch (err) {
            setSaveErr(err.response?.data?.message ?? 'Gagal menambah produk');
        }
    };

    if (!bisnis) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <svg className="w-6 h-6 animate-spin text-[#22C55E]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            </div>
        );
    }

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
                                {initials(user?.full_name ?? user?.name ?? 'U')}
                            </div>
                            <h2 className="text-base font-black text-gray-900 leading-snug mb-0.5">{bisnis.bisnis_nama}</h2>
                            <p className="text-xs text-gray-400">{user?.full_name ?? user?.name ?? '-'}</p>
                            <p className="text-xs text-gray-400 mb-3">{user?.email ?? '-'}</p>
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

                    {/* Export Excel */}
                    <button
                        onClick={() => exportToExcel({ bisnis, produkList, revenueData })}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#BBF7D0] text-[#15803D] text-sm font-semibold hover:bg-[#F0FDF4] hover:border-[#22C55E] transition-all duration-300 active:scale-95"
                    >
                        <LuDownload size={14} />
                        Unduh Data Excel
                    </button>

                    {/* Logout */}
                    <button onClick={logout} className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-all duration-300 active:scale-95">
                        Logout
                    </button>
                </aside>

                {/* ── Main content area ── */}
                <div>
                    {/* Mobile header (hidden on desktop) */}
                    <div className="profile-mobile-header bg-white border-b border-gray-100 px-4 pt-10 pb-0">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-16 h-16 rounded-2xl bg-[#22C55E] flex items-center justify-center text-white text-xl font-black shrink-0 shadow-sm shadow-[#BBF7D0]">
                                {initials(user?.full_name ?? user?.name ?? 'U')}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg font-black text-gray-900 truncate">{bisnis.bisnis_nama}</h1>
                                <p className="text-xs text-gray-400 mt-0.5">{user?.full_name ?? user?.name ?? '-'} · {user?.email ?? '-'}</p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D] font-semibold border border-[#DCFCE7] capitalize">
                                        {bisnis.bisnis_tipe}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                                        {bisnis.jumlah_pegawai} pegawai
                                    </span>
                                </div>
                            </div>
                            {/* Export button (mobile) */}
                            <button
                                onClick={() => exportToExcel({ bisnis, produkList, revenueData })}
                                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#BBF7D0] text-[#15803D] text-xs font-semibold hover:bg-[#F0FDF4] hover:border-[#22C55E] transition-all duration-300 active:scale-95"
                            >
                                <LuDownload size={13} />
                                Export
                            </button>
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
                        {tab === "chart" && <TabChart revenueData={revenueData} topProdukData={topProdukData} loading={loading} />}
                    </div>
                </div>
            </div>

            {/* Mobile logout (fixed) */}
            <button onClick={logout} className="lg:hidden fixed bottom-4 right-4 px-5 py-3.5 rounded-full bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all">
                Logout
            </button>

            {/* ── Modals ── */}
            {modal === "edit-bisnis" && <EditBisnisModal bisnis={bisnis} onClose={closeModal} onSave={saveBisnis} error={saveErr} />}
            {modal === "edit-produk" && editTarget && <EditProdukModal produk={editTarget} onClose={closeModal} onSave={saveProduk} error={saveErr} />}
            {modal === "tambah-produk" && <TambahProdukModal bisnisId={bisnis.id} onClose={closeModal} onSave={tambahProduk} error={saveErr} />}
        </div>
    );
}