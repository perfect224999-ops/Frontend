"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rewardApi } from "../../../../service/api";
import {
  Gift,
  Trees,
  FileText,
  UploadCloud,
  Check,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  X
} from "lucide-react";

export default function AddRewardPage() {
  const router = useRouter();
  
  const [parkCount, setParkCount] = useState("156 แห่ง");
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardDetails, setRewardDetails] = useState("");
  const [image, setImage] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const compressImage = (file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = () => resolve("");
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setImage(compressedBase64);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setImage(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(""); 

    if (!rewardTitle.trim() || !rewardDetails.trim() || !image) {
      setError("กรุณากรอกข้อมูลให้ถูกต้อง");
      return;
    }

    setIsLoading(true);
    try {
      // 1. บันทึกลงฐานข้อมูล MySQL ผ่าน Spring Boot API (ส่งสตริงรูปภาพ Base64 ลงใน DB คอลัมน์ LONGTEXT เพื่อให้ทุกเครื่องและ Mobile อ่านได้)
      const result = await rewardApi.addReward({
        rewardTitle: rewardTitle.trim(),
        rewardDetails: rewardDetails.trim(),
        image: image
      });

      const newRewardId = result?.result?.rewardId || result?.data?.rewardId;
      if (newRewardId) {
        localStorage.setItem(`greenpass_reward_img_${newRewardId}`, image);
      }

      setSuccess("เพิ่มข้อมูลของรางวัลลงฐานข้อมูลสำเร็จเรียบร้อยแล้ว!");

      setTimeout(() => {
        setRewardTitle("");
        setRewardDetails("");
        setImage("");
        router.push("/admin/view-reward-admin");
      }, 600);

    } catch (err: any) {
      console.error("Failed to add reward to database:", err);
      setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto font-sans relative py-4 my-2 px-2 sm:px-4">
      
      {/* Container หลัก */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-200/50">
        
        {/* Header Title Section */}
        <div className="flex items-center gap-3.5 border-b border-slate-200/80 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              เพิ่มของรางวัลใหม่
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              สร้างรายการของรางวัลสะสมแต้มสำหรับนักท่องเที่ยวอุทยานแห่งชาติ
            </p>
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
        <form onSubmit={handleSubmit} className="space-y-5">
          
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
              placeholder="เช่น บัตรผ่านเข้าอุทยานฟรี 1 ปีเต็ม ทุกอุทยานทั่วประเทศ"
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              disabled={isLoading}
            />
          </div>

          {/* รายละเอียดเพิ่มเติม */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              รายละเอียดของรางวัลเพิ่มเติม :
            </label>
            <textarea
              rows={3}
              value={rewardDetails}
              onChange={(e) => setRewardDetails(e.target.value)}
              placeholder="อธิบายรายละเอียด สิทธิประโยชน์ และเงื่อนไขการรับรางวัล..."
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 leading-relaxed"
              disabled={isLoading}
            />
          </div>

          {/* รูปภาพประกอบ */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              รูปภาพประกอบของรางวัล :
            </label>

            {image ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner group min-h-[180px] max-h-[380px] bg-slate-900/5 flex items-center justify-center p-2">
                <img src={image} alt="Reward Preview" className="w-full h-auto max-h-[360px] object-contain rounded-xl mx-auto shadow-sm" />
                <button
                  type="button"
                  onClick={() => setImage("")}
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
                  คลิกเพื่อเลือกไฟล์รูปภาพประกอบ...
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  รองรับไฟล์ภาพ JPG, PNG, WEBP
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
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
              ยืนยันการเพิ่มของรางวัล
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}

