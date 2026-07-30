"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

const formatThaiDateLong = (dateStr: string) => {
  if (!dateStr) return "";
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

export default function ListNews() {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // ยิง API ไปยัง Backend Spring Boot
        const result = await announcementApi.getAllAnnouncements();
        if (result.success && result.result) {
          const mappedNews = result.result.map((item: any) => ({
            id: String(item.announcementId || item.id || Math.random()),
            date: formatThaiDateLong(item.postDate) || item.createdAt || item.date || "ไม่ระบุวันที่",
            title: item.announcementTitle || item.title || "ไม่มีหัวข้อ",
            content: item.description || item.content || "",
            image: item.image || null
          }));
          setNews(mappedNews);
          localStorage.setItem("greenpass_news_data", JSON.stringify(mappedNews));
          return;
        }
      } catch (error) {
        console.error("Failed to fetch news from API:", error);
      }

      // กรณีดึง API ไม่สำเร็จ ให้ใช้ข้อมูลจาก localStorage หรือ DEFAULT_NEWS สำรอง
      const saved = localStorage.getItem("greenpass_news_data");
      if (saved) {
        try {
          setNews(JSON.parse(saved));
        } catch (e) {
          setNews(DEFAULT_NEWS);
        }
      } else {
        setNews(DEFAULT_NEWS);
        localStorage.setItem("greenpass_news_data", JSON.stringify(DEFAULT_NEWS));
      }
    };

    fetchNews();
  }, []);

  const handleDeleteClick = (id: string) => {
    setSelectedDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDeleteId) return;
    try {
      await announcementApi.deleteAnnouncement(selectedDeleteId);
      const updated = news.filter((item) => item.id !== selectedDeleteId);
      setNews(updated);
      localStorage.setItem("greenpass_news_data", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to delete announcement from database:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูลประกาศจากฐานข้อมูล");
    } finally {
      setShowDeleteModal(false);
      setSelectedDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedDeleteId(null);
  };

  return (
    <div
      className="min-h-[80vh] w-full rounded-2xl overflow-hidden bg-cover bg-center p-6 flex items-center justify-center font-sans relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80')" }} // พื้นหลังวิวป่าไม้เดียวกับประกาศข่าว
    >

      {/* การ์ดสีขาวหลักตามภาพสเก็ตช์ 2 */}
      <div className="w-full max-w-2xl bg-white border border-zinc-200 shadow-2xl rounded-2xl p-6 space-y-4 relative">

        {/* หัวเรื่องการ์ด */}
        <h2 className="text-center font-bold text-[#0c592b] text-[15px]">
          ประกาศข่าวสารอุทยานแห่งชาติเขาใหญ่
        </h2>

        {/* แถบรายการแบบ Scrollable */}
        <div className="max-h-[350px] overflow-y-auto pr-2 space-y-4 text-xs">
          {news.length === 0 ? (
            <div className="text-center text-zinc-400 py-10">ไม่มีประกาศข่าวสาร</div>
          ) : (
            news.map((item) => (
              <div
                key={item.id}
                className="bg-[#dcdcdc] rounded p-4 border border-zinc-350 space-y-3 shadow-sm relative"
              >
                {/* แถวหัวข้อการทำงาน: วันที่, ถังขยะลบ, และปุ่มแก้ไข */}
                <div className="flex items-center justify-between border-b border-zinc-300 pb-1.5 font-bold text-zinc-700">
                  <div className="flex items-center gap-1">
                    <span>📅 {item.date}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* ไอคอนถังขยะลบข่าวสาร */}
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="text-zinc-500 hover:text-red-600 text-sm cursor-pointer"
                      title="ลบประกาศข่าวสาร"
                    >
                      🗑
                    </button>
                    {/* ปุ่มแก้ไข */}
                    <button
                      onClick={() => router.push(`/ranger/edit-news-details?id=${item.id}`)}
                      className="px-4 py-0.5 bg-[#4ce161] hover:bg-[#3cd051] text-zinc-900 font-bold rounded cursor-pointer text-[10px]"
                    >
                      แก้ไข
                    </button>
                  </div>
                </div>

                {/* โครงร่างภาพจำลองและข้อมูลประกาศข่าว (ตามรูปสเก็ตช์ 2) */}
                <div className="flex flex-col sm:flex-row gap-3">

                  {/* กล่องรูปภาพจริง หรือรูปภาพจำลอง */}
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full sm:w-36 h-20 object-cover rounded border border-zinc-400 shrink-0" 
                    />
                  ) : (
                    <div className="w-full sm:w-36 h-20 bg-[#969696] rounded flex items-center justify-center border border-zinc-400 shrink-0">
                      <span className="text-zinc-900 font-bold text-[10px]">รูปภาพ</span>
                    </div>
                  )}

                  {/* คำโปรยหัวข้อสำคัญ */}
                  <div className="text-zinc-800 font-bold leading-relaxed flex-1">
                    <span className="text-zinc-650 block mb-1">หัวข้อประกาศสำคัญ :</span>
                    <p className="line-clamp-3">{item.title}</p>
                  </div>

                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* ป๊อปอัปยืนยันการลบตรงตามรูปสเก็ตช์ 4 (Remove News) */}
      {showDeleteModal && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-lg p-5 text-center border border-zinc-200 shadow-2xl animate-scale-up">

            <p className="text-zinc-900 font-bold text-xs mb-5">
              คุณต้องการลบรายการข่าวสารนี้ใช่หรือไม่?
            </p>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-1 bg-[#4ce161] hover:bg-[#3cd051] text-zinc-900 font-bold rounded text-xs cursor-pointer"
              >
                ตกลง
              </button>
              <button
                onClick={handleCancelDelete}
                className="px-6 py-1 bg-[#4ce161] hover:bg-[#3cd051] text-zinc-900 font-bold rounded text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
