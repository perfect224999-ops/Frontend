"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { reportApi, getBaseURL } from "../../../../service/api";
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
  Sparkles,
  ImageIcon,
  X,
  ZoomIn,
  Lock
} from "lucide-react";

interface ReportItem {
  id: string;
  reportDate: string;
  category: string;
  status: string;
  reportDetails: string;
  ranger: string;
  rangerUsername?: string | null;
  startDate: string;
  completedDate: string;
  image?: string | null;
  isEmergency?: boolean;
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
    completedDate: "-",
    image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "2",
    reportDate: "08/02/2567",
    category: "ถนนชำรุด",
    status: "ดำเนินการแก้ไขสำเร็จ",
    reportDetails: "ต้นไม้ล้มขวางทางขึ้นเขาเขียว กีดขวางการจราจร",
    ranger: "วรวุฒิ สมใจ",
    startDate: "08/02/2567",
    completedDate: "09/02/2567",
    image: "https://images.unsplash.com/photo-1511497584788-876761c139ab?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "3",
    reportDate: "01/02/2567",
    category: "ความปลอดภัย",
    status: "แจ้งรายงาน",
    reportDetails: "พบรอยเท้าช้างใกล้แนวรั้วร้านอาหารดงพญาเย็น",
    ranger: "สิทธา มีสุข",
    startDate: "-",
    completedDate: "-",
    image: null
  },
  {
    id: "4",
    reportDate: "25/01/2567",
    category: "สัตว์ป่ารบกวน",
    status: "ดำเนินการแก้ไขสำเร็จ",
    reportDetails: "ลิงรื้อค้นถังขยะบริเวณจุดชมวิว กม. 30",
    ranger: "วรวุฒิ สมใจ",
    startDate: "25/01/2567",
    completedDate: "26/01/2567",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"
  }
];

