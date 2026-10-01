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

// ==========================================
// 1. Interface & Types (โครงสร้างข้อมูลของรายงาน)
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

// ==========================================
// 2. Helper Functions (ฟังก์ชันช่วยเหลือ)
// ==========================================

/**
 * ดึงวันที่ปัจจุบันในรูปแบบ พ.ศ. (เช่น "02/10/2569")
 */
const getTodayThaiDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear() + 543;
  return `${day}/${month}/${year}`;
};

/**
 * จัดการแปลง URL รูปภาพที่ได้จาก Backend หรือ Local ให้เป็น Full Path ที่ใช้งานได้
 */
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

// ==========================================
// 3. Main Component (คอมโพเนนต์หลัก)
// ==========================================
function ViewReportMemberDetailContent() {
  // --- Hooks สำหรับการนำทางและการอ่าน URL Parameter ---
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id"); // อ่าน ID ของรายงานจาก Query Parameter (?id=...)

  // --- State สำหรับเก็บข้อมูลรายงาน ---
  const [reports, setReports] = useState<MemberReport[]>([]);
  const [currentReport, setCurrentReport] = useState<MemberReport | null>(null); // รายงานชิ้นที่กำลังเลือกดู

  // --- State สำหรับฟอร์มอัปเดตความคืบหน้า ---
  const [status, setStatus] = useState("");                     // สถานะปัจจุบัน (แจ้งรายงาน / กำลังดำเนินการ / ดำเนินการแก้ไขสำเร็จ)
  const [startDate, setStartDate] = useState("");               // วันที่เริ่มดำเนินการ
  const [completedDate, setCompletedDate] = useState("");       // วันที่ดำเนินการเสร็จสิ้น
  const [progressText, setProgressText] = useState("");         // ข้อความบันทึกความคืบหน้า (Note/Reply)
  const [progressImage, setProgressImage] = useState<string | null>(null); // รูปภาพความคืบหน้าที่อัปโหลด
  const [replyHistory, setReplyHistory] = useState<any[]>([]);  // ประวัติการตอบกลับ/อัปเดตสถานะย้อนหลัง
  
  // --- State ควบคุม UI และการแสดงผล ---
  const [error, setError] = useState("");                         // ข้อความ Error
  const [success, setSuccess] = useState("");                     // ข้อความแจ้งบันทึกสำเร็จ
  const [isLoading, setIsLoading] = useState(false);              // ตัวระบุว่ากำลังบันทึก/ดึงข้อมูลอยู่หรือไม่
  const [canProgressReport, setCanProgressReport] = useState(true);// สิทธิ์ของเจ้าหน้าที่ในการอัปเดตรายงาน
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null); // รูปภาพที่คลิกเปิดดูแบบขยายใหญ่

  // --- State ข้อมูลเจ้าหน้าที่ที่เข้าสู่ระบบปัจจุบัน ---
  const [currentLoggedInUsername, setCurrentLoggedInUsername] = useState<string>("");
  const [currentLoggedInName, setCurrentLoggedInName] = useState<string>("");

  // 🔹 Effect: ดึงข้อมูลเจ้าหน้าที่ที่ล็อกอินจาก localStorage ตอนโหลดหน้าครั้งแรก
  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("ranger_username") || localStorage.getItem("username") || "";
      const n = localStorage.getItem("ranger_name") || u;
      setCurrentLoggedInUsername(u);
      setCurrentLoggedInName(n);
    }
  }, []);

  /**
   * 🔹 ฟังก์ชันจัดการอัปโหลดรูปภาพความคืบหน้า
   * แปลงไฟล์รูปภาพเป็น Base64 Data URL และตรวจขนาดไม่ให้เกิน 10MB
   */
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

  // 🔹 Effect: ตรวจสอบสิทธิ์การใช้งานจาก ranger_roles ใน localStorage
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

  // 🔹 Effect: โหลดข้อมูลรายละเอียดรายงานจาก Backend API (หรือ LocalStorage Fallback)
  useEffect(() => {
    async function loadReport() {
      if (reportId && !isNaN(Number(reportId))) {
        try {
          // ดึงข้อมูลรายงานจาก Backend ตาม ID
          const res = await reportApi.getReportById(Number(reportId));
          const data = res && res.success ? (res.result || res.data) : null;
          if (data) {
            let dateStr = data.reportDate || getTodayThaiDate();
            if (dateStr.includes("-")) {
              const [y, m, d] = dateStr.split("-");
              dateStr = `${d}/${m}/${Number(y) + 543}`;
            }

            // แปลงสถานะจาก Backend (Pending/InProgress/Completed) เป็นภาษาไทย
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

            // ดึงประวัติการตอบกลับ / อัปเดตงาน (ReplyReport)
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
                const lastLog = logs[logs.length - 1];
                const lastProg = lastLog.progress || lastLog.message;
                if (lastProg && !lastProg.startsWith("Status updated to")) {
                  setProgressText(lastProg);
                }
                // หากใน Report ยังไม่มี rangerUsername ให้ตรวจสอบจากประวัติ Reply ย้อนหลัง
                if (!assignedRangerUsername) {
                  for (const l of logs) {
                    const rUser = l.parkRangerUsername || l.park_ranger_username || l.username;
                    const rName = l.parkRangerName || l.park_ranger_name || rUser;
                    if (rUser) {
                      assignedRangerUsername = rUser;
                      assignedRangerFullName = rName;
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

      // ถ้าดึงจาก API ไม่สำเร็จ ให้ใช้ข้อมูลจาก localStorage หรือ Mock Data
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

    // 🔹 ฟัง Event อัปเดตข้อมูลสดแบบ Real-time (เมื่อมีการตอบกลับใหม่เข้ามา)
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

  // 🔒 ตรวจสอบสิทธิ์การเป็นเจ้าหน้าที่ผู้รับผิดชอบงาน
  const isAssignedToOther = false;
  const isAssignedToMe = true;
  const isUnassigned = !currentReport?.rangerUsername || currentReport.ranger === "ยังไม่มีผู้รับผิดชอบ";

  /**
   * 🔹 ฟังก์ชันจัดการเมื่อเปลี่ยนตัวเลือกสถานะใน Dropdown
   * พร้อมเช็คเงื่อนไขห้ามข้ามขั้นตอน (ต้องเปลี่ยนเป็น 'กำลังดำเนินการ' ก่อน 'ดำเนินการแก้ไขสำเร็จ')
   */
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

  /**
   * 🔹 ฟังก์ชันบันทึกการอัปเดตสถานะและข้อความความคืบหน้าไปยัง Backend API
   */
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
        // ยิง API อัปเดตสถานะและส่งบันทึกความคืบหน้า
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

      // เมื่อบันทึกสำเร็จ ให้รอ 1.3 วินาที แล้วกลับไปยังหน้ารายการรายงาน
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

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 font-sans py-4">
      
      {/* Header back bar */}
      <div className="flex items-center text-xs px-1">
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

      {/* Form จัดการและบันทึกความคืบหน้า (Progress Management Form) */}
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
        {!canProgressReport && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
            <span className="text-base">🔒</span>
            <span>คุณเข้าใช้งานในโหมดอ่านอย่างเดียว (ไม่มีสิทธิ์บันทึกความคืบหน้า)</span>
          </div>
        )}

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
          
          {!canProgressReport ? (
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
              <span>บันทึกข้อมูลการอัปเดต</span>
            </button>
          )}
        </div>

      </form>


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
