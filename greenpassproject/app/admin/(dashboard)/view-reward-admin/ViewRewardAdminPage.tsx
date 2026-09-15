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
  Trash2,
  Maximize2,
  X,
  Sparkles,
  Award,
  CheckCircle2,
  ZoomIn
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
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

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
      <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl shadow-slate-200/60">
        
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white flex items-center justify-center shadow-xl shadow-emerald-600/30 ring-4 ring-emerald-50">
              <Trophy className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                ของรางวัลสำหรับผู้ท่องเที่ยวอุทยานแห่งชาติ
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300 shadow-sm">
                  {rewards.length} รายการ
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                รายการของรางวัลอันทรงเกียรติ สำหรับนักท่องเที่ยวที่สะสมตราประทับหนังสือเดินทางอุทยาน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push("/admin/add-reward")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>เพิ่มของรางวัลใหม่</span>
            </button>
          </div>
        </div>

        {/* Rewards Showcase List */}
        <div className="space-y-8">
          {isLoading ? (
            <div className="text-center py-24 bg-slate-50/80 rounded-3xl border border-slate-200 space-y-4 shadow-inner">
              <span className="w-9 h-9 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin inline-block" />
              <p className="text-sm font-bold text-slate-600">กำลังดึงข้อมูลของรางวัลจากฐานข้อมูล...</p>
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-24 bg-slate-50/80 rounded-3xl border border-dashed border-slate-300 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <Gift className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">ยังไม่มีรายการของรางวัลในระบบ</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                เริ่มต้นสร้างรายการของรางวัลลงฐานข้อมูลได้โดยกดปุ่มเพิ่มด้านบน
              </p>
              <button
                onClick={() => router.push("/admin/add-reward")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
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
                  className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row group"
                >
                  {/* Left Column: Premium Featured Image Container */}
                  <div 
                    onClick={() => displayImg && setPreviewImage({ url: displayImg, title: reward.rewardTitle })}
                    className={`w-full md:w-5/12 lg:w-4/12 min-h-[300px] md:min-h-[360px] bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 p-6 flex flex-col items-center justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-200/80 ${displayImg ? "cursor-pointer group/img" : ""}`}
                  >
                    {/* Background Decorative Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.07]" />

                    {displayImg ? (
                      <div className="relative w-full h-full min-h-[260px] flex items-center justify-center p-2">
                        <img 
                          src={displayImg} 
                          alt={reward.rewardTitle}
                          className="max-h-[280px] w-auto max-w-full object-contain drop-shadow-xl group-hover/img:scale-105 transition-transform duration-500 rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "";
                          }}
                        />

                        {/* Hover Overlay Badge */}
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                          <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/95 text-slate-900 text-xs font-bold rounded-xl shadow-xl transform translate-y-2 group-hover/img:translate-y-0 transition-transform duration-300 border border-white">
                            <ZoomIn className="w-4 h-4 text-emerald-600" />
                            คลิกเพื่อดูรูปภาพขยายเต็มจอ
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3 py-12">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center shadow-inner">
                          <Gift className="w-8 h-8 opacity-40" />
                        </div>
                        <span className="text-xs font-bold text-slate-400">ไม่มีรูปภาพประกอบ</span>
                      </div>
                    )}

                    {/* Image Footer Badge */}
                    {displayImg && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md text-[11px] font-semibold text-slate-600 border border-slate-200/80 shadow-sm z-10">
                        <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                        แตะที่รูปเพื่อขยายภาพ
                      </div>
                    )}
                  </div>

                  {/* Right Column: Content Details & Actions */}
                  <div className="w-full md:w-7/12 lg:w-8/12 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                    
                    {/* Top Status & Action Header */}
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/90 shadow-sm">
                            <Award className="w-4 h-4 text-amber-600" />
                            รางวัลเกียรติยศอุทยานแห่งชาติ
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
                            <Trees className="w-3.5 h-3.5 text-emerald-600" />
                            สะสมครบ {reward.parkCount}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/edit-reward?id=${reward.id}`)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>แก้ไข</span>
                          </button>

                          <button
                            onClick={() => handleDeleteReward(reward.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ลบ</span>
                          </button>
                        </div>
                      </div>

                      {/* Main Reward Title */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>วันที่ประกาศรางวัล: {reward.rewardAnnounmentDate}</span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                          {reward.rewardTitle}
                        </h2>
                      </div>

                      {/* Details Box */}
                      <div className="bg-slate-50/90 p-5 rounded-2xl border border-slate-200/80 text-xs sm:text-sm leading-relaxed text-slate-700 space-y-2 shadow-inner">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200/60 pb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>เงื่อนไขและรายละเอียดการรับของรางวัล:</span>
                        </div>
                        <p className="whitespace-pre-line font-medium text-slate-700 pt-1 leading-relaxed">
                          {reward.rewardDetails}
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Lightbox / Fullscreen Image Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 text-white">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md sm:max-w-xl">
                  {previewImage.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="p-4 sm:p-8 flex items-center justify-center bg-slate-950 overflow-auto flex-1">
              <img 
                src={previewImage.url} 
                alt={previewImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-slate-800 bg-white/5 p-2"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400 font-medium">กดปุ่ม X หรือกดภายนอกกรอบเพื่อปิดหน้าต่างรูปภาพ</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
