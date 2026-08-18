"use client";

import React, { useState } from "react";
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
  Waves
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
  uploadFileAction
} from "@/application/actions/adminActions";
import { HeroContent } from "@/domain/entities/HeroContent";
import { VisionMission } from "@/domain/entities/VisionMission";
import { Member } from "@/domain/entities/Member";
import { Document } from "@/domain/entities/Document";
import { RegionalStat } from "@/domain/entities/RegionalStat";
import type { AdminSession } from "@/application/actions/adminActions";

interface AdminDashboardPageProps {
  initialHero: HeroContent;
  initialVisionMission: VisionMission;
  initialMembers: Member[];
  initialDocuments: Document[];
  initialRegionalStats: Record<string, RegionalStat[]>;
  regions: string[];
  adminSession: AdminSession;
}

type TabType = "dashboard" | "hero" | "vision" | "members" | "documents" | "stats";

const DIVISIONS = [
  "BPH (Badan Pengurus Harian)",
  "Sekretariat Kabinet",
  "Akademik Mahasiswa",
  "Minat dan Bakat",
  "Ekonomi Kreatif",
  "Komunikasi dan Publikasi"
];

export default function AdminDashboardPage({
  initialHero,
  initialVisionMission,
  initialMembers,
  initialDocuments,
  initialRegionalStats,
  regions,
  adminSession
}: AdminDashboardPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Content States
  const [hero, setHero] = useState<HeroContent>(initialHero);
  const [visionMission, setVisionMission] = useState<VisionMission>(initialVisionMission);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [regionalStats, setRegionalStats] = useState<Record<string, RegionalStat[]>>(initialRegionalStats);
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
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsSubmitting(true);
    try {
      const res = await uploadFileAction(formData);
      if (res.success && res.url) {
        setDocumentModal({
          ...documentModal,
          data: { ...documentModal.data, downloadUrl: res.url }
        });
        triggerNotification("File dokumen berhasil diupload!");
      } else {
        triggerNotification(res.error || "Gagal mengupload dokumen", true);
      }
    } catch (err: unknown) {
      triggerNotification(getErrorMessage(err, "Gagal mengupload dokumen"), true);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 antialiased font-sans">
      {/* Toast Notifications */}
      {successMessage && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2 bg-emerald-500 text-white px-5 py-3.5 rounded-xl shadow-xl animate-slide-in font-semibold text-sm">
          <Check size={18} />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2 bg-red-500 text-white px-5 py-3.5 rounded-xl shadow-xl animate-slide-in font-semibold text-sm">
          <X size={18} />
          {errorMessage}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-72 bg-primary text-cream flex flex-col shrink-0 border-r border-white/5 sticky top-0 h-screen z-20">
        <div className="h-20 flex items-center px-6 gap-2.5 border-b border-white/5 bg-primary">
          <div className="p-2 bg-white/10 rounded-lg text-white">
            <Waves className="h-6 w-6" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white block">HMTKBA Admin</span>
            <span className="text-[10px] uppercase font-bold text-accent tracking-widest leading-none block">Web Dashboard</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
              activeTab === "dashboard"
                ? "bg-cta text-primary shadow-md font-bold"
                : "text-cream/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <LayoutDashboard size={18} />
            Ringkasan
          </button>
          <button
            onClick={() => setActiveTab("hero")}
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
            onClick={() => setActiveTab("vision")}
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
            onClick={() => setActiveTab("members")}
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
            onClick={() => setActiveTab("documents")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
              activeTab === "documents"
                ? "bg-cta text-primary shadow-md font-bold"
                : "text-cream/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FileText size={18} />
            Pusat Dokumen
          </button>
          <button
            onClick={() => setActiveTab("stats")}
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2 capitalize">
            {activeTab === "dashboard" && "Dashboard Ringkasan"}
            {activeTab === "hero" && "Edit Konten Hero"}
            {activeTab === "vision" && "Kelola Visi & Misi"}
            {activeTab === "members" && "Pengurus Struktur Organisasi"}
            {activeTab === "documents" && "Pusat Dokumen & Regulasi"}
            {activeTab === "stats" && "Pusat Statistik Regional"}
          </h2>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-primary text-secondary hover:text-primary rounded-xl text-xs font-bold transition"
            >
              <Eye size={14} />
              Lihat Website Utama
            </a>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
                {adminSession.divisionName.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-primary">{adminSession.divisionName}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Panels */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-gradient-to-r from-primary to-secondary p-8 rounded-2xl text-cream shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                <h3 className="text-2xl font-bold text-white mb-2">Selamat datang, {adminSession.divisionName}!</h3>
                <p className="text-sm opacity-90 max-w-xl leading-relaxed">
                  Gunakan dashboard ini untuk mengelola konten HMTKBA sesuai akses divisi yang sedang login.
                </p>
              </div>

              {/* Statistics Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {/* TAB 6: DATA CENTER (REGIONAL STATS) */}
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
                    <Upload size={14} />
                    Unggah Berkas Baru
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                      onChange={handleDocumentFileUpload}
                      className="hidden"
                    />
                  </label>
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
