"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rangerApi } from "../../../../service/api";


export default function AddParkRangerPage() {
  const router = useRouter();
  
  // Form states based on Page 155 specifications
  const [employeeId, setEmployeeId] = useState("PR01");
  const [firstName, setFirstName] = useState("สมพร");
  const [lastName, setLastName] = useState("ดงศักดิ์");
  const [birthDate, setBirthDate] = useState("15 ต.ค. 2547");
  const [position, setPosition] = useState("เจ้าหน้าที่ประชาสัมพันธ์");
  const [parkName, setParkName] = useState("อุทยานแห่งชาติแก่งกระจาน");
  const [startDate, setStartDate] = useState("15/10/2566");
  const [district, setDistrict] = useState("หนองสองตอน");
  const [subDistrict, setSubDistrict] = useState("หนองสองตอน");
  const [province, setProvince] = useState("ฉะเชิงเทรา");
  const [gender, setGender] = useState("ชาย");
  const [phone, setPhone] = useState("097-1425756");
  const [email, setEmail] = useState("xcperfasd@gmail.com");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!employeeId || !firstName || !lastName || !phone || !email) {
      setError("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    setIsLoading(true);
    try {
      // 1. บันทึกลงฐานข้อมูล Spring Boot ผ่าน API
      await rangerApi.addRanger({
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

      // 2. บันทึกลง localStorage สำรองเพื่อรองรับการทำงานของ frontend
      const saved = localStorage.getItem("greenpass_rangers");
      let list = [
        { id: "1", username: "ranger01", name: "สมชาย ใจดี", parkName: "อุทยานแห่งชาติเขาใหญ่", role: "Ranger", phone: "081-234-5678", status: "Active" },
        { id: "2", username: "ranger02", name: "สมรักษ์ รักป่า", parkName: "อุทยานแห่งชาติแก่งกระจาน", role: "Ranger Team Lead", phone: "089-876-5432", status: "Active" }
      ];
      if (saved) {
        try {
          list = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }

      const newRanger = {
        id: String(list.length + 1),
        employeeId,
        username: employeeId.toLowerCase(),
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
        email,
        role: position,
        status: "Active"
      };

      list.push(newRanger);
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

      {/* Form (ตามรูปที่ 3.3.87 ในเอกสาร) */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        
        {/* ข้อมูลพื้นฐาน */}
        <div className="space-y-2">
          <div className="text-center font-bold text-xs pb-1 mb-1 text-white">
            ข้อมูลพื้นฐาน
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-350 text-zinc-300">รหัสพนักงาน</label>
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
          <div className="text-center font-bold text-xs pb-1 mb-1 text-white">
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
            onClick={() => router.push("/admin/list-park-ranger")}
            className="px-6 py-1 bg-transparent border border-[#5ac87f] text-[#5ac87f] hover:bg-[#5ac87f]/10 text-xs font-bold rounded cursor-pointer"
            disabled={isLoading}
          >
            ย้อนกลับ
          </button>
          <button 
            type="submit"
            className="px-6 py-1 bg-[#5ac87f] hover:bg-[#4cb570] text-black text-xs font-bold rounded cursor-pointer flex items-center gap-1.5"
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
