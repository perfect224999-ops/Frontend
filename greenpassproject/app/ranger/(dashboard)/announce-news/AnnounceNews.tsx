"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { announcementApi } from "../../../../service/api";


export default function AnnounceNews() {
  const router = useRouter();
  const [publishDate, setPublishDate] = useState("24 ตุลาคม 2567");
  const [title, setTitle] = useState("แจ้งปิดจุดท่องเที่ยวบริเวณน้ำตกเหวนรกชั่วคราวเนื่องจากระดับน้ำสูง");
  const [content, setContent] = useState("เนื่องด้วยสถานการณ์ฝนตกหนักในพื้นที่ป่าต้นน้ำ ทำให้น้ำตกเหวนรกมีระดับน้ำเพิ่มสูงขึ้นอย่างรวดเร็วและมีความเป็นไปได้ที่จะทำให้เกิดอันตรายแก่นักท่องเที่ยว");
  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

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
    if (!title.trim() || !content.trim()) return;

    setIsLoading(true);
    try {
      const username = localStorage.getItem("ranger_username") || "ranger01";

      // 1. บันทึกลงฐานข้อมูล Spring Boot ผ่าน API
      await announcementApi.addAnnouncement({
        title,
        content,
        publishDate,
        username,
        image
      });

      // 2. บันทึกลง localStorage สำรองเพื่อรองรับการทำงานของ frontend
      const newPost = {
        id: String(Date.now()),
        date: publishDate,
        title: title,
        content: content,
        image: image
      };

      const savedNews = localStorage.getItem("greenpass_news_data");
      let newsList = [];
      if (savedNews) {
        try {
          newsList = JSON.parse(savedNews);
        } catch (e) {
          newsList = [];
        }
      }
      
      newsList.unshift(newPost); // เอาขึ้นบนสุด
      localStorage.setItem("greenpass_news_data", JSON.stringify(newsList));

      setSuccess("บันทึกประกาศข่าวสารอุทยานสำเร็จ!");
      setTimeout(() => {
        router.push("/ranger/list-news");
      }, 1000);
    } catch (err: any) {
      console.error("Failed to save announcement to database:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-[80vh] w-full rounded-2xl overflow-hidden bg-cover bg-center p-6 flex items-center justify-center font-sans relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80')" }} // จำลองพื้นหลังแนวป่าไม้ทึบเขียวขจีตามรูปสเก็ตช์ 1
    >
      
      {/* การ์ดสีขาวแสดงฟอร์มตรงกลาง */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white border border-zinc-200 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6">
        
        {/* กล่องอัปโหลดและพรีวิวรูปภาพประกอบ */}
        <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-3">
          <div className="w-full h-40 bg-[#969696] rounded flex items-center justify-center border border-zinc-400 overflow-hidden relative">
            {image ? (
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-zinc-900 font-bold text-sm">ยังไม่มีรูปภาพประกาศ</span>
            )}
          </div>
          <label className="cursor-pointer px-4 py-1.5 bg-[#cccccc] hover:bg-[#b5b5b5] text-zinc-900 font-bold rounded transition-colors border border-zinc-300 text-xs">
            เลือกรูปภาพประกาศ...
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        {/* ฟิลด์กรอกข้อมูลต่างๆ */}
        <div className="space-y-4 text-xs font-bold text-zinc-800">
          
          {/* วันที่ประกาศข่าวสาร */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="sm:w-40" htmlFor="publishDate">วันที่ประกาศข่าวสาร :</label>
            <input
              id="publishDate"
              type="text"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="bg-[#cccccc] text-zinc-900 px-3 py-2 rounded focus:outline-none w-full sm:w-2/3 border border-zinc-300"
            />
          </div>

          {/* หัวข้อข่าวสาร */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="sm:w-40" htmlFor="title">หัวข้อข่าวสาร :</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#cccccc] text-zinc-900 px-3 py-2 rounded focus:outline-none w-full sm:w-2/3 border border-zinc-300"
            />
          </div>

          {/* รายละเอียดข่าวสาร */}
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="sm:w-40 pt-2" htmlFor="content">รายละเอียดข่าวสาร :</label>
            <textarea
              id="content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-[#cccccc] text-zinc-900 p-3 rounded focus:outline-none w-full sm:w-2/3 border border-zinc-300 leading-relaxed font-bold"
            />
          </div>

        </div>

        {/* ปุ่มยืนยันตกลงด้านล่างขวา */}
        <div className="flex justify-end pt-2">
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
