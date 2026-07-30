"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function RangerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // สถานะ hover ของแต่ละเมนู
  const [showParkDropdown, setShowParkDropdown] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);

  // รายการเมนูนำทางหลัก
  const navItems = [
    { name: "กล้องสแกน", href: "/ranger/scan-checkin-qrcode" },
    { 
      name: "เที่ยวกับอุทยาน", 
      href: "/ranger/view-park-detail",
      hasDropdown: true,
      dropdownType: "park"
    },
    { name: "สำรวจเขาใหญ่", href: "#" },
    { name: "วางแผนการเดินทาง", href: "#" },
    { name: "จุดเดินป่าและเส้นทางการเดิน", href: "#" },
    { name: "ติดต่อเรา", href: "#" },
    { 
      name: "รายงาน", 
      href: "/ranger/list-report-member",
      hasDropdown: true,
      dropdownType: "report"
    },
    { name: "สถิติ", href: "/ranger/view-visit-statistics" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 text-zinc-950 font-sans">
      
      {/* แถบนำทางหลักสีเขียวเข้ม */}
      <header className="w-full bg-[#0a5829] text-white shadow-md relative z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14 relative">
          
          {/* โลโก้วงกลมทับยื่นขอบล่างตามต้นแบบ */}
          <div className="absolute left-4 top-1 z-50">
            <img 
              src="/logo-khaoyai.svg" 
              alt="อุทยานแห่งชาติเขาใหญ่" 
              className="h-24 w-24 drop-shadow-md select-none pointer-events-none" 
            />
          </div>

          <div className="w-24 shrink-0" />

          {/* เมนูบาร์นำทางหลัก */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center h-full px-4">
            {navItems.map((item) => {
              const isParkActive = 
                item.dropdownType === "park" && (
                  pathname === "/ranger/view-park-detail" || 
                  pathname === "/ranger/edit-park-details" ||
                  pathname === "/ranger/announce-news" ||
                  pathname === "/ranger/list-news" ||
                  pathname === "/ranger/edit-news-details"
                );

              const isReportActive = 
                item.dropdownType === "report" && (
                  pathname === "/ranger/list-report-member" || 
                  pathname.startsWith("/ranger/view-report-member-detail")
                );

              const isActive = 
                pathname === item.href || isParkActive || isReportActive;

              // 1. จัดการเมนูดรอปดาวน์สำหรับ "เกี่ยวกับอุทยาน"
              if (item.dropdownType === "park") {
                const isVisible = showParkDropdown;

                return (
                  <div 
                    key={item.name}
                    className="relative h-full flex items-center"
                    onMouseEnter={() => setShowParkDropdown(true)}
                    onMouseLeave={() => setShowParkDropdown(false)}
                  >
                    <button
                      onClick={() => {
                        setShowParkDropdown(!showParkDropdown);
                        router.push(item.href);
                      }}
                      className={`px-3 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isActive 
                          ? "bg-[#187834] text-white border border-[#2d8e49]" 
                          : "text-zinc-100 hover:bg-[#13662d]"
                      }`}
                    >
                      {item.name}
                    </button>

                    {isVisible && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 pt-3 z-50 transition-all select-none">
                        <div className="bg-[#06441b] rounded shadow-lg border border-[#0d592a] text-[10px] overflow-hidden py-1 relative">
                          
                          {/* ลูกศรสามเหลี่ยมชี้ขึ้นด้านบนหาคำว่า "เกี่ยวกับอุทยาน" */}
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#06441b] border-t border-l border-[#0d592a] rotate-45" />
                          
                          {/* ลิงก์ภายในกล่อง: ปกติเป็นสีขาว จะเปลี่ยนเป็นสีเขียวสะท้อนแสง #00ff40 เฉพาะตอนชี้เมาส์ (Hover) เท่านั้น */}
                          <Link 
                            href="/ranger/view-park-detail"
                            className="block px-3 py-2 text-white hover:text-[#00ff40] hover:bg-[#0c592a]/55 font-bold transition-all relative z-10"
                            onClick={() => setShowParkDropdown(false)}
                          >
                            ข้อมูลอุทยานหลัก
                          </Link>
                          <Link 
                            href="/ranger/announce-news"
                            className="block px-3 py-2 text-white hover:text-[#00ff40] hover:bg-[#0c592a]/55 font-bold border-t border-[#105a2b] transition-all relative z-10"
                            onClick={() => setShowParkDropdown(false)}
                          >
                            ประกาศข่าวสาร
                          </Link>
                          <Link 
                            href="/ranger/list-news"
                            className="block px-3 py-2 text-white hover:text-[#00ff40] hover:bg-[#0c592a]/55 font-bold border-t border-[#105a2b] transition-all relative z-10"
                            onClick={() => setShowParkDropdown(false)}
                          >
                            ประกาศข่าวสารจากอุทยาน
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // 2. จัดการเมนูดรอปดาวน์สำหรับ "รายงาน"
              if (item.dropdownType === "report") {
                const isVisible = showReportDropdown;

                return (
                  <div 
                    key={item.name}
                    className="relative h-full flex items-center"
                    onMouseEnter={() => setShowReportDropdown(true)}
                    onMouseLeave={() => setShowReportDropdown(false)}
                  >
                    <button
                      onClick={() => {
                        setShowReportDropdown(!showReportDropdown);
                        router.push(item.href);
                      }}
                      className={`px-3 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isActive 
                          ? "bg-[#187834] text-white border border-[#2d8e49]" 
                          : "text-zinc-100 hover:bg-[#13662d]"
                      }`}
                    >
                      {item.name}
                    </button>

                    {isVisible && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-32 pt-3 z-50 transition-all select-none">
                        <div className="bg-[#06441b] rounded shadow-lg border border-[#0d592a] py-2 px-3 text-center relative">
                          
                          {/* ลูกศรสามเหลี่ยมชี้ขึ้นด้านบนหาคำว่า "รายงาน" */}
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#06441b] border-t border-l border-[#0d592a] rotate-45" />
                          
                          {/* ลิงก์นำทาง: ปกติเป็นสีขาว จะเปลี่ยนเป็นสีเขียวสะท้อนแสง #00ff40 เฉพาะตอนชี้เมาส์ (Hover) เท่านั้น */}
                          <Link 
                            href="/ranger/list-report-member"
                            className="block text-white hover:text-[#00ff40] text-[10px] font-bold transition-colors relative z-10"
                            onClick={() => setShowReportDropdown(false)}
                          >
                            ดูประวัติรายงาน
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // เมนูอื่นๆ ทั่วไป
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                    isActive 
                      ? "bg-[#187834] text-white border border-[#2d8e49]" 
                      : "text-zinc-100 hover:bg-[#13662d]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* โปรไฟล์ */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/ranger/login-park-ranger")}
              className="h-8 w-8 rounded-full bg-zinc-400 flex items-center justify-center text-zinc-800 hover:bg-zinc-350 cursor-pointer"
              title="ออกจากระบบ"
            >
              👤
            </button>
          </div>

        </div>
      </header>

      {/* เนื้อหาเว็บหลัก */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 relative z-10">
        {children}
      </main>

    </div>
  );
}
