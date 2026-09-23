"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        toast.error("Tizimga kirish uchun avtorizatsiyadan o'ting!");
        router.replace("/login");
      } else {
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    // Show a sleek loading state while checking
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
