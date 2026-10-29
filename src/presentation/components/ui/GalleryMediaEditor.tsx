"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import {
  CalendarDays,
  Check,
  Edit2,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  Play,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import {
  deleteGalleryMediaAction,
  saveGalleryMediaAction,
  setGalleryMediaPublishedAction,
} from "@/application/actions/adminActions";
import type { GalleryMedia, GalleryMediaType } from "@/domain/entities/GalleryMedia";

const CATEGORIES = ["Foto Kegiatan", "Video Proyek", "Kunjungan Lapangan", "Lomba & Prestasi", "Pengabdian", "Lainnya"];
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

interface GalleryForm {
  id: string;
  type: GalleryMediaType;
  title: string;
  description: string;
  category: string;
  occurredAt: string;
  mediaUrl: string;
  thumbnailUrl: string;
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY_FORM: GalleryForm = {
  id: "",
  type: "photo",
  title: "",
  description: "",
  category: "Foto Kegiatan",
  occurredAt: today(),
  mediaUrl: "",
  thumbnailUrl: "",
  isPublished: true,
  order: 1,
  createdAt: "",
  updatedAt: "",
};

const sortItems = (items: GalleryMedia[]) =>
  [...items].sort((first, second) => first.order - second.order || second.occurredAt.localeCompare(first.occurredAt));

const formatDate = (value: string) => new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${value}T00:00:00.000Z`));

function safeUploadName(file: File): string {
  const extension = file.name.split(".").pop()?.toLowerCase() || (file.type.startsWith("video/") ? "mp4" : "jpg");
  const base = file.name.slice(0, Math.max(0, file.name.length - extension.length - 1))
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "media";
  return `${base}.${extension}`;
}

function MediaPreview({ item, className }: { item: Pick<GalleryMedia, "type" | "mediaUrl" | "thumbnailUrl" | "title">; className: string }) {
  if (item.type === "video" && !item.thumbnailUrl) {
    return <video src={item.mediaUrl} className={className} muted playsInline preload="metadata" />;
  }
  const source = item.thumbnailUrl || item.mediaUrl;
  return source ? <img src={source} alt={item.title || "Pratinjau media"} className={className} /> : <div className={`${className} grid place-items-center bg-slate-100 text-slate-300`}><ImageIcon size={34} /></div>;
}

export default function GalleryMediaEditor({ initialItems }: { initialItems: GalleryMedia[] }) {
  const [items, setItems] = useState(() => sortItems(initialItems));
  const [form, setForm] = useState<GalleryForm>({ ...EMPTY_FORM, order: initialItems.length + 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaProgress, setMediaProgress] = useState<number | null>(null);
  const [coverProgress, setCoverProgress] = useState<number | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const notify = (text: string, error = false) => {
    setMessage({ text, error });
    window.setTimeout(() => setMessage(null), 5000);
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM, order: items.length + 1, occurredAt: today() });
    setMediaProgress(null);
    setCoverProgress(null);
    setFileKey((current) => current + 1);
  };

  const uploadSelectedFile = async (file: File, kind: "media" | "thumbnail") => {
    const isImage = IMAGE_TYPES.has(file.type);
    const isVideo = VIDEO_TYPES.has(file.type);
    if (kind === "thumbnail" && !isImage) throw new Error("Sampul harus berupa JPG, PNG, WebP, atau GIF.");
    if (kind === "media" && form.type === "photo" && !isImage) throw new Error("Media foto harus berupa JPG, PNG, WebP, atau GIF.");
    if (kind === "media" && form.type === "video" && !isVideo) throw new Error("Video harus berupa MP4, WebM, atau MOV.");
    const limit = isVideo ? 200 * 1024 * 1024 : 12 * 1024 * 1024;
    if (file.size > limit) throw new Error(isVideo ? "Ukuran video maksimal 200 MB." : "Ukuran gambar maksimal 12 MB.");

    const folder = kind === "thumbnail" ? "gallery-thumbnails" : "gallery-media";
    const pathname = `hmtkba/${folder}/${Date.now()}_${crypto.randomUUID()}_${safeUploadName(file)}`;
    const setProgress = kind === "thumbnail" ? setCoverProgress : setMediaProgress;
    setProgress(0);
    const uploaded = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/gallery/upload",
      onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
    });
    setProgress(100);
    return uploaded.url;
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setIsSubmitting(true);
    try {
      const url = await uploadSelectedFile(file, "media");
      setForm((current) => ({
        ...current,
        mediaUrl: url,
        thumbnailUrl: current.type === "photo" ? url : current.thumbnailUrl,
        title: current.title || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      }));
      notify(form.type === "video" ? "Video berhasil diunggah. Tambahkan sampul bila diperlukan." : "Foto berhasil diunggah.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Gagal mengunggah media.", true);
      input.value = "";
      setMediaProgress(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setIsSubmitting(true);
    try {
      const url = await uploadSelectedFile(file, "thumbnail");
      setForm((current) => ({ ...current, thumbnailUrl: url }));
      notify("Sampul video berhasil diunggah.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Gagal mengunggah sampul.", true);
      input.value = "";
      setCoverProgress(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.mediaUrl) {
      notify(`Unggah ${form.type === "video" ? "video" : "foto"} terlebih dahulu.`, true);
      return;
    }
    setIsSubmitting(true);
    try {
      const saved = await saveGalleryMediaAction(form);
      setItems((current) => sortItems([...current.filter((item) => item.id !== saved.id), saved]));
      const editing = Boolean(form.id);
      resetForm();
      notify(editing ? "Media galeri berhasil diperbarui." : "Media baru berhasil ditambahkan ke galeri.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Gagal menyimpan media galeri.", true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editItem = (item: GalleryMedia) => {
    setForm({ ...item });
    setMediaProgress(null);
    setCoverProgress(null);
    setFileKey((current) => current + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const togglePublished = async (item: GalleryMedia) => {
    setIsSubmitting(true);
    try {
      const updated = await setGalleryMediaPublishedAction(item.id, !item.isPublished);
      setItems((current) => sortItems(current.map((entry) => entry.id === updated.id ? updated : entry)));
      notify(updated.isPublished ? "Media sekarang tampil di halaman Dokumentasi." : "Media disimpan sebagai draf.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Gagal mengubah status media.", true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeItem = async (item: GalleryMedia) => {
    if (!window.confirm(`Hapus media “${item.title}”? Berkas unggahan juga akan dihapus.`)) return;
    setIsSubmitting(true);
    try {
      await deleteGalleryMediaAction(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (form.id === item.id) resetForm();
      notify("Media galeri berhasil dihapus.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Gagal menghapus media.", true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative grid gap-6 xl:grid-cols-[.92fr_1.08fr] animate-fade-in">
      {message && <div className={`fixed right-6 top-24 z-50 max-w-sm rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-xl ${message.error ? "bg-red-500" : "bg-emerald-500"}`}>{message.text}</div>}

      <form onSubmit={submit} className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cta"><ImageIcon size={16} /> Dokumentasi kegiatan</p>
            <h3 className="mt-2 text-xl font-black text-primary">{form.id ? "Edit media galeri" : "Tambah foto atau video"}</h3>
            <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">Unggahan yang diterbitkan akan langsung tampil di halaman Dokumentasi.</p>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-cream">{form.type === "video" ? <Video size={21} /> : <ImageIcon size={21} />}</span>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5">
            {(["photo", "video"] as GalleryMediaType[]).map((type) => (
              <button key={type} type="button" onClick={() => setForm((current) => ({ ...current, type, category: type === "video" ? "Video Proyek" : "Foto Kegiatan", mediaUrl: current.type === type ? current.mediaUrl : "", thumbnailUrl: current.type === type ? current.thumbnailUrl : "" }))} className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black transition ${form.type === type ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>
                {type === "video" ? <Video size={15} /> : <ImageIcon size={15} />} {type === "video" ? "Video" : "Foto"}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Berkas {form.type === "video" ? "video" : "foto"}</label>
            {form.mediaUrl && <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100"><MediaPreview item={form} className="h-full w-full object-cover" />{form.type === "video" && <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-primary/90 text-white"><Play size={15} fill="currentColor" /></span>}</div>}
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500 transition hover:border-primary hover:text-primary">
              {mediaProgress !== null && mediaProgress < 100 ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {mediaProgress !== null && mediaProgress < 100 ? `Mengunggah ${mediaProgress}%` : form.mediaUrl ? `Ganti ${form.type === "video" ? "video" : "foto"}` : `Pilih ${form.type === "video" ? "video" : "foto"} dari perangkat`}
              <input key={`media-${fileKey}`} type="file" accept={form.type === "video" ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp,image/gif"} onChange={handleMediaUpload} disabled={isSubmitting} className="hidden" />
            </label>
            <p className="text-[11px] leading-5 text-slate-400">{form.type === "video" ? "MP4, WebM, atau MOV · Maksimal 200 MB" : "JPG, PNG, WebP, atau GIF · Maksimal 12 MB"}</p>
          </div>

          {form.type === "video" && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Sampul video <span className="normal-case text-slate-400">(opsional)</span></label>
              {form.thumbnailUrl && <img src={form.thumbnailUrl} alt="Pratinjau sampul" className="aspect-video w-full rounded-lg object-cover" />}
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-500 hover:border-primary hover:text-primary">
                {coverProgress !== null && coverProgress < 100 ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                {coverProgress !== null && coverProgress < 100 ? `Mengunggah ${coverProgress}%` : form.thumbnailUrl ? "Ganti sampul video" : "Unggah sampul video"}
                <input key={`cover-${fileKey}`} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleCoverUpload} disabled={isSubmitting} className="hidden" />
              </label>
            </div>
          )}

          <div className="space-y-1.5"><label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Judul kegiatan</label><input required maxLength={180} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Contoh: Kunjungan Lapangan Bendungan Jatigede" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15" /></div>
          <div className="space-y-1.5"><label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Keterangan</label><textarea rows={3} maxLength={700} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Ceritakan singkat kegiatan yang didokumentasikan..." className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15" /></div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Kategori</label><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15">{CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select></div>
            <div className="space-y-1.5"><label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Tanggal kegiatan</label><input required type="date" value={form.occurredAt} onChange={(event) => setForm({ ...form, occurredAt: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15" /></div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><span><span className="block text-xs font-black text-primary">Tampilkan di halaman</span><span className="mt-1 block text-[11px] text-slate-500">Matikan untuk menyimpan sebagai draf.</span></span><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} className="h-5 w-5 accent-primary" /></label>
            <div className="space-y-1.5"><label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Urutan</label><input type="number" min={0} max={999} value={form.order} onChange={(event) => setForm({ ...form, order: Number(event.target.value) })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-primary focus:bg-white focus:outline-none" /></div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          {form.id && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50">Batal edit</button>}
          <button type="submit" disabled={isSubmitting || !form.mediaUrl} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black text-cream shadow-md transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}{form.id ? "Simpan perubahan" : "Tambahkan ke galeri"}</button>
        </div>
      </form>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-cta">Galeri tersimpan</p><h3 className="mt-2 text-xl font-black text-primary">{items.length} media kegiatan</h3></div><span className="rounded-full bg-cream px-3 py-1.5 text-[11px] font-black text-primary">{items.filter((item) => item.isPublished).length} tayang</span></div>
        {items.length ? <div className="mt-6 space-y-3">{items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60">
            <div className="flex gap-4 p-4"><div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-white bg-primary shadow-sm"><MediaPreview item={item} className="h-full w-full object-cover" />{item.type === "video" && <span className="absolute inset-0 m-auto grid h-9 w-9 place-items-center rounded-full bg-primary/85 text-white"><Play size={14} fill="currentColor" /></span>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wide ${item.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>{item.isPublished ? "Tayang" : "Draf"}</span><span className="text-[10px] font-bold uppercase text-slate-400">{item.type === "video" ? "Video" : "Foto"}</span></div><h4 className="mt-2 line-clamp-2 font-black leading-5 text-primary">{item.title}</h4><p className="mt-1 text-xs font-semibold text-slate-500">{item.category}</p><p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500"><CalendarDays size={13} className="text-cta" /> {formatDate(item.occurredAt)}</p></div></div>
            <div className="flex items-center justify-end gap-1.5 border-t border-slate-100 bg-white px-4 py-3"><button type="button" disabled={isSubmitting} onClick={() => togglePublished(item)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-primary hover:text-primary" aria-label={item.isPublished ? `Sembunyikan ${item.title}` : `Terbitkan ${item.title}`}>{item.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}</button><button type="button" disabled={isSubmitting} onClick={() => editItem(item)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-primary hover:text-primary" aria-label={`Edit ${item.title}`}><Edit2 size={14} /></button><button type="button" disabled={isSubmitting} onClick={() => removeItem(item)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:text-red-500" aria-label={`Hapus ${item.title}`}><Trash2 size={14} /></button></div>
          </article>
        ))}</div> : <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 px-6 py-14 text-center"><ImageIcon size={34} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-500">Belum ada media kegiatan.</p></div>}
      </section>
    </div>
  );
}
