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
  TrendingDown,
  UserCheck, 
  Globe, 
  BarChart3, 
  Sparkles,
  ArrowUpRight,
  PieChart,
  Filter,
  GitCompare,
  Layers,
  Check
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
const FULL_MONTH_NAMES = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", 
  "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", 
  "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];
const YEARS_LIST = ["ปี 2023", "ปี 2024", "ปี 2025", "ปี 2026"];

// Color themes for comparing multiple years
const YEAR_THEMES: Record<string, {
  colorName: string;
  dotBg: string;
  barGradient: string;
  barHoverGradient: string;
  textColor: string;
  lightBg: string;
  borderColor: string;
  badgeBg: string;
}> = {
  "ปี 2026": {
    colorName: "Emerald",
    dotBg: "bg-emerald-500",
    barGradient: "bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400",
    barHoverGradient: "group-hover/bar:from-emerald-500 group-hover/bar:to-teal-300",
    textColor: "text-emerald-700",
    lightBg: "bg-emerald-50",
    borderColor: "border-emerald-500",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300"
  },
  "ปี 2025": {
    colorName: "Sky",
    dotBg: "bg-sky-500",
    barGradient: "bg-gradient-to-t from-sky-600 via-sky-500 to-blue-400",
    barHoverGradient: "group-hover/bar:from-sky-500 group-hover/bar:to-blue-300",
    textColor: "text-sky-700",
    lightBg: "bg-sky-50",
    borderColor: "border-sky-500",
    badgeBg: "bg-sky-100 text-sky-800 border-sky-300"
  },
  "ปี 2024": {
    colorName: "Amber",
    dotBg: "bg-amber-500",
    barGradient: "bg-gradient-to-t from-amber-600 via-amber-500 to-orange-400",
    barHoverGradient: "group-hover/bar:from-amber-500 group-hover/bar:to-orange-300",
    textColor: "text-amber-700",
    lightBg: "bg-amber-50",
    borderColor: "border-amber-500",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-300"
  },
  "ปี 2023": {
    colorName: "Purple",
    dotBg: "bg-purple-500",
    barGradient: "bg-gradient-to-t from-purple-600 via-purple-500 to-indigo-400",
    barHoverGradient: "group-hover/bar:from-purple-500 group-hover/bar:to-indigo-300",
    textColor: "text-purple-700",
    lightBg: "bg-purple-50",
    borderColor: "border-purple-500",
    badgeBg: "bg-purple-100 text-purple-800 border-purple-300"
  }
};

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
  const [filter, setFilter] = useState<"monthly" | "yearly" | "comparison">("monthly");
  const [selectedYear, setSelectedYear] = useState<string>("ปี 2026");
  const [startMonth, setStartMonth] = useState<number>(0); // 0 = ม.ค.
  const [endMonth, setEndMonth] = useState<number>(11); // 11 = ธ.ค.
  const [parkName, setParkName] = useState<string>("อุทยานแห่งชาติ");
  const [parkId, setParkId] = useState<number>(1);

  const [monthlyStatsByYear, setMonthlyStatsByYear] = useState<Record<string, PeriodStats>>(createInitialMonthlyByYear());
  const [yearlyStats, setYearlyStats] = useState<PeriodStats>(createInitialYearlyStats());

  // Comparison mode states
  const [compareYears, setCompareYears] = useState<string[]>(["ปี 2024", "ปี 2025", "ปี 2026"]);
  const [compareMetric, setCompareMetric] = useState<"total" | "thai" | "foreigner">("total");

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

  const yearsList = YEARS_LIST;
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

  const handleStartMonthChange = (newStart: number) => {
    setStartMonth(newStart);
    if (newStart > endMonth) {
      setEndMonth(newStart);
    }
  };

  const handleEndMonthChange = (newEnd: number) => {
    setEndMonth(newEnd);
    if (newEnd < startMonth) {
      setStartMonth(newEnd);
    }
  };

  const applyPresetRange = (start: number, end: number) => {
    setStartMonth(start);
    setEndMonth(end);
  };

  // Toggle year in comparison mode
  const toggleCompareYear = (yearLabel: string) => {
    if (compareYears.includes(yearLabel)) {
      if (compareYears.length > 1) {
        setCompareYears(compareYears.filter(y => y !== yearLabel));
      }
    } else {
      const updated = [...compareYears, yearLabel].sort((a, b) => yearsList.indexOf(a) - yearsList.indexOf(b));
      setCompareYears(updated);
    }
  };

  // Logic for custom month range filtering
  const isCustomRange = (startMonth !== 0 || endMonth !== 11);
  const selectedMonthsCount = endMonth - startMonth + 1;
  const rangeText = isCustomRange 
    ? `ช่วง ${MONTH_LABELS[startMonth]} - ${MONTH_LABELS[endMonth]} (${selectedMonthsCount} เดือน)` 
    : "12 เดือน";

  const allMonthlyHistory = currentMonthlyStats.history || [];
  const filteredMonthlyHistory = allMonthlyHistory.filter((_, idx) => idx >= startMonth && idx <= endMonth);

  const currentThaiCard = filter === "monthly" 
    ? filteredMonthlyHistory.reduce((acc, curr) => acc + curr.thai, 0) 
    : yearlyStats.thai;

  const currentForeignerCard = filter === "monthly" 
    ? filteredMonthlyHistory.reduce((acc, curr) => acc + curr.foreigner, 0) 
    : yearlyStats.foreigner;

  const currentTotalCard = filter === "monthly" 
    ? currentThaiCard + currentForeignerCard 
    : yearlyStats.total;

  // Helper to compute range statistics for any year
  const getYearRangeStats = (yearLabel: string) => {
    const stats = monthlyStatsByYear[yearLabel] || createEmptyPeriodStats();
    const hist = stats.history || [];
    const filtered = hist.filter((_, idx) => idx >= startMonth && idx <= endMonth);
    const thai = filtered.reduce((acc, curr) => acc + curr.thai, 0);
    const foreigner = filtered.reduce((acc, curr) => acc + curr.foreigner, 0);
    const total = thai + foreigner;
    return { thai, foreigner, total, filtered };
  };

  const getTitle = () => {
    if (filter === "monthly") return `สถิติจำนวนผู้เข้าชม${parkName}`;
    if (filter === "comparison") {
      const yearsDisplay = compareYears.map(y => y.replace("ปี ", "")).join(" vs ");
      return `สถิติจำนวนผู้เข้าชม${parkName} (เปรียบเทียบรายเดือนข้ามปี ${yearsDisplay})`;
    }
    return `สถิติจำนวนผู้เข้าชม${parkName} (เปรียบเทียบสะสมทุกปี)`;
  };

  const getCardLabel = (type: "thai" | "foreigner" | "total") => {
    if (type === "thai") {
      if (filter === "monthly") return `นักท่องเที่ยวชาวไทย (${rangeText} ${currentSelectedYearLabel})`;
      return `ชาวไทย (สะสมรวมทุกปี)`;
    }
    if (type === "foreigner") {
      if (filter === "monthly") return `นักท่องเที่ยวชาวต่างชาติ (${rangeText} ${currentSelectedYearLabel})`;
      return `ชาวต่างชาติ (สะสมรวมทุกปี)`;
    }
    if (filter === "monthly") {
      return isCustomRange 
        ? `ยอดรวมช่วง ${MONTH_LABELS[startMonth]} - ${MONTH_LABELS[endMonth]} (${currentSelectedYearLabel})`
        : `ยอดรวมทั้งหมด 12 เดือน (${currentSelectedYearLabel})`;
    }
    return `ยอดรวมสะสมสุทธิทุกปี`;
  };

  const currentHistoryData = filter === "monthly" ? filteredMonthlyHistory : yearlyStats.history;
  const thaiPercentage = Math.round((currentThaiCard / Math.max(1, currentTotalCard)) * 100);
  const foreignerPercentage = 100 - thaiPercentage;

  // Comparison specific calculations
  const comparisonYearStats = compareYears.map(year => ({
    year,
    ...getYearRangeStats(year)
  }));

  const allFilteredMonths = MONTH_LABELS.slice(startMonth, endMonth + 1);

  // Maximum value for scaling comparison chart
  const maxValCompare = Math.max(
    ...compareYears.flatMap(y => {
      const { filtered } = getYearRangeStats(y);
      return filtered.map(item => {
        if (compareMetric === "thai") return item.thai;
        if (compareMetric === "foreigner") return item.foreigner;
        return item.thai + item.foreigner;
      });
    }),
    10
  );

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

          {/* Mode Switcher: 3 Modes (Monthly, Comparison, Yearly) */}
          <div className="bg-black/40 p-1.5 rounded-xl border border-white/15 flex items-center gap-1 shadow-inner backdrop-blur-md self-stretch md:self-auto justify-center">
            <button 
              onClick={() => setFilter("monthly")}
              className={`flex-1 md:flex-initial px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                filter === "monthly" 
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md ring-1 ring-emerald-300/40" 
                  : "text-emerald-200/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>มุมมองรายเดือน</span>
            </button>
            <button 
              onClick={() => {
                setFilter("comparison");
                // Default to 5 months if starting from 12 months for instant wow
                if (startMonth === 0 && endMonth === 11) {
                  setEndMonth(4); // 5 months (Jan-May)
                }
              }}
              className={`flex-1 md:flex-initial px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                filter === "comparison" 
                  ? "bg-gradient-to-r from-teal-500 via-emerald-600 to-emerald-700 text-white shadow-md ring-1 ring-emerald-300/40" 
                  : "text-emerald-200/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>เปรียบเทียบข้ามปี</span>
            </button>
            <button 
              onClick={() => setFilter("yearly")}
              className={`flex-1 md:flex-initial px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
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

      {/* 2. MODE-SPECIFIC TOOLBARS */}

      {/* 2.A: SINGLE YEAR & MONTH RANGE TOOLBAR (Monthly mode) */}
      {filter === "monthly" && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
          
          {/* Top Row: Year Selection */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">เลือกปีงบประมาณ / ปีกิจกรรม:</span>
                <span className="text-[11px] text-slate-500">แสดงผลสถิติจำนวนผู้เข้าชมอุทยานประจำ{currentSelectedYearLabel}</span>
              </div>
            </div>

            {/* Year Buttons & Arrows */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                onClick={handlePrevYear}
                disabled={activeYearIdx === 0}
                className={`p-2 rounded-xl border transition-all ${
                  activeYearIdx === 0 
                    ? "opacity-30 border-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-white border-slate-300 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer shadow-2xs"
                }`}
                title="ปีก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 flex-wrap py-0.5">
                {yearsList.map((yLabel) => {
                  const isActive = yLabel === currentSelectedYearLabel;
                  return (
                    <button
                      key={yLabel}
                      onClick={() => setSelectedYear(yLabel)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
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
                className={`p-2 rounded-xl border transition-all ${
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

          {/* Bottom Row: Month Range Selector & Presets */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 bg-emerald-50/80 px-3 py-2 rounded-xl border border-emerald-200/80">
                <Filter className="w-4 h-4 text-emerald-700" />
                <span className="font-extrabold text-emerald-950">เลือกช่วงเดือน:</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs hover:border-emerald-500 focus-within:border-emerald-500 transition-colors">
                  <span className="text-[11px] font-bold text-slate-500">ตั้งแต่</span>
                  <select
                    value={startMonth}
                    onChange={(e) => handleStartMonthChange(Number(e.target.value))}
                    className="bg-transparent text-xs font-extrabold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {MONTH_LABELS.map((m, idx) => (
                      <option key={idx} value={idx}>
                        {FULL_MONTH_NAMES[idx]} ({m})
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-slate-400 font-bold">-</span>

                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs hover:border-emerald-500 focus-within:border-emerald-500 transition-colors">
                  <span className="text-[11px] font-bold text-slate-500">ถึงเดือน</span>
                  <select
                    value={endMonth}
                    onChange={(e) => handleEndMonthChange(Number(e.target.value))}
                    className="bg-transparent text-xs font-extrabold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {MONTH_LABELS.map((m, idx) => (
                      <option key={idx} value={idx}>
                        {FULL_MONTH_NAMES[idx]} ({m})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="px-3 py-1.5 bg-emerald-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>
                  {startMonth === 0 && endMonth === 11
                    ? "แสดงทั้งปี (12 เดือน)"
                    : `ช่วง ${MONTH_LABELS[startMonth]} - ${MONTH_LABELS[endMonth]} (${selectedMonthsCount} เดือน)`}
                </span>
              </div>
            </div>

            {/* Quick Switch to Comparison Mode */}
            <button
              onClick={() => setFilter("comparison")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300/80 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <GitCompare className="w-3.5 h-3.5 text-emerald-600" />
              <span>เปรียบเทียบกับปีอื่น</span>
            </button>
          </div>
        </div>
      )}

      {/* 2.B: MULTI-YEAR COMPARISON TOOLBAR (Comparison Mode) */}
      {filter === "comparison" && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-500/20 space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-100/40 via-transparent to-transparent pointer-events-none rounded-bl-full" />
          
          {/* Header Description */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                <GitCompare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">เครื่องมือเปรียบเทียบสถิติข้ามปี (Multi-Year Comparison)</h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">เลือกปีและช่วงเดือนที่ต้องการเปรียบเทียบเพื่อวิเคราะห์แนวโน้มการเติบโต</p>
              </div>
            </div>

            {/* Quick Presets for Comparison */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 mr-1">ทางลัดปี:</span>
              <button
                onClick={() => setCompareYears(["ปี 2024", "ปี 2025", "ปี 2026"])}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                3 ปีล่าสุด (2024-2026)
              </button>
              <button
                onClick={() => setCompareYears(["ปี 2025", "ปี 2026"])}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                2 ปีล่าสุด (2025 vs 2026)
              </button>
              <button
                onClick={() => setCompareYears(["ปี 2023", "ปี 2024", "ปี 2025", "ปี 2026"])}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                เลือกทุกปี (4 ปี)
              </button>
            </div>
          </div>

          {/* Row 1: Multi-Select Year Checkboxes */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                เลือกปีที่ต้องการเปรียบเทียบ (เลือกได้หลายปี):
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {yearsList.map((y) => {
                const isSelected = compareYears.includes(y);
                const theme = YEAR_THEMES[y] || YEAR_THEMES["ปี 2026"];
                return (
                  <button
                    key={y}
                    onClick={() => toggleCompareYear(y)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all duration-200 cursor-pointer border ${
                      isSelected
                        ? `${theme.badgeBg} shadow-sm ring-1 ring-emerald-500/30 scale-102`
                        : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 opacity-60"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? theme.dotBg : "bg-slate-300"}`} />
                    <span>{y}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Month Range Selector & Month Count Presets (Supports 5 months, 6 months, etc.) */}
          <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 bg-emerald-50/80 px-3 py-2 rounded-xl border border-emerald-200/80">
                <Filter className="w-4 h-4 text-emerald-700" />
                <span className="font-extrabold text-emerald-950">เลือกช่วงเดือนเปรียบเทียบ:</span>
              </div>

              {/* Month Dropdowns */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs hover:border-emerald-500 focus-within:border-emerald-500 transition-colors">
                  <span className="text-[11px] font-bold text-slate-500">ตั้งแต่</span>
                  <select
                    value={startMonth}
                    onChange={(e) => handleStartMonthChange(Number(e.target.value))}
                    className="bg-transparent text-xs font-extrabold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {MONTH_LABELS.map((m, idx) => (
                      <option key={idx} value={idx}>
                        {FULL_MONTH_NAMES[idx]} ({m})
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-slate-400 font-bold">-</span>

                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs hover:border-emerald-500 focus-within:border-emerald-500 transition-colors">
                  <span className="text-[11px] font-bold text-slate-500">ถึงเดือน</span>
                  <select
                    value={endMonth}
                    onChange={(e) => handleEndMonthChange(Number(e.target.value))}
                    className="bg-transparent text-xs font-extrabold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {MONTH_LABELS.map((m, idx) => (
                      <option key={idx} value={idx}>
                        {FULL_MONTH_NAMES[idx]} ({m})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Month Range Summary Badge */}
              <div className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>
                  ช่วง {MONTH_LABELS[startMonth]} - {MONTH_LABELS[endMonth]} ({selectedMonthsCount} เดือน)
                </span>
              </div>
            </div>

            {/* Quick Month Presets (e.g., 5 months as specifically requested!) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 mr-1">ช่วงยอดนิยม:</span>
              <button
                onClick={() => applyPresetRange(0, 4)} // 5 months (Jan-May)
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                  startMonth === 0 && endMonth === 4
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border-slate-200"
                }`}
              >
                5 เดือนแรก (ม.ค. - พ.ค.)
              </button>
              <button
                onClick={() => applyPresetRange(0, 5)} // 6 months (Jan-Jun)
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                  startMonth === 0 && endMonth === 5
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border-slate-200"
                }`}
              >
                ครึ่งปีแรก (6 เดือน)
              </button>
              <button
                onClick={() => applyPresetRange(0, 2)} // Q1 (Jan-Mar)
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                  startMonth === 0 && endMonth === 2
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border-slate-200"
                }`}
              >
                ไตรมาสแรก (3 เดือน)
              </button>
              <button
                onClick={() => applyPresetRange(0, 11)} // 12 months
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                  startMonth === 0 && endMonth === 11
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border-slate-200"
                }`}
              >
                ทั้งปี (12 เดือน)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. EXECUTIVE METRIC KPI CARDS */}
      {filter !== "comparison" ? (
        /* STANDARD 3-CARD LAYOUT FOR SINGLE YEAR OR YEARLY TOTAL */
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

            <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          </div>

        </div>
      ) : (
        /* COMPARISON MODE DYNAMIC YEAR KPI CARDS */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              สรุปสถิติผู้เข้าชมช่วง {MONTH_LABELS[startMonth]} - {MONTH_LABELS[endMonth]} ({selectedMonthsCount} เดือน) แยกตามปีที่เลือกเปรียบเทียบ:
            </span>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(4, Math.max(2, compareYears.length))} gap-4`}>
            {comparisonYearStats.map((item, idx) => {
              const theme = YEAR_THEMES[item.year] || YEAR_THEMES["ปี 2026"];
              
              // Calculate growth comparing to previous year in list
              const prevItem = idx > 0 ? comparisonYearStats[idx - 1] : null;
              const diff = prevItem ? item.total - prevItem.total : null;
              const growthPercent = prevItem && prevItem.total > 0 && diff !== null 
                ? Number(((diff / prevItem.total) * 100).toFixed(1)) 
                : null;

              return (
                <div 
                  key={item.year}
                  className={`bg-white rounded-2xl p-5 border shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md ${
                    item.year === "ปี 2026" 
                      ? "border-emerald-500/80 ring-2 ring-emerald-500/20" 
                      : "border-slate-200"
                  }`}
                >
                  {/* Card Header with Year Indicator */}
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${theme.dotBg}`} />
                      <span className="text-sm font-black text-slate-900">{item.year}</span>
                      {item.year === "ปี 2026" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          ปัจจุบัน
                        </span>
                      )}
                    </div>

                    {/* Growth Badge if applicable */}
                    {growthPercent !== null && (
                      <div className={`flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                        growthPercent >= 0 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {growthPercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{growthPercent >= 0 ? `+${growthPercent}%` : `${growthPercent}%`}</span>
                      </div>
                    )}
                  </div>

                  {/* Total Value */}
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-3xl font-black text-slate-950 tracking-tight">
                      {item.total.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-500">คน</span>
                  </div>

                  {/* Nationality Breakdown Pill */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      ไทย: {item.thai.toLocaleString()} คน
                    </span>
                    <span className="text-sky-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      ต่างชาติ: {item.foreigner.toLocaleString()} คน
                    </span>
                  </div>

                  {/* Card Bottom Progress Bar Ratio */}
                  <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                    <div 
                      style={{ width: `${item.total > 0 ? (item.thai / item.total) * 100 : 50}%` }}
                      className="bg-emerald-500 h-full"
                      title={`ชาวไทย: ${item.total > 0 ? Math.round((item.thai / item.total) * 100) : 0}%`}
                    />
                    <div 
                      style={{ width: `${item.total > 0 ? (item.foreigner / item.total) * 100 : 50}%` }}
                      className="bg-sky-500 h-full"
                      title={`ชาวต่างชาติ: ${item.total > 0 ? Math.round((item.foreigner / item.total) * 100) : 0}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. VISUAL DUAL / GROUPED BAR CHART SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              {filter === "monthly" 
                ? isCustomRange
                  ? `แผนภูมิแท่งเปรียบเทียบสถิติผู้เข้าชม ช่วงเดือน ${MONTH_LABELS[startMonth]} - ${MONTH_LABELS[endMonth]} ประจำ${currentSelectedYearLabel}`
                  : `แผนภูมิแท่งเปรียบเทียบสถิติผู้เข้าชม 12 เดือนประจำ${currentSelectedYearLabel}` 
                : filter === "comparison"
                  ? `แผนภูมิแท่งเปรียบเทียบสถิติรายเดือนข้ามปี (${compareYears.map(y => y.replace("ปี ", "")).join(" vs ")}) ช่วง ${MONTH_LABELS[startMonth]} - ${MONTH_LABELS[endMonth]} (${selectedMonthsCount} เดือน)`
                  : `แผนภูมิแท่งเปรียบเทียบสถิติผู้เข้าชมรายปี (ทุกปีสะสม)`}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {filter === "comparison" 
                ? `เปรียบเทียบจำนวนผู้เข้าชมในแต่ละเดือนของปี ${compareYears.map(y => y.replace("ปี ", "")).join(", ")} แบบกลุ่มแท่งชัดเจน`
                : "กราฟเปรียบเทียบปริมาณผู้เข้าชมอุทยานระหว่างชาวไทยและชาวต่างชาติ"}
            </p>
          </div>

          {/* Metric Selector / Legends */}
          {filter === "comparison" ? (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Metric Switcher in Comparison Chart */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold border border-slate-200">
                <button
                  onClick={() => setCompareMetric("total")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    compareMetric === "total" 
                      ? "bg-white text-emerald-900 shadow-xs border border-slate-200/80 font-black" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ยอดรวมสุทธิ
                </button>
                <button
                  onClick={() => setCompareMetric("thai")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    compareMetric === "thai" 
                      ? "bg-white text-emerald-900 shadow-xs border border-slate-200/80 font-black" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  เฉพาะชาวไทย
                </button>
                <button
                  onClick={() => setCompareMetric("foreigner")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    compareMetric === "foreigner" 
                      ? "bg-white text-sky-900 shadow-xs border border-slate-200/80 font-black" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  เฉพาะชาวต่างชาติ
                </button>
              </div>

              {/* Legends for each compared year */}
              <div className="flex items-center gap-2.5 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
                {compareYears.map(y => {
                  const theme = YEAR_THEMES[y] || YEAR_THEMES["ปี 2026"];
                  return (
                    <div key={y} className="flex items-center gap-1.5">
                      <span className={`w-3 h-3 rounded-full ${theme.dotBg} shadow-2xs`} />
                      <span className="text-slate-700">{y}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Standard Legend */
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
          )}
        </div>

        {/* Dynamic Interactive Chart Container */}
        <div className="pt-4">
          {filter === "comparison" ? (
            /* COMPARISON VIEW: GROUPED BARS BY MONTH ACROSS SELECTED YEARS */
            <div className="h-72 flex items-end justify-around gap-2 sm:gap-4 pt-12 pb-4 px-3 sm:px-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 relative">
              
              {/* Background Grid Lines */}
              <div className="absolute inset-x-0 top-1/4 border-b border-slate-200/40 border-dashed pointer-events-none" />
              <div className="absolute inset-x-0 top-2/4 border-b border-slate-200/40 border-dashed pointer-events-none" />
              <div className="absolute inset-x-0 top-3/4 border-b border-slate-200/40 border-dashed pointer-events-none" />

              {allFilteredMonths.map((mLabel, mRelIdx) => {
                const actualMonthIdx = startMonth + mRelIdx;

                return (
                  <div key={mLabel} className="flex-1 flex flex-col items-center h-full justify-end relative group z-10 max-w-[160px]">
                    
                    {/* Glassmorphism Hover Tooltip with Multi-Year Comparison */}
                    <div className="absolute -top-20 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900/95 text-white text-[11px] py-2 px-3.5 rounded-xl whitespace-nowrap shadow-xl pointer-events-none z-30 font-medium backdrop-blur-md border border-slate-700/60 transform group-hover:-translate-y-1">
                      <div className="font-extrabold text-emerald-400 border-b border-slate-800 pb-1 mb-1">
                        เดือน{FULL_MONTH_NAMES[actualMonthIdx]} ({mLabel})
                      </div>
                      <div className="space-y-0.5">
                        {compareYears.map(y => {
                          const item = monthlyStatsByYear[y]?.history?.[actualMonthIdx] || { thai: 0, foreigner: 0 };
                          const val = compareMetric === "thai" ? item.thai : compareMetric === "foreigner" ? item.foreigner : item.thai + item.foreigner;
                          const theme = YEAR_THEMES[y] || YEAR_THEMES["ปี 2026"];
                          return (
                            <div key={y} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <span className={`w-2 h-2 rounded-full ${theme.dotBg}`} />
                                {y}:
                              </span>
                              <span className="font-bold text-white">
                                {val} คน <span className="text-slate-400 text-[10px]">(ไทย {item.thai} | ต่างชาติ {item.foreigner})</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Group of Bars for this Month */}
                    <div className="w-full flex justify-center items-end gap-1 sm:gap-2 h-[82%] pb-1">
                      {compareYears.map(y => {
                        const item = monthlyStatsByYear[y]?.history?.[actualMonthIdx] || { thai: 0, foreigner: 0 };
                        const val = compareMetric === "thai" ? item.thai : compareMetric === "foreigner" ? item.foreigner : item.thai + item.foreigner;
                        const height = `${Math.min(100, Math.max(12, (val / maxValCompare) * 100))}%`;
                        const theme = YEAR_THEMES[y] || YEAR_THEMES["ปี 2026"];

                        return (
                          <div key={y} className="flex flex-col items-center h-full justify-end w-3 sm:w-5 md:w-6 group/bar">
                            <span className="text-[8px] sm:text-[10px] font-extrabold text-slate-700 mb-0.5 opacity-90 group-hover/bar:scale-110 transition-transform">
                              {val}
                            </span>
                            <div 
                              style={{ height }}
                              className={`w-full ${theme.barGradient} ${theme.barHoverGradient} rounded-t-lg shadow-sm transition-all duration-200`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Month Label */}
                    <span className="text-[10px] sm:text-xs font-extrabold text-slate-700 mt-2 group-hover:text-emerald-700 transition-colors">
                      {mLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : filter === "monthly" ? (
            /* MONTHLY / PERIOD VIEW BARS (SINGLE YEAR) */
            <div className="h-64 flex items-end justify-around gap-1.5 sm:gap-2.5 pt-10 pb-4 px-3 sm:px-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 relative">
              
              {/* Background Grid Lines */}
              <div className="absolute inset-x-0 top-1/4 border-b border-slate-200/40 border-dashed pointer-events-none" />
              <div className="absolute inset-x-0 top-2/4 border-b border-slate-200/40 border-dashed pointer-events-none" />
              <div className="absolute inset-x-0 top-3/4 border-b border-slate-200/40 border-dashed pointer-events-none" />

              {filteredMonthlyHistory.map((item, idx) => {
                const maxVal = Math.max(...filteredMonthlyHistory.map((h) => Math.max(h.thai, h.foreigner, 1)), 35);
                const thaiHeight = `${Math.min(100, Math.max(12, (item.thai / maxVal) * 100))}%`;
                const foreignerHeight = `${Math.min(100, Math.max(12, (item.foreigner / maxVal) * 100))}%`;
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end relative group z-10 max-w-[120px]">
                    
                    {/* Glassmorphism Hover Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900/95 text-white text-[11px] py-1.5 px-3 rounded-xl whitespace-nowrap shadow-xl pointer-events-none z-30 font-medium backdrop-blur-md border border-slate-700/50 transform group-hover:-translate-y-1">
                      <span className="font-bold text-emerald-400">เดือน{item.label}</span> ({currentSelectedYearLabel})<br />
                      ไทย: <span className="font-bold text-emerald-300">{item.thai} คน</span> | ต่างชาติ: <span className="font-bold text-sky-300">{item.foreigner} คน</span> (รวม {item.thai + item.foreigner} คน)
                    </div>

                    {/* Pair Bars */}
                    <div className="w-full flex justify-center items-end gap-1 sm:gap-1.5 h-[80%] pb-1">
                      
                      {/* Thai Bar (Green Gradient) */}
                      <div className="flex flex-col items-center h-full justify-end w-3 sm:w-5 group/bar">
                        <span className="text-[8px] sm:text-[9px] font-bold text-emerald-800 mb-0.5 opacity-90 group-hover/bar:scale-110 transition-transform">
                          {item.thai}
                        </span>
                        <div 
                          style={{ height: thaiHeight }}
                          className="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 rounded-t-lg shadow-sm group-hover:from-emerald-500 group-hover:to-teal-300 transition-all duration-200"
                        />
                      </div>

                      {/* Foreigner Bar (Blue Gradient) */}
                      <div className="flex flex-col items-center h-full justify-end w-3 sm:w-5 group/bar">
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
            {filter === "comparison" 
              ? `ตารางเปรียบเทียบสถิติผู้เข้าชมรายเดือน (${compareYears.map(y => y.replace("ปี ", "")).join(" vs ")}) ช่วง ${FULL_MONTH_NAMES[startMonth]} - ${FULL_MONTH_NAMES[endMonth]}`
              : `ตารางสรุปจำนวนสแตมป์ผู้เข้าชมอุทยาน (${filter === "monthly" ? (isCustomRange ? `ช่วงเดือน ${FULL_MONTH_NAMES[startMonth]} - ${FULL_MONTH_NAMES[endMonth]} ประจำ${currentSelectedYearLabel}` : `แยกรายเดือน 12 เดือนประจำ${currentSelectedYearLabel}`) : "เปรียบเทียบในแต่ละปี"})`}
          </h3>
        </div>

        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border border-slate-300 rounded-2xl shadow-sm">
          {filter === "comparison" ? (
            /* COMPARISON TABLE: MONTHS AS ROWS, SELECTED YEARS AS COLUMNS */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#042410] via-[#094721] to-[#042410] text-white text-xs sm:text-sm">
                  <th className="py-4 px-4 font-extrabold">เดือน</th>
                  {compareYears.map(y => {
                    const theme = YEAR_THEMES[y] || YEAR_THEMES["ปี 2026"];
                    return (
                      <th key={y} className="py-4 px-4 font-extrabold text-center border-l border-emerald-800/40">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${theme.dotBg}`} />
                          <span>{y}</span>
                        </div>
                      </th>
                    );
                  })}
                  {compareYears.length >= 2 && (
                    <th className="py-4 px-4 font-extrabold text-center text-amber-300 border-l border-emerald-800/40">
                      แนวโน้ม ({compareYears[compareYears.length - 1].replace("ปี ", "")} vs {compareYears[compareYears.length - 2].replace("ปี ", "")})
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 bg-white text-xs sm:text-sm">
                {allFilteredMonths.map((mLabel, mRelIdx) => {
                  const actualMonthIdx = startMonth + mRelIdx;
                  
                  // Compute growth between last two compared years
                  const lastYearVal = (monthlyStatsByYear[compareYears[compareYears.length - 1]]?.history?.[actualMonthIdx]?.thai || 0) + 
                                     (monthlyStatsByYear[compareYears[compareYears.length - 1]]?.history?.[actualMonthIdx]?.foreigner || 0);
                  const prevYearVal = compareYears.length >= 2
                    ? (monthlyStatsByYear[compareYears[compareYears.length - 2]]?.history?.[actualMonthIdx]?.thai || 0) + 
                      (monthlyStatsByYear[compareYears[compareYears.length - 2]]?.history?.[actualMonthIdx]?.foreigner || 0)
                    : 0;
                  const diffVal = lastYearVal - prevYearVal;
                  const diffPct = prevYearVal > 0 ? Number(((diffVal / prevYearVal) * 100).toFixed(1)) : null;

                  return (
                    <tr key={mLabel} className="hover:bg-emerald-50/70 transition-colors duration-150">
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                        เดือน{FULL_MONTH_NAMES[actualMonthIdx]} ({mLabel})
                      </td>
                      {compareYears.map(y => {
                        const item = monthlyStatsByYear[y]?.history?.[actualMonthIdx] || { thai: 0, foreigner: 0 };
                        const total = item.thai + item.foreigner;
                        return (
                          <td key={y} className="py-3.5 px-4 text-center border-l border-slate-100">
                            <span className="inline-block px-3 py-1 rounded-full font-black text-xs sm:text-sm bg-slate-100 text-slate-900 border border-slate-200">
                              {total.toLocaleString()} คน
                            </span>
                            <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">
                              (ไทย {item.thai} | ต่างชาติ {item.foreigner})
                            </span>
                          </td>
                        );
                      })}
                      {compareYears.length >= 2 && (
                        <td className="py-3.5 px-4 text-center border-l border-slate-100">
                          {diffVal === 0 ? (
                            <span className="text-xs font-bold text-slate-400">0 (เท่าเดิม)</span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                              diffVal > 0 
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-300" 
                                : "bg-rose-50 text-rose-800 border border-rose-300"
                            }`}>
                              {diffVal > 0 ? <TrendingUp className="w-3 h-3 text-emerald-600" /> : <TrendingDown className="w-3 h-3 text-rose-600" />}
                              <span>{diffVal > 0 ? `+${diffVal}` : diffVal} คน</span>
                              {diffPct !== null && <span>({diffVal > 0 ? `+${diffPct}%` : `${diffPct}%`})</span>}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              {/* Table Footer Total Summary for Comparison */}
              <tfoot>
                <tr className="bg-slate-950 text-white font-extrabold text-xs sm:text-sm border-t-2 border-slate-800">
                  <td className="py-4 px-4 uppercase tracking-wider text-emerald-300 font-extrabold">
                    ยอดรวมสะสม ({selectedMonthsCount} เดือน)
                  </td>
                  {compareYears.map(y => {
                    const stats = getYearRangeStats(y);
                    return (
                      <td key={y} className="py-4 px-4 text-center border-l border-slate-800">
                        <span className="text-base sm:text-lg font-black text-amber-300 block">
                          {stats.total.toLocaleString()} คน
                        </span>
                        <span className="text-[11px] text-emerald-300 block">
                          (ไทย {stats.thai.toLocaleString()} | ต่างชาติ {stats.foreigner.toLocaleString()})
                        </span>
                      </td>
                    );
                  })}
                  {compareYears.length >= 2 && (
                    <td className="py-4 px-4 text-center border-l border-slate-800">
                      {(() => {
                        const lastTotal = getYearRangeStats(compareYears[compareYears.length - 1]).total;
                        const prevTotal = getYearRangeStats(compareYears[compareYears.length - 2]).total;
                        const totalDiff = lastTotal - prevTotal;
                        const totalPct = prevTotal > 0 ? ((totalDiff / prevTotal) * 100).toFixed(1) : null;
                        return (
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                            totalDiff >= 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                          }`}>
                            {totalDiff >= 0 ? `+${totalDiff}` : totalDiff} คน
                            {totalPct !== null && ` (${totalDiff >= 0 ? `+${totalPct}%` : `${totalPct}%`})`}
                          </span>
                        );
                      })()}
                    </td>
                  )}
                </tr>
              </tfoot>
            </table>
          ) : (
            /* STANDARD SINGLE YEAR / ALL YEARS TABLE */
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
                  })
                )}
              </tbody>
              {/* Table Footer Total Summary */}
              <tfoot>
                <tr className="bg-slate-950 text-white font-extrabold text-sm sm:text-base border-t-2 border-slate-800">
                  <td className="py-4 px-6 uppercase tracking-wider text-emerald-300 font-extrabold">
                    ยอดรวมสุทธิ ({filter === "monthly" ? (isCustomRange ? `ช่วง ${MONTH_LABELS[startMonth]} - ${MONTH_LABELS[endMonth]} ${currentSelectedYearLabel}` : currentSelectedYearLabel) : "ทุกปีรวมกัน"})
                  </td>
                  <td className="py-4 px-6 text-center text-emerald-400 font-black text-base sm:text-lg">{currentThaiCard.toLocaleString()} คน</td>
                  <td className="py-4 px-6 text-center text-sky-300 font-black text-base sm:text-lg">{currentForeignerCard.toLocaleString()} คน</td>
                  <td className="py-4 px-6 text-center text-amber-300 font-black text-lg sm:text-xl">{currentTotalCard.toLocaleString()} คน</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
      
    </div>
  );
}
