"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parkApi, rangerApi } from "@/service/api";

export default function EditParkDetails() {
  const router = useRouter();

  const [currentParkId, setCurrentParkId] = useState<number>(1);
  const [parkName, setParkName] = useState("");
  const [openTime, setOpenTime] = useState("06:00");
  const [closeTime, setCloseTime] = useState("18:00");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [eventNote, setEventNote] = useState("");
  const [status, setStatus] = useState("เปิดตามปกติ");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchParkFromDb = async () => {
      setIsFetching(true);
      let targetParkId = 1;

      if (typeof window !== "undefined") {
        const storedParkId = localStorage.getItem("ranger_park_id");
        if (storedParkId && !isNaN(Number(storedParkId)) && Number(storedParkId) > 0) {
          targetParkId = Number(storedParkId);
        }

        const storedRanger = localStorage.getItem("ranger_username");
        if (storedRanger) {
          try {
            const rangerRes = await rangerApi.getRangerByUsername(storedRanger);
            const rObj = rangerRes?.result || rangerRes?.data;
            const rParkId = rObj?.park?.parkId || rObj?.parkId;
            if (rParkId) {
              targetParkId = Number(rParkId);
              localStorage.setItem("ranger_park_id", String(targetParkId));
            }
          } catch (e) {}
        }
      }

      setCurrentParkId(targetParkId);

      try {
        const res = await parkApi.getParkById(targetParkId);
        const dbPark = res?.result || res?.data;
        if (res && (res.success || res.status) && dbPark) {
          const cleanName = (n: string) => {
            if (!n) return "อุทยานแห่งชาติ";
            const stripped = n.replace(/^(อุทยานแห่งชาติ)+/g, "").trim();
            return `อุทยานแห่งชาติ${stripped}`;
          };
          const formatTime = (t: string) => (t ? t.substring(0, 5) : "06:00");

          setParkName(cleanName(dbPark.name));
          setOpenTime(formatTime(dbPark.openTime) || "06:00");
          setCloseTime(formatTime(dbPark.closeTime) || "18:00");
          setDescription(dbPark.description || "");
          setAddress(dbPark.address || "");
          setLocation(dbPark.location || "");
          setEventNote(dbPark.eventNote || "เปิดให้บริการตามปกติ");
          setStatus(dbPark.status || "เปิดตามปกติ");
        }
      } catch (e) {
        console.warn("Could not fetch park detail from DB API", e);
      } finally {
        setIsFetching(false);
      }
    };
    fetchParkFromDb();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanName = parkName.trim();
    const cleanDesc = description.trim();
    const cleanAddress = address.trim();
    const cleanLocation = location.trim();
    const cleanEventNote = eventNote.trim();

    const scriptRegex = /<script\b[^>]*>|<\/script>|javascript:|onerror\s*=|onload\s*=|<iframe\b|<embed\b|<object\b/i;
    if (
      scriptRegex.test(cleanName) ||
      scriptRegex.test(cleanDesc) ||
      scriptRegex.test(cleanAddress) ||
      scriptRegex.test(cleanLocation) ||
      scriptRegex.test(cleanEventNote)
    ) {
      setError("กรุณากรอกข้อมูลให้ถูกต้อง");
      return;
    }

    if (
      !cleanName || cleanName.length < 4 || cleanName.length > 50 ||
      !cleanDesc || cleanDesc.length < 4 || cleanDesc.length > 5000 ||
      !cleanAddress ||
      !cleanLocation
    ) {
      setError("กรุณากรอกข้อมูลให้ถูกต้องและครบถ้วน");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        parkId: currentParkId,
        id: currentParkId,
        name: cleanName,
        address: cleanAddress,
        location: cleanLocation,
        description: cleanDesc,
        openTime: openTime.length === 5 ? `${openTime}:00` : openTime,
        closeTime: closeTime.length === 5 ? `${closeTime}:00` : closeTime,
        eventNote: cleanEventNote || "เปิดให้บริการตามปกติ",
        status: status || "เปิดตามปกติ"
      };

      await parkApi.updatePark(payload);

      const savedData = {
        parkId: currentParkId,
        name: cleanName,
        address: cleanAddress,
        location: cleanLocation,
        description: cleanDesc,
        openHours: `เปิดทุกวัน ตั้งแต่เวลา ${openTime} น. - ${closeTime} น.`,
        eventNote: cleanEventNote,
        status
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("greenpass_park_saved_data", JSON.stringify(savedData));
      }

      setSuccess("บันทึกข้อมูลอุทยานลงฐานข้อมูลเสร็จสมบูรณ์เรียบร้อยแล้ว!");
      setTimeout(() => {
        router.push("/ranger/view-park-detail");
      }, 1000);
    } catch (err) {
      console.error("Park update error:", err);
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล ลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="max-w-5xl mx-auto py-20 flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600">กำลังโหลดข้อมูลอุทยานจากฐานข้อมูล...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="w-full max-w-[1600px] mx-auto bg-white/90 backdrop-blur-xl shadow-xl rounded-3xl p-6 md:p-8 font-sans border border-slate-200/90 space-y-6"
    >
      {/* Header Bar */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">แก้ไขรายละเอียดข้อมูลอุทยาน</h2>
          <p className="text-xs text-slate-500">ปรับปรุงข้อมูลทั่วไป เวลาทำการ ด่านตรวจ และที่ตั้งอุทยานแห่งชาติ</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/ranger/view-park-detail")}
          className="text-xs text-slate-500 hover:text-slate-800 font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          &larr; ย้อนกลับ
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2 font-medium">
          <span>⚠️ {error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2 font-semibold">
          <span>✅ {success}</span>
        </div>
      )}

      {/* 1. Park Name & Description */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700" htmlFor="edit-parkName">
            ชื่ออุทยานแห่งชาติ <span className="text-red-500">*</span>
          </label>
          <input
            id="edit-parkName"
            type="text"
            value={parkName}
            onChange={(e) => setParkName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 text-xs rounded-xl p-3 focus:outline-none font-bold transition-colors"
            placeholder="ระบุชื่ออุทยานแห่งชาติ"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700" htmlFor="edit-desc">
            รายละเอียดคำอธิบาย <span className="text-red-500">*</span>
          </label>
          <textarea
            id="edit-desc"
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 text-xs rounded-xl p-3.5 leading-relaxed focus:outline-none transition-colors"
            placeholder="ระบุรายละเอียดประวัติความเป็นมา สภาพแวดล้อมทางธรรมชาติ"
          />
        </div>
      </div>

      {/* 2. Operating Hours, Status & Gate Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700" htmlFor="edit-openTime">
            เวลาเปิดทำการ <span className="text-red-500">*</span>
          </label>
          <input
            id="edit-openTime"
            type="time"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 text-xs p-3 rounded-xl focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700" htmlFor="edit-closeTime">
            เวลาปิดทำการ <span className="text-red-500">*</span>
          </label>
          <input
            id="edit-closeTime"
            type="time"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 text-xs p-3 rounded-xl focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700" htmlFor="edit-status">
            สถานะเปิดทำการ <span className="text-red-500">*</span>
          </label>
          <select
            id="edit-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 text-xs p-3 rounded-xl focus:outline-none font-bold transition-colors"
          >
            <option value="เปิดตามปกติ">เปิดตามปกติ</option>
            <option value="ปิดชั่วคราว">ปิดชั่วคราว</option>
            <option value="ปิดประจำฤดูกาล">ปิดประจำฤดูกาล</option>
          </select>
        </div>
      </div>

      {/* 3. Gate Info & Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700" htmlFor="edit-eventNote">
            ข้อมูลด่านตรวจ / หมายเหตุเพิ่มเติม
          </label>
          <input
            id="edit-eventNote"
            type="text"
            value={eventNote}
            onChange={(e) => setEventNote(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 text-xs p-3 rounded-xl focus:outline-none transition-colors"
            placeholder="เช่น ด่านตรวจที่ 1 (กม.8) & ด่านตรวจที่ 2 (กม.38)"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700" htmlFor="edit-location">
            พิกัดภูมิศาสตร์ (GPS Coordinates) <span className="text-red-500">*</span>
          </label>
          <input
            id="edit-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 text-xs p-3 rounded-xl focus:outline-none font-mono transition-colors"
            placeholder="เช่น 18.5356313, 98.519549"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700" htmlFor="edit-address">
          ที่ตั้งและที่อยู่ติดต่อ <span className="text-red-500">*</span>
        </label>
        <input
          id="edit-address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 text-xs p-3 rounded-xl focus:outline-none transition-colors"
          placeholder="ระบุที่ตั้ง ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => router.push("/ranger/view-park-detail")}
          className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? "กำลังบันทึกข้อมูล..." : "บันทึกการเปลี่ยนแปลง"}
        </button>
      </div>
    </form>
  );
}
