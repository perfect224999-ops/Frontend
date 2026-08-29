"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { reportApi } from "../../../../service/api";
import {
  ClipboardList,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Filter,
  UserCheck,
  Eye,
  Check,
  Sparkles
} from "lucide-react";

interface ReportItem {
  id: string;
  reportDate: string;
  category: string;
  status: string;
  reportDetails: string;
  ranger: string;
  startDate: string;
  completedDate: string;
}

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: "1",
    reportDate: "10/02/2567",
    category: "ขยะสิ่งแวดล้อม",
    status: "กำลังดำเนินการ",
    reportDetails: "พบเจอช้างป่าหลุดบริเวณทางเข้าอุทยาน",
    ranger: "ใจดี มากๆ",
    startDate: "10/02/2567",
    completedDate: "-"
  },
  {
    id: "2",
    reportDate: "15/02/2567",
    category: "ความสะอาด",
    status: "กำลังดำเนินการ",
    reportDetails: "พบกิ่งไม้ขนาดใหญ่ล้มขวางเส้นทางศึกษาธรรมชาติกิโลเมตรที่ 4",
    ranger: "D3D3D3",
    startDate: "15/02/2567",
    completedDate: "-"
  },
  {
    id: "3",
    reportDate: "25/02/2567",
    category: "สาธารณูปโภค",
    status: "กำลังดำเนินการ",
    reportDetails: "ท่อน้ำรั่วซึมบริเวณใกล้ห้องน้ำสาธารณะจุดกางเต็นท์ลำตะคอง",
    ranger: "ใจดี มากๆ",
    startDate: "25/02/2567",
    completedDate: "-"
  },
  {
    id: "4",
    reportDate: "27/02/2567",
    category: "ป้ายเตือน",
    status: "ดำเนินการแก้ไขสำเร็จ",
    reportDetails: "ป้ายเตือนระวังช้างป่าล้มชำรุดเสียหายบริเวณกิโลเมตรที่ 12",
    ranger: "สมชาย อังยอง",
    startDate: "27/02/2567",
    completedDate: "27/02/2567"
  }
];

