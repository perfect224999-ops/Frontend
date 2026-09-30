"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { rangerApi, parkApi } from "../../../../service/api";
import { Search, Filter, ChevronDown, ChevronUp, UserCheck, Plus, ShieldCheck, X, Check, Trees, Loader2 } from "lucide-react";

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
  isLatest?: boolean;
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

const normalizePosition = (pos?: string) => {
  if (!pos) return "เจ้าหน้าที่อุทยาน";
  if (pos === "เจ้าหน้าที่ธุรการ" || pos.startsWith("เจ้าหน้าที่รับแจ้งเหตุ")) {
    return "เจ้าหน้าที่รับแจ้งเหตุ";
  }
  return pos;
};

export default function ListParkRangerPage() {
  const router = useRouter();
  const [rangers, setRangers] = useState<Ranger[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPark, setSelectedPark] = useState("ทั้งหมด");
  const [allDbParks, setAllDbParks] = useState<string[]>([]);
  const [parkSearchQuery, setParkSearchQuery] = useState("");
  const [isParkDropdownOpen, setIsParkDropdownOpen] = useState(false);
  const parkDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRangers = async () => {
      setLoading(true);
      try {
        const response = await rangerApi.getAllRangers();
        const rawList = response?.result || response?.data || (Array.isArray(response) ? response : []);

        // 1. ดึงรายการลำดับการเพิ่มล่าสุดจาก localStorage
        const recentOrderRaw = typeof window !== "undefined" ? localStorage.getItem("greenpass_ranger_recent_order") : null;
        let recentOrder: string[] = [];
        if (recentOrderRaw) {
          try {
            const parsed = JSON.parse(recentOrderRaw);
            if (Array.isArray(parsed)) {
              recentOrder = parsed.map((x: any) => String(x).trim().toUpperCase());
            }
          } catch (e) {}
        }

        // 2. ดึงข้อมูลสำรองจาก greenpass_rangers (กรณีเพิ่งเพิ่มเสร็จหรือออฟไลน์)
        const savedRaw = typeof window !== "undefined" ? localStorage.getItem("greenpass_rangers") : null;
        let savedList: any[] = [];
        if (savedRaw) {
          try {
            savedList = JSON.parse(savedRaw);
          } catch (e) {}
        }

        const dbMapped: (Ranger & { _dbIndex?: number })[] = Array.isArray(rawList)
          ? rawList.map((item: any, idx: number) => ({
              id: item.username,
              employeeId: item.username ? item.username.toUpperCase() : "",
              name: `${item.firstname || ""} ${item.surname || ""}`.trim() || item.username,
              phone: formatPhone(item.mobilephone),
              email: item.email || "",
              role: normalizePosition(item.position),
              parkName: item.park?.name || item.parkName || "อุทยานแห่งชาติ",
              firstName: item.firstname,
              lastName: item.surname,
              birthDate: formatThaiDate(item.birthDate),
              position: normalizePosition(item.position),
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
              ].filter(Boolean) as string[],
              _dbIndex: idx
            }))
          : [];

        // ผสานรายการที่เพิ่งบันทึกในเครื่อง หากยังไม่ปรากฏในฐานข้อมูล
        const existingIds = new Set(dbMapped.map((r) => r.id.toLowerCase()));
        const extraLocal: (Ranger & { _dbIndex?: number })[] = [];
        for (const localR of savedList) {
          const lUser = (localR.username || localR.id || "").toLowerCase();
          if (lUser && !existingIds.has(lUser)) {
            extraLocal.push({
              id: lUser,
              employeeId: (localR.employeeId || lUser).toUpperCase(),
              name: localR.name || `${localR.firstName || ""} ${localR.lastName || ""}`.trim() || lUser,
              phone: formatPhone(localR.phone || ""),
              email: localR.email || "",
              role: normalizePosition(localR.role || localR.position),
              parkName: localR.parkName || "อุทยานแห่งชาติ",
              firstName: localR.firstName,
              lastName: localR.lastName,
              birthDate: formatThaiDate(localR.birthDate),
              position: normalizePosition(localR.position),
              startDate: formatSlashDate(localR.startDate),
              district: localR.district,
              subDistrict: localR.subDistrict,
              province: localR.province,
              gender: localR.gender === 2 || localR.gender === "หญิง" ? "หญิง" : "ชาย",
              roles: localR.roles || [],
              _dbIndex: 999999
            });
            existingIds.add(lUser);
          }
        }

        const combined = [...extraLocal, ...dbMapped];

        // 3. จัดเรียง: ให้คนที่เพิ่มล่าสุดอยู่บนสุดเสมอ (ล่าสุด = index 0)
        const getSortWeight = (r: any) => {
          const uUpper = (r.employeeId || r.id || "").trim().toUpperCase();
          const uLower = uUpper.toLowerCase();

          // 3.1 อยู่ในรายการเพิ่มล่าสุด (ลำดับ 0 คือล่าสุด คะแนนสูงสุด)
          const rIdx = recentOrder.indexOf(uUpper);
          if (rIdx !== -1) {
            return 2000000000 - (rIdx * 10000);
          }

          // 3.2 ตรวจสอบเวลาที่สร้างใน localStorage
          const ts = typeof window !== "undefined"
            ? (localStorage.getItem(`greenpass_ranger_created_${uUpper}`) ||
               localStorage.getItem(`greenpass_ranger_created_${uLower}`))
            : null;
          if (ts && !isNaN(Number(ts))) {
            return 1000000000 + Number(ts);
          }

          // 3.3 ถอดหมายเลข PR จากชื่อผู้ใช้ (เช่น PR21 -> 21, PR18 -> 18) เรียงคนที่เลขรหัสใหม่กว่าไว้บนสุด
          const numMatch = uUpper.match(/\d+/);
          const numVal = numMatch ? parseInt(numMatch[0], 10) : 0;
          const dbIdx = typeof r._dbIndex === "number" ? r._dbIndex : 0;

          // บัญชีเริ่มต้นดั้งเดิม parkranger01
          if (uLower === "parkranger01") {
            return -1;
          }

          // เรียงตามหมายเลขรหัส PR ล่าสุด และลำดับใน DB ล่าสุด
          return (numVal * 100000) + dbIdx;
        };

        combined.sort((a, b) => getSortWeight(b) - getSortWeight(a));

        // ตรวจสอบและทำเครื่องหมายคนที่เพิ่มล่าสุด
        if (combined.length > 0 && recentOrder.length > 0) {
          const topId = recentOrder[0]?.toUpperCase();
          if (topId && combined[0].id.toUpperCase() === topId) {
            combined[0].isLatest = true;
          }
        }

        setRangers(combined);
      } catch (error) {
        console.error("Failed to load rangers from backend:", error);
        setRangers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRangers();
  }, []);


  // โหลดรายชื่ออุทยานแห่งชาติทั้งหมด 156 แห่งจากฐานข้อมูล
  useEffect(() => {
    const fetchAllParks = async () => {
      try {
        const response = await parkApi.searchParks("");
        const rawList = response?.result || response?.data || (Array.isArray(response) ? response : []);
        if (Array.isArray(rawList) && rawList.length > 0) {
          const names = rawList.map((p: any) => p.name).filter(Boolean);
          setAllDbParks(names);
        }
      } catch (err) {
        console.error("Failed to load all parks:", err);
      }
    };
    fetchAllParks();
  }, []);

  // ปิด Dropdown เมื่อคลิกนอกขอบเขต
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

  const allParkOptions = useMemo(() => {
    if (allDbParks.length > 0) {
      return allDbParks;
    }
    const defaultList = [
      "อุทยานแห่งชาติเขาใหญ่",
      "อุทยานแห่งชาติแก่งกระจาน",
      "อุทยานแห่งชาติเอราวัณ",
      "อุทยานแห่งชาติดอยสุเทพ-ปุย",
      "อุทยานแห่งชาติดอยอินทนนท์"
    ];
    const set = new Set<string>(defaultList);
    rangers.forEach((r) => {
      if (r.parkName && r.parkName !== "อุทยานแห่งชาติ") set.add(r.parkName);
    });
    return Array.from(set);
  }, [allDbParks, rangers]);

  const filteredParkOptions = useMemo(() => {
    const q = parkSearchQuery.trim().toLowerCase();
    if (!q) return allParkOptions;
    return allParkOptions.filter((name) =>
      name.toLowerCase().includes(q) ||
      name.replace(/อุทยานแห่งชาติ/g, "").trim().toLowerCase().includes(q)
    );
  }, [allParkOptions, parkSearchQuery]);

  const handleSelectPark = (park: string) => {
    setSelectedPark(park);
    setParkSearchQuery("");
    setIsParkDropdownOpen(false);
  };

  const filteredRangers = rangers.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPark = selectedPark === "ทั้งหมด" || 
                        r.parkName === selectedPark || 
                        r.parkName.includes(selectedPark) || 
                        selectedPark.includes(r.parkName);
    return matchesSearch && matchesPark;
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto font-sans relative py-4 space-y-6 my-2 px-2 sm:px-4">
      
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
          
          {/* ช่องเลือกอุทยานแบบพิมพ์ค้นหาได้ (Searchable Combobox ครบทั้ง 156 แห่ง) */}
          <div className="relative w-full md:w-80" ref={parkDropdownRef}>
            <div className="relative flex items-center">
              <Filter className="w-3.5 h-3.5 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <input
                type="text"
                value={isParkDropdownOpen ? parkSearchQuery : (selectedPark === "ทั้งหมด" ? "เลือกอุทยานทั้งหมด" : selectedPark)}
                onChange={(e) => {
                  setParkSearchQuery(e.target.value);
                  if (!isParkDropdownOpen) setIsParkDropdownOpen(true);
                }}
                onFocus={() => {
                  setParkSearchQuery("");
                  setIsParkDropdownOpen(true);
                }}
                placeholder="พิมพ์ค้นหาอุทยาน (156 แห่ง)..."
                className={`w-full bg-white text-slate-800 rounded-xl pl-9 pr-16 py-2 text-xs font-semibold border transition-all cursor-text placeholder:text-slate-400 ${
                  selectedPark !== "ทั้งหมด" 
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-800 font-bold" 
                    : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
              <div className="absolute right-2.5 flex items-center gap-1 text-slate-400">
                {(selectedPark !== "ทั้งหมด" || parkSearchQuery) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPark("ทั้งหมด");
                      setParkSearchQuery("");
                    }}
                    className="p-1 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                    title="รีเซ็ตเป็นทั้งหมด"
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
                  className="p-1 hover:text-emerald-700 rounded-full transition-colors cursor-pointer"
                  title={isParkDropdownOpen ? "ปิดรายการ" : "เปิดรายการอุทยาน (156 แห่ง)"}
                >
                  {isParkDropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Dropdown Menu รายชื่ออุทยาน 156 แห่ง */}
            {isParkDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/80 overflow-hidden max-h-72 flex flex-col animate-in fade-in-0 zoom-in-95 duration-100">
                <div className="p-2 border-b border-slate-100 bg-slate-50/80 text-[11px] font-medium text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Trees className="w-3.5 h-3.5 text-emerald-600" />
                    {parkSearchQuery.trim() ? "ผลการค้นหา" : "รายชื่ออุทยานทั้งหมด"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {filteredParkOptions.length} แห่ง
                  </span>
                </div>

                <div className="overflow-y-auto max-h-56 divide-y divide-slate-50">
                  {/* Option: เลือกอุทยานทั้งหมด */}
                  <button
                    type="button"
                    onClick={() => handleSelectPark("ทั้งหมด")}
                    className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors border-b border-slate-100 ${
                      selectedPark === "ทั้งหมด"
                        ? "bg-emerald-50/90 text-emerald-800 font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium"
                    }`}
                  >
                    <span className="truncate pr-2 flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-emerald-600" />
                      เลือกอุทยานทั้งหมด
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400">({rangers.length} ท่าน)</span>
                      {selectedPark === "ทั้งหมด" && (
                        <Check className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                  </button>

                  {/* 156 National Parks List */}
                  {filteredParkOptions.length > 0 ? (
                    filteredParkOptions.map((pName) => {
                      const isSelected = selectedPark === pName;
                      const countInPark = rangers.filter((r) => r.parkName === pName || r.parkName.includes(pName)).length;
                      return (
                        <button
                          key={pName}
                          type="button"
                          onClick={() => handleSelectPark(pName)}
                          className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? "bg-emerald-50/90 text-emerald-800 font-bold"
                              : "text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium"
                          }`}
                        >
                          <span className="truncate pr-2">{pName}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {countInPark > 0 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100/80 text-emerald-800 font-semibold">
                                {countInPark} ท่าน
                              </span>
                            )}
                            {isSelected && (
                              <Check className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      ไม่พบอุทยานที่ค้นหา &ldquo;{parkSearchQuery}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            )}
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                        <span className="text-xs font-semibold text-slate-600">กำลังดึงข้อมูลรายชื่อเจ้าหน้าที่...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRangers.length > 0 ? (
                  filteredRangers.map((ranger, idx) => (
                    <tr key={ranger.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-400 whitespace-nowrap text-center">
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      <td className="px-4 py-3.5 text-slate-900 font-bold whitespace-nowrap text-center">
                        <span>{ranger.name}</span>
                      </td>
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
                      ไม่พบข้อมูล Park Ranger
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

