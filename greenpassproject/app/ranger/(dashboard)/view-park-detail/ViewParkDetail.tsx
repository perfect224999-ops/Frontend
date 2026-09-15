"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Trees, 
  Clock, 
  MapPin, 
  Edit3, 
  Compass, 
  Award, 
  Globe2, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Sun,
  Tent,
  Camera,
  Info
} from "lucide-react";
import { parkApi, rangerApi } from "@/service/api";

interface ParkDetailState {
  parkId: number;
  parkName: string;
  openHours: string;
  description: string;
  address: string;
  location: string;
  eventNote: string;
  status: string;
  image: string;
}

const DEFAULT_PARK_DATA: ParkDetailState = {
  parkId: 1,
  parkName: "อุทยานแห่งชาติเขาใหญ่",
  openHours: "เปิดทุกวัน ตั้งแต่เวลา 06.00 น. - 18.00 น.",
  description: "อุทยานแห่งชาติเขาใหญ่ มีความสำคัญในระดับโลกและระดับภูมิภาคอาเซียน คือ เป็นหนึ่งในพื้นที่มรดกโลกทางธรรมชาติ (World Heritage Site) และอุทยานมรดกแห่งอาเซียน (ASEAN Heritage Park) ครอบคลุม 4 จังหวัด ประกอบด้วย สระบุรี นครนายก ปราจีนบุรี และนครราชสีมา พื้นที่เกือบ 2,206 ตารางกิโลเมตร ของอุทยานแห่งชาติเขาใหญ่ เป็นแหล่งกำเนิดต้นน้ำลำธารสำคัญหลายสาย มีความหลากหลายทางชีวภาพ และเป็นบ้านหลังใหญ่ของสัตว์ป่าที่สำคัญ หายาก และใกล้สูญพันธุ์หลายชนิด รวมถึงนกมากกว่า 280 ชนิด จึงทำให้เป็นที่นิยมของนักท่องเที่ยวทั่วโลก",
  address: "ศูนย์บริการนักท่องเที่ยว ตู้ปณ. 9 ตำบลหมูสี อำเภอปากช่อง จังหวัดนครราชสีมา 30130",
  location: "14.3109, 101.5304",
  eventNote: "ด่านศาลเจ้าพ่อเขาใหญ่ & ด่านเนินหอม",
  status: "เปิดตามปกติ",
  image: "https://images.unsplash.com/photo-1511497584788-8767611136f6"
};

