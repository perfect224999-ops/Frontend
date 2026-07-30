"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { announcementApi } from "../../../../service/api";

interface NewsItem {
  id: string;
  date: string;
  title: string;
  content: string;
  image?: string;
}

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: "1",
    date: "24 ตุลาคม 2567",
    title: "แจ้งปิดจุดท่องเที่ยวบริเวณน้ำตกเหวนรกชั่วคราวเนื่องจากระดับน้ำสูง",
    content: "เนื่องด้วยสถานการณ์ฝนตกหนักในพื้นที่ป่าต้นน้ำ ทำให้น้ำตกเหวนรกมีระดับน้ำเพิ่มสูงขึ้นอย่างรวดเร็วและมีความเป็นไปได้ที่จะทำให้เกิดอันตรายแก่นักท่องเที่ยว"
  },
  {
    id: "2",
    date: "20 ตุลาคม 2567",
    title: "หัวข้อ ////",
    content: "รายละเอียดเนื้อหาประกาศความสำคัญอื่นๆ ของอุทยานแห่งชาติเขาใหญ่"
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

    const found = list.find((item) => item.id === newsId) || list[0]; // fallback ตัวแรก
    if (found) {
      setCurrentNews(found);
      setTitle(found.title);
      setContent(found.content);
      setImage(found.image || "");
    }
  }, [newsId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !currentNews) return;

    setIsLoading(true);
    try {
      const username = localStorage.getItem("ranger_username") || "ranger01";
      await announcementApi.updateAnnouncement(currentNews.id, {
        title,
        content,
        publishDate: currentNews.date,
        username,
        image
      });

      const updated = newsList.map((item) => {
        if (item.id === currentNews.id) {
          return {
            ...item,
            title: title,
            content: content,
            image: image
          };
        }
        return item;
      });

      localStorage.setItem("greenpass_news_data", JSON.stringify(updated));
      setSuccess("บันทึกการแก้ไขข่าวสารสำเร็จ!");
      
      setTimeout(() => {
        router.push("/ranger/list-news");
      }, 1000);
    } catch (error) {
      console.error("Failed to update announcement in database:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลแก้ไขลงฐานข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentNews) {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg p-6 text-center text-xs">
        <p className="text-zinc-500 font-bold">ไม่พบข่าวสารที่ต้องการแก้ไข</p>
        <button 
          onClick={() => router.push("/ranger/list-news")}
          className="mt-4 px-4 py-1.5 bg-[#dfdfdf] rounded text-[10px]"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div 
      className="min-h-[80vh] w-full rounded-2xl overflow-hidden bg-cover bg-center p-6 flex items-center justify-center font-sans relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80')" }} // พื้นหลังเดียวกัน
    >
      
      {/* การ์ดฟอร์มการแก้ไขข่าวสารตามรูปสเก็ตช์ 3 */}
      <form onSubmit={handleSave} className="w-full max-w-3xl bg-[#f6ebe6]/95 border border-zinc-200 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-4 relative">
        
        {/* หัวเรื่องนำทางย้อนกลับ */}
        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 border-b border-zinc-350 pb-2">
          <span>แก้ไขรายละเอียดข่าวสาร #{currentNews.id}</span>
          <button 
            type="button"
            onClick={() => router.push("/ranger/list-news")}
            className="text-zinc-600 hover:text-zinc-800"
          >
            &lt; ย้อนกลับ
          </button>
        </div>

        {/* ตารางการจัดหน้า: รูปซ้าย ข้อมูลขวา (ตามรูปสเก็ตช์ 3) */}
        <div className="flex flex-col md:flex-row gap-5">
          
          {/* ส่วนของรูปภาพฝั่งซ้าย */}
          <div className="flex flex-col items-center gap-2 shrink-0 self-center">
            <div className="w-full md:w-48 h-32 bg-[#969696] rounded flex items-center justify-center border border-zinc-400 overflow-hidden relative">
              {image ? (
                <img src={image} alt="News Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-zinc-900 font-bold text-xs">รูปภาพ</span>
              )}
            </div>
            <label className="cursor-pointer px-3 py-1 bg-[#cccccc] hover:bg-[#b5b5b5] text-zinc-900 font-bold rounded transition-colors border border-zinc-300 text-[10px]">
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
                        setImage(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          {/* ส่วนช่องแก้ไขข้อมูลฝั่งขวา */}
          <div className="flex-1 space-y-4 text-xs font-bold text-zinc-800">
            
            {/* วันที่ระบุ */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-650">📅 {currentNews.date}</span>
            </div>

            {/* หัวข้อประกาศสำคัญ */}
            <div className="space-y-1">
              <label htmlFor="edit-news-title" className="text-zinc-650 block">หัวข้อประกาศสำคัญ :</label>
              <input
                id="edit-news-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#cccccc] text-zinc-900 px-3 py-2 rounded focus:outline-none border border-zinc-350 font-bold"
              />
            </div>

            {/* รายละเอียด */}
            <div className="space-y-1">
              <label htmlFor="edit-news-content" className="text-zinc-650 block">รายละเอียด :</label>
              <textarea
                id="edit-news-content"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#cccccc] text-zinc-900 p-3 rounded focus:outline-none border border-zinc-350 leading-relaxed font-bold"
              />
            </div>

          </div>

        </div>

        {/* ปุ่มบันทึกตกลงมุมล่างขวา */}
        <div className="flex justify-end pt-3 border-t border-zinc-250">
          {success && <span className="text-emerald-600 text-xs mr-4 self-center font-bold">{success}</span>}
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-[#6df17c] hover:bg-[#5ae069] disabled:bg-zinc-200 text-zinc-900 font-bold rounded-lg transition-colors cursor-pointer text-xs"
          >
            {isLoading ? "กำลังประมวลผล..." : "ตกลง"}
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
