"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Trees,
  Filter,
  Building2,
  TrendingUp,
  Loader2,
  Globe,
  UserCheck
} from "lucide-react";
import { adminApi } from "@/service/api";

interface ParkStatItem {
  parkId: number;
  parkName: string;
  province: string;
  announcements: number;
  totalReports: number;
  inProgress: number;
  completed: number;
  thaiVisitors?: number;
  foreignVisitors?: number;
  totalVisitors?: number;
}

const MONTH_MAP: Record<string, number> = {
  "มกราคม": 1,
  "กุมภาพันธ์": 2,
  "มีนาคม": 3,
  "เมษายน": 4,
  "พฤษภาคม": 5,
  "มิถุนายน": 6,
  "กรกฎาคม": 7,
  "สิงหาคม": 8,
  "กันยายน": 9,
  "ตุลาคม": 10,
  "พฤศจิกายน": 11,
  "ธันวาคม": 12,
};

const PROVINCE_REGION_MAP: Record<string, string> = {
  // ภาคเหนือ
  "เชียงใหม่": "ภาคเหนือ",
  "เชียงราย": "ภาคเหนือ",
  "ลำปาง": "ภาคเหนือ",
  "ลำพูน": "ภาคเหนือ",
  "แม่ฮ่องสอน": "ภาคเหนือ",
  "น่าน": "ภาคเหนือ",
  "พะเยา": "ภาคเหนือ",
  "แพร่": "ภาคเหนือ",
  "อุตรดิตถ์": "ภาคเหนือ",
  "ตาก": "ภาคเหนือ",
  "สุโขทัย": "ภาคเหนือ",
  "พิษณุโลก": "ภาคเหนือ",
  "พิจิตร": "ภาคเหนือ",
  "กำแพงเพชร": "ภาคเหนือ",
  "เพชรบูรณ์": "ภาคเหนือ",
  "นครสวรรค์": "ภาคเหนือ",
  "อุทัยธานี": "ภาคเหนือ",

  // ภาคตะวันออกเฉียงเหนือ
  "นครราชสีมา": "ภาคตะวันออกเฉียงเหนือ",
  "ขอนแก่น": "ภาคตะวันออกเฉียงเหนือ",
  "อุดรธานี": "ภาคตะวันออกเฉียงเหนือ",
  "อุบลราชธานี": "ภาคตะวันออกเฉียงเหนือ",
  "บุรีรัมย์": "ภาคตะวันออกเฉียงเหนือ",
  "สุรินทร์": "ภาคตะวันออกเฉียงเหนือ",
  "ศรีสะเกษ": "ภาคตะวันออกเฉียงเหนือ",
  "ร้อยเอ็ด": "ภาคตะวันออกเฉียงเหนือ",
  "ชัยภูมิ": "ภาคตะวันออกเฉียงเหนือ",
  "สกลนคร": "ภาคตะวันออกเฉียงเหนือ",
  "กาฬสินธุ์": "ภาคตะวันออกเฉียงเหนือ",
  "มหาสารคาม": "ภาคตะวันออกเฉียงเหนือ",
  "นครพนม": "ภาคตะวันออกเฉียงเหนือ",
  "เลย": "ภาคตะวันออกเฉียงเหนือ",
  "ยโสธร": "ภาคตะวันออกเฉียงเหนือ",
  "หนองคาย": "ภาคตะวันออกเฉียงเหนือ",
  "หนองบัวลำภู": "ภาคตะวันออกเฉียงเหนือ",
  "บึงกาฬ": "ภาคตะวันออกเฉียงเหนือ",
  "อำนาจเจริญ": "ภาคตะวันออกเฉียงเหนือ",
  "มุกดาหาร": "ภาคตะวันออกเฉียงเหนือ",

  // ภาคกลาง
  "กรุงเทพมหานคร": "ภาคกลาง",
  "กรุงเทพฯ": "ภาคกลาง",
  "นนทบุรี": "ภาคกลาง",
  "ปทุมธานี": "ภาคกลาง",
  "สมุทรปราการ": "ภาคกลาง",
  "สมุทรสาคร": "ภาคกลาง",
  "สมุทรสงคราม": "ภาคกลาง",
  "พระนครศรีอยุธยา": "ภาคกลาง",
  "อยุธยา": "ภาคกลาง",
  "อ่างทอง": "ภาคกลาง",
  "ลพบุรี": "ภาคกลาง",
  "สิงห์บุรี": "ภาคกลาง",
  "ชัยนาท": "ภาคกลาง",
  "สระบุรี": "ภาคกลาง",
  "นครนายก": "ภาคกลาง",
  "สุพรรณบุรี": "ภาคกลาง",
  "นครปฐม": "ภาคกลาง",

  // ภาคตะวันตก
  "กาญจนบุรี": "ภาคตะวันตก",
  "เพชรบุรี": "ภาคตะวันตก",
  "ประจวบคีรีขันธ์": "ภาคตะวันตก",
  "ราชบุรี": "ภาคตะวันตก",

  // ภาคตะวันออก
  "ชลบุรี": "ภาคตะวันออก",
  "ระยอง": "ภาคตะวันออก",
  "จันทบุรี": "ภาคตะวันออก",
  "ตราด": "ภาคตะวันออก",
  "ฉะเชิงเทรา": "ภาคตะวันออก",
  "ปราจีนบุรี": "ภาคตะวันออก",
  "สระแก้ว": "ภาคตะวันออก",

  // ภาคใต้
  "ภูเก็ต": "ภาคใต้",
  "สุราษฎร์ธานี": "ภาคใต้",
  "กระบี่": "ภาคใต้",
  "พังงา": "ภาคใต้",
  "สงขลา": "ภาคใต้",
  "นครศรีธรรมราช": "ภาคใต้",
  "ชุมพร": "ภาคใต้",
  "ระนอง": "ภาคใต้",
  "ตรัง": "ภาคใต้",
  "พัทลุง": "ภาคใต้",
  "สตูล": "ภาคใต้",
  "ปัตตานี": "ภาคใต้",
  "ยะลา": "ภาคใต้",
  "นราธิวาส": "ภาคใต้",
};

