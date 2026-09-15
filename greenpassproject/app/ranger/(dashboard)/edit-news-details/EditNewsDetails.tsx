"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Edit3, Calendar, ArrowLeft, Image as ImageIcon, UploadCloud, CheckCircle2, X, Save } from "lucide-react";
import { announcementApi } from "../../../../service/api";

interface NewsItem {
  id: string;
  date: string;
  category?: string;
  title: string;
  content: string;
  image?: string;
}

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: "1",
    date: "24 ตุลาคม 2567",
    category: "🚨 ประกาศสำคัญ/ด่วน",
    title: "แจ้งปิดจุดท่องเที่ยวบริเวณน้ำตกเหวนรกชั่วคราวเนื่องจากระดับน้ำสูง",
    content: "เนื่องด้วยสถานการณ์ฝนตกหนักในพื้นที่ป่าต้นน้ำ ทำให้น้ำตกเหวนรกมีระดับน้ำเพิ่มสูงขึ้นอย่างรวดเร็วและมีความเป็นไปได้ที่จะทำให้เกิดอันตรายแก่นักท่องเที่ยว",
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "2",
    date: "20 ตุลาคม 2567",
    category: "📢 กิจกรรม & ข่าวทั่วไป",
    title: "โครงการปลูกป่าฟื้นฟูระบบนิเวศอุทยานแห่งชาติเขาใหญ่ ประจำปี 2567",
    content: "ขอเชิญชวนจิตอาสาร่วมกิจกรรมปลูกป่าเพื่อเพิ่มพื้นที่สีเขียวและสร้างแหล่งอาหารให้แก่สัตว์ป่า ณ บริเวณลานกางเต็นท์ผากล้วยไม้",
    image: "https://images.unsplash.com/photo-1511497584788-876761c144ee?auto=format&fit=crop&w=800&q=80"
  }
];

function EditNewsDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newsId = searchParams.get("id");

  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [currentNews, setCurrentNews] = useState<NewsItem | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("greenpass_news_data");
    let list: NewsItem[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {
        list = DEFAULT_NEWS;
      }
    } else {
      list = DEFAULT_NEWS;
    }
    setNewsList(list);

    const found = list.find((item) => item.id === newsId) || list[0];
    if (found) {
      setCurrentNews(found);
      setTitle(found.title);
      setContent(found.content);
      setImage(found.image || "");
    }
  }, [newsId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    const scriptRegex = /<script\b[^>]*>|<\/script>|javascript:|onerror\s*=|onload\s*=|<iframe\b|<embed\b|<object\b/i;
    if (scriptRegex.test(cleanTitle) || scriptRegex.test(cleanContent)) {
      setError("กรุณากรอกข้อมูลให้ถูกต้อง");
      return;
    }

    if (!cleanTitle || cleanTitle.length < 2 || cleanTitle.length > 250 ||
        !cleanContent || cleanContent.length < 4 || cleanContent.length > 2000 ||
        !currentNews) {
      setError("กรุณากรอกหัวข้อประกาศ (2-250 ตัวอักษร) และเนื้อหาประกาศ (4-2000 ตัวอักษร) ให้ถูกต้อง");
      return;
    }

    setIsLoading(true);
    try {
      const username = localStorage.getItem("ranger_username") || "ranger01";
      await announcementApi.updateAnnouncement(currentNews.id, {
        title: cleanTitle,
        content: cleanContent,
        publishDate: currentNews.date,
        username,
        image
      });
    } catch (err) {
      console.error("Failed to update announcement in database:", err);
    } finally {
      const updated = newsList.map((item) => {
        if (item.id === currentNews.id) {
          return {
            ...item,
            title: cleanTitle,
            content: cleanContent,
            image: image
          };
        }
        return item;
      });

      localStorage.setItem("greenpass_news_data", JSON.stringify(updated));
      setSuccess("บันทึกแก้ไขข้อมูลข่าวสารสำเร็จเรียบร้อยแล้ว!");
      setIsLoading(false);
      
      setTimeout(() => {
        router.push("/ranger/list-news");
      }, 1000);
    }
  };

  if (!currentNews) {
    return (
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs space-y-4 shadow-sm">
        <p className="text-slate-500 font-bold">ไม่พบข่าวสารที่ต้องการแก้ไข</p>
        <button 
          onClick={() => router.push("/ranger/list-news")}
          className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs"
        >
          กลับหน้ารายการข่าวสาร
        </button>
      </div>
    );
  }

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
            <Edit3 className="w-4 h-4" /> News Editor
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">แก้ไขรายละเอียดข่าวสาร</h1>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
            ปรับเปลี่ยนข้อความรูปภาพ และเนื้อหาประกาศข่าวสารอุทยานแห่งชาติเขาใหญ่
          </p>
        </div>

        <button
          onClick={() => router.push("/ranger/list-news")}
          className="relative z-10 inline-flex items-center space-x-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all duration-200 shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้ารายการข่าวสาร</span>
        </button>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Date Tag */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-bold">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>วันที่โพสต์ประกาศ: {currentNews.date}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            ID: #{currentNews.id}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Image Uploader */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>รูปภาพประกาศ</span>
            </label>

            <div className="w-full h-44 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden relative group flex flex-col items-center justify-center">
              {image ? (
                <>
                  <img src={image} alt="News Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <label className="px-3 py-1.5 bg-white text-slate-900 font-bold text-[11px] rounded-xl cursor-pointer shadow-md">
                      เปลี่ยนรูปภาพ
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
                                setImage(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="px-3 py-1 bg-rose-600 text-white font-bold text-[11px] rounded-xl shadow-md"
                    >
                      เอาออก
                    </button>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer p-4 w-full h-full text-center">
                  <UploadCloud className="w-8 h-8 text-emerald-600 mb-1" />
                  <span className="text-[11px] font-bold text-slate-700">อัปโหลดรูปภาพใหม่</span>
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
                            setImage(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Right Column: Form Inputs */}
          <div className="md:col-span-2 space-y-4">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="edit-news-title" className="block text-xs font-bold text-slate-700">
                หัวข้อประกาศสำคัญ <span className="text-rose-500">*</span>
              </label>
              <input
                id="edit-news-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label htmlFor="edit-news-content" className="block text-xs font-bold text-slate-700">
                รายละเอียดเนื้อหาข่าวสาร <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="edit-news-content"
                required
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all leading-relaxed font-medium"
              />
            </div>

          </div>

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
            <Save className="w-3.5 h-3.5" />
            <span>{isLoading ? "กำลังบันทึกข้อมูล..." : "บันทึกการแก้ไข"}</span>
          </button>
        </div>

      </form>

    </div>
  );
}

export default function EditNewsDetails() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs">กำลังโหลด...</div>}>
      <EditNewsDetailsContent />
    </Suspense>
  );
}

