"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Calendar, Check, ArrowLeft, ChevronDown, Clock, Sparkles } from "lucide-react";

interface MemberReport {
  id: string;
  reportDate: string;
  category: string;
  status: string;
  reportDetails: string;
  ranger: string;
  startDate: string;
  completedDate: string;
}

const getTodayThaiDate = () => {
  const now = new Date();
  const monthsThai = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const day = now.getDate();
  const month = monthsThai[now.getMonth()];
  const year = now.getFullYear() + 543;
  return `วันที่ ${day} ${month} ${year}`;
};

const INITIAL_REPORTS: MemberReport[] = [
  {
    id: "1",
    reportDate: "วันที่ 10 กุมภาพันธ์ 2567",
    category: "ขยะสิ่งแวดล้อม",
    status: "แจ้งรายงาน",
    reportDetails: "พบเจอขยะพลาสติกและเศษขวดแก้วจำนวนมากบริเวณจุดชมวิวทางขึ้นอุทยาน",
    ranger: "ใจดี มากๆ",
    startDate: "วันที่ 10 กุมภาพันธ์ 2567",
    completedDate: "-"
  },
  {
    id: "2",
    reportDate: "วันที่ 15 กุมภาพันธ์ 2567",
    category: "ความสะอาด",
    status: "แจ้งรายงาน",
    reportDetails: "พบกิ่งไม้ขนาดใหญ่ล้มขวางเส้นทางศึกษาธรรมชาติกิโลเมตรที่ 4",
    ranger: "D3D3D3",
    startDate: "วันที่ 15 กุมภาพันธ์ 2567",
    completedDate: "-"
  },
  {
    id: "3",
    reportDate: "วันที่ 25 กุมภาพันธ์ 2567",
    category: "สาธารณูปโภค",
    status: "กำลังดำเนินการ",
    reportDetails: "ท่อน้ำรั่วซึมบริเวณใกล้ห้องน้ำสาธารณะจุดกางเต็นท์ลำตะคอง",
    ranger: "ใจดี มากๆ",
    startDate: "วันที่ 25 กุมภาพันธ์ 2567",
    completedDate: "-"
  },
  {
    id: "4",
    reportDate: "วันที่ 27 กุมภาพันธ์ 2567",
    category: "ป้ายเตือน",
    status: "ดำเนินการแก้ไขสำเร็จ",
    reportDetails: "ป้ายเตือนระวังช้างป่าล้มชำรุดเสียหายบริเวณกิโลเมตรที่ 12",
    ranger: "สมชาย อังยอง",
    startDate: "วันที่ 27 กุมภาพันธ์ 2567",
    completedDate: "วันที่ 27 กุมภาพันธ์ 2567"
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

  useEffect(() => {
    const saved = localStorage.getItem("greenpass_member_reports");
    let allReports: MemberReport[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        allReports = parsed.map((r: any, idx: number) => ({
          id: String(idx + 1),
          reportDate: r.reportDate || "วันที่ 10 กุมภาพันธ์ 2567",
          category: r.category || "ทั่วไป",
          status: r.status === "New" ? "แจ้งรายงาน" : r.status === "InProgress" ? "กำลังดำเนินการ" : r.status === "Completed" ? "ดำเนินการแก้ไขสำเร็จ" : r.status,
          reportDetails: r.reportDetails || r.reportDetails,
          ranger: r.ranger && r.ranger !== "-" ? r.ranger : (idx === 0 ? "ใจดี มากๆ" : idx === 1 ? "D3D3D3" : idx === 2 ? "ใจดี มากๆ" : "สมชาย อังยอง"),
          startDate: r.startDate || "วันที่ 10 กุมภาพันธ์ 2567",
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
      setStartDate(found.startDate === "-" ? getTodayThaiDate() : found.startDate);
      setCompletedDate(found.completedDate === "-" ? getTodayThaiDate() : found.completedDate);
    }
  }, [reportId]);

  // ฟังก์ชันปรับสถานะและดึงวันที่ปัจจุบันอัตโนมัติเมื่อเลือกสถานะ
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    const todayStr = getTodayThaiDate();

    if (newStatus === "กำลังดำเนินการ") {
      if (!startDate || startDate === "-") {
        setStartDate(todayStr);
      }
    } else if (newStatus === "ดำเนินการแก้ไขสำเร็จ") {
      if (!startDate || startDate === "-") {
        setStartDate(todayStr);
      }
      // อัปเดตวันที่ดำเนินการสำเร็จเป็นวันที่กดดำเนินการปัจจุบันโดยอัตโนมัติ
      setCompletedDate(todayStr);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!status) {
      setError("กรุณาเลือกสถานะ");
      return;
    }

    const finalStartDate = status === "แจ้งรายงาน" ? "-" : (startDate || getTodayThaiDate());
    const finalCompletedDate = status === "ดำเนินการแก้ไขสำเร็จ" ? (completedDate || getTodayThaiDate()) : "-";

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      try {
        const updated = reports.map((r) => {
          if (r.id === reportId) {
            return {
              ...r,
              status,
              startDate: finalStartDate,
              completedDate: finalCompletedDate,
              ranger: status === "แจ้งรายงาน" ? "-" : (r.ranger && r.ranger !== "-" ? r.ranger : "ใจดี มากๆ")
            };
          }
          return r;
        });

        const toSave = updated.map(r => ({
          id: r.id,
          reportDate: r.reportDate,
          category: r.category,
          status: r.status === "แจ้งรายงาน" ? "New" : r.status === "กำลังดำเนินการ" ? "InProgress" : "Completed",
          reportDetails: r.reportDetails,
          ranger: r.ranger,
          startDate: r.startDate,
          completedDate: r.completedDate
        }));

        localStorage.setItem("greenpass_member_reports", JSON.stringify(toSave));
        setSuccess("ระบบแสดงผลการบันทึกข้อมูลที่สมบูรณ์");

        setTimeout(() => {
          router.push("/ranger/list-report-member");
        }, 1200);
      } catch (err) {
        setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      }
    }, 800);
  };

  if (!currentReport) {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg p-6 text-center text-xs">
        <p className="text-zinc-500 font-bold">ไม่พบรายละเอียดเหตุร้องเรียน</p>
        <button 
          onClick={() => router.push("/ranger/list-report-member")}
          className="mt-4 px-4 py-1.5 bg-[#dfdfdf] rounded text-[10px]"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 font-sans">
      
      {/* ปุ่มย้อนกลับ */}
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-zinc-500">รายละเอียดร้องเรียน #{currentReport.id}</span>
        <button 
          onClick={() => router.push("/ranger/list-report-member")}
          className="text-zinc-500 hover:text-zinc-700 font-bold cursor-pointer"
        >
          &lt; ย้อนกลับ
        </button>
      </div>

      {/* บอร์ดแสดงความผิดพลาดหรือสำเร็จ */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleUpdate} className="bg-zinc-950/90 backdrop-blur-xl border border-emerald-500/20 text-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
        
        {/* วันที่แจ้งรายงาน */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-zinc-300 w-36 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            วันที่แจ้งรายงาน :
          </span>
          <div className="bg-zinc-900/90 text-emerald-100 px-3.5 py-2.5 rounded-xl w-full sm:w-2/3 border border-emerald-500/30 font-medium">
            {currentReport.reportDate}
          </div>
        </div>


        {/* สถานะ ดรอปดาวน์ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-zinc-300 w-36">สถานะ :</span>
          <div className="relative w-full sm:w-2/3">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full bg-zinc-900/90 text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-500/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer font-medium appearance-none pr-10"
            >
              <option value="แจ้งรายงาน" className="bg-zinc-900 text-white">แจ้งรายงาน</option>
              <option value="กำลังดำเนินการ" className="bg-zinc-900 text-white">กำลังดำเนินการ</option>
              <option value="ดำเนินการแก้ไขสำเร็จ" className="bg-zinc-900 text-white">ดำเนินการแก้ไขสำเร็จ</option>
            </select>
            <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* วันที่เริ่มดำเนินการ */}
        {(status === "กำลังดำเนินการ" || status === "ดำเนินการแก้ไขสำเร็จ") && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="w-36 flex flex-col">
              <span className="font-semibold text-zinc-300">วันที่เริ่มดำเนินการ :</span>
              <button
                type="button"
                onClick={() => setStartDate(getTodayThaiDate())}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 text-left mt-0.5 underline cursor-pointer"
              >
                (ใช้วันที่ปัจจุบัน)
              </button>
            </div>
            <input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="เช่น วันที่ 18 สิงหาคม 2569"
              className="bg-zinc-900/90 text-emerald-100 font-medium px-3.5 py-2.5 rounded-xl w-full sm:w-2/3 border border-emerald-500/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
            />
          </div>
        )}

        {/* วันที่ดำเนินการสำเร็จ */}
        {status === "ดำเนินการแก้ไขสำเร็จ" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="w-36 flex flex-col">
              <span className="font-semibold text-zinc-300">วันที่ดำเนินการสำเร็จ :</span>
              <button
                type="button"
                onClick={() => setCompletedDate(getTodayThaiDate())}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 text-left mt-0.5 underline cursor-pointer"
              >
                (ใช้วันที่ปัจจุบัน)
              </button>
            </div>
            <input
              type="text"
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
              placeholder="เช่น วันที่ 18 สิงหาคม 2569"
              className="bg-zinc-900/90 text-emerald-100 font-medium px-3.5 py-2.5 rounded-xl w-full sm:w-2/3 border border-emerald-500/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-5 border-t border-emerald-500/20">
          <button
            type="button"
            onClick={() => router.push("/ranger/list-report-member")}
            className="px-5 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            ย้อนกลับ
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-zinc-950 font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4 stroke-[3]" />
            )}
            บันทึกข้อมูล
          </button>
        </div>

      </form>

    </div>
  );
}

export default function ViewReportMemberDetail() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs">กำลังโหลด...</div>}>
      <ViewReportMemberDetailContent />
    </Suspense>
  );
}

