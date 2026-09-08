"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Plus, Search, Calendar, Edit3, Trash2, AlertCircle, FileText, ImageIcon, CheckCircle2 } from "lucide-react";
import { announcementApi } from "../../../../service/api";

interface NewsItem {
  id: string;
  date: string;
  category?: string;
  title: string;
  content: string;
  image?: string;
  parkId?: number;
  parkName?: string;
}

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: "1",
    date: "24 ตุลาคม 2567",
    category: "🚨 ประกาศสำคัญ/ด่วน",
    title: "แจ้งปิดจุดท่องเที่ยวบริเวณน้ำตกเหวนรกชั่วคราวเนื่องจากระดับน้ำสูง",
    content: "เนื่องด้วยสถานการณ์ฝนตกหนักในพื้นที่ป่าต้นน้ำ ทำให้น้ำตกเหวนรกมีระดับน้ำเพิ่มสูงขึ้นอย่างรวดเร็วและมีความเป็นไปได้ที่จะทำให้เกิดอันตรายแก่นักท่องเที่ยว",
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
    parkId: 1,
    parkName: "อุทยานแห่งชาติเขาใหญ่"
  },
  {
    id: "2",
    date: "20 ตุลาคม 2567",
    category: "📢 กิจกรรม & ข่าวทั่วไป",
    title: "โครงการปลูกป่าฟื้นฟูระบบนิเวศอุทยานแห่งชาติเขาใหญ่ ประจำปี 2567",
    content: "ขอเชิญชวนจิตอาสาร่วมกิจกรรมปลูกป่าเพื่อเพิ่มพื้นที่สีเขียวและสร้างแหล่งอาหารให้แก่สัตว์ป่า ณ บริเวณลานกางเต็นท์ผากล้วยไม้",
    image: "https://images.unsplash.com/photo-1511497584788-876761c144ee?auto=format&fit=crop&w=800&q=80",
    parkId: 1,
    parkName: "อุทยานแห่งชาติเขาใหญ่"
  }
];

