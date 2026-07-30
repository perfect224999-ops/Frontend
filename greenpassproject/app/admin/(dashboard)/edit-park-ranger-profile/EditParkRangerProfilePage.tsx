"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { rangerApi } from "../../../../service/api";

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
      try {
        const response = await rangerApi.getAllRangers();
        if (response.success && response.result) {
          const list = response.result.map((item: any) => ({
            id: item.username,
            employeeId: item.username.toUpperCase(),
            name: `${item.firstname} ${item.surname}`,
            phone: item.mobilephone,
            email: item.email,
            position: item.position,
            parkName: item.park?.name || "ไม่ระบุอุทยาน",
            firstName: item.firstname,
            lastName: item.surname,
            birthDate: formatThaiDate(item.birthDate),
            startDate: formatSlashDate(item.startDate),
            district: item.district,
            subDistrict: item.subDistrict,
            province: item.province,
            gender: item.gender === 2 ? "หญิง" : "ชาย"
          }));
          setRangers(list);

          const found = list.find((r: any) => r.id === rangerId);
          if (found) {
            setCurrentRanger(found);
            setEmployeeId(found.employeeId);
            setFirstName(found.firstName);
            setLastName(found.lastName);
            setBirthDate(found.birthDate);
            setPosition(found.position);
            setParkName(found.parkName);
            setStartDate(found.startDate);
            setDistrict(found.district);
            setSubDistrict(found.subDistrict);
            setProvince(found.province);
            setGender(found.gender);
            setPhone(found.phone);
            setEmail(found.email);
          }
        }
      } catch (err) {
        console.error("Failed to fetch rangers from database:", err);
      }
    };
    if (rangerId) {
      fetchRangerData();
    }
  }, [rangerId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRanger) return;

    setError("");
    setSuccess("");

    if (!employeeId || !firstName || !lastName || !phone || !email) {
      setError("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    setIsLoading(true);
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

      const updated = rangers.map((r) => {
        if (r.id === currentRanger.id) {
          return {
            ...r,
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
        }
        return r;
      });
      setRangers(updated);
      localStorage.setItem("greenpass_rangers", JSON.stringify(updated));

      setSuccess("แก้ไขประวัติเจ้าหน้าที่อุทยานสำเร็จแล้ว!");

      setTimeout(() => {
        router.push(`/admin/view-park-ranger-detail?id=${currentRanger.id}`);
      }, 1000);

    } catch (err) {
      console.error("Failed to update park ranger in database:", err);
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentRanger) {
    return (
      <div className="text-center py-12 text-zinc-400 font-bold text-xs">
        ไม่พบข้อมูลบัญชีผู้ใช้งานเจ้าหน้าที่อุทยาน
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-[#0b0303]/95 border border-[#300f0f]/30 rounded-2xl p-6 shadow-2xl relative z-10 text-white font-sans text-[10px] my-6">
      
      {/* Notifications */}
      {error && (
        <div className="mb-3 p-2 bg-red-950/60 border border-red-800 text-red-200 rounded text-center font-bold">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-200 rounded text-center font-bold">
          {success}
        </div>
      )}

      {/* Form (ตามรูปที่ 3.3.99 ในเอกสาร) */}
      <form onSubmit={handleSave} className="space-y-3.5">
        
        {/* ข้อมูลพื้นฐาน */}
        <div className="space-y-2">
          <div className="text-center font-bold text-xs pb-1 mb-1 text-white border-b border-white/10">
            ข้อมูลพื้นฐาน
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">รหัสพนักงาน</label>
              <input 
                type="text" 
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 focus:outline-none font-bold border-none"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">ชื่อ</label>
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 focus:outline-none font-bold border-none"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">นามสกุล</label>
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 focus:outline-none font-bold border-none"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">วัน/เดือน/ปีเกิด</label>
              <input 
                type="text" 
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 focus:outline-none font-bold border-none"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">ตำแหน่ง</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 focus:outline-none font-bold border-none appearance-none"
                disabled={isLoading}
              >
                <option value="เจ้าหน้าที่ประชาสัมพันธ์">เจ้าหน้าที่ประชาสัมพันธ์</option>
                <option value="หัวหน้าอุทยาน">หัวหน้าอุทยาน</option>
                <option value="เจ้าหน้าที่พิทักษ์ป่า">เจ้าหน้าที่พิทักษ์ป่า</option>
                <option value="เจ้าหน้าที่บริการนักท่องเที่ยว">เจ้าหน้าที่บริการนักท่องเที่ยว</option>
                <option value="เจ้าหน้าที่ธุรการ">เจ้าหน้าที่ธุรการ</option>
              </select>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">อุทยานที่สังกัด</label>
              <select
                value={parkName}
                onChange={(e) => setParkName(e.target.value)}
                className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 focus:outline-none font-bold border-none appearance-none"
                disabled={isLoading}
              >
                <option value="อุทยานแห่งชาติแก่งกระจาน">อุทยานแห่งชาติแก่งกระจาน</option>
                <option value="อุทยานแห่งชาติเขาใหญ่">อุทยานแห่งชาติเขาใหญ่</option>
                <option value="อุทยานแห่งชาติเอราวัณ">อุทยานแห่งชาติเอราวัณ</option>
                <option value="อุทยานแห่งชาติสุเทพ-ปุย">อุทยานแห่งชาติสุเทพ-ปุย</option>
                <option value="อุทยานแห่งชาติดอยอินทนนท์">อุทยานแห่งชาติดอยอินทนนท์</option>
              </select>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">วันที่เริ่มปฏิบัติงาน</label>
              <input 
                type="text" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 focus:outline-none font-bold border-none"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">อำเภอ</label>
              <input 
                type="text" 
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 focus:outline-none font-bold border-none"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">ตำบล</label>
              <input 
                type="text" 
                value={subDistrict}
                onChange={(e) => setSubDistrict(e.target.value)}
                className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 focus:outline-none font-bold border-none"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">จังหวัด</label>
              <input 
                type="text" 
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 focus:outline-none font-bold border-none"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">เพศ</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 focus:outline-none font-bold border-none appearance-none"
                disabled={isLoading}
              >
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
              </select>
            </div>
          </div>
        </div>

        {/* ข้อมูลติดต่อ */}
        <div className="space-y-2 pt-1">
          <div className="text-center font-bold text-xs pb-1 mb-1 text-white border-b border-white/10">
            ข้อมูลติดต่อ
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">เบอร์มือถือ</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 focus:outline-none font-bold border-none"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">อีเมล</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 focus:outline-none font-bold border-none"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 pt-3.5">
          <button 
            type="button"
            onClick={() => router.push(`/admin/view-park-ranger-detail?id=${currentRanger.id}`)}
            className="px-6 py-1 bg-transparent border border-[#5ac87f] text-[#5ac87f] hover:bg-[#5ac87f]/10 text-xs font-bold rounded cursor-pointer transition-colors"
            disabled={isLoading}
          >
            ย้อนกลับ
          </button>
          <button 
            type="submit"
            className="px-6 py-1 bg-[#5ac87f] hover:bg-[#4cb570] text-black text-xs font-bold rounded cursor-pointer transition-colors flex items-center gap-1.5"
            disabled={isLoading}
          >
            {isLoading && <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />}
            ยืนยัน
          </button>
        </div>

      </form>
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
