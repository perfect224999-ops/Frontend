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
  Lock, 
  User, 
  Phone, 
  ZoomIn 
} from "lucide-react";

// ==========================================
// 1. Interface & Types
// ==========================================
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
  const baseUrl = typeof getBaseURL === "function" ? getBaseURL() : "http://26.253.157.112:8081/api/v1";
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

  // Dates
  const [startDate, setStartDate] = useState("");
  const [completedDate, setCompletedDate] = useState("");
  
  // Progress (กำลังดำเนินการ) notes and images
  const [progressText, setProgressText] = useState("");
  const [progressImage, setProgressImage] = useState<string | null>(null);

  // Completion (ดำเนินการแก้ไขสำเร็จ) notes and images
  const [completedText, setCompletedText] = useState("");
  const [completedImage, setCompletedImage] = useState<string | null>(null);

  // Status select dropdown fields
  const [step2Status, setStep2Status] = useState("กำลังดำเนินการ");
  const [step3Status, setStep3Status] = useState("ดำเนินการแก้ไขสำเร็จ");

  const [replyHistory, setReplyHistory] = useState<any[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "progress" | "completed") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("ขนาดไฟล์รูปภาพต้องไม่เกิน 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (target === "progress") {
        setProgressImage(reader.result as string);
      } else {
        setCompletedImage(reader.result as string);
      }
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

          const currentStatusStr = (data.status === "Pending" || data.status === "แจ้งรายงาน") ? "แจ้งรายงาน"
            : (data.status === "Acknowledged" || data.status === "รับทราบ") ? "รับทราบ"
            : (data.status === "InProgress" || data.status === "กำลังดำเนินการ") ? "กำลังดำเนินการ"
            : (data.status === "Completed" || data.status === "ดำเนินการแก้ไขสำเร็จ") ? "ดำเนินการแก้ไขสำเร็จ"
            : data.status || "แจ้งรายงาน";

          const isCompleted = currentStatusStr === "ดำเนินการแก้ไขสำเร็จ";
          const isInProgress = currentStatusStr === "กำลังดำเนินการ" || currentStatusStr === "รับทราบ" || isCompleted;

          const reporterFullName = data.user 
            ? (`${data.user.firstname || ''} ${data.user.surname || ''}`.trim() || data.user.username) 
            : "ผู้ใช้งาน GreenPass";
          const reporterPhone = data.user?.mobilephone || "-";

          let assignedRangerFullName: string | null = null;
          let assignedRangerUsername: string | null = null;

          if (data.parkRanger) {
            assignedRangerFullName = (`${data.parkRanger.firstname || ''} ${data.parkRanger.surname || ''}`.trim()) || data.parkRanger.username;
            assignedRangerUsername = data.parkRanger.username;
          } else if (data.parkRangerName && data.parkRangerName !== "-" && data.parkRangerName !== "ยังไม่มีผู้รับผิดชอบ") {
            assignedRangerFullName = data.parkRangerName;
            assignedRangerUsername = data.parkRangerUsername || null;
          }

          try {
            const replyRes = await replyReportApi.getReplyReports(Number(reportId));
            const logs = Array.isArray(replyRes)
              ? replyRes
              : Array.isArray(replyRes?.result)
              ? replyRes.result
              : Array.isArray(replyRes?.data)
              ? replyRes.data
              : [];
            if (logs.length > 0) {
              setReplyHistory(logs);
              const originalImg = data.image ? resolveReportImageUrl(data.image) : null;
              for (const l of logs) {
                const s = l.currentStatus || l.status;
                const replyImg = l.image ? resolveReportImageUrl(l.image) : null;
                const isNewImage = replyImg && replyImg !== originalImg && !replyImg.endsWith(data.image);

                if (s === "InProgress" || s === "กำลังดำเนินการ") {
                  if (l.progress) setProgressText(l.progress);
                  if (isNewImage) setProgressImage(replyImg);
                }
                if (s === "Completed" || s === "ดำเนินการแก้ไขสำเร็จ") {
                  if (l.progress) setCompletedText(l.progress);
                  if (isNewImage) setCompletedImage(replyImg);
                }
                if (!assignedRangerUsername) {
                  const rUser = l.parkRangerUsername || l.park_ranger_username || l.username;
                  const rName = l.parkRangerName || l.park_ranger_name || rUser;
                  if (rUser) {
                    assignedRangerUsername = rUser;
                    assignedRangerFullName = rName;
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
            reportDetails: data.description || data.name || "",
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
          setStartDate(backendReport.startDate !== "-" ? backendReport.startDate : getTodayThaiDate());
          setCompletedDate(backendReport.completedDate !== "-" ? backendReport.completedDate : getTodayThaiDate());
          setIsPageLoading(false);
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
      const isComp = found.status === "ดำเนินการแก้ไขสำเร็จ";
      const isProg = found.status === "กำลังดำเนินการ" || isComp;
      setStartDate(isProg ? (found.startDate === "-" ? getTodayThaiDate() : found.startDate) : getTodayThaiDate());
      setCompletedDate(isComp ? (found.completedDate === "-" ? getTodayThaiDate() : found.completedDate) : getTodayThaiDate());
    }
    setIsPageLoading(false);
  }

  useEffect(() => {
    loadReport();

    const handleLiveReply = (e: any) => {
      const incoming = e.detail;
      const incomingReportId = incoming?.report?.reportId || incoming?.reportId || incoming?.report_id;
      if (incomingReportId && String(incomingReportId) === String(reportId)) {
        console.log("📡 [ViewReportMemberDetail] Live ReplyReport update -> Reloading");
        loadReport();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("greenpass_reply_report_received", handleLiveReply);
      window.addEventListener("greenpass_report_updated", handleLiveReply);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("greenpass_reply_report_received", handleLiveReply);
        window.removeEventListener("greenpass_report_updated", handleLiveReply);
      }
    };
  }, [reportId]);

  const isAssignedToOther = false;

  // 🔹 Handler 1: กดรับทราบเรื่อง (Acknowledge Step)
  const handleAcknowledgeSubmit = async () => {
    if (!canProgressReport) return;
    setError("");
    setSuccess("");
    const rangerUsername = localStorage.getItem("ranger_username") || localStorage.getItem("username") || "";

    setIsLoading(true);
    try {
      if (reportId && !isNaN(Number(reportId))) {
        await reportApi.updateReportStatus(
          Number(reportId), 
          "Acknowledged", 
          rangerUsername, 
          "เจ้าหน้าที่กดยอมรับและรับทราบเหตุการณ์เรียบร้อยแล้ว"
        );
      }
      setIsLoading(false);
      setSuccess("รับทราบเหตุการณ์เรียบร้อย ข้อมูลส่วนปฏิบัติงาน (กำลังดำเนินการ) เปิดให้กรอกด้านล่างแล้ว");
      await loadReport();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("greenpass_report_updated", { detail: { id: reportId, status: "Acknowledged" } }));
      }
    } catch (err: any) {
      setIsLoading(false);
      setError("ไม่สามารถบันทึกการรับทราบได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // 🔹 Handler 2: กดบันทึกกำลังดำเนินการ (In Progress Step)
  const handleInProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProgressReport) return;
    setError("");
    setSuccess("");

    const rangerUsername = localStorage.getItem("ranger_username") || localStorage.getItem("username") || "";
    const note = progressText || "เจ้าหน้าที่เริ่มเข้าดำเนินการปฏิบัติงานและตรวจสอบในพื้นที่";
    const targetStatus = step2Status === "รับทราบ" ? "Acknowledged" : step2Status === "ดำเนินการแก้ไขสำเร็จ" ? "Completed" : "InProgress";

    setIsLoading(true);
    try {
      if (reportId && !isNaN(Number(reportId))) {
        await reportApi.updateReportStatus(
          Number(reportId), 
          targetStatus, 
          rangerUsername, 
          note, 
          progressImage || undefined
        );
      }
      setIsLoading(false);
      setSuccess("บันทึกสถานะเรียบร้อยแล้ว");
      await loadReport();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("greenpass_report_updated", { detail: { id: reportId, status: targetStatus } }));
      }
    } catch (err: any) {
      setIsLoading(false);
      setError("ไม่สามารถบันทึกสถานะได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // 🔹 Handler 3: กดบันทึกดำเนินการแก้ไขสำเร็จ (Completed Step)
  const handleCompletedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProgressReport) return;
    setError("");
    setSuccess("");

    const rangerUsername = localStorage.getItem("ranger_username") || localStorage.getItem("username") || "";
    const note = completedText || "ดำเนินการแก้ไขปัญหาเรียบร้อย และทำความสะอาดพื้นที่เสร็จสิ้นแล้ว";
    const targetStatus = step3Status === "รับทราบ" ? "Acknowledged" : step3Status === "กำลังดำเนินการ" ? "InProgress" : "Completed";

    setIsLoading(true);
    try {
      if (reportId && !isNaN(Number(reportId))) {
        await reportApi.updateReportStatus(
          Number(reportId), 
          targetStatus, 
          rangerUsername, 
          note, 
          completedImage || undefined
        );
      }
      setIsLoading(false);
      setSuccess("บันทึกสถานะดำเนินการแก้ไขสำเร็จเรียบร้อยแล้ว ทุกขั้นตอนเสร็จสมบูรณ์");
      await loadReport();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("greenpass_report_updated", { detail: { id: reportId, status: targetStatus } }));
      }
    } catch (err: any) {
      setIsLoading(false);
      setError("ไม่สามารถบันทึกสถานะได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (isPageLoading) {
    return (
      <div className="max-w-5xl mx-auto py-24 flex flex-col items-center justify-center space-y-4 font-sans text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600">กำลังดึงข้อมูลรายละเอียดรายงาน...</p>
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="w-[98%] max-w-4xl mx-auto py-12 text-center font-sans">
        <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-3xl p-8 shadow-xl max-w-md mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง</h3>
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

  // Determine current status step flags
  const curStatus = currentReport.status;
  const isAckDone = curStatus === "รับทราบ" || curStatus === "กำลังดำเนินการ" || curStatus === "ดำเนินการแก้ไขสำเร็จ";
  const isInProgressDone = curStatus === "กำลังดำเนินการ" || curStatus === "ดำเนินการแก้ไขสำเร็จ";
  const isCompletedDone = curStatus === "ดำเนินการแก้ไขสำเร็จ";

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 font-sans py-4">
      
      {/* Header Back & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <button 
          onClick={() => router.push("/ranger/list-report-member")}
          className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer flex items-center gap-1.5 text-xs transition-colors bg-white/80 border border-slate-200/80 px-4 py-2 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>ย้อนกลับไปหน้ารายการรายงาน</span>
        </button>

        <div className="flex items-center gap-2">
          {currentReport.isSevere ? (
            <span className="bg-rose-100 text-rose-700 text-xs font-black px-3 py-1 rounded-full border border-rose-300 flex items-center gap-1 shadow-2xs animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              ร้ายแรง
            </span>
          ) : (
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ปกติ
            </span>
          )}
        </div>
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

      {/* ==================================================== */}
      {/* UNIFIED PROGRESSIVE STATUS STEPS (เรียงต่อยาวลงมาข้างล่าง) */}
      {/* ==================================================== */}
      <div className="space-y-6">
        
        {/* ---------------------------------------------------- */}
        {/* BLOCK 1: ขั้นตอนที่ 1: รับเรื่องและรับทราบเหตุการณ์ */}
        {/* ---------------------------------------------------- */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center font-black text-sm">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  ขั้นตอนที่ 1: รับเรื่องและรับทราบเหตุการณ์
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  เจ้าหน้าที่ตรวจสอบคำร้องและกดรับทราบเรื่องเข้ามาในระบบ
                </p>
              </div>
            </div>

            {isAckDone ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs self-start sm:self-auto">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                ✓ รับทราบเรื่องเรียบร้อยแล้ว
              </span>
            ) : (
              <button
                type="button"
                disabled={isLoading || !canProgressReport}
                onClick={handleAcknowledgeSubmit}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-purple-600/20 cursor-pointer flex items-center gap-2 self-start sm:self-auto"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
                <span>กดรับทราบเรื่องนี้</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium block">วันที่รับแจ้งในระบบ:</span>
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentReport.reportDate}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-medium block">เจ้าหน้าที่ผู้รับผิดชอบ:</span>
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentReport.ranger}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* BLOCK 2: ขั้นตอนที่ 2: เริ่มเข้าปฏิบัติงาน (กำลังดำเนินการ) */}
        {/* ---------------------------------------------------- */}
        {isAckDone && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-5 shadow-sm relative overflow-hidden animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center font-black text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    ขั้นตอนที่ 2: บันทึกข้อมูลเข้าปฏิบัติงาน
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    บันทึกข้อมูลและอัปโหลดรูปภาพหลักฐานระหว่างเจ้าหน้าที่เข้าปฏิบัติงานในพื้นที่
                  </p>
                </div>
              </div>

              {isInProgressDone ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs self-start sm:self-auto">
                  <Clock className="w-4 h-4 text-sky-600" />
                  ✓ กำลังดำเนินการอยู่
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 self-start sm:self-auto">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  กรอกข้อมูลขั้นตอนกำลังดำเนินการ
                </span>
              )}
            </div>

            {/* If InProgress is ALREADY SAVED, display saved view with option to edit */}
            <form onSubmit={handleInProgressSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
                
                {/* Field: วันที่เริ่มดำเนินการ */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    วันที่เริ่มเข้าปฏิบัติงาน / ดำเนินการ
                  </label>
                  <input
                    type="text"
                    disabled={!canProgressReport || isInProgressDone}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="เช่น 28/08/2569"
                    className={`w-full bg-white text-slate-800 text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none transition-all shadow-2xs ${
                      (!canProgressReport || isInProgressDone) ? 'opacity-75 cursor-not-allowed bg-slate-100' : ''
                    }`}
                  />
                </div>

                {/* Field: สถานะพนักงาน */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    สถานะพนักงาน
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value="กำลังดำเนินการ"
                    className="w-full bg-slate-100 text-slate-800 text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 cursor-not-allowed shadow-2xs select-none"
                  />
                </div>

                {/* Field: รายละเอียดความคืบหน้า */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    รายละเอียดความคืบหน้า / ข้อความบันทึกการปฏิบัติงาน
                  </label>
                  <textarea
                    rows={3}
                    disabled={!canProgressReport || isInProgressDone}
                    value={progressText}
                    onChange={(e) => setProgressText(e.target.value)}
                    placeholder="ระบุข้อความการเข้าปฏิบัติงาน เช่น ได้เข้าตรวจสอบพิกัดเรียบร้อยแล้ว อยู่ระหว่างกั้นเขตปลอดภัยและซ่อมแซม..."
                    className={`w-full bg-white text-slate-800 text-xs font-medium p-4 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none transition-all shadow-2xs resize-none ${
                      (!canProgressReport || isInProgressDone) ? 'opacity-75 cursor-not-allowed bg-slate-100' : ''
                    }`}
                  />
                </div>

                {/* Field: รูปภาพประกอบการเข้าปฏิบัติงาน */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                    รูปภาพประกอบการเข้าปฏิบัติงาน
                  </label>
                  <div className="space-y-3">
                    {!isInProgressDone && (
                      <input
                        type="file"
                        accept="image/*"
                        disabled={!canProgressReport}
                        onChange={(e) => handleImageUpload(e, "progress")}
                        className="hidden"
                        id="progress-image-upload"
                      />
                    )}
                    <div className="flex items-center gap-3">
                      {!isInProgressDone && (
                        <label
                          htmlFor="progress-image-upload"
                          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-2 shadow-2xs"
                        >
                          <Upload className="w-4 h-4 text-sky-600" />
                          <span>แนบไฟล์รูปภาพการปฏิบัติงาน</span>
                        </label>
                      )}
                      {progressImage && !isInProgressDone && (
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
                        className="relative w-40 h-28 rounded-xl overflow-hidden border border-slate-200 shadow-2xs cursor-pointer group"
                        title="คลิกดูรูปใหญ่"
                      >
                        <img src={progressImage} alt="Progress evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                          <ZoomIn className="w-4 h-4 mr-1" /> ดูรูปใหญ่
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {!isInProgressDone && (
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !canProgressReport}
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-sky-600/20"
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 stroke-[3]" />
                    )}
                    <span>บันทึกสถานะกำลังดำเนินการ</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* BLOCK 3: ขั้นตอนที่ 3: บันทึกผลการแก้ไขเสร็จสิ้น (ดำเนินการแก้ไขสำเร็จ) */}
        {/* ---------------------------------------------------- */}
        {isInProgressDone && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-5 shadow-sm relative overflow-hidden animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    ขั้นตอนที่ 3: บันทึกผลการแก้ไขเสร็จสิ้น (ดำเนินการแก้ไขสำเร็จ)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    บันทึกสรุปผลงานแก้ไขปัญหาเสร็จสิ้น และแนบรูปภาพหลักฐานงานสำเร็จ
                  </p>
                </div>
              </div>

              {isCompletedDone ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs self-start sm:self-auto">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ✓ ดำเนินการแก้ไขสำเร็จเรียบร้อย
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 self-start sm:self-auto">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  พร้อมกรอกข้อมูลขั้นตอนแก้ไขสำเร็จ
                </span>
              )}
            </div>

            <form onSubmit={handleCompletedSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
                
                {/* Field: วันที่เสร็จสิ้น */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    วันที่ดำเนินการแก้ไขสำเร็จ
                  </label>
                  <input
                    type="text"
                    disabled={!canProgressReport || isCompletedDone}
                    value={completedDate}
                    onChange={(e) => setCompletedDate(e.target.value)}
                    placeholder="เช่น 28/08/2569"
                    className={`w-full bg-white text-slate-800 text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all shadow-2xs ${
                      (!canProgressReport || isCompletedDone) ? 'opacity-75 cursor-not-allowed bg-slate-100' : ''
                    }`}
                  />
                </div>

                {/* Field: สถานะพนักงาน */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    สถานะพนักงาน
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value="ดำเนินการแก้ไขสำเร็จ"
                    className="w-full bg-slate-100 text-slate-800 text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 cursor-not-allowed shadow-2xs select-none"
                  />
                </div>

                {/* Field: รายละเอียดผลการซ่อมแซมสำเร็จ */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    รายละเอียดสรุปผลการแก้ไขสำเร็จ
                  </label>
                  <textarea
                    rows={3}
                    disabled={!canProgressReport || isCompletedDone}
                    value={completedText}
                    onChange={(e) => setCompletedText(e.target.value)}
                    placeholder="ระบุข้อความสรุปผลการทำงาน เช่น ได้ทำการซ่อมแซมจุดที่ชำรุดจนใช้งานได้ตามปกติ และทำความสะอาดพื้นที่เสร็จสิ้นแล้ว..."
                    className={`w-full bg-white text-slate-800 text-xs font-medium p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all shadow-2xs resize-none ${
                      (!canProgressReport || isCompletedDone) ? 'opacity-75 cursor-not-allowed bg-slate-100' : ''
                    }`}
                  />
                </div>

                {/* Field: รูปภาพหลักฐานงานสำเร็จ */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    รูปภาพหลักฐานผลการดำเนินการแก้ไขสำเร็จ
                  </label>
                  <div className="space-y-3">
                    {!isCompletedDone && (
                      <input
                        type="file"
                        accept="image/*"
                        disabled={!canProgressReport}
                        onChange={(e) => handleImageUpload(e, "completed")}
                        className="hidden"
                        id="completed-image-upload"
                      />
                    )}
                    <div className="flex items-center gap-3">
                      {!isCompletedDone && (
                        <label
                          htmlFor="completed-image-upload"
                          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-2 shadow-2xs"
                        >
                          <Upload className="w-4 h-4 text-emerald-600" />
                          <span>แนบไฟล์รูปภาพงานสำเร็จ</span>
                        </label>
                      )}
                      {completedImage && !isCompletedDone && (
                        <button
                          type="button"
                          onClick={() => setCompletedImage(null)}
                          className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          ลบรูปภาพ
                        </button>
                      )}
                    </div>
                    {completedImage && (
                      <div 
                        onClick={() => setSelectedZoomImage(completedImage)}
                        className="relative w-40 h-28 rounded-xl overflow-hidden border border-slate-200 shadow-2xs cursor-pointer group"
                        title="คลิกดูรูปใหญ่"
                      >
                        <img src={completedImage} alt="Completion evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                          <ZoomIn className="w-4 h-4 mr-1" /> ดูรูปใหญ่
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {!isCompletedDone && (
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !canProgressReport}
                    className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-600/20"
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 stroke-[3]" />
                    )}
                    <span>บันทึกสถานะดำเนินการแก้ไขสำเร็จ</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

      </div>

      {/* Image Zoom Lightbox Modal */}
      {selectedZoomImage && (
        <div 
          onClick={() => setSelectedZoomImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 p-2"
          >
            <button 
              onClick={() => setSelectedZoomImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors shadow-md border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={selectedZoomImage} 
              alt="Zoomed Image" 
              className="max-h-[82vh] w-auto object-contain rounded-2xl mx-auto shadow-2xl" 
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