const getImageUrl = (item: NewsItem) => {
  if (typeof window !== "undefined" && item.id) {
    const customLocal = localStorage.getItem(`greenpass_announcement_img_${item.id}`);
    if (customLocal) return customLocal;
  }
  const img = item.image;
  if (!img) return "/src/news1.jpg";
  if (img.startsWith("data:") || img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/")) {
    return img;
  }
  return `/${img}`;
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [canAnnouncement, setCanAnnouncement] = useState(true);
  const [parkName, setParkName] = useState("อุทยานแห่งชาติ");
  const [parkId, setParkId] = useState<number>(1);

  useEffect(() => {
    const savedRoles = typeof window !== "undefined" ? localStorage.getItem("ranger_roles") : null;
    if (savedRoles) {
      try {
        const parsed = JSON.parse(savedRoles);
        if (Array.isArray(parsed)) {
          setCanAnnouncement(parsed.includes("ประกาศข่าวสาร"));
        }
      } catch (e) {}
    }

    const savedParkName = typeof window !== "undefined" ? localStorage.getItem("ranger_park_name") : null;
    const savedParkId = typeof window !== "undefined" ? localStorage.getItem("ranger_park_id") : null;
    if (savedParkName) setParkName(savedParkName);
    if (savedParkId && !isNaN(Number(savedParkId))) setParkId(Number(savedParkId));
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      const activeParkId = typeof window !== "undefined" ? Number(localStorage.getItem("ranger_park_id") || 1) : 1;
      const activeParkName = typeof window !== "undefined" ? localStorage.getItem("ranger_park_name") || "" : "";

      // 1. Read local storage first
      const saved = localStorage.getItem("greenpass_news_data");
      let localList: NewsItem[] = [];
      if (saved) {
        try {
          localList = JSON.parse(saved);
        } catch (e) {
          localList = [];
        }
      }

      let apiList: NewsItem[] = [];
      try {
        const result = await announcementApi.getAllAnnouncements();
        const apiData = result?.result || result?.data;
        if (result && (result.success || result.status) && Array.isArray(apiData) && apiData.length > 0) {
          apiList = apiData.map((item: any) => ({
            id: String(item.announcementId || item.id || Date.now()),
            date: formatThaiDateLong(item.postDate) || item.createdAt || item.date || "ไม่ระบุวันที่",
            category: item.category || "📢 ประกาศข่าวสาร",
            title: item.announcementTitle || item.title || "ไม่มีหัวข้อ",
            content: item.description || item.content || "",
            image: item.image || "src/news1.jpg",
            parkId: item.parkId ? Number(item.parkId) : (item.parkName?.includes("เอราวัณ") ? 3 : item.parkName?.includes("แก่งกระจาน") ? 2 : 1),
            parkName: item.parkName || activeParkName
          }));
        }
      } catch (error) {
        console.error("Failed to fetch news from API:", error);
      }

      // Merge localList and apiList
      const map = new Map<string, NewsItem>();
      localList.forEach(item => map.set(String(item.id), item));
      apiList.forEach(item => {
        if (!map.has(String(item.id))) {
          map.set(String(item.id), item);
        }
      });

      const mergedList = Array.from(map.values());
      mergedList.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
      setNews(mergedList);
      localStorage.setItem("greenpass_news_data", JSON.stringify(mergedList));
    };

    fetchNews();
  }, []);

  const [deleteSuccess, setDeleteSuccess] = useState("");

  const handleDeleteClick = (id: string) => {
    setSelectedDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDeleteId) return;
    try {
      if (!isNaN(Number(selectedDeleteId))) {
        await announcementApi.deleteAnnouncement(selectedDeleteId);
      }
    } catch (error) {
      console.warn("API delete announcement notice:", error);
    } finally {
      const updated = news.filter((item) => String(item.id) !== String(selectedDeleteId));
      setNews(updated);
      localStorage.setItem("greenpass_news_data", JSON.stringify(updated));
      setShowDeleteModal(false);
      setSelectedDeleteId(null);
      setDeleteSuccess("ลบประกาศข่าวสารอุทยานเรียบร้อยแล้ว!");
      setTimeout(() => setDeleteSuccess(""), 3000);
    }
  };

  // Strictly filter news for the active ranger's park
  const parkNews = news.filter(item => {
    if (item.parkId && item.parkId === parkId) return true;
    if (item.parkName && parkName && (item.parkName.includes(parkName) || parkName.includes(item.parkName))) return true;
    // Default fallback for items with no park info when on Khao Yai (parkId=1)
    if (!item.parkId && !item.parkName && parkId === 1) return true;
    return false;
  });

  const filteredNews = parkNews.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return item.title.toLowerCase().includes(query) || item.content.toLowerCase().includes(query);
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 font-sans">
      
      {deleteSuccess && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 font-bold rounded-2xl text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-rose-600" />
            <span>{deleteSuccess}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#0a5829] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <Megaphone className="w-4 h-4" /> Park Announcements Repository
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">รายการข่าวสารและประกาศอุทยาน</h1>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
            จัดการ แก้ไข และระงับข่าวสารประกาศของ{parkName} ({filteredNews.length} รายการ)
          </p>
        </div>

        {canAnnouncement && (
          <button
            onClick={() => router.push("/ranger/announce-news")}
            className="relative z-10 inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างประกาศข่าวสารใหม่</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาหัวข้อประกาศ หรือเนื้อหาข่าวสาร..."
          className="w-full text-xs font-medium text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-400"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
            ล้างคำค้น
          </button>
        )}
      </div>

      {/* News List Grid */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">ไม่มีข้อมูลข่าวสาร</p>
            {canAnnouncement && (
              <button
                onClick={() => router.push("/ranger/announce-news")}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl hover:bg-emerald-100"
              >
                + เพิ่มประกาศแรก
              </button>
            )}
          </div>
        ) : (
          filteredNews.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-4 border-l-4 border-l-[#0a5829]"
            >
              {/* Top Row: Index Badge, Date, Category & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2.5 py-0.5 bg-[#0a5829] text-white font-extrabold text-[11px] rounded-lg shadow-xs">
                    ข่าวสารที่ {index + 1}
                  </span>
                  <span className="inline-flex items-center text-slate-500 font-bold">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    {item.date}
                  </span>
                  {item.category && (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-200">
                      {item.category}
                    </span>
                  )}
                </div>

                {canAnnouncement && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/ranger/edit-news-details?id=${item.id}`)}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>แก้ไข</span>
                    </button>

                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบ</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Main Content Layout */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                
                {/* Thumbnail Image */}
                <div className="w-full sm:w-44 h-28 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative group">
                  {getImageUrl(item) ? (
                    <img src={getImageUrl(item)!} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                      <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                      <span className="text-[10px] font-bold">ไม่มีรูปประกอบ</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">
                    {item.content}
                  </p>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Styled Delete Modal Dialog */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-2xl space-y-5 animate-scale-up">
            
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">ยืนยันการลบประกาศข่าวสาร</h4>
              <p className="text-xs text-slate-500">คุณต้องการลบรายการข่าวสารนี้ออกจากระบบใช่หรือไม่?</p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-1/2 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                ยืนยันการลบ
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

