"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parkApi, rangerApi, fileUploadApi, getBaseURL } from "@/service/api";
import { 
  Trees, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  Image as ImageIcon,
  Upload,
  Trash2,
  RefreshCw,
  Clock,
  MapPin,
  CheckCircle2
} from "lucide-react";

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

export const calculateOperatingStatus = (isTempClosed: boolean, open: string, close: string): string => {
  if (isTempClosed) {
    return "ปิดบริการชั่วคราว";
  }
  if (!open || !close) return "เปิดตามปกติ";

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseMinutes = (t: string) => {
    const parts = t.substring(0, 5).split(":");
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
    return isOpen ? "เปิดตามปกติ" : "ปิดให้บริการ";
  }
  return "เปิดตามปกติ";
};

export default function EditParkDetails() {
  const router = useRouter();

  const [currentParkId, setCurrentParkId] = useState<number>(4);
  const [parkName, setParkName] = useState("");
  const [openTime, setOpenTime] = useState("06:00");
  const [closeTime, setCloseTime] = useState("18:00");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [eventNote, setEventNote] = useState("");
  const [status, setStatus] = useState("เปิดตามปกติ");
  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSeasonalPark, setIsSeasonalPark] = useState(false);
  const [isTemporaryClosed, setIsTemporaryClosed] = useState(false);
  const [seasonOpenDate, setSeasonOpenDate] = useState("2026-01-01");
  const [seasonCloseDate, setSeasonCloseDate] = useState("2026-12-31");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Synchronize status dynamically based on operating hours and temporary closed flag
  useEffect(() => {
    const computed = calculateOperatingStatus(isTemporaryClosed, openTime, closeTime);
    setStatus(computed);
  }, [isTemporaryClosed, openTime, closeTime]);

  // Compress image before saving to base64
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 1600;
          const maxHeight = 1000;
          const quality = 0.8;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = () => resolve("");
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      try {
        const compressed = await compressImage(file);
        setImage(compressed);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setImage(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  useEffect(() => {
    const fetchParkFromDb = async () => {
      setIsFetching(true);
      let targetParkId = 4;

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

          let loc = dbPark.location || "";
          if (loc.includes("99.6317361")) {
            loc = loc.replace("99.6317361", "99.5317361");
          }
          if (targetParkId === 2 && (!loc || loc.includes("99.63"))) {
            loc = "12.8850041, 99.5317361";
          }

          const cachedLocalImg = typeof window !== "undefined" ? localStorage.getItem(`greenpass_park_img_${targetParkId}`) : null;

          setParkName(cleanName(dbPark.name));
          setOpenTime(formatTime(dbPark.openTime) || "06:00");
          setCloseTime(formatTime(dbPark.closeTime) || "18:00");
          setDescription(dbPark.description || "");
          setAddress(dbPark.address || "");
          setLocation(loc);
          setEventNote(dbPark.eventNote || "เปิดให้บริการตามปกติ");
          setStatus(dbPark.status || "เปิดตามปกติ");
          setImage(cachedLocalImg || (dbPark.image ? formatParkImageUrl(dbPark.image) : ""));
          const savedLocal = typeof window !== "undefined" ? localStorage.getItem("greenpass_park_saved_data") : null;
          let parsedSaved: any = null;
          if (savedLocal) {
            try {
              parsedSaved = JSON.parse(savedLocal);
            } catch (e) {}
          }

          setIsSeasonalPark(dbPark.isSeasonalPark !== undefined ? Boolean(dbPark.isSeasonalPark) : Boolean(parsedSaved?.isSeasonalPark));
          setIsTemporaryClosed(dbPark.isTemporaryClosed !== undefined ? Boolean(dbPark.isTemporaryClosed) : Boolean(parsedSaved?.isTemporaryClosed));
          setSeasonOpenDate(dbPark.seasonOpenDate || parsedSaved?.seasonOpenDate || "2026-01-01");
          setSeasonCloseDate(dbPark.seasonCloseDate || parsedSaved?.seasonCloseDate || "2026-12-31");
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
    const cleanImage = image.trim();

    const scriptRegex = /<script\b[^>]*>|<\/script>|javascript:|onerror\s*=|onload\s*=|<iframe\b|<embed\b|<object\b/i;
    if (
      scriptRegex.test(cleanName) ||
      scriptRegex.test(cleanDesc) ||
      scriptRegex.test(cleanAddress) ||
      scriptRegex.test(cleanLocation) ||
      scriptRegex.test(cleanEventNote) ||
      !cleanName || cleanName.length < 4 || cleanName.length > 50 ||
      !cleanDesc || cleanDesc.length < 4 || cleanDesc.length > 5000 ||
      !cleanAddress ||
      !cleanLocation
    ) {
      setError("กรุณากรอกข้อมูลให้ถูกต้อง");
      return;
    }

    setIsLoading(true);
    try {
      let finalImage = cleanImage;

      // 🛑 เมื่อมีการแก้ไขรูปภาพใหม่ ให้อัปโหลดจัดเก็บลงในโฟลเดอร์ park บนเซิร์ฟเวอร์
      if (selectedFile) {
        try {
          const uploadRes = await fileUploadApi.upload(selectedFile, "park");
          const rawName = uploadRes?.result?.fileName || uploadRes?.data?.fileName || uploadRes?.result?.image || uploadRes?.data?.image || uploadRes?.result?.fileUrl || uploadRes?.data?.fileUrl;
          if (rawName) {
            finalImage = rawName.includes("/") ? rawName.substring(rawName.lastIndexOf("/") + 1) : rawName;
          }
        } catch (uploadErr) {
          console.warn("Direct upload error, backend will extract base64 to uploads/park/ directly:", uploadErr);
        }
      } else if (cleanImage) {
        if (!cleanImage.startsWith("data:") && !cleanImage.startsWith("blob:") && !cleanImage.startsWith("http://") && !cleanImage.startsWith("https://")) {
          finalImage = cleanImage.includes("/") ? cleanImage.substring(cleanImage.lastIndexOf("/") + 1) : cleanImage;
        }
      }

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
        status: status || "เปิดตามปกติ",
        image: finalImage,
        isSeasonalPark: Boolean(isSeasonalPark),
        isTemporaryClosed: Boolean(isTemporaryClosed),
        seasonOpenDate: seasonOpenDate || "2026-01-01",
        seasonCloseDate: seasonCloseDate || "2026-12-31"
      };

      const updateRes = await parkApi.updatePark(payload);
      const serverUpdatedImage = updateRes?.result?.image || updateRes?.data?.image;

      // Store in localStorage cache like news, reports, rewards
      if (typeof window !== "undefined") {
        const storedImg = serverUpdatedImage || finalImage;
        if (storedImg) {
          localStorage.setItem(`greenpass_park_img_${currentParkId}`, storedImg);
        } else {
          localStorage.removeItem(`greenpass_park_img_${currentParkId}`);
        }

        const savedData = {
          parkId: currentParkId,
          name: cleanName,
          address: cleanAddress,
          location: cleanLocation,
          description: cleanDesc,
          openTime: openTime.substring(0, 5),
          closeTime: closeTime.substring(0, 5),
          openHours: `เปิดทุกวัน ตั้งแต่เวลา ${openTime} น. - ${closeTime} น.`,
          eventNote: cleanEventNote,
          status,
          image: storedImg,
          isSeasonalPark: Boolean(isSeasonalPark),
          isTemporaryClosed: Boolean(isTemporaryClosed),
          seasonOpenDate: seasonOpenDate || "2026-01-01",
          seasonCloseDate: seasonCloseDate || "2026-12-31"
        };
        localStorage.setItem("greenpass_park_saved_data", JSON.stringify(savedData));
      }

      setSuccess("บันทึกข้อมูลและจัดเก็บรูปภาพลงโฟลเดอร์ park สำเร็จเรียบร้อยแล้ว!");
      setTimeout(() => {
        router.push("/ranger/view-park-detail");
      }, 1000);
    } catch (err) {
      console.error("Park update error:", err);
      setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="max-w-5xl mx-auto py-24 flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600">กำลังโหลดข้อมูลอุทยานจากฐานข้อมูล...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="w-full max-w-[1600px] mx-auto bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-6 md:p-8 font-sans border border-slate-200/90 space-y-6"
    >
      {/* Header Bar */}
      <div className="flex justify-between items-center border-b border-slate-150 pb-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Trees className="w-6 h-6 text-emerald-600" />
            <span>แก้ไขรายละเอียดข้อมูลอุทยานแห่งชาติ</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            ปรับปรุงข้อมูลอุทยาน: รูปภาพหน้าปก เวลาทำการ ฤดูกาล ด่านตรวจ และที่ตั้งอุทยาน
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/ranger/view-park-detail")}
          className="text-sm text-slate-700 hover:text-slate-900 font-bold px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
        >
          &larr; <span>ย้อนกลับ</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-center space-x-2.5 font-medium shadow-xs">
          <span className="font-bold">⚠️</span>
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm flex items-center space-x-2.5 font-semibold shadow-xs">
          <span className="font-bold">✅</span>
          <span>{success}</span>
        </div>
      )}

      {/* 1. Park Name & Image Upload Section */}
      <div className="space-y-4">
        
        {/* Park Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-800" htmlFor="edit-parkName">
            ชื่ออุทยานแห่งชาติ <span className="text-rose-500">*</span>
          </label>
          <input
            id="edit-parkName"
            type="text"
            value={parkName}
            onChange={(e) => setParkName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 text-sm sm:text-base rounded-xl p-3.5 focus:outline-none font-bold transition-colors"
            placeholder="ระบุชื่ออุทยานแห่งชาติ"
          />
        </div>

        {/* Upload Image Section (Stored like News, Rewards, Reports) */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              <span>รูปภาพหน้าปกอุทยานแห่งชาติ</span>
            </span>
            {image && (
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
                มีรูปภาพพร้อมใช้งาน
              </span>
            )}
          </label>

          <div className="w-full min-h-[300px] max-h-[520px] bg-slate-950/5 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl transition-all flex flex-col items-center justify-center relative overflow-hidden group p-3">
            {image ? (
              <div className="relative w-full h-full min-h-[300px] max-h-[500px] flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-slate-950">
                {/* Ambient blurred backdrop for uncropped aspect ratios */}
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-xl opacity-30 scale-110 pointer-events-none"
                  style={{ backgroundImage: `url(${formatParkImageUrl(image)})` }}
                />

                <img 
                  src={formatParkImageUrl(image)} 
                  alt="Park Cover Preview" 
                  className="relative z-10 w-full h-auto max-h-[480px] object-contain rounded-2xl shadow-md mx-auto p-2" 
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
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <label className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 font-bold text-sm rounded-xl cursor-pointer shadow-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95">
                    <RefreshCw className="w-4 h-4 text-emerald-600" />
                    <span>เปลี่ยนรูปภาพใหม่</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setImage("");
                      setSelectedFile(null);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl cursor-pointer shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>ลบรูปภาพ</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="w-full h-full min-h-[220px] flex flex-col items-center justify-center cursor-pointer p-6 text-center hover:bg-slate-50/80 rounded-2xl transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-sm sm:text-base font-bold text-slate-800">คลิกเพื่ออัปโหลดรูปภาพ หรือลากไฟล์มาวางที่นี่</p>
                <p className="text-xs text-slate-500 mt-1">รองรับไฟล์ JPG, PNG, WEBP (ระบบจะจัดเก็บลงฐานข้อมูลและแคชแบบเดียวกับข่าวสารและของรางวัล)</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </div>

      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-slate-800" htmlFor="edit-desc">
          รายละเอียดคำอธิบาย <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="edit-desc"
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 text-sm sm:text-base rounded-xl p-4 leading-relaxed focus:outline-none transition-colors"
          placeholder="ระบุรายละเอียดประวัติความเป็นมา สภาพแวดล้อมทางธรรมชาติ"
        />
      </div>

      {/* 2. Operating Hours & Dynamic Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-800" htmlFor="edit-openTime">
            เวลาเปิดทำการ <span className="text-rose-500">*</span>
          </label>
          <input
            id="edit-openTime"
            type="time"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 text-sm sm:text-base p-3.5 rounded-xl focus:outline-none transition-colors font-bold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-800" htmlFor="edit-closeTime">
            เวลาปิดทำการ <span className="text-rose-500">*</span>
          </label>
          <input
            id="edit-closeTime"
            type="time"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 text-sm sm:text-base p-3.5 rounded-xl focus:outline-none transition-colors font-bold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-800" htmlFor="edit-status">
            สถานะเปิดทำการ <span className="text-emerald-600 text-xs font-semibold">(คำนวณตามเวลาและระบบ)</span>
          </label>
          <div className="relative">
            <div className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-sm sm:text-base font-black transition-all ${
              isTemporaryClosed
                ? "bg-rose-50/80 border-rose-300 text-rose-700 shadow-xs"
                : status === "เปิดตามปกติ"
                  ? "bg-emerald-50/80 border-emerald-300 text-emerald-800 shadow-xs"
                  : "bg-slate-100 border-slate-300 text-slate-700 shadow-xs"
            }`}>
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isTemporaryClosed
                    ? "bg-rose-500 animate-pulse"
                    : status === "เปิดตามปกติ"
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-slate-400"
                }`}></span>
                <span>{status}</span>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                isTemporaryClosed
                  ? "bg-rose-100 text-rose-800 border-rose-300"
                  : status === "เปิดตามปกติ"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-slate-200 text-slate-700 border-slate-300"
              }`}>
                {isTemporaryClosed
                  ? "ปิดบริการชั่วคราว"
                  : status === "เปิดตามปกติ"
                    ? "เปิดบริการ"
                    : "ปิดให้บริการ"}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {isTemporaryClosed
              ? "⚠️ ระบบแสดง 'ปิดบริการชั่วคราว' เนื่องจากมีการติ๊กปิดบริการชั่วคราว"
              : status === "เปิดตามปกติ"
                ? `🟢 แสดง 'เปิดตามปกติ' เนื่องจากเวลาปัจจุบันอยู่ในช่วงเวลาเปิดทำการ (${openTime} - ${closeTime} น.)`
                : `⚪ แสดง 'ปิดให้บริการ' เนื่องจากเวลาปัจจุบันอยู่นอกเวลาเปิดทำการ (${openTime} - ${closeTime} น.)`}
          </p>
        </div>
      </div>

      {/* 3. Seasonal Park Settings (isSeasonalPark, isTemporaryClosed, seasonOpenDate, seasonCloseDate) */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">การตั้งค่าฤดูกาลและการปิดบริการชั่วคราว</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* isSeasonalPark Switch */}
          <label className={`flex items-center space-x-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
            isSeasonalPark 
              ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-200" 
              : "bg-white border-slate-200 hover:border-emerald-300"
          }`}>
            <input
              type="checkbox"
              checked={isSeasonalPark}
              onChange={(e) => setIsSeasonalPark(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <div>
              <p className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                <span>เป็นอุทยานเปิดตามฤดูกาล</span>
                {isSeasonalPark && <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">เปิดใช้งาน</span>}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">เลือกหากมีช่วงปิดฟื้นฟูป่า เช่น หน้าฝนหรือมรสุม เพื่อกำหนดวันเปิด-ปิดฤดูกาล</p>
            </div>
          </label>

          {/* isTemporaryClosed Switch */}
          <label className={`flex items-center space-x-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
            isTemporaryClosed 
              ? "bg-rose-50/70 border-rose-300 ring-2 ring-rose-200" 
              : "bg-white border-slate-200 hover:border-rose-300"
          }`}>
            <input
              type="checkbox"
              checked={isTemporaryClosed}
              onChange={(e) => setIsTemporaryClosed(e.target.checked)}
              className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
            />
            <div>
              <p className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                <span>ปิดบริการชั่วคราว</span>
                {isTemporaryClosed && <span className="text-xs bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold">เปิดใช้งาน</span>}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">เลือกเมื่อมีเหตุฉุกเฉิน ปิดปรับปรุง หรือสภาพอากาศแปรปรวน (จะแสดง 'ปิดบริการชั่วคราว' ที่หน้าอุทยาน)</p>
            </div>
          </label>

        </div>

        {/* Season Dates (Gated by isSeasonalPark) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className={`block text-sm font-bold ${!isSeasonalPark ? "text-slate-400" : "text-slate-800"}`} htmlFor="edit-seasonOpen">
              วันที่เริ่มเปิดฤดูกาลท่องเที่ยว
            </label>
            <input
              id="edit-seasonOpen"
              type="date"
              disabled={!isSeasonalPark}
              value={seasonOpenDate}
              onChange={(e) => setSeasonOpenDate(e.target.value)}
              className={`w-full border rounded-xl p-3.5 focus:outline-none transition-all text-sm font-medium ${
                !isSeasonalPark
                  ? "bg-slate-100/90 text-slate-400 border-slate-200 cursor-not-allowed select-none"
                  : "bg-white text-slate-900 border-slate-200 focus:border-emerald-500 shadow-xs"
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className={`block text-sm font-bold ${!isSeasonalPark ? "text-slate-400" : "text-slate-800"}`} htmlFor="edit-seasonClose">
              วันที่สิ้นสุดฤดูกาลท่องเที่ยว
            </label>
            <input
              id="edit-seasonClose"
              type="date"
              disabled={!isSeasonalPark}
              value={seasonCloseDate}
              onChange={(e) => setSeasonCloseDate(e.target.value)}
              className={`w-full border rounded-xl p-3.5 focus:outline-none transition-all text-sm font-medium ${
                !isSeasonalPark
                  ? "bg-slate-100/90 text-slate-400 border-slate-200 cursor-not-allowed select-none"
                  : "bg-white text-slate-900 border-slate-200 focus:border-emerald-500 shadow-xs"
              }`}
            />
          </div>
        </div>

      </div>

      {/* 4. Gate Info, Coordinates & Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-800" htmlFor="edit-eventNote">
            ข้อมูลด่านตรวจ / หมายเหตุเพิ่มเติม
          </label>
          <input
            id="edit-eventNote"
            type="text"
            value={eventNote}
            onChange={(e) => setEventNote(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 text-sm sm:text-base p-3.5 rounded-xl focus:outline-none transition-colors"
            placeholder="เช่น ด่านตรวจห้วยแก้ว (กม. 1) & ด่านตรวจดอยปุย (กม.22)"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-800" htmlFor="edit-location">
            พิกัดภูมิศาสตร์ <span className="text-rose-500">*</span>
          </label>
          <input
            id="edit-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 text-sm sm:text-base p-3.5 rounded-xl focus:outline-none font-mono transition-colors"
            placeholder="เช่น 18.8070052, 98.9160906"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-slate-800" htmlFor="edit-address">
          ที่ตั้งและที่อยู่ติดต่อ <span className="text-rose-500">*</span>
        </label>
        <input
          id="edit-address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 text-sm sm:text-base p-3.5 rounded-xl focus:outline-none transition-colors"
          placeholder="ระบุที่ตั้ง ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-150">
        <button
          type="button"
          onClick={() => router.push("/ranger/view-park-detail")}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors cursor-pointer"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm sm:text-base font-black rounded-xl shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? "กำลังบันทึกข้อมูล..." : "บันทึกการเปลี่ยนแปลงทั้งหมด"}
        </button>
      </div>
    </form>
  );
}
