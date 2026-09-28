"use client";

import { useEffect, useState } from "react";
import { stampApi, rangerApi } from "@/service/api";
import { 
  Users, 
  Calendar, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  UserCheck, 
  Globe, 
  BarChart3, 
  Sparkles,
  ArrowUpRight,
  PieChart
} from "lucide-react";

interface HistoryItem {
  label: string;
  thai: number;
  foreigner: number;
}

interface PeriodStats {
  thai: number;
  foreigner: number;
  total: number;
  history: HistoryItem[];
}

const MONTH_LABELS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const YEARS_LIST = ["ปี 2023", "ปี 2024", "ปี 2025", "ปี 2026"];

const createEmptyMonthlyHistory = (): HistoryItem[] =>
  MONTH_LABELS.map(label => ({ label, thai: 0, foreigner: 0 }));

const createEmptyPeriodStats = (): PeriodStats => ({
  thai: 0,
  foreigner: 0,
  total: 0,
  history: createEmptyMonthlyHistory()
});

const createInitialMonthlyByYear = (): Record<string, PeriodStats> => ({
  "ปี 2026": createEmptyPeriodStats(),
  "ปี 2025": createEmptyPeriodStats(),
  "ปี 2024": createEmptyPeriodStats(),
  "ปี 2023": createEmptyPeriodStats()
});

const createInitialYearlyStats = (): PeriodStats => ({
  thai: 0,
  foreigner: 0,
  total: 0,
  history: YEARS_LIST.map(label => ({ label, thai: 0, foreigner: 0 }))
});

