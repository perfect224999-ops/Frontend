"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { rangerApi } from "../../../../service/api";
import { Search, Filter, ChevronDown, UserCheck, Plus, ShieldCheck } from "lucide-react";

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

export default function ListParkRangerPage() {
  const router = useRouter();
  const [rangers, setRangers] = useState<Ranger[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPark, setSelectedPark] = useState("ทั้งหมด");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("greenpass_rangers");
    }

    const fetchRangers = async () => {
      try {
        const response = await rangerApi.getAllRangers();
        const rawList = response?.result || response?.data || (Array.isArray(response) ? response : []);
        if (Array.isArray(rawList)) {
          const mapped: Ranger[] = rawList.map((item: any) => ({
            id: item.username,
            employeeId: item.username ? item.username.toUpperCase() : "",
            name: `${item.firstname || ""} ${item.surname || ""}`.trim() || item.username,
            phone: formatPhone(item.mobilephone),
            email: item.email || "",
            role: item.position || "เจ้าหน้าที่อุทยาน",
            parkName: item.park?.name || item.parkName || "อุทยานแห่งชาติ",
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

          const reversedMapped = [...mapped].reverse();
          setRangers(reversedMapped);
        } else {
          setRangers([]);
        }
      } catch (error) {
        console.error("Failed to load rangers from backend:", error);
        setRangers([]);
      }
    };
    fetchRangers();
  }, []);


  const filteredRangers = rangers.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPark = selectedPark === "ทั้งหมด" || r.parkName === selectedPark;
    return matchesSearch && matchesPark;
  });

  return (
    <div className="w-full max-w-7xl xl:max-w-[1380px] mx-auto font-sans relative py-4 space-y-6 my-2 px-2 sm:px-4">
      
      {/* Container หลัก สีขาว */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-200/50 text-slate-800">
        
        {/* Header Title & Add Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                รายชื่อเจ้าหน้าที่อุทยาน
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {rangers.length} ท่าน
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                ค้นหาและจัดการข้อมูลประวัติเจ้าหน้าที่ปฏิบัติตามรายอุทยานทั่วประเทศ
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/admin/add-park-ranger")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มเจ้าหน้าที่ใหม่</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3.5">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามชื่อ - นามสกุล หรือ อีเมล..."
              className="w-full bg-white text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 text-xs font-medium border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
            />
          </div>
          
          <div className="relative w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedPark}
              onChange={(e) => setSelectedPark(e.target.value)}
              className="w-full md:w-64 bg-white text-slate-800 rounded-xl pl-9 pr-10 py-2 text-xs font-medium border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="ทั้งหมด">เลือกอุทยานทั้งหมด</option>
              <option value="ดอยอินทนนท์">อุทยานแห่งชาติดอยอินทนนท์</option>
              <option value="อุทยานแห่งชาติเขาใหญ่">อุทยานแห่งชาติเขาใหญ่</option>
              <option value="อุทยานแห่งชาติแก่งกระจาน">อุทยานแห่งชาติแก่งกระจาน</option>
              <option value="อุทยานแห่งชาติเอราวัณ">อุทยานแห่งชาติเอราวัณ</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white font-semibold">
                  <th className="px-4 py-3.5 text-center">ลำดับ</th>
                  <th className="px-4 py-3.5 text-center">ชื่อ-นามสกุล</th>
                  <th className="px-4 py-3.5 text-center">เบอร์มือถือ</th>
                  <th className="px-4 py-3.5 text-center">อีเมล</th>
                  <th className="px-4 py-3.5 text-center">ตำแหน่ง</th>
                  <th className="px-4 py-3.5 text-center">อุทยานแห่งชาติ</th>
                  <th className="px-4 py-3.5 text-center">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredRangers.length > 0 ? (
                  filteredRangers.map((ranger, idx) => (
                    <tr key={ranger.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-400 whitespace-nowrap text-center">
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      <td className="px-4 py-3.5 text-slate-900 font-bold whitespace-nowrap text-center">{ranger.name}</td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap text-center">{ranger.phone}</td>
                      <td className="px-4 py-3.5 text-emerald-700 underline font-normal whitespace-nowrap text-center">{ranger.email}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          {ranger.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium whitespace-nowrap text-center">{ranger.parkName}</td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/admin/view-park-ranger-detail?id=${ranger.id}`)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl cursor-pointer transition-colors shadow-sm"
                        >
                          รายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400 font-medium">
                      ไม่พบข้อมูลรายชื่อเจ้าหน้าที่อุทยาน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}

