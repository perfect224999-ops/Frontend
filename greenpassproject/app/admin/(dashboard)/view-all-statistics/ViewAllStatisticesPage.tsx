"use client";

import { useState } from "react";
import {
  BarChart3,
  Trees,
  Users,
  Newspaper,
  ClipboardList,
  Clock,
  Filter,
  MapPin,
  Calendar,
  Building2,
  TrendingUp,
  CheckCircle2,
  Activity,
  Sparkles
} from "lucide-react";

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
    totalRanger: "1,515",
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

  const maxVal = 30; // Max for height calculation

  return (
    <div className="w-full max-w-6xl mx-auto font-sans relative py-4 space-y-6 my-2">
      
      {/* Container หลัก */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-7 shadow-xl shadow-slate-200/50">
        
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                รายงานสรุปภาพรวมและสถิติอุทยานแห่งชาติ
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Admin Dashboard
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                ภาพรวมข้อมูลอุทยาน เจ้าหน้าที่ ข่าวประกาศ และสถานะการจัดการรายงานปัญหา
              </p>
            </div>
          </div>
        </div>

        {/* 5 Top Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          
          {/* Total Park */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-800">Total Park</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                <Trees className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-extrabold text-emerald-950">{metrics.totalPark}</h3>
              <p className="text-[10px] text-emerald-700/70 font-medium">แห่งทั่วประเทศ</p>
            </div>
          </div>

          {/* Total Ranger */}
          <div className="bg-gradient-to-br from-sky-50 to-blue-50/50 border border-sky-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-sky-800">Total Ranger</span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-extrabold text-sky-950">{metrics.totalRanger}</h3>
              <p className="text-[10px] text-sky-700/70 font-medium">คนในระบบ</p>
            </div>
          </div>

          {/* Total News */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50/50 border border-indigo-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-800">Total News</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center">
                <Newspaper className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-extrabold text-indigo-950">{metrics.totalNews}</h3>
              <p className="text-[10px] text-indigo-700/70 font-medium">ข่าวประชาสัมพันธ์</p>
            </div>
          </div>

          {/* Total Report */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-800">Total Report</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-extrabold text-amber-950">{metrics.totalReport}</h3>
              <p className="text-[10px] text-amber-700/70 font-medium">รายงานทั้งหมด</p>
            </div>
          </div>

          {/* TotalProcessing Report */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50/50 border border-rose-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-rose-800">Processing</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-700 flex items-center justify-center">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-extrabold text-rose-950">{metrics.totalProcessingReport}</h3>
              <p className="text-[10px] text-rose-700/70 font-medium">กำลังดำเนินการ</p>
            </div>
          </div>

        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>ตัวกรองการแสดงผลสถิติ:</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            
            {/* ภูมิภาค */}
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-slate-500">ภูมิภาค</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs font-medium rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-sm"
              >
                <option value="กรุณาเลือก">กรุณาเลือก ▼</option>
                <option value="กลาง">ภาคกลาง</option>
                <option value="เหนือ">ภาคเหนือ</option>
                <option value="ใต้">ภาคใต้</option>
                <option value="ตะวันออกเฉียงเหนือ">ภาคอีสาน</option>
              </select>
            </div>

            {/* เลือกอุทยาน */}
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-slate-500">เลือกอุทยาน</label>
              <select
                value={park}
                onChange={(e) => setPark(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs font-medium rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-sm"
              >
                <option value="อุทยานแห่งชาติเขาใหญ่">อุทยานแห่งชาติเขาใหญ่</option>
                <option value="อุทยานแห่งชาติแก่งกระจาน">อุทยานแห่งชาติแก่งกระจาน</option>
                <option value="อุทยานแห่งชาติเอราวัณ">อุทยานแห่งชาติเอราวัณ</option>
                <option value="อุทยานแห่งชาติดอยอินทนนท์">อุทยานแห่งชาติดอยอินทนนท์</option>
              </select>
            </div>

            {/* จังหวัด */}
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-slate-500">จังหวัด</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs font-medium rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-sm"
              >
                <option value="กรุณาเลือก">กรุณาเลือก ▼</option>
                <option value="นครราชสีมา">นครราชสีมา</option>
                <option value="เพชรบุรี">เพชรบุรี</option>
                <option value="เชียงใหม่">เชียงใหม่</option>
              </select>
            </div>

            {/* เดือน */}
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-slate-500">เดือน</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs font-medium rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-sm"
              >
                <option value="มกราคม">มกราคม</option>
                <option value="กุมภาพันธ์">กุมภาพันธ์</option>
                <option value="มีนาคม">มีนาคม</option>
                <option value="เมษายน">เมษายน</option>
              </select>
            </div>

            {/* ปี */}
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-slate-500">ปี พ.ศ.</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs font-medium rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-sm"
              >
                <option value="2567">2567</option>
                <option value="2566">2566</option>
              </select>
            </div>

          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              สรุปผลข้อมูลสถิติรายอุทยาน ({park})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-slate-100 font-semibold">
                  <th className="py-3.5 px-5">อุทยานแห่งชาติ</th>
                  <th className="py-3.5 px-4 text-center">ข่าวที่ประกาศ</th>
                  <th className="py-3.5 px-4 text-center">รายงานทั้งหมด</th>
                  <th className="py-3.5 px-4 text-center">กำลังดำเนินการ</th>
                  <th className="py-3.5 px-4 text-center">ดำเนินการสำเร็จ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                <tr className="hover:bg-emerald-50/40 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    {tableData.parkName}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {tableData.announcements} ข่าว
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      {tableData.totalReports} รายการ
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                      {tableData.inProgress} รายการ
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {tableData.completed} รายการ
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced Bar Chart Section */}
        <div className="bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              แผนภูมิเปรียบเทียบสถิติรายงาน (Bar Chart Visualizer)
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">
              ประจำเดือน {month} พ.ศ. {year}
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative">
            
            {/* Chart Area */}
            <div className="flex h-64 items-end relative border-b border-l border-slate-300 pb-2 pl-4">
              
              {/* Y-axis Gridlines & Numbers */}
              <div className="absolute left-[-28px] top-0 bottom-6 flex flex-col justify-between text-[10px] font-semibold text-slate-400 text-right w-5">
                <span>30</span>
                <span>25</span>
                <span>20</span>
                <span>15</span>
                <span>10</span>
                <span>5</span>
                <span>0</span>
              </div>

              {/* Horizontal Subtle Grid Lines */}
              <div className="absolute inset-0 pl-4 pb-6 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-slate-300 w-full" />
              </div>

              {/* Bars Grid */}
              <div className="flex-1 flex justify-around items-end h-[90%] px-4 z-10">
                
                {/* 1. ข่าวที่ประกาศ (5) */}
                <div className="flex flex-col items-center justify-end h-full w-20 group cursor-pointer">
                  {/* Badge count on top */}
                  <span className="text-xs font-black text-indigo-600 mb-1 opacity-90 group-hover:scale-110 transition-transform">
                    {tableData.announcements}
                  </span>
                  <div
                    className="w-12 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl shadow-md group-hover:from-indigo-500 group-hover:to-indigo-300 transition-all duration-300"
                    style={{ height: `${(tableData.announcements / maxVal) * 100}%` }}
                  />
                  <span className="text-[11px] font-bold text-slate-700 mt-2 whitespace-nowrap">
                    ข่าวที่ประกาศ
                  </span>
                </div>

                {/* 2. รายงานทั้งหมด (24) */}
                <div className="flex flex-col items-center justify-end h-full w-20 group cursor-pointer">
                  <span className="text-xs font-black text-amber-600 mb-1 opacity-90 group-hover:scale-110 transition-transform">
                    {tableData.totalReports}
                  </span>
                  <div
                    className="w-12 bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-xl shadow-md group-hover:from-amber-400 group-hover:to-amber-200 transition-all duration-300"
                    style={{ height: `${(tableData.totalReports / maxVal) * 100}%` }}
                  />
                  <span className="text-[11px] font-bold text-slate-700 mt-2 whitespace-nowrap">
                    รายงานทั้งหมด
                  </span>
                </div>

                {/* 3. กำลังดำเนินการ (4) */}
                <div className="flex flex-col items-center justify-end h-full w-20 group cursor-pointer">
                  <span className="text-xs font-black text-sky-600 mb-1 opacity-90 group-hover:scale-110 transition-transform">
                    {tableData.inProgress}
                  </span>
                  <div
                    className="w-12 bg-gradient-to-t from-sky-500 to-sky-300 rounded-t-xl shadow-md group-hover:from-sky-400 group-hover:to-sky-200 transition-all duration-300"
                    style={{ height: `${(tableData.inProgress / maxVal) * 100}%` }}
                  />
                  <span className="text-[11px] font-bold text-slate-700 mt-2 whitespace-nowrap">
                    กำลังดำเนินการ
                  </span>
                </div>

                {/* 4. ดำเนินการสำเร็จ (20) */}
                <div className="flex flex-col items-center justify-end h-full w-20 group cursor-pointer">
                  <span className="text-xs font-black text-emerald-600 mb-1 opacity-90 group-hover:scale-110 transition-transform">
                    {tableData.completed}
                  </span>
                  <div
                    className="w-12 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl shadow-md group-hover:from-emerald-500 group-hover:to-emerald-300 transition-all duration-300"
                    style={{ height: `${(tableData.completed / maxVal) * 100}%` }}
                  />
                  <span className="text-[11px] font-bold text-slate-700 mt-2 whitespace-nowrap">
                    ดำเนินการสำเร็จ
                  </span>
                </div>

              </div>

            </div>

            {/* Legend Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-indigo-500 inline-block" />
                <span>ข่าวที่ประกาศ ({tableData.announcements})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" />
                <span>รายงานทั้งหมด ({tableData.totalReports})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-sky-500 inline-block" />
                <span>กำลังดำเนินการ ({tableData.inProgress})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
                <span>ดำเนินการสำเร็จ ({tableData.completed})</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

