"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

const INITIAL_REPORTS: MemberReport[] = [
  {
    id: "1",
    reportDate: "วันที่ 10 กุมภาพันธ์ 2567",
    category: "ขยะสิ่งแวดล้อม",
    status: "แจ้งรายงาน",
    reportDetails: "พบเจอช้างป่าหลุดบริเวณทางเข้าอุทยาน พบเจอช้างป่าหลุดบริเวณทางเข้าอุทยาน",
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
    ranger: "D3D3D3\n-",
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
          ranger: r.ranger && r.ranger !== "-" ? r.ranger : (idx === 0 ? "ใจดี มากๆ" : idx === 1 ? "D3D3D3\n-" : idx === 2 ? "ใจดี มากๆ" : "สมชาย อังยอง"),
          startDate: r.startDate || "วันที่ 10 กุมภาพันธ์ 2567",
          completedDate: r.completedDate || "วันที่ 10 กุมภาพันธ์ 2567"
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
      setStartDate(found.startDate === "-" ? "วันที่ 10 กุมภาพันธ์ 2567" : found.startDate);
      setCompletedDate(found.completedDate === "-" ? "วันที่ 10 กุมภาพันธ์ 2567" : found.completedDate);
    }
  }, [reportId]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!status) {
      setError("กรุณาเลือกสถานะ");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      try {
        const updated = reports.map((r) => {
          if (r.id === reportId) {
            return {
              ...r,
              status,
              startDate: status === "แจ้งรายงาน" ? "-" : startDate,
              completedDate: status === "ดำเนินการแก้ไขสำเร็จ" ? completedDate : "-",
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
    }, 1000);
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
          className="text-zinc-500 hover:text-zinc-700 font-bold"
        >
          &lt; ย้อนกลับ
        </button>
      </div>

      {/* บอร์ดแสดงความผิดพลาดหรือสำเร็จ */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded text-xs">
          <span>{success}</span>
        </div>
      )}

      {/* คาร์ดสีดำมนกลมหลัก (ตามรูปดีไซน์ในหน้า 138 & 140) */}
      <form onSubmit={handleUpdate} className="bg-black text-white rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
        
        {/* วันที่แจ้งรายงาน */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-bold text-zinc-250 w-36">วันที่แจ้งรายงาน :</span>
          <div className="bg-[#5d6061] text-white px-4 py-2 rounded w-full sm:w-2/3 border border-zinc-700">
            {currentReport.reportDate}
          </div>
        </div>

        {/* รายละเอียดเหตุการณ์ (สะกดว่า รายละเอียดเหตุการ ตามรูปภาพ) */}
        <div className="flex flex-col sm:flex-row gap-2 text-xs">
          <span className="font-bold text-zinc-250 w-36">รายละเอียดเหตุการ :</span>
          <div className="bg-[#5d6061] text-white p-4 rounded leading-relaxed min-h-24 w-full sm:w-2/3 border border-zinc-700">
            {currentReport.reportDetails}
          </div>
        </div>

        {/* สถานะ ดรอปดาวน์ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-bold text-zinc-250 w-36">สถานะ :</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#5d6061] text-white px-3 py-2 rounded w-full sm:w-2/3 border border-zinc-700 focus:outline-none cursor-pointer font-bold"
          >
            <option value="แจ้งรายงาน">แจ้งรายงาน</option>
            <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
            <option value="ดำเนินการแก้ไขสำเร็จ">ดำเนินการแก้ไขสำเร็จ</option>
          </select>
        </div>

        {/* วันที่เริ่มดำเนินการ (กล่องสีเขียวสว่างเมื่อกำลังดำเนินการ, สีเทาเมื่อเสร็จสิ้นแล้ว) */}
        {(status === "กำลังดำเนินการ" || status === "ดำเนินการแก้ไขสำเร็จ") && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="font-bold text-zinc-250 w-36">วันที่เริ่มดำเนินการ :</span>
            <input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`font-bold px-4 py-2 rounded w-full sm:w-2/3 focus:outline-none border border-zinc-700 transition-colors ${
                status === "กำลังดำเนินการ" 
                  ? "bg-[#00ff40] text-zinc-950" 
                  : "bg-[#5d6061] text-white"
              }`}
            />
          </div>
        )}

        {/* วันที่ดำเนินการสำเร็จ (กล่องสีเขียวสว่างที่จะแสดงเฉพาะเมื่อเลือกสถานะ ดำเนินการแก้ไขสำเร็จ เท่านั้น) */}
        {status === "ดำเนินการแก้ไขสำเร็จ" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="font-bold text-zinc-250 w-36">วันที่ดำเนินการสำเร็จ :</span>
            <input
              type="text"
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
              className="bg-[#00ff40] text-zinc-950 font-bold px-4 py-2 rounded w-full sm:w-2/3 focus:outline-none border border-zinc-700"
            />
          </div>
        )}

        {/* ปุ่มบันทึกสีเขียวที่มุมล่างขวา */}
        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-[#00ff40] hover:bg-[#00e039] text-zinc-950 font-bold rounded-lg transition-colors cursor-pointer text-xs"
          >
            {isLoading ? "กำลังบันทึก..." : "บันทึก"}
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
