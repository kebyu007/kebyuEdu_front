"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Edit2, CheckCircle2, AlertCircle, X, Download, User as UserIcon, Camera, Bell, Shield, MapPin, Lock } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  photo?: string;
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Password Edit State
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setProfile(res as any);
      } catch (error) {
        console.error("Profilni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "Yangi parollar mos tushmadi!" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: "Parol kamida 6 ta belgidan iborat bo'lishi kerak!" });
      return;
    }

    try {
      setSubmitting(true);
      await api.patch("/auth/profile", {
        oldPassword,
        newPassword
      });
      
      setMessage({ type: 'success', text: "Parolingiz muvaffaqiyatli o'zgartirildi!" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setIsEditingPassword(false);
        setMessage(null);
      }, 2000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Parolni o'zgartirishda xatolik yuz berdi.";
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Fayl hajmi 2MB dan oshmasligi kerak!");
      return;
    }

    try {
      setPhotoUploading(true);
      const formData = new FormData();
      formData.append("photo", file);

      const res = await api.patch("/auth/profile", formData);
      
      setProfile(res.user);
      toast.success("Rasm muvaffaqiyatli yuklandi!");
    } catch (error: any) {
      console.error("Rasm yuklashda xatolik:", error);
      const errorMsg = error.response?.data?.message || "Rasm yuklashda xatolik yuz berdi";
      toast.error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getFullPhotoUrl = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    return `${baseUrl.replace("/api/v1", "")}/${path}`;
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto pb-10">
      
      {/* Premium Gradient Header Background */}
      <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-lg border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-700 to-purple-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-30"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-1000"></div>
      </div>

      {/* Main Profile Info Card (Overlapping header) */}
      <div className="relative -mt-20 mx-4 sm:mx-8 bg-white/70 dark:bg-[#121621]/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-white/5 p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-8 relative z-10">
          Shaxsiy ma'lumotlar
        </h2>
        
        <div className="flex flex-col md:flex-row gap-12 relative z-10">
          {/* Photo Section with Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-6 items-end">
              
              {/* Actual Photo with interactive upload */}
              <div className="flex flex-col items-center gap-3 relative group">
                <div className="w-32 h-40 rounded-2xl overflow-hidden shadow-md shadow-indigo-500/20 border-2 border-indigo-500/30 group-hover:border-indigo-400 transition-all duration-300 relative bg-slate-100 dark:bg-white/5">
                  {photoUploading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
                      <Loader2 className="animate-spin text-white" size={24} />
                    </div>
                  )}
                  {profile?.photo ? (
                    <img src={getFullPhotoUrl(profile.photo)!} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-indigo-400 group-hover:text-indigo-500 transition-colors bg-indigo-50/50 dark:bg-indigo-500/10">
                      <UserIcon size={40} />
                    </div>
                  )}

                  {/* Upload Overlay */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center cursor-pointer z-10"
                  >
                    <Camera className="text-white mb-1" size={24} />
                    <span className="text-[10px] text-white font-bold tracking-widest uppercase">O'zgartirish</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    className="hidden" 
                  />
                </div>
                <span className="text-[10px] bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                  Talabga mos
                </span>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center max-w-[200px] font-medium">
                500x500 o'lcham, JPEG, JPG, PNG format, maksimum 2MB
              </p>
            </div>
          </div>

          {/* Details Section (Sleek Typography) */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
            <div className="group">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 group-hover:text-indigo-500 transition-colors">Ism</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white border-b border-transparent group-hover:border-slate-200 dark:group-hover:border-white/10 pb-1 transition-all">
                {profile?.first_name || "-"}
              </p>
            </div>
            <div className="group">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 group-hover:text-indigo-500 transition-colors">Familiya</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white border-b border-transparent group-hover:border-slate-200 dark:group-hover:border-white/10 pb-1 transition-all">
                {profile?.last_name || "-"}
              </p>
            </div>
            <div className="group">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 group-hover:text-indigo-500 transition-colors">Telefon raqam</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white border-b border-transparent group-hover:border-slate-200 dark:group-hover:border-white/10 pb-1 transition-all">
                {profile?.phone || "-"}
              </p>
            </div>
            <div className="group">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 group-hover:text-indigo-500 transition-colors">Email</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white border-b border-transparent group-hover:border-slate-200 dark:group-hover:border-white/10 pb-1 transition-all">
                {profile?.email || "Mavjud emas"}
              </p>
            </div>
            <div className="group">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 group-hover:text-indigo-500 transition-colors">Tizim ID</p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 border-b border-transparent group-hover:border-slate-200 dark:group-hover:border-white/10 pb-1 transition-all">
                #{profile?.id || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Cards (Glassmorphic) */}
      <div className="mx-4 sm:mx-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Login Info */}
        <div className="bg-white/60 dark:bg-[#121621]/60 backdrop-blur-lg rounded-3xl shadow-sm border border-slate-200/50 dark:border-white/5 p-6 flex flex-col justify-between h-36 group hover:shadow-md hover:border-indigo-500/20 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Shield size={16} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tizimga kirish</h3>
          </div>
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{profile?.phone}</p>
        </div>

        {/* Password Info / Edit */}
        <div className={`bg-white/60 dark:bg-[#121621]/60 backdrop-blur-lg rounded-3xl shadow-sm border ${isEditingPassword ? 'border-purple-500/50 shadow-purple-500/10' : 'border-slate-200/50 dark:border-white/5 hover:border-purple-500/20 hover:shadow-md'} p-6 h-36 relative overflow-hidden transition-all duration-500`}>
          {!isEditingPassword ? (
            <div className="flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Lock size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Maxfiy parol</h3>
                </div>
                <button 
                  onClick={() => setIsEditingPassword(true)}
                  className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
                >
                  <Edit2 size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl tracking-[0.2em] text-slate-400 dark:text-slate-500 mt-2">••••••••</p>
                <span className="text-[10px] text-slate-400 uppercase font-bold mt-2 ml-2 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">Himoyalangan</span>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-white dark:bg-[#161B28] p-5 flex flex-col justify-center z-10 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Parolni almashtirish</h3>
                <button onClick={() => { setIsEditingPassword(false); setMessage(null); }} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
              
              <form onSubmit={handlePasswordUpdate} className="flex gap-2">
                <div className="flex-1 flex flex-col gap-2">
                  <input 
                    type="password" 
                    placeholder="Eski parol" 
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1A2035] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all" 
                    required
                  />
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      placeholder="Yangi" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1A2035] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all" 
                      required
                    />
                    <input 
                      type="password" 
                      placeholder="Tasdiq" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1A2035] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all" 
                      required
                    />
                  </div>
                </div>
                <button 
                  disabled={submitting}
                  className="bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl px-4 flex items-center justify-center disabled:opacity-50 shadow-md shadow-purple-500/20 transition-all"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
                </button>
              </form>
              
              {message && (
                <div className={`mt-2 flex items-center gap-1.5 text-[11px] font-bold ${message.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {message.type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {message.text}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Info */}
        <div className="bg-white/60 dark:bg-[#121621]/60 backdrop-blur-lg rounded-3xl shadow-sm border border-slate-200/50 dark:border-white/5 p-6 flex flex-col justify-between h-36 group hover:shadow-md hover:border-indigo-500/20 transition-all cursor-pointer">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Bell size={16} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bildirishnomalar</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-500/20 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-all">
              <Edit2 size={14} />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">SMS, Email xabarnomalarini boshqarish</p>
        </div>
      </div>

    </div>
  );
}
