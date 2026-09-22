"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { reportApi, replyReportApi, getBaseURL } from "@/service/api";
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
  ShieldCheck, 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  X, 
  History, 
  MessageSquare, 
  Lock, 
  User, 
  Phone, 
  ZoomIn, 
  AlertTriangle 
} from "lucide-react";

interface MemberReport {
  id: string;
  reportDate: string;
  reportTime?: string;
  category: string;
  status: string;
  name?: string;
  description?: string;
  reportDetails: string;
  ranger: string;
  rangerUsername?: string | null;
  reporterName?: string;
  reporterPhone?: string;
  parkName?: string;
  image?: string | null;
  startDate: string;
  completedDate: string;
  isSevere?: boolean;
}

const getTodayThaiDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear() + 543;
  return `${day}/${month}/${year}`;
};

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
    rangerUsername: "ranger01",
    reporterName: "สมชาย รักธรรมชาติ",
    reporterPhone: "081-234-5678",
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
    rangerUsername: "ranger02",
    reporterName: "วิภาภรณ์ แจ่มใส",
    reporterPhone: "089-876-5432",
    parkName: "อุทยานแห่งชาติเขาใหญ่",
    image: "https://images.unsplash.com/photo-1511497584788-876761c139ab?auto=format&fit=crop&w=600&q=80",
    startDate: "15/02/2567",
    completedDate: "-"
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
  const [progressText, setProgressText] = useState("");
  const [progressImage, setProgressImage] = useState<string | null>(null);
  const [replyHistory, setReplyHistory] = useState<any[]>([]);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canProgressReport, setCanProgressReport] = useState(true);
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);

  const [currentLoggedInUsername, setCurrentLoggedInUsername] = useState<string>("");
  const [currentLoggedInName, setCurrentLoggedInName] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("ranger_username") || localStorage.getItem("username") || "";
      const n = localStorage.getItem("ranger_name") || u;
      setCurrentLoggedInUsername(u);
      setCurrentLoggedInName(n);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("ขนาดไฟล์รูปภาพต้องไม่เกิน 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProgressImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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

            // ดึงชื่อและเบอร์โทรของผู้แจ้งที่เป็นประชาชน
            const reporterFullName = data.user 
              ? (`${data.user.firstname || ''} ${data.user.surname || ''}`.trim() || data.user.username) 
              : "ผู้ใช้งาน GreenPass";
            const reporterPhone = data.user?.mobilephone || "-";

            // ดึงข้อมูลเจ้าหน้าที่ผู้รับผิดชอบรายงาน
            let assignedRangerFullName: string | null = null;
            let assignedRangerUsername: string | null = null;

            if (data.parkRanger) {
              assignedRangerFullName = (`${data.parkRanger.firstname || ''} ${data.parkRanger.surname || ''}`.trim()) || data.parkRanger.username;
              assignedRangerUsername = data.parkRanger.username;
            } else if (data.parkRangerName && data.parkRangerName !== "-" && data.parkRangerName !== "ยังไม่มีผู้รับผิดชอบ") {
              assignedRangerFullName = data.parkRangerName;
              assignedRangerUsername = data.parkRangerUsername || null;
            }

            // ดึงประวัติ ReplyReport
            try {
              const replyRes = await replyReportApi.getReplyReports(Number(reportId));
              if (replyRes && replyRes.success && Array.isArray(replyRes.result || replyRes.data)) {
                const logs = replyRes.result || replyRes.data;
                setReplyHistory(logs);
                const lastLog = logs[logs.length - 1];
                if (lastLog && lastLog.progress && !lastLog.progress.startsWith("Status updated to")) {
                  setProgressText(lastLog.progress);
                }
                // หากใน Report ยังไม่มี rangerUsername ให้ตรวจสอบจากประวัติ Reply
                if (!assignedRangerUsername) {
                  for (const l of logs) {
                    if (l.parkRangerUsername) {
                      assignedRangerUsername = l.parkRangerUsername;
                      assignedRangerFullName = l.parkRangerName || l.parkRangerUsername;
                      break;
                    } else if (l.parkRangerName && l.parkRangerName !== "-") {
                      assignedRangerFullName = l.parkRangerName;
                      break;
                    }
                  }
                }
              }
            } catch (e) {
              console.log("No reply report history found", e);
            }

            const typeNameStr = data.type?.typeName || data.typeName || "ปกติ";
            const isSevere = data.type?.typeId === 2 || typeNameStr.includes("ร้ายแรง") || typeNameStr.includes("ฉุกเฉิน");

            const backendReport: MemberReport = {
              id: String(data.reportId || reportId),
              reportDate: dateStr,
              reportTime: data.reportTime || "",
              category: typeNameStr,
              status: currentStatusStr,
              name: data.name || "รายงานความชำรุด/เหตุฉุกเฉิน",
              description: data.description || "",
              reportDetails: data.description ? `${data.name}: ${data.description}` : (data.name || ""),
              ranger: assignedRangerFullName || "ยังไม่มีผู้รับผิดชอบ",
              rangerUsername: assignedRangerUsername,
              reporterName: reporterFullName,
              reporterPhone: reporterPhone,
              parkName: data.park ? data.park.name : "อุทยานแห่งชาติ",
              image: data.image || null,
              startDate: isInProgress ? dateStr : "-",
              completedDate: isCompleted ? getTodayThaiDate() : "-",
              isSevere: isSevere
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

  // 🔒 ตรวจสอบสิทธิ์การเป็นเจ้าหน้าที่ผู้รับผิดชอบงาน
  const isAssignedToOther = Boolean(
    currentReport?.rangerUsername &&
    currentLoggedInUsername &&
    currentReport.rangerUsername.toLowerCase() !== currentLoggedInUsername.toLowerCase()
  );

  const isAssignedToMe = Boolean(
    currentReport?.rangerUsername &&
    currentLoggedInUsername &&
    currentReport.rangerUsername.toLowerCase() === currentLoggedInUsername.toLowerCase()
  );

  const isUnassigned = !currentReport?.rangerUsername || currentReport.ranger === "ยังไม่มีผู้รับผิดชอบ";

  const handleStatusChange = (newStatus: string) => {
    if (!canProgressReport) return;

    if (isAssignedToOther) {
      setError(`🔒 รายงานนี้อยู่ภายใต้ความรับผิดชอบของ ${currentReport?.ranger} แล้ว คุณไม่สามารถดำเนินการแทนได้`);
      return;
    }

    // 🛑 ตรวจสอบการข้ามขั้นตอน: หากสถานะเดิมคือ "แจ้งรายงาน" จะไม่อนุญาตให้เลือก "ดำเนินการแก้ไขสำเร็จ" โดยตรง
    const isOriginalPending = currentReport?.status === "แจ้งรายงาน" || currentReport?.status === "Pending";
    if (isOriginalPending && newStatus === "ดำเนินการแก้ไขสำเร็จ") {
      setError("ต้องเปลี่ยนสถานะเป็น 'กำลังดำเนินการ' ก่อนเท่านั้น จึงจะสามารถเลือก 'ดำเนินการแก้ไขสำเร็จ' ได้");
      return;
    }

    setError("");
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

    if (isAssignedToOther) {
      setError(`🔒 รายงานนี้อยู่ภายใต้ความรับผิดชอบของ ${currentReport?.ranger} แล้ว คุณไม่สามารถดำเนินการแทนได้`);
      return;
    }

    setError("");
    setSuccess("");

    if (!status) {
      setError("กรุณาเลือกสถานะ");
      return;
    }

    const isOriginalPending = currentReport?.status === "แจ้งรายงาน" || currentReport?.status === "Pending";
    if (isOriginalPending && status === "ดำเนินการแก้ไขสำเร็จ") {
      setError("ไม่สามารถข้ามขั้นตอนได้! ต้องเปลี่ยนสถานะเป็น 'กำลังดำเนินการ' ก่อนเท่านั้น");
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
        const res = await reportApi.updateReportStatus(
          Number(reportId), 
          backendStatus, 
          rangerUsername, 
          progressText || `อัปเดตสถานะเป็น ${status}`, 
          progressImage || undefined
        );
        if (res && res.success === false) {
          setError(res.message || "ไม่สามารถบันทึกข้อมูลได้");
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(false);
      setSuccess(
        isUnassigned
          ? `รับเรื่องและบันทึกสถานะเป็น "${status}" เรียบร้อย คุณเป็นผู้รับผิดชอบรายงานนี้แล้ว`
          : "บันทึกและอัปเดตสถานะรายงานเรียบร้อย"
      );

      setTimeout(() => {
        router.push("/ranger/list-report-member");
      }, 1300);
    } catch (err: any) {
      setIsLoading(false);
      const errMsg = err?.response?.data?.message || err?.message || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง";
      setError(errMsg);
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

  const reportResolvedImg = resolveReportImageUrl(currentReport.image);

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 font-sans py-4">
      
      {/* Header back bar */}
      <div className="flex justify-between items-center text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">รหัสรายงาน:</span>
          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
            #{currentReport.id}
          </span>
        </div>
        <button 
          onClick={() => router.push("/ranger/list-report-member")}
          className="text-slate-500 hover:text-slate-700 font-bold cursor-pointer flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับไปหน้ารายการ</span>
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

      {/* 🔒 Ownership Lock Alert Banner: แสดงเมื่อมีเจ้าหน้าที่ท่านอื่นรับผิดชอบแล้ว */}
      {isAssignedToOther && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-3xl text-amber-900 shadow-sm flex items-start gap-3.5 animate-fade-in">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400/50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-amber-950">
                🔒 รายงานนี้มีเจ้าหน้าที่ผู้รับผิดชอบแล้ว:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 shadow-2xs">
                👤 {currentReport.ranger}
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              คุณกำลังเข้าสู่ระบบในชื่อ <span className="font-bold text-slate-800">{currentLoggedInName || currentLoggedInUsername}</span> จึงสามารถ **ดูข้อมูลได้เท่านั้น (Read-Only)** และไม่สามารถเปลี่ยนสถานะหรือรับเรื่องแทนได้
            </p>
          </div>
        </div>
      )}

      {/* CARD 1: ข้อมูลการแจ้งรายงานจากประชาชน (Citizen Report Overview) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                รายละเอียดเหตุการณ์ที่ได้รับแจ้ง
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ข้อมูลการแจ้งเหตุจากประชาชนผู้ใช้งานแอปพลิเคชัน GreenPass
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {currentReport.isSevere ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 border border-rose-300 shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                ระดับ: ร้ายแรง / ฉุกเฉิน
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ระดับ: ปกติ
              </span>
            )}

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              currentReport.status === "แจ้งรายงาน"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : currentReport.status === "กำลังดำเนินการ"
                ? "bg-sky-50 text-sky-700 border-sky-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                currentReport.status === "แจ้งรายงาน" ? "bg-amber-500 animate-ping" : currentReport.status === "กำลังดำเนินการ" ? "bg-sky-500" : "bg-emerald-500"
              }`} />
              สถานะปัจจุบัน: {currentReport.status}
            </span>
          </div>
        </div>

        {/* Report Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                หัวข้อรายงาน
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {currentReport.name}
              </h3>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                รายละเอียดสิ่งที่ได้รับแจ้ง
              </span>
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-xs font-medium text-slate-700 leading-relaxed shadow-2xs">
                {currentReport.description || currentReport.reportDetails || "ไม่มีรายละเอียดเพิ่มเติม"}
              </div>
            </div>

            {/* Reporter & Location Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  ผู้แจ้งเรื่อง
                </span>
                <p className="font-bold text-slate-800">{currentReport.reporterName || "ผู้ใช้งาน GreenPass"}</p>
                {currentReport.reporterPhone && currentReport.reporterPhone !== "-" && (
                  <p className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>เบอร์โทร: {currentReport.reporterPhone}</span>
                  </p>
                )}
              </div>

              <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  สถานที่ & เวลาที่แจ้ง
                </span>
                <p className="font-bold text-slate-800">{currentReport.parkName || "อุทยานแห่งชาติ"}</p>
                <p className="text-slate-500 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{currentReport.reportDate} {currentReport.reportTime ? `(${currentReport.reportTime})` : ''}</span>
                </p>
              </div>
            </div>

            {/* Officer in charge badge */}
            <div className="p-3.5 rounded-2xl border flex items-center justify-between text-xs font-medium transition-all shadow-2xs"
              style={{
                backgroundColor: isUnassigned ? "#fffbeb" : isAssignedToMe ? "#ecfdf5" : "#f8fafc",
                borderColor: isUnassigned ? "#fde68a" : isAssignedToMe ? "#a7f3d0" : "#e2e8f0"
              }}>
              <div className="flex items-center gap-2">
                <UserCheck className={`w-4 h-4 ${isUnassigned ? "text-amber-600" : isAssignedToMe ? "text-emerald-600" : "text-slate-500"}`} />
                <span className="font-bold text-slate-700">เจ้าหน้าที่ผู้รับผิดชอบ:</span>
                <span className={`font-bold ${isUnassigned ? "text-amber-800" : isAssignedToMe ? "text-emerald-800" : "text-slate-800"}`}>
                  {currentReport.ranger}
                </span>
              </div>
              <div>
                {isUnassigned ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                    พร้อมรับเรื่อง
                  </span>
                ) : isAssignedToMe ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    คุณเป็นผู้รับผิดชอบ
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-300">
                    🔒 เจ้าหน้าที่ท่านอื่น
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Citizen Photo Preview */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              รูปภาพหลักฐานที่ประชาชนแนบมา
            </span>
            {reportResolvedImg ? (
              <div 
                onClick={() => setSelectedZoomImage(reportResolvedImg)}
                className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group cursor-pointer bg-slate-100 hover:border-emerald-500 transition-all"
                title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
              >
                <img 
                  src={reportResolvedImg} 
                  alt="รูปภาพแจ้งเหตุจากประชาชน" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-3 text-white">
                  <div className="flex items-center gap-1.5 text-xs font-bold bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-xs">
                    <ZoomIn className="w-4 h-4 text-emerald-400" />
                    <span>คลิกดูรูปขยายใหญ่</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-56 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
                <ImageIcon className="w-8 h-8 text-slate-300" />
                <span className="text-xs font-medium">ไม่มีรูปภาพประกอบจากผู้แจ้ง</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CARD 2: Form จัดการและบันทึกความคืบหน้า (Progress Management Form) */}
      <form 
        onSubmit={handleUpdate} 
        className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden"
      >
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                จัดการและบันทึกความคืบหน้า
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ปรับเปลี่ยนสถานะการดำเนินงานสำหรับเจ้าหน้าที่
              </p>
            </div>
          </div>
        </div>

        {/* Read-Only Notices */}
        {isAssignedToOther ? (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
            <span className="text-base">🔒</span>
            <span>รายงานนี้ถูกล็อกสิทธิ์: มีเจ้าหน้าที่ {currentReport.ranger} เป็นผู้รับผิดชอบแล้ว (โหมดอ่านอย่างเดียว)</span>
          </div>
        ) : !canProgressReport ? (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
            <span className="text-base">🔒</span>
            <span>คุณเข้าใช้งานในโหมดอ่านอย่างเดียว (ไม่มีสิทธิ์บันทึกความคืบหน้า)</span>
          </div>
        ) : isUnassigned ? (
          <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-sky-800 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
            <span className="text-base">ℹ️</span>
            <span>รายงานนี้ยังไม่มีผู้รับผิดชอบ เมื่อคุณกดปรับสถานะ ระบบจะบันทึกคุณ (<span className="font-bold">{currentLoggedInName || currentLoggedInUsername}</span>) เป็นผู้รับผิดชอบงานนี้ทันที</span>
          </div>
        ) : null}

        {/* Grid for Dates & Responsible info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Field 1: วันที่รับแจ้ง */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              วันที่รับแจ้งในระบบ
            </label>
            <div className="bg-slate-50 border border-slate-200 text-slate-600 px-4 py-3 rounded-2xl text-xs font-semibold shadow-sm">
              {currentReport.reportDate}
            </div>
          </div>

          {/* Field 2: ผู้รับผิดชอบรายงาน */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              เจ้าหน้าที่ผู้รับผิดชอบ
            </label>
            <div className="bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-2xl text-xs font-bold shadow-sm flex items-center justify-between">
              <span>{isUnassigned ? `จะถูกมอบหมายให้ "${currentLoggedInName || currentLoggedInUsername}" เมื่อกดรับเรื่อง` : currentReport.ranger}</span>
              {isAssignedToOther && <span className="text-xs text-amber-600 font-bold">🔒 ไม่ใช่บัญชีของคุณ</span>}
            </div>
          </div>
        </div>

        {/* Field 3: สถานะดรอปดาวน์ */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            สถานะการดำเนินงาน <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={status}
              disabled={!canProgressReport || isAssignedToOther}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`w-full bg-slate-50 text-slate-800 text-xs font-bold px-4 py-3 rounded-2xl border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none cursor-pointer appearance-none pr-10 transition-all shadow-sm ${
                (!canProgressReport || isAssignedToOther) ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''
              }`}
            >
              <option value="แจ้งรายงาน" className="bg-white text-slate-800">
                แจ้งรายงาน
              </option>
              <option value="กำลังดำเนินการ" className="bg-white text-slate-800">
                กำลังดำเนินการ
              </option>
              <option 
                value="ดำเนินการแก้ไขสำเร็จ" 
                disabled={currentReport?.status === "แจ้งรายงาน" || currentReport?.status === "Pending"} 
                className={(currentReport?.status === "แจ้งรายงาน" || currentReport?.status === "Pending") ? "bg-slate-100 text-slate-400 font-normal" : "bg-white text-slate-800"}
              >
                ดำเนินการแก้ไขสำเร็จ {(currentReport?.status === "แจ้งรายงาน" || currentReport?.status === "Pending") ? "🔒 (ต้องเปลี่ยนเป็นกำลังดำเนินการก่อน)" : ""}
              </option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Field 4: วันที่เริ่มดำเนินการ */}
        {(status === "กำลังดำเนินการ" || status === "ดำเนินการแก้ไขสำเร็จ") && (
          <div className="space-y-1.5 animate-fade-in">
            <label className="block text-xs font-bold text-slate-700">
              วันที่เริ่มเข้าดำเนินการ
            </label>
            <input
              type="text"
              disabled={!canProgressReport || isAssignedToOther}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="เช่น 28/08/2569"
              className={`w-full bg-slate-50 text-slate-800 text-xs font-semibold px-4 py-3 rounded-2xl border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all shadow-sm ${
                (!canProgressReport || isAssignedToOther) ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''
              }`}
            />
          </div>
        )}

        {/* Field 5: วันที่ดำเนินการสำเร็จ */}
        {status === "ดำเนินการแก้ไขสำเร็จ" && (
          <div className="space-y-1.5 animate-fade-in">
            <label className="block text-xs font-bold text-slate-700">
              วันที่ดำเนินการแก้ไขสำเร็จ
            </label>
            <input
              type="text"
              disabled={!canProgressReport || isAssignedToOther}
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
              placeholder="เช่น 28/08/2569"
              className={`w-full bg-slate-50 text-slate-800 text-xs font-semibold px-4 py-3 rounded-2xl border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all shadow-sm ${
                (!canProgressReport || isAssignedToOther) ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''
              }`}
            />
          </div>
        )}

        {/* Field 6: รายละเอียดความคืบหน้า / การแก้ไขงาน */}
        <div className="space-y-1.5 animate-fade-in">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            รายละเอียดความคืบหน้า / ผลการดำเนินการแก้ไข <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            disabled={!canProgressReport || isAssignedToOther}
            value={progressText}
            onChange={(e) => setProgressText(e.target.value)}
            placeholder="ระบุรายละเอียดสิ่งที่ได้ดำเนินการแก้ไขไปแล้วจากที่ผู้ใช้แจ้ง เช่น ได้ทำการซ่อมแซมจุดที่ชำรุด และทำความสะอาดพื้นที่เรียบร้อยแล้ว..."
            className={`w-full bg-slate-50 text-slate-800 text-xs font-medium p-4 rounded-2xl border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all shadow-sm resize-none ${
              (!canProgressReport || isAssignedToOther) ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''
            }`}
          />
        </div>

        {/* Field 7: รูปภาพประกอบการดำเนินงาน */}
        <div className="space-y-1.5 animate-fade-in">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            รูปภาพประกอบการแก้ไข / หลักฐานผลการดำเนินงาน
          </label>
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              disabled={!canProgressReport || isAssignedToOther}
              onChange={handleImageUpload}
              className="hidden"
              id="progress-image-upload"
            />
            <div className="flex items-center gap-3">
              <label
                htmlFor="progress-image-upload"
                className={`px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-2 shadow-sm ${
                  (!canProgressReport || isAssignedToOther) ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
                }`}
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>แนบไฟล์รูปภาพ</span>
              </label>
              {progressImage && !isAssignedToOther && (
                <button
                  type="button"
                  onClick={() => setProgressImage(null)}
                  className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  ลบรูปภาพ
                </button>
              )}
            </div>
            {progressImage && (
              <div 
                onClick={() => setSelectedZoomImage(progressImage)}
                className="relative w-44 h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer group"
                title="คลิกดูรูปใหญ่"
              >
                <img src={progressImage} alt="Progress evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                  <ZoomIn className="w-4 h-4 mr-1" /> ดูรูปใหญ่
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/ranger/list-report-member")}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold rounded-2xl cursor-pointer transition-all flex items-center gap-2 hover:shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับ
          </button>
          
          {isAssignedToOther ? (
            <button
              type="button"
              disabled
              className="px-6 py-3 bg-amber-50 text-amber-700 border border-amber-300 text-xs font-bold rounded-2xl flex items-center gap-2 cursor-not-allowed shadow-inner"
              title={`รายงานนี้อยู่ภายใต้ความรับผิดชอบของ ${currentReport.ranger} แล้ว`}
            >
              <Lock className="w-4 h-4 text-amber-600" />
              <span>สงวนสิทธิ์เฉพาะผู้รับผิดชอบ ({currentReport.ranger})</span>
            </button>
          ) : !canProgressReport ? (
            <button
              type="button"
              disabled
              className="px-6 py-3 bg-slate-100 text-slate-400 border border-slate-200 text-xs font-bold rounded-2xl flex items-center gap-2 cursor-not-allowed"
            >
              <span>🔒 โหมดอ่านอย่างเดียว</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4 stroke-[3]" />
              )}
              <span>{isUnassigned ? "รับเรื่องและบันทึกสถานะ" : "บันทึกข้อมูลการอัปเดต"}</span>
            </button>
          )}
        </div>

      </form>

      {/* Reply Progress History Section */}
      {replyHistory.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
            <History className="w-4 h-4 text-emerald-600" />
            <span>ประวัติการบันทึกความคืบหน้า ({replyHistory.length})</span>
          </div>
          <div className="space-y-4">
            {replyHistory.map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-500 font-medium">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                    {item.currentStatus === "Pending" ? "แจ้งรายงาน" : item.currentStatus === "InProgress" ? "กำลังดำเนินการ" : item.currentStatus === "Completed" ? "ดำเนินการแก้ไขสำเร็จ" : item.currentStatus}
                  </span>
                  <span className="text-slate-400">
                    {item.updateDate} {item.updateTime ? `(${item.updateTime})` : ''} {item.parkRangerName ? `• เจ้าหน้าที่: ${item.parkRangerName}` : ''}
                  </span>
                </div>
                {item.progress && (
                  <div className="text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="font-bold text-slate-800 block mb-1">รายละเอียดความคืบหน้า:</span>
                    {item.progress}
                  </div>
                )}
                {item.image && (
                  <div className="pt-1">
                    <span className="font-semibold text-slate-700 block mb-1.5">หลักฐานประกอบ:</span>
                    <div 
                      onClick={() => setSelectedZoomImage(resolveReportImageUrl(item.image))}
                      className="w-44 h-32 rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-500 transition-colors"
                      title="คลิกดูรูปใหญ่"
                    >
                      <img src={resolveReportImageUrl(item.image)!} alt="Progress history image" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {selectedZoomImage && (
        <div 
          onClick={() => setSelectedZoomImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-2"
          >
            <button 
              onClick={() => setSelectedZoomImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={selectedZoomImage} 
              alt="Zoomed Image" 
              className="max-h-[82vh] w-auto object-contain rounded-2xl mx-auto" 
            />
          </div>
        </div>
      )}

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
