"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { rewardApi } from "../../../../service/api";
import {
  Pencil,
  Trees,
  FileText,
  UploadCloud,
  Check,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  Gift,
  X
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

function EditRewardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rewardId = searchParams.get("id");
  
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [currentReward, setCurrentReward] = useState<Reward | null>(null);

  // Form States
  const [parkCount, setParkCount] = useState("156 แห่ง");
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardDetails, setRewardDetails] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [announcementDate, setAnnouncementDate] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadRewardData = async () => {
      if (!rewardId) return;
      try {
        const response = await rewardApi.getRewardById(Number(rewardId));
        const item = response?.result || response?.data;
        if (item) {
          const rObj: Reward = {
            id: String(item.rewardId || item.id),
            rewardTitle: item.rewardTitle || "",
            rewardDetails: item.rewardDetails || "",
            rewardAnnounmentDate: item.rewardAnnouncementDate || "",
            parkCount: "156 แห่ง",
            image: item.image || ""
          };
          setCurrentReward(rObj);
          setRewardTitle(rObj.rewardTitle);
          setRewardDetails(rObj.rewardDetails);

          const cachedImg = localStorage.getItem(`greenpass_reward_img_${rObj.id}`);
          setImageUrl(cachedImg || rObj.image || "");
        }
      } catch (e) {
        console.error("Failed to load reward details from DB:", e);
      }
    };

    loadRewardData();
  }, [rewardId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReward) return;

    setError("");
    setSuccess("");

    const cleanTitle = rewardTitle.trim();
    const cleanDetails = rewardDetails.trim();

    const scriptRegex = /<script\b[^>]*>|<\/script>|javascript:|onerror\s*=|onload\s*=|<iframe\b|<embed\b|<object\b/i;
    if (scriptRegex.test(cleanTitle) || scriptRegex.test(cleanDetails)) {
      setError("กรุณากรอกข้อมูลให้ถูกต้อง");
      return;
    }

    if (!cleanTitle || !cleanDetails) {
      setError("กรุณากรอกข้อมูลให้ถูกต้อง");
      return;
    }

    setIsLoading(true);

    try {
      const targetId = currentReward.id || rewardId || "1";
      const shortImageName = imageUrl.startsWith("http") || imageUrl.startsWith("/")
        ? imageUrl
        : `reward_${targetId}.png`;

      await rewardApi.updateReward(Number(targetId), {
        rewardTitle: rewardTitle.trim(),
        rewardDetails: rewardDetails.trim(),
        image: shortImageName
      });

      if (imageUrl) {
        localStorage.setItem(`greenpass_reward_img_${targetId}`, imageUrl);
      }

      setSuccess("บันทึกการแก้ไขของรางวัลลงฐานข้อมูลเรียบร้อยแล้ว!");
      setTimeout(() => {
        router.push("/admin/view-reward-admin");
      }, 600);
    } catch (err: any) {
      console.error("Failed to update reward in database:", err);
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };



  if (!currentReward) {
    return (
      <div className="text-center py-14 text-slate-400 font-bold text-xs">
        ไม่พบข้อมูลของรางวัลดังกล่าว
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto font-sans relative py-4 my-2 px-2 sm:px-4">
      
      {/* Container หลัก */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-200/50">
        
        {/* Header Title Section */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Pencil className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                แก้ไขของรางวัล #{currentReward.id}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                ปรับปรุงข้อมูล ชื่อรางวัล สิทธิประโยชน์ และรูปภาพประกอบ
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5">
          
          {/* จำนวนอุทยาน */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Trees className="w-3.5 h-3.5 text-emerald-600" />
              เงื่อนไขจำนวนอุทยานที่ต้องท่องเที่ยว :
            </label>
            <input
              type="text"
              value={parkCount}
              onChange={(e) => setParkCount(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-xs font-bold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              disabled={isLoading}
            />
          </div>

          {/* หัวข้อรางวัล */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-emerald-600" />
              หัวข้อของรางวัล :
            </label>
            <input
              type="text"
              value={rewardTitle}
              onChange={(e) => setRewardTitle(e.target.value)}
              placeholder="กรอกชื่อรางวัล..."
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              disabled={isLoading}
            />
          </div>

          {/* รายละเอียด */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              รายละเอียดของรางวัล :
            </label>
            <textarea
              rows={3}
              value={rewardDetails}
              onChange={(e) => setRewardDetails(e.target.value)}
              placeholder="รายละเอียดของรางวัล..."
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all leading-relaxed"
              disabled={isLoading}
            />
          </div>

          {/* รูปภาพประกอบ */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              รูปภาพประกอบของรางวัล :
            </label>

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner group h-44 bg-slate-100">
                <img src={imageUrl} alt="Reward Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700">
                  คลิกเพื่อเปลี่ยนหรืออัปโหลดรูปภาพใหม่...
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  รองรับไฟล์ภาพ JPG, PNG, WEBP
                </span>
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
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.push("/admin/view-reward-admin")}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 flex items-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4 stroke-[3]" />
              )}
              บันทึกการแก้ไข
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}

export default function EditRewardPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12 text-xs font-bold text-slate-400">
        กำลังโหลดรายละเอียดของรางวัล...
      </div>
    }>
      <EditRewardContent />
    </Suspense>
  );
}

