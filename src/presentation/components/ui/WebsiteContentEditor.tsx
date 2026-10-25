"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImageUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import type { HeroContent } from "@/domain/entities/HeroContent";
import type { VisionMission } from "@/domain/entities/VisionMission";
import type { SiteContent } from "@/domain/entities/SiteContent";
import {
  saveSiteContentAction,
  updateHeroAction,
  updateVisionMissionAction,
  uploadSiteAssetAction,
} from "@/application/actions/adminActions";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

type EditablePublicPageKey = Exclude<keyof SiteContent["pages"], "organization">;

const editablePublicPages: Array<{
  key: EditablePublicPageKey;
  title: string;
  description: string;
  secondaryLabel?: string;
}> = [
  { key: "profile", title: "12. Halaman · Profil Program Studi", description: "Hero halaman profil TKBA dan teks dua tombol utamanya.", secondaryLabel: "Teks tombol kembali" },
  { key: "lecturers", title: "13. Halaman · Dosen TKBA", description: "Hero direktori dosen dan tombol menuju direktori serta profil program studi.", secondaryLabel: "Teks tombol profil prodi" },
  { key: "achievements", title: "14. Halaman · Prestasi", description: "Hero ruang apresiasi dan tombol navigasi utama halaman prestasi.", secondaryLabel: "Teks tombol program HMTKBA" },
  { key: "competitions", title: "15. Portal · Lomba Mahasiswa", description: "Hero portal lomba yang menggabungkan lomba manual dan sumber eksternal." },
  { key: "documents", title: "16. Halaman · Dokumentasi", description: "Hero galeri dokumentasi serta judul dan pengantar koleksi media.", secondaryLabel: "Deskripsi koleksi media" },
  { key: "dataCenter", title: "17. Halaman · Data Center", description: "Hero Data Center dan judul kartu kondisi cuaca." },
];

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-bold uppercase tracking-wide text-slate-600">{label}</span>
      {hint && <span className="block text-xs leading-5 text-slate-400">{hint}</span>}
      {children}
    </label>
  );
}

function Section({ title, description, children, open = false }: { title: string; description: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="cursor-pointer list-none px-5 py-4 marker:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-primary">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
          </div>
          <span className="text-xl font-light text-slate-400 transition group-open:rotate-45">+</span>
        </div>
      </summary>
      <div className="border-t border-slate-100 p-5">{children}</div>
    </details>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-14 cursor-pointer rounded-xl border border-slate-200 bg-white p-1" />
        <input value={value} onChange={(event) => onChange(event.target.value)} pattern="#[0-9a-fA-F]{6}" className={inputClass} />
      </div>
    </Field>
  );
}

