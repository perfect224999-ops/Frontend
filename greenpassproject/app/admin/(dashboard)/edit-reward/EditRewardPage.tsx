"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

function EditRewardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rewardId = searchParams.get("id");
  
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [currentReward, setCurrentReward] = useState<Reward | null>(null);

  // States
  const [parkCount, setParkCount] = useState("");
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardDetails, setRewardDetails] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [announcementDate, setAnnouncementDate] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("greenpass_rewards");
    let list = DEFAULT_REWARDS;
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    setRewards(list);

    const found = list.find((r) => r.id === rewardId) || list[0];
    if (found) {
      setCurrentReward(found);
      setParkCount(found.parkCount || "156 แห่ง");
      setRewardTitle(found.rewardTitle);
      setRewardDetails(found.rewardDetails);
      setImageUrl(found.image || "");
      setAnnouncementDate(found.rewardAnnounmentDate || "25 ตุลาคม 2567");
    }
  }, [rewardId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReward) return;

    setError("");
    setSuccess("");

    if (!rewardTitle.trim() || !rewardDetails.trim()) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      try {
        const updated = rewards.map((r) => {
          if (r.id === currentReward.id) {
            return {
              ...r,
              rewardTitle,
              rewardDetails,
              parkCount,
              image: imageUrl
            };
          }
          return r;
        });

        localStorage.setItem("greenpass_rewards", JSON.stringify(updated));
        setSuccess("บันทึกการแก้ไขข้อมูลเรียบร้อยแล้ว!");

        setTimeout(() => {
          router.push("/admin/view-reward-admin");
        }, 1000);

      } catch (err) {
        setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    }, 800);
  };

  if (!currentReward) {
    return (
      <div className="text-center py-12 text-zinc-400 font-bold text-xs">
        ไม่พบข้อมูลของรางวัลดังกล่าว
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-zinc-400/90 rounded-2xl p-6 shadow-2xl relative z-10 text-zinc-800 font-sans text-[10px] my-6">
      
      {/* Notifications */}
      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-center font-bold">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-2 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded text-center font-bold">
          {success}
        </div>
      )}

      {/* Form (ตามรูปที่ 3.3.108 ในเอกสาร) */}
      <form onSubmit={handleSave} className="bg-white border border-zinc-300 rounded-xl p-4 relative space-y-4">
        
        {/* Top Announcement Date */}
        <div className="text-[10px] font-bold text-zinc-500 border-b border-zinc-200 pb-2">
          <span>📅 : {announcementDate}</span>
        </div>

        {/* Content layout: image left, inputs right */}
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Image Block */}
          <div className="w-full md:w-44 space-y-2 shrink-0">
            <div className="w-full h-28 bg-zinc-400 rounded-lg flex items-center justify-center text-white font-bold select-none text-[10px] overflow-hidden shadow-inner">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={rewardTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "";
                  }}
                />
              ) : (
                "รูปภาพ"
              )}
            </div>
            <label className="w-full cursor-pointer flex justify-center py-1 bg-[#cccccc] hover:bg-[#b5b5b5] text-zinc-900 font-bold rounded transition-colors border border-zinc-300 text-[9px]">
              เปลี่ยนรูปภาพ...
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (typeof reader.result === "string") {
                        setImageUrl(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                disabled={isLoading}
              />
            </label>
          </div>

          {/* Input Fields */}
          <div className="flex-1 space-y-2.5">
            
            {/* จำนวนอุทยาน */}
            <div className="flex flex-col md:flex-row md:items-center gap-1.5">
              <label className="font-bold text-zinc-550 w-24 shrink-0 text-left md:text-right">จำนวนอุทยาน :</label>
              <input
                type="text"
                value={parkCount}
                onChange={(e) => setParkCount(e.target.value)}
                className="flex-1 bg-zinc-150 text-zinc-800 rounded px-2.5 py-1 focus:outline-none font-bold border-none"
                disabled={isLoading}
              />
            </div>

            {/* หัวข้อรางวัล */}
            <div className="flex flex-col md:flex-row md:items-center gap-1.5">
              <label className="font-bold text-zinc-550 w-24 shrink-0 text-left md:text-right">หัวข้อรางวัล :</label>
              <input
                type="text"
                value={rewardTitle}
                onChange={(e) => setRewardTitle(e.target.value)}
                className="flex-1 bg-zinc-150 text-zinc-800 rounded px-2.5 py-1 focus:outline-none font-bold border-none"
                disabled={isLoading}
              />
            </div>

            {/* รายละเอียด */}
            <div className="flex flex-col md:flex-row md:items-start gap-1.5">
              <label className="font-bold text-zinc-550 w-24 shrink-0 text-left md:text-right pt-1">รายละเอียด :</label>
              <textarea
                rows={3}
                value={rewardDetails}
                onChange={(e) => setRewardDetails(e.target.value)}
                className="flex-1 bg-zinc-150 text-zinc-800 rounded px-2.5 py-1 focus:outline-none font-bold border-none leading-relaxed"
                disabled={isLoading}
              />
            </div>

          </div>

        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200">
          <button
            type="button"
            onClick={() => router.push("/admin/view-reward-admin")}
            className="px-5 py-1 border border-zinc-400 text-zinc-650 hover:bg-zinc-100 text-[10px] font-bold rounded cursor-pointer transition-colors"
            disabled={isLoading}
          >
            ย้อนกลับ
          </button>
          <button
            type="submit"
            className="px-5 py-1.5 bg-[#27a336] hover:bg-[#1e8529] text-white text-[10px] font-bold rounded cursor-pointer transition-colors flex items-center gap-1"
            disabled={isLoading}
          >
            {isLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            บันทึก
          </button>
        </div>

      </form>
    </div>
  );
}

export default function EditRewardPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12 text-xs font-bold text-zinc-400">
        กำลังโหลดรายละเอียดของรางวัล...
      </div>
    }>
      <EditRewardContent />
    </Suspense>
  );
}
