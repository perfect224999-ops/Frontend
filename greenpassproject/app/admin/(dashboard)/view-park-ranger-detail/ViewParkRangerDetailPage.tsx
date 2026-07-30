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
  roles?: string[];
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

function RangerDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rangerId = searchParams.get("id");
  const [ranger, setRanger] = useState<Ranger | null>(null);

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
            gender: item.gender === 2 ? "หญิง" : "ชาย",
            roles: [
              item.canIssueStamp && "สแกนแสตมป์",
              item.canAnnouncement && "ประกาศข่าวสาร",
              item.canEditParkDetails && "แก้ไขรายละเอียด",
              item.canProgressReport && "รายงานความคืบหน้าของเหตุการณ์"
            ].filter(Boolean) as string[]
          }));
          const found = list.find((r: any) => r.id === rangerId);
          if (found) {
            setRanger(found);
          }
        }
      } catch (err) {
        console.error("Failed to fetch ranger details from database:", err);
      }
    };
    if (rangerId) {
      fetchRangerData();
    }
  }, [rangerId]);

  if (!ranger) {
    return (
      <div className="text-center py-12 text-zinc-400 font-bold text-xs">
        ไม่พบข้อมูลบัญชีผู้ใช้งานเจ้าหน้าที่อุทยาน
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-[#0b0303]/95 border border-[#300f0f]/30 rounded-2xl p-6 shadow-2xl relative z-10 text-white font-sans text-[10px] my-6">
      
      {/* Top Controls (ตามรูปที่ 3.3.93 ในเอกสาร) */}
      <div className="flex justify-center gap-3 pb-4 mb-4 border-b border-white/15">
        <button 
          onClick={() => router.push("/admin/list-park-ranger")}
          className="px-4 py-1.5 border border-[#5ac87f] text-[#5ac87f] hover:bg-[#5ac87f]/10 text-[10px] font-bold rounded cursor-pointer transition-colors"
        >
          ย้อนกลับ
        </button>
        <button 
          onClick={() => router.push(`/admin/edit-park-ranger-profile?id=${ranger.id}`)}
          className="px-4 py-1.5 bg-[#5ac87f] hover:bg-[#4cb570] text-black text-[10px] font-bold rounded cursor-pointer transition-colors"
        >
          แก้ไข
        </button>
        <button 
          onClick={() => router.push(`/admin/set-role?id=${ranger.id}`)}
          className="px-4 py-1.5 bg-[#5ac87f] hover:bg-[#4cb570] text-black text-[10px] font-bold rounded cursor-pointer transition-colors"
        >
          เขตบทบาท
        </button>
      </div>

      <div className="space-y-4">
        
        {/* ข้อมูลพื้นฐาน */}
        <div className="space-y-2">
          <div className="text-center font-bold text-xs pb-1 border-b border-white/10 mb-1 text-white">
            ข้อมูลพื้นฐาน
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">รหัสพนักงาน</label>
              <div className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 font-bold">
                {ranger.employeeId || `PR${ranger.id}`}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">ชื่อ</label>
              <div className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 font-bold">
                {ranger.firstName || ranger.name.split(" ")[0]}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">นามสกุล</label>
              <div className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 font-bold">
                {ranger.lastName || ranger.name.split(" ")[1] || "-"}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">วัน/เดือน/ปีเกิด</label>
              <div className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 font-bold">
                {ranger.birthDate || "15 ต.ค. 2547"}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">ตำแหน่ง</label>
              <div className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 font-bold">
                {ranger.position || ranger.role}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">อุทยานที่สังกัด</label>
              <div className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 font-bold">
                {ranger.parkName}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">วันที่เริ่มปฏิบัติงาน</label>
              <div className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 font-bold">
                {ranger.startDate || "15/10/2566"}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">อำเภอ</label>
              <div className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 font-bold">
                {ranger.district || "หนองสองตอน"}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">ตำบล</label>
              <div className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 font-bold">
                {ranger.subDistrict || "หนองสองตอน"}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">จังหวัด</label>
              <div className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 font-bold">
                {ranger.province || "ฉะเชิงเทรา"}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">เพศ</label>
              <div className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 font-bold">
                {ranger.gender || "ชาย"}
              </div>
            </div>
          </div>
        </div>

        {/* ข้อมูลติดต่อ */}
        <div className="space-y-2 pt-1">
          <div className="text-center font-bold text-xs pb-1 border-b border-white/10 mb-1 text-white">
            ข้อมูลติดต่อ
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">เบอร์มือถือ</label>
              <div className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 font-bold">
                {ranger.phone}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="font-bold text-zinc-300">อีเมล</label>
              <div className="w-full bg-[#5ac87f] text-black rounded px-2.5 py-1 font-bold">
                {ranger.email}
              </div>
            </div>
          </div>
        </div>

        {/* บทบาทสิทธิ์ */}
        <div className="space-y-2 pt-1">
          <div className="text-center font-bold text-xs pb-1 border-b border-white/10 mb-1 text-white">
            บทบาท
          </div>

          <div className="space-y-1.5 px-1 font-bold text-zinc-300">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={ranger.roles?.includes("สแกนแสตมป์") || false} 
                disabled 
                className="accent-emerald-500 rounded border-zinc-700/60"
              />
              <span>สแกนแสตมป์</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={ranger.roles?.includes("ประกาศข่าวสาร") || false} 
                disabled 
                className="accent-emerald-500 rounded border-zinc-700/60"
              />
              <span>ประกาศข่าวสาร</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={ranger.roles?.includes("แก้ไขรายละเอียด") || false} 
                disabled 
                className="accent-emerald-500 rounded border-zinc-700/60"
              />
              <span>แก้ไขรายละเอียด</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={ranger.roles?.includes("รายงานความคืบหน้าของเหตุการณ์") || false} 
                disabled 
                className="accent-emerald-500 rounded border-zinc-700/60"
              />
              <span>รายงานความคืบหน้าของเหตุการณ์</span>
            </label>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function ViewParkRangerPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12 text-xs font-bold text-zinc-400">
        กำลังโหลดข้อมูลเจ้าหน้าที่...
      </div>
    }>
      <RangerDetailContent />
    </Suspense>
  );
}
