"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    status: "แจ้งรายงาน",
    reportDetails: "พบเจอขยะพลาสติกและเศษขวดแก้วจำนวนมากบริเวณจุดชมวิวทางขึ้นอุทยาน",
    ranger: "ใจดี มากๆ",
    startDate: "-",
    completedDate: "-"
  },
  {
    id: "2",
    reportDate: "15/02/2567",
    category: "ความสะอาด",
    status: "แจ้งรายงาน",
    reportDetails: "พบกิ่งไม้ขนาดใหญ่ล้มขวางเส้นทางศึกษาธรรมชาติกิโลเมตรที่ 4",
    ranger: "D3D3D3\n-",
    startDate: "-",
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

  useEffect(() => {
    const saved = localStorage.getItem("greenpass_member_reports");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mapped = parsed.map((r: any, idx: number) => ({
          id: String(idx + 1),
          reportDate: r.reportDate || "10/02/2567",
          category: r.category || "ทั่วไป",
          status: r.status === "New" ? "แจ้งรายงาน" : r.status === "InProgress" ? "กำลังดำเนินการ" : r.status === "Completed" ? "ดำเนินการแก้ไขสำเร็จ" : r.status,
          reportDetails: r.reportDetails || r.reportDetails,
          ranger: r.ranger && r.ranger !== "-" ? r.ranger : (idx === 0 ? "ใจดี มากๆ" : idx === 1 ? "D3D3D3\n-" : idx === 2 ? "ใจดี มากๆ" : "สมชาย อังยอง"),
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
  }, []);

  const totalCount = reports.length;
  const newCount = reports.filter(r => r.status === "แจ้งรายงาน").length;
  const inProgressCount = reports.filter(r => r.status === "กำลังดำเนินการ").length;
  const completedCount = reports.filter(r => r.status === "ดำเนินการแก้ไขสำเร็จ" || r.status === "ดำเนินการสำเร็จ").length;

  const filteredReports = selectedDate === "All"
    ? reports
    : reports.filter(r => r.reportDate.startsWith(selectedDate));

  return (
    <div className="w-[95%] max-w-6xl mx-auto font-sans relative pt-2">
      
      {/* บล็อกเนื้อหาหลักสีพีชเบจอ่อนตามภาพสเก็ตช์ 3.3.60 (ลบกล่องดูประวัติรายงานออกเพื่อนำไปทำเป็นเฮดเดอร์ชี้แบบลอยตัวแทน) */}
      <div className="bg-[#f6ebe6] border border-zinc-200 rounded-lg p-6 space-y-6 shadow-sm">
        
        {/* บล็อกสถิติตัวนับ 4 กล่องเรียงหน้าแบบลอยตัว ไร้เส้นตารางคั่นตามรูปต้นฉบับ */}
        <div className="grid grid-cols-4 gap-4 text-center mt-2">
          
          {/* จำนวนรายงานจากนักท่องเที่ยว */}
          <div className="flex flex-col items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-900 mb-2 h-8 flex items-center justify-center">
              จำนวนรายงานจากนักท่องเที่ยว
            </span>
            <div className="bg-[#cccccc] text-zinc-900 text-xs font-bold py-1.5 px-6 rounded shadow-sm">
              {totalCount}
            </div>
          </div>

          {/* แจ้งรายงาน */}
          <div className="flex flex-col items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-900 mb-2 h-8 flex items-center justify-center">
              แจ้งรายงาน
            </span>
            <div className="bg-[#cccccc] text-zinc-900 text-xs font-bold py-1.5 px-6 rounded shadow-sm">
              {newCount}
            </div>
          </div>

          {/* กำลังดำเนิน */}
          <div className="flex flex-col items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-900 mb-2 h-8 flex items-center justify-center">
              กำลังดำเนิน
            </span>
            <div className="bg-[#cccccc] text-zinc-900 text-xs font-bold py-1.5 px-6 rounded shadow-sm">
              {inProgressCount}
            </div>
          </div>

          {/* ดำเนินการสำเร็จ */}
          <div className="flex flex-col items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-900 mb-2 h-8 flex items-center justify-center">
              ดำเนินการสำเร็จ
            </span>
            <div className="bg-[#cccccc] text-zinc-900 text-xs font-bold py-1.5 px-6 rounded shadow-sm">
              {completedCount}
            </div>
          </div>

        </div>

        {/* ตัวกรองดรอปดาวน์ วัน/เดือน/ปี อยู่ทางซ้ายเหนือตาราง */}
        <div className="flex justify-start text-[10px] font-bold text-zinc-800">
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1 bg-[#dfdfdf] hover:bg-[#d0d0d0] border border-zinc-400 rounded focus:outline-none cursor-pointer"
          >
            <option value="All">เลือกวัน/เดือน/ปี ▼</option>
            <option value="10/02">10/02/2567</option>
            <option value="15/02">15/02/2567</option>
            <option value="25/02">25/02/2567</option>
            <option value="27/02">27/02/2567</option>
          </select>
        </div>

        {/* ตารางแสดงผลประวัติรายงานพร้อมเส้นขอบแบ่งช่องแนวตั้งชัดเจนสีเข้มตามต้นฉบับ */}
        <div className="border border-[#888888] rounded overflow-hidden">
          <table className="w-full text-left text-[11px] border-collapse bg-[#cccccc]">
            <thead>
              <tr className="bg-[#b3b3b3] border-b border-[#888888] text-zinc-900 font-bold">
                <th className="py-2.5 px-4 w-14 text-center border-r border-[#888888]">ลำดับ</th>
                <th className="py-2.5 px-4 w-32 border-r border-[#888888]">วันที่แจ้งรายงาน</th>
                <th className="py-2.5 px-4 w-28 border-r border-[#888888]">สถานะ</th>
                <th className="py-2.5 px-4 w-40 border-r border-[#888888]">เจ้าหน้าที่ผู้รับผิดชอบ</th>
                <th className="py-2.5 px-4 text-center border-r border-[#888888]">รายละเอียดการรายงาน</th>
                <th className="py-2.5 px-3 w-16 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#888888] text-zinc-900">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-zinc-350/40">
                  
                  {/* ลำดับ */}
                  <td className="py-2.5 px-4 text-center border-r border-[#888888] font-bold">{report.id}</td>
                  
                  {/* วันที่แจ้งรายงาน */}
                  <td className="py-2.5 px-4 border-r border-[#888888] font-mono">{report.reportDate}</td>
                  
                  {/* สถานะ (ปรับสีวงกลมแสดงผลตรงตามรูปต้นแบบ) */}
                  <td className="py-2.5 px-4 border-r border-[#888888] font-bold">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full border border-black/10 ${
                        report.status === "แจ้งรายงาน" || report.status === "ดำเนินการแก้ไขสำเร็จ" || report.status === "ดำเนินการสำเร็จ" ? "bg-[#39db5c]" : "bg-[#f8c325]"
                      }`} />
                      {report.status}
                    </span>
                  </td>
                  
                  {/* เจ้าหน้าที่ผู้รับผิดชอบ */}
                  <td className="py-2.5 px-4 border-r border-[#888888] font-semibold whitespace-pre-line">{report.ranger}</td>
                  
                  {/* ปุ่มนำทางไปหน้ารายละเอียดการรายงาน (ปรับสีเป็นสีเขียวสว่างสะท้อนแสง #00ff40 ตามแบบเป๊ะ) */}
                  <td className="py-2.5 px-4 border-r border-[#888888] text-center">
                    <Link
                      href={`/ranger/view-report-member-detail?id=${report.id}`}
                      className="inline-block px-5 py-1.5 bg-[#00ff40] hover:bg-[#00e039] text-zinc-900 text-[10px] font-extrabold rounded-full transition-colors cursor-pointer"
                    >
                      รายละเอียดการรายงาน
                    </Link>
                  </td>
                  
                  {/* คอลัมน์ปุ่มสวิตช์ (Toggle) สีเขียวพร้อมเครื่องหมายถูกเฉพาะสำหรับลำดับที่ 1 และ 2 ตามรูป */}
                  <td className="py-2 px-3 text-center flex items-center justify-center min-h-[36px]">
                    {(report.id === "1" || report.id === "2") && (
                      <div className="w-11 h-5 bg-[#00ff40] rounded-full p-0.5 flex items-center justify-start cursor-pointer shadow-inner">
                        <div className="bg-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-[#00ff40] font-bold shadow-sm ml-auto">
                          ✔
                        </div>
                      </div>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
