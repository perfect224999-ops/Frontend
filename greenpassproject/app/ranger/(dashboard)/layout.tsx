"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { rangerApi, parkApi } from "@/service/api";
import { ShieldAlert, Lock, ArrowLeft } from "lucide-react";

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
  const [rangerUser, setRangerUser] = useState<string>("");
  const [parkName, setParkName] = useState<string>("");
  const [rangerRoles, setRangerRoles] = useState<string[]>([
    "สแกนแสตมป์", "ประกาศข่าวสาร", "แก้ไขรายละเอียด", "รายงานความคืบหน้าของเหตุการณ์"
  ]);

  useEffect(() => {
    const loadRangerInfo = async () => {
      const u = typeof window !== "undefined" ? localStorage.getItem("ranger_username") : null;
      const p = typeof window !== "undefined" ? localStorage.getItem("ranger_park_name") : null;
      if (u) setRangerUser(u);
      if (p) setParkName(p);

      // Load roles for current ranger
      const savedRoles = typeof window !== "undefined" ? localStorage.getItem("ranger_roles") : null;
      if (savedRoles) {
        try {
          const parsed = JSON.parse(savedRoles);
          if (Array.isArray(parsed)) setRangerRoles(parsed);
        } catch (e) {}
      }

      if (u) {
        try {
          const res = await rangerApi.getRangerByUsername(u);
          const rangerObj = res?.result || res?.data;
          if (rangerObj) {
            const targetParkId = rangerObj.park?.parkId || rangerObj.parkId;
            if (rangerObj.park && rangerObj.park.name) {
              setParkName(rangerObj.park.name || "");
              if (typeof window !== "undefined") {
                localStorage.setItem("ranger_park_name", rangerObj.park.name || "");
                localStorage.setItem("ranger_park_id", String(rangerObj.park.parkId));
              }
            } else if (targetParkId) {
              const PARK_NAMES: Record<number, string> = {
                1: "อุทยานแห่งชาติเขาใหญ่",
                2: "อุทยานแห่งชาติแก่งกระจาน",
                3: "อุทยานแห่งชาติเอราวัณ",
                4: "อุทยานแห่งชาติดอยสุเทพ-ปุย",
                5: "อุทยานแห่งชาติดอยอินทนนท์"
              };
              const fallbackName = PARK_NAMES[Number(targetParkId)] || "อุทยานแห่งชาติ";
              setParkName(fallbackName);
              if (typeof window !== "undefined") {
                localStorage.setItem("ranger_park_id", String(targetParkId));
                localStorage.setItem("ranger_park_name", fallbackName);
              }
              try {
                const parkRes = await parkApi.getParkById(Number(targetParkId));
                const pName = parkRes?.result?.name || parkRes?.data?.name;
                if (pName) {
                  setParkName(pName);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("ranger_park_name", pName);
                  }
                }
              } catch (e) {}
            }

            // Sync database boolean flags to roles array if available
            const apiRoles: string[] = [];
            if (rangerObj.canIssueStamp) apiRoles.push("สแกนแสตมป์");
            if (rangerObj.canAnnouncement) apiRoles.push("ประกาศข่าวสาร");
            if (rangerObj.canEditParkDetails) apiRoles.push("แก้ไขรายละเอียด");
            if (rangerObj.canProgressReport) apiRoles.push("รายงานความคืบหน้าของเหตุการณ์");

            setRangerRoles(apiRoles);
            if (typeof window !== "undefined") {
              localStorage.setItem("ranger_roles", JSON.stringify(apiRoles));
            }
          }
        } catch (e) {}
      }
    };
    loadRangerInfo();
  }, []);

  // รายการเมนูนำทางหลัก
  const navItems = [
    { name: "กล้องสแกน", href: "/ranger/scan-checkin-qrcode" },
    { 
      name: "เที่ยวกับอุทยาน", 
      href: "/ranger/view-park-detail",
      hasDropdown: true,
      dropdownType: "park"
    },
    { name: "สำรวจอุทยาน", href: "/ranger/explore-khaoyai" },
    { name: "วางแผนการเดินทาง", href: "/ranger/travel-plan" },
    { name: "จุดเดินป่าและเส้นทางการเดิน", href: "/ranger/hiking-trails" },
    { name: "ติดต่อเรา", href: "#" },
    { 
      name: "รายงาน", 
      href: "/ranger/list-report-member",
      hasDropdown: true,
      dropdownType: "report"
    },
    { name: "สถิติ", href: "/ranger/view-visit-statistics" }
  ];

  // Role Permission Guard Logic for current pathname
  let isAccessDenied = false;
  let missingRoleName = "";

  if (pathname === "/ranger/scan-checkin-qrcode" && !rangerRoles.includes("สแกนแสตมป์")) {
    isAccessDenied = true;
    missingRoleName = "สแกนแสตมป์";
  } else if ((pathname === "/ranger/announce-news" || pathname === "/ranger/edit-news-details") && !rangerRoles.includes("ประกาศข่าวสาร")) {
    isAccessDenied = true;
    missingRoleName = "ประกาศข่าวสาร";
  } else if (pathname === "/ranger/edit-park-details" && !rangerRoles.includes("แก้ไขรายละเอียด")) {
    isAccessDenied = true;
    missingRoleName = "แก้ไขรายละเอียด";
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 text-zinc-950 font-sans">
      
      {/* Modern Executive Header Navbar */}
      <header className="sticky top-0 w-full bg-gradient-to-r from-[#042410] via-[#0b4822] to-[#042410] text-white shadow-xl shadow-emerald-950/40 relative z-50 border-b border-emerald-500/25 backdrop-blur-md">
        <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/ranger/view-park-detail" className="flex items-center gap-3 group transition-transform duration-200 active:scale-95">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/50 ring-1 ring-emerald-300/40 group-hover:shadow-emerald-400/30 transition-all duration-300">
              <span className="text-lg">🌲</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
                  GreenPass
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 tracking-wider">
                  Ranger
                </span>
              </div>
              <span className="text-[10px] text-emerald-300/80 font-medium tracking-wider uppercase -mt-0.5">
                Park Operations
              </span>
            </div>
          </Link>

          {/* เมนูบาร์นำทางหลัก */}
          <nav className="hidden lg:flex items-center gap-1 bg-black/20 p-1.5 rounded-2xl border border-white/10 shadow-inner">
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                        isActive 
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-900/60 ring-1 ring-emerald-300/40" 
                          : "text-emerald-100/90 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="text-[9px] opacity-70">▼</span>
                    </button>

                    {isVisible && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 pt-2 z-50 transition-all select-none">
                        <div className="bg-[#052b13]/95 backdrop-blur-md rounded-xl shadow-2xl border border-emerald-500/30 text-xs overflow-hidden p-1.5 space-y-1 relative">
                          <Link 
                            href="/ranger/view-park-detail"
                            className="block px-3 py-2 rounded-lg text-white hover:text-emerald-300 hover:bg-emerald-500/20 font-bold transition-all"
                            onClick={() => setShowParkDropdown(false)}
                          >
                            ข้อมูลอุทยานหลัก
                          </Link>
                          <Link 
                            href="/ranger/announce-news"
                            className="block px-3 py-2 rounded-lg text-white hover:text-emerald-300 hover:bg-emerald-500/20 font-bold transition-all border-t border-emerald-500/20"
                            onClick={() => setShowParkDropdown(false)}
                          >
                            ประกาศข่าวสาร
                          </Link>
                          <Link 
                            href="/ranger/list-news"
                            className="block px-3 py-2 rounded-lg text-white hover:text-emerald-300 hover:bg-emerald-500/20 font-bold transition-all border-t border-emerald-500/20"
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                        isActive 
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-900/60 ring-1 ring-emerald-300/40" 
                          : "text-emerald-100/90 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="text-[9px] opacity-70">▼</span>
                    </button>

                    {isVisible && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 pt-2 z-50 transition-all select-none">
                        <div className="bg-[#052b13]/95 backdrop-blur-md rounded-xl shadow-2xl border border-emerald-500/30 text-xs overflow-hidden p-1.5 relative text-center">
                          <Link 
                            href="/ranger/list-report-member"
                            className="block px-3 py-2 rounded-lg text-white hover:text-emerald-300 hover:bg-emerald-500/20 font-bold transition-all"
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-900/60 ring-1 ring-emerald-300/40" 
                      : "text-emerald-100/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* โปรไฟล์ & ออกจากระบบ */}
          <div className="flex items-center gap-3">
            {rangerUser && (
              <div className="text-right text-xs hidden sm:block">
                <span className="font-bold text-white block">{rangerUser}</span>
                {parkName && (
                  <span className="text-[10px] text-emerald-300 block leading-tight">{parkName}</span>
                )}
              </div>
            )}
            <button 
              onClick={() => {
                localStorage.removeItem("ranger_username");
                localStorage.removeItem("ranger_park_id");
                localStorage.removeItem("ranger_park_name");
                localStorage.removeItem("ranger_roles");
                router.push("/ranger/login-park-ranger");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/40 border border-red-400/30 hover:border-red-300 transition-all duration-200 cursor-pointer active:scale-95"
              title="ออกจากระบบ"
            >
              <span>ออกจากระบบ</span>
            </button>
          </div>

        </div>
      </header>

      {/* เนื้อหาเว็บหลัก */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 relative z-10">
        {isAccessDenied ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-rose-100 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-slate-800">ไม่มีสิทธิ์เข้าถึงฟังก์ชันนี้</h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  บัญชีของคุณไม่มีบทบาทหน้าที่ <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">{missingRoleName}</span> สำหรับการใช้งานในหน้านี้
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => router.push("/ranger/view-park-detail")}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>กลับสู่หน้าหลักอุทยาน</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

    </div>
  );
}