export default function ListReportMember() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedDate, setSelectedDate] = useState("All");
  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>({
    "1": true,
    "2": true
  });

  useEffect(() => {
    async function loadReports() {
      const username = localStorage.getItem("ranger_username") || localStorage.getItem("username");
      const parkId = localStorage.getItem("ranger_park_id") || localStorage.getItem("parkId");

      try {
        let res;
        if (username) {
          res = await reportApi.getReportsForRanger(username);
        } else if (parkId) {
          res = await reportApi.getReportsByParkId(Number(parkId));
        }

        const listData = res && res.success ? (res.result || res.data) : null;
        if (Array.isArray(listData) && listData.length > 0) {
          const mapped: ReportItem[] = listData.map((r: any, idx: number) => {
            let dateStr = r.reportDate || "28/08/2569";
            if (dateStr.includes("-")) {
              const [y, m, d] = dateStr.split("-");
              dateStr = `${d}/${m}/${Number(y) + 543}`;
            }
            return {
              id: String(r.reportId || idx + 1),
              reportDate: dateStr,
              category: "ทั่วไป",
              status: r.status === "Pending" ? "แจ้งรายงาน" : r.status === "InProgress" ? "กำลังดำเนินการ" : r.status === "Completed" ? "ดำเนินการแก้ไขสำเร็จ" : r.status || "แจ้งรายงาน",
              reportDetails: r.description ? `${r.name}: ${r.description}` : (r.name || ""),
              ranger: r.parkRangerName && r.parkRangerName !== "-" ? r.parkRangerName : (r.parkName || "เจ้าหน้าที่อุทยาน"),
              startDate: dateStr,
              completedDate: "-"
            };
          });
          setReports(mapped);
          return;
        }
      } catch (err) {
        console.log("Backend reports fetch info: using local data fallback", err);
      }

      const saved = localStorage.getItem("greenpass_member_reports");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const mapped = parsed.map((r: any, idx: number) => ({
            id: String(idx + 1),
            reportDate: r.reportDate || "10/02/2567",
            category: r.category || "ทั่วไป",
            status:
              r.status === "New"
                ? "แจ้งรายงาน"
                : r.status === "InProgress"
                ? "กำลังดำเนินการ"
                : r.status === "Completed"
                ? "ดำเนินการแก้ไขสำเร็จ"
                : r.status,
            reportDetails: r.reportDetails || r.name || "",
            ranger:
              r.ranger && r.ranger !== "-"
                ? r.ranger
                : idx === 0
                ? "ใจดี มากๆ"
                : idx === 1
                ? "D3D3D3"
                : idx === 2
                ? "ใจดี มากๆ"
                : "สมชาย อังยอง",
            startDate: r.startDate || "-",
            completedDate: r.completedDate || "-"
          }));
          setReports(mapped);
        } catch (e) {
          console.error("Failed to parse reports", e);
          setReports(INITIAL_REPORTS);
        }
      } else {
        setReports(INITIAL_REPORTS);
      }
    }
    loadReports();
  }, []);

  const handleToggle = (id: string) => {
    setActiveToggles((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const totalCount = reports.length;
  const newCount = reports.filter((r) => r.status === "แจ้งรายงาน").length;
  const inProgressCount = reports.filter((r) => r.status === "กำลังดำเนินการ").length;
  const completedCount = reports.filter(
    (r) => r.status === "ดำเนินการแก้ไขสำเร็จ" || r.status === "ดำเนินการสำเร็จ"
  ).length;

  const filteredReports =
    selectedDate === "All"
      ? reports
      : reports.filter((r) => r.reportDate.startsWith(selectedDate));

  return (
    <div className="w-[98%] max-w-6xl mx-auto font-sans relative py-4 space-y-6">
      
      {/* Container หลัก */}
      <div className="bg-emerald-950/5 backdrop-blur-md border border-emerald-800/10 rounded-3xl p-6 sm:p-8 space-y-7 shadow-xl shadow-emerald-950/5">
        
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                ประวัติรายงานและข้อเสนอแนะจากนักท่องเที่ยว
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {totalCount} รายการ
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                ติดตามและจัดการสถานะรายงานเหตุฉุกเฉินความชำรุดในเขตอุทยาน
              </p>
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: รวมทั้งหมด */}
          <div className="bg-white/80 backdrop-blur border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group">
            <div>
              <p className="text-xs font-semibold text-slate-500 group-hover:text-emerald-700 transition-colors">
                จำนวนรายงานจากนักท่องเที่ยว
              </p>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
                {totalCount} <span className="text-xs font-normal text-slate-400">รายการ</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: แจ้งรายงานใหม่ */}
          <div className="bg-white/80 backdrop-blur border border-amber-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group">
            <div>
              <p className="text-xs font-semibold text-amber-700">
                แจ้งรายงาน
              </p>
              <h3 className="text-2xl font-extrabold text-amber-800 mt-1">
                {newCount} <span className="text-xs font-normal text-amber-600/70">รายการ</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: กำลังดำเนินการ */}
          <div className="bg-white/80 backdrop-blur border border-sky-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group">
            <div>
              <p className="text-xs font-semibold text-sky-700">
                กำลังดำเนินการ
              </p>
              <h3 className="text-2xl font-extrabold text-sky-800 mt-1">
                {inProgressCount} <span className="text-xs font-normal text-sky-600/70">รายการ</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          {/* Card 4: ดำเนินการสำเร็จ */}
          <div className="bg-white/80 backdrop-blur border border-emerald-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group">
            <div>
              <p className="text-xs font-semibold text-emerald-700">
                ดำเนินการสำเร็จ
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-800 mt-1">
                {completedCount} <span className="text-xs font-normal text-emerald-600/70">รายการ</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 p-3.5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>กรองข้อมูลตามวันที่:</span>
          </div>

          <div className="relative inline-flex items-center">
            <Calendar className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer appearance-none shadow-sm"
            >
              <option value="All">ทุกวันที่ (แสดงทั้งหมด)</option>
              <option value="10/02">10 กุมภาพันธ์ 2567</option>
              <option value="15/02">15 กุมภาพันธ์ 2567</option>
              <option value="25/02">25 กุมภาพันธ์ 2567</option>
              <option value="27/02">27 กุมภาพันธ์ 2567</option>
            </select>
            <div className="absolute right-2.5 pointer-events-none text-slate-400 text-[10px]">
              ▼
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              
              {/* Header */}
              <thead>
                <tr className="bg-slate-800 text-slate-100 font-semibold border-b border-slate-700">
                  <th className="py-3.5 px-4 w-16 text-center">ลำดับ</th>
                  <th className="py-3.5 px-4 w-36">วันที่แจ้งรายงาน</th>
                  <th className="py-3.5 px-4 w-44">สถานะ</th>
                  <th className="py-3.5 px-4 w-48">เจ้าหน้าที่ผู้รับผิดชอบ</th>
                  <th className="py-3.5 px-4 min-w-[260px] text-center">รายละเอียดเหตุการณ์</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      ไม่พบข้อมูลรายงานตามวันที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    return (
                      <tr
                        key={report.id}
                        className="hover:bg-emerald-50/40 transition-colors duration-150 group"
                      >
                        
                        {/* ลำดับ */}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 inline-flex items-center justify-center text-xs group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                            {report.id}
                          </span>
                        </td>

                        {/* วันที่แจ้งรายงาน */}
                        <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>วันที่ {report.reportDate}</span>
                          </div>
                        </td>

                        {/* สถานะ */}
                        <td className="py-3.5 px-4">
                          {report.status === "แจ้งรายงาน" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                              {report.status}
                            </span>
                          ) : report.status === "กำลังดำเนินการ" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                              <span className="w-2 h-2 rounded-full bg-sky-500" />
                              {report.status}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              {report.status}
                            </span>
                          )}
                        </td>

                        {/* เจ้าหน้าที่ผู้รับผิดชอบ */}
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                              <UserCheck className="w-3.5 h-3.5" />
                            </div>
                            <span className="whitespace-pre-line">{report.ranger}</span>
                          </div>
                        </td>

                        {/* รายละเอียดเหตุการณ์ */}
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="space-y-1.5">
                            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-slate-800 text-xs font-medium leading-relaxed shadow-2xs">
                              {report.reportDetails}
                            </div>
                            <Link
                              href={`/ranger/view-report-member-detail?id=${report.id}`}
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>แก้ไขสถานะ/ดูเพิ่มเติม &gt;</span>
                            </Link>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}

