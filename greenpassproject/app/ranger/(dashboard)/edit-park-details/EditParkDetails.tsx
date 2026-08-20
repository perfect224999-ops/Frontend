"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parkApi, rangerApi } from "@/service/api";

const DEFAULT_PARK_DATA = {
  parkName: "อุทยานแห่งชาติเขาใหญ่",
  openHours: "เปิดทุกวัน ตั้งแต่เวลา 06.00 น.-18.00 น.",
  description: "อุทยานแห่งชาติเขาใหญ่ มีความสำคัญในระดับโลกและระดับภูมิภาคอาเซียน...",
  address: "ศูนย์บริการนักท่องเที่ยว ตู้ปณ. 9 ตำบลหมูสี อำเภอปากช่อง จังหวัดนครราชสีมา 30130",
  location: "14.3109° N, 101.5304° E"
};

export default function EditParkDetails() {
  const router = useRouter();

  const [currentParkId, setCurrentParkId] = useState<number>(1);
  const [parkName, setParkName] = useState("");
  const [openHours, setOpenHours] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchParkFromDb = async () => {
      try {
        let targetParkId = 1;
        const storedRanger = typeof window !== "undefined" ? localStorage.getItem("ranger_username") : null;
        const storedParkId = typeof window !== "undefined" ? localStorage.getItem("ranger_park_id") : null;

        if (storedRanger) {
          try {
            const rangerRes = await rangerApi.getRangerByUsername(storedRanger);
            const rangerObj = rangerRes?.result || rangerRes?.data;
            if (rangerObj && rangerObj.park && rangerObj.park.parkId) {
              targetParkId = rangerObj.park.parkId;
              localStorage.setItem("ranger_park_id", String(targetParkId));
              localStorage.setItem("ranger_park_name", rangerObj.park.name || "");
            } else if (storedParkId) {
              targetParkId = parseInt(storedParkId, 10);
            }
          } catch (err) {
            if (storedParkId) targetParkId = parseInt(storedParkId, 10);
          }
        } else if (storedParkId) {
          targetParkId = parseInt(storedParkId, 10);
        }
        setCurrentParkId(targetParkId);

        const res = await parkApi.getParkById(targetParkId);
        const dbPark = res?.result || res?.data;
        if (res && (res.success || res.status) && dbPark) {
          const cleanName = (n: string) => {
            if (!n) return "อุทยานแห่งชาติ";
            const stripped = n.replace(/^(อุทยานแห่งชาติ)+/g, "").trim();
            return `อุทยานแห่งชาติ${stripped}`;
          };
          const formatTime = (t: string) => t ? t.substring(0, 5) : "";
          const openStr = dbPark.openTime ? formatTime(dbPark.openTime) : "06.00";
          const closeStr = dbPark.closeTime ? formatTime(dbPark.closeTime) : "18.00";

          setParkName(cleanName(dbPark.name));
          setOpenHours(`เปิดทุกวัน ตั้งแต่เวลา ${openStr} น.-${closeStr} น.`);
          setDescription(dbPark.description || DEFAULT_PARK_DATA.description);
          setAddress(dbPark.address || DEFAULT_PARK_DATA.address);
          setLocation(dbPark.location || DEFAULT_PARK_DATA.location);
          return;
        }
      } catch (e) {
        console.warn("Could not fetch park detail from DB API", e);
      }

      setParkName(DEFAULT_PARK_DATA.parkName);
      setOpenHours(DEFAULT_PARK_DATA.openHours);
      setDescription(DEFAULT_PARK_DATA.description);
      setAddress(DEFAULT_PARK_DATA.address);
      setLocation(DEFAULT_PARK_DATA.location);
    };
    fetchParkFromDb();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!parkName.trim()) {
      setError("ชื่ออุทยานต้องไม่เป็นค่าว่าง");
      return;
    }
    if (parkName.length < 4 || parkName.length > 50) {
      setError("ชื่ออุทยานต้องมีความยาว 4 - 50 ตัวอักษร");
      return;
    }

    if (!openHours.trim()) {
      setError("เวลาเปิด-ปิด ต้องไม่เป็นค่าว่าง");
      return;
    }

    if (!description.trim()) {
      setError("คำอธิบายต้องไม่เป็นค่าว่าง");
      return;
    }
    if (description.length < 4 || description.length > 1000) {
      setError("คำอธิบายต้องมีความยาว 4 - 1000 ตัวอักษร");
      return;
    }

    if (!address.trim()) {
      setError("ที่อยู่ต้องไม่เป็นค่าว่าง");
      return;
    }

    setIsLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("greenpass_park_data");
      }

      await parkApi.updatePark({
        parkId: currentParkId,
        name: parkName,
        image: "src/park1.jpg",
        address,
        location,
        description,
        openTime: "06:00:00",
        closeTime: "18:00:00",
        isSeasonalPark: false,
        isTemporaryClosed: false,
        eventNote: "เปิดให้บริการตามปกติ",
        status: "เปิดตามปกติ"
      });

      setSuccess("บันทึกข้อมูลอุทยานลงฐานข้อมูลเสร็จสมบูรณ์เรียบร้อยแล้ว!");
      setTimeout(() => {
        router.push("/ranger/view-park-detail");
      }, 1200);
    } catch (err) {
      setError("ไม่สามารถบันทึกข้อมูลลงฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-4xl mx-auto bg-white shadow-sm rounded-2xl p-6 md:p-8 font-sans border border-emerald-100 space-y-6">
      
      {/* Header Bar */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">แก้ไขรายละเอียดข้อมูลอุทยาน</h2>
          <p className="text-xs text-slate-500">ปรับปรุงข้อมูลทั่วไป เวลาทำการ และที่ตั้งอุทยานแห่งชาติ</p>
        </div>
        <button 
          type="button" 
          onClick={() => router.push("/ranger/view-park-detail")}
          className="text-xs text-slate-500 hover:text-slate-800 font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
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
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 text-xs rounded-xl p-3.5 leading-relaxed focus:outline-none transition-colors"
            placeholder="ระบุรายละเอียดประวัติความเป็นมา สภาพแวดล้อมทางธรรมชาติ"
          />
        </div>
      </div>

      {/* 2. Operating Hours & Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700" htmlFor="edit-openHours">
            เวลาเปิดทำการ <span className="text-red-500">*</span>
          </label>
          <input
            id="edit-openHours"
            type="text"
            value={openHours}
            onChange={(e) => setOpenHours(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 text-xs p-3 rounded-xl focus:outline-none transition-colors"
            placeholder="เช่น เปิดทุกวัน ตั้งแต่เวลา 06.00 น. - 18.00 น."
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700" htmlFor="edit-location">
            พิกัดภูมิศาสตร์ (GPS Coordinates)
          </label>
          <input
            id="edit-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 text-xs p-3 rounded-xl focus:outline-none font-mono transition-colors"
            placeholder="เช่น 14.4374° N, 101.4013° E"
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
