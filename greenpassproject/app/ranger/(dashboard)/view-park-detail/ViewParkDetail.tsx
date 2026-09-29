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
  Info,
  Calendar,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  BookmarkCheck,
  Sparkles,
  Maximize2,
  X
} from "lucide-react";
import { parkApi, rangerApi, getBaseURL } from "@/service/api";

interface ParkDetailState {
  parkId: number;
  parkName: string;
  image: string;
  address: string;
  location: string;
  description: string;
  openTime: string;
  closeTime: string;
  openHours: string;
  isSeasonalPark: boolean;
  isTemporaryClosed: boolean;
  seasonOpenDate: string;
  seasonCloseDate: string;
  eventNote: string;
  status: string;
}

const DEFAULT_PARK_DATA: ParkDetailState = {
  parkId: 4,
  parkName: "อุทยานแห่งชาติดอยสุเทพ-ปุย",
  image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa",
  address: "ถนนศรีวิชัย ตำบลสุเทพ อำเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่ 50200",
  location: "18.8070052, 98.9160906",
  description: "อุทยานแห่งชาติดอยสุเทพ-ปุย ตั้งอยู่ในท้องที่อำเภอเมือง อำเภอแม่ริม และอำเภอหางดง จังหวัดเชียงใหม่ ครอบคลุมพื้นที่ป่าอนุรักษ์ประมาณ 261 ตารางกิโลเมตร เป็นแหล่งรวมความอุดมสมบูรณ์ทางธรรมชาติและมรดกทางประวัติศาสตร์วัฒนธรรมอันล้ำค่าคู่เมืองเชียงใหม่ มียอดดอยปุยเป็นจุดสูงสุดที่ระดับความสูง 1,685 เมตรจากระดับน้ำทะเล สภาพป่าไม้มีความหลากหลายทั้งป่าเต็งรัง ป่าเบญจพรรณ และป่าดิบเขาเขียวชอุ่มตลอดทั้งปี เป็นถิ่นอาศัยของนกนานาชนิดกว่า 360 สายพันธุ์ สัตว์ป่าหายาก และพืชพรรณเมืองหนาวหลากสายพันธุ์\n\nภายในพื้นที่อุทยานเป็นที่ตั้งของสถานที่สำคัญทางประวัติศาสตร์และปูชนียสถานศักดิ์สิทธิ์ ได้แก่ วัดพระธาตุดอยสุเทพราชวรวิหาร พระตำหนักภูพิงคราชนิเวศน์ ยอดดอยปุย และหมู่บ้านชาวไทยภูเขาเผ่าม้ง นอกจากนี้ยังมีแหล่งท่องเที่ยวทางธรรมชาติที่มีชื่อเสียงระดับประเทศ เช่น น้ำตกห้วยแก้ว น้ำตกมณฑาธาร น้ำตกแม่สา และจุดชมทัศนียภาพเมืองเชียงใหม่ ทั้งยังมีเส้นทางศึกษาธรรมชาติหลากหลายเส้นทางที่เหมาะสำหรับนักท่องเที่ยวสายเดินป่าและการท่องเที่ยวเชิงนิเวศอย่างแท้จริง",
  openTime: "06:00",
  closeTime: "18:00",
  openHours: "เปิดทุกวัน ตั้งแต่เวลา 06.00 น. - 18.00 น.",
  isSeasonalPark: false,
  isTemporaryClosed: false,
  seasonOpenDate: "2026-01-01",
  seasonCloseDate: "2026-12-31",
  eventNote: "ด่านตรวจห้วยแก้ว (กม. 1) & ด่านตรวจดอยปุย (กม.22)",
  status: "เปิดตามปกติ"
};

export const parseDateParts = (dateStr?: string) => {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // Try YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  if (clean.includes("-")) {
    const parts = clean.split("T")[0].split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return { year, month, day };
      }
    }
  }

  // Try MM/DD/YYYY or DD/MM/YYYY or YYYY/MM/DD
  if (clean.includes("/")) {
    const parts = clean.split("/");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return {
          year: parseInt(parts[0], 10),
          month: parseInt(parts[1], 10),
          day: parseInt(parts[2], 10)
        };
      } else if (parts[2].length === 4) {
        const year = parseInt(parts[2], 10);
        const p0 = parseInt(parts[0], 10);
        const p1 = parseInt(parts[1], 10);
        if (p0 > 12) {
          return { year, month: p1, day: p0 };
        } else if (p1 > 12) {
          return { year, month: p0, day: p1 };
        } else {
          return { year, month: p0, day: p1 };
        }
      }
    }
  }

  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate()
    };
  }

  return null;
};

