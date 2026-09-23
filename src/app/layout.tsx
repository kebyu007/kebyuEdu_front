import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KebyuEdu CRM",
  description: "Zamonaviy ERP Tizimi",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white transition-colors duration-300">
        <Providers>{children}</Providers>
        <Toaster 
          position="top-right" 
          toastOptions={{
            className: '!bg-white/60 dark:!bg-[#0B0F19]/40 !backdrop-blur-xl !border !border-white/40 dark:!border-white/10 !text-slate-800 dark:!text-white !rounded-2xl !shadow-[0_10px_40px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.3)] dark:!shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]',
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }} 
        />
      </body>
    </html>
  );
}
