"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "uz" | "ru" | "en";

interface Translations {
  [key: string]: {
    uz: string;
    ru: string;
    en: string;
  };
}

const translations: Translations = {
  // Sidebar
  "nav.dashboard": { uz: "Asosiy", ru: "Главная", en: "Dashboard" },
  "nav.teachers": { uz: "O'qituvchilar", ru: "Учителя", en: "Teachers" },
  "nav.groups": { uz: "Guruhlar", ru: "Группы", en: "Groups" },
  "nav.students": { uz: "Talabalar", ru: "Студенты", en: "Students" },
  "nav.payments": { uz: "To'lovlar", ru: "Оплаты", en: "Payments" },
  "nav.gifts": { uz: "Sovg'alar", ru: "Подарки", en: "Gifts" },
  "nav.settings": { uz: "Boshqarish", ru: "Настройки", en: "Settings" },
  
  // Management Submenu
  "nav.mgt.menu": { uz: "Menu", ru: "Меню", en: "Menu" },
  "nav.mgt.courses": { uz: "Kurslar", ru: "Курсы", en: "Courses" },
  "nav.mgt.rooms": { uz: "Xonalar", ru: "Кабинеты", en: "Rooms" },
  "nav.mgt.staff": { uz: "Hodimlar", ru: "Сотрудники", en: "Staff" },
  "nav.mgt.coin": { uz: "Coin", ru: "Монеты", en: "Coin" },
  "nav.mgt.messages": { uz: "Xabar Yuborish", ru: "Отправить сообщение", en: "Send Message" },

  "sub.title": { uz: "Obuna", ru: "Подписка", en: "Subscription" },
  "sub.expired": { uz: "Obunangiz tugagan", ru: "Подписка истекла", en: "Subscription expired" },
  "sub.renew": { uz: "Obunani yangilash", ru: "Продлить", en: "Renew now" },

  // Topbar
  "topbar.search": { uz: "Qidirish...", ru: "Поиск...", en: "Search..." },
  "topbar.admin": { uz: "Admin", ru: "Админ", en: "Admin" },

  // Dashboard
  "dash.hello": { uz: "Salom", ru: "Привет", en: "Hello" },
  "dash.welcome": { uz: "KebyuEdu platformasiga xush kelibsiz!", ru: "Добро пожаловать на платформу KebyuEdu!", en: "Welcome to KebyuEdu platform!" },
  
  // StatCards
  "stat.active_students": { uz: "Faol talabalar", ru: "Активные студенты", en: "Active students" },
  "stat.groups": { uz: "Guruhlar", ru: "Группы", en: "Groups" },
  "stat.monthly_payments": { uz: "Joriy oy to'lovlar", ru: "Оплаты за месяц", en: "Monthly payments" },
  "stat.debtors": { uz: "Qarzdorlar", ru: "Должники", en: "Debtors" },
  "stat.frozen": { uz: "Muzlatilganlar", ru: "Замороженные", en: "Frozen" },
  "stat.archive": { uz: "Arxivdagilar", ru: "В архиве", en: "Archived" },

  // Accordions
  "acc.payments": { uz: "Joriy oy uchun to'lovlar", ru: "Оплаты за текущий месяц", en: "Payments for current month" },
  "acc.payments.desc": { uz: "Ushbu oy uchun to'lovlar bo'yicha batafsil ma'lumotlar bu yerda ko'rinadi.", ru: "Здесь будут отображаться подробные данные по оплатам за этот месяц.", en: "Detailed information about this month's payments will appear here." },
  "acc.profit": { uz: "Yillik Foyda", ru: "Годовая прибыль", en: "Annual Profit" },
  "acc.profit.desc": { uz: "Yillik moliyaviy hisobot va sof foyda statistikasi.", ru: "Годовой финансовый отчет и статистика чистой прибыли.", en: "Annual financial report and net profit statistics." },
  "acc.schedule": { uz: "Dars jadvali", ru: "Расписание занятий", en: "Class schedule" },
  "acc.schedule.desc": { uz: "Bugungi va haftalik dars jadvallari ro'yxati.", ru: "Список расписаний занятий на сегодня и неделю.", en: "List of class schedules for today and the week." },

  // Payments
  "pay.method.CASH": { uz: "Naqd", ru: "Наличными", en: "Cash" },
  "pay.method.CARD": { uz: "Plastik", ru: "Карта", en: "Card" },
  "pay.method.TRANSFER": { uz: "O'tkazma", ru: "Перевод", en: "Transfer" },

  // Chart
  "chart.revenue": { uz: "Oylik tushumlar statistikasi", ru: "Статистика ежемесячных доходов", en: "Monthly Revenue Statistics" }
};

interface LanguageContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("uz");

  const t = (key: string) => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
