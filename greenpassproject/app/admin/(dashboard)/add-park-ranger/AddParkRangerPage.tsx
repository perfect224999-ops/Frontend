"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { rangerApi, parkApi } from "../../../../service/api";
import {
  getProvincesList,
  getDistrictsByProvince,
  getSubDistrictsByDistrict,
  getZipcodesBySubdistrict
} from "../../../../data/thaiLocationData";
import {
  UserPlus,
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
  ChevronUp,
  Search,
  Users,
  Lock,
  Hash,
  Eye,
  EyeOff,
  FileSignature,
  UploadCloud,
  X,
  ImageIcon
} from "lucide-react";

export default function AddParkRangerPage() {
  const router = useRouter();

  // Form states
  const [employeeId, setEmployeeId] = useState("PR01");
  const [password, setPassword] = useState("Pass1234");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("สมพร");
  const [lastName, setLastName] = useState("ดงศักดิ์");
  const [birthDate, setBirthDate] = useState("2004-10-15");
  const [position, setPosition] = useState("เจ้าหน้าที่ประชาสัมพันธ์");
  const [parkName, setParkName] = useState("");
  const [parkSearchQuery, setParkSearchQuery] = useState("");
  const [isParkDropdownOpen, setIsParkDropdownOpen] = useState(false);
  const parkDropdownRef = useRef<HTMLDivElement>(null);
  const [startDate, setStartDate] = useState("2023-10-15");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [subDistrict, setSubDistrict] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [gender, setGender] = useState("ชาย");
  const [phone, setPhone] = useState("0971425756");
  const [email, setEmail] = useState("xcperfasd@gmail.com");
  const [signature, setSignature] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const compressImage = (file: File, maxWidth = 800, maxHeight = 400, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
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
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(file.type || "image/png", quality));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSignatureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setSignature(compressedBase64);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setSignature(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Dynamic Parks from MySQL Database
  const [dbParks, setDbParks] = useState<Array<{ parkId: number; name: string }>>([]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await parkApi.searchParks("");
        const list = res?.result || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((p: any) => ({
            parkId: p.parkId || p.id,
            name: p.name
          }));
          setDbParks(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch parks from database:", err);
      }

      try {
        const rangerRes = await rangerApi.getAllRangers();
        const rList = rangerRes?.result || rangerRes?.data || (Array.isArray(rangerRes) ? rangerRes : []);
        if (Array.isArray(rList) && rList.length > 0) {
          let maxPr = 0;
          rList.forEach((item: any) => {
            const u = (item.username || "").toLowerCase();
            const m = u.match(/^pr(\d+)$/);
            if (m) {
              const n = parseInt(m[1], 10);
              if (n > maxPr) maxPr = n;
            }
          });
          if (maxPr > 0) {
            setEmployeeId(`PR${String(maxPr + 1).padStart(2, "0")}`);
          }
        }
      } catch (err) {
        console.error("Failed to calculate next employeeId:", err);
      }
    }
    loadInitialData();
  }, []);

  const allParkOptions = useMemo(() => {
    if (dbParks.length > 0) {
      return dbParks.map((p) => p.name);
    }
    return [
      "อุทยานแห่งชาติแก่งกระจาน",
      "อุทยานแห่งชาติเขาใหญ่",
      "อุทยานแห่งชาติเอราวัณ",
      "อุทยานแห่งชาติสุเทพ-ปุย",
      "อุทยานแห่งชาติดอยอินทนนท์"
    ];
  }, [dbParks]);

  const filteredParks = useMemo(() => {
    const q = parkSearchQuery.trim().toLowerCase();
    if (!q) return allParkOptions;
    return allParkOptions.filter((name) =>
      name.toLowerCase().includes(q) ||
      name.replace(/อุทยานแห่งชาติ/g, "").trim().toLowerCase().includes(q)
    );
  }, [allParkOptions, parkSearchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (parkDropdownRef.current && !parkDropdownRef.current.contains(event.target as Node)) {
        setIsParkDropdownOpen(false);
        setParkSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectPark = (selected: string) => {
    setParkName(selected);
    setParkSearchQuery("");
    setIsParkDropdownOpen(false);
  };

  // Cascading location lists
  const provincesList = useMemo(() => getProvincesList(), []);
  const districtsList = useMemo(() => getDistrictsByProvince(province), [province]);
  const subDistrictsList = useMemo(() => getSubDistrictsByDistrict(province, district), [province, district]);
  const zipcodesList = useMemo(() => getZipcodesBySubdistrict(province, district, subDistrict), [province, district, subDistrict]);

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    setDistrict("");
    setSubDistrict("");
    setZipcode("");
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    setSubDistrict("");
    setZipcode("");
  };

  const handleSubDistrictChange = (newSub: string) => {
    setSubDistrict(newSub);
    if (newSub) {
      const zips = getZipcodesBySubdistrict(province, district, newSub);
      setZipcode(zips[0] || "");
    } else {
      setZipcode("");
    }
  };

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

    const cleanPassword = password.trim();
    if (!cleanPassword) {
      return "กรุณากรอกรหัสผ่าน (ห้ามเป็นค่าว่าง)";
    }
    if (/[\u0E00-\u0E7F]/.test(password)) {
      return "รหัสผ่านต้องเป็นภาษาอังกฤษเท่านั้น (ห้ามมีภาษาไทย)";
    }
    if (!/[a-z]/.test(password)) {
      return "รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)";
    }
    if (!/[A-Z]/.test(password)) {
      return "รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)";
    }
    if (!/[0-9]/.test(password)) {
      return "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว (0-9)";
    }
    if (!/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password)) {
      return "รหัสผ่านต้องเป็นภาษาอังกฤษ ตัวเลข หรืออักขระพิเศษมาตรฐานเท่านั้น (ห้ามมีภาษาไทยหรือภาษาอื่น)";
    }
    if (cleanPassword.length < 4 || cleanPassword.length > 16) {
      return "รหัสผ่านต้องมีความยาว 4 ถึง 16 ตัวอักษร";
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

    if (!parkName || parkName.trim() === "") {
      return "กรุณาเลือกอุทยานที่สังกัด";
    }

    if (!province || province.trim() === "") {
      return "กรุณาเลือกจังหวัด";
    }
    if (!district || district.trim() === "" || district === "-") {
      return "กรุณาเลือกอำเภอ / เขต";
    }
    if (!subDistrict || subDistrict.trim() === "" || subDistrict === "-") {
      return "กรุณาเลือกตำบล / แขวง";
    }

    const cleanZipcode = zipcode.trim();
    if (!cleanZipcode || cleanZipcode === "-") {
      return "กรุณาเลือกรหัสไปรษณีย์";
    }
    if (!/^\d{5}$/.test(cleanZipcode)) {
      return "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateParkRangerForm();
    if (validationError) {
      setError("กรุณากรอกข้อมูลให้ถูกต้อง");
      return;
    }

    const fallbackParkMap: Record<string, number> = {
      "อุทยานแห่งชาติเขาใหญ่": 1,
      "อุทยานแห่งชาติแก่งกระจาน": 2,
      "อุทยานแห่งชาติเอราวัณ": 3,
      "อุทยานแห่งชาติสุเทพ-ปุย": 4,
      "อุทยานแห่งชาติดอยอินทนนท์": 5
    };

    const selectedParkObj = dbParks.find(p => p.name === parkName);
    const parkIdNum = selectedParkObj ? selectedParkObj.parkId : (fallbackParkMap[parkName] || 1);
    const genderInt = gender === "หญิง" ? 2 : 1;
    const cleanUsername = employeeId.trim().toUpperCase();
    const cleanPhone = phone.replace(/[^0-9]/g, "").slice(0, 10);
    const cleanEmail = email.trim().slice(0, 50);

    setIsLoading(true);
    try {
      // 1. บันทึกลงฐานข้อมูล Spring Boot ผ่าน API
      await rangerApi.addRanger({
        username: cleanUsername,
        password: password.trim().slice(0, 16),
        employeeId: cleanUsername,
        firstName: firstName.trim().slice(0, 50),
        lastName: lastName.trim().slice(0, 50),
        birthDate,
        position: position.trim().slice(0, 50),
        parkName,
        parkId: parkIdNum,
        startDate,
        district: district.trim().slice(0, 20),
        subDistrict: subDistrict.trim().slice(0, 20),
        province: province.trim().slice(0, 20),
        zipcode: zipcode.trim().slice(0, 5),
        gender: genderInt,
        phone: cleanPhone,
        email: cleanEmail,
        canAnnouncement: false,
        canIssueStamp: false,
        canProgressReport: false,
        canEditParkDetails: false,
        signature: signature.trim() || "src/sig1.png"
      });

      // 2. บันทึกลง localStorage สำรองเพื่อรองรับการทำงานของ frontend (ให้อยู่ลำดับบนสุด)
      const saved = localStorage.getItem("greenpass_rangers");
      let list = [];
      if (saved) {
        try {
          list = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }

      const defaultRoles: string[] = [];

      const createdTimestamp = Date.now();

      const newRanger = {
        id: cleanUsername,
        employeeId: cleanUsername,
        username: cleanUsername,
        password: password.trim(),
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
        zipcode,
        gender,
        phone: cleanPhone,
        email: cleanEmail,
        signature: signature.trim() || "src/sig1.png",
        role: position,
        roles: [],
        canIssueStamp: false,
        canAnnouncement: false,
        canEditParkDetails: false,
        canProgressReport: false,
        status: "Active",
        createdAt: createdTimestamp,
        createdTimestamp: createdTimestamp
      };

      if (signature) {
        try {
          localStorage.setItem(`greenpass_ranger_sig_${cleanUsername}`, signature);
          localStorage.setItem(`greenpass_ranger_sig_${cleanUsername.toLowerCase()}`, signature);
        } catch (e) { }
      }

      try {
        localStorage.setItem(`greenpass_ranger_roles_${cleanUsername}`, JSON.stringify(defaultRoles));
        localStorage.setItem(`greenpass_ranger_roles_${cleanUsername.toLowerCase()}`, JSON.stringify(defaultRoles));
        const upperClean = cleanUsername.toUpperCase();
        localStorage.setItem(`greenpass_ranger_created_${upperClean}`, String(createdTimestamp));
        localStorage.setItem(`greenpass_ranger_created_${upperClean.toLowerCase()}`, String(createdTimestamp));

        // บันทึกลำดับเจ้าหน้าที่ที่เพิ่มล่าสุด: คนล่าสุดจะถูกวางไว้ลำดับแรกสุดเสมอ (index 0)
        const recentOrderRaw = localStorage.getItem("greenpass_ranger_recent_order");
        let recentOrder: string[] = [];
        if (recentOrderRaw) {
          try {
            recentOrder = JSON.parse(recentOrderRaw);
          } catch (e) { }
        }
        recentOrder = [upperClean, ...recentOrder.filter((u: string) => String(u).toUpperCase() !== upperClean)];
        localStorage.setItem("greenpass_ranger_recent_order", JSON.stringify(recentOrder));
      } catch (e) { }

      // ใส่ไว้ที่ลำดับแรกสุดเสมอ (คนล่าสุดอยู่บนสุด)
      const filteredList = list.filter((r: any) => (r.username || r.id || "").toLowerCase() !== cleanUsername.toLowerCase());
      filteredList.unshift(newRanger);
      localStorage.setItem("greenpass_rangers", JSON.stringify(filteredList));
      setSuccess("เพิ่มข้อมูลเจ้าหน้าที่อุทยานสำเร็จแล้ว!");

      setTimeout(() => {
        router.push("/admin/list-park-ranger");
      }, 1000);

    } catch (err: any) {
      console.error("Failed to add ranger to database:", err);
      setError("ไม่สามารถบันทึกข้อมูลเจ้าหน้าที่อุทยานได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto font-sans relative py-4 my-2 px-2 sm:px-4">

      {/* Container หลัก สีขาว */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl shadow-slate-200/50 text-slate-800">

        {/* Header Banner */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-slate-200/80">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              เพิ่มเจ้าหน้าที่อุทยาน
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              กรอกข้อมูลแบบฟอร์มเพื่อลงทะเบียนเจ้าหน้าที่ปฏิบัติงานใหม่เข้าสู่ระบบ
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
        <form onSubmit={handleSubmit} className="space-y-6">

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
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all uppercase"
                  disabled={isLoading}
                  placeholder="เช่น PR01 หรือ PR19"
                />
              </div>

              {/* รหัสผ่าน ข้างๆ รหัสพนักงาน */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>รหัสผ่าน</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all pr-10"
                    disabled={isLoading}
                    placeholder="ระบุรหัสผ่านเข้าสู่ระบบ (4-16 ตัวอักษร)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
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
                    <option value="เจ้าหน้าที่รับแจ้งเหตุ">เจ้าหน้าที่รับแจ้งเหตุ</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* อุทยานที่สังกัด (Searchable Combobox) */}
              <div className="space-y-1.5 relative" ref={parkDropdownRef}>
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Trees className="w-3.5 h-3.5 text-emerald-600" />
                  <span>อุทยานที่สังกัด</span>
                </label>
                <div className="relative">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={isParkDropdownOpen ? parkSearchQuery : parkName}
                      onChange={(e) => {
                        setParkSearchQuery(e.target.value);
                        if (!isParkDropdownOpen) setIsParkDropdownOpen(true);
                      }}
                      onFocus={() => {
                        setIsParkDropdownOpen(true);
                      }}
                      placeholder="พิมพ์ค้นหา หรือเลือกอุทยานแห่งชาติ..."
                      className="w-full bg-slate-50 text-slate-900 rounded-xl pl-3.5 pr-16 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all cursor-text placeholder:text-slate-400"
                      disabled={isLoading}
                    />
                    <div className="absolute right-2.5 flex items-center gap-1 text-slate-400">
                      {(parkName || parkSearchQuery) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setParkName("");
                            setParkSearchQuery("");
                          }}
                          className="p-1 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors"
                          title="ล้างข้อมูลอุทยาน"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!isParkDropdownOpen) {
                            setParkSearchQuery("");
                          }
                          setIsParkDropdownOpen(!isParkDropdownOpen);
                        }}
                        className="p-1 hover:text-emerald-700 rounded-full transition-colors"
                        title={isParkDropdownOpen ? "ปิดรายการ" : "เปิดรายการอุทยาน"}
                      >
                        {isParkDropdownOpen ? (
                          <ChevronUp className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {isParkDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/80 overflow-hidden max-h-64 flex flex-col animate-in fade-in-0 zoom-in-95 duration-100">
                      <div className="p-2 border-b border-slate-100 bg-slate-50/80 text-[11px] font-medium text-slate-500 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Search className="w-3 h-3 text-emerald-600" />
                          {parkSearchQuery.trim() ? "ผลการค้นหา" : "รายชื่ออุทยานทั้งหมด"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {filteredParks.length} แห่ง
                        </span>
                      </div>

                      <div className="overflow-y-auto max-h-52 divide-y divide-slate-50">
                        {filteredParks.length > 0 ? (
                          filteredParks.map((pName) => {
                            const isSelected = pName === parkName;
                            return (
                              <button
                                key={pName}
                                type="button"
                                onClick={() => handleSelectPark(pName)}
                                className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${isSelected
                                    ? "bg-emerald-50/90 text-emerald-800 font-bold"
                                    : "text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium"
                                  }`}
                              >
                                <span className="truncate pr-2">{pName}</span>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-slate-400">
                            ไม่พบข้อมูลอุทยานแห่งชาติที่ค้นหา
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* วันที่เริ่มปฏิบัติงาน (Date Picker) */}
              <div className="space-y-1.5 md:col-span-2">
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

              {/* รูปลายเซ็นเจ้าหน้าที่ (Signature) */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileSignature className="w-3.5 h-3.5 text-emerald-600" />
                    <span>รูปลายเซ็นเจ้าหน้าที่</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    รองรับไฟล์ JPG, PNG, WEBP (พื้นหลังโปร่งใสหรือสีขาว)
                  </span>
                </label>

                {signature ? (
                  <div className="relative rounded-2xl border border-emerald-200 bg-emerald-50/20 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-28 h-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-1.5 overflow-hidden shadow-sm">
                        <img
                          src={signature}
                          alt="Signature Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> แนบรูปลายเซ็นเรียบร้อย
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          รูปลายเซ็นนี้จะใช้สำหรับประทับตราดิจิทัล (Digital Stamp) ของเจ้าหน้าที่
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSignature("")}
                      className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-red-200/60 shadow-xs"
                      disabled={isLoading}
                    >
                      <X className="w-3.5 h-3.5" />
                      ลบรูป
                    </button>
                  </div>
                ) : (
                  <label className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group text-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700">
                      คลิกเพื่อเลือกไฟล์รูปลายเซ็นเจ้าหน้าที่...
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      แนะนำภาพลายเซ็นแนวนอน (หรือรูปภาพที่มีลายมือชื่อเจ้าหน้าที่)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSignatureChange}
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>

            </div>
          </div>

          {/* Section 2: ที่อยู่ปฏิบัติงาน (77 จังหวัด -> อำเภอ -> ตำบล -> รหัสไปรษณีย์) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider pb-2 border-b border-slate-200">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>ที่อยู่ (เลือกจังหวัด / อำเภอ / ตำบล / รหัสไปรษณีย์)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

              {/* จังหวัด (77 จังหวัดทั่วไทย) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>จังหวัด <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-emerald-600 font-bold">(77 จังหวัด)</span>
                </label>
                <div className="relative">
                  <select
                    value={province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={isLoading}
                  >
                    <option value="" disabled>-- กรุณาเลือกจังหวัด --</option>
                    {provincesList.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* อำเภอ (อิงตามจังหวัดที่เลือก) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">อำเภอ / เขต <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={!province || isLoading}
                  >
                    <option value="" disabled>-- กรุณาเลือกอำเภอ / เขต --</option>
                    {districtsList.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* ตำบล (อิงตามอำเภอที่เลือก) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">ตำบล / แขวง <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={subDistrict}
                    onChange={(e) => handleSubDistrictChange(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={!district || isLoading}
                  >
                    <option value="" disabled>-- กรุณาเลือกตำบล / แขวง --</option>
                    {subDistrictsList.map((sd, idx) => (
                      <option key={`${sd}-${idx}`} value={sd}>{sd}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* รหัสไปรษณีย์ (เลือกตามตำบล/อำเภอ) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">รหัสไปรษณีย์ <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10 font-mono"
                    disabled={!subDistrict || isLoading}
                  >
                    <option value="" disabled>-- เลือกรหัสไปรษณีย์ --</option>
                    {zipcodesList.map((z, idx) => (
                      <option key={`${z}-${idx}`} value={z}>{z}</option>
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
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-mono"
                  disabled={isLoading}
                  placeholder="0812345678"
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
              onClick={() => router.push("/admin/list-park-ranger")}
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