const PARK_PROVINCE_MAP: Record<string, string> = {
  "เขาใหญ่": "นครราชสีมา",
  "แก่งกระจาน": "เพชรบุรี",
  "เอราวัณ": "กาญจนบุรี",
  "ดอยสุเทพ-ปุย": "เชียงใหม่",
  "ดอยอินทนนท์": "เชียงใหม่",
};

function resolveProvince(p: ParkStatItem): string {
  if (p.province && p.province !== "ทั่วไป") return p.province;
  for (const [key, prov] of Object.entries(PARK_PROVINCE_MAP)) {
    if (p.parkName && p.parkName.includes(key)) return prov;
  }
  return p.province || "ทั่วไป";
}

function getRegionForProvince(province: string): string {
  if (!province) return "อื่นๆ";
  const clean = province.replace(/^จ\.\s*/, "").replace(/^จังหวัด\s*/, "").trim();
  return PROVINCE_REGION_MAP[clean] || PROVINCE_REGION_MAP[province] || "อื่นๆ";
}

export default function ViewAllStatisticesPage() {
  const [loading, setLoading] = useState(true);

  // Filter states
  const [region, setRegion] = useState("กรุณาเลือก");
  const [selectedPark, setSelectedPark] = useState("ทุกอุทยาน");
  const [province, setProvince] = useState("กรุณาเลือก");
  const [month, setMonth] = useState("ทั้งหมด");
  const [year, setYear] = useState("ทั้งหมด");

  // Dynamic Metrics from Database
  const [metrics, setMetrics] = useState({
    totalPark: 0,
    totalRanger: 0,
    totalNews: 0,
    totalReport: 0,
    totalVisitors: 0,
    totalThaiVisitors: 0,
    totalForeignVisitors: 0,
  });

  const [parkStats, setParkStats] = useState<ParkStatItem[]>([]);

  useEffect(() => {
    // 1. Instant render from sessionStorage cache
    const cacheKey = `greenpass_real_stats_cache_v2_${month}_${year}`;
    const cached = typeof window !== "undefined" ? sessionStorage.getItem(cacheKey) : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.metrics) setMetrics(parsed.metrics);
        if (parsed.parkStats) {
          setParkStats(parsed.parkStats.map((p: ParkStatItem) => ({
            ...p,
            province: resolveProvince(p),
            thaiVisitors: p.thaiVisitors || 0,
            foreignVisitors: p.foreignVisitors || 0,
            totalVisitors: p.totalVisitors || ((p.thaiVisitors || 0) + (p.foreignVisitors || 0))
          })));
        }
        setLoading(false);
      } catch (e) { }
    } else {
      setLoading(true);
    }

    // 2. Fetch fresh data from DB
    async function fetchStats() {
      try {
        const monthNum = month !== "ทั้งหมด" ? MONTH_MAP[month] : undefined;
        const yearNum = year !== "ทั้งหมด" ? Number(year) : undefined;
        const res = await adminApi.getStatistics(monthNum, yearNum);
        if (res && res.success && res.result) {
          const { metrics: m, parkStats: ps } = res.result;

          const newParkStats = (Array.isArray(ps) ? ps : []).map((p: ParkStatItem) => {
            const thai = p.thaiVisitors || 0;
            const foreign = p.foreignVisitors || 0;
            const total = p.totalVisitors || (thai + foreign);
            return {
              ...p,
              province: resolveProvince(p),
              thaiVisitors: thai,
              foreignVisitors: foreign,
              totalVisitors: total
            };
          });

          const calculatedTotalThai = newParkStats.reduce((sum: number, p: ParkStatItem) => sum + (p.thaiVisitors || 0), 0);
          const calculatedTotalForeign = newParkStats.reduce((sum: number, p: ParkStatItem) => sum + (p.foreignVisitors || 0), 0);
          const calculatedTotalVisitors = calculatedTotalThai + calculatedTotalForeign;

          const newMetrics = {
            totalPark: m?.totalPark || 0,
            totalRanger: m?.totalRanger || 0,
            totalNews: m?.totalNews || 0,
            totalReport: m?.totalReport || 0,
            totalVisitors: m?.totalVisitors ?? calculatedTotalVisitors,
            totalThaiVisitors: m?.totalThaiVisitors ?? calculatedTotalThai,
            totalForeignVisitors: m?.totalForeignVisitors ?? calculatedTotalForeign,
          };

          setMetrics(newMetrics);
          setParkStats(newParkStats);

          sessionStorage.setItem(cacheKey, JSON.stringify({
            metrics: newMetrics,
            parkStats: newParkStats
          }));
        }
      } catch (err) {
        console.error("Failed to load DB statistics:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [month, year]);

  // Dynamically filter provinces based on selected region & available parkStats
  const availableProvinces = Array.from(
    new Set(
      parkStats
        .filter((p) => {
          if (region !== "กรุณาเลือก" && region !== "ทั้งหมด") {
            return getRegionForProvince(p.province) === region;
          }
          return true;
        })
        .map((p) => p.province)
        .filter((prov) => prov && prov !== "ทั่วไป")
    )
  ).sort();

  // Dynamically filter parks based on selected region & selected province
  const availableParks = parkStats.filter((p) => {
    if (region !== "กรุณาเลือก" && region !== "ทั้งหมด") {
      if (getRegionForProvince(p.province) !== region) return false;
    }
    if (province !== "กรุณาเลือก" && province !== "ทั้งหมด") {
      if (p.province !== province) return false;
    }
    return true;
  });

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);

    if (newRegion === "กรุณาเลือก" || newRegion === "ทั้งหมด") {
      setProvince("กรุณาเลือก");
      setSelectedPark("ทุกอุทยาน");
    } else {
      if (province !== "กรุณาเลือก" && province !== "ทั้งหมด") {
        const provRegion = getRegionForProvince(province);
        if (provRegion !== newRegion) {
          setProvince("กรุณาเลือก");
        }
      }

      if (selectedPark !== "ทุกอุทยาน" && selectedPark !== "ทั้งหมด") {
        const parkItem = parkStats.find((p) => p.parkName === selectedPark);
        if (parkItem && getRegionForProvince(parkItem.province) !== newRegion) {
          setSelectedPark("ทุกอุทยาน");
        }
      }
    }
  };

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);

    if (newProvince === "กรุณาเลือก" || newProvince === "ทั้งหมด") {
      setSelectedPark("ทุกอุทยาน");
    } else {
      if (selectedPark !== "ทุกอุทยาน" && selectedPark !== "ทั้งหมด") {
        const parkItem = parkStats.find((p) => p.parkName === selectedProvinceParkName(newProvince, selectedPark, parkStats));
        if (parkItem && parkItem.province !== newProvince) {
          setSelectedPark("ทุกอุทยาน");
        }
      }
    }
  };

  function selectedProvinceParkName(prov: string, curPark: string, list: ParkStatItem[]): string {
    const item = list.find((p) => p.parkName === curPark);
    return item ? item.parkName : curPark;
  }

  // Filter table data by selectedPark, province, region
  const filteredParkStats = parkStats.filter((p) => {
    if (region !== "กรุณาเลือก" && region !== "ทั้งหมด") {
      if (getRegionForProvince(p.province) !== region) return false;
    }
    if (province !== "กรุณาเลือก" && province !== "ทั้งหมด") {
      if (p.province !== province) return false;
    }
    if (selectedPark !== "ทุกอุทยาน" && selectedPark !== "ทั้งหมด") {
      if (p.parkName !== selectedPark) return false;
    }
    return true;
  });

  // Calculate aggregated visitor stats for chart visualizer
  const chartThaiVisitors = filteredParkStats.reduce((sum, p) => sum + (p.thaiVisitors || 0), 0);
  const chartForeignVisitors = filteredParkStats.reduce((sum, p) => sum + (p.foreignVisitors || 0), 0);
  const chartTotalVisitors = filteredParkStats.reduce((sum, p) => sum + (p.totalVisitors || 0), 0);

  const highestValue = Math.max(chartThaiVisitors, chartForeignVisitors, chartTotalVisitors, 1);
  const maxVal = Math.ceil(highestValue * 1.25);

  const ySteps = [
    maxVal,
    Math.round(maxVal * 0.8),
    Math.round(maxVal * 0.6),
    Math.round(maxVal * 0.4),
    Math.round(maxVal * 0.2),
    0
  ];

  const isRegionSelected = region !== "กรุณาเลือก" && region !== "ทั้งหมด";
  const isProvinceSelected = isRegionSelected && province !== "กรุณาเลือก" && province !== "ทั้งหมด";

  return (
    <div className="w-full max-w-[1600px] mx-auto font-sans relative py-4 space-y-6 my-2 px-2 sm:px-4">

      {/* Container หลัก */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-7 shadow-xl shadow-slate-200/50">

        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex flex-wrap items-center gap-2.5">
                <span>รายงานสรุปภาพรวมสถิตินักท่องเที่ยวอุทยานแห่งชาติ</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-extrabold border border-emerald-300/80 shadow-2xs">
                  <Trees className="w-3.5 h-3.5 text-emerald-700" />
                  <span>อุทยานทั้งหมด {metrics.totalPark} แห่ง</span>
                </span>
              </h1>
            </div>
          </div>
          {loading && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold shadow-xs animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>กำลังโหลดข้อมูลสถิติล่าสุด...</span>
            </div>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>ตัวกรองการแสดงผลสถิติ:</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">

            {/* ภูมิภาค */}
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-slate-500">ภูมิภาค</label>
              <select
                value={region}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs font-medium rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-sm"
              >
                <option value="กรุณาเลือก">-- แสดงทุกภูมิภาค --</option>
                <option value="ภาคเหนือ">ภาคเหนือ</option>
                <option value="ภาคกลาง">ภาคกลาง</option>
                <option value="ภาคตะวันออกเฉียงเหนือ">ภาคตะวันออกเฉียงเหนือ (อีสาน)</option>
                <option value="ภาคตะวันตก">ภาคตะวันตก</option>
                <option value="ภาคตะวันออก">ภาคตะวันออก</option>
                <option value="ภาคใต้">ภาคใต้</option>
              </select>
            </div>

            {/* จังหวัด */}
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-slate-500">จังหวัด</label>
              <select
                value={province}
                onChange={(e) => handleProvinceChange(e.target.value)}
                disabled={!isRegionSelected}
                className="w-full bg-white text-slate-800 text-xs font-medium rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
              >
                {!isRegionSelected ? (
                  <option value="กรุณาเลือก">-- กรุณาเลือกภูมิภาคก่อน --</option>
                ) : (
                  <>
                    <option value="กรุณาเลือก">-- แสดงทุกจังหวัด --</option>
                    {availableProvinces.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* เลือกอุทยาน */}
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-slate-500">เลือกอุทยาน</label>
              <select
                value={selectedPark}
                onChange={(e) => setSelectedPark(e.target.value)}
                disabled={!isProvinceSelected}
                className="w-full bg-white text-slate-800 text-xs font-medium rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-sm font-semibold text-emerald-900 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed disabled:font-normal"
              >
                {!isRegionSelected ? (
                  <option value="ทุกอุทยาน">-- กรุณาเลือกภูมิภาคก่อน --</option>
                ) : !isProvinceSelected ? (
                  <option value="ทุกอุทยาน">-- กรุณาเลือกจังหวัดก่อน --</option>
                ) : (
                  <>
                    <option value="ทุกอุทยาน">-- แสดงทุกอุทยาน --</option>
                    {availableParks.map((p) => (
                      <option key={p.parkId} value={p.parkName}>
                        {p.parkName}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* เดือน */}
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-slate-500">เดือน</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs font-medium rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-sm"
              >
                <option value="ทั้งหมด">-- ทุกเดือน --</option>
                <option value="มกราคม">มกราคม</option>
                <option value="กุมภาพันธ์">กุมภาพันธ์</option>
                <option value="มีนาคม">มีนาคม</option>
                <option value="เมษายน">เมษายน</option>
                <option value="พฤษภาคม">พฤษภาคม</option>
                <option value="มิถุนายน">มิถุนายน</option>
                <option value="กรกฎาคม">กรกฎาคม</option>
                <option value="สิงหาคม">สิงหาคม</option>
                <option value="กันยายน">กันยายน</option>
                <option value="ตุลาคม">ตุลาคม</option>
                <option value="พฤศจิกายน">พฤศจิกายน</option>
                <option value="ธันวาคม">ธันวาคม</option>
              </select>
            </div>

            {/* ปี พ.ศ. */}
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-slate-500">ปี พ.ศ.</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs font-medium rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-sm"
              >
                <option value="ทั้งหมด">-- ทุกปี พ.ศ. --</option>
                <option value="2569">2569</option>
                <option value="2568">2568</option>
                <option value="2567">2567</option>
                <option value="2566">2566</option>
              </select>
            </div>

          </div>
        </div>

        {/* Visitor Summary Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              สรุปข้อมูลสถิตินักท่องเที่ยวเข้าชมรายอุทยาน
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold">
              พบ {filteredParkStats.length} อุทยาน
            </span>
          </div>

          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-100 font-bold text-sm sm:text-base">
                  <th className="py-4 px-5 text-center">อุทยานแห่งชาติ</th>
                  <th className="py-4 px-4 text-center">นักท่องเที่ยวชาวไทย (คน)</th>
                  <th className="py-4 px-4 text-center">นักท่องเที่ยวชาวต่างชาติ (คน)</th>
                  <th className="py-4 px-4 text-center">จำนวนนักท่องเที่ยวรวม (คน)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-800 font-bold text-sm sm:text-base">
                {filteredParkStats.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                      ไม่พบข้อมูลสถิตินักท่องเที่ยวในเงื่อนไขที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredParkStats.map((item) => {
                    const thai = item.thaiVisitors || 0;
                    const foreign = item.foreignVisitors || 0;
                    const total = item.totalVisitors || (thai + foreign);
                    return (
                      <tr key={item.parkId} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="py-4 px-5 font-extrabold text-slate-900 flex items-center justify-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                          <span>{item.parkName}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs">
                            <span className="text-xs">🇹🇭</span>
                            <span>{thai.toLocaleString()} คน</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-purple-50 text-purple-900 border border-purple-200 shadow-2xs">
                            <Globe className="w-3.5 h-3.5 text-purple-600" />
                            <span>{foreign.toLocaleString()} คน</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-black bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-xs">
                            <UserCheck className="w-4 h-4 text-emerald-700" />
                            <span>{total.toLocaleString()} คน</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bar Chart Section */}
        <div className="bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">

          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              แผนภูมิเปรียบเทียบสถิตินักท่องเที่ยว
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">
              ประจำ{month === "ทั้งหมด" ? "ทุกเดือน" : `เดือน ${month}`} {year === "ทั้งหมด" ? "ทุกปี พ.ศ." : `พ.ศ. ${year}`}
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative">

            {/* Chart Area */}
            <div className="flex h-64 items-end relative border-b border-l border-slate-300 pb-2 pl-4">

              {/* Y-axis Gridlines & Numbers */}
              <div className="absolute left-[-36px] top-0 bottom-6 flex flex-col justify-between text-[10px] font-semibold text-slate-400 text-right w-8">
                {ySteps.map((step, idx) => (
                  <span key={idx}>{step.toLocaleString()}</span>
                ))}
              </div>

              {/* Horizontal Subtle Grid Lines */}
              <div className="absolute inset-0 pl-4 pb-6 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-slate-300 w-full" />
              </div>

              {/* Bars Grid */}
              <div className="flex-1 flex justify-around items-end h-[90%] px-4 z-10">

                {/* 1. นักท่องเที่ยวชาวไทย */}
                <div className="flex flex-col items-center justify-end h-full w-24 group cursor-pointer">
                  <span className="text-xs font-black text-blue-600 mb-1 opacity-90 group-hover:scale-110 transition-transform">
                    {chartThaiVisitors.toLocaleString()}
                  </span>
                  <div
                    className="w-14 bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-xl shadow-md group-hover:from-blue-500 group-hover:to-sky-300 transition-all duration-300 min-h-[4px]"
                    style={{ height: `${Math.max((chartThaiVisitors / maxVal) * 100, 2)}%` }}
                  />
                  <span className="text-[11px] font-bold text-slate-700 mt-2 whitespace-nowrap flex items-center gap-1">
                    <span>🇹🇭</span> นักท่องเที่ยวชาวไทย
                  </span>
                </div>

                {/* 2. นักท่องเที่ยวชาวต่างชาติ */}
                <div className="flex flex-col items-center justify-end h-full w-24 group cursor-pointer">
                  <span className="text-xs font-black text-purple-600 mb-1 opacity-90 group-hover:scale-110 transition-transform">
                    {chartForeignVisitors.toLocaleString()}
                  </span>
                  <div
                    className="w-14 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-t-xl shadow-md group-hover:from-purple-500 group-hover:to-indigo-300 transition-all duration-300 min-h-[4px]"
                    style={{ height: `${Math.max((chartForeignVisitors / maxVal) * 100, 2)}%` }}
                  />
                  <span className="text-[11px] font-bold text-slate-700 mt-2 whitespace-nowrap flex items-center gap-1">
                    <Globe className="w-3 h-3 text-purple-600" /> ชาวต่างชาติ
                  </span>
                </div>

                {/* 3. จำนวนนักท่องเที่ยวรวม */}
                <div className="flex flex-col items-center justify-end h-full w-24 group cursor-pointer">
                  <span className="text-xs font-black text-emerald-600 mb-1 opacity-90 group-hover:scale-110 transition-transform">
                    {chartTotalVisitors.toLocaleString()}
                  </span>
                  <div
                    className="w-14 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl shadow-md group-hover:from-emerald-500 group-hover:to-teal-300 transition-all duration-300 min-h-[4px]"
                    style={{ height: `${Math.max((chartTotalVisitors / maxVal) * 100, 2)}%` }}
                  />
                  <span className="text-[11px] font-bold text-slate-700 mt-2 whitespace-nowrap flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-600" /> นักท่องเที่ยวรวม
                  </span>
                </div>

              </div>

            </div>

            {/* Legend Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-blue-500 inline-block" />
                <span>นักท่องเที่ยวชาวไทย ({chartThaiVisitors.toLocaleString()} คน)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-purple-500 inline-block" />
                <span>นักท่องเที่ยวชาวต่างชาติ ({chartForeignVisitors.toLocaleString()} คน)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
                <span>จำนวนนักท่องเที่ยวรวม ({chartTotalVisitors.toLocaleString()} คน)</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
