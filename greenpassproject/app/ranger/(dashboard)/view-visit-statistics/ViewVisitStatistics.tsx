"use client";

import { useState } from "react";

export default function ViewVisitStatistics() {
  const [filter, setFilter] = useState("daily");

  const mockData = {
    thai: 1250,
    foreigner: 450,
    total: 1700,
    history: [
      { label: "จันทร์", thai: 150, foreigner: 40 },
      { label: "อังคาร", thai: 180, foreigner: 50 },
      { label: "พุธ", thai: 130, foreigner: 30 },
      { label: "พฤหัสบดี", thai: 160, foreigner: 45 },
      { label: "ศุกร์", thai: 220, foreigner: 75 },
      { label: "เสาร์", thai: 410, foreigner: 210 },
      { label: "อาทิตย์", thai: 450, foreigner: 250 },
    ]
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-6 font-sans border-t-4 border-[#2ebb5e] space-y-6">
      
      <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
        <div>
          <h2 className="text-sm font-bold text-zinc-800">สถิติจำนวนผู้เข้าชมอุทยาน</h2>
          <p className="text-[11px] text-zinc-500">รายงานสรุปจำนวนนักท่องเที่ยวและสแตมป์</p>
        </div>
        <div className="flex gap-1.5">
          <button 
            onClick={() => setFilter("daily")}
            className={`px-3 py-1 text-[11px] font-bold rounded transition-colors ${filter === "daily" ? "bg-[#2ebb5e] text-white" : "bg-zinc-150 text-zinc-650 hover:bg-zinc-200"}`}
          >
            รายวัน
          </button>
          <button 
            onClick={() => setFilter("monthly")}
            className={`px-3 py-1 text-[11px] font-bold rounded transition-colors ${filter === "monthly" ? "bg-[#2ebb5e] text-white" : "bg-zinc-150 text-zinc-650 hover:bg-zinc-200"}`}
          >
            รายเดือน
          </button>
        </div>
      </div>

      {/* บัตรสรุปสถิติ */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">ชาวไทย</span>
          <span className="text-lg font-bold text-[#0c592b] block mt-1">{mockData.thai} คน</span>
        </div>
        <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 text-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">ชาวต่างชาติ</span>
          <span className="text-lg font-bold text-sky-700 block mt-1">{mockData.foreigner} คน</span>
        </div>
        <div className="bg-[#eaf7ee] p-4 rounded-xl border border-emerald-150 text-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">ยอดรวมทั้งหมด</span>
          <span className="text-lg font-bold text-[#2ebb5e] block mt-1">{mockData.total} คน</span>
        </div>
      </div>

      {/* แผนภูมิสถิติแบบแท่งอย่างง่าย */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-700">สถิติสะสมสแตมป์รายสัปดาห์</h3>
        <div className="h-48 flex items-end justify-between gap-2 pt-6 px-4 bg-zinc-50 rounded-xl border border-zinc-100">
          {mockData.history.map((day, idx) => {
            const maxVal = 700;
            const thaiHeight = `${Math.min(100, ((day.thai) / maxVal) * 100)}%`;
            const foreignerHeight = `${Math.min(100, ((day.foreigner) / maxVal) * 100)}%`;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full flex justify-center items-end gap-1 h-[80%] pb-2">
                  <div 
                    style={{ height: thaiHeight }}
                    className="w-2.5 bg-[#2ebb5e] rounded-t-sm shadow-sm group-hover:opacity-85 transition-all"
                    title={`ไทย: ${day.thai} คน`}
                  />
                  <div 
                    style={{ height: foreignerHeight }}
                    className="w-2.5 bg-sky-500 rounded-t-sm shadow-sm group-hover:opacity-85 transition-all"
                    title={`ต่างชาติ: ${day.foreigner} คน`}
                  />
                </div>
                <span className="text-[9px] font-bold text-zinc-500 mt-1">{day.label}</span>
              </div>
            );
          })}
        </div>
        
        {/* คำอธิบายสัญลักษณ์สี */}
        <div className="flex justify-center gap-4 text-[10px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#2ebb5e] rounded-sm" />
            <span className="text-zinc-650">สแตมป์ชาวไทย</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-sky-500 rounded-sm" />
            <span className="text-zinc-650">สแตมป์ชาวต่างชาติ</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
