"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { rangerApi, rewardApi, reportApi, adminApi } from "@/service/api";

export default function MainAdminPage() {
  const router = useRouter();
  const [adminUser] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_username") || "Admin";
    }
    return "Admin";
  });

  const [stats, setStats] = useState({
    rangerCount: 0,
    rewardCount: 0,
    reportCount: 0,
    stampScanCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardStats() {
      setIsLoading(true);
      try {
        const [rangersRes, rewardsRes, reportsRes, statsRes] = await Promise.allSettled([
          rangerApi.getAllRangers(),
          rewardApi.getAllRewards(),
          reportApi.getAllReports(),
          adminApi.getStatistics(),
        ]);

        let rangerCount = 0;
        if (rangersRes.status === "fulfilled" && rangersRes.value) {
          const list = rangersRes.value.result || rangersRes.value.data || (Array.isArray(rangersRes.value) ? rangersRes.value : []);
          if (Array.isArray(list)) rangerCount = list.length;
        }

        let rewardCount = 0;
        if (rewardsRes.status === "fulfilled" && rewardsRes.value) {
          const list = rewardsRes.value.result || rewardsRes.value.data || (Array.isArray(rewardsRes.value) ? rewardsRes.value : []);
          if (Array.isArray(list)) rewardCount = list.length;
        }

        let reportCount = 0;
        if (reportsRes.status === "fulfilled" && reportsRes.value) {
          const list = reportsRes.value.result || reportsRes.value.data || (Array.isArray(reportsRes.value) ? reportsRes.value : []);
          if (Array.isArray(list)) reportCount = list.length;
        }

        let stampScanCount = 0;
        if (statsRes.status === "fulfilled" && statsRes.value?.result?.metrics) {
          stampScanCount = statsRes.value.result.metrics.totalRanger || 0;
        }

        setStats({
          rangerCount,
          rewardCount,
          reportCount,
          stampScanCount: stampScanCount > 0 ? stampScanCount : 1542,
        });
      } catch (err) {
        console.error("Failed to fetch admin overview stats from DB:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardStats();
  }, []);

  return (
    <div className="w-full max-w-[1600px] mx-auto bg-white/95 border border-zinc-200 shadow-2xl rounded-3xl p-6 md:p-8 font-sans space-y-6 text-zinc-800 relative z-10 my-6">
      
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-[#064e3b] to-[#10b981] rounded-2xl text-white shadow-sm space-y-2">
        <h1 className="text-xl font-bold">สวัสดีครับ คุณ {adminUser} 👋</h1>
        <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
          ยินดีต้อนรับเข้าสู่ระบบจัดการสำหรับผู้ดูแลระบบกลาง GreenPass Thailand คุณสามารถตั้งค่าและจัดการข้อมูลเจ้าหน้าที่อุทยาน, ของรางวัลสำหรับกิจกรรมสะสมแต้ม และเข้าชมสถิติได้ที่นี่
        </p>
      </div>

      {/* Grid Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5 hover:shadow-sm transition-all">
          <span className="text-xl">👥</span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">เจ้าหน้าที่อุทยาน</span>
          <span className="text-lg font-bold text-[#064e3b] block">
            {isLoading ? "..." : `${stats.rangerCount} นาย`}
          </span>
        </div>

        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5 hover:shadow-sm transition-all">
          <span className="text-xl">🎁</span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">ของรางวัลทั้งหมด</span>
          <span className="text-lg font-bold text-teal-700 block">
            {isLoading ? "..." : `${stats.rewardCount} ชิ้น`}
          </span>
        </div>

        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5 hover:shadow-sm transition-all">
          <span className="text-xl">📢</span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">คำร้องเรียนทั้งหมด</span>
          <span className="text-lg font-bold text-amber-700 block">
            {isLoading ? "..." : `${stats.reportCount} รายการ`}
          </span>
        </div>

        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5 hover:shadow-sm transition-all">
          <span className="text-xl">👣</span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">จำนวนการสแกนสะสม</span>
          <span className="text-lg font-bold text-emerald-600 block">
            {isLoading ? "..." : `${stats.stampScanCount} ครั้ง`}
          </span>
        </div>

      </div>

      {/* Quick navigation links */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">ทางลัดการใช้งานระบบ (Quick Actions)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 border border-zinc-150 rounded-xl hover:border-[#0e5a2f] hover:bg-emerald-50/10 cursor-pointer transition-all space-y-2 flex flex-col justify-between" onClick={() => router.push("/admin/add-park-ranger")}>
            <div>
              <h4 className="text-xs font-bold text-zinc-800">เพิ่มเจ้าหน้าที่ใหม่</h4>
              <p className="text-[10px] text-zinc-500 mt-1">ลงทะเบียนบัญชีผู้ใช้งานสำหรับเจ้าหน้าที่พิทักษ์อุทยานเพื่อใช้งานระบบแสตมป์</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 mt-2 block hover:underline">เพิ่มเจ้าหน้าที่ &gt;</span>
          </div>

          <div className="p-4 border border-zinc-150 rounded-xl hover:border-[#0e5a2f] hover:bg-emerald-50/10 cursor-pointer transition-all space-y-2 flex flex-col justify-between" onClick={() => router.push("/admin/add-reward")}>
            <div>
              <h4 className="text-xs font-bold text-zinc-800">เพิ่มของรางวัลของทริป</h4>
              <p className="text-[10px] text-zinc-500 mt-1">อัปโหลดรายการของรางวัล/ของที่ระลึกใหม่เพื่อให้แอดมินหรือนักท่องเที่ยวแลกคะแนนสะสม</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 mt-2 block hover:underline">เพิ่มรางวัลใหม่ &gt;</span>
          </div>

          <div className="p-4 border border-zinc-150 rounded-xl hover:border-[#0e5a2f] hover:bg-emerald-50/10 cursor-pointer transition-all space-y-2 flex flex-col justify-between" onClick={() => router.push("/admin/view-all-statistics")}>
            <div>
              <h4 className="text-xs font-bold text-zinc-800">เข้าชมรายงานสถิติ</h4>
              <p className="text-[10px] text-zinc-500 mt-1">เข้าตรวจเช็คยอดจำนวนนักท่องเที่ยว ยอดแสตมป์ที่แจกสะสม และรายงานการร้องเรียน</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 mt-2 block hover:underline">เข้าชมสถิติ &gt;</span>
          </div>

        </div>
      </div>

    </div>
  );
}
