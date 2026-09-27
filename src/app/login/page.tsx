"use client";

import Image from "next/image";
import Logo from "@/components/Logo";
import Link from "next/link";
import { User, Lock, Eye, EyeOff, ArrowRight, X, Mail, Send, Key } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotMethod, setForgotMethod] = useState<'email' | 'telegram'>('email');
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    setIsLoading(true);
    try {
      const response: any = await api.post("/auth/login", { phone, password });
      if (response.access_token) {
        localStorage.setItem("access_token", response.access_token);
        if (response.refresh_token) {
          localStorage.setItem("refresh_token", response.refresh_token);
        }
        if (response.user) {
          localStorage.setItem("user_id", response.user.id.toString());
          localStorage.setItem("user_name", `${response.user.first_name} ${response.user.last_name}`);
          localStorage.setItem("user_role", response.user.role || "Foydalanuvchi");
          if (response.user.photo) {
            localStorage.setItem("user_photo", response.user.photo);
          }
        }
        toast.success("Muvaffaqiyatli kirdingiz!");
        
        const role = response.user?.role || "Foydalanuvchi";
        if (role === "STUDENT" || role === "O'quvchi") {
          router.push("/student-dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      // API interceptor handles toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (forgotMethod === 'telegram') {
      const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/Kebyu_edu_bot";
      window.open(botUrl, "_blank");
      setForgotStep(2);
      return;
    }

    if (!forgotIdentifier) return toast.error("Iltimos, email manzilni kiriting!");
    
    setIsForgotLoading(true);
    try {
      const res: any = await api.post("/auth/forgot-password", {
        method: forgotMethod,
        identifier: forgotIdentifier
      });
      toast.success(res.message || "Kod yuborildi");
      setForgotStep(2);
    } catch (error) {
      // toast handled
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken || !newPassword) return toast.error("Iltimos, kod va yangi parolni kiriting!");

    setIsForgotLoading(true);
    try {
      const res: any = await api.post("/auth/reset-password", {
        token: resetToken,
        newPassword: newPassword
      });
      toast.success(res.message || "Parol yangilandi");
      setShowForgotModal(false);
      setForgotStep(1);
      setResetToken("");
      setNewPassword("");
      setForgotIdentifier("");
    } catch (error) {
      // toast handled
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />

      <div className="w-full max-w-[1200px] flex flex-col md:flex-row items-center justify-between z-10 px-6 py-12">
        
        {/* Left Side: Welcome Text / Branding */}
        <div className="w-full md:w-1/2 flex flex-col items-start mb-12 md:mb-0 md:pr-12">
          <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
            <span className="text-sm font-medium text-blue-400">ERP System 2.0</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Tizimga <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              xush kelibsiz
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md leading-relaxed">
            Bizning zamonaviy ERP tizimimiz orqali ta'lim muassasangizni oson va samarali boshqaring.
          </p>
        </div>

        {/* Right Side: Glassmorphism Login Card */}
        <div className="w-full md:w-[480px]">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 md:p-12 rounded-[32px] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] relative">
            {/* Inner subtle glow */}
            <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/5 pointer-events-none" />

            <div className="flex justify-center items-center gap-3 mb-10">
              <div className="py-2">
                <Logo className="h-[60px] flex-shrink-0" textClassName="text-4xl" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Telefon raqam</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <User size={20} />
                  </div>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
                    placeholder="+998901234567" 
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-slate-300">Parol</label>
                  <button 
                    type="button" 
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Parolni unutdingizmi?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
                    placeholder="Parolingizni kiriting" 
                    className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="button" 
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F19] focus:ring-blue-500 transition-all overflow-hidden shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                  <span className="relative flex items-center gap-2">
                    {isLoading ? "Kirilmoqda..." : "Tizimga kirish"}
                    {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500">
                Copyright © {new Date().getFullYear()} KebyuEdu CRM. Barcha huquqlar himoyalangan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#0B0F19]/90 border border-white/10 p-8 rounded-3xl shadow-2xl relative">
            <button 
              onClick={() => { setShowForgotModal(false); setForgotStep(1); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-2">Parolni tiklash</h2>
            <p className="text-slate-400 text-sm mb-6">
              {forgotStep === 1 ? "Parolni tiklash usulini tanlang va ma'lumotni kiriting." : "Sizga kelgan tasdiqlash kodini va yangi parolni kiriting."}
            </p>

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                
                {/* Method Selector */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => { setForgotMethod('email'); setForgotIdentifier(''); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${forgotMethod === 'email' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => { setForgotMethod('telegram'); setForgotIdentifier(''); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${forgotMethod === 'telegram' ? 'bg-[#0088cc] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    Telegram
                  </button>
                </div>

                {forgotMethod === 'email' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">
                      Email manzil
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                        <Mail size={20} />
                      </div>
                      <input 
                        type="email"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="admin@example.com" 
                        required
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-white/5 rounded-xl border border-white/10 px-4">
                    <p className="text-sm text-slate-300">
                      Telegram botimizga o'tib "📱 Raqamni ulashish" tugmasini bosing va kodni oling.
                    </p>
                  </div>
                )}
                <button 
                  type="submit" 
                  disabled={isForgotLoading && forgotMethod === 'email'}
                  className={`w-full flex justify-center items-center gap-2 py-3.5 ${forgotMethod === 'email' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-[#0088cc] hover:bg-[#0077b3]'} text-white rounded-xl font-medium transition-colors disabled:opacity-70`}
                >
                  <Send size={18} />
                  {isForgotLoading && forgotMethod === 'email' ? "Yuborilmoqda..." : (forgotMethod === 'email' ? "Emailga kod yuborish" : "Telegram botga o'tish")}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Tasdiqlash kodi</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                      <Key size={20} />
                    </div>
                    <input 
                      type="text" 
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="123456" 
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-center tracking-widest font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Yangi parol</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                      <Lock size={20} />
                    </div>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Kamida 6 ta belgi" 
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isForgotLoading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors disabled:opacity-70"
                >
                  <Lock size={18} />
                  {isForgotLoading ? "Saqlanmoqda..." : "Parolni yangilash"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
