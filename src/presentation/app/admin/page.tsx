"use client";

import React, { useState } from "react";
import { upload } from "@vercel/blob/client";
import {
  LayoutDashboard,
  Megaphone,
  Eye,
  Users,
  FileText,
  Database,
  LogOut,
  Edit2,
  Trash2,
  Plus,
  Upload,
  X,
  Search,
  Check,
  Loader2,
  BookOpen,
  Waves,
  Crown,
  CalendarClock,
  Clock3,
  MapPin,
  BellRing,
  Newspaper,
  ImageIcon,
  Palette,
  Trophy,
  Menu
} from "lucide-react";
import {
  logoutAction,
  updateHeroAction,
  updateVisionMissionAction,
  saveMemberAction,
  deleteMemberAction,
  saveDocumentAction,
  deleteDocumentAction,
  saveStatAction,
  deleteStatAction,
  uploadFileAction,
  saveCalendarEventAction,
  deleteCalendarEventAction,
  saveNewsItemAction,
  setNewsPublishedAction,
  deleteNewsItemAction
} from "@/application/actions/adminActions";
import { HeroContent } from "@/domain/entities/HeroContent";
import { VisionMission } from "@/domain/entities/VisionMission";
import { Member } from "@/domain/entities/Member";
import { Document } from "@/domain/entities/Document";
import { RegionalStat } from "@/domain/entities/RegionalStat";
import { CalendarEvent } from "@/domain/entities/CalendarEvent";
import { NewsItem } from "@/domain/entities/NewsItem";
import type { AdminSession } from "@/application/actions/adminActions";
import type { SiteContent } from "@/domain/entities/SiteContent";
import type { ManualCompetition } from "@/domain/entities/ManualCompetition";
import { WebsiteContentEditor } from "@/presentation/components/ui/WebsiteContentEditor";
import ManualCompetitionEditor from "@/presentation/components/ui/ManualCompetitionEditor";

interface AdminDashboardPageProps {
  initialHero: HeroContent;
  initialVisionMission: VisionMission;
  initialMembers: Member[];
  initialDocuments: Document[];
  initialRegionalStats: Record<string, RegionalStat[]>;
  initialCalendarEvents: CalendarEvent[];
  initialNewsItems: NewsItem[];
  initialSiteContent: SiteContent;
  initialManualCompetitions: ManualCompetition[];
  regions: string[];
  adminSession: AdminSession;
}

type TabType = "dashboard" | "website" | "hero" | "vision" | "members" | "documents" | "news" | "competitions" | "events" | "stats";

const DIVISIONS = [
  "BPH (Badan Pengurus Harian)",
  "Sekretariat Kabinet",
  "Akademik Mahasiswa",
  "Minat dan Bakat",
  "Ekonomi Kreatif",
  "Komunikasi dan Publikasi"
];

interface EventFormState {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
}

const EMPTY_EVENT_FORM: EventFormState = {
  id: "",
  title: "",
  description: "",
  location: "",
  startsAt: "",
  endsAt: ""
};

interface NewsFormState {
  id: string;
  title: string;
  category: string;
  summary: string;
  imageUrl: string;
  linkUrl: string;
  publishedAt: string;
  isPublished: boolean;
  order: number;
}

const EMPTY_NEWS_FORM: NewsFormState = {
  id: "",
  title: "",
  category: "Prestasi",
  summary: "",
  imageUrl: "",
  linkUrl: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  isPublished: true,
  order: 1,
};

const toLocalDateTimeInput = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

const formatAdminEventDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));

