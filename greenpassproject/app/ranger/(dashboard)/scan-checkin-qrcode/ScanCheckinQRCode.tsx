"use client";

import { useState, useEffect } from "react";
import { stampApi } from "@/service/api";

export default function ScanCheckinQRCode() {
  const [isScanning, setIsScanning] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // เริ่มต้นและจัดการกับสแกนเนอร์กล้องจริง
  useEffect(() => {
    let html5QrCode: any;
    let isActive = true;

    const startScanner = async () => {
      try {
        // อิมพอร์ตไลบรารีบนฝั่งไคลเอนต์เท่านั้นเพื่อความปลอดภัยจาก Next.js SSR
        const { Html5Qrcode } = await import("html5-qrcode");
        
        // รอให้ Element ปรากฏบน DOM
        await new Promise((resolve) => setTimeout(resolve, 150));
        if (!isActive) return;

        html5QrCode = new Html5Qrcode("qr-reader");
        await html5QrCode.start(
          { facingMode: "environment" }, // เลือกใช้กล้องหลังของมือถือ
          {
            fps: 10,
            qrbox: (width: number, height: number) => {
              const min = Math.min(width, height);
              const size = Math.floor(min * 0.7);
              return { width: size, height: size };
            },
          },
          async (decodedText: string) => {
            // เมื่อกล้องสแกนสำเร็จ
            if (!isActive) return;
            try {
              setIsScanning(false);
              // หยุดกล้องสดทันที
              await html5QrCode.stop();

              // ดึงข้อมูล Ranger จาก Local Storage
              const rangerUsername = localStorage.getItem("ranger_username") || "ranger01";

              // ยิง API ไปหา Spring Boot Backend จริง
              const response = await stampApi.scanCheckinQrCode({
                token: decodedText,
                parkRangerId: 0,
                parkRangerUsername: rangerUsername
              });

              if (response && response.success) {
                // แสดงป๊อปอัปผลการทำงานสำเร็จ
                setShowSuccessPopup(true);
              } else {
                alert("สแกนมอบสแตมป์ล้มเหลว: " + (response.message || "ไม่ทราบสาเหตุ"));
                setIsScanning(true);
              }
            } catch (err: any) {
              console.error("Error during scan checkin:", err);
              const errMsg = err.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์หลังบ้าน";
              alert("สแกนมอบสแตมป์ล้มเหลว: " + errMsg);
              setIsScanning(true);
            }
          },
          (errorMessage: string) => {
            // เมินเฉยต่อการอ่านเฟรมที่ไม่ได้ QR code
          }
        );
      } catch (err) {
        console.error("Failed to start html5-qrcode scanner:", err);
      }
    };

    if (isScanning && !showSuccessPopup) {
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
  }, [isScanning, showSuccessPopup]);

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    setIsScanning(true); // กลับไปเริ่มสแกนใหม่
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border border-zinc-200 shadow-sm rounded-lg p-6 font-sans space-y-4">
      
      {/* เพิ่ม CSS พิเศษสำหรับจัดหน้าตาของสตรีมวิดีโอจากกล้อง */}
      <style dangerouslySetInnerHTML={{__html: `
        #qr-reader {
          border: none !important;
          width: 100% !important;
          height: 100% !important;
        }
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 8px;
        }
      `}} />

      {/* ส่วนหัวคาร์ดสแกนเนอร์ */}
      <div className="flex justify-between items-center border-b border-zinc-150 pb-2.5">
        <h2 className="text-sm font-bold text-zinc-700">QR Code Scanner</h2>
        <span className="bg-[#dfdfdf] text-zinc-650 px-2 py-0.5 rounded text-[10px] font-bold">
          {isScanning ? "Scanning" : "Idle"}
        </span>
      </div>

      {/* กล่องแสดงผลจากกล้องจริง */}
      <div className="relative w-full aspect-video max-w-xl mx-auto bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800">
        
        {/* ตัวกล้องสตรีมสดจริง */}
        <div id="qr-reader" className="w-full h-full" />

        {/* หน้าต่างแจ้งความสำเร็จซ้อนกลางหน้าจอกล้อง (เมื่อสแกนสำเร็จ) */}
        {showSuccessPopup && (
          <div className="absolute z-10 w-64 bg-[#e2ecd5] rounded-xl p-6 text-center shadow-2xl flex flex-col items-center justify-center space-y-4 border border-[#c5d8a8] animate-scale-up">

            <p className="text-zinc-900 font-bold text-xs">
              ทำการมอบสแตมป์เรียบร้อย
            </p>

            <button
              onClick={handleClosePopup}
              className="px-8 py-1.5 bg-[#30bf43] hover:bg-[#27a336] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              ปิด
            </button>
          </div>
        )}

    </div>

  </div>
  );
}