const resolveReportImageUrl = (img?: string | null) => {
  if (!img || img === "-" || img === "null" || img === "undefined" || img.trim() === "") {
    return null;
  }
  const trimmed = img.trim();
  if (trimmed.startsWith("data:") || trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  const baseUrl = typeof getBaseURL === "function" ? getBaseURL() : "http://localhost:8081/api/v1";
  if (trimmed.startsWith("/uploads/") || trimmed.includes("uploads/")) {
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${baseUrl}${cleanPath}`;
  }
  if (!trimmed.includes("/")) {
    return `${baseUrl}/uploads/reports/${trimmed}`;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed}`;
};

const getReportImageUrl = (item: ReportItem) => {
  if (typeof window !== "undefined" && item.id) {
    const customLocal = localStorage.getItem(`greenpass_report_img_${item.id}`);
    if (customLocal) {
      const resolved = resolveReportImageUrl(customLocal);
      if (resolved) return resolved;
    }
  }
  return resolveReportImageUrl(item.image);
};

export default function ListReportMember() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [currentRangerUser, setCurrentRangerUser] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>({
    "1": true,
    "2": true
  });
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      setFetchError(null);
      const username = localStorage.getItem("ranger_username") || localStorage.getItem("username");
      if (username) setCurrentRangerUser(username);
      const parkId = localStorage.getItem("ranger_park_id") || localStorage.getItem("parkId");
      const currentParkName = localStorage.getItem("ranger_park_name");

      try {
        let res;
        if (username) {
          res = await reportApi.getReportsForRanger(username);
        } else if (parkId) {
          res = await reportApi.getReportsByParkId(Number(parkId));
        } else {
          res = { result: [] };
        }

        const listData = res && (res.success || Array.isArray(res.result) || Array.isArray(res.data) || Array.isArray(res))
          ? (res.result || res.data || res)
          : null;

        if (Array.isArray(listData)) {
          const mapped: ReportItem[] = listData.map((r: any, idx: number) => {
            let dateStr = r.reportDate || "";
            if (dateStr.includes("-")) {
              const [y, m, d] = dateStr.split("-");
              dateStr = `${d}/${m}/${Number(y) + 543}`;
            }
            const reportIdStr = String(r.reportId || idx + 1);
            const rawImg = r.image;
            let imgVal = rawImg && rawImg !== "-" && rawImg !== "null" && rawImg !== "undefined" ? rawImg : null;
            if (!imgVal && typeof window !== "undefined") {
              imgVal = localStorage.getItem(`greenpass_report_img_${reportIdStr}`) || null;
            }
            const isUnassigned = !r.parkRangerName || r.parkRangerName === "-" || r.parkRangerName === "ยังไม่มีผู้รับผิดชอบ";
            const assignedRangerName = isUnassigned ? "ยังไม่มีผู้รับผิดชอบ" : r.parkRangerName;
            const assignedRangerUsername = r.parkRangerUsername || null;
            return {
              id: reportIdStr,
              reportDate: dateStr || "วันนี้",
              category: r.typeName || r.type?.typeName || r.category || "ปกติ",
              status: r.status === "Pending" ? "แจ้งรายงาน" : r.status === "InProgress" ? "กำลังดำเนินการ" : r.status === "Completed" ? "ดำเนินการแก้ไขสำเร็จ" : r.status || "แจ้งรายงาน",
              reportDetails: r.description ? `${r.name ? r.name + ": " : ""}${r.description}` : (r.name || ""),
              ranger: assignedRangerName,
              rangerUsername: assignedRangerUsername,
              startDate: dateStr || "-",
              completedDate: "-",
              image: imgVal
            };
          });
          setReports(mapped);
          if (typeof window !== "undefined") {
            localStorage.removeItem("greenpass_member_reports");
          }
          return;
        }
      } catch (err) {
        console.error("Backend reports fetch error:", err);
        setFetchError("ไม่สามารถดึงรายงานเหตุการจากฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      }

      // หากดึงข้อมูลจาก DB ไม่ได้จริงๆ ให้ตั้งค่าเป็นรายการว่างเปล่า หรือดึงเฉพาะรายงานจริง
      if (typeof window !== "undefined") {
        localStorage.removeItem("greenpass_member_reports");
      }
      setReports([]);
    }
    loadReports();

    // 📡 รอรับ Event จาก WebSocket เมื่อมีรายงานใหม่เข้ามา จะโหลดข้อมูลทันทีโดยไม่ต้อง Poll ยิงซ้ำๆ
    const handleReportUpdate = () => {
      console.log("📡 [ListReportMember] Received WebSocket update event -> Reloading reports");
      loadReports();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("greenpass_report_updated", handleReportUpdate);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("greenpass_report_updated", handleReportUpdate);
      }
    };
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

  const filteredReports = reports;

  return (
    <div className="w-full max-w-[1600px] mx-auto font-sans relative py-3 space-y-6 px-1 sm:px-3">

      {/* Container หลัก */}
      <div className="bg-emerald-950/5 backdrop-blur-md border border-emerald-800/10 rounded-3xl p-6 sm:p-8 space-y-7 shadow-xl shadow-emerald-950/5">

        {/* Header Title Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-emerald-900/10 pb-5">
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

        {fetchError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="text-sm font-semibold">{fetchError}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-rose-600 text-white font-medium px-3 py-1.5 rounded-lg hover:bg-rose-700 transition"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        )}

        {/* Table View */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">

              {/* Header */}
              <thead>
                <tr className="bg-slate-800 text-slate-100 font-semibold border-b border-slate-700">
                  <th className="py-3.5 px-4 w-16 text-center">ลำดับ</th>
                  <th className="py-3.5 px-4 w-36 text-center">วันที่แจ้งรายงาน</th>
                  <th className="py-3.5 px-3 w-32 text-center">ระดับเหตุการณ์</th>
                  <th className="py-3.5 px-3 w-40 text-center">รูปภาพ</th>
                  <th className="py-3.5 px-4 w-44 text-center">สถานะ</th>
                  <th className="py-3.5 px-4 w-48 text-center">เจ้าหน้าที่ผู้รับผิดชอบ</th>
                  <th className="py-3.5 px-4 min-w-[260px] text-center">รายละเอียดเหตุการณ์</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      ไม่พบข้อมูลรายงานตามวันที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report, index) => {
                    const displayIndex = String(index + 1).padStart(2, "0");
                    const isSevere = report.category === "ร้ายแรง" || report.isEmergency;
                    return (
                      <tr
                        key={report.id}
                        className="hover:bg-emerald-50/40 transition-colors duration-150 group"
                      >

                        {/* ลำดับ */}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 inline-flex items-center justify-center text-xs group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                            {displayIndex}
                          </span>
                        </td>

                        {/* วันที่แจ้งรายงาน */}
                        <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>วันที่ {report.reportDate}</span>
                          </div>
                        </td>

                        {/* ระดับเหตุการณ์ (ปกติ / ร้ายแรง) */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          {isSevere ? (
                            <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 border border-rose-300 shadow-2xs">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                              ร้ายแรง
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ปกติ
                            </span>
                          )}
                        </td>

                        {/* รูปภาพ */}
                        <td className="py-3 px-3 text-center">
                          {getReportImageUrl(report) ? (
                            <div
                              onClick={(e) => {
                                const imgEl = e.currentTarget.querySelector("img");
                                const effectiveSrc = imgEl?.currentSrc || imgEl?.src || getReportImageUrl(report);
                                if (effectiveSrc) {
                                  setSelectedImage(effectiveSrc);
                                }
                              }}
                              className="relative w-28 h-20 sm:w-32 sm:h-22 mx-auto rounded-2xl overflow-hidden border-2 border-slate-200/90 shadow-sm group cursor-pointer hover:border-emerald-500 hover:shadow-lg transition-all duration-200 bg-slate-100"
                              title="คลิกเพื่อขยายรูปภาพขนาดใหญ่"
                            >
                              <img
                                src={getReportImageUrl(report)!}
                                alt="รูปภาพรายงาน"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80";
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-1.5 text-white">
                                <div className="flex items-center gap-1 text-[11px] font-bold">
                                  <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>คลิกดูรูปใหญ่</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-28 h-20 sm:w-32 sm:h-22 mx-auto rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-1" title="ไม่มีรูปภาพ">
                              <ImageIcon className="w-5 h-5 text-slate-300" />
                              <span className="text-[10px] text-slate-400 font-medium">ไม่มีรูปภาพ</span>
                            </div>
                          )}
                        </td>

                        {/* สถานะ */}
                        <td className="py-3.5 px-4 text-center">
                          {report.isEmergency ? (
                            <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-md shadow-rose-950/20 animate-pulse border border-rose-400">
                              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                              🚨 เหตุฉุกเฉินด่วนที่สุด
                            </span>
                          ) : report.status === "แจ้งรายงาน" ? (
                            <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
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
                          {report.ranger === "ยังไม่มีผู้รับผิดชอบ" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              <span>ยังไม่มีผู้รับผิดชอบ</span>
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                report.rangerUsername && currentRangerUser && report.rangerUsername.toLowerCase() !== currentRangerUser.toLowerCase()
                                  ? "bg-slate-100 text-slate-600 border border-slate-300"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {report.rangerUsername && currentRangerUser && report.rangerUsername.toLowerCase() !== currentRangerUser.toLowerCase() ? (
                                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                                ) : (
                                  <UserCheck className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="whitespace-pre-line text-xs font-bold text-slate-800">{report.ranger}</span>
                                {report.rangerUsername && currentRangerUser && report.rangerUsername.toLowerCase() !== currentRangerUser.toLowerCase() && (
                                  <span className="text-[10px] text-slate-400 font-normal">🔒 มีผู้รับผิดชอบแล้ว</span>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* รายละเอียดเหตุการณ์ */}
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="space-y-1.5">
                            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-slate-800 text-xs font-medium leading-relaxed shadow-2xs">
                              {report.reportDetails}
                            </div>
                            <Link
                              href={`/ranger/view-report-member-detail?id=${report.id}`}
                              className={`inline-flex items-center gap-1.5 text-[11px] font-bold transition-colors ${
                                report.rangerUsername && currentRangerUser && report.rangerUsername.toLowerCase() !== currentRangerUser.toLowerCase()
                                  ? "text-slate-500 hover:text-slate-700"
                                  : "text-emerald-600 hover:text-emerald-700"
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>
                                {report.rangerUsername && currentRangerUser && report.rangerUsername.toLowerCase() !== currentRangerUser.toLowerCase()
                                  ? "ดูรายละเอียด (อ่านอย่างเดียว) >"
                                  : "อัปเดตสถานะ >"}
                              </span>
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

      {/* Image Modal Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900 text-white">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <ImageIcon className="w-4 h-4" />
                <span>รูปภาพหลักฐานการแจ้งเหตุ</span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 sm:p-4 flex items-center justify-center bg-black/50 overflow-auto min-h-[300px]">
              <img
                src={selectedImage}
                alt="รูปภาพรายงานขนาดใหญ่"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl mx-auto shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80";
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

