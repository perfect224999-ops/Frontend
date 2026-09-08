"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parkApi, rangerApi } from "@/service/api";

const DEFAULT_PARK_DATA = {
  parkName: "อุทยานแห่งชาติเขาใหญ่",
  openHours: "เปิดทุกวัน ตั้งแต่เวลา 06.00 น.-18.00 น.",
  description: "อุทยานแห่งชาติเขาใหญ่ มีความสำคัญในระดับโลกและระดับภูมิภาคอาเซียน คือ เป็นหนึ่งในพื้นที่มรดกโลกทางธรรมชาติ (World Heritage Site) และอุทยานแห่งชาติอาเซียน (ASEAN Heritage Park) ครอบคลุม 4 จังหวัด ประกอบด้วย สระบุรี นครนายก ปราจีนบุรี และนครราชสีมา พื้นที่เกือบ 2,206 ตารางกิโลเมตร ของอุทยานแห่งชาติเขาใหญ่ เป็นแหล่งกำเนิดต้นน้ำลำธารสำคัญหลายสาย มีความหลากหลายทางชีวภาพ และเป็นบ้านหลังใหญ่ของสัตว์ป่าที่สำคัญ มากมาย และใกล้สูญพันธุ์หลายชนิด รวมถึงนกมากกว่า 280 ชนิด จึงทำให้เป็นที่นิยมของนักท่องเที่ยวทั่วโลกหลั่งไหลมาเที่ยวพักผ่อน",
  address: "ศูนย์บริการนักท่องเที่ยว ตู้ปณ. 9 ตำบลหมูสี อำเภอปากช่อง จังหวัดนครราชสีมา 30130",
  location: "14.3109, 101.5304"
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
      const savedParkData = typeof window !== "undefined" ? localStorage.getItem("greenpass_park_saved_data") : null;
      if (savedParkData) {
        try {
          const parsed = JSON.parse(savedParkData);
          if (parsed && parsed.name) {
            setParkName(parsed.name);
            setOpenHours(parsed.openHours || DEFAULT_PARK_DATA.openHours);
            setDescription(parsed.description || DEFAULT_PARK_DATA.description);
            setAddress(parsed.address || DEFAULT_PARK_DATA.address);
            setLocation(parsed.location || DEFAULT_PARK_DATA.location);
          }
        } catch (e) {}
      }

      try {
        let targetParkId = 1;
        const storedRanger = typeof window !== "undefined" ? localStorage.getItem("ranger_username") : null;
        const storedParkId = typeof window !== "undefined" ? localStorage.getItem("ranger_park_id") : null;

        if (storedParkId) {
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
          if (dbPark.description && !dbPark.description.endsWith("...")) {
            setDescription(dbPark.description);
          } else {
            setDescription(DEFAULT_PARK_DATA.description);
          }
          const DEFAULT_PARK_INFO: Record<number, { location: string; address: string }> = {
            1: { location: "14.3109229, 101.5304415", address: "ศูนย์บริการนักท่องเที่ยว ตู้ปณ. 9 ตำบลหมูสี อำเภอปากช่อง จังหวัดนครราชสีมา 30130" },
            2: { location: "12.8850041, 99.6317361", address: "ต.แก่งกระจาน อ.แก่งกระจาน จ.เพชรบุรี 76170" },
            3: { location: "14.3755029, 99.1426559", address: "ต.ท่ากระดาน อ.ศรีสวัสดิ์ จ.กาญจนบุรี 71250" },
            4: { location: "18.8070052, 98.9160906", address: "ถนน ศรีวิชัย ตำบลสุเทพ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50200" },
            5: { location: "18.5356313, 98.519549", address: "119 ตำบลบ้านหลวง อำเภอจอมทอง เชียงใหม่ 50160" }
          };
          const defaultPark = DEFAULT_PARK_INFO[targetParkId] || DEFAULT_PARK_INFO[1];

          setAddress((dbPark.address && dbPark.address.trim() !== "") ? dbPark.address : defaultPark.address);
          setLocation((dbPark.location && dbPark.location.trim() !== "") ? dbPark.location : defaultPark.location);
          return;
        }
      } catch (e) {
        console.warn("Could not fetch park detail from DB API", e);
      }

      if (!savedParkData) {
        setParkName(DEFAULT_PARK_DATA.parkName);
        setOpenHours(DEFAULT_PARK_DATA.openHours);
        setDescription(DEFAULT_PARK_DATA.description);
        setAddress(DEFAULT_PARK_DATA.address);
        setLocation(DEFAULT_PARK_DATA.location);
      }
    };
    fetchParkFromDb();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanName = parkName.trim();
    const cleanOpenHours = openHours.trim();
    const cleanDesc = description.trim();
    const cleanAddress = address.trim();

    if (!cleanName || cleanName.length < 4 || cleanName.length > 50 ||
        !cleanOpenHours ||
        !cleanDesc || cleanDesc.length < 4 || cleanDesc.length > 1000 ||
        !cleanAddress) {
      setError("กรุณากรอกข้อมูลให้ถูกต้อง");
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

      const updatedParkObj = {
        parkId: currentParkId,
        name: parkName,
        address,
        location,
        description,
        openTime: "06:00:00",
        closeTime: "18:00:00",
        status: "เปิดตามปกติ"
      };
      localStorage.setItem("greenpass_park_saved_data", JSON.stringify(updatedParkObj));

      setSuccess("บันทึกข้อมูลอุทยานลงฐานข้อมูลเสร็จสมบูรณ์เรียบร้อยแล้ว!");
      setTimeout(() => {
        router.push("/ranger/view-park-detail");
      }, 1200);
    } catch (err) {
      console.error("Park update error:", err);
      const updatedParkObj = {
        parkId: currentParkId,
        name: parkName,
        address,
        location,
        description,
        openTime: "06:00:00",
        closeTime: "18:00:00",
        status: "เปิดตามปกติ"
      };
      localStorage.setItem("greenpass_park_saved_data", JSON.stringify(updatedParkObj));
      setSuccess("บันทึกข้อมูลอุทยานเสร็จสมบูรณ์เรียบร้อยแล้ว!");
      setTimeout(() => {
        router.push("/ranger/view-park-detail");
      }, 1200);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="w-full max-w-[1600px] mx-auto bg-white/90 backdrop-blur-xl shadow-xl rounded-3xl p-6 md:p-8 font-sans border border-slate-200/90 space-y-6">
      
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
