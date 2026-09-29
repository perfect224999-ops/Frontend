"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { rangerApi, parkApi, reportApi, getBaseURL } from "@/service/api";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  QrCode,
  Trees,
  ClipboardList,
  BarChart3,
  LogOut,
  Info,
  Newspaper,
  Megaphone
} from "lucide-react";

export default function RangerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // สถานะเปิด-ปิด dropdown ของแต่ละเมนู
  const [showParkDropdown, setShowParkDropdown] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const parkDropdownRef = useRef<HTMLDivElement | null>(null);

  // ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (parkDropdownRef.current && !parkDropdownRef.current.contains(event.target as Node)) {
        setShowParkDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [rangerUser, setRangerUser] = useState<string>("");
  const [parkName, setParkName] = useState<string>("");
  const [currentParkId, setCurrentParkId] = useState<string>("");
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [rangerRoles, setRangerRoles] = useState<string[]>([]);

// ----------------------------------------------------
  // 📡 Real-time WebSocket STOMP Listener
  // ทำงานแบบ Event-driven 100% ไม่มีการยิง API ซ้ำๆ (คลูดาวน์)
  // ----------------------------------------------------
  useEffect(() => {
    const activeParkId = currentParkId || (typeof window !== "undefined" ? localStorage.getItem("ranger_park_id") : null);
    const activeParkName = parkName || (typeof window !== "undefined" ? localStorage.getItem("ranger_park_name") : null);
    const activeRangerUser = rangerUser || (typeof window !== "undefined" ? (localStorage.getItem("ranger_username") || localStorage.getItem("username")) : null);

    let stompClient: Client | null = null;

    try {
      // เชื่อมต่อไปยัง WebSocket Port 8081 (/api/v1/ws-greenpass)
      const wsUrl = `${getBaseURL()}/ws-greenpass`;

      stompClient = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        reconnectDelay: 4000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: (msg) => {
          if (process.env.NODE_ENV !== "production") {
            console.log("[STOMP]", msg);
          }
        },
        onConnect: () => {
          console.log(`📡 [WebSocket STOMP Connected] Park ID: ${activeParkId || "All"}, Ranger: ${activeRangerUser || "Unknown"}`);

          const processPayload = async (item: any) => {
            if (!item || typeof item !== "object") return;

            let report = item.report || item.reportItem || item;
            const targetReportId = report.reportId || item.reportId || item.id;

            if (targetReportId && (!report.typeName && !report.type?.typeName && !report.typeId && !report.type?.typeId)) {
              try {
                const res = await reportApi.getReportById(Number(targetReportId));
                if (res && (res.result || res.data)) {
                  report = res.result || res.data;
                }
              } catch (e) {}
            }
            const replyReportId = item.replyReportId || item.reply_report_id || item.notificationId || item.id;
            const progressText = item.progress || item.message || report.description || report.name || "";
            const title = item.title || report.name || "แจ้งเตือนรายงานเหตุการณ์";
            const reporterName = report.user?.username || report.username || item.username || item.parkRangerUsername || item.park_ranger_username || "ผู้ใช้งาน GreenPass";

            const typeName = String(report.typeName || report.type?.typeName || item.typeName || item.reportType || item.category || "");
            const typeId = report.typeId || report.type?.typeId || item.typeId || item.type_id;

            // ตรวจสอบอุทยาน: หากข้อความมี parkId ระบุ และไม่ตรงกับอุทยานที่ล็อกอินอยู่ ให้ข้าม
            const reportParkId = report.parkId || report.park?.parkId || item.parkId || item.park?.parkId;
            const reportParkName = report.parkName || report.park?.name || item.parkName || item.park?.name;

            if (activeParkId && reportParkId && String(reportParkId) !== String(activeParkId)) {
              console.log(`[WS] Ignoring message for other park (${reportParkId}), current park is ${activeParkId}`);
              return;
            }

            // ตรวจสอบความฉุกเฉิน / ร้ายแรง
            const isEmergency = Boolean(
              typeId === 2 ||
              String(typeId) === "2" ||
              item.isEmergency === true ||
              report.isEmergency === true ||
              typeName.includes("ร้ายแรง") ||
              typeName.includes("ฉุกเฉิน") ||
              title.includes("ร้ายแรง") ||
              title.includes("ฉุกเฉิน") ||
              title.includes("แจ้งเตือนเหตุฉุกเฉิน") ||
              progressText.includes("ร้ายแรง") ||
              progressText.includes("ฉุกเฉิน") ||
              String(report.name || "").includes("ร้ายแรง") ||
              String(report.name || "").includes("ฉุกเฉิน") ||
              String(report.description || "").includes("ร้ายแรง") ||
              String(report.description || "").includes("ฉุกเฉิน") ||
              String(item.severity || "").toLowerCase().includes("emergency") ||
              String(item.severity || "").toLowerCase().includes("severe") ||
              String(report.category || "").includes("ร้ายแรง") ||
              String(report.category || "").includes("ฉุกเฉิน")
            );

            const alertId = String(report.reportId || item.reportId || replyReportId || Date.now());
            const ackList: string[] = typeof window !== "undefined"
              ? JSON.parse(localStorage.getItem("greenpass_ack_reports") || "[]")
              : [];

            if (isEmergency && !ackList.includes(alertId)) {
              console.log(`🚨 [WebSocket Real-Time] Emergency alert triggered for Park ${activeParkId || "All"}! ID: ${alertId}`);
              const alertData = {
                id: alertId,
                parkId: String(activeParkId || reportParkId || ""),
                details: progressText || report.name || "พบเหตุการณ์ร้ายแรง/ฉุกเฉินในพื้นที่อุทยาน",
                location: reportParkName || activeParkName || "พื้นที่อุทยานแห่งชาติ",
                time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
                reporter: reporterName
              };

              if (typeof window !== "undefined") {
                localStorage.setItem("greenpass_emergency_alert", JSON.stringify(alertData));
                window.dispatchEvent(new CustomEvent("greenpass_emergency_trigger", { detail: alertData }));
              }
            } else {
              console.log("ℹ️ [WebSocket Real-Time] Received update:", item);
            }

            // ส่ง Custom Event ให้หน้าตารางรายงาน และหน้ารายละเอียดอัปเดตข้อมูลทันทีแบบไม่ต้องรีหน้า
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("greenpass_report_updated", { detail: item }));
              window.dispatchEvent(new CustomEvent("greenpass_reply_report_received", { detail: item }));
            }
          };

          const handleIncomingMessage = (message: any) => {
            if (!message || !message.body) return;
            try {
              const raw = JSON.parse(message.body);
              console.log("📡 [WebSocket Message Received]:", raw);
              const data = raw.result || raw.data || raw;
              const items = Array.isArray(data) ? data : [data];
              for (const it of items) {
                processPayload(it);
              }
            } catch (e) {
              console.error("Error parsing WebSocket message:", e);
            }
          };

          // สมัครรับข้อความทุก Topic ที่เกี่ยวข้อง ทั้งแบบเฉพาะอุทยาน และแบบรวม
          const topicsToSubscribe = new Set<string>();
          if (activeParkId) {
            topicsToSubscribe.add(`/topic/park/${activeParkId}/notifications`);
            topicsToSubscribe.add(`/topic/park/${activeParkId}/reports`);
            topicsToSubscribe.add(`/topic/park/${activeParkId}/reply-reports`);
            topicsToSubscribe.add(`/topic/park/${activeParkId}`);
          }
          if (activeRangerUser) {
            topicsToSubscribe.add(`/topic/ranger/${activeRangerUser}/notifications`);
            topicsToSubscribe.add(`/topic/ranger/${activeRangerUser}/reports`);
            topicsToSubscribe.add(`/topic/ranger/${activeRangerUser}`);
          }
          topicsToSubscribe.add("/topic/notifications");
          topicsToSubscribe.add("/topic/reports");
          topicsToSubscribe.add("/topic/reply-reports");
          topicsToSubscribe.add("/topic/emergency");
          topicsToSubscribe.add("/topic/emergency-reports");
          topicsToSubscribe.add("/topic/report");
          topicsToSubscribe.add("/topic/reply-report");
          topicsToSubscribe.add("/topic/notification");
          topicsToSubscribe.add("/queue/notifications");
          topicsToSubscribe.add("/queue/reports");

          topicsToSubscribe.forEach((t) => {
            stompClient?.subscribe(t, handleIncomingMessage);
          });
        },
        onStompError: (frame) => {
          console.warn("WebSocket STOMP Error:", frame.headers["message"]);
        },
        onWebSocketClose: () => {
          console.log("📡 [WebSocket] Disconnected. Will auto-reconnect...");
        }
      });

      stompClient.activate();
    } catch (e) {
      console.error("Failed to initialize WebSocket Client:", e);
    }

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [currentParkId, parkName, rangerUser]);

  useEffect(() => {
    const loadRangerInfo = async () => {
      const u = typeof window !== "undefined" ? localStorage.getItem("ranger_username") : null;
      const p = typeof window !== "undefined" ? localStorage.getItem("ranger_park_name") : null;
      const pid = typeof window !== "undefined" ? localStorage.getItem("ranger_park_id") : null;
      if (u) setRangerUser(u);
      if (p) setParkName(p);
      if (pid) setCurrentParkId(pid);

      // Load roles for current ranger
      const savedRoles = typeof window !== "undefined" ? localStorage.getItem("ranger_roles") : null;
      if (savedRoles) {
        try {
          const parsed = JSON.parse(savedRoles);
          if (Array.isArray(parsed)) setRangerRoles(parsed);
        } catch (e) { }
      }

      if (u) {
        try {
          const res = await rangerApi.getRangerByUsername(u);
          const rangerObj = res?.result || res?.data;
          if (rangerObj) {
            const fullName = `${rangerObj.firstname || ''} ${rangerObj.surname || ''}`.trim() || rangerObj.username;
            if (fullName && typeof window !== "undefined") {
              localStorage.setItem("ranger_name", fullName);
            }
            const targetParkId = rangerObj.park?.parkId || rangerObj.parkId;
            if (targetParkId) {
              setCurrentParkId(String(targetParkId));
            }
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
              } catch (e) { }
            }

            // Sync database boolean flags to roles array if available
            const hasFlags = (
              rangerObj.canIssueStamp !== undefined ||
              rangerObj.canAnnouncement !== undefined ||
              rangerObj.canEditParkDetails !== undefined ||
              rangerObj.canProgressReport !== undefined
            );
            if (hasFlags) {
              const apiRoles: string[] = [];
              if (rangerObj.canIssueStamp) apiRoles.push("สแกนแสตมป์");
              if (rangerObj.canAnnouncement) apiRoles.push("ประกาศข่าวสาร");
              if (rangerObj.canEditParkDetails) apiRoles.push("แก้ไขรายละเอียด");
              if (rangerObj.canProgressReport) apiRoles.push("รายงานความคืบหน้าของเหตุการณ์");
              setRangerRoles(apiRoles);
              if (typeof window !== "undefined") {
                localStorage.setItem("ranger_roles", JSON.stringify(apiRoles));
              }
            } else if (Array.isArray(rangerObj.roles)) {
              setRangerRoles(rangerObj.roles);
              if (typeof window !== "undefined") {
                localStorage.setItem("ranger_roles", JSON.stringify(rangerObj.roles));
              }
            }
          }
        } catch (e) { }
      }
    };
    setIsMounted(true);
    loadRangerInfo();
  }, []);

  const navItems = [
    { name: "กล้องสแกน", href: "/ranger/scan-checkin-qrcode", icon: QrCode, role: "สแกนแสตมป์" },
    { name: "เกี่ยวกับอุทยาน", href: "/ranger/view-park-detail", icon: Trees },
    { name: "ประกาศข่าวสาร", href: "/ranger/announce-news", icon: Megaphone, role: "ประกาศข่าวสาร" },
    { name: "ประกาศข่าวสารจากอุทยาน", href: "/ranger/list-news", icon: Newspaper },
    { name: "รายงาน", href: "/ranger/list-report-member", icon: ClipboardList, role: "รายงานความคืบหน้าของเหตุการณ์" },
    { name: "สถิติ", href: "/ranger/view-visit-statistics", icon: BarChart3 }
  ];

  // ซ่อนเมนู Navbar ที่เจ้าหน้าที่ไม่มี Role
  const visibleNavItems = navItems.filter((item) => {
    if (!item.role) return true;
    if (!isMounted) return false;
    return rangerRoles.includes(item.role);
  });

  // Role Permission Guard Logic for current pathname
  let isAccessDenied = false;
  let missingRoleName = "";

  if (isMounted) {
    if (pathname === "/ranger/scan-checkin-qrcode" && !rangerRoles.includes("สแกนแสตมป์")) {
      isAccessDenied = true;
      missingRoleName = "สแกนแสตมป์";
    } else if ((pathname === "/ranger/announce-news" || pathname === "/ranger/edit-news-details") && !rangerRoles.includes("ประกาศข่าวสาร")) {
      isAccessDenied = true;
      missingRoleName = "ประกาศข่าวสาร";
    } else if (pathname === "/ranger/edit-park-details" && !rangerRoles.includes("แก้ไขรายละเอียด")) {
      isAccessDenied = true;
      missingRoleName = "แก้ไขรายละเอียด";
    } else if ((pathname === "/ranger/list-report-member" || pathname.startsWith("/ranger/view-report-member-detail")) && !rangerRoles.includes("รายงานความคืบหน้าของเหตุการณ์")) {
      isAccessDenied = true;
      missingRoleName = "รายงานความคืบหน้าของเหตุการณ์";
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 text-zinc-950 font-sans">

      {/* Modern Executive Header Navbar */}
      <header className="sticky top-0 w-full bg-gradient-to-r from-[#042410] via-[#0b4822] to-[#042410] text-white shadow-xl shadow-emerald-950/40 relative z-50 border-b border-emerald-500/25 backdrop-blur-md">
        <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between">

          {/* Brand Logo */}
          <Link href="/ranger/view-park-detail" className="flex items-center gap-3 group transition-transform duration-200 active:scale-95">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/50 ring-1 ring-emerald-300/40 group-hover:shadow-emerald-400/30 transition-all duration-300">
              <Trees className="w-5 h-5 text-white transform group-hover:scale-110 transition-transform duration-300" />
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

          {/* เมนูบาร์นำทางหลัก (แสดงเรียงกันเฉพาะเมนูที่มีสิทธิ์) */}
          <nav className="hidden lg:flex items-center gap-2 sm:gap-2.5 bg-black/20 p-1.5 rounded-2xl border border-white/10 shadow-inner">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isParkActive =
                item.href === "/ranger/view-park-detail" && (
                  pathname === "/ranger/view-park-detail" ||
                  pathname === "/ranger/edit-park-details"
                );

              const isAnnounceActive =
                item.href === "/ranger/announce-news" && (
                  pathname === "/ranger/announce-news"
                );

              const isListNewsActive =
                item.href === "/ranger/list-news" && (
                  pathname === "/ranger/list-news" ||
                  pathname === "/ranger/edit-news-details"
                );

              const isReportActive =
                item.href === "/ranger/list-report-member" && (
                  pathname === "/ranger/list-report-member" ||
                  pathname.startsWith("/ranger/view-report-member-detail")
                );

              const isActive =
                pathname === item.href || isParkActive || isAnnounceActive || isListNewsActive || isReportActive;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${isActive
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-900/60 ring-1 ring-emerald-300/40"
                    : "text-emerald-100/90 hover:text-white hover:bg-white/10"
                    }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-emerald-300/80"}`} />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* โปรไฟล์ & ออกจากระบบ */}
          <div className="flex items-center gap-3">
            {isMounted && rangerUser && (
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
                localStorage.removeItem("ranger_roles");
                localStorage.removeItem("ranger_park_name");
                localStorage.removeItem("ranger_park_id");
                localStorage.removeItem("greenpass_emergency_alert");
                router.push("/ranger/login-park-ranger");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/40 border border-red-400/30 hover:border-red-300 transition-all duration-200 cursor-pointer active:scale-95"
              title="ออกจากระบบ"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>

        </div>
      </header>

      {/* เนื้อหาเว็บหลัก */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 relative z-10">
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
