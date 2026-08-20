"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { rangerApi } from "../../../../service/api";
import { 
  getProvincesList, 
  getDistrictsByProvince, 
  getSubDistrictsByDistrict 
} from "../../../../data/thaiLocationData";
import { 
  UserCog, 
  IdCard, 
  User, 
  Calendar, 
  Briefcase, 
  Trees, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowLeft, 
  Check, 
  ChevronDown,
  Users
} from "lucide-react";

interface Ranger {
  id: string;
  employeeId: string;
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
  gender: string;
  phone: string;
  email: string;
  role?: string;
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
    gender: "ชาย",
    phone: "065-5249531",
    email: "perfasd@gmail.com"
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
    gender: "ชาย",
    phone: "057-1425756",
    email: "xcperfasd@gmail.com"
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

function EditProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rangerId = searchParams.get("id");

  const [rangers, setRangers] = useState<Ranger[]>([]);
  const [currentRanger, setCurrentRanger] = useState<Ranger | null>(null);

  // Form states based on Page 163
  const [employeeId, setEmployeeId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [position, setPosition] = useState("");
  const [parkName, setParkName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [district, setDistrict] = useState("");
  const [subDistrict, setSubDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRangerData = async () => {
      if (!rangerId) return;

      let foundRanger: Ranger | null = null;

      // 1. Check local storage "greenpass_rangers" list first (handles newly added rangers with timestamp IDs)
      const savedRangers = localStorage.getItem("greenpass_rangers");
      if (savedRangers) {
        try {
          const list: Ranger[] = JSON.parse(savedRangers);
          const found = list.find((r: any) => 
            String(r.id) === String(rangerId) ||
            String(r.username) === String(rangerId) ||
            String(r.employeeId) === String(rangerId) ||
            `PR${r.id}` === rangerId ||
            (r.username && r.username.toLowerCase() === rangerId.toLowerCase())
          );
          if (found) {
            foundRanger = found;
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Check local storage individual key "greenpass_ranger_detail_" + rangerId
      if (!foundRanger) {
        const savedIndividual = localStorage.getItem(`greenpass_ranger_detail_${rangerId}`);
        if (savedIndividual) {
          try {
            foundRanger = JSON.parse(savedIndividual);
          } catch (e) {}
        }
      }

      // Normalize username for API call (e.g. "01" -> "ranger01", "ranger01" -> "ranger01")
      const targetUsername = rangerId.startsWith("ranger") 
        ? rangerId 
        : (rangerId.length <= 2 ? `ranger${rangerId.padStart(2, "0")}` : rangerId);

      // 3. Try getRangerByUsername from MySQL DB API
      if (!foundRanger) {
        try {
          const res = await rangerApi.getRangerByUsername(targetUsername);
          const item = res?.result || res?.data;
          if (res && (res.success || res.status) && item) {
            foundRanger = {
              id: item.username,
              employeeId: item.username.toUpperCase(),
              name: `${item.firstname || ""} ${item.surname || ""}`.trim() || item.username,
              phone: item.mobilephone || "",
              email: item.email || "",
              position: item.position || "เจ้าหน้าที่อุทยาน",
              parkName: item.park?.name || "อุทยานแห่งชาติเขาใหญ่",
              firstName: item.firstname || "",
              lastName: item.surname || "",
              birthDate: formatThaiDate(item.birthDate),
              startDate: formatSlashDate(item.startDate),
              district: item.district || "-",
              subDistrict: item.subDistrict || "-",
              province: item.province || "-",
              gender: item.gender === 2 ? "หญิง" : "ชาย"
            };
          }
        } catch (err) {
          console.warn("Could not fetch ranger by username:", err);
        }
      }

      // 4. Try getAllRangers from MySQL DB API
      if (!foundRanger) {
        try {
          const response = await rangerApi.getAllRangers();
          if (response && (response.success || response.status) && response.result) {
            const list = response.result.map((item: any) => ({
              id: item.username,
              employeeId: item.username.toUpperCase(),
              name: `${item.firstname || ""} ${item.surname || ""}`.trim() || item.username,
              phone: item.mobilephone || "",
              email: item.email || "",
              position: item.position || "เจ้าหน้าที่อุทยาน",
              parkName: item.park?.name || "อุทยานแห่งชาติเขาใหญ่",
              firstName: item.firstname || "",
              lastName: item.surname || "",
              birthDate: formatThaiDate(item.birthDate),
              startDate: formatSlashDate(item.startDate),
              district: item.district || "-",
              subDistrict: item.subDistrict || "-",
              province: item.province || "-",
              gender: item.gender === 2 ? "หญิง" : "ชาย"
            }));
            const found = list.find((r: any) => 
              String(r.id).toLowerCase() === targetUsername.toLowerCase() || 
              String(r.id).toLowerCase() === rangerId.toLowerCase()
            );
            if (found) foundRanger = found;
          }
        } catch (e) {}
      }

      // 5. Check DEFAULT_RANGERS
      if (!foundRanger) {
        foundRanger = DEFAULT_RANGERS.find(r => 
          r.id === rangerId || 
          r.id === targetUsername || 
          `PR${r.id}` === rangerId ||
          `PR${r.id}` === targetUsername
        ) || null;
      }

      // 6. Safe fallback
      if (!foundRanger) {
        foundRanger = {
          id: rangerId,
          employeeId: rangerId.length <= 4 ? `PR${rangerId}` : rangerId.toUpperCase(),
          name: "สมชาย ใจดี",
          firstName: "สมชาย",
          lastName: "ใจดี",
          birthDate: "15 ต.ค. 2547",
          position: "เจ้าหน้าที่อุทยาน",
          parkName: "อุทยานแห่งชาติเขาใหญ่",
          startDate: "15/10/2566",
          district: "ปากช่อง",
          subDistrict: "ปากช่อง",
          province: "นครราชสีมา",
          gender: "ชาย",
          phone: "089-1234567",
          email: "ranger01@park.go.th"
        };
      }

      // Populate form fields
      setCurrentRanger(foundRanger);
      setEmployeeId(foundRanger.employeeId || `PR${foundRanger.id}`);
      setFirstName(foundRanger.firstName || foundRanger.name.split(" ")[0] || "");
      setLastName(foundRanger.lastName || foundRanger.name.split(" ")[1] || "");
      setBirthDate(foundRanger.birthDate || "");
      setPosition(foundRanger.position || "เจ้าหน้าที่อุทยาน");
      setParkName(foundRanger.parkName || "อุทยานแห่งชาติเขาใหญ่");
      setStartDate(foundRanger.startDate || "");
      setDistrict(foundRanger.district || "");
      setSubDistrict(foundRanger.subDistrict || "");
      setProvince(foundRanger.province || "");
      setGender(foundRanger.gender || "ชาย");
      setPhone(foundRanger.phone || "");
      setEmail(foundRanger.email || "");
    };

    fetchRangerData();
  }, [rangerId]);

  const validateParkRangerForm = (): string | null => {
    const cleanEmpId = employeeId.trim();
    if (!cleanEmpId) {
      return "กรุณากรอกรหัสพนักงาน/ชื่อผู้ใช้งาน";
    }
    if (cleanEmpId.includes(" ")) {
      return "รหัสพนักงาน/ชื่อผู้ใช้งานต้องไม่มีเว้นวรรคหรือช่องว่าง";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanEmpId)) {
      return "รหัสพนักงานต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรืออักขระ _ - เท่านั้น (ห้ามมีภาษาไทย)";
    }

    const cleanFirstName = firstName.trim();
    if (!cleanFirstName) {
      return "กรุณากรอกชื่อเจ้าหน้าที่";
    }
    if (cleanFirstName.length < 2 || cleanFirstName.length > 50) {
      return "ชื่อต้องมีความยาว 2 ถึง 50 ตัวอักษร";
    }
    if (/[0-9]/.test(cleanFirstName)) {
      return "ชื่อต้องไม่มีตัวเลข";
    }
    if (!/^[a-zA-Zก-๙\s]+$/.test(cleanFirstName)) {
      return "ชื่อต้องเป็นตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น (ห้ามมีอักขระพิเศษ)";
    }

    const cleanLastName = lastName.trim();
    if (!cleanLastName) {
      return "กรุณากรอกนามสกุลเจ้าหน้าที่";
    }
    if (cleanLastName.length < 2 || cleanLastName.length > 50) {
      return "นามสกุลต้องมีความยาว 2 ถึง 50 ตัวอักษร";
    }
    if (/[0-9]/.test(cleanLastName)) {
      return "นามสกุลต้องไม่มีตัวเลข";
    }
    if (!/^[a-zA-Zก-๙\s]+$/.test(cleanLastName)) {
      return "นามสกุลต้องเป็นตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น (ห้ามมีอักขระพิเศษ)";
    }

    const cleanPhone = phone.replace(/[-\s]/g, "");
    if (!cleanPhone) {
      return "กรุณากรอกเบอร์โทรศัพท์";
    }
    if (!/^\d+$/.test(cleanPhone)) {
      return "เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น";
    }
    if (cleanPhone.length !== 10) {
      return "เบอร์โทรศัพท์ต้องมีความยาว 10 หลัก (เช่น 0812345678)";
    }
    if (!/^(06|08|09|02)/.test(cleanPhone)) {
      return "เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0 (เช่น 08, 09, 06)";
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return "กรุณากรอกอีเมล";
    }
    if (cleanEmail.includes(" ")) {
      return "อีเมลต้องไม่มีเว้นวรรคหรือช่องว่าง";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return "กรุณากรอกอีเมลให้อยู่ในรูปแบบที่ถูกต้อง (เช่น example@domain.com)";
    }

    if (birthDate) {
      const bDate = new Date(birthDate);
      const today = new Date();
      if (bDate > today) {
        return "วัน/เดือน/ปีเกิดต้องไม่เป็นวันที่ในอนาคต";
      }
    }

    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRanger) return;

    setError("");
    setSuccess("");

    const validationError = validateParkRangerForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      if (currentRanger.id.startsWith("ranger")) {
        try {
          await rangerApi.updateRanger(currentRanger.id, {
            employeeId,
            firstName,
            lastName,
            birthDate,
            position,
            parkName,
            startDate,
            district,
            subDistrict,
            province,
            gender,
            phone,
            email
          });
        } catch (apiErr) {
          console.warn("Could not update ranger in backend DB API:", apiErr);
        }
      }

      const updatedObj = {
        ...currentRanger,
        employeeId,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        birthDate,
        position,
        parkName,
        startDate,
        district,
        subDistrict,
        province,
        gender,
        phone,
        email
      };

      // Update in greenpass_rangers array
      const savedRangers = localStorage.getItem("greenpass_rangers");
      let list: Ranger[] = savedRangers ? JSON.parse(savedRangers) : [];
      let updatedList = list.map((r) => r.id === currentRanger.id ? updatedObj : r);
      if (!list.some(r => r.id === currentRanger.id)) {
        updatedList = [updatedObj, ...list];
      }
      localStorage.setItem("greenpass_rangers", JSON.stringify(updatedList));

      // Update individual storage key
      localStorage.setItem(`greenpass_ranger_detail_${currentRanger.id}`, JSON.stringify(updatedObj));

      setSuccess("แก้ไขประวัติเจ้าหน้าที่อุทยานสำเร็จแล้ว!");

      setTimeout(() => {
        router.push(`/admin/view-park-ranger-detail?id=${currentRanger.id}`);
      }, 1000);

    } catch (err) {
      console.error("Failed to update park ranger:", err);
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentRanger) {
    return (
      <div className="w-full max-w-3xl mx-auto py-20 flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600">กำลังโหลดข้อมูลเจ้าหน้าที่อุทยาน...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl xl:max-w-6xl mx-auto font-sans relative py-4 my-2 px-2 sm:px-4">
      
      {/* Container หลัก สีขาว */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl shadow-slate-200/50 text-slate-800">
        
        {/* Header Banner */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-slate-200/80">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              แก้ไขประวัติเจ้าหน้าที่อุทยาน #{currentRanger.id}
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Edit Profile
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              แก้ไขและอัปเดตข้อมูลรายละเอียดเจ้าหน้าที่ให้เป็นปัจจุบัน
            </p>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}
        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600" />
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: ข้อมูลพื้นฐาน */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider pb-2 border-b border-slate-200">
              <User className="w-4 h-4 text-emerald-600" />
              <span>ข้อมูลพื้นฐาน</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* รหัสพนักงาน */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <IdCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>รหัสพนักงาน</span>
                </label>
                <input 
                  type="text" 
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* เพศ */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>เพศ</span>
                </label>
                <div className="relative">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={isLoading}
                  >
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* ชื่อ */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ชื่อ</span>
                </label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* นามสกุล */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>นามสกุล</span>
                </label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* วัน/เดือน/ปีเกิด (Date Picker) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>วัน/เดือน/ปีเกิด</span>
                </label>
                <input 
                  type="date" 
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all cursor-pointer"
                  disabled={isLoading}
                />
              </div>

              {/* ตำแหน่ง */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ตำแหน่ง</span>
                </label>
                <div className="relative">
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={isLoading}
                  >
                    <option value="เจ้าหน้าที่ประชาสัมพันธ์">เจ้าหน้าที่ประชาสัมพันธ์</option>
                    <option value="หัวหน้าอุทยาน">หัวหน้าอุทยาน</option>
                    <option value="เจ้าหน้าที่พิทักษ์ป่า">เจ้าหน้าที่พิทักษ์ป่า</option>
                    <option value="เจ้าหน้าที่บริการนักท่องเที่ยว">เจ้าหน้าที่บริการนักท่องเที่ยว</option>
                    <option value="เจ้าหน้าที่ธุรการ">เจ้าหน้าที่ธุรการ</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* อุทยานที่สังกัด */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Trees className="w-3.5 h-3.5 text-emerald-600" />
                  <span>อุทยานที่สังกัด</span>
                </label>
                <div className="relative">
                  <select
                    value={parkName}
                    onChange={(e) => setParkName(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={isLoading}
                  >
                    <option value="อุทยานแห่งชาติแก่งกระจาน">อุทยานแห่งชาติแก่งกระจาน</option>
                    <option value="อุทยานแห่งชาติเขาใหญ่">อุทยานแห่งชาติเขาใหญ่</option>
                    <option value="อุทยานแห่งชาติเอราวัณ">อุทยานแห่งชาติเอราวัณ</option>
                    <option value="อุทยานแห่งชาติสุเทพ-ปุย">อุทยานแห่งชาติสุเทพ-ปุย</option>
                    <option value="อุทยานแห่งชาติดอยอินทนนท์">อุทยานแห่งชาติดอยอินทนนท์</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* วันที่เริ่มปฏิบัติงาน (Date Picker) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>วันที่เริ่มปฏิบัติงาน</span>
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all cursor-pointer"
                  disabled={isLoading}
                />
              </div>

            </div>
          </div>

          {/* Section 2: ที่อยู่ปฏิบัติงาน (77 จังหวัด -> อำเภอ -> ตำบล) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider pb-2 border-b border-slate-200">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>ที่อยู่และพื้นที่ปฏิบัติงาน (เลือกจังหวัด / อำเภอ / ตำบล)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* จังหวัด (77 จังหวัดทั่วไทย) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>จังหวัด</span>
                  <span className="text-[10px] text-emerald-600 font-bold">(77 จังหวัด)</span>
                </label>
                <div className="relative">
                  <select
                    value={province}
                    onChange={(e) => {
                      const newProv = e.target.value;
                      setProvince(newProv);
                      const availableDistricts = getDistrictsByProvince(newProv);
                      const defaultDist = availableDistricts[0] || "";
                      setDistrict(defaultDist);
                      const availableSub = getSubDistrictsByDistrict(newProv, defaultDist);
                      setSubDistrict(availableSub[0] || "");
                    }}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={isLoading}
                  >
                    {getProvincesList().map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* อำเภอ (อิงตามจังหวัดที่เลือก) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">อำเภอ / เขต</label>
                <div className="relative">
                  <select
                    value={district}
                    onChange={(e) => {
                      const newDist = e.target.value;
                      setDistrict(newDist);
                      const availableSub = getSubDistrictsByDistrict(province, newDist);
                      setSubDistrict(availableSub[0] || "");
                    }}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={isLoading}
                  >
                    {getDistrictsByProvince(province).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* ตำบล (อิงตามอำเภอที่เลือก) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">ตำบล / แขวง</label>
                <div className="relative">
                  <select
                    value={subDistrict}
                    onChange={(e) => setSubDistrict(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={isLoading}
                  >
                    {getSubDistrictsByDistrict(province, district).map((sd) => (
                      <option key={sd} value={sd}>{sd}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* เบอร์มือถือ */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>เบอร์มือถือ</span>
                </label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* อีเมล */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>อีเมล</span>
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  disabled={isLoading}
                />
              </div>

            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button 
              type="button"
              onClick={() => router.push(`/admin/view-park-ranger-detail?id=${currentRanger.id}`)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-2"
              disabled={isLoading}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              ย้อนกลับ
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 flex items-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4 stroke-[3]" />
              )}
              ยืนยันบันทึกข้อมูล
            </button>
          </div>

        </form>
      </div>
    </div>
  );

}

export default function EditParkRangerProfilePage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12 text-xs font-bold text-zinc-400">
        กำลังโหลดประวัติส่วนตัว...
      </div>
    }>
      <EditProfileContent />
    </Suspense>
  );
}
