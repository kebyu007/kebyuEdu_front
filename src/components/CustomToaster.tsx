"use client";

import { Toaster, toast, resolveValue } from "react-hot-toast";

export default function CustomToaster() {
  return (
    <Toaster position="top-right">
      {(t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        const icon = t.icon;

        return (
          <div
            style={{
              opacity: t.visible ? 1 : 0,
              transform: t.visible ? 'scale(1)' : 'scale(0.95)',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            className={`
              relative overflow-hidden w-full sm:w-80 bg-white/70 dark:bg-[#121621]/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl p-4 flex gap-3 items-start pointer-events-auto
            `}
          >
            {/* Icon Container */}
            <div className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl shadow-inner border border-white/20 ${
              isSuccess ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' :
              isError ? 'bg-gradient-to-br from-rose-400 to-rose-600 text-white' :
              'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white'
            }`}>
              {icon ? icon : isSuccess ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              ) : isError ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </div>

            {/* Message Container */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-snug">
                {resolveValue(t.message, t)}
              </p>
            </div>
            
            {/* Close Button */}
            {t.type !== 'loading' && (
              <button
                onClick={() => toast.dismiss(t.id)}
                className="shrink-0 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-white/10 transition-colors self-start -mr-1 -mt-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        );
      }}
    </Toaster>
  );
}
