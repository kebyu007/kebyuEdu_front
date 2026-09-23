"use client";

import { useState, useEffect, useRef } from "react";
import api, { API_BASE_URL } from "@/services/api";
import toast from "react-hot-toast";
import { User, Mail, Phone, Lock, Save, Camera, KeyRound, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [role, setRole] = useState("Foydalanuvchi");

  useEffect(() => {
    setRole(localStorage.getItem("user_role") || "Foydalanuvchi");
    const fetchProfile = async () => {
      try {
        const res: any = await api.get('/auth/me');
        setFormData(prev => ({
          ...prev,
          first_name: res.first_name || "",
          last_name: res.last_name || "",
          email: res.email || "",
          phone: res.phone || "",
        }));
        
        if (res.photo) {
          const baseUrl = API_BASE_URL.replace('/api/v1', '');
          setPhotoPreview(`${baseUrl}/${res.photo.replace(/\\/g, '/')}`);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error("Yangi parollar mos kelmadi!");
      return;
    }

    if (formData.newPassword && !formData.oldPassword) {
      toast.error("Parolni o'zgartirish uchun eski parolni kiriting!");
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("first_name", formData.first_name);
      payload.append("last_name", formData.last_name);
      payload.append("phone", formData.phone);
      if (formData.email) payload.append("email", formData.email);

      if (formData.oldPassword && formData.newPassword) {
        payload.append("oldPassword", formData.oldPassword);
        payload.append("newPassword", formData.newPassword);
      }

      if (selectedFile) {
        payload.append("photo", selectedFile);
      }

      const res: any = await api.patch('/auth/profile', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(res.data?.message || res.message || "Profil muvaffaqiyatli yangilandi");
      
      const updatedUser = res.data?.user || res.user;
      if (updatedUser) {
        localStorage.setItem("user_name", `${updatedUser.first_name} ${updatedUser.last_name}`);
        if (updatedUser.photo) {
          localStorage.setItem("user_photo", updatedUser.photo);
        }
      }

      setFormData(prev => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      setSelectedFile(null);
    } catch (error) {
      // handled by interceptor
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Profil yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-700 pb-12">
      {/* Edge-to-Edge Banner */}
      <div className="relative -mx-6 lg:-mx-10 -mt-6 lg:-mt-10 h-64 lg:h-80 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 overflow-hidden">
        {/* Abstract glowing orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-white/10 blur-[100px] rounded-full transform rotate-45 mix-blend-overlay"></div>
        <div className="absolute bottom-[-50%] right-[-10%] w-[60%] h-[150%] bg-blue-400/20 blur-[120px] rounded-full transform -rotate-12 mix-blend-overlay"></div>
        
        {/* Decorative grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-8 lg:px-12 -mt-24 lg:-mt-32 max-w-7xl mx-auto">
        <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column: Avatar & Basic Info */}
          <div className="xl:col-span-5 space-y-8">
            {/* Glassmorphic Profile Card */}
            <div className="bg-white/70 dark:bg-[#0B0F19]/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.2)] flex flex-col items-center text-center">
              
              <div 
                className="relative w-40 h-40 rounded-full group cursor-pointer mb-6 -mt-20 border-[6px] border-white/80 dark:border-[#0B0F19]/80 shadow-2xl transition-transform duration-500 hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Profile avatar" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-6xl font-black shadow-inner">
                    {formData.first_name ? formData.first_name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                  <Camera className="text-white w-8 h-8 drop-shadow-md" />
                  <span className="text-white text-xs font-semibold drop-shadow-md">Rasm yuklash</span>
                </div>
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </div>

              <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                {formData.first_name} {formData.last_name}
              </h2>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold border border-indigo-500/20 mb-8">
                <ShieldCheck size={16} />
                {role === "TEACHER" ? "O'qituvchi" : role}
              </div>

              <div className="w-full space-y-5 text-left">
                <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block group-focus-within:text-indigo-500 transition-colors">Ism</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-100/50 dark:bg-black/20 border border-slate-200/60 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block group-focus-within:text-indigo-500 transition-colors">Familiya</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-100/50 dark:bg-black/20 border border-slate-200/60 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Contact & Security */}
          <div className="xl:col-span-7 space-y-8">
            
            {/* Contact Details Card */}
            <div className="bg-white/70 dark:bg-[#0B0F19]/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-[0_20px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.2)]">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Mail size={20} />
                </div>
                Aloqa ma'lumotlari
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block group-focus-within:text-blue-500 transition-colors">Telefon raqam</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Phone size={18} />
                    </div>
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-100/50 dark:bg-black/20 border border-slate-200/60 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block group-focus-within:text-blue-500 transition-colors">Email manzil</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-slate-100/50 dark:bg-black/20 border border-slate-200/60 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white/70 dark:bg-[#0B0F19]/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-[0_20px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.2)]">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                  <KeyRound size={20} />
                </div>
                Xavfsizlik
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block group-focus-within:text-rose-500 transition-colors">Eski parol</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      type="password" 
                      name="oldPassword"
                      value={formData.oldPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-100/50 dark:bg-black/20 border border-slate-200/60 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block group-focus-within:text-rose-500 transition-colors">Yangi parol</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      type="password" 
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-100/50 dark:bg-black/20 border border-slate-200/60 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block group-focus-within:text-rose-500 transition-colors">Tasdiqlash</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-100/50 dark:bg-black/20 border border-slate-200/60 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="group relative flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-500 hover:via-purple-500 hover:to-fuchsia-500 text-white rounded-2xl font-bold text-lg overflow-hidden transition-all transform hover:scale-[1.02] hover:-translate-y-1 shadow-[0_15px_30px_rgba(79,70,229,0.3)] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                
                <Save size={22} className={`${saving ? "animate-pulse" : "group-hover:scale-110 transition-transform"}`} />
                <span>{saving ? "Saqlanmoqda..." : "O'zgarishlarni saqlash"}</span>
              </button>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
}
