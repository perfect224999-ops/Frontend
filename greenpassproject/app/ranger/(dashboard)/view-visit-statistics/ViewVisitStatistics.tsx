"use client";

import { useEffect, useState } from "react";
import { stampApi } from "@/service/api";
import { Users, Calendar, Info, ChevronLeft, ChevronRight } from "lucide-react";

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

export default function ViewVisitStatistics() {
  const [filter, setFilter] = useState<"monthly" | "yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState<string>("ปี 2026 (ปัจจุบัน)");

  // ข้อมูลสถิติรายเดือนแยกตามปี (ปี 2026, 2025, 2024, 2023)
  const [monthlyStatsByYear, setMonthlyStatsByYear] = useState<Record<string, PeriodStats>>({
    "ปี 2026 (ปัจจุบัน)": {
      thai: 101,
      foreigner: 200,
      total: 301,
      history: [
        { label: "ม.ค.", thai: 9, foreigner: 16 },
        { label: "ก.พ.", thai: 6, foreigner: 12 },
        { label: "มี.ค.", thai: 7, foreigner: 14 },
        { label: "เม.ย.", thai: 15, foreigner: 30 },
        { label: "พ.ค.", thai: 6, foreigner: 12 },
        { label: "มิ.ย.", thai: 5, foreigner: 10 },
        { label: "ก.ค.", thai: 8, foreigner: 16 },
        { label: "ส.ค.", thai: 9, foreigner: 18 },
        { label: "ก.ย.", thai: 6, foreigner: 12 },
        { label: "ต.ค.", thai: 7, foreigner: 14 },
        { label: "พ.ย.", thai: 10, foreigner: 20 },
        { label: "ธ.ค.", thai: 13, foreigner: 26 },
      ]
    },
    "ปี 2025": {
      thai: 85,
      foreigner: 170,
      total: 255,
      history: [
        { label: "ม.ค.", thai: 8, foreigner: 15 },
        { label: "ก.พ.", thai: 5, foreigner: 10 },
        { label: "มี.ค.", thai: 6, foreigner: 12 },
        { label: "เม.ย.", thai: 12, foreigner: 25 },
        { label: "พ.ค.", thai: 5, foreigner: 10 },
        { label: "มิ.ย.", thai: 4, foreigner: 8 },
        { label: "ก.ค.", thai: 7, foreigner: 14 },
        { label: "ส.ค.", thai: 8, foreigner: 15 },
        { label: "ก.ย.", thai: 5, foreigner: 10 },
        { label: "ต.ค.", thai: 6, foreigner: 12 },
        { label: "พ.ย.", thai: 8, foreigner: 16 },
        { label: "ธ.ค.", thai: 11, foreigner: 23 },
      ]
    },
    "ปี 2024": {
      thai: 70,
      foreigner: 140,
      total: 210,
      history: [
        { label: "ม.ค.", thai: 6, foreigner: 12 },
        { label: "ก.พ.", thai: 4, foreigner: 8 },
        { label: "มี.ค.", thai: 5, foreigner: 10 },
        { label: "เม.ย.", thai: 10, foreigner: 20 },
        { label: "พ.ค.", thai: 4, foreigner: 8 },
        { label: "มิ.ย.", thai: 3, foreigner: 6 },
        { label: "ก.ค.", thai: 6, foreigner: 12 },
        { label: "ส.ค.", thai: 6, foreigner: 12 },
        { label: "ก.ย.", thai: 4, foreigner: 8 },
        { label: "ต.ค.", thai: 5, foreigner: 10 },
        { label: "พ.ย.", thai: 7, foreigner: 14 },
        { label: "ธ.ค.", thai: 10, foreigner: 20 },
      ]
    },
    "ปี 2023": {
      thai: 60,
      foreigner: 120,
      total: 180,
      history: [
        { label: "ม.ค.", thai: 5, foreigner: 10 },
        { label: "ก.พ.", thai: 3, foreigner: 6 },
        { label: "มี.ค.", thai: 4, foreigner: 8 },
        { label: "เม.ย.", thai: 9, foreigner: 18 },
        { label: "พ.ค.", thai: 3, foreigner: 6 },
        { label: "มิ.ย.", thai: 3, foreigner: 6 },
        { label: "ก.ค.", thai: 5, foreigner: 10 },
        { label: "ส.ค.", thai: 5, foreigner: 10 },
        { label: "ก.ย.", thai: 3, foreigner: 6 },
        { label: "ต.ค.", thai: 4, foreigner: 8 },
        { label: "พ.ย.", thai: 6, foreigner: 12 },
        { label: "ธ.ค.", thai: 10, foreigner: 20 },
      ]
    }
  });

  // สถิติรายปี (สะสมสรุปแต่ละปี)
  const [yearlyStats, setYearlyStats] = useState<PeriodStats>({
    thai: 316,
    foreigner: 630,
    total: 946,
    history: [
      { label: "ปี 2023", thai: 60, foreigner: 120 },
      { label: "ปี 2024", thai: 70, foreigner: 140 },
      { label: "ปี 2025", thai: 85, foreigner: 170 },
      { label: "ปี 2026 (ปัจจุบัน)", thai: 101, foreigner: 200 },
    ]
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await stampApi.getStatistics();
        if (response && response.success && response.result) {
          const res = response.result;
          if (res.monthlyStats) {
            const current2026 = {
              thai: res.monthlyStats.thai || 101,
              foreigner: res.monthlyStats.foreigner || 200,
              total: res.monthlyStats.total || 301,
              history: res.monthlyStats.history && res.monthlyStats.history.length > 0 ? res.monthlyStats.history : monthlyStatsByYear["ปี 2026 (ปัจจุบัน)"].history
            };
            setMonthlyStatsByYear(prev => ({
              ...prev,
              "ปี 2026 (ปัจจุบัน)": current2026
            }));
          }

          if (res.yearlyStats) {
            setYearlyStats({
              thai: res.yearlyStats.thai || 316,
              foreigner: res.yearlyStats.foreigner || 630,
              total: res.yearlyStats.total || 946,
              history: res.yearlyStats.history && res.yearlyStats.history.length > 0 ? res.yearlyStats.history : yearlyStats.history
            });
          }
        }
      } catch (err) {
        console.log("Using statistics default data:", err);
      }
    }
    fetchStats();
  }, []);

  const yearsList = ["ปี 2023", "ปี 2024", "ปี 2025", "ปี 2026 (ปัจจุบัน)"];

  // หา Index ของปีที่ถูกเลือกในปัจจุบัน
  const activeYearIdx = yearsList.indexOf(selectedYear) !== -1 ? yearsList.indexOf(selectedYear) : 3;
  const currentSelectedYearLabel = yearsList[activeYearIdx];

  // สถิติรายเดือนประจำปีที่เลือก
  const currentMonthlyStats = monthlyStatsByYear[currentSelectedYearLabel] || monthlyStatsByYear["ปี 2026 (ปัจจุบัน)"];

  // ฟังก์ชันเลื่อนเลือกปีถัดไป / ย้อนหลัง
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

  // คำนวณยอดที่จะแสดงในการ์ด 3 ใบ
  const currentThaiCard = filter === "monthly" ? currentMonthlyStats.thai : yearlyStats.thai;
  const currentForeignerCard = filter === "monthly" ? currentMonthlyStats.foreigner : yearlyStats.foreigner;
  const currentTotalCard = filter === "monthly" ? currentMonthlyStats.total : yearlyStats.total;

  const getTitle = () => {
    if (filter === "monthly") return `สถิติจำนวนผู้เข้าชมอุทยาน (มุมมองรายเดือน - 12 เดือนประจำ${currentSelectedYearLabel})`;
    return `สถิติจำนวนผู้เข้าชมอุทยาน (มุมมองรายปี - แสดงเปรียบเทียบทุกปี)`;
  };

  const getCardLabel = (type: "thai" | "foreigner" | "total") => {
    if (type === "thai") {
      if (filter === "monthly") return `ชาวไทย (รายเดือนประจำ${currentSelectedYearLabel})`;
      return `ชาวไทย (สะสมทุกปี)`;
    }
    if (type === "foreigner") {
      if (filter === "monthly") return `ชาวต่างชาติ (รายเดือนประจำ${currentSelectedYearLabel})`;
      return `ชาวต่างชาติ (สะสมทุกปี)`;
    }
    if (filter === "monthly") return `ยอดรวม 12 เดือน (${currentSelectedYearLabel})`;
    return `ยอดรวมสะสมทุกปี`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-6 font-sans border-t-4 border-[#2ebb5e] space-y-6">
      
      {/* Title Bar & Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-150 pb-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#2ebb5e]" />
            {getTitle()}
          </h2>
          <p className="text-[11px] text-zinc-500">รายงานสรุปจำนวนนักท่องเที่ยวและสแตมป์</p>
        </div>

        {/* 2 Toggle Buttons: รายเดือน & รายปี */}
        <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200 self-end sm:self-auto">
          <button 
            onClick={() => setFilter("monthly")}
            className={`px-3 py-1.5 text-[11px] font-bold rounded transition-all cursor-pointer ${filter === "monthly" ? "bg-[#2ebb5e] text-white shadow-xs" : "text-zinc-650 hover:bg-zinc-200"}`}
          >
            รายเดือน
          </button>
          <button 
            onClick={() => setFilter("yearly")}
            className={`px-3 py-1.5 text-[11px] font-bold rounded transition-all cursor-pointer ${filter === "yearly" ? "bg-[#2ebb5e] text-white shadow-xs" : "text-zinc-650 hover:bg-zinc-200"}`}
          >
            รายปี
          </button>
        </div>
      </div>

      {/* แถบกดเลือกปีสำหรับมุมมอง "รายเดือน" (Year Navigation Bar) */}
      {filter === "monthly" && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2ebb5e]" />
            <span className="text-xs font-extrabold text-emerald-950">
              เลือกปีที่ต้องการดูสถิติรายเดือน (12 เดือน):
            </span>
          </div>

          {/* Year Buttons & Arrows */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            
            {/* Prev Arrow */}
            <button
              onClick={handlePrevYear}
              disabled={activeYearIdx === 0}
              className={`p-1.5 rounded-lg border transition-all ${
                activeYearIdx === 0 
                  ? "opacity-30 border-zinc-200 text-zinc-400 cursor-not-allowed" 
                  : "bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 cursor-pointer shadow-xs"
              }`}
              title="ปีก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Year Pills */}
            {yearsList.map((yLabel) => {
              const isActive = yLabel === currentSelectedYearLabel;
              return (
                <button
                  key={yLabel}
                  onClick={() => setSelectedYear(yLabel)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    isActive 
                      ? "bg-[#2ebb5e] text-white border-[#279f50] shadow-sm scale-105" 
                      : "bg-white text-zinc-700 border-zinc-250 hover:bg-emerald-50 hover:border-emerald-300"
                  }`}
                >
                  {yLabel}
                </button>
              );
            })}

            {/* Next Arrow */}
            <button
              onClick={handleNextYear}
              disabled={activeYearIdx === yearsList.length - 1}
              className={`p-1.5 rounded-lg border transition-all ${
                activeYearIdx === yearsList.length - 1 
                  ? "opacity-30 border-zinc-200 text-zinc-400 cursor-not-allowed" 
                  : "bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 cursor-pointer shadow-xs"
              }`}
              title="ปีถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>
        </div>
      )}

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center shadow-xs">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
            {getCardLabel("thai")}
          </span>
          <span className="text-lg font-bold text-[#0c592b] block mt-1">{currentThaiCard.toLocaleString()} คน</span>
        </div>
        <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 text-center shadow-xs">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
            {getCardLabel("foreigner")}
          </span>
          <span className="text-lg font-bold text-sky-700 block mt-1">{currentForeignerCard.toLocaleString()} คน</span>
        </div>
        <div className="bg-[#eaf7ee] p-4 rounded-xl border border-emerald-150 text-center shadow-xs">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
            {getCardLabel("total")}
          </span>
          <span className="text-lg font-bold text-[#2ebb5e] block mt-1">{currentTotalCard.toLocaleString()} คน</span>
        </div>
      </div>

      {/* แผนภูมิสถิติแบบแท่ง */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            {filter === "monthly" 
              ? `สถิติสะสมสแตมป์รายเดือน 12 เดือนประจำ${currentSelectedYearLabel}` 
              : `สถิติเปรียบเทียบสแตมป์สะสมรายปี (แสดงทุกปี)`}
          </h3>
          <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
            <Info className="w-3 h-3" /> เอาเมาส์วางเพื่อดูรายละเอียดได้
          </span>
        </div>

        {/* กรณี filter === "monthly": แสดง 12 คู่แท่งประจำปีที่เลือก */}
        {filter === "monthly" ? (
          <div className="h-56 flex items-end justify-between gap-1.5 pt-8 pb-3 px-3 bg-zinc-50 rounded-xl border border-zinc-100 relative">
            {currentMonthlyStats.history.map((item, idx) => {
              const maxVal = Math.max(...currentMonthlyStats.history.map((h) => Math.max(h.thai, h.foreigner, 1)), 40);
              const thaiHeight = `${Math.min(100, Math.max(10, (item.thai / maxVal) * 100))}%`;
              const foreignerHeight = `${Math.min(100, Math.max(10, (item.foreigner / maxVal) * 100))}%`;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end relative group">
                  
                  {/* Hover Tooltip Card */}
                  <div className="absolute -top-11 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] py-1 px-2.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none z-20 font-medium">
                    เดือน{item.label} ({currentSelectedYearLabel}): ไทย <span className="text-emerald-400 font-bold">{item.thai}</span> | ต่างชาติ <span className="text-sky-300 font-bold">{item.foreigner}</span> (รวม {item.thai + item.foreigner} คน)
                  </div>

                  {/* Bars Container */}
                  <div className="w-full flex justify-center items-end gap-1 h-[80%] pb-1">
                    
                    {/* Green Bar (Thai) */}
                    <div className="flex flex-col items-center h-full justify-end w-2.5 sm:w-4">
                      <span className="text-[8px] sm:text-[9px] font-bold text-emerald-800 mb-0.5 opacity-90">{item.thai}</span>
                      <div 
                        style={{ height: thaiHeight }}
                        className="w-full bg-[#2ebb5e] rounded-t-xs shadow-xs group-hover:bg-[#279f50] transition-all"
                      />
                    </div>

                    {/* Blue Bar (Foreigner) */}
                    <div className="flex flex-col items-center h-full justify-end w-2.5 sm:w-4">
                      <span className="text-[8px] sm:text-[9px] font-bold text-sky-800 mb-0.5 opacity-90">{item.foreigner}</span>
                      <div 
                        style={{ height: foreignerHeight }}
                        className="w-full bg-sky-500 rounded-t-xs shadow-xs group-hover:bg-sky-600 transition-all"
                      />
                    </div>

                  </div>

                  {/* Name Label */}
                  <span className="text-[9px] sm:text-[10px] font-bold text-zinc-600 mt-2">{item.label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          /* กรณี filter === "yearly": แสดงหลายคู่แท่งครอบคลุมทุกปี (2023 - 2026) */
          <div className="h-56 flex items-end justify-around gap-3 pt-8 pb-3 px-6 bg-zinc-50 rounded-xl border border-zinc-100 relative">
            {yearlyStats.history.map((item, idx) => {
              const maxVal = Math.max(...yearlyStats.history.map((h) => Math.max(h.thai, h.foreigner, 1)), 50);
              const thaiHeight = `${Math.min(100, Math.max(10, (item.thai / maxVal) * 100))}%`;
              const foreignerHeight = `${Math.min(100, Math.max(10, (item.foreigner / maxVal) * 100))}%`;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end relative group max-w-[130px]">
                  
                  {/* Tooltip */}
                  <div className="absolute -top-11 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] py-1 px-2.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none z-20 font-medium">
                    {item.label}: ไทย <span className="text-emerald-400 font-bold">{item.thai}</span> | ต่างชาติ <span className="text-sky-300 font-bold">{item.foreigner}</span> (รวม {item.thai + item.foreigner} คน)
                  </div>

                  {/* Bars Container */}
                  <div className="w-full flex justify-center items-end gap-2 h-[80%] pb-1">
                    
                    {/* Green Bar (Thai) */}
                    <div className="flex flex-col items-center h-full justify-end w-5 sm:w-7">
                      <span className="text-[9px] sm:text-[10px] font-bold text-emerald-800 mb-0.5 opacity-90">{item.thai}</span>
                      <div 
                        style={{ height: thaiHeight }}
                        className="w-full bg-[#2ebb5e] rounded-t-sm shadow-xs group-hover:bg-[#279f50] transition-all"
                      />
                    </div>

                    {/* Blue Bar (Foreigner) */}
                    <div className="flex flex-col items-center h-full justify-end w-5 sm:w-7">
                      <span className="text-[9px] sm:text-[10px] font-bold text-sky-800 mb-0.5 opacity-90">{item.foreigner}</span>
                      <div 
                        style={{ height: foreignerHeight }}
                        className="w-full bg-sky-500 rounded-t-sm shadow-xs group-hover:bg-sky-600 transition-all"
                      />
                    </div>

                  </div>

                  {/* Name Label */}
                  <span className="text-[10px] sm:text-xs font-bold text-zinc-700 mt-2">{item.label}</span>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Color Legend */}
        <div className="flex justify-center gap-6 text-[10px] font-bold pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#2ebb5e] rounded-xs" />
            <span className="text-zinc-650">สแตมป์ชาวไทย</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-sky-500 rounded-xs" />
            <span className="text-zinc-650">สแตมป์ชาวต่างชาติ</span>
          </div>
        </div>
      </div>

      {/* ตารางสรุปยอด */}
      <div className="space-y-2 pt-2 border-t border-zinc-150">
        <h3 className="text-xs font-bold text-zinc-700">
          ตารางสรุปผู้เข้าชมอุทยาน ({filter === "monthly" ? `แยกรายเดือน 12 เดือนประจำ${currentSelectedYearLabel}` : "เปรียบเทียบในแต่ละปี"})
        </h3>

        <div className="overflow-x-auto border border-zinc-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-800 text-zinc-100 text-[11px]">
                <th className="py-2.5 px-4 font-semibold">{filter === "monthly" ? "เดือน" : "ปีพุทธศักราช / คริสต์ศักราช"}</th>
                <th className="py-2.5 px-4 font-semibold text-center text-emerald-300">สแตมป์ชาวไทย</th>
                <th className="py-2.5 px-4 font-semibold text-center text-sky-300">สแตมป์ชาวต่างชาติ</th>
                <th className="py-2.5 px-4 font-semibold text-center">รวมจำนวนผู้เข้าชม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 text-zinc-700 bg-zinc-50/50">
              {(filter === "monthly" ? currentMonthlyStats.history : yearlyStats.history).map((item, i) => {
                return (
                  <tr 
                    key={i} 
                    className="hover:bg-emerald-50/40 transition-all"
                  >
                    <td className="py-2.5 px-4 font-bold text-zinc-800">
                      {filter === "monthly" ? `เดือน${item.label}` : item.label}
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold text-emerald-700 bg-emerald-50/40">{item.thai.toLocaleString()} คน</td>
                    <td className="py-2.5 px-4 text-center font-bold text-sky-700 bg-sky-50/40">{item.foreigner.toLocaleString()} คน</td>
                    <td className="py-2.5 px-4 text-center font-extrabold text-zinc-900">{(item.thai + item.foreigner).toLocaleString()} คน</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
