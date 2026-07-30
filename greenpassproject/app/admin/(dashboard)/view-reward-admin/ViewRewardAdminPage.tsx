"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { rewardApi } from "../../../../service/api";

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
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=300&q=80"
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
      try {
        const response = await rewardApi.getAllRewards();
        if (response.success && response.result) {
          const mapped: Reward[] = response.result.map((item: any) => ({
            id: String(item.rewardId),
            rewardTitle: item.rewardTitle,
            rewardDetails: item.rewardDetails,
            rewardAnnounmentDate: formatThaiDateLong(item.rewardAnnouncementDate),
            parkCount: "156 แห่ง",
            image: item.image
          }));
          setRewards(mapped);
          localStorage.setItem("greenpass_rewards", JSON.stringify(mapped));
          return;
        }
      } catch (error) {
        console.error("Failed to load rewards from backend, using localStorage fallback:", error);
      }

      // Fallback to localStorage or default
      const saved = localStorage.getItem("greenpass_rewards");
      if (saved) {
        try {
          setRewards(JSON.parse(saved));
        } catch {
          setRewards(DEFAULT_REWARDS);
        }
      } else {
        setRewards(DEFAULT_REWARDS);
        localStorage.setItem("greenpass_rewards", JSON.stringify(DEFAULT_REWARDS));
      }
    };

    fetchRewards();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-zinc-200 rounded-2xl p-6 shadow-2xl relative z-10 text-zinc-800 font-sans text-[11px] my-6">
      
      {/* Title */}
      <h2 className="text-center font-bold text-sm text-zinc-900 mb-6 uppercase tracking-wide">
        ของรางวัลสำหรับบุคคลที่เที่ยวอุทยานแห่งชาติดังหลายแห่ง
      </h2>

      {/* Rewards List (ตามรูปที่ 3.3.105 ในเอกสาร) */}
      <div className="space-y-6">
        {rewards.length === 0 ? (
          <div className="text-center text-zinc-400 py-10 font-bold">ไม่มีรายการของรางวัล</div>
        ) : (
          rewards.map((reward) => (
            <div 
              key={reward.id} 
              className="border border-zinc-250 rounded-xl p-4 bg-zinc-50 relative space-y-3 shadow-sm"
            >
              
              {/* Top Row with Date and Edit Button */}
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 border-b border-zinc-200 pb-2">
                <div className="flex items-center gap-1.5">
                  <span>📅 : {reward.rewardAnnounmentDate}</span>
                </div>
                <button
                  onClick={() => router.push(`/admin/edit-reward?id=${reward.id}`)}
                  className="px-4 py-1 bg-[#27a336] hover:bg-[#1e8529] text-white text-[9px] font-bold rounded cursor-pointer transition-colors shadow-sm"
                >
                  แก้ไข
                </button>
              </div>

              {/* Content Row: Image on Left, Details on Right */}
              <div className="flex flex-col md:flex-row gap-4">
                
                {/* Image Block */}
                <div className="w-full md:w-44 h-28 bg-zinc-400 rounded-lg flex items-center justify-center text-white font-bold select-none text-[10px] shrink-0 overflow-hidden shadow-inner border border-zinc-300">
                  {reward.image ? (
                    <img 
                      src={reward.image} 
                      alt={reward.rewardTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                      }}
                    />
                  ) : (
                    "รูปภาพ"
                  )}
                </div>

                {/* Text Details */}
                <div className="flex-1 space-y-2 text-zinc-800 text-[10px] leading-relaxed">
                  <div>
                    <span className="font-bold text-zinc-500">จำนวนอุทยาน : </span>
                    <span className="font-bold">{reward.parkCount}</span>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-500">หัวข้อรางวัล : </span>
                    <span className="font-bold">{reward.rewardTitle}</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="font-bold text-zinc-500 shrink-0">รายละเอียดของรางวัล : </span>
                    <span className="font-bold text-zinc-700">{reward.rewardDetails}</span>
                  </div>
                </div>

              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
