"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, Siren, AlertTriangle, CheckCircle } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getBaseURL, reportApi } from "@/service/api";

export interface EmergencyAlertData {
  id: string;
  parkId: string;
  details: string;
  location: string;
  time: string;
  reporter: string;
}

export default function GlobalEmergencyAlert() {
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState<EmergencyAlertData | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenTimerRef = useRef<any>(null);
  const sirenToggleRef = useRef<boolean>(false);

  // ----------------------------------------------------
  // 🔊 ระบบจำลองเสียงไซเรนเตือนภัยฉุกเฉินระดับสูง (High-Low Dual-Tone Siren)
  // ----------------------------------------------------
  const playSirenPulse = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioCtx();
      }

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const isHigh = sirenToggleRef.current;
      sirenToggleRef.current = !sirenToggleRef.current;

      const startFreq = isHigh ? 1150 : 750;
      const endFreq = isHigh ? 1350 : 650;

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Web Audio siren playback error:", e);
    }
  };

  const startEmergencySirenSound = () => {
    if (sirenTimerRef.current) return; // ป้องกันการเรียกซ้ำซ้อน
    playSirenPulse();
    sirenTimerRef.current = setInterval(playSirenPulse, 420);
  };

  const stopEmergencySirenSound = () => {
    if (sirenTimerRef.current) {
      clearInterval(sirenTimerRef.current);
      sirenTimerRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close().catch(() => {});
      } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  // ----------------------------------------------------
  // 🚨 ฟังก์ชันแสดงการแจ้งเตือนฉุกเฉิน (เด้ง Modal ทันที 100%)
  // ----------------------------------------------------
  const triggerAlert = (data: EmergencyAlertData) => {
    if (!data || !data.id) return;
    const ackList: string[] = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("greenpass_ack_reports") || "[]")
      : [];

    if (ackList.includes(String(data.id))) return;

    setActiveEmergencyAlert((prev) => {
      if (prev && String(prev.id) === String(data.id)) return prev;
      return data;
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("greenpass_emergency_alert", JSON.stringify(data));
    }
    startEmergencySirenSound();
  };

  // ----------------------------------------------------
  // 🛑 ฟังก์ชันกดยืนยันรับทราบเหตุฉุกเฉิน (ปิด Modal และหยุดเสียง)
  // ----------------------------------------------------
  const handleAcknowledgeEmergency = () => {
    stopEmergencySirenSound();
    if (activeEmergencyAlert) {
      if (typeof window !== "undefined") {
        const ackList = JSON.parse(localStorage.getItem("greenpass_ack_reports") || "[]");
        if (!ackList.includes(activeEmergencyAlert.id)) {
          ackList.push(activeEmergencyAlert.id);
          localStorage.setItem("greenpass_ack_reports", JSON.stringify(ackList));
        }
        localStorage.removeItem("greenpass_emergency_alert");

        // แจ้งเตือนทุก Tab ปิดเสียงและปิด Modal พร้อมกัน
        try {
          const bc = new BroadcastChannel("greenpass_emergency_channel");
          bc.postMessage({ type: "ACKNOWLEDGE", id: activeEmergencyAlert.id });
          bc.close();
        } catch (e) {}
      }
      setActiveEmergencyAlert(null);
    }
  };

  // ----------------------------------------------------
  // 📡 Real-time Listeners: Cross-Tab, Custom Events, WebSocket STOMP
  // ----------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    let isChecking = false;

    // ปลดล็อค AudioContext ทันทีเมื่อผู้ใช้คลิกหรือกดแป้นพิมพ์
    const unlockAudio = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("click", unlockAudio, { once: true });
      window.addEventListener("keydown", unlockAudio, { once: true });
    }

    // 1. ตรวจสอบจาก LocalStorage ตอนโหลดหน้าจอ
    const checkLocalStorageAlert = () => {
      if (typeof window === "undefined") return;
      const saved = localStorage.getItem("greenpass_emergency_alert");
      if (saved) {
        try {
          const parsed: EmergencyAlertData = JSON.parse(saved);
          const ackList: string[] = JSON.parse(localStorage.getItem("greenpass_ack_reports") || "[]");
          if (parsed && parsed.id && !ackList.includes(String(parsed.id))) {
            setActiveEmergencyAlert(parsed);
            startEmergencySirenSound();
          }
        } catch (e) {}
      }
    };

    checkLocalStorageAlert();

    // 2. ฟังก์ชันตรวจสอบรายงานฉุกเฉินที่ยังไม่ได้กดรับทราบจาก Backend (เรียกตอนโหลดและตอนสลับแท็บ)
    const checkBackendReports = async () => {
      if (!isMounted || isChecking || activeEmergencyAlert) return;
      isChecking = true;

      try {
        const activeParkId = typeof window !== "undefined"
          ? (localStorage.getItem("ranger_park_id") || localStorage.getItem("admin_park_id") || localStorage.getItem("park_id"))
          : null;
        const activeParkName = typeof window !== "undefined"
          ? (localStorage.getItem("ranger_park_name") || localStorage.getItem("park_name"))
          : null;
        const rangerUsername = typeof window !== "undefined"
          ? (localStorage.getItem("ranger_username") || localStorage.getItem("username"))
          : null;

        const ackList: string[] = typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("greenpass_ack_reports") || "[]")
          : [];

        let listData: any[] | null = null;

        if (rangerUsername) {
          try {
            const res = await reportApi.getReportsForRanger(rangerUsername);
            listData = res && (res.success || Array.isArray(res.result) || Array.isArray(res.data) || Array.isArray(res))
              ? (res.result || res.data || res)
              : null;
          } catch (e) {}
        }

        if ((!Array.isArray(listData) || listData.length === 0) && activeParkId) {
          try {
            const res = await reportApi.getReportsByParkId(Number(activeParkId));
            listData = res && (res.success || Array.isArray(res.result) || Array.isArray(res.data) || Array.isArray(res))
              ? (res.result || res.data || res)
              : null;
          } catch (e) {}
        }

        if (!Array.isArray(listData) || listData.length === 0) {
          try {
            const res = await reportApi.getAllReports();
            listData = res && (res.success || Array.isArray(res.result) || Array.isArray(res.data) || Array.isArray(res))
              ? (res.result || res.data || res)
              : null;
          } catch (e) {}
        }

        if (isMounted && Array.isArray(listData) && listData.length > 0) {
          const unackEmergency = listData.find((r: any) => {
            const rId = String(r.reportId || r.id || "");
            if (!rId || ackList.includes(rId)) return false;

            if (activeParkId && r.parkId && String(r.parkId) !== String(activeParkId)) {
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

            const isPending = r.status === "Pending" || r.status === "แจ้งรายงาน" || !r.status;
            return isSevere && isPending;
          });

          if (unackEmergency && isMounted) {
            console.log("🚨 [Global Emergency Alert] Found unacknowledged emergency report:", unackEmergency);
            const emergencyData: EmergencyAlertData = {
              id: String(unackEmergency.reportId || unackEmergency.id),
              parkId: String(activeParkId || unackEmergency.parkId || ""),
              details: unackEmergency.description
                ? `${unackEmergency.name ? unackEmergency.name + ": " : ""}${unackEmergency.description}`
                : (unackEmergency.name || "พบเหตุการณ์ร้ายแรง/ฉุกเฉินในพื้นที่อุทยาน"),
              location: unackEmergency.parkName || unackEmergency.park?.name || activeParkName || "พื้นที่อุทยานแห่งชาติ",
              time: unackEmergency.reportTime || new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
              reporter: unackEmergency.username || unackEmergency.user?.username || "ผู้ใช้งาน GreenPass"
            };

            triggerAlert(emergencyData);
          }
        }
      } catch (err) {
      } finally {
        isChecking = false;
      }
    };

    checkBackendReports();

    // 3. Custom Event Trigger (รับ Event จากหน้าย่อย เช่น Ranger layout, ListReportMember ฯลฯ)
    const handleCustomTrigger = (e: any) => {
      if (e.detail) {
        triggerAlert(e.detail);
      }
    };

    // 4. Cross-Tab Storage Event (เมื่อแท็บหนึ่งได้รับหรือปิด อีกแท็บจะตอบสนองทันที)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "greenpass_emergency_alert") {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            triggerAlert(parsed);
          } catch (err) {}
        } else {
          stopEmergencySirenSound();
          setActiveEmergencyAlert(null);
        }
      }
    };

    // 5. BroadcastChannel สำหรับการสื่อสารข้ามแท็บ
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("greenpass_emergency_channel");
      bc.onmessage = (event) => {
        if (event.data?.type === "EMERGENCY_TRIGGER" && event.data?.payload) {
          triggerAlert(event.data.payload);
        } else if (event.data?.type === "ACKNOWLEDGE") {
          stopEmergencySirenSound();
          setActiveEmergencyAlert(null);
        }
      };
    } catch (e) {}

    // 6. ตรวจสอบทันทีเมื่อผู้ใช้คลิกกลับเข้ามาที่แท็บนี้
    const handleWindowFocus = () => {
      checkLocalStorageAlert();
      checkBackendReports();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("greenpass_emergency_trigger", handleCustomTrigger);
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("focus", handleWindowFocus);
      document.addEventListener("visibilitychange", handleWindowFocus);
    }

    // 7. เชื่อมต่อ WebSocket STOMP แบบถาวร (Persistent Real-Time Connection)
    let stompClient: Client | null = null;
    try {
      const wsUrl = `${getBaseURL()}/ws-greenpass`;
      const activeParkId = typeof window !== "undefined"
        ? (localStorage.getItem("ranger_park_id") || localStorage.getItem("admin_park_id") || localStorage.getItem("park_id"))
        : null;
      const activeRangerUser = typeof window !== "undefined"
        ? (localStorage.getItem("ranger_username") || localStorage.getItem("username"))
        : null;

      stompClient = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        reconnectDelay: 3000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: () => {},
        onConnect: () => {
          console.log(`📡 [Global Emergency STOMP Connected] Ready for real-time events. Park: ${activeParkId || "All"}`);

          const processIncoming = async (rawPayload: any) => {
            if (!rawPayload || typeof rawPayload !== "object") return;

            let report = rawPayload.report || rawPayload.reportItem || rawPayload;
            const targetReportId = report.reportId || rawPayload.reportId || rawPayload.id;

            // 🚨 หัวใจสำคัญของการเด้ง Real-time:
            // ข้อความ STOMP จาก Backend (เช่น /topic/reply-reports) จะส่งเฉพาะ ID สั้นๆ
            // หากยังไม่มี typeName/typeId ในตัวข้อความ ให้ดึงรายละเอียดตัวเต็มในเสี้ยววินาทีทันที!
            if (targetReportId && (!report.typeName && !report.type?.typeName && !report.typeId && !report.type?.typeId)) {
              try {
                const res = await reportApi.getReportById(Number(targetReportId));
                if (res && (res.result || res.data)) {
                  report = res.result || res.data;
                }
              } catch (e) {
                console.warn("Could not fetch full report detail in real-time:", e);
              }
            }

            const replyReportId = rawPayload.replyReportId || rawPayload.reply_report_id || rawPayload.notificationId || rawPayload.id;
            const progressText = rawPayload.progress || rawPayload.message || report.description || report.name || "";
            const title = rawPayload.title || report.name || "แจ้งเตือนรายงานเหตุการณ์";
            const reporterName = report.user?.username || report.username || rawPayload.username || rawPayload.parkRangerUsername || rawPayload.park_ranger_username || "ผู้ใช้งาน GreenPass";

            const typeName = String(report.typeName || report.type?.typeName || rawPayload.typeName || rawPayload.reportType || rawPayload.category || "");
            const typeId = report.typeId || report.type?.typeId || rawPayload.typeId || rawPayload.type_id;

            const reportParkId = report.parkId || report.park?.parkId || rawPayload.parkId || rawPayload.park?.parkId || "";
            const reportParkName = report.parkName || report.park?.name || rawPayload.parkName || rawPayload.park?.name || "";

            // ตรวจสอบความฉุกเฉิน / ร้ายแรง
            const isEmergency = Boolean(
              typeId === 2 ||
              String(typeId) === "2" ||
              rawPayload.isEmergency === true ||
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
              String(rawPayload.severity || "").toLowerCase().includes("emergency") ||
              String(rawPayload.severity || "").toLowerCase().includes("severe") ||
              String(report.category || "").includes("ร้ายแรง") ||
              String(report.category || "").includes("ฉุกเฉิน")
            );

            const isPending = report.status === "Pending" || report.status === "แจ้งรายงาน" || rawPayload.currentStatus === "Pending" || !report.status;

            if (isEmergency && isPending) {
              const alertId = String(report.reportId || rawPayload.reportId || replyReportId || Date.now());
              const alertData: EmergencyAlertData = {
                id: alertId,
                parkId: String(reportParkId || activeParkId || ""),
                details: report.description ? `${report.name ? report.name + ": " : ""}${report.description}` : (report.name || progressText || "พบเหตุการณ์ร้ายแรง/ฉุกเฉินในพื้นที่อุทยาน"),
                location: reportParkName || "พื้นที่อุทยานแห่งชาติ",
                time: report.reportTime || new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
                reporter: reporterName
              };

              console.log("🚨 [Global STOMP Real-Time] Emergency Report Alert Triggered:", alertData);
              triggerAlert(alertData);
            }

            // ส่ง Custom Event ให้อัปเดตตารางข้อมูลแบบ Real-Time ทันที
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("greenpass_report_updated", { detail: report }));
              window.dispatchEvent(new CustomEvent("greenpass_reply_report_received", { detail: report }));
            }
          };

          const handleMsg = (msg: any) => {
            if (!msg || !msg.body) return;
            try {
              const raw = JSON.parse(msg.body);
              const data = raw.result || raw.data || raw;
              const items = Array.isArray(data) ? data : [data];
              for (const it of items) {
                processIncoming(it);
              }
            } catch (e) {
              console.error("Error processing STOMP message in GlobalEmergencyAlert:", e);
            }
          };

          const topics = new Set<string>();

          // หัวข้อสำหรับแจ้งเตือนเหตุการณ์และรายงานทั้งหมด
          topics.add("/topic/reply-reports");
          topics.add("/topic/reports");
          topics.add("/topic/notifications");
          topics.add("/topic/emergency");
          topics.add("/topic/emergency-reports");
          topics.add("/topic/report");
          topics.add("/topic/reply-report");
          topics.add("/topic/notification");
          topics.add("/queue/notifications");
          topics.add("/queue/reports");

          // สมัครรับทุกอุทยานยอดนิยม (1-10) และอุทยานที่ล็อกอินอยู่
          for (let p = 1; p <= 10; p++) {
            topics.add(`/topic/park/${p}/notifications`);
            topics.add(`/topic/park/${p}/reports`);
            topics.add(`/topic/park/${p}/reply-reports`);
            topics.add(`/topic/park/${p}`);
          }

          if (activeParkId) {
            topics.add(`/topic/park/${activeParkId}/notifications`);
            topics.add(`/topic/park/${activeParkId}/reports`);
            topics.add(`/topic/park/${activeParkId}/reply-reports`);
            topics.add(`/topic/park/${activeParkId}`);
          }
          if (activeRangerUser) {
            topics.add(`/topic/ranger/${activeRangerUser}/notifications`);
            topics.add(`/topic/ranger/${activeRangerUser}/reports`);
            topics.add(`/topic/ranger/${activeRangerUser}`);
          }

          topics.forEach((t) => {
            stompClient?.subscribe(t, handleMsg);
          });
        }
      });

      stompClient.activate();
    } catch (e) {}

    return () => {
      isMounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("greenpass_emergency_trigger", handleCustomTrigger);
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("focus", handleWindowFocus);
        document.removeEventListener("visibilitychange", handleWindowFocus);
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
      }
      if (bc) bc.close();
      if (stompClient) stompClient.deactivate();
    };
  }, []); // 🚀 รันครั้งเดียวคงสถานะเชื่อมต่อตลอดเวลา ไม่ตัดการเชื่อมต่อตอนเปลี่ยนหน้า

  if (!activeEmergencyAlert) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
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
  );
}
