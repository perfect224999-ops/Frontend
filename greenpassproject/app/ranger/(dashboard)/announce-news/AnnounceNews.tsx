"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Calendar, Tag, Image as ImageIcon, UploadCloud, CheckCircle2, X, ArrowLeft, Send, Lock } from "lucide-react";
import { announcementApi } from "../../../../service/api";

const CATEGORIES = [
  "🚨 ประกาศสำคัญ/ด่วน",
  "📢 กิจกรรม & ข่าวทั่วไป",
  "⚠️ ปิดบริการชั่วคราว",
  "🌿 สภาพอากาศ & ธรรมชาติ"
];

const formatTodayThaiDate = () => {
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const today = new Date();
  const day = today.getDate();
  const month = months[today.getMonth()];
  const year = today.getFullYear() + 543;
  return `${day} ${month} ${year}`;
};

export default function AnnounceNews() {
  const router = useRouter();
  const [publishDate] = useState(formatTodayThaiDate());
  const [title, setTitle] = useState("แจ้งปิดจุดท่องเที่ยวบริเวณน้ำตกเหวนรกชั่วคราวเนื่องจากระดับน้ำสูง");
  const [category, setCategory] = useState("🚨 ประกาศสำคัญ/ด่วน");
  const [content, setContent] = useState("เนื่องด้วยสถานการณ์ฝนตกหนักในพื้นที่ป่าต้นน้ำ ทำให้น้ำตกเหวนรกมีระดับน้ำเพิ่มสูงขึ้นอย่างรวดเร็วและมีความเป็นไปได้ที่จะทำให้เกิดอันตรายแก่นักท่องเที่ยว");
  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

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

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    const scriptRegex = /<script\b[^>]*>|<\/script>|javascript:|onerror\s*=|onload\s*=|<iframe\b|<embed\b|<object\b/i;
    if (scriptRegex.test(cleanTitle) || scriptRegex.test(cleanContent)) {
      setError("กรุณากรอกข้อมูลให้ถูกต้องและครบถ้วน");
      return;
    }

    if (!cleanTitle || cleanTitle.length < 2 || cleanTitle.length > 250 ||
        !cleanContent || cleanContent.length < 4 || cleanContent.length > 2000) {
      setError("กรุณากรอกหัวข้อประกาศ (2-250 ตัวอักษร) และเนื้อหาประกาศ (4-2000 ตัวอักษร) ให้ถูกต้องและครบถ้วน");
      return;
    }

    setIsLoading(true);
    try {
      const username = localStorage.getItem("ranger_username") || "pr01";
      const isoDate = new Date().toISOString().split("T")[0];
      const apiImage = (image && image.length <= 255) ? image : "src/news1.jpg";

      const apiTitle = cleanTitle.length > 250 ? cleanTitle.substring(0, 250) : cleanTitle;
      const apiContent = `[${category}] ${cleanContent}`;
      const safeApiContent = apiContent.length > 250 ? apiContent.substring(0, 250) : apiContent;

      let createdId = null;
      try {
        const res = await announcementApi.addAnnouncement({
          title: apiTitle,
          content: safeApiContent,
          publishDate: isoDate,
          username,
          image: apiImage
        });
        createdId = res?.result?.announcementId || res?.data?.announcementId;
      } catch (apiErr) {
        console.warn("API save warning, saving locally:", apiErr);
      }

      const newId = String(createdId || Date.now());
      if (image && image.length > 255 && typeof window !== "undefined") {
        try {
          localStorage.setItem(`greenpass_announcement_img_${newId}`, image);
        } catch (err) {}
      }

      // Save to local list for immediate display
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("greenpass_news_data");
        let list: any[] = [];
        if (saved) {
          try { list = JSON.parse(saved); } catch (e) { list = []; }
        }
        const parkIdVal = Number(localStorage.getItem("ranger_park_id") || 1);
        const parkNameVal = localStorage.getItem("ranger_park_name") || "อุทยานแห่งชาติเขาใหญ่";
        list.unshift({
          id: newId,
          date: publishDate,
          category,
          title: cleanTitle,
          content: cleanContent,
          image: image || "src/news1.jpg",
          parkId: parkIdVal,
          parkName: parkNameVal
        });
        localStorage.setItem("greenpass_news_data", JSON.stringify(list));
      }

      setSuccess("บันทึกและประกาศข่าวสารอุทยานสำเร็จเรียบร้อยแล้ว!");
      setTimeout(() => {
        router.push("/ranger/list-news");
      }, 1200);
    } catch (err: any) {
      console.error("Failed to save announcement:", err);
      setError("ไม่สามารถบันทึกข่าวสารได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 font-sans">
      
      {/* Toast Notification */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-800 font-bold rounded-2xl text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <X className="w-4 h-4 text-red-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-red-600 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold rounded-2xl text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess("")} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#0a5829] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <Megaphone className="w-4 h-4" /> News &amp; Announcements Center
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">สร้างประกาศข่าวสารอุทยาน</h1>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
            เผยแพร่ข้อมูลข่าวสาร การแจ้งเตือน และกิจกรรมสำคัญให้แก่นักท่องเที่ยว
          </p>
        </div>

        <button
          onClick={() => router.push("/ranger/list-news")}
          className="relative z-10 inline-flex items-center space-x-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all duration-200 shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ดูรายการข่าวสารทั้งหมด</span>
        </button>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Upload Image Section */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>รูปภาพประกอบประกาศ</span>
          </label>

          <div className="w-full h-52 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl transition-all flex flex-col items-center justify-center relative overflow-hidden group">
            {image ? (
              <>
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl cursor-pointer shadow-md hover:bg-slate-100">
                    เปลี่ยนรูปภาพ
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-rose-500"
                  >
                    ลบรูปภาพ
                  </button>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer p-6 w-full h-full text-center">
                <UploadCloud className="w-10 h-10 text-emerald-600 mb-2 animate-bounce" />
                <span className="text-xs font-bold text-slate-700 mb-1">คลิกเพื่ออัปโหลดรูปภาพข่าวสาร</span>
                <span className="text-[11px] text-slate-400">รองรับไฟล์ PNG, JPG, WEBP (แนะนำขนาด 1200x630px)</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* วันที่ประกาศ */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5" htmlFor="publishDate">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>วันที่ประกาศข่าวสาร</span>
            </label>
            <div className="relative">
              <input
                id="publishDate"
                type="text"
                value={publishDate}
                readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed select-none transition-all pr-8"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* หมวดหมู่ข่าวสาร */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>หมวดหมู่ประกาศ</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              {CATEGORIES.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

        </div>

        {/* หัวข้อข่าวสาร */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700" htmlFor="title">
            หัวข้อประกาศข่าวสาร <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
            placeholder="กรอกหัวข้อข่าวสารที่ต้องการประกาศ..."
          />
        </div>

        {/* รายละเอียดข่าวสาร */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700" htmlFor="content">
            รายละเอียดเนื้อหาประกาศ <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="content"
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all leading-relaxed font-medium"
            placeholder="กรอกรายละเอียดเนื้อหาเพิ่มเติม..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/ranger/list-news")}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isLoading ? "กำลังบันทึกข้อมูล..." : "เผยแพร่ประกาศข่าวสาร"}</span>
          </button>
        </div>

      </form>

    </div>
  );
}

