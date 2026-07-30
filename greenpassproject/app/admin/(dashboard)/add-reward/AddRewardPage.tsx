"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rewardApi } from "../../../../service/api";

export default function AddRewardPage() {
  const router = useRouter();
  
  // Form states based on Page 165
  const [parkCount, setParkCount] = useState("156 แห่ง");
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardDetails, setRewardDetails] = useState("");
  const [image, setImage] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!rewardTitle.trim() || !rewardDetails.trim()) {
      setError("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    if (!image) {
      setError("กรุณาเลือกรูปภาพประกอบของรางวัล");
      return;
    }

    setIsLoading(true);
    try {
      // 1. บันทึกลงฐานข้อมูล Spring Boot ผ่าน API
      await rewardApi.addReward({
        rewardTitle,
        rewardDetails,
        image
      });

      // 2. บันทึกลง localStorage สำรองเพื่อรองรับการทำงานของ frontend
      const saved = localStorage.getItem("greenpass_rewards");
      let list = [];
      if (saved) {
        try {
          list = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }

      const newReward = {
        id: String(list.length + 1),
        rewardTitle,
        rewardDetails,
        parkCount,
        rewardAnnounmentDate: new Date().toLocaleDateString("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric"
        }),
        image
      };

      list.push(newReward);
      localStorage.setItem("greenpass_rewards", JSON.stringify(list));
      setSuccess("เพิ่มข้อมูลของรางวัลสำเร็จแล้ว!");

      setTimeout(() => {
        setRewardTitle("");
        setRewardDetails("");
        setImage("");
        router.push("/admin/view-reward-admin");
      }, 1000);

    } catch (err: any) {
      console.error("Failed to add reward to database:", err);
      const errMsg = err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-zinc-200 rounded-2xl p-8 shadow-2xl relative z-10 text-zinc-800 font-sans text-[11px] my-6">
      
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

      {/* Form (ตามรูปที่ 3.3.102 ในเอกสาร) */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center font-bold text-sm pb-1 mb-4 text-zinc-800 uppercase tracking-wide">
          เพิ่มของรางวัล
        </div>

        <div className="space-y-3.5">
          {/* จำนวนอุทยาน */}
          <div className="grid grid-cols-3 items-center gap-2">
            <label className="font-bold text-zinc-650 text-right">จำนวนอุทยาน :</label>
            <div className="col-span-2">
              <input
                type="text"
                value={parkCount}
                onChange={(e) => setParkCount(e.target.value)}
                className="w-full bg-zinc-200 text-zinc-800 rounded px-3 py-1.5 focus:outline-none font-bold border-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* หัวข้อรางวัล */}
          <div className="grid grid-cols-3 items-center gap-2">
            <label className="font-bold text-zinc-650 text-right">หัวข้อรางวัล :</label>
            <div className="col-span-2">
              <input
                type="text"
                value={rewardTitle}
                onChange={(e) => setRewardTitle(e.target.value)}
                placeholder="กรอกชื่อรางวัล"
                className="w-full bg-zinc-200 text-zinc-800 rounded px-3 py-1.5 focus:outline-none font-medium border-none placeholder-zinc-400"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* รายละเอียดเพิ่มเติม */}
          <div className="grid grid-cols-3 items-start gap-2">
            <label className="font-bold text-zinc-650 text-right pt-1.5">รายละเอียดเพิ่มเติม :</label>
            <div className="col-span-2">
              <textarea
                rows={3}
                value={rewardDetails}
                onChange={(e) => setRewardDetails(e.target.value)}
                placeholder="รายละเอียดเพิ่มเติมของของรางวัล"
                className="w-full bg-zinc-200 text-zinc-800 rounded px-3 py-1.5 focus:outline-none font-medium border-none placeholder-zinc-400 leading-relaxed"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* รูปภาพประกอบ */}
          <div className="grid grid-cols-3 items-start gap-2">
            <label className="font-bold text-zinc-650 text-right pt-1.5">รูปภาพประกอบ :</label>
            <div className="col-span-2 space-y-2">
              <div className="w-full h-28 bg-zinc-200 rounded border border-zinc-300 flex items-center justify-center text-zinc-500 font-bold overflow-hidden relative shadow-inner">
                {image ? (
                  <img src={image} alt="Reward Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px]">รูปภาพประกอบ</span>
                )}
              </div>
              <label className="w-full cursor-pointer flex justify-center py-1.5 bg-[#cccccc] hover:bg-[#b5b5b5] text-zinc-900 font-bold rounded transition-colors border border-zinc-300 text-[10px]">
                เลือกรูปภาพประกอบ...
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150">
          <button
            type="submit"
            className="px-5 py-1.5 bg-[#27a336] hover:bg-[#1e8529] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
            disabled={isLoading}
          >
            {isLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            ยืนยัน
          </button>
        </div>

      </form>
    </div>
  );
}
