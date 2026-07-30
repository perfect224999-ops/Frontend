"use client";

import { useState } from "react";

export default function ViewAllStatisticesPage() {
  // Filter states
  const [region, setRegion] = useState("กรุณาเลือก");
  const [park, setPark] = useState("อุทยานแห่งชาติเขาใหญ่");
  const [province, setProvince] = useState("กรุณาเลือก");
  const [month, setMonth] = useState("กุมภาพันธ์");
  const [year, setYear] = useState("2567");

  // Mock numbers from Page 171 mockup
  const metrics = {
    totalPark: "156",
    totalRanger: "1515",
    totalNews: "85",
    totalReport: "240",
    totalProcessingReport: "42"
  };

  const tableData = {
    parkName: "อุทยานแห่งชาติเขาใหญ่",
    announcements: 5,
    totalReports: 24,
    inProgress: 4,
    completed: 20
  };

  // Bar height multiplier to display nicely in the chart
  const maxVal = 70;

  return (
    <div className="w-full max-w-4xl mx-auto bg-zinc-300 p-6 rounded-2xl shadow-2xl relative z-10 font-sans text-[10px] my-6">
      
      {/* Centered White Container (ตามรูปที่ 3.3.111 ในเอกสาร) */}
      <div className="bg-white border border-zinc-400 rounded-xl p-5 space-y-5 text-zinc-800">
        
        {/* Metrics Row */}
        <div className="grid grid-cols-5 gap-2 bg-zinc-200 border border-zinc-300 p-2.5 rounded-lg text-center font-bold">
          
          <div className="space-y-1">
            <span className="text-[9px] text-zinc-650 block">Total Park</span>
            <div className="bg-white border border-zinc-300 rounded-md py-0.5 font-bold text-zinc-800">
              {metrics.totalPark}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] text-zinc-650 block">Total Ranger</span>
            <div className="bg-white border border-zinc-300 rounded-md py-0.5 font-bold text-zinc-800">
              {metrics.totalRanger}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] text-zinc-650 block">Total News</span>
            <div className="bg-white border border-zinc-300 rounded-md py-0.5 font-bold text-zinc-800">
              {metrics.totalNews}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] text-zinc-650 block">Total Report</span>
            <div className="bg-white border border-zinc-300 rounded-md py-0.5 font-bold text-zinc-800">
              {metrics.totalReport}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] text-zinc-650 block">TotalProcessing Report</span>
            <div className="bg-white border border-zinc-300 rounded-md py-0.5 font-bold text-zinc-800">
              {metrics.totalProcessingReport}
            </div>
          </div>

        </div>

        {/* Filter Selectors */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-zinc-100 p-3 rounded-lg border border-zinc-250 font-bold text-zinc-700">
          
          <div className="flex items-center gap-1">
            <span className="shrink-0">ภูมิภาค :</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="flex-1 bg-zinc-300 text-zinc-800 rounded px-1.5 py-0.5 focus:outline-none border-none text-[9px] font-bold cursor-pointer"
            >
              <option value="กรุณาเลือก">กรุณาเลือก ▼</option>
              <option value="กลาง">ภาคกลาง</option>
              <option value="เหนือ">ภาคเหนือ</option>
              <option value="ใต้">ภาคใต้</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="shrink-0">เลือกอุทยาน :</span>
            <select
              value={park}
              onChange={(e) => setPark(e.target.value)}
              className="flex-1 bg-zinc-300 text-zinc-800 rounded px-1.5 py-0.5 focus:outline-none border-none text-[9px] font-bold cursor-pointer"
            >
              <option value="อุทยานแห่งชาติเขาใหญ่">อุทยานแห่งชาติเขาใหญ่ ▼</option>
              <option value="อุทยานแห่งชาติแก่งกระจาน">อุทยานแห่งชาติแก่งกระจาน ▼</option>
              <option value="อุทยานแห่งชาติเอราวัณ">อุทยานแห่งชาติเอราวัณ ▼</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="shrink-0">จังหวัด :</span>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="flex-1 bg-zinc-300 text-zinc-800 rounded px-1.5 py-0.5 focus:outline-none border-none text-[9px] font-bold cursor-pointer"
            >
              <option value="กรุณาเลือก">กรุณาเลือก ▼</option>
              <option value="นครราชสีมา">นครราชสีมา</option>
              <option value="เพชรบุรี">เพชรบุรี</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="shrink-0">เดือน :</span>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="flex-1 bg-zinc-300 text-zinc-800 rounded px-1.5 py-0.5 focus:outline-none border-none text-[9px] font-bold cursor-pointer"
            >
              <option value="กุมภาพันธ์">กุมภาพันธ์ ▼</option>
              <option value="มกราคม">มกราคม ▼</option>
              <option value="มีนาคม">มีนาคม ▼</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="shrink-0">ปี :</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="flex-1 bg-zinc-300 text-zinc-800 rounded px-1.5 py-0.5 focus:outline-none border-none text-[9px] font-bold cursor-pointer"
            >
              <option value="2567">2567 ▼</option>
              <option value="2566">2566 ▼</option>
            </select>
          </div>

        </div>

        {/* Statistics Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-300">
          <table className="w-full border-collapse text-left text-zinc-800 font-bold">
            <thead>
              <tr className="bg-zinc-200 border-b border-zinc-300 text-zinc-700">
                <th className="px-4 py-2">อุทยานแห่งชาติ</th>
                <th className="px-4 py-2">ข่าวที่ประกาศ</th>
                <th className="px-4 py-2">รายงานทั้งหมด</th>
                <th className="px-4 py-2">กำลังดำเนินการ</th>
                <th className="px-4 py-2">ดำเนินการสำเร็จ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              <tr className="hover:bg-zinc-50">
                <td className="px-4 py-2.5 text-zinc-900">{tableData.parkName}</td>
                <td className="px-4 py-2.5">{tableData.announcements}</td>
                <td className="px-4 py-2.5">{tableData.totalReports}</td>
                <td className="px-4 py-2.5">{tableData.inProgress}</td>
                <td className="px-4 py-2.5">{tableData.completed}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CSS Custom Bar Chart (ตามรูปที่ 3.3.111 ในเอกสาร) */}
        <div className="bg-zinc-200 border border-zinc-300 rounded-lg p-5">
          
          <div className="flex h-56 items-end relative border-b border-l border-zinc-400 pb-1.5 pl-2.5">
            
            {/* Y-axis Labels */}
            <div className="absolute left-[-22px] bottom-0 flex flex-col justify-between h-[85%] text-[8px] font-bold text-zinc-500 text-right w-4">
              <span>70</span>
              <span>60</span>
              <span>50</span>
              <span>40</span>
              <span>30</span>
              <span>20</span>
              <span>10</span>
              <span>0</span>
            </div>

            {/* Bars */}
            <div className="flex-1 flex justify-around items-end h-[85%] px-4">
              
              {/* ข่าวที่ประกาศ (5) */}
              <div className="flex flex-col items-center justify-end h-full w-14">
                <div 
                  className="bg-black w-7 hover:opacity-85 transition-opacity" 
                  style={{ height: `${(tableData.announcements / maxVal) * 100}%` }}
                />
                <span className="text-[8px] font-bold text-zinc-650 mt-1 block whitespace-nowrap">ข่าวที่ประกาศ</span>
              </div>

              {/* รายงานทั้งหมด (24) */}
              <div className="flex flex-col items-center justify-end h-full w-14">
                <div 
                  className="bg-black w-7 hover:opacity-85 transition-opacity" 
                  style={{ height: `${(tableData.totalReports / maxVal) * 100}%` }}
                />
                <span className="text-[8px] font-bold text-zinc-650 mt-1 block whitespace-nowrap">รายงานทั้งหมด</span>
              </div>

              {/* กำลังดำเนินการ (4) */}
              <div className="flex flex-col items-center justify-end h-full w-14">
                <div 
                  className="bg-black w-7 hover:opacity-85 transition-opacity" 
                  style={{ height: `${(tableData.inProgress / maxVal) * 100}%` }}
                />
                <span className="text-[8px] font-bold text-zinc-650 mt-1 block whitespace-nowrap">กำลังดำเนินการ</span>
              </div>

              {/* ดำเนินการสำเร็จ (20) */}
              <div className="flex flex-col items-center justify-end h-full w-14">
                <div 
                  className="bg-black w-7 hover:opacity-85 transition-opacity" 
                  style={{ height: `${(tableData.completed / maxVal) * 100}%` }}
                />
                <span className="text-[8px] font-bold text-zinc-650 mt-1 block whitespace-nowrap">ดำเนินการสำเร็จ</span>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
