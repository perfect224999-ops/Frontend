"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { reportApi } from "@/service/api";
import { 
  Calendar, 
  Check, 
  ArrowLeft, 
  ChevronDown, 
  Clock, 
  AlertCircle,
  MapPin,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from "lucide-react";

interface MemberReport {
  id: string;
  reportDate: string;
  category: string;
  status: string;
  name?: string;
  description?: string;
  reportDetails: string;
  ranger: string;
  parkName?: string;
  image?: string | null;
  startDate: string;
  completedDate: string;
}

const getTodayThaiDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear() + 543;
  return `${day}/${month}/${year}`;
};

const INITIAL_REPORTS: MemberReport[] = [
  {
    id: "1",
    reportDate: "10/02/2567",
    category: "ขยะสิ่งแวดล้อม",
    status: "แจ้งรายงาน",
    name: "พบขยะและเศษแก้ว",
    description: "พบเจอขยะพลาสติกและเศษขวดแก้วจำนวนมากบริเวณจุดชมวิวทางขึ้นอุทยาน",
    reportDetails: "พบเจอขยะพลาสติกและเศษขวดแก้วจำนวนมากบริเวณจุดชมวิวทางขึ้นอุทยาน",
    ranger: "ใจดี มากๆ",
    parkName: "อุทยานแห่งชาติเขาใหญ่",
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
    startDate: "10/02/2567",
    completedDate: "-"
  },
  {
    id: "2",
    reportDate: "15/02/2567",
    category: "ความสะอาด",
    status: "แจ้งรายงาน",
    name: "กิ่งไม้ล้มขวางทาง",
    description: "พบกิ่งไม้ขนาดใหญ่ล้มขวางเส้นทางศึกษาธรรมชาติกิโลเมตรที่ 4",
    reportDetails: "พบกิ่งไม้ขนาดใหญ่ล้มขวางเส้นทางศึกษาธรรมชาติกิโลเมตรที่ 4",
    ranger: "D3D3D3",
    parkName: "อุทยานแห่งชาติเขาใหญ่",
    image: "https://images.unsplash.com/photo-1511497584788-876761c139ab?auto=format&fit=crop&w=600&q=80",
    startDate: "15/02/2567",
    completedDate: "-"
  },
  {
    id: "3",
    reportDate: "25/02/2567",
    category: "สาธารณูปโภค",
    status: "กำลังดำเนินการ",
    name: "ท่อน้ำรั่วซึม",
    description: "ท่อน้ำรั่วซึมบริเวณใกล้ห้องน้ำสาธารณะจุดกางเต็นท์ลำตะคอง",
    reportDetails: "ท่อน้ำรั่วซึมบริเวณใกล้ห้องน้ำสาธารณะจุดกางเต็นท์ลำตะคอง",
    ranger: "ใจดี มากๆ",
    parkName: "อุทยานแห่งชาติเขาใหญ่",
    image: null,
    startDate: "25/02/2567",
    completedDate: "-"
  },
  {
    id: "4",
    reportDate: "27/02/2567",
    category: "ป้ายเตือน",
    status: "ดำเนินการแก้ไขสำเร็จ",
    name: "ป้ายเตือนชำรุด",
    description: "ป้ายเตือนระวังช้างป่าล้มชำรุดเสียหายบริเวณกิโลเมตรที่ 12",
    reportDetails: "ป้ายเตือนระวังช้างป่าล้มชำรุดเสียหายบริเวณกิโลเมตรที่ 12",
    ranger: "สมชาย อังยอง",
    parkName: "อุทยานแห่งชาติเขาใหญ่",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
    startDate: "27/02/2567",
    completedDate: "27/02/2567"
  }
];

function ViewReportMemberDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id");

  const [reports, setReports] = useState<MemberReport[]>([]);
  const [currentReport, setCurrentReport] = useState<MemberReport | null>(null);

  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [completedDate, setCompletedDate] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canProgressReport, setCanProgressReport] = useState(true);

  useEffect(() => {
    const savedRoles = typeof window !== "undefined" ? localStorage.getItem("ranger_roles") : null;
    if (savedRoles) {
      try {
        const parsed = JSON.parse(savedRoles);
        if (Array.isArray(parsed)) {
          setCanProgressReport(parsed.includes("รายงานความคืบหน้าของเหตุการณ์"));
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    async function loadReport() {
      if (reportId && !isNaN(Number(reportId))) {
        try {
          const res = await reportApi.getReportById(Number(reportId));
          const data = res && res.success ? (res.result || res.data) : null;
          if (data) {
            let dateStr = data.reportDate || getTodayThaiDate();
            if (dateStr.includes("-")) {
              const [y, m, d] = dateStr.split("-");
              dateStr = `${d}/${m}/${Number(y) + 543}`;
            }

            const currentStatusStr = data.status === "Pending" ? "แจ้งรายงาน" : data.status === "InProgress" ? "กำลังดำเนินการ" : data.status === "Completed" ? "ดำเนินการแก้ไขสำเร็จ" : data.status || "แจ้งรายงาน";
            const isCompleted = currentStatusStr === "ดำเนินการแก้ไขสำเร็จ";
            const isInProgress = currentStatusStr === "กำลังดำเนินการ" || isCompleted;

            const backendReport: MemberReport = {
              id: String(data.reportId || reportId),
              reportDate: dateStr,
              category: "ทั่วไป",
              status: currentStatusStr,
              name: data.name || "รายงานความชำรุด/เหตุฉุกเฉิน",
              description: data.description || "",
              reportDetails: data.description ? `${data.name}: ${data.description}` : (data.name || ""),
              ranger: data.user ? (`${data.user.firstname || ''} ${data.user.surname || ''}`.trim() || data.user.username) : "-",
              parkName: data.park ? data.park.name : "อุทยานแห่งชาติ",
              image: data.image || null,
              startDate: isInProgress ? dateStr : "-",
              completedDate: isCompleted ? getTodayThaiDate() : "-"
            };
            setCurrentReport(backendReport);
            setStatus(backendReport.status);
            setStartDate(backendReport.startDate);
            setCompletedDate(backendReport.completedDate);
            return;
          }
        } catch (err) {
          console.log("Backend report fetch info: using local data fallback", err);
        }
      }

      const saved = localStorage.getItem("greenpass_member_reports");
      let allReports: MemberReport[] = [];
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          allReports = parsed.map((r: any, idx: number) => ({
            id: String(idx + 1),
            reportDate: r.reportDate || "10/02/2567",
            category: r.category || "ทั่วไป",
            status: r.status === "New" ? "แจ้งรายงาน" : r.status === "InProgress" ? "กำลังดำเนินการ" : r.status === "Completed" ? "ดำเนินการแก้ไขสำเร็จ" : r.status,
            name: r.name || "รายงานเหตุการณ์",
            description: r.reportDetails || r.description || "",
            reportDetails: r.reportDetails || r.description || "",
            ranger: r.ranger && r.ranger !== "-" ? r.ranger : (idx === 0 ? "ใจดี มากๆ" : idx === 1 ? "D3D3D3" : idx === 2 ? "ใจดี มากๆ" : "สมชาย อังยอง"),
            parkName: "อุทยานแห่งชาติ",
            image: r.image || null,
            startDate: r.startDate || "10/02/2567",
            completedDate: r.completedDate || "-"
          }));
        } catch (e) {
          console.error("Failed to parse reports", e);
          allReports = INITIAL_REPORTS;
        }
      } else {
        allReports = INITIAL_REPORTS;
      }
      setReports(allReports);

      const found = allReports.find(r => r.id === reportId);
      if (found) {
        setCurrentReport(found);
        setStatus(found.status);
        const isComp = found.status === "ดำเนินการแก้ไขสำเร็จ";
        const isProg = found.status === "กำลังดำเนินการ" || isComp;
        setStartDate(isProg ? (found.startDate === "-" ? getTodayThaiDate() : found.startDate) : "-");
        setCompletedDate(isComp ? (found.completedDate === "-" ? getTodayThaiDate() : found.completedDate) : "-");
      }
    }
    loadReport();
  }, [reportId]);

  const handleStatusChange = (newStatus: string) => {
    if (!canProgressReport) return;
    setStatus(newStatus);
    const todayStr = getTodayThaiDate();

    if (newStatus === "แจ้งรายงาน") {
      setStartDate("-");
      setCompletedDate("-");
    } else if (newStatus === "กำลังดำเนินการ") {
      if (!startDate || startDate === "-") {
        setStartDate(todayStr);
      }
      setCompletedDate("-");
    } else if (newStatus === "ดำเนินการแก้ไขสำเร็จ") {
      if (!startDate || startDate === "-") {
        setStartDate(todayStr);
      }
      setCompletedDate(todayStr);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProgressReport) return;
    setError("");
    setSuccess("");

    if (!status) {
      setError("กรุณาเลือกสถานะ");
      return;
    }

    const todayStr = getTodayThaiDate();
    const finalStartDate = (status === "กำลังดำเนินการ" || status === "ดำเนินการแก้ไขสำเร็จ") 
      ? (startDate && startDate !== "-" ? startDate : todayStr) 
      : "-";
    const finalCompletedDate = status === "ดำเนินการแก้ไขสำเร็จ" 
      ? (completedDate && completedDate !== "-" ? completedDate : todayStr) 
      : "-";
    const backendStatus = status === "แจ้งรายงาน" ? "Pending" : status === "กำลังดำเนินการ" ? "InProgress" : "Completed";
    const rangerUsername = localStorage.getItem("ranger_username") || localStorage.getItem("username") || "";

    setStartDate(finalStartDate);
    setCompletedDate(finalCompletedDate);

    setIsLoading(true);
    try {
      if (reportId && !isNaN(Number(reportId))) {
        await reportApi.updateReportStatus(Number(reportId), backendStatus, rangerUsername);
      }

      setIsLoading(false);
      setSuccess("บันทึกและอัปเดตสถานะรายงานเรียบร้อย");

      setTimeout(() => {
        router.push("/ranger/list-report-member");
      }, 1200);
    } catch (err) {
      setIsLoading(false);
      setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (!currentReport) {
    return (
      <div className="w-[98%] max-w-4xl mx-auto py-12 text-center font-sans">
        <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-3xl p-8 shadow-xl max-w-md mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">ไม่พบรายละเอียดเหตุร้องเรียน</h3>
          <p className="text-xs text-slate-500">รายงานฉบับนี้อาจถูกลบหรือไม่มีอยู่ในระบบ</p>
          <button 
            onClick={() => router.push("/ranger/list-report-member")}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            กลับหน้าประวัติรายงาน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 font-sans py-4">
      
      {/* Header back bar */}
      <div className="flex justify-between items-center text-xs px-1">
        <span className="font-bold text-slate-500">รายละเอียดร้องเรียน #{currentReport.id}</span>
        <button 
          onClick={() => router.push("/ranger/list-report-member")}
          className="text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
        >
          &lt; ย้อนกลับ
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Update Progress Form */}
      <form 
        onSubmit={handleUpdate} 
        className="bg-emerald-950/95 backdrop-blur-xl border border-emerald-700/30 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-emerald-950/20 relative overflow-hidden"
      >
            {/* Background Glow Accent */}
            <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-100">
                    จัดการและบันทึกความคืบหน้า
                  </h3>
                  <p className="text-xs text-emerald-300/70 mt-0.5">
                    ปรับเปลี่ยนสถานะการดำเนินงานสำหรับเจ้าหน้าที่
                  </p>
                </div>
              </div>
            </div>

            {/* Read-Only Notice */}
            {!canProgressReport && (
              <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-200 text-xs font-semibold flex items-center gap-2.5 shadow-inner">
                <span className="text-base">🔒</span>
                <span>คุณเข้าใช้งานในโหมดอ่านอย่างเดียว (ไม่มีสิทธิ์บันทึกความคืบหน้า)</span>
              </div>
            )}

            {/* Field 1: วันที่รับแจ้ง */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                วันที่รับแจ้งในระบบ
              </label>
              <div className="bg-emerald-900/50 border border-emerald-700/40 text-emerald-100 px-4 py-3 rounded-2xl text-xs font-semibold shadow-inner">
                {currentReport.reportDate}
              </div>
            </div>

            {/* Field 2: สถานะดรอปดาวน์ */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                สถานะการดำเนินงาน <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={status}
                  disabled={!canProgressReport}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`w-full bg-slate-900/90 text-emerald-100 text-xs font-semibold px-4 py-3 rounded-2xl border border-emerald-500/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer appearance-none pr-10 transition-all shadow-md ${!canProgressReport ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <option value="แจ้งรายงาน" className="bg-slate-900 text-white">แจ้งรายงาน (Pending)</option>
                  <option value="กำลังดำเนินการ" className="bg-slate-900 text-white">กำลังดำเนินการ (InProgress)</option>
                  <option value="ดำเนินการแก้ไขสำเร็จ" className="bg-slate-900 text-white">ดำเนินการแก้ไขสำเร็จ (Completed)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field 3: วันที่เริ่มดำเนินการ */}
            {(status === "กำลังดำเนินการ" || status === "ดำเนินการแก้ไขสำเร็จ") && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="block text-xs font-semibold text-emerald-200">
                  วันที่เริ่มเข้าดำเนินการ
                </label>
                <input
                  type="text"
                  disabled={!canProgressReport}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="เช่น 28/08/2569"
                  className={`w-full bg-slate-900/90 text-emerald-100 text-xs font-semibold px-4 py-3 rounded-2xl border border-emerald-500/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all shadow-inner ${!canProgressReport ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
            )}

            {/* Field 4: วันที่ดำเนินการสำเร็จ */}
            {status === "ดำเนินการแก้ไขสำเร็จ" && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="block text-xs font-semibold text-emerald-200">
                  วันที่ดำเนินการแก้ไขสำเร็จ
                </label>
                <input
                  type="text"
                  disabled={!canProgressReport}
                  value={completedDate}
                  onChange={(e) => setCompletedDate(e.target.value)}
                  placeholder="เช่น 28/08/2569"
                  className={`w-full bg-slate-900/90 text-emerald-100 text-xs font-semibold px-4 py-3 rounded-2xl border border-emerald-500/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all shadow-inner ${!canProgressReport ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
            )}

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-emerald-800/40">
              <button
                type="button"
                onClick={() => router.push("/ranger/list-report-member")}
                className="px-5 py-3 bg-emerald-900/40 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-700/40 text-xs font-bold rounded-2xl cursor-pointer transition-all flex items-center gap-2 hover:shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                ยกเลิก / ย้อนกลับ
              </button>
              
              {canProgressReport ? (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-7 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 text-xs font-extrabold rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 stroke-[3]" />
                  )}
                  <span>บันทึกข้อมูลการอัปเดต</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-6 py-3 bg-slate-800/80 text-slate-400 border border-slate-700 text-xs font-bold rounded-2xl flex items-center gap-2 cursor-not-allowed"
                >
                  <span>🔒 โหมดอ่านอย่างเดียว</span>
                </button>
              )}
            </div>

          </form>

    </div>
  );
}

export default function ViewReportMemberDetail() {
  return (
    <Suspense fallback={
      <div className="w-full py-20 text-center text-slate-500 text-xs font-bold flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span>กำลังโหลดรายละเอียดคำร้องเรียน...</span>
      </div>
    }>
      <ViewReportMemberDetailContent />
    </Suspense>
  );
}
