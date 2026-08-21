"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { rewardApi } from "../../../../service/api";
import {
  Trophy,
  Calendar,
  Trees,
  Pencil,
  Plus,
  Gift,
  Sparkles,
  Award
} from "lucide-react";

interface Reward {
  id: string;
  rewardTitle: string;
  rewardDetails: string;
  rewardAnnounmentDate: string;
  parkCount: string;
  image?: string;
}

const DEFAULT_REWARDS: Reward[] = [
  { 
    id: "1", 
    rewardTitle: "Ticket สำหรับเข้าอุทยานฟรี 1 ปีเต็ม ทุกอุทยานทั่วประเทศ", 
    rewardDetails: "เข้าอุทยานฟรี 2 ครั้ง อายุสิทธิ์ 6 เดือน และ ใบประกาศนียบัตรดิจิทัล ท่องเที่ยวอุทยานครบทุกแห่งทั่วประเทศไทย และฟรีค่าที่พัก 2 คืน", 
    rewardAnnounmentDate: "25 ตุลาคม 2567",
    parkCount: "156 แห่ง",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80"
  }
];

const formatThaiDateLong = (dateStr: string) => {
  if (!dateStr) return "ไม่ระบุวันที่";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    const months = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    return `${day} ${months[month - 1]} ${year + 543}`;
  }
  return dateStr;
};

export default function ViewRewardAdminPage() {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    const fetchRewards = async () => {
      let apiList: Reward[] = [];
      try {
        const response = await rewardApi.getAllRewards();
        const data = response?.result || response?.data;
        if (response && (response.success || response.status) && Array.isArray(data) && data.length > 0) {
          apiList = data.map((item: any) => ({
            id: String(item.rewardId || item.id || Math.random()),
            rewardTitle: item.rewardTitle || "ไม่มีชื่อของรางวัล",
            rewardDetails: item.rewardDetails || "",
            rewardAnnounmentDate: formatThaiDateLong(item.rewardAnnouncementDate) || "ไม่ระบุวันที่",
            parkCount: "156 แห่ง",
            image: item.image || null
          }));
        }
      } catch (error) {
        console.error("Failed to load rewards from backend API:", error);
      }

      const saved = localStorage.getItem("greenpass_rewards");
      let localList: Reward[] = [];
      if (saved) {
        try {
          localList = JSON.parse(saved);
        } catch (e) {
          localList = [];
        }
      }

      const map = new Map<string, Reward>();
      apiList.forEach((item) => map.set(String(item.id), item));
      localList.forEach((item) => {
        if (!map.has(String(item.id))) {
          map.set(String(item.id), item);
        }
      });

      const merged = Array.from(map.values());
      merged.sort((a, b) => {
        const numA = parseInt(a.id) || 0;
        const numB = parseInt(b.id) || 0;
        return numB - numA;
      });

      const finalList = merged.length > 0 ? merged : DEFAULT_REWARDS;

      setRewards(finalList);
      localStorage.setItem("greenpass_rewards", JSON.stringify(finalList));
    };

    fetchRewards();
  }, []);


  return (
    <div className="w-full max-w-7xl xl:max-w-[1380px] mx-auto font-sans relative py-4 space-y-6 my-2 px-2 sm:px-4">
      
      {/* Container หลัก */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-7 shadow-xl shadow-slate-200/50">
        
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                ของรางวัลสำหรับผู้ท่องเที่ยวอุทยานแห่งชาติ
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {rewards.length} รายการ
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                รายการของรางวัลพิเศษสำหรับนักท่องเที่ยวที่ผ่านการสะสมตราประทับ
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/admin/add-reward")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มของรางวัลใหม่</span>
          </button>
        </div>

        {/* Rewards List */}
        <div className="space-y-4">
          {rewards.length === 0 ? (
            <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Gift className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">ยังไม่มีรายการของรางวัลในระบบ</h3>
              <p className="text-xs text-slate-400">เริ่มต้นสร้างรายการของรางวัลแรกได้ง่ายๆ โดยกดปุ่มด้านล่าง</p>
              <button
                onClick={() => router.push("/admin/add-reward")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มของรางวัลชิ้นแรก</span>
              </button>
            </div>
          ) : (
            rewards.map((reward) => (
              <div 
                key={reward.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 group"
              >
                
                {/* Top Bar with Date & Edit Button */}
                <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      ประกาศเมื่อ {reward.rewardAnnounmentDate}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Trees className="w-3.5 h-3.5 text-emerald-600" />
                      เที่ยวครบ {reward.parkCount}
                    </span>
                  </div>

                  <button
                    onClick={() => router.push(`/admin/edit-reward?id=${reward.id}`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>แก้ไข</span>
                  </button>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col md:flex-row gap-5 items-start">
                  
                  {/* Image Thumbnail */}
                  <div className="w-full md:w-52 h-36 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-inner relative group/img">
                    {reward.image ? (
                      <img 
                        src={reward.image} 
                        alt={reward.rewardTitle}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                        <Gift className="w-8 h-8 opacity-40" />
                        <span className="text-[10px] font-semibold">ไม่มีรูปภาพ</span>
                      </div>
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 space-y-2.5 text-xs text-slate-700">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                      {reward.rewardTitle}
                    </h3>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed text-slate-600">
                      <p className="font-medium">{reward.rewardDetails}</p>
                    </div>
                  </div>

                </div>

              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}