export const formatThaiDate = (dateStr?: string) => {
  const parsed = parseDateParts(dateStr);
  if (!parsed) return dateStr || "ไม่ระบุ";
  const { year, month, day } = parsed;
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const thaiYear = year > 2400 ? year : year + 543;
  const mName = (month >= 1 && month <= 12) ? months[month - 1] : "";
  return `${day} ${mName} ${thaiYear}`;
};

export const formatNumericDate = (dateStr?: string) => {
  const parsed = parseDateParts(dateStr);
  if (!parsed) return dateStr || "-";
  const { year, month, day } = parsed;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(day)}/${pad(month)}/${year}`;
};

export const checkIsCurrentSeason = (openDateStr?: string, closeDateStr?: string) => {
  const open = parseDateParts(openDateStr);
  const close = parseDateParts(closeDateStr);
  if (!open || !close) return { inSeason: true, label: "เปิดให้บริการตามปกติ" };

  const now = new Date();
  const currentVal = (now.getMonth() + 1) * 100 + now.getDate();
  const openVal = open.month * 100 + open.day;
  const closeVal = close.month * 100 + close.day;

  let inSeason = false;
  if (closeVal >= openVal) {
    inSeason = currentVal >= openVal && currentVal <= closeVal;
  } else {
    inSeason = currentVal >= openVal || currentVal <= closeVal;
  }

  return {
    inSeason,
    label: inSeason ? "อยู่ในช่วงเปิดฤดูกาลท่องเที่ยว" : "อยู่นอกฤดูกาลท่องเที่ยว (ปิดฟื้นฟูธรรมชาติ)"
  };
};

export const formatParkImageUrl = (img?: string | null): string => {
  if (!img) return "";
  const trimmed = img.trim();
  if (!trimmed || trimmed === "-" || trimmed === "null" || trimmed === "undefined") return "";
  if (trimmed.startsWith("data:") || trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  const baseUrl = typeof getBaseURL === "function" ? getBaseURL() : "http://localhost:8081/api/v1";
  if (trimmed.startsWith("/uploads/") || trimmed.includes("uploads/")) {
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${baseUrl}${cleanPath}`;
  }
  if (!trimmed.includes("/")) {
    return `${baseUrl}/uploads/park/${trimmed}`;
  }
  if (trimmed.startsWith("/")) {
    return `${baseUrl}${trimmed}`;
  }
  return `${baseUrl}/${trimmed}`;
};

const getParkImage = (parkId: number, fallbackImg?: string) => {
  if (typeof window !== "undefined" && parkId) {
    const customLocal = localStorage.getItem(`greenpass_park_img_${parkId}`);
    if (customLocal) {
      const formatted = formatParkImageUrl(customLocal);
      if (formatted) return formatted;
    }
  }
  if (fallbackImg) {
    const formatted = formatParkImageUrl(fallbackImg);
    if (formatted) return formatted;
  }
  return "https://images.unsplash.com/photo-1544735716-392fe2489ffa";
};