export function WebsiteContentEditor({
  initialHero,
  initialVisionMission,
  initialSiteContent,
}: {
  initialHero: HeroContent;
  initialVisionMission: VisionMission;
  initialSiteContent: SiteContent;
}) {
  const router = useRouter();
  const [hero, setHero] = useState<HeroContent>({
    ...initialHero,
    stats: initialHero.stats?.length ? initialHero.stats : [
      { value: "80+", label: "Anggota aktif" },
      { value: "7", label: "Divisi kolaboratif" },
      { value: "12+", label: "Agenda tahunan" },
    ],
  });
  const [vision, setVision] = useState<VisionMission>(initialVisionMission);
  const [site, setSite] = useState<SiteContent>(initialSiteContent);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const saveAll = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      // Landing content is stored as one document, so these writes stay
      // sequential to preserve both Hero and Visi–Misi changes.
      await updateHeroAction(hero);
      await updateVisionMissionAction(vision);
      await saveSiteContentAction(site);
      setMessage({ type: "success", text: "Konten dan warna website berhasil diperbarui." });
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Perubahan gagal disimpan." });
    } finally {
      setSaving(false);
    }
  };

  const uploadHeroImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadSiteAssetAction(formData);
    if (result.success && result.url) {
      setHero((current) => ({ ...current, backgroundImageUrl: result.url }));
      setMessage({ type: "success", text: "Foto berhasil diunggah. Klik Simpan Semua Perubahan untuk menerapkannya." });
    } else {
      setMessage({ type: "error", text: result.error || "Foto gagal diunggah." });
    }
    setUploading(false);
  };

  const updateOrganizationPage = (
    key: keyof SiteContent["pages"]["organization"],
    value: string,
  ) => {
    setSite((current) => ({
      ...current,
      pages: {
        ...current.pages,
        organization: {
          ...current.pages.organization,
          [key]: value,
        },
      },
    }));
  };

  const updatePublicPage = (
    page: EditablePublicPageKey,
    key: keyof SiteContent["pages"][EditablePublicPageKey],
    value: string,
  ) => {
    setSite((current) => ({
      ...current,
      pages: {
        ...current.pages,
        [page]: {
          ...current.pages[page],
          [key]: value,
        },
      },
    }));
  };

  return (
    <form onSubmit={saveAll} className="space-y-4">
      <div className="rounded-2xl border border-primary/10 bg-primary px-5 py-5 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">Pusat Konten Website</p>
        <h2 className="mt-2 text-xl font-black">Atur halaman per bagian dan subbagian</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">Buka bagian yang ingin diubah. Semua kolom di bawah terhubung langsung ke website publik dan tersimpan permanen setelah tombol simpan ditekan.</p>
      </div>

      {message && (
        <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.type === "success" && <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
          {message.text}
        </div>
      )}

      <Section open title="1. Tema & Warna Global" description="Warna ini berlaku otomatis pada tombol, judul, aksen, latar, sidebar, kalender, dan footer.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {([
            ["primary", "Navy / warna utama"], ["secondary", "Biru sekunder"], ["accent", "Biru muda / aksen"],
            ["cta", "Gold / tombol aksi"], ["background", "Latar halaman"], ["cream", "Cream komponen"], ["footer", "Latar footer"],
          ] as const).map(([key, label]) => (
            <ColorField key={key} label={label} value={site.theme[key]} onChange={(value) => setSite((current) => ({ ...current, theme: { ...current.theme, [key]: value } }))} />
          ))}
        </div>
      </Section>

      <Section title="2. Identitas & Sidebar" description="Mengatur nama organisasi dan keterangan yang tampil di panel navigasi kiri.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama singkat organisasi"><input className={inputClass} value={site.sidebar.brandTitle} onChange={(e) => setSite((c) => ({ ...c, sidebar: { ...c.sidebar, brandTitle: e.target.value } }))} /></Field>
          <Field label="Keterangan di bawah nama"><input className={inputClass} value={site.sidebar.brandSubtitle} onChange={(e) => setSite((c) => ({ ...c, sidebar: { ...c.sidebar, brandSubtitle: e.target.value } }))} /></Field>
          <Field label="Nama tombol admin"><input className={inputClass} value={site.sidebar.adminTitle} onChange={(e) => setSite((c) => ({ ...c, sidebar: { ...c.sidebar, adminTitle: e.target.value } }))} /></Field>
          <Field label="Keterangan tombol admin"><input className={inputClass} value={site.sidebar.adminSubtitle} onChange={(e) => setSite((c) => ({ ...c, sidebar: { ...c.sidebar, adminSubtitle: e.target.value } }))} /></Field>
        </div>
      </Section>

      <Section open title="3. Beranda · Hero" description="Bagian paling atas: label kabinet, judul besar, deskripsi, tombol, angka ringkas, serta foto atau logo utama.">
        <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label kecil / periode"><input className={inputClass} value={hero.eyebrow || ""} onChange={(e) => setHero((c) => ({ ...c, eyebrow: e.target.value }))} /></Field>
            <Field label="Judul utama"><input className={inputClass} value={hero.title} onChange={(e) => setHero((c) => ({ ...c, title: e.target.value }))} /></Field>
            <div className="sm:col-span-2"><Field label="Deskripsi"><textarea rows={3} className={inputClass} value={hero.subtitle} onChange={(e) => setHero((c) => ({ ...c, subtitle: e.target.value }))} /></Field></div>
            <Field label="Teks tombol utama"><input className={inputClass} value={hero.ctaText} onChange={(e) => setHero((c) => ({ ...c, ctaText: e.target.value }))} /></Field>
            <Field label="Teks tombol kedua"><input className={inputClass} value={hero.secondaryCtaText || ""} onChange={(e) => setHero((c) => ({ ...c, secondaryCtaText: e.target.value }))} /></Field>
            {(hero.stats || []).map((stat, index) => (
              <div key={index} className="grid grid-cols-[.42fr_1fr] gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <Field label={`Angka ${index + 1}`}><input className={inputClass} value={stat.value} onChange={(e) => setHero((c) => ({ ...c, stats: (c.stats || []).map((item, itemIndex) => itemIndex === index ? { ...item, value: e.target.value } : item) }))} /></Field>
                <Field label={`Keterangan ${index + 1}`}><input className={inputClass} value={stat.label} onChange={(e) => setHero((c) => ({ ...c, stats: (c.stats || []).map((item, itemIndex) => itemIndex === index ? { ...item, label: e.target.value } : item) }))} /></Field>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Foto / logo hero</p>
            {hero.backgroundImageUrl && <div className="mt-3 grid min-h-52 place-items-center overflow-hidden rounded-xl bg-white p-3"><img src={hero.backgroundImageUrl} alt="Pratinjau visual hero" className="max-h-56 w-full object-contain" /></div>}
            <input className={`${inputClass} mt-3`} value={hero.backgroundImageUrl || ""} onChange={(e) => setHero((c) => ({ ...c, backgroundImageUrl: e.target.value }))} placeholder="URL gambar" />
            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white hover:bg-secondary">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageUp size={16} />}
              {uploading ? "Mengunggah..." : "Unggah gambar baru"}
              <input type="file" accept="image/*" disabled={uploading} className="hidden" onChange={(e) => uploadHeroImage(e.target.files?.[0])} />
            </label>
          </div>
        </div>
      </Section>

      <Section title="4. Beranda · Tentang Kami" description="Judul, isi pengantar, dan label statistik yang terlihat setelah ruang berita.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Label bagian"><input className={inputClass} value={site.home.about.eyebrow} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, about: { ...c.home.about, eyebrow: e.target.value } } }))} /></Field>
          <Field label="Judul bagian"><input className={inputClass} value={site.home.about.title} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, about: { ...c.home.about, title: e.target.value } } }))} /></Field>
          {site.home.about.paragraphs.map((paragraph, index) => <div key={index} className="sm:col-span-2"><Field label={`Paragraf ${index + 1}`}><textarea rows={3} className={inputClass} value={paragraph} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, about: { ...c.home.about, paragraphs: c.home.about.paragraphs.map((item, itemIndex) => itemIndex === index ? e.target.value : item) } } }))} /></Field></div>)}
          <Field label="Label jumlah pengurus"><input className={inputClass} value={site.home.about.memberLabel} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, about: { ...c.home.about, memberLabel: e.target.value } } }))} /></Field>
          <Field label="Label jumlah divisi"><input className={inputClass} value={site.home.about.divisionLabel} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, about: { ...c.home.about, divisionLabel: e.target.value } } }))} /></Field>
          <Field label="Nilai program kerja"><input className={inputClass} value={site.home.about.programValue} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, about: { ...c.home.about, programValue: e.target.value } } }))} /></Field>
          <Field label="Label program kerja"><input className={inputClass} value={site.home.about.programLabel} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, about: { ...c.home.about, programLabel: e.target.value } } }))} /></Field>
        </div>
      </Section>

      <Section title="5. Beranda · Visi & Misi" description="Judul dan isi visi-misi. Daftar misi dapat ditambah atau dihapus.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul visi"><input className={inputClass} value={vision.visionTitle || ""} onChange={(e) => setVision((c) => ({ ...c, visionTitle: e.target.value }))} /></Field>
          <Field label="Judul misi"><input className={inputClass} value={vision.missionTitle || ""} onChange={(e) => setVision((c) => ({ ...c, missionTitle: e.target.value }))} /></Field>
          <div className="sm:col-span-2"><Field label="Isi visi"><textarea rows={3} className={inputClass} value={vision.vision} onChange={(e) => setVision((c) => ({ ...c, vision: e.target.value }))} /></Field></div>
          <div className="space-y-3 sm:col-span-2">
            {vision.mission.map((mission, index) => (
              <div key={index} className="flex items-start gap-2">
                <textarea rows={2} className={inputClass} aria-label={`Misi ${index + 1}`} value={mission} onChange={(e) => setVision((c) => ({ ...c, mission: c.mission.map((item, itemIndex) => itemIndex === index ? e.target.value : item) }))} />
                <button type="button" onClick={() => setVision((c) => ({ ...c, mission: c.mission.filter((_, itemIndex) => itemIndex !== index) }))} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-100 text-red-500 hover:bg-red-50" aria-label={`Hapus misi ${index + 1}`}><Trash2 size={16} /></button>
              </div>
            ))}
            <button type="button" onClick={() => setVision((c) => ({ ...c, mission: [...c.mission, "Misi baru"] }))} className="inline-flex items-center gap-2 rounded-xl border border-primary/15 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5"><Plus size={15} /> Tambah misi</button>
          </div>
        </div>
      </Section>

      <Section title="6. Beranda · Struktur Organisasi" description="Pengantar bagian struktur. Data nama, jabatan, divisi, dan foto pengurus tetap dikelola melalui menu Pengurus.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Label bagian"><input className={inputClass} value={site.home.structure.eyebrow} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, structure: { ...c.home.structure, eyebrow: e.target.value } } }))} /></Field>
          <Field label="Judul bagian"><input className={inputClass} value={site.home.structure.title} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, structure: { ...c.home.structure, title: e.target.value } } }))} /></Field>
          <div className="sm:col-span-2"><Field label="Deskripsi"><textarea rows={3} className={inputClass} value={site.home.structure.description} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, structure: { ...c.home.structure, description: e.target.value } } }))} /></Field></div>
          <Field label="Teks tombol"><input className={inputClass} value={site.home.structure.buttonText} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, structure: { ...c.home.structure, buttonText: e.target.value } } }))} /></Field>
        </div>
      </Section>

      <Section title="7. Beranda · Program Kerja" description="Pengantar dan tiga kartu fokus program yang tampil di beranda.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Label bagian"><input className={inputClass} value={site.home.program.eyebrow} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, program: { ...c.home.program, eyebrow: e.target.value } } }))} /></Field>
          <Field label="Judul bagian"><input className={inputClass} value={site.home.program.title} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, program: { ...c.home.program, title: e.target.value } } }))} /></Field>
          <div className="sm:col-span-2"><Field label="Deskripsi bagian"><textarea rows={3} className={inputClass} value={site.home.program.description} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, program: { ...c.home.program, description: e.target.value } } }))} /></Field></div>
          {site.home.program.items.map((item, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
              <p className="text-xs font-black uppercase tracking-wide text-primary">Kartu {index + 1}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Kategori"><input className={inputClass} value={item.label} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, program: { ...c.home.program, items: c.home.program.items.map((current, itemIndex) => itemIndex === index ? { ...current, label: e.target.value } : current) } } }))} /></Field>
                <Field label="Judul"><input className={inputClass} value={item.title} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, program: { ...c.home.program, items: c.home.program.items.map((current, itemIndex) => itemIndex === index ? { ...current, title: e.target.value } : current) } } }))} /></Field>
              </div>
              <Field label="Deskripsi"><textarea rows={2} className={inputClass} value={item.description} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, program: { ...c.home.program, items: c.home.program.items.map((current, itemIndex) => itemIndex === index ? { ...current, description: e.target.value } : current) } } }))} /></Field>
            </div>
          ))}
        </div>
      </Section>

      <Section title="8. Beranda · Kalender" description="Teks umum kalender. Jadwal acara dan hitung mundur dikelola melalui menu Kalender Acara.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul kecil kalender"><input className={inputClass} value={site.home.calendar.eyebrow} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, calendar: { ...c.home.calendar, eyebrow: e.target.value } } }))} /></Field>
          <Field label="Label pengingat"><input className={inputClass} value={site.home.calendar.reminderLabel} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, calendar: { ...c.home.calendar, reminderLabel: e.target.value } } }))} /></Field>
          <div className="sm:col-span-2"><Field label="Pesan ketika belum ada acara"><textarea rows={2} className={inputClass} value={site.home.calendar.emptyText} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, calendar: { ...c.home.calendar, emptyText: e.target.value } } }))} /></Field></div>
          <Field label="Teks tombol hari ini"><input className={inputClass} value={site.home.calendar.todayButtonText} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, calendar: { ...c.home.calendar, todayButtonText: e.target.value } } }))} /></Field>
        </div>
      </Section>

      <Section title="9. Beranda · Dokumen" description="Judul dan tombol pusat dokumen. Berkas PDF/DOC dikelola melalui menu Dokumen.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul bagian"><input className={inputClass} value={site.home.documents.title} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, documents: { ...c.home.documents, title: e.target.value } } }))} /></Field>
          <Field label="Teks tombol semua dokumen"><input className={inputClass} value={site.home.documents.buttonText} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, documents: { ...c.home.documents, buttonText: e.target.value } } }))} /></Field>
          <div className="sm:col-span-2"><Field label="Deskripsi"><textarea rows={2} className={inputClass} value={site.home.documents.description} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, documents: { ...c.home.documents, description: e.target.value } } }))} /></Field></div>
          <Field label="Teks unduh"><input className={inputClass} value={site.home.documents.downloadText} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, documents: { ...c.home.documents, downloadText: e.target.value } } }))} /></Field>
        </div>
      </Section>

      <Section title="10. Beranda · Footer" description="Atur identitas, alamat kampus, nomor telepon, email, dan tautan media sosial yang tampil pada footer.">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["brandTitle", "contactTitle", "connectTitle", "copyright", "closingText"] as const).map((key) => (
            <Field key={key} label={{ brandTitle: "Nama di footer", contactTitle: "Judul lokasi & kontak", connectTitle: "Judul media sosial", copyright: "Teks hak cipta", closingText: "Kalimat penutup" }[key]}><input className={inputClass} value={site.home.footer[key]} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, footer: { ...c.home.footer, [key]: e.target.value } } }))} /></Field>
          ))}
          <div className="sm:col-span-2"><Field label="Deskripsi organisasi"><textarea rows={3} className={inputClass} value={site.home.footer.description} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, footer: { ...c.home.footer, description: e.target.value } } }))} /></Field></div>
          <Field label="Nomor telepon / WhatsApp"><input className={inputClass} value={site.home.footer.phone} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, footer: { ...c.home.footer, phone: e.target.value } } }))} /></Field>
          <Field label="Email resmi" hint="Boleh dikosongkan. Kolom email tidak akan tampil di website jika kosong."><input type="email" className={inputClass} value={site.home.footer.email} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, footer: { ...c.home.footer, email: e.target.value } } }))} /></Field>

          <div className="space-y-3 sm:col-span-2">
            <p className="text-xs font-black uppercase tracking-wide text-primary">Lokasi kampus</p>
            {site.home.footer.campuses.map((campus, index) => (
              <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                <Field label={`Nama lokasi ${index + 1}`}><input className={inputClass} value={campus.name} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, footer: { ...c.home.footer, campuses: c.home.footer.campuses.map((item, itemIndex) => itemIndex === index ? { ...item, name: e.target.value } : item) } } }))} /></Field>
                <Field label="Tautan Google Maps" hint="Opsional"><input type="url" className={inputClass} value={campus.mapUrl} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, footer: { ...c.home.footer, campuses: c.home.footer.campuses.map((item, itemIndex) => itemIndex === index ? { ...item, mapUrl: e.target.value } : item) } } }))} /></Field>
                <div className="sm:col-span-2"><Field label="Alamat"><textarea rows={2} className={inputClass} value={campus.address} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, footer: { ...c.home.footer, campuses: c.home.footer.campuses.map((item, itemIndex) => itemIndex === index ? { ...item, address: e.target.value } : item) } } }))} /></Field></div>
              </div>
            ))}
          </div>

          <div className="space-y-3 sm:col-span-2">
            <p className="text-xs font-black uppercase tracking-wide text-primary">Media sosial</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {site.home.footer.socialLinks.map((social, index) => (
                <div key={social.platform} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Field label={`Nama ${social.platform}`}><input className={inputClass} value={social.label} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, footer: { ...c.home.footer, socialLinks: c.home.footer.socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, label: e.target.value } : item) } } }))} /></Field>
                  <Field label="Tautan profil" hint="Opsional"><input type="url" className={inputClass} value={social.url} onChange={(e) => setSite((c) => ({ ...c, home: { ...c.home, footer: { ...c.home.footer, socialLinks: c.home.footer.socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, url: e.target.value } : item) } } }))} /></Field>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        open
        title="11. Halaman · Struktur Organisasi"
        description="Mengatur seluruh teks tetap pada halaman struktur. Nilai periode berlaku serentak pada header halaman, setiap divisi, kartu pengurus, dan ringkasan pengurus di beranda."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tahun periode" hint="Contoh: 2026 atau 2026/2027. Cukup ubah satu kali untuk seluruh tampilan struktur.">
            <input className={inputClass} value={site.pages.organization.period} onChange={(event) => updateOrganizationPage("period", event.target.value)} />
          </Field>
          <Field label="Label kecil halaman" hint="Gunakan {period} untuk menampilkan periode secara otomatis.">
            <input className={inputClass} value={site.pages.organization.eyebrow} onChange={(event) => updateOrganizationPage("eyebrow", event.target.value)} />
          </Field>
          <Field label="Judul halaman">
            <input className={inputClass} value={site.pages.organization.title} onChange={(event) => updateOrganizationPage("title", event.target.value)} />
          </Field>
          <Field label="Label periode per divisi" hint="Gunakan {period} agar mengikuti tahun periode di atas.">
            <input className={inputClass} value={site.pages.organization.divisionPeriodLabel} onChange={(event) => updateOrganizationPage("divisionPeriodLabel", event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Deskripsi halaman" hint="Gunakan {period} agar tahun di dalam kalimat ikut berubah otomatis.">
              <textarea rows={3} className={inputClass} value={site.pages.organization.description} onChange={(event) => updateOrganizationPage("description", event.target.value)} />
            </Field>
          </div>
          <Field label="Label statistik anggota">
            <input className={inputClass} value={site.pages.organization.memberStatLabel} onChange={(event) => updateOrganizationPage("memberStatLabel", event.target.value)} />
          </Field>
          <Field label="Label statistik divisi">
            <input className={inputClass} value={site.pages.organization.divisionStatLabel} onChange={(event) => updateOrganizationPage("divisionStatLabel", event.target.value)} />
          </Field>
          <Field label="Label statistik foto">
            <input className={inputClass} value={site.pages.organization.photoStatLabel} onChange={(event) => updateOrganizationPage("photoStatLabel", event.target.value)} />
          </Field>
          <Field label="Keterangan jumlah anggota" hint="Gunakan {count} untuk angka jumlah anggota setiap divisi.">
            <input className={inputClass} value={site.pages.organization.divisionMemberLabel} onChange={(event) => updateOrganizationPage("divisionMemberLabel", event.target.value)} />
          </Field>
          <Field label="Teks pengganti foto" hint="Tampil jika pengurus belum memiliki foto.">
            <input className={inputClass} value={site.pages.organization.photoFallbackLabel} onChange={(event) => updateOrganizationPage("photoFallbackLabel", event.target.value)} />
          </Field>
        </div>
      </Section>

      {editablePublicPages.map((page) => {
        const content = site.pages[page.key];
        return (
          <Section key={page.key} title={page.title} description={page.description}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Label kecil / eyebrow">
                <input className={inputClass} value={content.eyebrow} onChange={(event) => updatePublicPage(page.key, "eyebrow", event.target.value)} />
              </Field>
              <Field label="Judul utama halaman">
                <input className={inputClass} value={content.title} onChange={(event) => updatePublicPage(page.key, "title", event.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Deskripsi utama">
                  <textarea rows={3} className={inputClass} value={content.description} onChange={(event) => updatePublicPage(page.key, "description", event.target.value)} />
                </Field>
              </div>
              <Field label={page.key === "dataCenter" ? "Judul kartu cuaca" : page.key === "documents" ? "Judul koleksi media" : "Teks tombol utama"}>
                <input className={inputClass} value={content.primaryActionText} onChange={(event) => updatePublicPage(page.key, "primaryActionText", event.target.value)} />
              </Field>
              {page.secondaryLabel && (
                <Field label={page.secondaryLabel}>
                  <input className={inputClass} value={content.secondaryActionText} onChange={(event) => updatePublicPage(page.key, "secondaryActionText", event.target.value)} />
                </Field>
              )}
            </div>
          </Section>
        );
      })}

      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-primary/10 bg-white/95 p-4 shadow-2xl backdrop-blur">
        <p className="hidden text-xs leading-5 text-slate-500 sm:block">Simpan setelah selesai mengubah satu atau beberapa bagian.</p>
        <button type="submit" disabled={saving || uploading} className="ml-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
          {saving ? "Menyimpan..." : "Simpan Semua Perubahan"}
        </button>
      </div>
    </form>
  );
}
