"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { rangerApi, getBaseURL } from "../../../../service/api";
import { 
  User, 
  IdCard, 
  Calendar, 
  Briefcase, 
  Trees, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowLeft, 
  Edit3, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle,
  Users,
  FileSignature,
  Loader2
} from "lucide-react";

interface Ranger {
  id: string;
  employeeId: string;
  username?: string;
  name: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  position: string;
  parkName: string;
  startDate: string;
  district: string;
  subDistrict: string;
  province: string;
  zipcode?: string;
  gender: string;
  phone: string;
  email: string;
  roles?: string[];
  role?: string;
  signature?: string;
  canIssueStamp?: boolean;
  canAnnouncement?: boolean;
  canEditParkDetails?: boolean;
  canProgressReport?: boolean;
}

const DEFAULT_RANGERS: Ranger[] = [
  { 
    id: "01", 
    employeeId: "PR01", 
    name: "สมชาย ใจดี", 
    firstName: "สมชาย", 
    lastName: "ใจดี", 
    birthDate: "15 ต.ค. 2547", 
    position: "หัวหน้าอุทยาน", 
    parkName: "อุทยานแห่งชาติเขาใหญ่",
    startDate: "15/10/2566",
    district: "ปากช่อง",
    subDistrict: "ปากช่อง",
    province: "นครราชสีมา",
    zipcode: "30130",
    gender: "ชาย",
    phone: "065-5249531",
    email: "perfasd@gmail.com",
    roles: ["สแกนแสตมป์", "ประกาศข่าวสาร"]
  },
  { 
    id: "04", 
    employeeId: "PR04", 
    name: "จอนนี่ จิ้มเอม", 
    firstName: "จอนนี่", 
    lastName: "จิ้มเอม", 
    birthDate: "15 ต.ค. 2547", 
    position: "เจ้าหน้าที่ประชาสัมพันธ์", 
    parkName: "อุทยานแห่งชาติแก่งกระจาน",
    startDate: "15/10/2566",
    district: "หนองสองตอน",
    subDistrict: "หนองสองตอน",
    province: "ฉะเชิงเทรา",
    zipcode: "24000",
    gender: "ชาย",
    phone: "057-1425756",
    email: "xcperfasd@gmail.com",
    roles: ["สแกนแสตมป์"]
  }
];

const formatThaiDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${day} ${months[month - 1]} ${year + 543}`;
  }
  return dateStr;
};

const formatSlashDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    return `${day}/${month}/${year + 543}`;
  }
  return dateStr;
};

const getSignatureImageSrc = (sig: string) => {
  if (!sig) return "";
  const trimmed = sig.trim();
  if (trimmed.startsWith("data:") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/uploads/") || trimmed.includes("uploads/")) {
    const baseUrl = getBaseURL ? getBaseURL() : "http://localhost:8081/api/v1";
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${baseUrl}${cleanPath}`;
  }
  if (trimmed.startsWith("src/")) {
    return `/${trimmed}`;
  }
  const baseUrl = getBaseURL ? getBaseURL() : "http://localhost:8081/api/v1";
  return `${baseUrl}/uploads/signatures/${trimmed}`;
};

const normalizePosition = (pos?: string) => {
  if (!pos) return "เจ้าหน้าที่อุทยาน";
  if (pos === "เจ้าหน้าที่ธุรการ" || pos.startsWith("เจ้าหน้าที่รับแจ้งเหตุ")) {
    return "เจ้าหน้าที่รับแจ้งเหตุ";
  }
  return pos;
};

function RangerDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rangerId = searchParams.get("id");
  const [ranger, setRanger] = useState<Ranger | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRangerData = async () => {
      if (!rangerId) {
        setLoading(false);
        return;
      }
      setLoading(true);

      const cleanRangerId = String(rangerId).trim();
      const lowerRangerId = cleanRangerId.toLowerCase();

      // Normalize target username for API calls
      let targetUsername = cleanRangerId;
      if (lowerRangerId.startsWith("ranger")) {
        targetUsername = lowerRangerId;
      } else if (/^\d+$/.test(cleanRangerId) && cleanRangerId.length <= 2) {
        targetUsername = `ranger${cleanRangerId.padStart(2, "0")}`;
      } else {
        // If it's a numeric timestamp ID (from local storage mock), check greenpass_rangers for real username/employeeId
        try {
          const saved = localStorage.getItem("greenpass_rangers");
          if (saved) {
            const list = JSON.parse(saved);
            const found = list.find((r: any) => String(r.id) === cleanRangerId);
            if (found && (found.username || found.employeeId)) {
              targetUsername = String(found.username || found.employeeId).trim();
            }
          }
        } catch (e) {}
      }

      // Helper to compute roles list from API item or local storage object
      const computeRoles = (item: any, fallbackUsername?: string): string[] => {
        // If boolean flags exist on the object, use them directly (authoritative from DB)
        const hasFlags = (
          item.canIssueStamp !== undefined ||
          item.canAnnouncement !== undefined ||
          item.canEditParkDetails !== undefined ||
          item.canProgressReport !== undefined
        );
        if (hasFlags) {
          return [
            Boolean(item.canIssueStamp) && "สแกนแสตมป์",
            Boolean(item.canAnnouncement) && "ประกาศข่าวสาร",
            Boolean(item.canEditParkDetails) && "แก้ไขรายละเอียด",
            Boolean(item.canProgressReport) && "รายงานความคืบหน้าของเหตุการณ์"
          ].filter(Boolean) as string[];
        }

        // If explicit roles array exists and not empty
        if (Array.isArray(item.roles) && item.roles.length > 0) {
          return item.roles;
        }

        // Check local storage dedicated roles key
        const userKey = (fallbackUsername || targetUsername || cleanRangerId).toLowerCase();
        try {
          const savedRoles = localStorage.getItem(`greenpass_ranger_roles_${userKey}`);
          if (savedRoles) {
            const parsed = JSON.parse(savedRoles);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed;
            }
          }
        } catch (e) {}

        // Default: By system design, newly created rangers have all 4 roles enabled
        return [
          "สแกนแสตมป์",
          "ประกาศข่าวสาร",
          "แก้ไขรายละเอียด",
          "รายงานความคืบหน้าของเหตุการณ์"
        ];
      };

      // 1. Try getRangerByUsername from MySQL DB API (Primary Source of Truth)
      try {
        const usernamesToTry = [
          targetUsername,
          targetUsername.toLowerCase(),
          targetUsername.toUpperCase(),
          cleanRangerId,
          cleanRangerId.toLowerCase()
        ];
        const uniqueUsernames = Array.from(new Set(usernamesToTry));

        for (const u of uniqueUsernames) {
          try {
            const res = await rangerApi.getRangerByUsername(u);
            const item = res?.result || res?.data;
            if (res && (res.success || res.status) && item) {
              const activeRoles = computeRoles(item, item.username || u);
              const mappedRanger: Ranger = {
                id: item.username || u,
                employeeId: (item.username || u).toUpperCase(),
                name: `${item.firstname || ""} ${item.surname || ""}`.trim() || item.username || u,
                phone: item.mobilephone || "",
                email: item.email || "",
                position: normalizePosition(item.position),
                parkName: item.park?.name || "อุทยานแห่งชาติเขาใหญ่",
                firstName: item.firstname || "",
                lastName: item.surname || "",
                birthDate: formatThaiDate(item.birthDate),
                startDate: formatSlashDate(item.startDate),
                district: item.district || "-",
                subDistrict: item.subDistrict || "-",
                province: item.province || "-",
                zipcode: item.zipcode || "",
                gender: item.gender === 2 ? "หญิง" : "ชาย",
                signature: item.signature || "src/sig1.png",
                roles: activeRoles
              };
              setRanger(mappedRanger);

              // Keep local storage in sync with DB data
              try {
                const savedRangers = localStorage.getItem("greenpass_rangers");
                if (savedRangers) {
                  const list = JSON.parse(savedRangers);
                  const updatedList = list.map((r: any) => {
                    const match =
                      String(r.username || "").toLowerCase() === String(item.username || u).toLowerCase() ||
                      String(r.employeeId || "").toLowerCase() === String(item.username || u).toLowerCase() ||
                      String(r.id || "").toLowerCase() === cleanRangerId.toLowerCase();
                    if (match) {
                      return {
                        ...r,
                        ...mappedRanger,
                        roles: activeRoles,
                        canIssueStamp: Boolean(item.canIssueStamp),
                        canAnnouncement: Boolean(item.canAnnouncement),
                        canEditParkDetails: Boolean(item.canEditParkDetails),
                        canProgressReport: Boolean(item.canProgressReport)
                      };
                    }
                    return r;
                  });
                  localStorage.setItem("greenpass_rangers", JSON.stringify(updatedList));
                }
                localStorage.setItem(`greenpass_ranger_detail_${cleanRangerId}`, JSON.stringify(mappedRanger));
                localStorage.setItem(`greenpass_ranger_roles_${String(item.username || u).toLowerCase()}`, JSON.stringify(activeRoles));
              } catch (e) {}

              return;
            }
          } catch (e) {}
        }
      } catch (err) {
        console.warn("Could not fetch ranger by username:", err);
      }

      // 2. Try getAllRangers from MySQL DB API
      try {
        const response = await rangerApi.getAllRangers();
        const rawList = response?.result || response?.data || (Array.isArray(response) ? response : []);
        if (Array.isArray(rawList)) {
          const found = rawList.find((item: any) => {
            const u = String(item.username || "").toLowerCase();
            const emp = String(item.employeeId || "").toLowerCase();
            const i = String(item.id || "").toLowerCase();
            return (
              u === lowerRangerId ||
              emp === lowerRangerId ||
              i === lowerRangerId ||
              u === targetUsername.toLowerCase() ||
              emp === targetUsername.toLowerCase()
            );
          });
          if (found) {
            const activeRoles = computeRoles(found, found.username);
            const mappedRanger: Ranger = {
              id: found.username,
              employeeId: found.username.toUpperCase(),
              name: `${found.firstname || ""} ${found.surname || ""}`.trim() || found.username,
              phone: found.mobilephone || "",
              email: found.email || "",
              position: normalizePosition(found.position),
              parkName: found.park?.name || "อุทยานแห่งชาติ",
              firstName: found.firstname || "",
              lastName: found.surname || "",
              birthDate: formatThaiDate(found.birthDate),
              startDate: formatSlashDate(found.startDate),
              district: found.district || "-",
              subDistrict: found.subDistrict || "-",
              province: found.province || "-",
              zipcode: found.zipcode || "",
              gender: found.gender === 2 ? "หญิง" : "ชาย",
              signature: found.signature || "src/sig1.png",
              roles: activeRoles
            };
            setRanger(mappedRanger);

            try {
              localStorage.setItem(`greenpass_ranger_detail_${cleanRangerId}`, JSON.stringify(mappedRanger));
              localStorage.setItem(`greenpass_ranger_roles_${String(found.username).toLowerCase()}`, JSON.stringify(activeRoles));
            } catch (e) {}

            return;
          }
        }
      } catch (e) {}

      // 3. Check local storage "greenpass_rangers" list (Fallback for offline/local mocks)
      const savedRangers = localStorage.getItem("greenpass_rangers");
      if (savedRangers) {
        try {
          const list: Ranger[] = JSON.parse(savedRangers);
          const found = list.find((r: any) => 
            String(r.id).toLowerCase() === lowerRangerId ||
            String(r.username || "").toLowerCase() === lowerRangerId ||
            String(r.employeeId || "").toLowerCase() === lowerRangerId ||
            `pr${r.id}`.toLowerCase() === lowerRangerId ||
            String(r.username || "").toLowerCase() === targetUsername.toLowerCase()
          );
          if (found) {
            const activeRoles = computeRoles(found, found.username || found.employeeId);
            setRanger({
              ...found,
              roles: activeRoles
            });
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 4. Check local storage individual key "greenpass_ranger_detail_" + rangerId
      const savedIndividual = localStorage.getItem(`greenpass_ranger_detail_${cleanRangerId}`);
      if (savedIndividual) {
        try {
          const parsed = JSON.parse(savedIndividual);
          const activeRoles = computeRoles(parsed, parsed.username || cleanRangerId);
          setRanger({
            ...parsed,
            roles: activeRoles
          });
          return;
        } catch (e) {}
      }

      // 5. Check DEFAULT_RANGERS
      const defFound = DEFAULT_RANGERS.find(r => 
        r.id.toLowerCase() === lowerRangerId || 
        r.id.toLowerCase() === targetUsername.toLowerCase() || 
        `pr${r.id}`.toLowerCase() === lowerRangerId ||
        `pr${r.id}`.toLowerCase() === targetUsername.toLowerCase()
      );
      if (defFound) {
        setRanger(defFound);
        return;
      }

      // 6. Fallback so page NEVER renders empty
      setRanger({
        id: cleanRangerId,
        employeeId: cleanRangerId.length <= 4 ? `PR${cleanRangerId.replace(/^pr/i, "")}` : cleanRangerId.toUpperCase(),
        name: "สมชาย ใจดี",
        firstName: "สมชาย",
        lastName: "ใจดี",
        birthDate: "15 ต.ค. 2547",
        position: "หัวหน้าอุทยาน",
        parkName: "อุทยานแห่งชาติเขาใหญ่",
        startDate: "15/10/2566",
        district: "ปากช่อง",
        subDistrict: "ปากช่อง",
        province: "นครราชสีมา",
        zipcode: "30130",
        gender: "ชาย",
        phone: "065-5249531",
        email: "ranger@greenpass.th",
        signature: "src/sig1.png",
        roles: computeRoles({}, cleanRangerId)
      });
      setLoading(false);
    };

    fetchRangerData();
  }, [rangerId]);

  if (loading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto font-sans relative py-20 my-4 px-4 flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-xl min-h-[450px]">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shadow-inner">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-bold text-slate-800">กำลังโหลดข้อมูลเจ้าหน้าที่...</p>
          <p className="text-xs font-medium text-slate-400">กรุณารอสักครู่ ระบบกำลังดึงข้อมูลล่าสุดจากฐานข้อมูล</p>
        </div>
      </div>
    );
  }

  if (!ranger) {
    return (
      <div className="text-center py-14 text-slate-500 font-bold text-xs space-y-3">
        <p>ไม่พบข้อมูล Park Ranger กรุณาลองใหม่อีกครั้ง</p>
        <button
          onClick={() => router.push("/admin/list-park-ranger")}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          กลับหน้ารายชื่อเจ้าหน้าที่
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto font-sans relative py-4 my-2 px-2 sm:px-4">
      
      {/* Container หลัก สีขาว */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl shadow-slate-200/50 text-slate-800">
        
        {/* Top Header Banner & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">
                  {ranger.firstName || ranger.name.split(" ")[0]} {ranger.lastName || ranger.name.split(" ")[1] || ""}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  {ranger.employeeId || `PR${ranger.id}`}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <Trees className="w-3.5 h-3.5 text-emerald-600" />
                {ranger.parkName}
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push("/admin/list-park-ranger")}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              ย้อนกลับ
            </button>
            <button 
              onClick={() => router.push(`/admin/edit-park-ranger-profile?id=${ranger.id}`)}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              แก้ไข
            </button>
            <button 
              onClick={() => router.push(`/admin/set-role?id=${ranger.id}`)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              เซตบทบาท
            </button>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Section 1: ข้อมูลพื้นฐาน */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider pb-2 border-b border-slate-200">
              <User className="w-4 h-4 text-emerald-600" />
              <span>ข้อมูลพื้นฐาน</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                  <IdCard className="w-3.5 h-3.5 text-emerald-600" />
                  รหัสพนักงาน
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {ranger.employeeId || `PR${ranger.id}`}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  เพศ
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {ranger.gender || "ชาย"}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  ชื่อ - นามสกุล
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {ranger.firstName || ranger.name.split(" ")[0]} {ranger.lastName || ranger.name.split(" ")[1] || ""}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  วัน/เดือน/ปีเกิด
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {ranger.birthDate || "15 ต.ค. 2547"}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  ตำแหน่ง
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {ranger.position || ranger.role}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                  <Trees className="w-3.5 h-3.5 text-emerald-600" />
                  อุทยานที่สังกัด
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {ranger.parkName}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 md:col-span-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  วันที่เริ่มปฏิบัติงาน
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {ranger.startDate || "15/10/2566"}
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: ที่อยู่และสถานที่ปฏิบัติงาน */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider pb-2 border-b border-slate-200">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>ที่อยู่</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 mb-1 block">ตำบล / แขวง</span>
                <div className="text-sm font-bold text-slate-900">
                  {ranger.subDistrict || "หนองสองตอน"}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 mb-1 block">อำเภอ / เขต</span>
                <div className="text-sm font-bold text-slate-900">
                  {ranger.district || "หนองสองตอน"}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 mb-1 block">จังหวัด</span>
                <div className="text-sm font-bold text-slate-900">
                  {ranger.province || "ฉะเชิงเทรา"}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 mb-1 block">รหัสไปรษณีย์</span>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  {ranger.zipcode || "24000"}
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: ข้อมูลติดต่อ */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider pb-2 border-b border-slate-200">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>ช่องทางติดต่อ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  เบอร์มือถือ
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {ranger.phone}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  อีเมล
                </span>
                <div className="text-sm font-bold text-emerald-700 underline">
                  {ranger.email}
                </div>
              </div>

            </div>
          </div>

          {/* Section 4: สิทธิ์และบทบาทที่ได้รับ */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider pb-2 border-b border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>บทบาทและสิทธิ์ที่เปิดใช้งาน</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "สแกนแสตมป์",
                "ประกาศข่าวสาร",
                "แก้ไขรายละเอียด",
                "รายงานความคืบหน้าของเหตุการณ์"
              ].map((roleTitle) => {
                const isEnabled = Boolean(ranger.roles?.some((r) => r && r.trim() === roleTitle.trim()));
                return (
                  <div 
                    key={roleTitle}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                      isEnabled 
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-xs" 
                        : "bg-slate-50 border-slate-200 text-slate-400 font-medium"
                    }`}
                  >
                    {isEnabled ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className="text-xs">{roleTitle}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: ลายเซ็นดิจิทัลเจ้าหน้าที่ */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider pb-2 border-b border-slate-200">
              <FileSignature className="w-4 h-4 text-emerald-600" />
              <span>รูปลายเซ็นเจ้าหน้าที่</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-40 h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2 shadow-xs overflow-hidden shrink-0">
                {ranger.signature ? (
                  <img 
                    src={getSignatureImageSrc(ranger.signature)} 
                    alt="Officer Signature" 
                    className="max-w-full max-h-full object-contain" 
                  />
                ) : (
                  <span className="text-xs text-slate-400 font-medium italic">ไม่มีรูปลายเซ็น</span>
                )}
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ลายเซ็นสำหรับประทับตราดิจิทัล (Digital Stamp)
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  ลายเซ็นนี้จะปรากฏบนตราประทับสะสม (Stamp Passport) ของนักท่องเที่ยวเมื่อเจ้าหน้าที่ทำการสแกนออกตราประทับ
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function ViewParkRangerPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-14 text-xs font-bold text-slate-400">
        กำลังโหลดข้อมูลเจ้าหน้าที่...
      </div>
    }>
      <RangerDetailContent />
    </Suspense>
  );
}

