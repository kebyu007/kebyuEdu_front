"use client";

import Image from "next/image";
import Logo from "@/components/Logo";
import Link from "next/link";
import { User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden">
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

            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Login</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <User size={20} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Loginingizni kiriting" 
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Parol</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
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
                  className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F19] focus:ring-blue-500 transition-all overflow-hidden shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
                >
                  <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                  <span className="relative flex items-center gap-2">
                    Tizimga kirish
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500">
                Copyright © {new Date().getFullYear()} KebyuEdu CRM. Barcha huquqlar himoyalangan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
