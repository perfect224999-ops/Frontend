"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { rangerApi, parkApi } from "../../../../service/api";
import { 
  getProvincesList, 
  getDistrictsByProvince, 
  getSubDistrictsByDistrict 
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
  Users,
  Lock,
  Hash,
  Eye,
  EyeOff
} from "lucide-react";

export default function AddParkRangerPage() {
  const router = useRouter();
  
  // Form states
  const [employeeId, setEmployeeId] = useState("PR01");
  const [password, setPassword] = useState("pass1234");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("สมพร");
  const [lastName, setLastName] = useState("ดงศักดิ์");
  const [birthDate, setBirthDate] = useState("2004-10-15");
  const [position, setPosition] = useState("เจ้าหน้าที่ประชาสัมพันธ์");
  const [parkName, setParkName] = useState("อุทยานแห่งชาติแก่งกระจาน");
  const [startDate, setStartDate] = useState("2023-10-15");
  const [province, setProvince] = useState("ฉะเชิงเทรา");
  const [district, setDistrict] = useState("เมืองฉะเชิงเทรา");
  const [subDistrict, setSubDistrict] = useState("หน้าเมือง");
  const [zipcode, setZipcode] = useState("24000");
  const [gender, setGender] = useState("ชาย");
  const [phone, setPhone] = useState("097-1425756");
  const [email, setEmail] = useState("xcperfasd@gmail.com");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Parks from MySQL Database
  const [dbParks, setDbParks] = useState<Array<{ parkId: number; name: string }>>([]);

  useEffect(() => {
    async function loadParks() {
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
    }
    loadParks();
  }, []);

  // Cascading location lists
  const provincesList = useMemo(() => getProvincesList(), []);
  const districtsList = useMemo(() => getDistrictsByProvince(province), [province]);
  const subDistrictsList = useMemo(() => getSubDistrictsByDistrict(province, district), [province, district]);

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    const availableDistricts = getDistrictsByProvince(newProvince);
    const defaultDistrict = availableDistricts[0] || "";
    setDistrict(defaultDistrict);

    const availableSubDistricts = getSubDistrictsByDistrict(newProvince, defaultDistrict);
    setSubDistrict(availableSubDistricts[0] || "");
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const availableSubDistricts = getSubDistrictsByDistrict(province, newDistrict);
    setSubDistrict(availableSubDistricts[0] || "");
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
      return "กรุณากรอกรหัสผ่าน (Password)";
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

    const cleanZipcode = zipcode.trim();
    if (!cleanZipcode) {
      return "กรุณากรอกรหัสไปรษณีย์";
    }
    if (!/^\d{5}$/.test(cleanZipcode)) {
      return "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก (เช่น 24000)";
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
      setError(validationError);
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
    const cleanUsername = employeeId.trim().toLowerCase();
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
        position: position.trim().slice(0, 25),
        parkName,
        parkId: parkIdNum,
        startDate,
        district: district.trim().slice(0, 20),
        subDistrict: subDistrict.trim().slice(0, 20),
        province: province.trim().slice(0, 20),
        zipcode: zipcode.trim().slice(0, 5),
        gender: genderInt,
        phone: cleanPhone,
        email: cleanEmail
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

      const newRanger = {
        id: String(Date.now()),
        employeeId,
        username: employeeId.toLowerCase(),
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
        phone,
        email,
        role: position,
        status: "Active"
      };

      // ใส่ไว้ที่ลำดับแรกสุดเสมอ (คนล่าสุดอยู่บนสุด)
      list.unshift(newRanger);
      localStorage.setItem("greenpass_rangers", JSON.stringify(list));
      setSuccess("เพิ่มข้อมูลเจ้าหน้าที่อุทยานสำเร็จแล้ว!");


      setTimeout(() => {
        router.push("/admin/list-park-ranger");
      }, 1000);

    } catch (err: any) {
      console.error("Failed to add ranger to database:", err);
      const errMsg = err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl xl:max-w-6xl mx-auto font-sans relative py-4 my-2 px-2 sm:px-4">
      
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
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  disabled={isLoading}
                  placeholder="เช่น PR01 หรือ ranger01"
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
                    {dbParks.length > 0 ? (
                      dbParks.map((p) => (
                        <option key={p.parkId} value={p.name}>
                          {p.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="อุทยานแห่งชาติเขาใหญ่">อุทยานแห่งชาติเขาใหญ่</option>
                        <option value="อุทยานแห่งชาติแก่งกระจาน">อุทยานแห่งชาติแก่งกระจาน</option>
                        <option value="อุทยานแห่งชาติเอราวัณ">อุทยานแห่งชาติเอราวัณ</option>
                        <option value="อุทยานแห่งชาติสุเทพ-ปุย">อุทยานแห่งชาติสุเทพ-ปุย</option>
                        <option value="อุทยานแห่งชาติดอยอินทนนท์">อุทยานแห่งชาติดอยอินทนนท์</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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

            </div>
          </div>

          {/* Section 2: ที่อยู่ปฏิบัติงาน (77 จังหวัด -> อำเภอ -> ตำบล -> รหัสไปรษณีย์) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider pb-2 border-b border-slate-200">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>ที่อยู่และพื้นที่ปฏิบัติงาน (เลือกจังหวัด / อำเภอ / ตำบล / รหัสไปรษณีย์)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* จังหวัด (77 จังหวัดทั่วไทย) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>จังหวัด</span>
                  <span className="text-[10px] text-emerald-600 font-bold">(77 จังหวัด)</span>
                </label>
                <div className="relative">
                  <select
                    value={province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={isLoading}
                  >
                    {provincesList.map((p) => (
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
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={isLoading}
                  >
                    {districtsList.map((d) => (
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
                    {subDistrictsList.map((sd, idx) => (
                      <option key={`${sd}-${idx}`} value={sd}>{sd}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* รหัสไปรษณีย์ */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">รหัสไปรษณีย์</label>
                <input 
                  type="text" 
                  maxLength={5}
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-mono"
                  disabled={isLoading}
                  placeholder="เช่น 24000"
                />
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

