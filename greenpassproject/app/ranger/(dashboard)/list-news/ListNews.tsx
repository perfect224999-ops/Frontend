"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Plus,
  Search,
  Calendar,
  Edit3,
  Trash2,
  AlertCircle,
  ImageIcon,
  CheckCircle2,
  Filter,
  Sparkles,
  Maximize2,
  X,
  Tag,
  Share2,
  Newspaper
} from "lucide-react";
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

const getImageUrl = (item: NewsItem) => {
  if (typeof window !== "undefined" && item.id) {
    const customLocal = localStorage.getItem(`greenpass_announcement_img_${item.id}`);
    if (customLocal) return customLocal;
  }
  const img = item.image;
  if (!img) return null;
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
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [canAnnouncement, setCanAnnouncement] = useState(true);
  const [parkName, setParkName] = useState("อุทยานแห่งชาติ");
  const [parkId, setParkId] = useState<number>(1);
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(true);
      const activeParkName = typeof window !== "undefined" ? localStorage.getItem("ranger_park_name") || "" : "";

      // Read local storage first
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
            category: item.category || "📢 ประกาศข่าวสารทั่วไป",
            title: item.announcementTitle || item.title || "ไม่มีหัวข้อประกาศ",
            content: item.description || item.content || "",
            image: item.image || null,
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
      setIsLoading(false);
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
      setDeleteSuccess("ลบรายการประกาศข่าวสารเรียบร้อยแล้ว!");
      setTimeout(() => setDeleteSuccess(""), 3000);
    }
  };

  // Filter news strictly for the active park
  const parkNews = news.filter(item => {
    if (item.parkId && item.parkId === parkId) return true;
    if (item.parkName && parkName && (item.parkName.includes(parkName) || parkName.includes(item.parkName))) return true;
    if (!item.parkId && !item.parkName && parkId === 1) return true;
    return false;
  });

  const categoriesList = [
    "ทั้งหมด",
    "🚨 ประกาศสำคัญ/ด่วน",
    "📢 กิจกรรม & ข่าวทั่วไป",
    "⚠️ ปิดบริการชั่วคราว",
    "🌿 สภาพอากาศ & ธรรมชาติ"
  ];

  const filteredNews = parkNews.filter(item => {
    if (selectedCategory === "ทั้งหมด") return true;
    if (!item.category) return false;
    const cleanSelected = selectedCategory.replace(/^[^\s]+\s/, "").trim();
    return item.category.includes(cleanSelected) || item.category === selectedCategory;
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-7 font-sans my-2 px-2 sm:px-4">
      
      {/* Container หลัก */}
      <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl shadow-slate-200/60">
        
        {/* Header Title Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/20 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-emerald-700/40">
          
          {/* Decorative Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
              <Megaphone className="w-4 h-4 text-emerald-400" /> 
              <span>Park Announcements Repository</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              รายการข่าวสารและประกาศอุทยาน
              <span className="bg-emerald-500/30 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30 backdrop-blur-md">
                {parkNews.length} รายการ
              </span>
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm max-w-2xl font-medium">
              ศูนย์รวมข่าวสาร ประกาศเตือนภัย และกิจกรรมประชาสัมพันธ์อย่างเป็นทางการของ <span className="font-bold text-amber-300">{parkName}</span>
            </p>
          </div>

          {canAnnouncement && (
            <button
              onClick={() => router.push("/ranger/announce-news")}
              className="relative z-10 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-900/40 transition-all duration-300 hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>สร้างประกาศข่าวสารใหม่</span>
            </button>
          )}
        </div>

        {/* Delete Success Alert */}
        {deleteSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold rounded-2xl text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{deleteSuccess}</span>
            </div>
          </div>
        )}

        {/* Controls Bar: Category Filters */}
        <div className="space-y-4">
          <div className="bg-slate-50 p-2 sm:p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-inner">
            
            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none shrink-0">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* News Items Showcase */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-24 bg-slate-50/80 rounded-3xl border border-slate-200 space-y-4 shadow-inner">
              <span className="w-9 h-9 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin inline-block" />
              <p className="text-sm font-bold text-slate-600">กำลังโหลดประกาศข่าวสารจากระบบ...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="bg-slate-50/80 rounded-3xl border border-dashed border-slate-300 p-14 text-center space-y-4 shadow-inner">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <Newspaper className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">ไม่พบข้อมูลประกาศข่าวสาร</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  {searchQuery ? "ไม่พบข่าวสารที่ตรงกับคำค้นหาของคุณ ลองค้นหาด้วยคำอื่น" : "ยังไม่มีประกาศข่าวสารในหมวดหมู่นี้"}
                </p>
              </div>
              {canAnnouncement && (
                <button
                  onClick={() => router.push("/ranger/announce-news")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>สร้างประกาศข่าวสารแรก</span>
                </button>
              )}
            </div>
          ) : (
            filteredNews.map((item, index) => {
              const displayImg = getImageUrl(item);
              const isUrgent = item.category?.includes("ด่วน") || item.category?.includes("สำคัญ") || item.title.includes("ด่วน") || item.title.includes("ปิด");

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row group"
                >
                  {/* Left Column: Image Container */}
                  <div 
                    onClick={() => displayImg && setPreviewImage({ url: displayImg, title: item.title })}
                    className={`w-full md:w-5/12 lg:w-4/12 min-h-[220px] md:min-h-[280px] bg-gradient-to-br from-slate-100 via-emerald-50/30 to-teal-50/30 relative overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200/80 ${displayImg ? "cursor-pointer group/img" : ""}`}
                  >
                    {displayImg ? (
                      <>
                        <img 
                          src={displayImg} 
                          alt={item.title} 
                          className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/10 opacity-60 group-hover/img:opacity-40 transition-opacity duration-300" />
                        
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 opacity-90 group-hover/img:opacity-100 transition-all shadow-md">
                          <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>ดูรูปภาพใหญ่</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-8">
                        <ImageIcon className="w-12 h-12 opacity-30 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-400">ไม่มีรูปภาพประกอบ</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: News Content & Actions */}
                  <div className="w-full md:w-7/12 lg:w-8/12 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                    
                    {/* Top Row: Index Badge, Date, Category & Edit/Delete */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="px-3 py-1 bg-slate-900 text-white font-black text-xs rounded-xl shadow-xs">
                            ประกาศที่ {filteredNews.length - index}
                          </span>
                          
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            {item.date}
                          </span>

                          {item.category && (
                            <span className={`px-3 py-1 font-bold text-xs rounded-xl border shadow-xs ${
                              isUrgent 
                                ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse" 
                                : "bg-emerald-50 text-emerald-800 border-emerald-200"
                            }`}>
                              {item.category}
                            </span>
                          )}
                        </div>

                        {canAnnouncement && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/ranger/edit-news-details?id=${item.id}`)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>แก้ไข</span>
                            </button>

                            <button
                              onClick={() => handleDeleteClick(item.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>ลบ</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Main News Title */}
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                        {item.title}
                      </h2>

                      {/* News Content Paragraph Box */}
                      <div className="bg-slate-50/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-xs sm:text-sm leading-relaxed text-slate-700 shadow-inner">
                        <p className="whitespace-pre-line font-medium text-slate-700 leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-medium border-t border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        หน่วยงานผู้ประกาศ: <strong className="text-slate-700">{item.parkName || parkName}</strong>
                      </span>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Styled Delete Modal Dialog */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 text-center border border-slate-200 shadow-2xl space-y-6">
            
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-md">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-slate-900">ยืนยันการลบประกาศข่าวสาร</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                คุณแน่ใจหรือว่าต้องการลบข่าวสารประกาศนี้ออกจากระบบข้อมูลของอุทยาน? การดำเนินการนี้ไม่สามารถยกเลิกได้
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                ยืนยันการลบ
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Lightbox / Fullscreen Image Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 text-white">
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md sm:max-w-xl">
                  {previewImage.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="p-4 sm:p-8 flex items-center justify-center bg-slate-950 overflow-auto flex-1">
              <img 
                src={previewImage.url} 
                alt={previewImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400 font-medium">กดปุ่ม X หรือกดภายนอกกรอบเพื่อปิดหน้าต่างรูปภาพ</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