export const computeEffectiveStatus = (isTempClosed?: boolean, open?: string, close?: string) => {
  if (isTempClosed) {
    return {
      statusText: "ปิดบริการชั่วคราว",
      isOpen: false,
      badgeText: "⚠️ ปิดบริการชั่วคราว",
      subtext: "ปิดบริการชั่วคราวเนื่องจากเหตุฉุกเฉินหรือสภาพอากาศ"
    };
  }

  if (!open || !close) {
    return {
      statusText: "เปิดตามปกติ",
      isOpen: true,
      badgeText: "✨ พร้อมเปิดให้บริการ",
      subtext: "เปิดบริการนักท่องเที่ยวตามปกติ"
    };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseMinutes = (t: string) => {
    const clean = t.trim().substring(0, 5);
    const parts = clean.split(":");
    if (parts.length === 2) {
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
    }
    return null;
  };

  const openM = parseMinutes(open);
  const closeM = parseMinutes(close);

  if (openM !== null && closeM !== null) {
    let isOpen = false;
    if (closeM >= openM) {
      isOpen = currentMinutes >= openM && currentMinutes < closeM;
    } else {
      isOpen = currentMinutes >= openM || currentMinutes < closeM;
    }

    if (isOpen) {
      return {
        statusText: "เปิดตามปกติ",
        isOpen: true,
        badgeText: "✨ พร้อมเปิดให้บริการ",
        subtext: ""
      };
    } else {
      return {
        statusText: "ปิดให้บริการ",
        isOpen: false,
        badgeText: "🌙 อยู่นอกเวลาทำการ",
        subtext: ""
      };
    }
  }

  return {
    statusText: "เปิดตามปกติ",
    isOpen: true,
    badgeText: "✨ พร้อมเปิดให้บริการ",
    subtext: ""
  };
};

export default function ViewParkDetail() {
  const router = useRouter();
  const [parkData, setParkData] = useState<ParkDetailState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canEditDetails, setCanEditDetails] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);

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
      // 1. Instant local cache hydration
      const savedParkData = typeof window !== "undefined" ? localStorage.getItem("greenpass_park_saved_data") : null;
      const storedRanger = typeof window !== "undefined" ? localStorage.getItem("ranger_username") : null;
      const storedParkId = typeof window !== "undefined" ? localStorage.getItem("ranger_park_id") : null;

      let targetParkId = 4; // Default to Doi Suthep-Pui or stored
      if (storedParkId && !isNaN(Number(storedParkId)) && Number(storedParkId) > 0) {
        targetParkId = Number(storedParkId);
      }

      if (savedParkData) {
        try {
          const parsed = JSON.parse(savedParkData);
          if (parsed && parsed.name && (parsed.parkId === targetParkId || !parsed.parkId)) {
            let loc = parsed.location || "";
            if (loc.includes("99.6317361")) {
              loc = loc.replace("99.6317361", "99.5317361");
            }
            const cachedLocalImg = typeof window !== "undefined" ? localStorage.getItem(`greenpass_park_img_${targetParkId}`) : null;
            setParkData({
              parkId: targetParkId,
              parkName: parsed.name,
              image: cachedLocalImg || parsed.image || DEFAULT_PARK_DATA.image,
              address: parsed.address || DEFAULT_PARK_DATA.address,
              location: loc || DEFAULT_PARK_DATA.location,
              description: (parsed.description && parsed.description.length > 200) ? parsed.description : DEFAULT_PARK_DATA.description,
              openTime: parsed.openTime || "06:00",
              closeTime: parsed.closeTime || "18:00",
              openHours: parsed.openHours || "เปิดทุกวัน ตั้งแต่เวลา 06.00 น. - 18.00 น.",
              isSeasonalPark: Boolean(parsed.isSeasonalPark),
              isTemporaryClosed: Boolean(parsed.isTemporaryClosed),
              seasonOpenDate: parsed.seasonOpenDate || "2026-01-01",
              seasonCloseDate: parsed.seasonCloseDate || "2026-12-31",
              eventNote: parsed.eventNote || DEFAULT_PARK_DATA.eventNote,
              status: parsed.status || "เปิดตามปกติ"
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
          const openStr = dbPark.openTime ? formatTime(dbPark.openTime) : "06:00";
          const closeStr = dbPark.closeTime ? formatTime(dbPark.closeTime) : "18:00";

          const DEFAULT_PARK_INFO: Record<number, { location: string; address: string }> = {
            1: { location: "14.3109229, 101.5304415", address: "ศูนย์บริการนักท่องเที่ยว ตู้ปณ. 9 ตำบลหมูสี อำเภอปากช่อง จังหวัดนครราชสีมา 30130" },
            2: { location: "12.8850041, 99.5317361", address: "ต.แก่งกระจาน อ.แก่งกระจาน จ.เพชรบุรี 76170" },
            3: { location: "14.3755029, 99.1426559", address: "ต.ท่ากระดาน อ.ศรีสวัสดิ์ จ.กาญจนบุรี 71250" },
            4: { location: "18.8070052, 98.9160906", address: "ถนนศรีวิชัย ตำบลสุเทพ อำเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่ 50200" },
            5: { location: "18.5356313, 98.519549", address: "119 หมู่ 7 ตำบลบ้านหลวง อำเภอจอมทอง จังหวัดเชียงใหม่ 50160" },
            6: { location: "19.3051, 98.6015", address: "ต.กึ้ดช้าง อ.แม่แตง จ.เชียงใหม่ 50150" },
            7: { location: "8.6500, 97.6333", address: "ตู้ ปณ. 9 ตำบลลำแก่น อำเภอท้ายเหมือง จังหวัดพังงา 82120" }
          };
          const defaultPark = DEFAULT_PARK_INFO[targetParkId] || DEFAULT_PARK_INFO[4] || DEFAULT_PARK_INFO[1];

          let loc = (dbPark.location && dbPark.location.trim() !== "") ? dbPark.location : defaultPark.location;
          if (loc.includes("99.6317361")) {
            loc = loc.replace("99.6317361", "99.5317361");
          }

          const savedParkData = typeof window !== "undefined" ? localStorage.getItem("greenpass_park_saved_data") : null;
          let parsedSaved: any = null;
          if (savedParkData) {
            try {
              parsedSaved = JSON.parse(savedParkData);
            } catch (e) {}
          }
          const cachedLocalImg = typeof window !== "undefined" ? localStorage.getItem(`greenpass_park_img_${targetParkId}`) : null;

          setParkData({
            parkId: dbPark.parkId || targetParkId,
            parkName: cleanName(dbPark.name),
            image: cachedLocalImg || dbPark.image || DEFAULT_PARK_DATA.image,
            address: (dbPark.address && dbPark.address.trim() !== "") ? dbPark.address : defaultPark.address,
            location: loc,
            description: dbPark.description || DEFAULT_PARK_DATA.description,
            openTime: openStr,
            closeTime: closeStr,
            openHours: `เปิดทุกวัน ตั้งแต่เวลา ${openStr} น. - ${closeStr} น.`,
            isSeasonalPark: dbPark.isSeasonalPark !== undefined ? Boolean(dbPark.isSeasonalPark) : (parsedSaved?.isSeasonalPark !== undefined ? Boolean(parsedSaved.isSeasonalPark) : false),
            isTemporaryClosed: dbPark.isTemporaryClosed !== undefined ? Boolean(dbPark.isTemporaryClosed) : (parsedSaved?.isTemporaryClosed !== undefined ? Boolean(parsedSaved.isTemporaryClosed) : false),
            seasonOpenDate: dbPark.seasonOpenDate || parsedSaved?.seasonOpenDate || "2026-01-01",
            seasonCloseDate: dbPark.seasonCloseDate || parsedSaved?.seasonCloseDate || "2026-12-31",
            eventNote: dbPark.eventNote || DEFAULT_PARK_DATA.eventNote,
            status: dbPark.status || "เปิดตามปกติ"
          });
        }
      } catch (e) {
        console.warn("Could not fetch park detail from DB API", e);
        if (!parkData) {
          setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
        }
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

  const getMapEmbedUrl = (locStr: string, nameStr: string, addressStr?: string) => {
    if (nameStr) {
      const query = addressStr ? `${nameStr} ${addressStr}` : nameStr;
      return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=th&z=14&ie=UTF8&iwloc=&output=embed`;
    }
    const coords = getCoordinates(locStr);
    if (coords) {
      return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&hl=th&z=14&ie=UTF8&iwloc=&output=embed`;
    }
    return `https://maps.google.com/maps?q=อุทยานแห่งชาติ&hl=th&z=14&ie=UTF8&iwloc=&output=embed`;
  };

  const openGoogleMaps = () => {
    if (!parkData) return;
    if (parkData.parkName) {
      const query = parkData.address ? `${parkData.parkName} ${parkData.address}` : parkData.parkName;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank");
    } else {
      const coords = getCoordinates(parkData.location);
      if (coords) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`, "_blank");
      }
    }
  };

  if (error && !parkData) {
    return (
      <div className="max-w-md mx-auto py-24 flex flex-col items-center justify-center space-y-4 font-sans text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shadow-md">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <p className="text-sm font-bold text-slate-700">ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง</p>
        <button
          onClick={() => { setError(null); setIsLoading(true); window.location.reload(); }}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  if (isLoading || !parkData) {
    return (
      <div className="max-w-5xl mx-auto py-24 flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600">กำลังดึงข้อมูลอุทยานประจำตำแหน่งจากฐานข้อมูล...</p>
      </div>
    );
  }

  const displayImage = getParkImage(parkData.parkId, parkData.image);
  const liveStatus = computeEffectiveStatus(parkData.isTemporaryClosed, parkData.openTime, parkData.closeTime);
  const seasonStatus = checkIsCurrentSeason(parkData.seasonOpenDate, parkData.seasonCloseDate);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-12 font-sans px-2 sm:px-4">
      
      {/* 1. HERO BANNER CARD (Showcases Park Cover Image, ID & Badges) */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl border border-emerald-900/40">
        
        {/* Background Park Cover Image with Gradient Overlay */}
        {displayImage && (
          <img 
            src={displayImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 opacity-60 scale-105"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.triedGeneral && target.src.includes("/uploads/park/")) {
                target.dataset.triedGeneral = "true";
                target.src = target.src.replace("/uploads/park/", "/uploads/general/");
                return;
              }
              target.src = "https://images.unsplash.com/photo-1544735716-392fe2489ffa";
            }}
          />
        )}
        
        {/* Gradients to keep typography crisp and readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-emerald-950/90 to-slate-900/80 backdrop-blur-[2px]" />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#2ebb5e_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6 md:p-8 space-y-6">
          {/* Top Bar: Nav Breadcrumb, Park ID & Action Button */}
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
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>แก้ไขข้อมูลอุทยาน</span>
              </button>
            )}
          </div>

          {/* Main Title & Dynamic Badges */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[11px] font-semibold backdrop-blur-md">
                <Trees className="w-3 h-3 text-emerald-400" />
                <span>อุทยานแห่งชาติแห่งประเทศไทย</span>
              </span>

              {/* isSeasonalPark Badge */}
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md ${
                parkData.isSeasonalPark 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              }`}>
                <Calendar className="w-3 h-3" />
                <span>{parkData.isSeasonalPark ? "🍂 อุทยานเปิดตามฤดูกาล" : "🌿 เปิดให้บริการตลอดทั้งปี"}</span>
              </span>

              {/* isTemporaryClosed / Live Operating Hours Badge */}
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md ${
                parkData.isTemporaryClosed 
                  ? "bg-rose-500/25 text-rose-200 border-rose-500/50 shadow-sm animate-pulse" 
                  : (liveStatus.isOpen 
                      ? "bg-teal-500/20 text-teal-300 border-teal-500/40" 
                      : "bg-slate-700/50 text-slate-300 border-slate-600/50")
              }`}>
                {parkData.isTemporaryClosed ? (
                  <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-3 h-3 text-teal-400 shrink-0" />
                )}
                <span>{liveStatus.badgeText}</span>
              </span>

              {/* Status Badge */}
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 text-white border border-white/20 rounded-full text-[11px] font-semibold backdrop-blur-md">
                <span className={`w-2 h-2 rounded-full ${
                  parkData.isTemporaryClosed 
                    ? "bg-rose-400 animate-pulse" 
                    : (liveStatus.isOpen ? "bg-emerald-400 animate-pulse" : "bg-amber-400")
                }`}></span>
                <span>สถานะ: {liveStatus.statusText}</span>
              </span>

              {(parkData.parkId === 1 || parkData.parkId === 2) && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[11px] font-semibold">
                  <Globe2 className="w-3 h-3 text-amber-400" />
                  <span>UNESCO World Heritage Site</span>
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                {parkData.parkName}
              </h1>
              <p className="text-emerald-200 text-xs md:text-sm flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{parkData.address}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS & QUICK HIGHLIGHTS GRID */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${parkData.isSeasonalPark ? "lg:grid-cols-4" : "lg:grid-cols-2"} gap-4`}>
        
        {/* Card 1: Status & Temporary Closed Flag */}
        <div className={`p-4 sm:p-5 rounded-2xl shadow-sm border flex items-center space-x-3.5 hover:shadow-md transition-all ${
          parkData.isTemporaryClosed
            ? "bg-rose-50/70 border-rose-200 hover:border-rose-300"
            : (liveStatus.isOpen
                ? "bg-white border-emerald-100 hover:border-emerald-300"
                : "bg-slate-50/80 border-slate-200 hover:border-slate-300")
        }`}>
          <div className={`p-3 rounded-xl shrink-0 ${
            parkData.isTemporaryClosed
              ? "bg-rose-100 text-rose-600"
              : (liveStatus.isOpen ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-700")
          }`}>
            {parkData.isTemporaryClosed ? (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 tracking-wider">สถานะเปิดทำการ</p>
            <p className="text-sm font-black text-slate-900 flex items-center gap-1.5 mt-0.5 truncate">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                parkData.isTemporaryClosed 
                  ? "bg-rose-500 animate-pulse" 
                  : (liveStatus.isOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500")
              }`}></span>
              {liveStatus.statusText}
            </p>
            {liveStatus.subtext ? (
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                {liveStatus.subtext}
              </p>
            ) : null}
          </div>
        </div>

        {/* Card 2: Daily Hours (openTime - closeTime) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-emerald-100 flex items-center space-x-3.5 hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 tracking-wider">เวลาให้บริการประจำวัน</p>
            <p className="text-sm font-black text-slate-900 mt-0.5 truncate">
              {parkData.openTime} น. - {parkData.closeTime} น.
            </p>
            <p className="text-[11px] text-slate-500 font-medium truncate">เปิดทำการทุกวันตลอดสัปดาห์</p>
          </div>
        </div>

        {/* Seasonal Cards (Only displayed when isSeasonalPark is true) */}
        {parkData.isSeasonalPark && (
          <>
            {/* Card 3: วันที่เริ่มเปิดฤดูกาลท่องเที่ยว */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-emerald-100 flex items-center space-x-3.5 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-400 tracking-wider">วันที่เริ่มเปิดฤดูกาลท่องเที่ยว</p>
                <p className="text-sm font-black text-slate-900 mt-0.5 truncate">
                  {formatThaiDate(parkData.seasonOpenDate)}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                    {formatNumericDate(parkData.seasonOpenDate)}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate">
                    เปิดรับนักท่องเที่ยว
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: วันที่สิ้นสุดฤดูกาลท่องเที่ยว */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-teal-100 flex items-center space-x-3.5 hover:border-teal-300 hover:shadow-md transition-all">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-400 tracking-wider">วันที่สิ้นสุดฤดูกาลท่องเที่ยว</p>
                <p className="text-sm font-black text-slate-900 mt-0.5 truncate">
                  {formatThaiDate(parkData.seasonCloseDate)}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60">
                    {formatNumericDate(parkData.seasonCloseDate)}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate">
                    สิ้นสุดฤดูกาลท่องเที่ยว
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* 3. MAIN CONTENT CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Description, Event Note, Features & Database Schema Matrix */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Detailed Narrative Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <div className="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
              <h2 className="text-sm font-extrabold text-slate-900">เกี่ยวกับ{parkData.parkName}</h2>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-justify font-normal whitespace-pre-line">
              {parkData.description}
            </p>
          </div>

          {/* Event & Checkpoint Notes Card */}
          <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50 rounded-2xl border border-emerald-200/80 p-5 space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <BookmarkCheck className="w-4 h-4 text-emerald-600" />
              <span>จุดบริการ ด่านตรวจ & ข้อมูลการเข้าอุทยาน</span>
            </div>
            <p className="text-xs font-semibold text-slate-800 leading-relaxed pl-6">
              {parkData.eventNote}
            </p>
          </div>

          {/* Park Features & Highlights */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <div className="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
              <h2 className="text-sm font-extrabold text-slate-900">กิจกรรมและจุดเด่นของอุทยาน</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-150 transition-colors flex items-center space-x-3">
                <div className="p-2.5 bg-white text-emerald-600 rounded-lg shadow-xs shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">เส้นทางศึกษาธรรมชาติ</h4>
                  <p className="text-[11px] text-slate-500">เดินป่าชมความสมบูรณ์ของระบบนิเวศ</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-150 transition-colors flex items-center space-x-3">
                <div className="p-2.5 bg-white text-amber-600 rounded-lg shadow-xs shrink-0">
                  <Tent className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">พื้นที่กางเต็นท์พักแรม</h4>
                  <p className="text-[11px] text-slate-500">สัมผัสบรรยากาศและธรรมชาติอย่างใกล้ชิด</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-150 transition-colors flex items-center space-x-3">
                <div className="p-2.5 bg-white text-teal-600 rounded-lg shadow-xs shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">จุดชมวิวทิวทัศน์</h4>
                  <p className="text-[11px] text-slate-500">จุดถ่ายภาพและชมทิวทัศน์ธรรมชาติ</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-150 transition-colors flex items-center space-x-3">
                <div className="p-2.5 bg-white text-purple-600 rounded-lg shadow-xs shrink-0">
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

        {/* Right 1 Col: Park Photo Showcase, Hours & Location Details */}
        <div className="space-y-6">
          
          {/* Park Photo Showcase Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden group">
            
            <div 
              onClick={() => setShowImageModal(true)}
              className="relative w-full bg-slate-900 cursor-pointer overflow-hidden group"
            >
              {/* Main Image - fits container width and automatically determines height based on natural aspect ratio */}
              <img 
                src={displayImage} 
                alt={parkData.parkName}
                className="w-full h-auto block object-cover group-hover:scale-[1.02] transition-transform duration-500"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedGeneral && target.src.includes("/uploads/park/")) {
                    target.dataset.triedGeneral = "true";
                    target.src = target.src.replace("/uploads/park/", "/uploads/general/");
                    return;
                  }
                  target.src = "https://images.unsplash.com/photo-1544735716-392fe2489ffa";
                }}
              />

              {/* Bottom Overlay with Caption & Zoom Prompt */}
              <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end justify-between p-3.5 pointer-events-none">
                <p className="text-xs font-bold text-white drop-shadow-md truncate max-w-[65%]">{parkData.parkName}</p>
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm flex items-center gap-1">
                  <Maximize2 className="w-3 h-3" />
                  <span>คลิกขยายรูป</span>
                </span>
              </div>
            </div>
          </div>

          {/* Operating Hours & Fees Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800">เวลาเปิดทำการ & ค่าธรรมเนียม</h3>
            </div>

            <div className="p-4 bg-emerald-50/80 border border-emerald-200/70 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">เวลาเปิดให้บริการ:</span>
                <span className="text-xs font-black text-emerald-800">{parkData.openTime} น. - {parkData.closeTime} น.</span>
              </div>
              <p className="text-[11px] text-emerald-700">{parkData.eventNote}</p>
            </div>

            <div className="text-[11px] text-slate-500 space-y-2 pt-1 border-t border-slate-100">
              <p className="flex justify-between">
                <span>ค่าบริการชาวไทย:</span>
                <span className="font-bold text-slate-700">ผู้ใหญ่ 40 บาท / เด็ก 20 บาท</span>
              </p>
              <p className="flex justify-between">
                <span>ค่าบริการชาวต่างชาติ:</span>
                <span className="font-bold text-slate-700">ผู้ใหญ่ 400 บาท / เด็ก 200 บาท</span>
              </p>
            </div>
          </div>

          {/* Location & Map Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800">ที่ตั้งและการเดินทาง</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                แผนที่ดาวเทียม
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
                src={getMapEmbedUrl(parkData.location, parkData.parkName, parkData.address)}
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
                <span className="text-[11px] font-bold text-slate-400 block">พิกัดสถานที่</span>
                <p className="font-medium text-slate-700 font-mono text-[11px]">{parkData.location}</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Full-screen Image Preview Modal */}
      {showImageModal && (
        <div 
          onClick={() => setShowImageModal(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn"
        >
          <div className="w-full max-w-5xl flex items-center justify-between text-white pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold">{parkData.parkName} - ภาพหน้าปกอุทยานขนาดเต็ม</span>
            </div>
            <button
              onClick={() => setShowImageModal(false)}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-5xl max-h-[82vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/10 shadow-2xl"
          >
            <img
              src={displayImage}
              alt={parkData.parkName}
              className="max-w-full max-h-[82vh] object-contain rounded-2xl"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.triedGeneral && target.src.includes("/uploads/park/")) {
                  target.dataset.triedGeneral = "true";
                  target.src = target.src.replace("/uploads/park/", "/uploads/general/");
                  return;
                }
                target.src = "https://images.unsplash.com/photo-1544735716-392fe2489ffa";
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
