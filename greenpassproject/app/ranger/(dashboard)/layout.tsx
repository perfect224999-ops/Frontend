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
  Megaphone,
  Siren,
  AlertTriangle,
  CheckCircle,
  Volume2,
  BellRing
} from "lucide-react";

interface NotificationPayload {
  notificationId?: number;
  title: string;
  message: string;
  report?: {
    reportId: number;
    name: string;
    description: string;
    image?: string;
  };
}

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

  // สถานะ Pop-up Notification จาก Mobile / WebSocket
  const [popupNotification, setPopupNotification] = useState<NotificationPayload | null>(null);

  // สถานะรายงานเหตุฉุกเฉินและการร้องเตือนภัย
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState<{
    id: string;
    parkId?: string;
    details: string;
    location: string;
    time: string;
    reporter: string;
  } | null>(null);

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const sirenTimerRef = React.useRef<any>(null);

  // สังเคราะห์เสียงไซเรนฉุกเฉิน (Loud Dual-Tone Oscillator Alarm)
  const startEmergencySirenSound = () => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (sirenTimerRef.current) clearInterval(sirenTimerRef.current);

      let toggle = false;
      const playSirenPulse = () => {
        if (!audioContextRef.current) return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          const freq = toggle ? 1150 : 750;
          toggle = !toggle;

          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(toggle ? 1350 : 650, ctx.currentTime + 0.35);

          gain.gain.setValueAtTime(0.5, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } catch (e) { }
      };

      playSirenPulse();
      sirenTimerRef.current = setInterval(playSirenPulse, 420);
    } catch (e) {
      console.warn("Could not play synthesized audio alarm", e);
    }
  };

  const stopEmergencySirenSound = () => {
    if (sirenTimerRef.current) {
      clearInterval(sirenTimerRef.current);
      sirenTimerRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => { });
      audioContextRef.current = null;
    }
  };

  // ฟังก์ชันตรวจสอบว่ารายงานนี้ตรงกับอุทยานที่ล็อกอินอยู่หรือไม่
  const isReportForCurrentPark = (reportObj: any, activeParkId: string | null, activeParkName: string | null) => {
    if (!activeParkId && !activeParkName) return false;

    const reportParkId = reportObj.parkId || reportObj.park?.parkId;
    const reportParkName = reportObj.parkName || reportObj.park?.name || reportObj.location;

    if (activeParkId && reportParkId) {
      return String(reportParkId) === String(activeParkId);
    }

    if (activeParkName && reportParkName) {
      const cleanCur = activeParkName.trim().replace("อุทยานแห่งชาติ", "");
      const cleanRep = reportParkName.trim().replace("อุทยานแห่งชาติ", "");
      return cleanRep.includes(cleanCur) || cleanCur.includes(cleanRep);
    }

    return false;
  };

  // 🚨 ตรวจจับและดึงข้อมูลเหตุฉุกเฉินร้ายแรงแบบเรียลไทม์เฉพาะอุทยานที่ล็อกอินอยู่
  useEffect(() => {
    const checkEmergencyState = async () => {
      const activeParkId = currentParkId || (typeof window !== "undefined" ? localStorage.getItem("ranger_park_id") : null);
      const activeParkName = parkName || (typeof window !== "undefined" ? localStorage.getItem("ranger_park_name") : null);

      if (!activeParkId && !activeParkName) return;

      // 1. เช็คจาก LocalStorage เดิมก่อน โดยต้องตรวจสอบว่าตรงกับอุทยานปัจจุบันหรือไม่
      const savedEmergency = typeof window !== "undefined" ? localStorage.getItem("greenpass_emergency_alert") : null;
      if (savedEmergency) {
        try {
          const parsed = JSON.parse(savedEmergency);
          if (parsed && parsed.id) {
            const isMatch = isReportForCurrentPark(parsed, activeParkId, activeParkName);
            if (!isMatch) {
              console.log(`[Emergency Alert] Removing mismatched alert for other park (${parsed.parkId || parsed.location}). Current park is ${activeParkId} (${activeParkName})`);
              localStorage.removeItem("greenpass_emergency_alert");
            } else {
              setActiveEmergencyAlert(parsed);
              startEmergencySirenSound();
              return;
            }
          }
        } catch (e) { }
      }

      // 2. ดึงข้อมูลรายงานจาก API เฉพาะของอุทยานนี้เท่านั้น (ห้ามดึงของอุทยานอื่น!)
      try {
        let listData: any[] | null = null;
        if (activeParkId) {
          const res = await reportApi.getReportsByParkId(Number(activeParkId));
          listData = res && (res.success || Array.isArray(res.result) || Array.isArray(res.data) || Array.isArray(res))
            ? (res.result || res.data || res)
            : null;
        }

        if (Array.isArray(listData)) {
          const ackList: string[] = typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("greenpass_ack_reports") || "[]")
            : [];

          const unackEmergency = listData.find((r: any) => {
            const rId = String(r.reportId || "");

            // 🚨 ตรวจสอบว่าตรงกับอุทยานปัจจุบันนี้เท่านั้น
            if (!isReportForCurrentPark(r, activeParkId, activeParkName)) {
              return false;
            }

            const tName = String(r.typeName || r.type?.typeName || r.category || "");
            const tId = r.typeId || r.type?.typeId;
            const titleDesc = `${r.name || ""} ${r.description || ""}`;

            const isSevere =
              tId === 2 ||
              String(tId) === "2" ||
              tName.includes("ร้ายแรง") ||
              tName.includes("ฉุกเฉิน") ||
              titleDesc.includes("ร้ายแรง") ||
              titleDesc.includes("ฉุกเฉิน") ||
              r.isEmergency === true;

            const isPending = r.status === "Pending" || r.status === "แจ้งรายงาน";
            return isSevere && isPending && rId && !ackList.includes(rId);
          });

          if (unackEmergency) {
            const emergencyEventData = {
              id: String(unackEmergency.reportId),
              parkId: String(activeParkId || unackEmergency.parkId || ""),
              details: unackEmergency.description
                ? `${unackEmergency.name ? unackEmergency.name + ": " : ""}${unackEmergency.description}`
                : (unackEmergency.name || "พบเหตุการณ์ร้ายแรง/ฉุกเฉินในพื้นที่อุทยาน"),
              location: unackEmergency.parkName || unackEmergency.park?.name || activeParkName || "พื้นที่อุทยานแห่งชาติ",
              time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
              reporter: unackEmergency.username || unackEmergency.user?.username || "ผู้ใช้งาน GreenPass"
            };

            setActiveEmergencyAlert(emergencyEventData);
            if (typeof window !== "undefined") {
              localStorage.setItem("greenpass_emergency_alert", JSON.stringify(emergencyEventData));
            }
            startEmergencySirenSound();
          }
        }
      } catch (e) {
        // ละเว้นข้อผิดพลาดจากการดึงเบื้องหลัง
      }
    };

    // ตรวจสอบสถานะเหตุฉุกเฉิน
    checkEmergencyState();

    const handleCustomTrigger = (e: any) => {
      if (e.detail) {
        const activeParkId = currentParkId || (typeof window !== "undefined" ? localStorage.getItem("ranger_park_id") : null);
        const activeParkName = parkName || (typeof window !== "undefined" ? localStorage.getItem("ranger_park_name") : null);

        if (!isReportForCurrentPark(e.detail, activeParkId, activeParkName)) {
          console.log(`[Emergency Alert] Ignored custom trigger for other park:`, e.detail);
          return;
        }

        setActiveEmergencyAlert(e.detail);
        if (typeof window !== "undefined") {
          localStorage.setItem("greenpass_emergency_alert", JSON.stringify(e.detail));
        }
        startEmergencySirenSound();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("greenpass_emergency_trigger", handleCustomTrigger);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("greenpass_emergency_trigger", handleCustomTrigger);
      }
    };
  }, [currentParkId, parkName]);

  // ----------------------------------------------------
  // 📡 Real-time WebSocket Listener via @stomp/stompjs & SockJS
  // ----------------------------------------------------
  useEffect(() => {
    const activeParkId = currentParkId || (typeof window !== "undefined" ? localStorage.getItem("ranger_park_id") : null);
    const activeParkName = parkName || (typeof window !== "undefined" ? localStorage.getItem("ranger_park_name") : null);

    if (!activeParkId) return;

    let stompClient: Client | null = null;

    try {
      const getWsUrl = () => `${getBaseURL()}/ws-greenpass`;

      stompClient = new Client({
        webSocketFactory: () => new SockJS(getWsUrl()),
        debug: () => { }, // ปิด log debug ใน console
        reconnectDelay: 5000,
        onConnect: () => {
          console.log(`📡 WebSocket Connected specifically for Park ID: ${activeParkId}`);

          // 🚨 สมัครรับการแจ้งเตือนเฉพาะอุทยานของเจ้าหน้าที่คนนี้เท่านั้น (ห้ามฟังอุทยานอื่น!)
          stompClient?.subscribe(`/topic/park/${activeParkId}/notifications`, (message: any) => {
            if (message.body) {
              try {
                const notification = JSON.parse(message.body);
                const report = notification.report || {};
                const title = notification.title || "";
                const messageText = notification.message || report.description || "";
                const typeName = report.typeName || report.type?.typeName || notification.typeName || notification.reportType || "";
                const typeId = report.typeId || report.type?.typeId || notification.typeId || report.type_id;

                console.log(`📡 [WebSocket] Received Notification for Park ${activeParkId}:`, notification);

                // 🔍 ตรวจสอบว่าตรงกับอุทยานปัจจุบันนี้จริงหรือไม่
                const notifParkObj = {
                  parkId: report.parkId || report.park?.parkId || notification.parkId,
                  parkName: report.parkName || report.park?.name || notification.parkName || notification.location
                };
                if (notifParkObj.parkId && !isReportForCurrentPark(notifParkObj, activeParkId, activeParkName)) {
                  console.log(`Ignoring notification for other park (${notifParkObj.parkId}), current park is ${activeParkId}`);
                  return;
                }

                // 🔍 ตรวจสอบว่าเป็นรายงานร้ายแรง / ฉุกเฉินหรือไม่
                const isEmergency =
                  typeId === 2 ||
                  String(typeId) === "2" ||
                  notification.isEmergency === true ||
                  typeName.includes("ร้ายแรง") ||
                  typeName.includes("ฉุกเฉิน") ||
                  title.includes("ร้ายแรง") ||
                  title.includes("ฉุกเฉิน") ||
                  title.includes("แจ้งเตือนเหตุฉุกเฉิน") ||
                  messageText.includes("ร้ายแรง") ||
                  messageText.includes("ฉุกเฉิน");

                if (isEmergency) {
                  console.log(`🚨 [WebSocket] Emergency alert triggered for Park ${activeParkId}!`);
                  const alertData = {
                    id: String(report.reportId || notification.notificationId || Date.now()),
                    parkId: String(activeParkId),
                    details: messageText || report.name || "พบเหตุการณ์ร้ายแรง/ฉุกเฉินในพื้นที่อุทยาน",
                    location: report.parkName || report.park?.name || activeParkName || "พื้นที่อุทยานแห่งชาติ",
                    time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
                    reporter: report.user?.username || notification.username || "ผู้ใช้งาน GreenPass"
                  };

                  setActiveEmergencyAlert(alertData);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("greenpass_emergency_alert", JSON.stringify(alertData));
                  }
                  startEmergencySirenSound(); // เปิดเสียงไซเรนวนลูป
                } else {
                  console.log("ℹ️ [WebSocket] Received normal report (no modal alarm needed):", notification);
                }

                // 🔄 สั่งให้ตารางรายงาน (ListReportMember) อัปเดตโหลดข้อมูลใหม่ในพื้นหลังทันที
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("greenpass_report_updated", { detail: notification }));
                }
              } catch (e) {
                console.error("Error parsing WebSocket message:", e);
              }
            }
          });
        },
        onStompError: (frame) => {
          console.warn("WebSocket STOMP Error:", frame.headers["message"]);
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
  }, [currentParkId, parkName]);

  const handleAcknowledgeEmergency = () => {
    stopEmergencySirenSound();
    if (activeEmergencyAlert?.id && typeof window !== "undefined") {
      try {
        const ackList = JSON.parse(localStorage.getItem("greenpass_ack_reports") || "[]");
        if (!ackList.includes(activeEmergencyAlert.id)) {
          ackList.push(activeEmergencyAlert.id);
          localStorage.setItem("greenpass_ack_reports", JSON.stringify(ackList));
        }
      } catch (e) { }
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("greenpass_emergency_alert");
      localStorage.removeItem("greenpass_member_reports");
    }
    setActiveEmergencyAlert(null);
  };

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

      {/* 🚨 HIGH-VISIBILITY EMERGENCY ALARM MODAL OVERLAY WITH SIREN SOUND */}
      {activeEmergencyAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-rose-950 via-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-rose-500 shadow-[0_0_80px_rgba(225,29,72,0.6)] space-y-6 text-center overflow-hidden animate-bounce-subtle">

            {/* Pulsing Red Warning Light Accent */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-600/30 rounded-full blur-3xl animate-ping" />
            <div className="absolute top-0 right-0 p-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40 text-[10px] font-black uppercase tracking-widest animate-pulse">
                <Volume2 className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                SIREN ALARM ACTIVE
              </span>
            </div>

            {/* Siren Icon Header */}
            <div className="relative z-10 space-y-3">
              <div className="w-20 h-20 rounded-full bg-rose-600/30 border-2 border-rose-500/80 mx-auto flex items-center justify-center text-rose-400 shadow-xl shadow-rose-600/40 ring-8 ring-rose-600/20 animate-pulse">
                <Siren className="w-10 h-10 text-rose-400 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                  แจ้งเตือนเหตุฉุกเฉินด่วนที่สุด!
                </h2>
                <p className="text-xs text-rose-200/90 font-medium mt-1">
                  มีผู้ใช้งานส่งรายงานเหตุการณ์ฉุกเฉินเข้ามาในพื้นที่อุทยาน
                </p>
              </div>
            </div>

            {/* Incident Details Card */}
            <div className="relative z-10 bg-slate-900/90 rounded-2xl p-4 border border-rose-500/40 text-left space-y-2.5 shadow-inner backdrop-blur-sm text-xs">
              <div className="flex justify-between items-center border-b border-rose-900/50 pb-2">
                <span className="text-[11px] font-bold text-rose-400">ประเภทเหตุการณ์:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] tracking-wider uppercase shadow-xs">
                  🚨 เหตุฉุกเฉินเร่งด่วน
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">รายละเอียดเหตุการณ์:</span>
                <p className="text-sm font-extrabold text-white leading-snug">
                  {activeEmergencyAlert.details || "พบผู้ได้รับบาดเจ็บ / ต้องการความช่วยเหลือด่วนในพื้นที่อุทยาน"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400 block font-semibold">สถานที่ / พิกัด:</span>
                  <span className="font-bold text-emerald-300">{activeEmergencyAlert.location || "พื้นที่อุทยานแห่งชาติ"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">เวลาแจ้งเหตุ:</span>
                  <span className="font-bold text-amber-300">{activeEmergencyAlert.time || "เมื่อสักครู่"}</span>
                </div>
              </div>
            </div>

            {/* Acknowledge & Stop Alarm Button */}
            <div className="relative z-10 pt-2">
              <button
                onClick={handleAcknowledgeEmergency}
                className="w-full py-4 px-6 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl font-black text-sm sm:text-base tracking-wide shadow-xl shadow-rose-900/60 border border-rose-400/50 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5 text-emerald-300" />
                <span>รับทราบและยืนยันการรับรู้เหตุฉุกเฉิน</span>
              </button>
              <p className="text-[10px] text-slate-400 mt-2">
                * เสียงร้องสัญญาณเตือนภัยจะหยุดทำงานเมื่อเจ้าหน้าที่กดปุ่มยืนยันรับรู้
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
