"use client";

import { useState } from "react";
import {
  CalendarDays,
  Check,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  Trash2,
  Trophy,
  Upload,
} from "lucide-react";
import {
  deleteManualCompetitionAction,
  saveManualCompetitionAction,
  setManualCompetitionPublishedAction,
} from "@/application/actions/adminActions";
import type { ManualCompetition } from "@/domain/entities/ManualCompetition";

interface FormState {
  id: string;
  title: string;
  audience: string;
  fee: string;
  mode: string;
  organizer: string;
  sourceUrl: string;
  imageUrl: string;
  registrationStart: string;
  registrationEnd: string;
  isPublished: boolean;
}

const EMPTY_FORM: FormState = {
  id: "",
  title: "",
  audience: "Mahasiswa",
  fee: "Gratis",
  mode: "Online",
  organizer: "HMTKBA",
  sourceUrl: "",
  imageUrl: "",
  registrationStart: "",
  registrationEnd: "",
  isPublished: true,
};

const sortItems = (items: ManualCompetition[]) =>
  [...items].sort((first, second) => Number(second.isPublished) - Number(first.isPublished) || second.updatedAt.localeCompare(first.updatedAt));

const formatDate = (value: string) => {
  if (!value) return "Belum ditentukan";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00Z`));
};

export default function ManualCompetitionEditor({ initialItems }: { initialItems: ManualCompetition[] }) {
  const [items, setItems] = useState(() => sortItems(initialItems));
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [image, setImage] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const notify = (text: string, error = false) => {
    setMessage({ text, error });
    window.setTimeout(() => setMessage(null), 4500);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setImage(null);
    setFileKey((current) => current + 1);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.set(key, String(value)));
    if (image) data.set("image", image);

    setIsSubmitting(true);
    try {
      const saved = await saveManualCompetitionAction(data);
      setItems((current) => sortItems([...current.filter((item) => item.id !== saved.id), saved]));
      const wasEditing = Boolean(form.id);
      resetForm();
      notify(wasEditing ? "Informasi lomba berhasil diperbarui." : "Lomba manual berhasil ditambahkan ke portal.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Gagal menyimpan lomba.", true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editItem = (item: ManualCompetition) => {
    setForm({
      id: item.id,
      title: item.title,
      audience: item.audience,
      fee: item.fee,
      mode: item.mode,
      organizer: item.organizer,
      sourceUrl: item.sourceUrl,
      imageUrl: item.imageUrl,
      registrationStart: item.registrationStart,
      registrationEnd: item.registrationEnd,
      isPublished: item.isPublished,
    });
    setImage(null);
    setFileKey((current) => current + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const togglePublished = async (item: ManualCompetition) => {
    setIsSubmitting(true);
    try {
      const updated = await setManualCompetitionPublishedAction(item.id, !item.isPublished);
      setItems((current) => sortItems(current.map((entry) => (entry.id === updated.id ? updated : entry))));
      notify(updated.isPublished ? "Lomba sekarang tampil di Portal Lomba." : "Lomba disimpan sebagai draf.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Gagal mengubah status lomba.", true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeItem = async (item: ManualCompetition) => {
    if (!window.confirm(`Hapus lomba “${item.title}”?`)) return;
    setIsSubmitting(true);
    try {
      await deleteManualCompetitionAction(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (form.id === item.id) resetForm();
      notify("Lomba manual berhasil dihapus.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Gagal menghapus lomba.", true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative grid gap-6 xl:grid-cols-[.92fr_1.08fr] animate-fade-in">
      {message && (
        <div className={`fixed right-6 top-24 z-50 rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-xl ${message.error ? "bg-red-500" : "bg-emerald-500"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={submit} className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cta"><Trophy size={16} /> Portal Lomba</p>
            <h3 className="mt-2 text-xl font-black text-primary">{form.id ? "Edit lomba manual" : "Tambah lomba manual"}</h3>
            <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">Lomba yang diterbitkan akan langsung bergabung dengan data otomatis InfoLomba dan SiLomba.</p>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-cream"><Trophy size={21} /></span>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Nama lomba</label>
            <input required maxLength={180} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Contoh: Kompetisi Desain Bendungan Nasional 2026" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Penyelenggara</label>
              <input required maxLength={160} value={form.organizer} onChange={(event) => setForm({ ...form, organizer: event.target.value })} placeholder="Nama organisasi atau kampus" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Peserta</label>
              <input required maxLength={120} value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })} placeholder="Mahasiswa" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Biaya</label>
              <input maxLength={120} value={form.fee} onChange={(event) => setForm({ ...form, fee: event.target.value })} placeholder="Gratis / Rp50.000" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Pelaksanaan</label>
              <input maxLength={160} value={form.mode} onChange={(event) => setForm({ ...form, mode: event.target.value })} placeholder="Online / Aula Kampus" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Pendaftaran dibuka</label>
              <input type="date" value={form.registrationStart} onChange={(event) => setForm({ ...form, registrationStart: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Batas pendaftaran</label>
              <input type="date" min={form.registrationStart || undefined} value={form.registrationEnd} onChange={(event) => setForm({ ...form, registrationEnd: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Poster lomba</label>
            {(form.imageUrl || image) && (
              <div className="relative h-44 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {image ? <div className="grid h-full place-items-center px-5 text-center text-xs font-bold text-primary">Poster dipilih: {image.name}</div> : <img src={form.imageUrl} alt="Pratinjau poster" className="h-full w-full object-cover" />}
              </div>
            )}
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500 transition hover:border-primary hover:text-primary">
              <Upload size={15} /> {image ? "Ganti pilihan poster" : "Pilih poster dari perangkat"}
              <input key={fileKey} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setImage(event.target.files?.[0] ?? null)} className="hidden" />
            </label>
            <input type="url" value={form.imageUrl.startsWith("http") ? form.imageUrl : ""} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="Atau tempel URL poster (opsional)" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15" />
            <p className="text-[11px] leading-5 text-slate-400">JPG, PNG, WebP, atau AVIF. Maksimal 4 MB.</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Tautan pendaftaran/detail (opsional)</label>
            <input type="url" value={form.sourceUrl} onChange={(event) => setForm({ ...form, sourceUrl: event.target.value })} placeholder="https://..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15" />
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span><span className="block text-xs font-black text-primary">Tampilkan di Portal Lomba</span><span className="mt-1 block text-[11px] text-slate-500">Matikan untuk menyimpan sebagai draf.</span></span>
            <input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} className="h-5 w-5 accent-primary" />
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          {form.id && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50">Batal edit</button>}
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black text-cream shadow-md transition hover:bg-secondary disabled:cursor-wait disabled:opacity-60">
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {form.id ? "Simpan perubahan" : "Tambahkan lomba"}
          </button>
        </div>
      </form>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-cta">Lomba buatan HMTKBA</p><h3 className="mt-2 text-xl font-black text-primary">{items.length} lomba tersimpan</h3></div>
          <span className="rounded-full bg-cream px-3 py-1.5 text-[11px] font-black text-primary">{items.filter((item) => item.isPublished).length} tayang</span>
        </div>

        {items.length ? (
          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60">
                <div className="flex gap-4 p-4">
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-white bg-primary shadow-sm">
                    {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-cream"><ImageIcon size={24} /></div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wide ${item.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>{item.isPublished ? "Tayang" : "Draf"}</span><span className="text-[10px] font-bold text-slate-400">HMTKBA</span></div>
                    <h4 className="mt-2 line-clamp-2 font-black leading-5 text-primary">{item.title}</h4>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{item.organizer}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500"><CalendarDays size={13} className="text-cta" /> Batas: {formatDate(item.registrationEnd)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1.5 border-t border-slate-100 bg-white px-4 py-3">
                  {item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="mr-auto inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">Buka detail <ExternalLink size={12} /></a>}
                  <button type="button" disabled={isSubmitting} onClick={() => togglePublished(item)} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-primary hover:text-primary" aria-label={item.isPublished ? `Sembunyikan ${item.title}` : `Terbitkan ${item.title}`}>{item.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                  <button type="button" disabled={isSubmitting} onClick={() => editItem(item)} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-primary hover:text-primary" aria-label={`Edit ${item.title}`}><Edit2 size={14} /></button>
                  <button type="button" disabled={isSubmitting} onClick={() => removeItem(item)} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:text-red-500" aria-label={`Hapus ${item.title}`}><Trash2 size={14} /></button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 px-6 py-14 text-center"><Trophy size={34} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-500">Belum ada lomba manual.</p><p className="mt-1 text-xs text-slate-400">Isi formulir untuk menambahkan lomba pertama.</p></div>
        )}
      </section>
    </div>
  );
}
