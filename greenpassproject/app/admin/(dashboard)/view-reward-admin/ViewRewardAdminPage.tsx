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
  Trash2
} from "lucide-react";

interface Reward {
  id: string;
  rewardTitle: string;
  rewardDetails: string;
  rewardAnnounmentDate: string;
  parkCount: string;
  image?: string;
}

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

const getRewardImage = (reward: Reward) => {
  if (typeof window !== "undefined" && reward.id) {
    const customLocal = localStorage.getItem(`greenpass_reward_img_${reward.id}`);
    if (customLocal) return customLocal;
  }
  const img = reward.image;
  if (!img) return null;
  if (img.startsWith("data:") || img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/")) {
    return img;
  }
  return `/${img}`;
};

export default function ViewRewardAdminPage() {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRewards = async () => {
    setIsLoading(true);
    try {
      const response = await rewardApi.getAllRewards();
      const data = response?.result || response?.data;
      if (response && (response.success || response.status) && Array.isArray(data)) {
        const apiList = data.map((item: any) => ({
          id: String(item.rewardId || item.id),
          rewardTitle: item.rewardTitle || "ไม่มีชื่อของรางวัล",
          rewardDetails: item.rewardDetails || "",
          rewardAnnounmentDate: formatThaiDateLong(item.rewardAnnouncementDate) || "ไม่ระบุวันที่",
          parkCount: "156 แห่ง",
          image: item.image || null
        }));

        apiList.sort((a, b) => {
          const numA = parseInt(a.id) || 0;
          const numB = parseInt(b.id) || 0;
          return numB - numA;
        });

        setRewards(apiList);
      } else {
        setRewards([]);
      }
    } catch (error) {
      console.error("Failed to load rewards from backend API:", error);
      setRewards([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleDeleteReward = async (id: string) => {
    if (!window.confirm("คุณต้องการลบรายการของรางวัลนี้ออกจากฐานข้อมูลใช่หรือไม่?")) return;
    try {
      const targetId = parseInt(id);
      if (targetId) {
        await rewardApi.deleteReward(targetId);
      }
      localStorage.removeItem(`greenpass_reward_img_${id}`);
      await fetchRewards();
    } catch (e) {
      console.error("Failed to delete reward from database:", e);
      alert("เกิดข้อผิดพลาดในการลบข้อมูลออกจากฐานข้อมูล");
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto font-sans relative py-4 space-y-6 my-2 px-2 sm:px-4">
      
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
                รายการของรางวัลสำหรับนักท่องเที่ยวที่ผ่านการสะสมตราประทับ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push("/admin/add-reward")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มของรางวัลใหม่</span>
            </button>
          </div>
        </div>

        {/* Rewards List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin inline-block" />
              <p className="text-xs font-medium text-slate-500">กำลังโหลดข้อมูลจากฐานข้อมูล...</p>
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Gift className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">ยังไม่มีรายการของรางวัลในระบบ</h3>
              <p className="text-xs text-slate-400">เริ่มต้นสร้างรายการของรางวัลลงฐานข้อมูลได้โดยกดปุ่มด้านล่าง</p>
              <button
                onClick={() => router.push("/admin/add-reward")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มของรางวัลชิ้นแรก</span>
              </button>
            </div>
          ) : (
            rewards.map((reward) => {
              const displayImg = getRewardImage(reward);
              return (
                <div 
                  key={reward.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 group"
                >
                  
                  {/* Top Bar with Date, Edit & Delete Buttons */}
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

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/edit-reward?id=${reward.id}`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>แก้ไข</span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบ</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Content Layout */}
                  <div className="flex flex-col md:flex-row gap-5 items-start">
                    
                    {/* Image Thumbnail */}
                    <div className="w-full md:w-52 h-36 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-inner relative group/img">
                      {displayImg ? (
                        <img 
                          src={displayImg} 
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
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
