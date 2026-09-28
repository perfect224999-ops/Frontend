"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { stampApi } from "@/service/api";
import { QrCode, CheckCircle2, User, Sparkles, MapPin, RefreshCw, AlertTriangle, Clock, XCircle, Maximize2, Lock, ArrowLeft, UserX } from "lucide-react";

export default function ScanCheckinQRCode() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [scannedUserData, setScannedUserData] = useState<{
    fullName: string;
    username: string;
    phone?: string;
    parkName?: string;
    timestamp: string;
  } | null>(null);

  const [canIssueStamp, setCanIssueStamp] = useState(true);

  useEffect(() => {
    const savedRoles = typeof window !== "undefined" ? localStorage.getItem("ranger_roles") : null;
    if (savedRoles) {
      try {
        const parsed = JSON.parse(savedRoles);
        if (Array.isArray(parsed)) {
          setCanIssueStamp(parsed.includes("สแกนแสตมป์"));
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!canIssueStamp) return;
    let html5QrCode: any;
    let isActive = true;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        
        await new Promise((resolve) => setTimeout(resolve, 150));
        if (!isActive) return;

        html5QrCode = new Html5Qrcode("qr-reader");
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 25,
            videoConstraints: {
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
            },
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true,
            },
            disableFlip: false,
          },
          async (decodedText: string) => {
            if (!isActive) return;
            try {
              setIsScanning(false);
              await html5QrCode.stop();

              processScanResult(decodedText);
            } catch (err: any) {
              console.error("Error during scan checkin:", err);
              setIsScanning(true);
            }
          },
          () => {}
        );
      } catch (err) {
        console.error("Failed to start html5-qrcode scanner:", err);
      }
    };

    if (isScanning && !showSuccessPopup && !showErrorPopup) {
      startScanner();
    }

    return () => {
      isActive = false;
      if (html5QrCode) {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().catch((err: any) => console.error("Failed to stop scanner on cleanup", err));
        }
      }
    };
  }, [isScanning, showSuccessPopup, showErrorPopup]);

  const processScanResult = async (decodedToken: string) => {
    const rangerUsername = typeof window !== "undefined" ? localStorage.getItem("ranger_username") || "ranger01" : "ranger01";

    try {
      const response = await stampApi.scanCheckinQrCode({
        token: decodedToken,
        parkRangerId: 0,
        parkRangerUsername: rangerUsername
      });

      const resultData = response?.result || response?.data;

      if (response && (response.success || response.status) && resultData) {
        const cleanParkName = (n?: string) => {
          if (!n) return typeof window !== "undefined" ? localStorage.getItem("ranger_park_name") || "อุทยานแห่งชาติ" : "อุทยานแห่งชาติ";
          const stripped = n.replace(/^(อุทยานแห่งชาติ)+/g, "").trim();
          return `อุทยานแห่งชาติ${stripped}`;
        };

        const uName = resultData.username || decodedToken;
        const fName = resultData.fullName || 
          (`${resultData.firstname || ""} ${resultData.lastname || ""}`).trim() || 
          uName;

        setScannedUserData({
          fullName: fName,
          username: uName,
          phone: resultData.phone || "-",
          parkName: cleanParkName(resultData.parkName),
          timestamp: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น."
        });

        setShowSuccessPopup(true);
      } else {
        const rawMsg = response?.message || "";
        let finalMsg = "ไม่สามารถบันทึกตราประทับได้";
        if (rawMsg.includes("ไม่พบข้อมูล") || response?.status === 404 || response?.statusCode === 404) {
          // 4.1.1 กรณีที่ระบบค้นหาข้อมูลสมาชิกไม่เจอ
          finalMsg = "ไม่พบข้อมูลสมาชิก";
        } else if (rawMsg.includes("ซ้ำ") || rawMsg.includes("2 ชั่วโมง")) {
          finalMsg = rawMsg;
        } else if (rawMsg.includes("ไม่สามารถบันทึกตราประทับได้") || rawMsg.includes("ไม่สามารถบันทึก") || !rawMsg) {
          // 5.1.1 กรณีที่บันทึกข้อมูลตราประทับไม่สำเร็จ
          finalMsg = "ไม่สามารถบันทึกตราประทับได้";
        } else {
          finalMsg = rawMsg;
        }
        setErrorMessage(finalMsg);
        setShowErrorPopup(true);
      }
    } catch (err: any) {
      console.error("Error scan checkin:", err);
      const rawMsg = err?.response?.data?.message || err?.message || "";
      let finalMsg = "ไม่สามารถบันทึกตราประทับได้";
      if (err?.response?.status === 404 || rawMsg.includes("ไม่พบข้อมูล") || rawMsg.includes("not found")) {
        // 4.1.1 กรณีที่ระบบค้นหาข้อมูลสมาชิกไม่เจอ
        finalMsg = "ไม่พบข้อมูลสมาชิก";
      } else if (rawMsg.includes("ซ้ำ") || rawMsg.includes("2 ชั่วโมง")) {
        finalMsg = rawMsg;
      } else if (rawMsg.includes("ไม่สามารถบันทึกตราประทับได้")) {
        // 5.1.1 กรณีที่บันทึกข้อมูลตราประทับไม่สำเร็จ
        finalMsg = "ไม่สามารถบันทึกตราประทับได้";
      }
      setErrorMessage(finalMsg);
      setShowErrorPopup(true);
    }
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
    setScannedUserData(null);
    setIsScanning(true);
  };

  const handleCloseErrorPopup = () => {
    setShowErrorPopup(false);
    setErrorMessage("");
    setIsScanning(true);
  };

  const isMemberNotFoundError = errorMessage.includes("ไม่พบข้อมูลสมาชิก") || errorMessage.includes("ไม่พบข้อมูลนักท่องเที่ยว");
  const isStampFailedError = errorMessage.includes("ไม่สามารถบันทึกตราประทับได้") || errorMessage.includes("ไม่สามารถบันทึก");
  const isDuplicateError = errorMessage.includes("ซ้ำ") || errorMessage.includes("วันนี้ไปแล้ว") || errorMessage.includes("2 ชั่วโมง");

  if (!canIssueStamp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-rose-100 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-800">ไม่มีสิทธิ์สแกนแสตมป์</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              บัญชีของคุณไม่มีสิทธิ์ <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">สแกนแสตมป์</span> สำหรับการสแกน QR Code ประทับตราสแตมป์แก่นักท่องเที่ยว
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
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 font-sans">
      
      <style dangerouslySetInnerHTML={{__html: `
        #qr-reader {
          border: none !important;
          width: 100% !important;
          height: 100% !important;
        }
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          border-radius: 20px;
        }
      `}} />

      {/* Header Banner */}
      <div className="bg-[#0a5829] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <QrCode className="w-4 h-4" /> Check-in &amp; Stamp Terminal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">สแกน QR Code มอบสแตมป์อุทยาน</h1>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl">
            นำกล้องส่องไปยัง QR Code บนมือถือนักท่องเที่ยวเพื่อตรวจสอบรายชื่อและมอบสแตมป์สะสม
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-2 bg-emerald-800/90 px-4 py-2 rounded-full border border-emerald-500/40 text-xs sm:text-sm font-bold text-emerald-100 shadow-md">
          <span className={`w-3 h-3 rounded-full ${isScanning ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
          <span>{isScanning ? "กำลังสแกนกล้องสด..." : "พักการสแกน"}</span>
        </div>
      </div>

      {/* Large Camera Stream Frame Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-4">
        
        <div className="relative w-full h-[480px] sm:h-[580px] lg:h-[640px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-slate-800 shadow-2xl">
          
          {/* Real Live Camera Stream */}
          <div id="qr-reader" className="w-full h-full" />

          {/* Scanner Guide Frame overlay */}
          {isScanning && !showSuccessPopup && !showErrorPopup && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-72 h-72 sm:w-96 sm:h-96 lg:w-[420px] lg:h-[420px] border-4 border-emerald-400 rounded-3xl relative animate-pulse shadow-[0_0_35px_rgba(52,211,153,0.45)]">
                <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-emerald-300 text-xs font-bold bg-slate-950/70 px-3 py-1 rounded-full border border-emerald-500/40 backdrop-blur-xs flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" /> วาง QR Code ให้อยู่ในกรอบ
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* POPUP MODAL 1: SUCCESS POPUP */}
      {showSuccessPopup && scannedUserData && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-slate-200 space-y-6 animate-scale-up">
            
            {/* Animated Checkmark Badge */}
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border-2 border-emerald-300 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <span className="px-3.5 py-1 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-200 uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> มอบสแตมป์สำเร็จ
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 pt-1">ทำการมอบสแตมป์เรียบร้อย</h3>
            </div>

            {/* Tourist Details Box */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <span className="text-slate-500 font-bold flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  ชื่อนักท่องเที่ยว:
                </span>
                <span className="font-extrabold text-slate-900 text-base text-right text-emerald-800">
                  {scannedUserData.fullName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">ชื่อบัญชี (Username):</span>
                <span className="font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {scannedUserData.username}
                </span>
              </div>

              {scannedUserData.phone && scannedUserData.phone !== "-" && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">เบอร์โทรศัพท์:</span>
                  <span className="font-semibold text-slate-700">{scannedUserData.phone}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200">
                <span className="text-slate-500 font-bold flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  สถานที่สะสม:
                </span>
                <span className="font-bold text-slate-800">{scannedUserData.parkName || "อุทยานแห่งชาติ"}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>สถานะระบบ:</span>
                <span>บันทึกลงฐานข้อมูลแล้ว • {scannedUserData.timestamp}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCloseSuccessPopup}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>สแกนคนถัดไป</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* POPUP MODAL 2: ERROR / DUPLICATE SCAN / ALTERNATE FLOW POPUP */}
      {showErrorPopup && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-slate-200 space-y-6 animate-scale-up">
            
            {/* Warning Icon Badge */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner border-2 ${
              isDuplicateError 
                ? "bg-amber-100 text-amber-600 border-amber-300" 
                : isMemberNotFoundError
                ? "bg-rose-100 text-rose-600 border-rose-300"
                : "bg-rose-100 text-rose-600 border-rose-300"
            }`}>
              {isDuplicateError ? (
                <Clock className="w-11 h-11" />
              ) : isMemberNotFoundError ? (
                <UserX className="w-11 h-11" />
              ) : (
                <XCircle className="w-11 h-11" />
              )}
            </div>

            {/* Title Badge & Heading */}
            <div className="space-y-1.5">
              <span className={`px-3 py-1 font-extrabold text-xs rounded-full border uppercase tracking-wider inline-flex items-center gap-1.5 ${
                isDuplicateError 
                  ? "bg-amber-50 text-amber-800 border-amber-200" 
                  : isMemberNotFoundError
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}>
                {isDuplicateError ? (
                  <>
                    <Clock className="w-4 h-4" /> ไม่อนุญาตให้สแกนซ้ำภายใน 2 ชั่วโมง
                  </>
                ) : isMemberNotFoundError ? (
                  <>
                    <UserX className="w-4 h-4" /> ค้นหาข้อมูลสมาชิกไม่พบ (Alternate Flow 4.1.1)
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" /> บันทึกตราประทับไม่สำเร็จ (Alternate Flow 5.1.1)
                  </>
                )}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 pt-1">
                {isDuplicateError 
                  ? "พบการสแกนสแตมป์ซ้ำภายใน 2 ชั่วโมง" 
                  : isMemberNotFoundError
                  ? "ไม่พบข้อมูลสมาชิก"
                  : "ไม่สามารถบันทึกตราประทับได้"}
              </h3>
            </div>

            {/* Error Details Box */}
            <div className={`rounded-2xl p-5 border text-left space-y-2.5 text-xs sm:text-sm ${
              isDuplicateError 
                ? "bg-amber-50/80 border-amber-200 text-amber-900" 
                : "bg-rose-50/80 border-rose-200 text-rose-900"
            }`}>
              <div className="font-semibold text-sm sm:text-base leading-relaxed flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>{errorMessage.replace(/\s*\([a-zA-Z0-9_-]+\)/g, "")}</span>
              </div>
              <p className={`text-xs opacity-85 pt-2 border-t ${
                isDuplicateError ? "border-amber-200/60" : "border-rose-200/60"
              }`}>
                {isDuplicateError 
                  ? "ระบบเปิดใช้งานเงื่อนไขความปลอดภัย: นักท่องเที่ยว 1 คน สามารถสแกนรับสแตมป์ได้ 1 ครั้ง ต่อ 1 อุทยานในระยะเวลา 2 ชั่วโมงเท่านั้น" 
                  : isMemberNotFoundError
                  ? "ระบบค้นหาข้อมูลสมาชิกในฐานข้อมูลไม่พบ กรุณาตรวจสอบ QR Code หรือสถานะบัญชีสมาชิกใหม่อีกครั้ง"
                  : "ระบบไม่สามารถบันทึกข้อมูลการมอบตราประทับลงฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleCloseErrorPopup}
                className={`w-full py-3 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                  isDuplicateError ? "bg-amber-600 hover:bg-amber-500" : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>รับทราบ / สแกนคนถัดไป</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