export default function ViewVisitStatistics() {
  const [filter, setFilter] = useState<"monthly" | "yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState<string>("ปี 2026");
  const [parkName, setParkName] = useState<string>("อุทยานแห่งชาติ");
  const [parkId, setParkId] = useState<number>(1);

  const [monthlyStatsByYear, setMonthlyStatsByYear] = useState<Record<string, PeriodStats>>(createInitialMonthlyByYear());
  const [yearlyStats, setYearlyStats] = useState<PeriodStats>(createInitialYearlyStats());

  useEffect(() => {
    async function fetchStats() {
      const storedRanger = typeof window !== "undefined" ? localStorage.getItem("ranger_username") : null;
      let storedParkId = typeof window !== "undefined" ? localStorage.getItem("ranger_park_id") : null;
      let storedParkName = typeof window !== "undefined" ? localStorage.getItem("ranger_park_name") : null;

      let targetParkId = storedParkId ? Number(storedParkId) : undefined;
      if (storedParkName) {
        setParkName(storedParkName.startsWith("อุทยานแห่งชาติ") ? storedParkName : `อุทยานแห่งชาติ${storedParkName}`);
      }
      if (targetParkId) {
        setParkId(targetParkId);
      }

      // ดึงข้อมูลอุทยานของเจ้าหน้าที่ที่ล็อกอินอยู่
      if (storedRanger) {
        try {
          const rangerRes = await rangerApi.getRangerByUsername(storedRanger);
          const rObj = rangerRes?.result || rangerRes?.data;
          if (rObj) {
            const rParkId = rObj?.park?.parkId || rObj?.parkId;
            const rParkName = rObj?.park?.name || rObj?.parkName;
            if (rParkId) {
              targetParkId = Number(rParkId);
              setParkId(targetParkId);
              localStorage.setItem("ranger_park_id", String(rParkId));
            }
            if (rParkName) {
              const clean = rParkName.startsWith("อุทยานแห่งชาติ") ? rParkName : `อุทยานแห่งชาติ${rParkName}`;
              setParkName(clean);
              localStorage.setItem("ranger_park_name", rParkName);
            }
          }
        } catch (e) {
          console.error("Could not fetch ranger profile", e);
        }
      }

      try {
        // ดึงสถิติจากฐานข้อมูลเฉพาะของอุทยานที่เจ้าหน้าที่สังกัด
        const response = await stampApi.getStatistics(targetParkId, storedRanger || undefined);
        if (response && (response.success || response.status) && response.result) {
          const res = response.result;

          if (res.parkName) {
            setParkName(res.parkName.startsWith("อุทยานแห่งชาติ") ? res.parkName : `อุทยานแห่งชาติ${res.parkName}`);
          }

          if (res.monthlyStatsByYear && Object.keys(res.monthlyStatsByYear).length > 0) {
            setMonthlyStatsByYear(prev => ({
              ...prev,
              ...res.monthlyStatsByYear
            }));
          } else if (res.monthlyStats) {
            setMonthlyStatsByYear(prev => ({
              ...prev,
              "ปี 2026": res.monthlyStats
            }));
          }

          if (res.yearlyStats) {
            setYearlyStats(res.yearlyStats);
          }
        }
      } catch (err) {
        console.error("Error loading visit statistics from database for park", targetParkId, err);
      }
    }
    fetchStats();
  }, []);

  const yearsList = ["ปี 2023", "ปี 2024", "ปี 2025", "ปี 2026"];
  const activeYearIdx = yearsList.indexOf(selectedYear) !== -1 ? yearsList.indexOf(selectedYear) : 3;
  const currentSelectedYearLabel = yearsList[activeYearIdx];
  const currentMonthlyStats = monthlyStatsByYear[currentSelectedYearLabel] || monthlyStatsByYear["ปี 2026"];

  const handlePrevYear = () => {
    if (activeYearIdx > 0) {
      setSelectedYear(yearsList[activeYearIdx - 1]);
    }
  };

  const handleNextYear = () => {
    if (activeYearIdx < yearsList.length - 1) {
      setSelectedYear(yearsList[activeYearIdx + 1]);
    }
  };

  const currentThaiCard = filter === "monthly" ? currentMonthlyStats.thai : yearlyStats.thai;
  const currentForeignerCard = filter === "monthly" ? currentMonthlyStats.foreigner : yearlyStats.foreigner;
  const currentTotalCard = filter === "monthly" ? currentMonthlyStats.total : yearlyStats.total;

  const getTitle = () => {
    if (filter === "monthly") return `สถิติจำนวนผู้เข้าชม${parkName}`;
    return `สถิติจำนวนผู้เข้าชม${parkName} (เปรียบเทียบสะสมทุกปี)`;
  };

  const getCardLabel = (type: "thai" | "foreigner" | "total") => {
    if (type === "thai") {
      if (filter === "monthly") return `นักท่องเที่ยวชาวไทย (${currentSelectedYearLabel})`;
      return `ชาวไทย (สะสมรวมทุกปี)`;
    }
    if (type === "foreigner") {
      if (filter === "monthly") return `นักท่องเที่ยวชาวต่างชาติ (${currentSelectedYearLabel})`;
      return `ชาวต่างชาติ (สะสมรวมทุกปี)`;
    }
    if (filter === "monthly") return `ยอดรวมทั้งหมด 12 เดือน (${currentSelectedYearLabel})`;
    return `ยอดรวมสะสมสุทธิทุกปี`;
  };

  const currentHistoryData = filter === "monthly" ? currentMonthlyStats.history : yearlyStats.history;
  const thaiPercentage = Math.round((currentThaiCard / Math.max(1, currentTotalCard)) * 100);
  const foreignerPercentage = 100 - thaiPercentage;

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 font-sans pb-12 px-1 sm:px-3">
      
      {/* 1. HERO TITLE HEADER & FILTER TOGGLE */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#042d15] via-[#094721] to-[#042410] text-white p-6 sm:p-8 shadow-xl border border-emerald-500/30">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>GreenPass Executive Analytics</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              {getTitle()}
            </h1>
            <p className="text-xs text-emerald-200/80 max-w-2xl leading-relaxed">
              สรุปภาพรวมและวิเคราะห์สถิติจำนวนผู้เข้าชม สแตมป์ดิจิทัล และแนวโน้มการท่องเที่ยวในอุทยานแห่งชาติ
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="bg-black/30 p-1.5 rounded-xl border border-white/10 flex items-center gap-1 shadow-inner backdrop-blur-md self-stretch md:self-auto justify-center">
            <button 
              onClick={() => setFilter("monthly")}
              className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                filter === "monthly" 
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md ring-1 ring-emerald-300/40" 
                  : "text-emerald-200/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>มุมมองรายเดือน</span>
            </button>
            <button 
              onClick={() => setFilter("yearly")}
              className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                filter === "yearly" 
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md ring-1 ring-emerald-300/40" 
                  : "text-emerald-200/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>มุมมองรายปี</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. YEAR SELECTION TOOLBAR (Shown in Monthly mode) */}
      {filter === "monthly" && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-700">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">เลือกปีงบประมาณ / ปีกิจกรรม:</span>
              <span className="text-[11px] text-slate-500">แสดงผลเปรียบเทียบสถิติย้อนหลัง 12 เดือนประจำ{currentSelectedYearLabel}</span>
            </div>
          </div>

          {/* Year Buttons & Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevYear}
              disabled={activeYearIdx === 0}
              className={`p-2 rounded-lg border transition-all ${
                activeYearIdx === 0 
                  ? "opacity-30 border-slate-200 text-slate-400 cursor-not-allowed" 
                  : "bg-white border-slate-300 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer shadow-2xs"
              }`}
              title="ปีก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {yearsList.map((yLabel) => {
                const isActive = yLabel === currentSelectedYearLabel;
                return (
                  <button
                    key={yLabel}
                    onClick={() => setSelectedYear(yLabel)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105 border border-emerald-500" 
                        : "bg-slate-100 text-slate-650 hover:bg-slate-200 border border-transparent"
                    }`}
                  >
                    {yLabel}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextYear}
              disabled={activeYearIdx === yearsList.length - 1}
              className={`p-2 rounded-lg border transition-all ${
                activeYearIdx === yearsList.length - 1 
                  ? "opacity-30 border-slate-200 text-slate-400 cursor-not-allowed" 
                  : "bg-white border-slate-300 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer shadow-2xs"
              }`}
              title="ปีถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. EXECUTIVE METRIC KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* CARD 1: THAI VISITORS */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 p-5 rounded-2xl border border-emerald-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
              {getCardLabel("thai")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black text-emerald-950 tracking-tight">
              {currentThaiCard.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-700">คน</span>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700/80 font-medium">สัดส่วนผู้เข้าชม</span>
            <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
              {thaiPercentage}% ของยอดรวม
            </span>
          </div>

          {/* Background Decor */}
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* CARD 2: FOREIGN VISITORS */}
        <div className="bg-gradient-to-br from-sky-50 via-white to-sky-50/30 p-5 rounded-2xl border border-sky-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-extrabold text-sky-900 uppercase tracking-wide">
              {getCardLabel("foreigner")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30 group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black text-sky-950 tracking-tight">
              {currentForeignerCard.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-sky-700">คน</span>
          </div>

          <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between text-[11px]">
            <span className="text-sky-700/80 font-medium">สัดส่วนผู้เข้าชม</span>
            <span className="font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-md">
              {foreignerPercentage}% ของยอดรวม
            </span>
          </div>

          {/* Background Decor */}
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-sky-400/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* CARD 3: TOTAL COMBINED */}
        <div className="bg-gradient-to-br from-[#063b1c] via-[#0b542a] to-[#042712] text-white p-5 rounded-2xl border border-emerald-400/30 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-extrabold text-emerald-200 uppercase tracking-wide">
              {getCardLabel("total")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black text-white tracking-tight">
              {currentTotalCard.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-300">คน</span>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-800/80 flex items-center justify-between text-[11px]">
            <span className="text-emerald-300/80 font-medium">ภาพรวมสะสมสุทธิ</span>
            <span className="font-bold text-emerald-200 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" /> 100% สรุปรวม
            </span>
          </div>

          {/* Background Decor */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
        </div>

      </div>

      {/* 4. VISUAL DUAL BAR CHART SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              {filter === "monthly" 
                ? `แผนภูมิแท่งเปรียบเทียบสถิติผู้เข้าชม 12 เดือนประจำ${currentSelectedYearLabel}` 
                : `แผนภูมิแท่งเปรียบเทียบสถิติผู้เข้าชมรายปี (ทุกปีสะสม)`}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">กราฟเปรียบเทียบปริมาณผู้เข้าชมอุทยานระหว่างชาวไทยและชาวต่างชาติ</p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-2xs" />
              <span className="text-slate-700">สแตมป์ชาวไทย</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 shadow-2xs" />
              <span className="text-slate-700">สแตมป์ชาวต่างชาติ</span>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Chart Container */}
        <div className="pt-4">
          {filter === "monthly" ? (
            /* MONTHLY VIEW: 12 BARS */
            <div className="h-64 flex items-end justify-between gap-1.5 sm:gap-2.5 pt-10 pb-4 px-3 sm:px-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 relative">
              
              {/* Background Grid Lines */}
              <div className="absolute inset-x-0 top-1/4 border-b border-slate-200/40 border-dashed pointer-events-none" />
              <div className="absolute inset-x-0 top-2/4 border-b border-slate-200/40 border-dashed pointer-events-none" />
              <div className="absolute inset-x-0 top-3/4 border-b border-slate-200/40 border-dashed pointer-events-none" />

              {currentMonthlyStats.history.map((item, idx) => {
                const maxVal = Math.max(...currentMonthlyStats.history.map((h) => Math.max(h.thai, h.foreigner, 1)), 35);
                const thaiHeight = `${Math.min(100, Math.max(12, (item.thai / maxVal) * 100))}%`;
                const foreignerHeight = `${Math.min(100, Math.max(12, (item.foreigner / maxVal) * 100))}%`;
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end relative group z-10">
                    
                    {/* Glassmorphism Hover Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900/95 text-white text-[11px] py-1.5 px-3 rounded-xl whitespace-nowrap shadow-xl pointer-events-none z-30 font-medium backdrop-blur-md border border-slate-700/50 transform group-hover:-translate-y-1">
                      <span className="font-bold text-emerald-400">เดือน{item.label}</span> ({currentSelectedYearLabel})<br />
                      ไทย: <span className="font-bold text-emerald-300">{item.thai} คน</span> | ต่างชาติ: <span className="font-bold text-sky-300">{item.foreigner} คน</span> (รวม {item.thai + item.foreigner} คน)
                    </div>

                    {/* Pair Bars */}
                    <div className="w-full flex justify-center items-end gap-1 sm:gap-1.5 h-[80%] pb-1">
                      
                      {/* Thai Bar (Green Gradient) */}
                      <div className="flex flex-col items-center h-full justify-end w-2.5 sm:w-4 group/bar">
                        <span className="text-[8px] sm:text-[9px] font-bold text-emerald-800 mb-0.5 opacity-90 group-hover/bar:scale-110 transition-transform">
                          {item.thai}
                        </span>
                        <div 
                          style={{ height: thaiHeight }}
                          className="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 rounded-t-lg shadow-sm group-hover:from-emerald-500 group-hover:to-teal-300 transition-all duration-200"
                        />
                      </div>

                      {/* Foreigner Bar (Blue Gradient) */}
                      <div className="flex flex-col items-center h-full justify-end w-2.5 sm:w-4 group/bar">
                        <span className="text-[8px] sm:text-[9px] font-bold text-sky-800 mb-0.5 opacity-90 group-hover/bar:scale-110 transition-transform">
                          {item.foreigner}
                        </span>
                        <div 
                          style={{ height: foreignerHeight }}
                          className="w-full bg-gradient-to-t from-sky-600 via-sky-500 to-indigo-400 rounded-t-lg shadow-sm group-hover:from-sky-500 group-hover:to-indigo-300 transition-all duration-200"
                        />
                      </div>

                    </div>

                    {/* Month Name */}
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 mt-2 group-hover:text-emerald-700 transition-colors">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* YEARLY VIEW: COMPARISON */
            <div className="h-64 flex items-end justify-around gap-4 pt-10 pb-4 px-8 bg-slate-50/80 rounded-2xl border border-slate-200/80 relative">
              
              {/* Background Grid Lines */}
              <div className="absolute inset-x-0 top-1/4 border-b border-slate-200/40 border-dashed pointer-events-none" />
              <div className="absolute inset-x-0 top-2/4 border-b border-slate-200/40 border-dashed pointer-events-none" />
              <div className="absolute inset-x-0 top-3/4 border-b border-slate-200/40 border-dashed pointer-events-none" />

              {yearlyStats.history.map((item, idx) => {
                const maxVal = Math.max(...yearlyStats.history.map((h) => Math.max(h.thai, h.foreigner, 1)), 50);
                const thaiHeight = `${Math.min(100, Math.max(12, (item.thai / maxVal) * 100))}%`;
                const foreignerHeight = `${Math.min(100, Math.max(12, (item.foreigner / maxVal) * 100))}%`;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end relative group max-w-[140px] z-10">
                    
                    {/* Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900/95 text-white text-[11px] py-1.5 px-3 rounded-xl whitespace-nowrap shadow-xl pointer-events-none z-30 font-medium backdrop-blur-md border border-slate-700/50 transform group-hover:-translate-y-1">
                      <span className="font-bold text-emerald-400">{item.label}</span><br />
                      ไทย: <span className="font-bold text-emerald-300">{item.thai} คน</span> | ต่างชาติ: <span className="font-bold text-sky-300">{item.foreigner} คน</span> (รวม {item.thai + item.foreigner} คน)
                    </div>

                    {/* Pair Bars */}
                    <div className="w-full flex justify-center items-end gap-2 h-[80%] pb-1">
                      
                      {/* Thai Bar */}
                      <div className="flex flex-col items-center h-full justify-end w-6 sm:w-9 group/bar">
                        <span className="text-[10px] sm:text-xs font-extrabold text-emerald-800 mb-1">
                          {item.thai}
                        </span>
                        <div 
                          style={{ height: thaiHeight }}
                          className="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 rounded-t-lg shadow-sm group-hover:from-emerald-500 group-hover:to-teal-300 transition-all duration-200"
                        />
                      </div>

                      {/* Foreigner Bar */}
                      <div className="flex flex-col items-center h-full justify-end w-6 sm:w-9 group/bar">
                        <span className="text-[10px] sm:text-xs font-extrabold text-sky-800 mb-1">
                          {item.foreigner}
                        </span>
                        <div 
                          style={{ height: foreignerHeight }}
                          className="w-full bg-gradient-to-t from-sky-600 via-sky-500 to-indigo-400 rounded-t-lg shadow-sm group-hover:from-sky-500 group-hover:to-indigo-300 transition-all duration-200"
                        />
                      </div>

                    </div>

                    {/* Year Label */}
                    <span className="text-xs font-extrabold text-slate-700 mt-2.5">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. SUMMARY DATA TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide flex items-center gap-2.5">
            <Users className="w-5 h-5 text-emerald-600" />
            ตารางตารางสรุปจำนวนสแตมป์ผู้เข้าชมอุทยาน ({filter === "monthly" ? `แยกรายเดือน 12 เดือนประจำ${currentSelectedYearLabel}` : "เปรียบเทียบในแต่ละปี"})
          </h3>
        </div>

        <div className="overflow-x-auto border border-slate-300 rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#042410] via-[#094721] to-[#042410] text-white text-sm sm:text-base">
                <th className="py-4 px-6 font-extrabold">{filter === "monthly" ? "เดือนประจำปี" : "ปีพุทธศักราช / คริสต์ศักราช"}</th>
                <th className="py-4 px-6 font-extrabold text-center text-emerald-300">สแตมป์ชาวไทย</th>
                <th className="py-4 px-6 font-extrabold text-center text-sky-300">สแตมป์ชาวต่างชาติ</th>
                <th className="py-4 px-6 font-extrabold text-center text-amber-300">รวมผู้เข้าชมสุทธิ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 bg-white">
              {currentHistoryData.length === 0 || currentTotalCard === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-500 font-medium">
                    ไม่พบข้อมูลสถิติ
                  </td>
                </tr>
              ) : (
                currentHistoryData.map((item, i) => {
                const totalRow = item.thai + item.foreigner;
                return (
                  <tr 
                    key={i} 
                    className="hover:bg-emerald-50/70 transition-colors duration-150 group"
                  >
                    <td className="py-3.5 px-6 font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-emerald-900">
                      {filter === "monthly" ? `เดือน${item.label}` : item.label}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-900 rounded-full border border-emerald-300/80 font-black text-sm sm:text-base shadow-2xs">
                        {item.thai.toLocaleString()} คน
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="inline-block px-4 py-1.5 bg-sky-50 text-sky-900 rounded-full border border-sky-300/80 font-black text-sm sm:text-base shadow-2xs">
                        {item.foreigner.toLocaleString()} คน
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="inline-block px-4.5 py-1.5 bg-slate-100 text-slate-950 rounded-full font-black text-sm sm:text-base border border-slate-300 shadow-2xs">
                        {totalRow.toLocaleString()} คน
                      </span>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
            {/* Table Footer Total Summary */}
            <tfoot>
              <tr className="bg-slate-950 text-white font-extrabold text-sm sm:text-base border-t-2 border-slate-800">
                <td className="py-4 px-6 uppercase tracking-wider text-emerald-300 font-extrabold">ยอดรวมสุทธิ ({filter === "monthly" ? currentSelectedYearLabel : "ทุกปีรวมกัน"})</td>
                <td className="py-4 px-6 text-center text-emerald-400 font-black text-base sm:text-lg">{currentThaiCard.toLocaleString()} คน</td>
                <td className="py-4 px-6 text-center text-sky-300 font-black text-base sm:text-lg">{currentForeignerCard.toLocaleString()} คน</td>
                <td className="py-4 px-6 text-center text-amber-300 font-black text-lg sm:text-xl">{currentTotalCard.toLocaleString()} คน</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
    </div>
  );
}