export default function AdminDashboardPage({
  initialHero,
  initialVisionMission,
  initialMembers,
  initialDocuments,
  initialRegionalStats,
  initialCalendarEvents,
  initialNewsItems,
  initialSiteContent,
  initialManualCompetitions,
  regions,
  adminSession
}: AdminDashboardPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [adminMobileOpen, setAdminMobileOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Content States
  const [hero, setHero] = useState<HeroContent>(initialHero);
  const [visionMission, setVisionMission] = useState<VisionMission>(initialVisionMission);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [regionalStats, setRegionalStats] = useState<Record<string, RegionalStat[]>>(initialRegionalStats);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [eventForm, setEventForm] = useState<EventFormState>(EMPTY_EVENT_FORM);
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNewsItems);
  const [newsForm, setNewsForm] = useState<NewsFormState>(EMPTY_NEWS_FORM);
  const [newsImage, setNewsImage] = useState<File | null>(null);
  const [newsFileInputKey, setNewsFileInputKey] = useState(0);
  const availableDivisions = adminSession.canManageAllDivisions ? DIVISIONS : [adminSession.memberDivision];
  const defaultMemberDivision = availableDivisions[0];
  
  // Selected Region for BPS stats editing
  const [selectedRegion, setSelectedRegion] = useState("Indonesia");

  // Modals States
  const [memberModal, setMemberModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    data: Member;
  }>({
    isOpen: false,
    mode: "add",
    data: { id: "", name: "", role: "", division: defaultMemberDivision, period: "2024/2025", imageUrl: "" }
  });

  const [documentModal, setDocumentModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    data: Document;
  }>({
    isOpen: false,
    mode: "add",
    data: { id: "", title: "", category: "Regulasi", downloadUrl: "" }
  });

  const [statModal, setStatModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    categoryKey: string; // for tracking target category if editing
    data: RegionalStat;
  }>({
    isOpen: false,
    mode: "add",
    categoryKey: "",
    data: { category: "", value: "", unit: "", year: new Date().getFullYear().toString(), description: "" }
  });

  // Search & Filters
  const [memberSearch, setMemberSearch] = useState("");
  const [memberDivisionFilter, setMemberDivisionFilter] = useState(
    adminSession.canManageAllDivisions ? "Semua" : adminSession.memberDivision
  );
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentUploadProgress, setDocumentUploadProgress] = useState<number | null>(null);

  // Helpers
  const triggerNotification = (message: string, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 4000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 4000);
    }
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    return error instanceof Error ? error.message : fallback;
  };

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = "/admin/login";
  };

  // 1. Hero Handlers
  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateHeroAction(hero);
      triggerNotification("Konten Hero berhasil diperbarui!");
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal memperbarui hero"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHeroBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsSubmitting(true);
    try {
      const res = await uploadFileAction(formData);
      if (res.success && res.url) {
        setHero({ ...hero, backgroundImageUrl: res.url });
        triggerNotification("Gambar latar hero berhasil diupload!");
      } else {
        triggerNotification(res.error || "Gagal mengupload file", true);
      }
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal mengupload file"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Vision Mission Handlers
  const handleVisionMissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateVisionMissionAction(visionMission);
      triggerNotification("Visi & Misi berhasil diperbarui!");
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal memperbarui Visi & Misi"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMissionItem = () => {
    setVisionMission({
      ...visionMission,
      mission: [...visionMission.mission, ""]
    });
  };

  const handleMissionItemChange = (index: number, value: string) => {
    const newMission = [...visionMission.mission];
    newMission[index] = value;
    setVisionMission({ ...visionMission, mission: newMission });
  };

  const handleRemoveMissionItem = (index: number) => {
    const newMission = visionMission.mission.filter((_, idx) => idx !== index);
    setVisionMission({ ...visionMission, mission: newMission });
  };

  // 3. Member Handlers
  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = memberModal.data;
    if (!data.name || !data.role) {
      triggerNotification("Nama dan Jabatan wajib diisi", true);
      return;
    }

    setIsSubmitting(true);
    try {
      const finalMember = { ...data };
      if (memberModal.mode === "add") {
        finalMember.id = Date.now().toString(); // Generate unique temporary ID
      }
      
      await saveMemberAction(finalMember);
      
      // Update local state
      if (memberModal.mode === "add") {
        setMembers([...members, finalMember]);
        triggerNotification("Anggota baru berhasil ditambahkan!");
      } else {
        setMembers(members.map((m) => (m.id === finalMember.id ? finalMember : m)));
        triggerNotification("Profil anggota berhasil diperbarui!");
      }
      setMemberModal({ ...memberModal, isOpen: false });
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal menyimpan anggota"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsSubmitting(true);
    try {
      const res = await uploadFileAction(formData);
      if (res.success && res.url) {
        setMemberModal({
          ...memberModal,
          data: { ...memberModal.data, imageUrl: res.url }
        });
        triggerNotification("Foto anggota berhasil diupload!");
      } else {
        triggerNotification(res.error || "Gagal mengupload foto", true);
      }
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal mengupload foto"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus anggota ini?")) return;

    setIsSubmitting(true);
    try {
      await deleteMemberAction(id);
      setMembers(members.filter((m) => m.id !== id));
      triggerNotification("Anggota berhasil dihapus.");
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal menghapus anggota"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Document Handlers
  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = documentModal.data;
    if (!data.title || !data.downloadUrl) {
      triggerNotification("Judul dan File Dokumen wajib diisi", true);
      return;
    }

    setIsSubmitting(true);
    try {
      const finalDoc = { ...data };
      if (documentModal.mode === "add") {
        finalDoc.id = Date.now().toString();
      }

      await saveDocumentAction(finalDoc);

      if (documentModal.mode === "add") {
        setDocuments([...documents, finalDoc]);
        triggerNotification("Dokumen baru berhasil ditambahkan!");
      } else {
        setDocuments(documents.map((d) => (d.id === finalDoc.id ? finalDoc : d)));
        triggerNotification("Dokumen berhasil diperbarui!");
      }
      setDocumentModal({ ...documentModal, isOpen: false });
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal menyimpan dokumen"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const allowedExtensions = new Set(["pdf", "docx", "xlsx"]);
    if (!allowedExtensions.has(extension)) {
      triggerNotification("Jenis berkas tidak didukung. Gunakan PDF, DOCX, atau XLSX.", true);
      input.value = "";
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      triggerNotification("Ukuran berkas maksimal 25 MB.", true);
      input.value = "";
      return;
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const pathname = `hmtkba/uploads/${Date.now()}_${crypto.randomUUID()}_${sanitizedName}`;

    setIsSubmitting(true);
    setDocumentUploadProgress(0);
    try {
      const uploaded = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/documents/upload",
        multipart: true,
        contentType: file.type || "application/octet-stream",
        onUploadProgress: ({ percentage }) => setDocumentUploadProgress(Math.round(percentage)),
      });

      setDocumentModal((current) => ({
        ...current,
        data: { ...current.data, downloadUrl: uploaded.downloadUrl || uploaded.url },
      }));
      setDocumentUploadProgress(100);
      triggerNotification("Berkas berhasil diunggah. Klik Simpan Dokumen untuk menampilkannya.");
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal mengupload dokumen"), true);
      setDocumentUploadProgress(null);
    } finally {
      setIsSubmitting(false);
      input.value = "";
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) return;

    setIsSubmitting(true);
    try {
      await deleteDocumentAction(id);
      setDocuments(documents.filter((d) => d.id !== id));
      triggerNotification("Dokumen berhasil dihapus.");
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal menghapus dokumen"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Regional Stats Handlers
  const handleStatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = statModal.data;
    if (!data.category || !data.value || !data.unit) {
      triggerNotification("Kategori, Nilai, dan Satuan wajib diisi", true);
      return;
    }

    setIsSubmitting(true);
    try {
      await saveStatAction(selectedRegion, statModal.categoryKey || data.category, data);

      const updatedRegionStats = [...(regionalStats[selectedRegion] || [])];
      if (statModal.mode === "edit" && statModal.categoryKey) {
        // If they changed the category name, make sure to delete or replace correctly
        const idx = updatedRegionStats.findIndex((s) => s.category === statModal.categoryKey);
        if (idx >= 0) {
          updatedRegionStats[idx] = data;
        }
      } else {
        const idx = updatedRegionStats.findIndex((s) => s.category === data.category);
        if (idx >= 0) {
          updatedRegionStats[idx] = data;
        } else {
          updatedRegionStats.push(data);
        }
      }

      setRegionalStats({
        ...regionalStats,
        [selectedRegion]: updatedRegionStats
      });
      triggerNotification("Statistik regional berhasil disimpan!");
      setStatModal({ ...statModal, isOpen: false });
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal menyimpan statistik"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStat = async (category: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data statistik ini?")) return;

    setIsSubmitting(true);
    try {
      await deleteStatAction(selectedRegion, category);
      setRegionalStats({
        ...regionalStats,
        [selectedRegion]: (regionalStats[selectedRegion] || []).filter((s) => s.category !== category)
      });
      triggerNotification("Data statistik berhasil dihapus.");
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal menghapus data statistik"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Calendar Event Handlers (Superadmin only)
  const handleEventSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!adminSession.isSuperAdmin) {
      triggerNotification("Hanya Superadmin yang dapat mengelola kegiatan kalender.", true);
      return;
    }
    if (!eventForm.title.trim() || !eventForm.startsAt) {
      triggerNotification("Nama kegiatan serta tanggal dan waktu mulai wajib diisi.", true);
      return;
    }

    setIsSubmitting(true);
    try {
      const savedEvent = await saveCalendarEventAction({
        id: eventForm.id || undefined,
        title: eventForm.title,
        description: eventForm.description,
        location: eventForm.location,
        startsAt: new Date(eventForm.startsAt).toISOString(),
        endsAt: eventForm.endsAt ? new Date(eventForm.endsAt).toISOString() : null
      });

      setCalendarEvents((current) =>
        [...current.filter((item) => item.id !== savedEvent.id), savedEvent].sort((first, second) =>
          first.startsAt.localeCompare(second.startsAt)
        )
      );
      setEventForm(EMPTY_EVENT_FORM);
      triggerNotification(eventForm.id ? "Kegiatan berhasil diperbarui!" : "Kegiatan berhasil ditambahkan ke kalender!");
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal menyimpan kegiatan"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEventForm({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startsAt: toLocalDateTimeInput(event.startsAt),
      endsAt: toLocalDateTimeInput(event.endsAt)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteEvent = async (id: string) => {
    if (!adminSession.isSuperAdmin || !confirm("Apakah Anda yakin ingin menghapus kegiatan ini dari kalender?")) return;

    setIsSubmitting(true);
    try {
      await deleteCalendarEventAction(id);
      setCalendarEvents((current) => current.filter((event) => event.id !== id));
      if (eventForm.id === id) setEventForm(EMPTY_EVENT_FORM);
      triggerNotification("Kegiatan berhasil dihapus dari kalender.");
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal menghapus kegiatan"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7. News & Achievement Handlers (Superadmin only)
  const resetNewsForm = () => {
    const nextOrder = Math.max(0, newsForm.order, ...newsItems.map((item) => item.order)) + 1;
    setNewsForm({ ...EMPTY_NEWS_FORM, order: nextOrder });
    setNewsImage(null);
    setNewsFileInputKey((current) => current + 1);
  };

  const sortNewsItems = (items: NewsItem[]) =>
    [...items].sort((first, second) => first.order - second.order || second.publishedAt.localeCompare(first.publishedAt));

  const handleNewsSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!adminSession.isSuperAdmin) {
      triggerNotification("Hanya Superadmin yang dapat mengelola berita.", true);
      return;
    }
    if (!newsForm.title.trim() || !newsForm.category.trim() || !newsForm.summary.trim()) {
      triggerNotification("Judul, kategori, dan ringkasan berita wajib diisi.", true);
      return;
    }

    const formData = new FormData();
    Object.entries(newsForm).forEach(([key, value]) => formData.set(key, String(value)));
    if (newsImage) formData.set("image", newsImage);

    setIsSubmitting(true);
    try {
      const savedNews = await saveNewsItemAction(formData);
      setNewsItems((current) => sortNewsItems([...current.filter((item) => item.id !== savedNews.id), savedNews]));
      const wasEditing = Boolean(newsForm.id);
      resetNewsForm();
      triggerNotification(wasEditing ? "Berita berhasil diperbarui!" : "Berita berhasil ditambahkan!");
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal menyimpan berita"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNews = (item: NewsItem) => {
    setNewsForm({
      id: item.id,
      title: item.title,
      category: item.category,
      summary: item.summary,
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl,
      publishedAt: item.publishedAt.slice(0, 10),
      isPublished: item.isPublished,
      order: item.order,
    });
    setNewsImage(null);
    setNewsFileInputKey((current) => current + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleNews = async (item: NewsItem) => {
    setIsSubmitting(true);
    try {
      const updated = await setNewsPublishedAction(item.id, !item.isPublished);
      setNewsItems((current) => current.map((news) => (news.id === item.id ? updated : news)));
      triggerNotification(updated.isPublished ? "Berita ditampilkan di beranda." : "Berita disembunyikan dari beranda.");
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal mengubah status berita"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNews = async (item: NewsItem) => {
    if (!confirm(`Hapus berita “${item.title}”?`)) return;
    setIsSubmitting(true);
    try {
      await deleteNewsItemAction(item.id);
      setNewsItems((current) => current.filter((news) => news.id !== item.id));
      if (newsForm.id === item.id) resetNewsForm();
      triggerNotification("Berita berhasil dihapus.");
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal menghapus berita"), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Lists
  const filteredMembers = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
                        m.role.toLowerCase().includes(memberSearch.toLowerCase());
    const matchDiv = memberDivisionFilter === "Semua" || m.division === memberDivisionFilter;
    return matchSearch && matchDiv;
  });

  const filteredDocs = documents.filter((d) => 
    d.title.toLowerCase().includes(documentSearch.toLowerCase()) ||
    d.category.toLowerCase().includes(documentSearch.toLowerCase())
  );

  const selectTab = (tab: TabType) => {
    setActiveTab(tab);
    setAdminMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans lg:flex">
      {/* Toast Notifications */}
      {successMessage && (
        <div className="fixed left-4 right-4 top-20 z-[70] flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-white shadow-xl animate-slide-in sm:left-auto sm:right-6 sm:top-24">
          <Check size={18} />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed left-4 right-4 top-20 z-[70] flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3.5 text-sm font-semibold text-white shadow-xl animate-slide-in sm:left-auto sm:right-6 sm:top-24">
          <X size={18} />
          {errorMessage}
        </div>
      )}

      {adminMobileOpen && <button type="button" aria-label="Tutup menu admin" onClick={() => setAdminMobileOpen(false)} className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden" />}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[min(18rem,88vw)] shrink-0 flex-col border-r border-white/5 bg-primary text-cream shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:w-72 lg:translate-x-0 lg:shadow-none ${adminMobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-20 flex items-center px-6 gap-2.5 border-b border-white/5 bg-primary">
          <div className="p-2 bg-white/10 rounded-lg text-white">
            <Waves className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-lg font-black tracking-tight text-white block">HMTKBA Admin</span>
            <span className="text-[10px] uppercase font-bold text-accent tracking-widest leading-none block">Web Dashboard</span>
          </div>
          <button type="button" onClick={() => setAdminMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Tutup menu admin"><X size={19} /></button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => selectTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
              activeTab === "dashboard"
                ? "bg-cta text-primary shadow-md font-bold"
                : "text-cream/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <LayoutDashboard size={18} />
            Ringkasan
          </button>
          {adminSession.isSuperAdmin && (
            <button
              onClick={() => selectTab("website")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                activeTab === "website"
                  ? "bg-cta text-primary shadow-md font-bold"
                  : "text-cream/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Palette size={18} />
              Konten & Tampilan
            </button>
          )}
          <button
            onClick={() => selectTab("hero")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
              activeTab === "hero"
                ? "bg-cta text-primary shadow-md font-bold"
                : "text-cream/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Megaphone size={18} />
            Konten Hero
          </button>
          <button
            onClick={() => selectTab("vision")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
              activeTab === "vision"
                ? "bg-cta text-primary shadow-md font-bold"
                : "text-cream/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <BookOpen size={18} />
            Visi & Misi
          </button>
          <button
            onClick={() => selectTab("members")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
              activeTab === "members"
                ? "bg-cta text-primary shadow-md font-bold"
                : "text-cream/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Users size={18} />
            Struktur Organisasi
          </button>
          <button
            onClick={() => selectTab("documents")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
              activeTab === "documents"
                ? "bg-cta text-primary shadow-md font-bold"
                : "text-cream/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FileText size={18} />
            Pusat Dokumen
          </button>
          {adminSession.isSuperAdmin && (
            <button
              onClick={() => selectTab("news")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                activeTab === "news"
                  ? "bg-cta text-primary shadow-md font-bold"
                  : "text-cream/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Newspaper size={18} />
              Berita & Prestasi
            </button>
          )}
          {adminSession.isSuperAdmin && (
            <button
              onClick={() => selectTab("competitions")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                activeTab === "competitions"
                  ? "bg-cta text-primary shadow-md font-bold"
                  : "text-cream/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Trophy size={18} />
              Lomba Manual
            </button>
          )}
          {adminSession.isSuperAdmin && (
            <button
              onClick={() => selectTab("events")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                activeTab === "events"
                  ? "bg-cta text-primary shadow-md font-bold"
                  : "text-cream/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <CalendarClock size={18} />
              Kalender Kegiatan
            </button>
          )}
          <button
            onClick={() => selectTab("stats")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
              activeTab === "stats"
                ? "bg-cta text-primary shadow-md font-bold"
                : "text-cream/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Database size={18} />
            Data Center (BPS)
          </button>
        </nav>

        <div className="p-4 border-t border-white/5 bg-primary">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/90 text-white rounded-xl text-sm font-bold transition hover:bg-red-700"
          >
            <LogOut size={16} />
            Keluar Akun
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:min-h-20 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setAdminMobileOpen(true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-primary lg:hidden" aria-label="Buka menu admin"><Menu size={20} /></button>
          <h2 className="truncate text-base font-black text-primary sm:text-lg lg:text-xl">
            {activeTab === "dashboard" && "Dashboard Ringkasan"}
            {activeTab === "website" && "Konten & Tampilan Website"}
            {activeTab === "hero" && "Edit Konten Hero"}
            {activeTab === "vision" && "Kelola Visi & Misi"}
            {activeTab === "members" && "Pengurus Struktur Organisasi"}
            {activeTab === "documents" && "Pusat Dokumen & Regulasi"}
            {activeTab === "news" && "Berita & Prestasi"}
            {activeTab === "competitions" && "Kelola Lomba Manual"}
            {activeTab === "events" && "Kalender Kegiatan & Pengingat"}
            {activeTab === "stats" && "Pusat Statistik Regional"}
          </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <a
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-secondary transition hover:border-primary hover:text-primary md:flex"
            >
              <Eye size={14} />
              Lihat Website Utama
            </a>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
                {adminSession.divisionName.slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden text-xs font-bold text-primary xl:inline">{adminSession.divisionName}</span>
              {adminSession.isSuperAdmin && (
                <span className="hidden items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-amber-800 sm:inline-flex">
                  <Crown size={11} aria-hidden="true" /> Akses penuh
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Panels */}
        <main className="mx-auto w-full max-w-[1500px] flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === "website" && adminSession.isSuperAdmin && (
            <WebsiteContentEditor
              initialHero={initialHero}
              initialVisionMission={initialVisionMission}
              initialSiteContent={initialSiteContent}
            />
          )}

          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-gradient-to-r from-primary to-secondary p-8 rounded-2xl text-cream shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                <h3 className="text-2xl font-bold text-white mb-2">Selamat datang, {adminSession.divisionName}!</h3>
                <p className="text-sm opacity-90 max-w-xl leading-relaxed">
                  {adminSession.isSuperAdmin
                    ? "Anda memiliki otoritas penuh untuk mengelola seluruh konten, pengurus, dokumen, unggahan, dan data website."
                    : "Gunakan dashboard ini untuk mengelola konten HMTKBA sesuai akses divisi yang sedang login."}
                </p>
              </div>

              {/* Statistics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Pengurus</span>
                    <span className="text-3xl font-extrabold text-primary">{members.length}</span>
                    <span className="text-xs text-secondary/70 block mt-1">Aktif di 6 Divisi</span>
                  </div>
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                    <Users size={26} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Berita Aktif</span>
                    <span className="text-3xl font-extrabold text-primary">{newsItems.filter((item) => item.isPublished).length}</span>
                    <span className="text-xs text-secondary/70 block mt-1">Tampil di beranda</span>
                  </div>
                  <div className="p-4 bg-violet-50 text-violet-600 rounded-xl">
                    <Newspaper size={26} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Kegiatan Kalender</span>
                    <span className="text-3xl font-extrabold text-primary">{calendarEvents.length}</span>
                    <span className="text-xs text-secondary/70 block mt-1">Pengingat terjadwal</span>
                  </div>
                  <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
                    <CalendarClock size={26} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Dokumen & Regulasi</span>
                    <span className="text-3xl font-extrabold text-primary">{documents.length}</span>
                    <span className="text-xs text-secondary/70 block mt-1">Modul & SOP Akademik</span>
                  </div>
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                    <FileText size={26} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Wilayah Terdaftar</span>
                    <span className="text-3xl font-extrabold text-primary">{Object.keys(regionalStats).length}</span>
                    <span className="text-xs text-secondary/70 block mt-1">Data Statistik BPS Regional</span>
                  </div>
                  <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
                    <Database size={26} />
                  </div>
                </div>
              </div>

              {/* Quick instructions */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-primary mb-4 text-base flex items-center gap-2">
                  <Check size={18} className="text-cta" />
                  Instruksi Singkat Pengaturan Konten
                </h4>
                <ul className="space-y-3.5 text-slate-600 text-sm">
                  <li className="flex items-start gap-2.5">
                    <span className="h-5 w-5 bg-slate-100 text-primary flex items-center justify-center font-bold text-xs rounded-full mt-0.5 shrink-0">1</span>
                    <p><strong>Edit Judul & Background:</strong> Masuk ke tab &quot;Konten Hero&quot; untuk memperbarui tajuk web utama dan mengganti gambar latar. File gambar harus berformat JPEG/PNG.</p>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="h-5 w-5 bg-slate-100 text-primary flex items-center justify-center font-bold text-xs rounded-full mt-0.5 shrink-0">2</span>
                    <p><strong>Kelola Kepengurusan:</strong> Di tab &quot;Struktur Organisasi&quot;, Anda dapat menambah pengurus baru, mengedit jabatan mereka, serta mengunggah foto profil yang akan otomatis muncul di halaman depan.</p>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="h-5 w-5 bg-slate-100 text-primary flex items-center justify-center font-bold text-xs rounded-full mt-0.5 shrink-0">3</span>
                    <p><strong>Upload Dokumen:</strong> Masuk ke tab &quot;Pusat Dokumen&quot;, klik tambah, dan langsung seret berkas PDF standar irigasi atau modul hidrolika Anda ke kolom unggah.</p>
                  </li>
                  {adminSession.isSuperAdmin && (
                    <li className="flex items-start gap-2.5">
                      <span className="h-5 w-5 bg-slate-100 text-primary flex items-center justify-center font-bold text-xs rounded-full mt-0.5 shrink-0">4</span>
                      <p><strong>Jadwalkan Kegiatan:</strong> Buka tab &quot;Kalender Kegiatan&quot; untuk menambah acara. Tanggalnya akan ditandai pada kalender publik dan hitung mundur muncul otomatis.</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: HERO CONTENT */}
          {activeTab === "hero" && (
            <form onSubmit={handleHeroSubmit} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary tracking-wide block">Judul Utama (Title)</label>
                  <input
                    type="text"
                    value={hero.title}
                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary text-slate-800 font-medium text-sm transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary tracking-wide block">Subjudul (Subtitle)</label>
                  <textarea
                    value={hero.subtitle}
                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary text-slate-800 font-medium text-sm transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary tracking-wide block">Teks Tombol Aksi (CTA Button Text)</label>
                  <input
                    type="text"
                    value={hero.ctaText}
                    onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary text-slate-800 font-medium text-sm transition"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary tracking-wide block">Gambar Latar Hero (Background Image URL)</label>
                  <div className="flex flex-col sm:flex-row items-stretch gap-4">
                    <input
                      type="text"
                      value={hero.backgroundImageUrl || ""}
                      onChange={(e) => setHero({ ...hero, backgroundImageUrl: e.target.value })}
                      placeholder="Masukkan URL gambar atau gunakan uploader di kanan →"
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary text-slate-800 font-medium text-sm transition"
                    />
                    <label className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-dashed border-slate-300 hover:border-primary bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-500 hover:text-primary transition font-bold text-sm shrink-0">
                      <Upload size={16} />
                      Unggah Gambar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroBgUpload}
                        disabled={isSubmitting}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {hero.backgroundImageUrl && (
                    <div className="relative mt-2 aspect-video w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={hero.backgroundImageUrl}
                        alt="Hero Background Preview"
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={() => setHero({ ...hero, backgroundImageUrl: "" })}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-primary text-cream hover:bg-secondary font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Simpan Perubahan Hero
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: VISION & MISSION */}
          {activeTab === "vision" && (
            <form onSubmit={handleVisionMissionSubmit} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary tracking-wide block">Pernyataan Visi (Vision Statement)</label>
                <textarea
                  value={visionMission.vision}
                  onChange={(e) => setVisionMission({ ...visionMission, vision: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary text-slate-800 font-medium text-sm transition"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-primary tracking-wide">Butir-Butir Misi (Mission Items)</label>
                  <button
                    type="button"
                    onClick={handleAddMissionItem}
                    className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-primary transition"
                  >
                    <Plus size={14} />
                    Tambah Item Misi
                  </button>
                </div>

                <div className="space-y-3">
                  {visionMission.mission.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-stretch">
                      <div className="flex items-center justify-center h-12 w-12 bg-slate-100 text-slate-500 font-bold rounded-xl text-sm shrink-0 border border-slate-200">
                        {idx + 1}
                      </div>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleMissionItemChange(idx, e.target.value)}
                        required
                        placeholder={`Tulis misi ke-${idx + 1}...`}
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary text-slate-800 font-medium text-sm transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMissionItem(idx)}
                        className="p-3 border border-red-200 hover:border-red-500 text-red-500 hover:bg-red-50 rounded-xl transition shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-primary text-cream hover:bg-secondary font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Simpan Visi & Misi
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: MEMBERS MANAGEMENT */}
          {activeTab === "members" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-between">
                {/* Search and Filters */}
                <div className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl">
                  <div className="relative flex-1 min-w-[200px]">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      placeholder="Cari anggota atau jabatan..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <select
                    value={memberDivisionFilter}
                    onChange={(e) => setMemberDivisionFilter(e.target.value)}
                    disabled={!adminSession.canManageAllDivisions}
                    className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {adminSession.canManageAllDivisions && <option value="Semua">Semua Divisi</option>}
                    {availableDivisions.map((div) => (
                      <option key={div} value={div}>
                        {div.replace(" (Badan Pengurus Harian)", "")}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() =>
                    setMemberModal({
                      isOpen: true,
                      mode: "add",
                      data: { id: "", name: "", role: "", division: defaultMemberDivision, period: "2024/2025", imageUrl: "" }
                    })
                  }
                  className="px-5 py-2.5 bg-primary text-cream hover:bg-secondary font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 transition shrink-0"
                >
                  <Plus size={16} />
                  Tambah Pengurus
                </button>
              </div>

              {/* Members Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Anggota</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Divisi</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Jabatan</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Periode</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-slate-50/40 transition">
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className="h-10 w-8 rounded overflow-hidden bg-sky-100 flex items-center justify-center shrink-0 border border-slate-100">
                                {member.imageUrl ? (
                                  <img
                                    src={member.imageUrl}
                                    alt={member.name}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <span className="text-primary font-bold text-xs">
                                    {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-bold text-primary">{member.name}</span>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                              {member.division || "Pengurus"}
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-secondary">
                              {member.role}
                            </td>
                            <td className="px-6 py-4 text-xs font-medium text-slate-400">
                              {member.period}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() =>
                                    setMemberModal({
                                      isOpen: true,
                                      mode: "edit",
                                      data: member
                                    })
                                  }
                                  className="p-2 border border-slate-100 hover:border-slate-300 text-slate-500 hover:text-primary rounded-lg transition"
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteMember(member.id)}
                                  className="p-2 border border-slate-100 hover:border-red-200 text-slate-500 hover:text-red-500 rounded-lg transition"
                                  title="Hapus"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-10 text-slate-400 text-sm font-medium">
                            Tidak ada data anggota ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTS MANAGEMENT */}
          {activeTab === "documents" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-between">
                <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari dokumen atau kategori..."
                    value={documentSearch}
                    onChange={(e) => setDocumentSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  onClick={() =>
                    setDocumentModal({
                      isOpen: true,
                      mode: "add",
                      data: { id: "", title: "", category: "Regulasi", downloadUrl: "" }
                    })
                  }
                  className="px-5 py-2.5 bg-primary text-cream hover:bg-secondary font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 transition shrink-0"
                >
                  <Plus size={16} />
                  Tambah Dokumen
                </button>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-2.5 py-1 bg-sky-50 text-secondary border border-sky-100 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            {doc.category}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() =>
                                setDocumentModal({
                                  isOpen: true,
                                  mode: "edit",
                                  data: doc
                                })
                              }
                              className="p-1.5 border border-slate-50 hover:border-slate-200 text-slate-400 hover:text-primary rounded-lg transition"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-1.5 border border-slate-50 hover:border-red-100 text-slate-400 hover:text-red-500 rounded-lg transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <h4 className="text-base font-bold text-primary line-clamp-2 mb-4 leading-snug">
                          {doc.title}
                        </h4>
                      </div>
                      <a
                        href={doc.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-secondary hover:text-primary hover:underline flex items-center gap-1 mt-auto"
                      >
                        <FileText size={14} />
                        Lihat Berkas Terlampir
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10 bg-white border border-slate-100 rounded-2xl text-slate-400 text-sm font-medium">
                    Tidak ada dokumen ditemukan.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: NEWS & ACHIEVEMENTS — SUPERADMIN ONLY */}
          {activeTab === "news" && adminSession.isSuperAdmin && (
            <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr] animate-fade-in">
              <form onSubmit={handleNewsSubmit} className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cta">
                      <Newspaper size={16} /> Konten beranda
                    </p>
                    <h3 className="mt-2 text-xl font-black text-primary">
                      {newsForm.id ? "Edit berita" : "Tambah berita baru"}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Cocok untuk kabar lomba, prestasi mahasiswa, kegiatan, dan pengumuman penting.
                    </p>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-cream">
                    <ImageIcon size={21} />
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Judul berita</label>
                    <input
                      type="text"
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      required
                      maxLength={160}
                      placeholder="Contoh: Tim HMTKBA Raih Juara 1 Lomba..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[1fr_.75fr]">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Kategori</label>
                      <input
                        type="text"
                        value={newsForm.category}
                        onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                        required
                        maxLength={60}
                        placeholder="Prestasi / Kegiatan"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Tanggal</label>
                      <input
                        type="date"
                        value={newsForm.publishedAt}
                        onChange={(e) => setNewsForm({ ...newsForm, publishedAt: e.target.value })}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Ringkasan</label>
                    <textarea
                      value={newsForm.summary}
                      onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                      required
                      maxLength={1000}
                      rows={5}
                      placeholder="Tuliskan ringkasan singkat yang akan tampil di beranda..."
                      className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Foto utama</label>
                    {(newsForm.imageUrl || newsImage) && (
                      <div className="relative h-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        {newsImage ? (
                          <div className="grid h-full place-items-center px-5 text-center text-xs font-bold text-primary">
                            Foto baru dipilih: {newsImage.name}
                          </div>
                        ) : (
                          <img src={newsForm.imageUrl} alt="Pratinjau berita" className="h-full w-full object-cover" />
                        )}
                      </div>
                    )}
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500 transition hover:border-primary hover:text-primary">
                      <Upload size={15} /> {newsImage ? "Ganti pilihan foto" : "Pilih foto dari perangkat"}
                      <input
                        key={newsFileInputKey}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={(e) => setNewsImage(e.target.files?.[0] ?? null)}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="url"
                      value={newsForm.imageUrl.startsWith("http") ? newsForm.imageUrl : ""}
                      onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                      placeholder="Atau tempel URL foto (opsional)"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                    />
                    <p className="text-[11px] leading-5 text-slate-400">Format JPG, PNG, WebP, atau AVIF. Maksimal 4 MB.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Tautan detail (opsional)</label>
                      <input
                        type="text"
                        value={newsForm.linkUrl}
                        onChange={(e) => setNewsForm({ ...newsForm, linkUrl: e.target.value })}
                        placeholder="https://... atau /halaman"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Urutan</label>
                      <input
                        type="number"
                        min={0}
                        max={999}
                        value={newsForm.order}
                        onChange={(e) => setNewsForm({ ...newsForm, order: Number(e.target.value) })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span>
                      <span className="block text-xs font-black text-primary">Tampilkan di beranda</span>
                      <span className="mt-1 block text-[11px] text-slate-500">Matikan untuk menyimpan sebagai draf.</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={newsForm.isPublished}
                      onChange={(e) => setNewsForm({ ...newsForm, isPublished: e.target.checked })}
                      className="h-5 w-5 accent-primary"
                    />
                  </label>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  {newsForm.id && (
                    <button
                      type="button"
                      onClick={resetNewsForm}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                      Batal edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black text-cream shadow-md transition hover:bg-secondary disabled:cursor-wait disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    {newsForm.id ? "Simpan perubahan" : "Terbitkan berita"}
                  </button>
                </div>
              </form>

              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cta">Daftar berita</p>
                    <h3 className="mt-2 text-xl font-black text-primary">{newsItems.length} konten tersimpan</h3>
                  </div>
                  <span className="rounded-full bg-cream px-3 py-1.5 text-[11px] font-black text-primary">
                    {newsItems.filter((item) => item.isPublished).length} aktif
                  </span>
                </div>

                {newsItems.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    {newsItems.map((item) => (
                      <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <div className="grid sm:grid-cols-[150px_1fr]">
                          <div className="h-36 bg-slate-100 sm:h-full">
                            <img src={item.imageUrl || "/LOGO HIMA.png"} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-cream px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-primary">{item.category}</span>
                                  <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${item.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                    {item.isPublished ? "Tayang" : "Draf"}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400">Urutan {item.order}</span>
                                </div>
                                <h4 className="mt-3 font-black leading-snug text-primary">{item.title}</h4>
                                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.summary}</p>
                                <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                  {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(item.publishedAt))}
                                </p>
                              </div>
                              <div className="flex shrink-0 flex-col gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditNews(item)}
                                  className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-primary hover:text-primary"
                                  aria-label={`Edit ${item.title}`}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleNews(item)}
                                  className="rounded-lg border border-slate-200 px-2 py-1.5 text-[9px] font-black text-slate-500 transition hover:border-primary hover:text-primary"
                                  aria-label={item.isPublished ? `Sembunyikan ${item.title}` : `Tampilkan ${item.title}`}
                                >
                                  {item.isPublished ? "Draf" : "Tayang"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteNews(item)}
                                  className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:text-red-500"
                                  aria-label={`Hapus ${item.title}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 px-6 py-12 text-center">
                    <Newspaper size={32} className="mx-auto text-slate-300" />
                    <p className="mt-3 text-sm font-bold text-slate-500">Belum ada berita.</p>
                    <p className="mt-1 text-xs text-slate-400">Isi formulir di samping untuk menerbitkan kabar pertama.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 7: MANUAL COMPETITIONS — SUPERADMIN ONLY */}
          {activeTab === "competitions" && adminSession.isSuperAdmin && (
            <ManualCompetitionEditor initialItems={initialManualCompetitions} />
          )}

          {/* TAB 8: CALENDAR EVENTS — SUPERADMIN ONLY */}
          {activeTab === "events" && adminSession.isSuperAdmin && (
            <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr] animate-fade-in">
              <form onSubmit={handleEventSubmit} className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cta">
                      <BellRing size={16} /> Pengingat publik
                    </p>
                    <h3 className="mt-2 text-xl font-black text-primary">
                      {eventForm.id ? "Edit kegiatan" : "Tambah kegiatan baru"}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Kegiatan akan ditandai di kalender halaman utama dan acara terdekat memiliki hitung mundur otomatis.
                    </p>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-cream">
                    <CalendarClock size={21} />
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Nama kegiatan</label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      required
                      maxLength={120}
                      placeholder="Contoh: Rapat Besar HMTKBA"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Mulai</label>
                      <input
                        type="datetime-local"
                        value={eventForm.startsAt}
                        onChange={(e) => setEventForm({ ...eventForm, startsAt: e.target.value })}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Selesai (opsional)</label>
                      <input
                        type="datetime-local"
                        value={eventForm.endsAt}
                        min={eventForm.startsAt || undefined}
                        onChange={(e) => setEventForm({ ...eventForm, endsAt: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Lokasi (opsional)</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={eventForm.location}
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                        maxLength={160}
                        placeholder="Contoh: Aula Kampus"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Keterangan (opsional)</label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      maxLength={800}
                      rows={4}
                      placeholder="Tuliskan informasi yang perlu diingat peserta..."
                      className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  {eventForm.id && (
                    <button
                      type="button"
                      onClick={() => setEventForm(EMPTY_EVENT_FORM)}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                      Batal edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black text-cream shadow-md transition hover:bg-secondary disabled:cursor-wait disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    {eventForm.id ? "Simpan perubahan" : "Tambahkan ke kalender"}
                  </button>
                </div>
              </form>

              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cta">Daftar agenda</p>
                    <h3 className="mt-2 text-xl font-black text-primary">{calendarEvents.length} kegiatan terjadwal</h3>
                  </div>
                  <span className="rounded-full bg-cream px-3 py-1.5 text-[11px] font-black text-primary">Tersimpan</span>
                </div>

                {calendarEvents.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    {calendarEvents.map((event) => {
                      const hasPassed = new Date(event.endsAt ?? event.startsAt).getTime() < Date.now();
                      return (
                        <article key={event.id} className={`rounded-2xl border p-5 ${hasPassed ? "border-slate-100 bg-slate-50/70" : "border-cta/35 bg-cream/30"}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-black text-primary">{event.title}</h4>
                                <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wide ${hasPassed ? "bg-slate-200 text-slate-500" : "bg-primary text-cream"}`}>
                                  {hasPassed ? "Selesai" : "Mendatang"}
                                </span>
                              </div>
                              <p className="mt-2 flex items-start gap-2 text-xs font-semibold leading-5 text-slate-600">
                                <Clock3 size={15} className="mt-0.5 shrink-0 text-cta" /> {formatAdminEventDate(event.startsAt)}
                              </p>
                              {event.location && (
                                <p className="mt-1 flex items-start gap-2 text-xs leading-5 text-slate-500">
                                  <MapPin size={15} className="mt-0.5 shrink-0 text-cta" /> {event.location}
                                </p>
                              )}
                              {event.description && <p className="mt-3 text-xs leading-5 text-slate-500">{event.description}</p>}
                            </div>
                            <div className="flex shrink-0 gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleEditEvent(event)}
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-primary hover:text-primary"
                                aria-label={`Edit ${event.title}`}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteEvent(event.id)}
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:text-red-500"
                                aria-label={`Hapus ${event.title}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 px-6 py-12 text-center">
                    <CalendarClock size={32} className="mx-auto text-slate-300" />
                    <p className="mt-3 text-sm font-bold text-slate-500">Belum ada kegiatan.</p>
                    <p className="mt-1 text-xs text-slate-400">Isi formulir di samping untuk membuat pengingat pertama.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 9: DATA CENTER (REGIONAL STATS) */}
          {activeTab === "stats" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-bold text-primary whitespace-nowrap">Pilih Wilayah Kerja:</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() =>
                    setStatModal({
                      isOpen: true,
                      mode: "add",
                      categoryKey: "",
                      data: { category: "", value: "", unit: "", year: "2024", description: "" }
                    })
                  }
                  className="px-5 py-2.5 bg-primary text-cream hover:bg-secondary font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 transition"
                >
                  <Plus size={16} />
                  Tambah Parameter
                </button>
              </div>

              {/* Stats Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori Statistik</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nilai / Angka</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Satuan</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tahun Data</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Penjelasan Singkat</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {regionalStats[selectedRegion] && regionalStats[selectedRegion].length > 0 ? (
                        regionalStats[selectedRegion].map((stat, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/40 transition">
                            <td className="px-6 py-4 text-sm font-bold text-primary">{stat.category}</td>
                            <td className="px-6 py-4 text-sm font-extrabold text-secondary">{stat.value}</td>
                            <td className="px-6 py-4 text-xs font-bold text-cta">{stat.unit}</td>
                            <td className="px-6 py-4 text-xs font-medium text-slate-400">{stat.year}</td>
                            <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{stat.description}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() =>
                                    setStatModal({
                                      isOpen: true,
                                      mode: "edit",
                                      categoryKey: stat.category,
                                      data: stat
                                    })
                                  }
                                  className="p-2 border border-slate-100 hover:border-slate-300 text-slate-500 hover:text-primary rounded-lg transition"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteStat(stat.category)}
                                  className="p-2 border border-slate-100 hover:border-red-200 text-slate-500 hover:text-red-500 rounded-lg transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-slate-400 text-sm font-medium">
                            Tidak ada statistik terdaftar untuk wilayah ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: ADD/EDIT MEMBER */}
      {memberModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 md:p-8 animate-zoom-in overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-primary">
                {memberModal.mode === "add" ? "Tambah Anggota Pengurus" : "Edit Profil Anggota"}
              </h3>
              <button
                onClick={() => setMemberModal({ ...memberModal, isOpen: false })}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={memberMemberSubmitAction => handleMemberSubmit(memberMemberSubmitAction)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Nama Lengkap</label>
                <input
                  type="text"
                  value={memberModal.data.name}
                  onChange={(e) =>
                    setMemberModal({
                      ...memberModal,
                      data: { ...memberModal.data, name: e.target.value }
                    })
                  }
                  required
                  placeholder="Masukkan nama lengkap..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Periode</label>
                  <input
                    type="text"
                    value={memberModal.data.period}
                    onChange={(e) =>
                      setMemberModal({
                        ...memberModal,
                        data: { ...memberModal.data, period: e.target.value }
                      })
                    }
                    required
                    placeholder="e.g. 2024/2025"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Divisi Kerja</label>
                  <select
                    value={memberModal.data.division}
                    onChange={(e) =>
                      setMemberModal({
                        ...memberModal,
                        data: { ...memberModal.data, division: e.target.value }
                      })
                    }
                    disabled={!adminSession.canManageAllDivisions}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm cursor-pointer"
                  >
                    {availableDivisions.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Jabatan / Peran</label>
                <input
                  type="text"
                  value={memberModal.data.role}
                  onChange={(e) =>
                    setMemberModal({
                      ...memberModal,
                      data: { ...memberModal.data, role: e.target.value }
                    })
                  }
                  required
                  placeholder="e.g. Kepala Divisi, Anggota Divisi..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Foto Profil (JPEG/PNG)</label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-14 rounded-lg bg-sky-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {memberModal.data.imageUrl ? (
                      <img
                        src={memberModal.data.imageUrl}
                        alt="Profil preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-primary font-bold text-xs">FOTO</span>
                    )}
                  </div>
                  <label className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 hover:border-primary hover:bg-slate-50 rounded-xl cursor-pointer text-slate-500 hover:text-primary transition font-bold text-xs">
                    <Upload size={14} />
                    Pilih File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMemberPhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {memberModal.data.imageUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setMemberModal({
                          ...memberModal,
                          data: { ...memberModal.data, imageUrl: "" }
                        })
                      }
                      className="text-xs font-semibold text-red-500 hover:underline"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setMemberModal({ ...memberModal, isOpen: false })}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-primary text-cream hover:bg-secondary rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD/EDIT DOCUMENT */}
      {documentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 md:p-8 animate-zoom-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-primary">
                {documentModal.mode === "add" ? "Tambah Dokumen Baru" : "Edit Dokumen"}
              </h3>
              <button
                onClick={() => setDocumentModal({ ...documentModal, isOpen: false })}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDocumentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Judul Dokumen</label>
                <input
                  type="text"
                  value={documentModal.data.title}
                  onChange={(e) =>
                    setDocumentModal({
                      ...documentModal,
                      data: { ...documentModal.data, title: e.target.value }
                    })
                  }
                  required
                  placeholder="e.g. Modul Hidrolika Terapan..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Kategori Dokumen</label>
                <select
                  value={documentModal.data.category}
                  onChange={(e) =>
                    setDocumentModal({
                      ...documentModal,
                      data: { ...documentModal.data, category: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm cursor-pointer"
                >
                  <option value="Regulasi">Regulasi & Kebijakan</option>
                  <option value="Akademik">Akademik & Materi Kuliah</option>
                  <option value="SOP">Standar Operasional Prosedur (SOP)</option>
                  <option value="Lainnya">Kategori Lainnya</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Lampiran File (PDF/DOC)</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={documentModal.data.downloadUrl}
                    onChange={(e) =>
                      setDocumentModal({
                        ...documentModal,
                        data: { ...documentModal.data, downloadUrl: e.target.value }
                      })
                    }
                    placeholder="Masukkan URL file atau unggah berkas di bawah..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm mb-1"
                  />
                  <label className="flex items-center justify-center gap-1.5 w-full py-3 border-2 border-dashed border-slate-200 hover:border-primary bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-500 hover:text-primary transition font-bold text-xs">
                    {documentUploadProgress !== null && documentUploadProgress < 100 ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {documentUploadProgress !== null && documentUploadProgress < 100
                      ? `Mengunggah... ${documentUploadProgress}%`
                      : documentModal.data.downloadUrl
                        ? "Ganti Berkas"
                        : "Unggah Berkas Baru"}
                    <input
                      type="file"
                      accept=".pdf,.docx,.xlsx"
                      onChange={handleDocumentFileUpload}
                      disabled={isSubmitting}
                      className="hidden"
                    />
                  </label>
                  <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
                    <span>PDF, Word, Excel, atau ZIP · Maksimal 25 MB</span>
                    {documentModal.data.downloadUrl && <span className="font-bold text-emerald-600">Berkas siap disimpan</span>}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDocumentModal({ ...documentModal, isOpen: false })}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-primary text-cream hover:bg-secondary rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Simpan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD/EDIT REGIONAL STAT */}
      {statModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 md:p-8 animate-zoom-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-primary">
                {statModal.mode === "add" ? `Tambah Statistik (${selectedRegion})` : `Edit Parameter (${selectedRegion})`}
              </h3>
              <button
                onClick={() => setStatModal({ ...statModal, isOpen: false })}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStatSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Kategori / Parameter</label>
                <input
                  type="text"
                  value={statModal.data.category}
                  onChange={(e) =>
                    setStatModal({
                      ...statModal,
                      data: { ...statModal.data, category: e.target.value }
                    })
                  }
                  required
                  placeholder="e.g. Ketersediaan Air Tanah..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Nilai Data</label>
                  <input
                    type="text"
                    value={statModal.data.value}
                    onChange={(e) =>
                      setStatModal({
                        ...statModal,
                        data: { ...statModal.data, value: e.target.value }
                      })
                    }
                    required
                    placeholder="e.g. 85.4"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Satuan (Unit)</label>
                  <input
                    type="text"
                    value={statModal.data.unit}
                    onChange={(e) =>
                      setStatModal({
                        ...statModal,
                        data: { ...statModal.data, unit: e.target.value }
                      })
                    }
                    required
                    placeholder="e.g. Miliar m3/tahun, %"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Tahun Pendataan</label>
                <input
                  type="text"
                  value={statModal.data.year}
                  onChange={(e) =>
                    setStatModal({
                      ...statModal,
                      data: { ...statModal.data, year: e.target.value }
                    })
                  }
                  required
                  placeholder="e.g. 2023"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Deskripsi Detail</label>
                <textarea
                  value={statModal.data.description}
                  onChange={(e) =>
                    setStatModal({
                      ...statModal,
                      data: { ...statModal.data, description: e.target.value }
                    })
                  }
                  required
                  rows={3}
                  placeholder="Berikan penjelasan singkat mengenai perolehan data ini..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setStatModal({ ...statModal, isOpen: false })}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-primary text-cream hover:bg-secondary rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Simpan Statistik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