export default function ViewParkDetail() {
  const router = useRouter();
  const [parkData, setParkData] = useState<ParkDetailState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canEditDetails, setCanEditDetails] = useState(true);

  useEffect(() => {
    const savedRoles = localStorage.getItem("ranger_roles");
    if (savedRoles) {
      try {
        const roles: string[] = JSON.parse(savedRoles);
        setCanEditDetails(roles.includes("แก้ไขรายละเอียด"));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("greenpass_park_data");
    }

    const fetchParkFromDb = async () => {
      // 1. Instant local cache hydration (0ms load)
      const savedParkData = typeof window !== "undefined" ? localStorage.getItem("greenpass_park_saved_data") : null;
      const storedRanger = typeof window !== "undefined" ? localStorage.getItem("ranger_username") : null;
      const storedParkId = typeof window !== "undefined" ? localStorage.getItem("ranger_park_id") : null;

      let targetParkId = 1;
      if (storedParkId && !isNaN(Number(storedParkId)) && Number(storedParkId) > 0) {
        targetParkId = Number(storedParkId);
      }

      if (savedParkData) {
        try {
          const parsed = JSON.parse(savedParkData);
          if (parsed && parsed.name && (parsed.parkId === targetParkId || !parsed.parkId)) {
            setParkData({
              parkId: targetParkId,
              parkName: parsed.name,
              openHours: parsed.openHours || "เปิดทุกวัน ตั้งแต่เวลา 06.00 น. - 18.00 น.",
              description: parsed.description || "",
              address: parsed.address || "",
              location: parsed.location || "",
              eventNote: "เปิดให้บริการตามปกติ",
              status: parsed.status || "เปิดตามปกติ",
              image: "https://images.unsplash.com/photo-1511497584788-8767611136f6"
            });
            setIsLoading(false);
          }
        } catch (e) {}
      } else {
        setIsLoading(true);
      }

      try {
        if (storedRanger) {
          try {
            const rangerRes = await rangerApi.getRangerByUsername(storedRanger);
            const rObj = rangerRes?.result || rangerRes?.data;
            const rParkId = rObj?.park?.parkId || rObj?.parkId;
            if (rParkId) {
              targetParkId = Number(rParkId);
              if (typeof window !== "undefined") {
                localStorage.setItem("ranger_park_id", String(targetParkId));
              }
            }
          } catch (e) {}
        }

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

          const DEFAULT_PARK_INFO: Record<number, { location: string; address: string }> = {
            1: { location: "14.3109229, 101.5304415", address: "ศูนย์บริการนักท่องเที่ยว ตู้ปณ. 9 ตำบลหมูสี อำเภอปากช่อง จังหวัดนครราชสีมา 30130" },
            2: { location: "12.8850041, 99.6317361", address: "ต.แก่งกระจาน อ.แก่งกระจาน จ.เพชรบุรี 76170" },
            3: { location: "14.3755029, 99.1426559", address: "ต.ท่ากระดาน อ.ศรีสวัสดิ์ จ.กาญจนบุรี 71250" },
            4: { location: "18.8070052, 98.9160906", address: "ถนนศรีวิชัย ตำบลสุเทพ อำเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่ 50200" },
            5: { location: "18.5356313, 98.519549", address: "119 หมู่ 7 ตำบลบ้านหลวง อำเภอจอมทอง จังหวัดเชียงใหม่ 50160" },
            6: { location: "16.8833, 101.8333", address: "หมู่ 1 ตำบลศรีฐาน อำเภอภูกระดึง จังหวัดเลย 42180" },
            7: { location: "8.6500, 97.6333", address: "ตู้ ปณ. 9 ตำบลลำแก่น อำเภอท้ายเหมือง จังหวัดพังงา 82120" }
          };
          const defaultPark = DEFAULT_PARK_INFO[targetParkId] || DEFAULT_PARK_INFO[1];

          setParkData({
            parkId: dbPark.parkId || targetParkId,
            parkName: cleanName(dbPark.name),
            openHours: `เปิดทุกวัน ตั้งแต่เวลา ${openStr} น. - ${closeStr} น.`,
            description: dbPark.description || DEFAULT_PARK_DATA.description,
            address: (dbPark.address && dbPark.address.trim() !== "") ? dbPark.address : defaultPark.address,
            location: (dbPark.location && dbPark.location.trim() !== "") ? dbPark.location : defaultPark.location,
            eventNote: dbPark.eventNote || "เปิดให้บริการตามปกติ",
            status: dbPark.status || "เปิดตามปกติ",
            image: dbPark.image || "https://images.unsplash.com/photo-1511497584788-8767611136f6"
          });
        }
      } catch (e) {
        console.warn("Could not fetch park detail from DB API", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchParkFromDb();
  }, []);

  const getCoordinates = (locStr: string) => {
    if (!locStr) return null;
    const matches = locStr.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    if (matches && matches[1] && matches[2]) {
      return { lat: matches[1], lng: matches[2] };
    }
    return null;
  };

  const getMapEmbedUrl = (locStr: string, nameStr: string) => {
    if (nameStr) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(nameStr)}&hl=th&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    const coords = getCoordinates(locStr);
    if (coords) {
      return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&hl=th&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(nameStr)}&hl=th&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const openGoogleMaps = () => {
    if (!parkData) return;
    if (parkData.parkName) {
      window.open(`https://www.google.com/maps/place/${encodeURIComponent(parkData.parkName)}`, "_blank");
    } else {
      const coords = getCoordinates(parkData.location);
      if (coords) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`, "_blank");
      }
    }
  };

  if (isLoading || !parkData) {
    return (
      <div className="max-w-5xl mx-auto py-20 flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600">กำลังดึงข้อมูลอุทยานประจำตำแหน่งจากฐานข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-12 font-sans">
      
      {/* 1. HERO BANNER CARD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-green-800 to-teal-900 text-white shadow-xl">
        {/* Background decorative pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#2ebb5e_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl"></div>

        <div className="relative p-6 md:p-8 space-y-6">
          {/* Top Bar: Nav Breadcrumb & Action Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-700/50 pb-4">
            <div className="flex items-center space-x-2 text-emerald-200 text-xs font-medium">
              <Trees className="w-4 h-4 text-emerald-400" />
              <span>ข้อมูลอุทยานแห่งชาติ</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60" />
              <span className="text-white font-semibold">{parkData.parkName}</span>
            </div>

            {canEditDetails && (
              <button
                onClick={() => router.push("/ranger/edit-park-details")}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>แก้ไขข้อมูลอุทยาน</span>
              </button>
            )}
          </div>

          {/* Main Title & Dynamic Badges */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[11px] font-semibold">
                <Trees className="w-3 h-3 text-emerald-400" />
                <span>อุทยานแห่งชาติแห่งประเทศไทย</span>
              </span>
              {(parkData.parkId === 1 || parkData.parkId === 2) && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[11px] font-semibold">
                  <Globe2 className="w-3 h-3 text-amber-400" />
                  <span>UNESCO World Heritage Site</span>
                </span>
              )}
              {parkData.parkId === 1 && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full text-[11px] font-semibold">
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  <span>อุทยานแห่งชาติแห่งแรกของไทย</span>
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {parkData.parkName}
              </h1>
              <p className="text-emerald-200 text-xs md:text-sm flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{parkData.address}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS & QUICK HIGHLIGHTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100/80 flex items-center space-x-3 hover:border-emerald-300 transition-colors">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">สถานะเปิดทำการ</p>
            <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {parkData.status}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100/80 flex items-center space-x-3 hover:border-emerald-300 transition-colors">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">เวลาให้บริการ</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">{parkData.openHours.replace("เปิดทุกวัน ตั้งแต่เวลา ", "")}</p>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Description & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Detailed Narrative Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-150 p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
              <h2 className="text-sm font-bold text-slate-800">เกี่ยวกับ{parkData.parkName}</h2>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed text-justify space-y-2 font-normal whitespace-pre-line">
              {parkData.description}
            </p>
          </div>

          {/* Park Features & Highlights */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-150 p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
              <h2 className="text-sm font-bold text-slate-800">กิจกรรมและจุดเด่นของอุทยาน</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-lg border border-slate-150 transition-colors flex items-center space-x-3">
                <div className="p-2.5 bg-white text-emerald-600 rounded-md shadow-xs shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">เส้นทางศึกษาธรรมชาติ</h4>
                  <p className="text-[11px] text-slate-500">เดินป่าชมความสมบูรณ์ของระบบนิเวศ</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-lg border border-slate-150 transition-colors flex items-center space-x-3">
                <div className="p-2.5 bg-white text-amber-600 rounded-md shadow-xs shrink-0">
                  <Tent className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">พื้นที่กางเต็นท์พักแรม</h4>
                  <p className="text-[11px] text-slate-500">สัมผัสบรรยากาศและธรรมชาติอย่างใกล้ชิด</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-lg border border-slate-150 transition-colors flex items-center space-x-3">
                <div className="p-2.5 bg-white text-teal-600 rounded-md shadow-xs shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">จุดชมวิวทิวทัศน์</h4>
                  <p className="text-[11px] text-slate-500">จุดถ่ายภาพและชมทิวทัศน์ธรรมชาติ</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-lg border border-slate-150 transition-colors flex items-center space-x-3">
                <div className="p-2.5 bg-white text-purple-600 rounded-md shadow-xs shrink-0">
                  <Trees className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">ศูนย์บริการนักท่องเที่ยว</h4>
                  <p className="text-[11px] text-slate-500">อำนวยความสะดวกและให้ข้อมูลการเดินทาง</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Hours & Location Details */}
        <div className="space-y-6">
          
          {/* Operating Hours Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-150 p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800">เวลาเปิดทำการ &amp; ด่าน</h3>
            </div>

            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/70 rounded-lg space-y-1.5">
              <p className="text-xs font-bold text-emerald-900">{parkData.openHours}</p>
              <p className="text-[11px] text-emerald-700">{parkData.eventNote}</p>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1 pt-1">
              <p className="flex justify-between">
                <span>ค่าบริการชาวไทย:</span>
                <span className="font-semibold text-slate-700">ผู้ใหญ่ 40 บาท / เด็ก 20 บาท</span>
              </p>
              <p className="flex justify-between">
                <span>ค่าบริการชาวต่างชาติ:</span>
                <span className="font-semibold text-slate-700">ผู้ใหญ่ 400 บาท / เด็ก 200 บาท</span>
              </p>
            </div>
          </div>

          {/* Location & Map Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-150 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800">ที่ตั้งและการเดินทาง (Google Maps)</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Map
              </span>
            </div>

            {/* Interactive Embedded Google Map */}
            <div className="relative w-full h-48 md:h-56 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
              <iframe
                title="Google Maps Location"
                width="100%"
                height="100%"
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
                src={getMapEmbedUrl(parkData.location, parkData.parkName)}
              ></iframe>
              <button
                onClick={openGoogleMaps} 
                className="absolute top-2 right-2 bg-slate-900/85 hover:bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-all flex items-center gap-1 shadow-md backdrop-blur-xs"
              >
                <span>ขยายแผนที่</span>
                <ExternalLink className="w-3 h-3 text-emerald-400" />
              </button>
            </div>

            <div className="space-y-2 text-xs pt-1">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">ที่อยู่</span>
                <p className="font-medium text-slate-700 leading-normal">{parkData.address}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">พิกัดสถานที่ (Coordinates)</span>
                <p className="font-medium text-slate-700 font-mono text-[11px]">{parkData.location}</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
