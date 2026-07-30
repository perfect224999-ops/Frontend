"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { rangerApi } from "../../../../service/api";


interface Ranger {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  parkName: string;
  // Detail fields
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  position?: string;
  startDate?: string;
  district?: string;
  subDistrict?: string;
  province?: string;
  gender?: string;
  roles?: string[];
}

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

const formatPhone = (phoneStr: string) => {
  if (!phoneStr) return "";
  const cleaned = phoneStr.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 10)}`;
  }
  return phoneStr;
};

const INITIAL_RANGERS: Ranger[] = [
  { id: "01", name: "สมชาย ใจดี", phone: "065-5249531", email: "perfasd@gmail.com", role: "หัวหน้าอุทยาน", parkName: "อุทยานแห่งชาติเขาใหญ่" },
  { id: "02", name: "สมหญิง พูนสุข", phone: "054-5478536", email: "asdaddsd@gmail.com", role: "เจ้าหน้าที่พิทักษ์ป่า", parkName: "อุทยานแห่งชาติเขาใหญ่" },
  { id: "03", name: "อนันต์ ศรีสุข", phone: "085-4785236", email: "sdperfasd@gmail.com", role: "เจ้าหน้าที่บริการนักท่องเที่ยว", parkName: "อุทยานแห่งชาติเขาใหญ่" },
  { id: "04", name: "จอนนี่ จิ้มเอม", phone: "057-1425756", email: "xcperfasd@gmail.com", role: "เจ้าหน้าที่ประชาสัมพันธ์", parkName: "อุทยานแห่งชาติแก่งกระจาน" },
  { id: "05", name: "วิทยา พรหมมา", phone: "095-7845889", email: "ewperfasd@gmail.com", role: "เจ้าหน้าที่ธุรการ", parkName: "อุทยานแห่งชาติแก่งกระจาน" },
  { id: "06", name: "สมชิง สมานอารมณ์", phone: "086-4525696", email: "scvperfasd@gmail.com", role: "เจ้าหน้าที่บริการนักท่องเที่ยว", parkName: "อุทยานแห่งชาติแก่งกระจาน" },
  { id: "07", name: "สมพง สนองเกียรติ", phone: "065-8421557", email: "sdpxdwerd@gmail.com", role: "เจ้าหน้าที่พิทักษ์ป่า", parkName: "อุทยานแห่งชาติเขาใหญ่" }
];

export default function ListParkRangerPage() {
  const router = useRouter();
  const [rangers, setRangers] = useState<Ranger[]>(INITIAL_RANGERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPark, setSelectedPark] = useState("ทั้งหมด");

  useEffect(() => {
    const fetchRangers = async () => {
      try {
        const response = await rangerApi.getAllRangers();
        if (response.success && response.result) {
          const mapped: Ranger[] = response.result.map((item: any) => ({
            id: item.username,
            employeeId: item.username.toUpperCase(),
            name: `${item.firstname} ${item.surname}`,
            phone: formatPhone(item.mobilephone),
            email: item.email,
            role: item.position,
            parkName: item.park?.name || "ไม่ระบุอุทยาน",
            // Additional detail fields
            firstName: item.firstname,
            lastName: item.surname,
            birthDate: formatThaiDate(item.birthDate),
            position: item.position,
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
          setRangers(mapped);
          localStorage.setItem("greenpass_rangers", JSON.stringify(mapped));
        }
      } catch (error) {
        console.error("Failed to load rangers from backend, using localStorage fallback:", error);
        const saved = localStorage.getItem("greenpass_rangers");
        if (saved) {
          try {
            setRangers(JSON.parse(saved));
          } catch (e) {
            setRangers(INITIAL_RANGERS);
          }
        }
      }
    };
    fetchRangers();
  }, []);

  const filteredRangers = rangers.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPark = selectedPark === "ทั้งหมด" || r.parkName === selectedPark;
    return matchesSearch && matchesPark;
  });

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#1b1212]/95 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative z-10 text-white font-sans text-[11px] my-6">
      
      {/* Search Header Bar (ตามรูปที่ 3.3.90 ในเอกสาร) */}
      <div className="bg-[#2a1b1b] border border-zinc-700/40 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-5">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ-นามสกุล"
            className="w-full bg-white text-zinc-900 rounded-md px-3 py-1.5 focus:outline-none placeholder-zinc-500 font-bold border-none text-[10px]"
          />
        </div>
        
        <div className="w-full md:w-auto">
          <select
            value={selectedPark}
            onChange={(e) => setSelectedPark(e.target.value)}
            className="w-full md:w-auto bg-[#423131] hover:bg-[#4d3b3b] text-white rounded-md px-4 py-1.5 focus:outline-none font-bold border-none cursor-pointer text-[10px]"
          >
            <option value="ทั้งหมด">เลือกอุทยาน ▼</option>
            <option value="อุทยานแห่งชาติเขาใหญ่">อุทยานแห่งชาติเขาใหญ่</option>
            <option value="อุทยานแห่งชาติแก่งกระจาน">อุทยานแห่งชาติแก่งกระจาน</option>
            <option value="อุทยานแห่งชาติเอราวัณ">อุทยานแห่งชาติเอราวัณ</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-bold bg-[#140b0b]">
              <th className="px-4 py-3">ลำดับ</th>
              <th className="px-4 py-3">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3">เบอร์มือถือ</th>
              <th className="px-4 py-3">อีเมล</th>
              <th className="px-4 py-3">ตำแหน่ง</th>
              <th className="px-4 py-3">อุทยานแห่งชาติ</th>
              <th className="px-4 py-3 text-center">รายละเอียด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80 font-medium">
            {filteredRangers.length > 0 ? (
              filteredRangers.map((ranger, idx) => (
                <tr key={ranger.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-bold text-zinc-400">
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3 text-white font-bold">{ranger.name}</td>
                  <td className="px-4 py-3 text-zinc-300">{ranger.phone}</td>
                  <td className="px-4 py-3 text-zinc-300 underline font-normal">{ranger.email}</td>
                  <td className="px-4 py-3 text-rose-300">{ranger.role}</td>
                  <td className="px-4 py-3 text-zinc-300">{ranger.parkName}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => router.push(`/admin/view-park-ranger-detail?id=${ranger.id}`)}
                      className="px-3 py-1 bg-[#27a336] hover:bg-[#1e8529] text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
                    >
                      รายละเอียด
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500 font-bold">
                  ไม่พบข้อมูลรายชื่อเจ้าหน้าที่อุทยาน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
