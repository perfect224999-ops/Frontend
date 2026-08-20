"use client";

import React, { useEffect, useState } from "react";
import { Compass, MapPin, Trees, Edit3, Camera, X, Check, RotateCcw, Plus, Trash2 } from "lucide-react";

const INITIAL_ATTRACTIONS = [
  {
    id: 1,
    name: "น้ำตกเหวนรก",
    englishName: "Haew Narok Waterfall",
    category: "น้ำตกขนาดใหญ่",
    description: "น้ำตกขนาดใหญ่ที่สุดในอุทยานแห่งชาติเขาใหญ่ มีความสูง 3 ชั้น รวมกว่า 150 เมตร สายน้ำตกไหลเชี่ยวตระการตา",
    status: "เปิดบริการปกติ",
    highlight: "จุดชมวิวผาน้ำตกสายน้ำอลังการ"
  },
  {
    id: 2,
    name: "น้ำตกเหวสุวัต",
    englishName: "Haew Suwat Waterfall",
    category: "น้ำตกยอดนิยม",
    description: "น้ำตกชื่อดังที่มีผาสูงกว่า 20 เมตร สายน้ำไหลลงสู่แอ่งน้ำใหญ่ ล้อมรอบด้วยธรรมชาติอันร่มรื่น",
    status: "เปิดบริการปกติ",
    highlight: "แอ่งน้ำธรรมชาติและจุดถ่ายภาพยอดฮิต"
  },
  {
    id: 3,
    name: "หอดูสัตว์หนองผักชี",
    englishName: "Nong Pak Chi Watchtower",
    category: "จุดชมสัตว์ป่า",
    description: "อาคารหอดูสัตว์สูง 3 ชั้น ตั้งอยู่กลางทุ่งหญ้ากว้าง เป็นจุดเฝ้าสังเกตการณ์สัตว์ป่ากินดินโป่งและแหล่งน้ำ",
    status: "เปิดบริการปกติ",
    highlight: "ส่องกวางป่า ช้างป่า และนกหายาก"
  },
  {
    id: 4,
    name: "จุดชมทิวทัศน์ผาเดียวดาย",
    englishName: "Pha Diew Dai Viewpoint",
    category: "จุดชมทิวทัศน์",
    description: "ผาหินยื่นออกไปหน้าผาสูงกว่า 900 เมตรจากระดับน้ำทะเล สัมผัสทะเลหมอกยามเช้าและทิวทัศน์ขุนเขาซับซ้อน",
    status: "เปิดบริการปกติ",
    highlight: "สัมผัสอากาศบริสุทธิ์และทะเลหมอก"
  },
  {
    id: 5,
    name: "อ่างเก็บน้ำสายศร",
    englishName: "Sai Sorn Reservoir",
    category: "จุดชมพระอาทิตย์ตก",
    description: "อ่างเก็บน้ำขนาดใหญ่ใจกลางอุทยาน เป็นแหล่งน้ำสำคัญของสัตว์ป่า และเป็นจุดชมพระอาทิตย์ตกดินอันสวยงาม",
    status: "เปิดบริการปกติ",
    highlight: "ชมแสงเย็นสะท้อนผิวน้ำตระการตา"
  },
  {
    id: 6,
    name: "จุดชมทิวทัศน์ผากล้วยไม้",
    englishName: "Pha Kluai Mai Area",
    category: "ธรรมชาติลานหิน",
    description: "ลานหินเลียบลำน้ำ ล้อมรอบด้วยกล้วยไม้ป่าหลากหลายสายพันธุ์ และเป็นจุดเชื่อมต่อไปยังเส้นทางเดินป่า",
    status: "เปิดบริการปกติ",
    highlight: "กล้วยไม้หวายแดงบานสะพรั่งตามฤดูกาล"
  }
];

const INITIAL_WILDLIFE = [
  { name: "ช้างป่า (Asian Elephant)", icon: "🐘", status: "พบเห็นบ่อยบริเวณโป่งหนองผักชี" },
  { name: "กวางป่า (Sambar Deer)", icon: "🦌", status: "พบเห็นได้ทั่วไปบริเวณศูนย์บริการนักท่องเที่ยว" },
  { name: "ชะนีมงกุฎ (Crown Gibbon)", icon: "🐒", status: "ส่งเสียงร้องยามเช้าตามเส้นทางศึกษาธรรมชาติ" },
  { name: "นกเงือกกรามช้าง (Great Hornbill)", icon: "🦜", status: "สัญลักษณ์แห่งป่าสมบูรณ์ พบในป่าลึก" },
];

export default function ExploreKhaoYaiPage() {
  const [headerTitle, setHeaderTitle] = useState("สำรวจอุทยานแห่งชาติเขาใหญ่");
  const [headerDescription, setHeaderDescription] = useState("มรดกโลกทางธรรมชาติ อุดมไปด้วยผืนป่าดงพญาเย็น-เขาใหญ่ น้ำตกสวยงาม ทุ่งหญ้ากว้าง และสัตว์ป่านานาชนิด");
  const [attractions, setAttractions] = useState(INITIAL_ATTRACTIONS);
  const [wildlife, setWildlife] = useState(INITIAL_WILDLIFE);

  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Edit draft states
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAttractions, setEditAttractions] = useState(INITIAL_ATTRACTIONS);

  useEffect(() => {
    const saved = localStorage.getItem("greenpass_explore_khaoyai_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.headerTitle) setHeaderTitle(parsed.headerTitle);
        if (parsed.headerDescription) setHeaderDescription(parsed.headerDescription);
        if (parsed.attractions) setAttractions(parsed.attractions);
        if (parsed.wildlife) setWildlife(parsed.wildlife);
      } catch (e) {
        console.error("Failed to parse explore data", e);
      }
    }
  }, []);

  const openEditModal = () => {
    setEditTitle(headerTitle);
    setEditDesc(headerDescription);
    setEditAttractions(JSON.parse(JSON.stringify(attractions)));
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setHeaderTitle(editTitle);
    setHeaderDescription(editDesc);
    setAttractions(editAttractions);

    const dataToSave = {
      headerTitle: editTitle,
      headerDescription: editDesc,
      attractions: editAttractions,
      wildlife
    };
    localStorage.setItem("greenpass_explore_khaoyai_data", JSON.stringify(dataToSave));
    setIsEditing(false);

    setSuccessMessage("บันทึกข้อมูลหน้า 'สำรวจเขาใหญ่' สำเร็จเรียบร้อยแล้ว!");
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  const handleResetDefault = () => {
    if (confirm("คุณต้องการคืนค่าข้อมูลเริ่มต้นทั้งหมดใช่หรือไม่?")) {
      setHeaderTitle("สำรวจอุทยานแห่งชาติเขาใหญ่");
      setHeaderDescription("มรดกโลกทางธรรมชาติ อุดมไปด้วยผืนป่าดงพญาเย็น-เขาใหญ่ น้ำตกสวยงาม ทุ่งหญ้ากว้าง และสัตว์ป่านานาชนิด");
      setAttractions(INITIAL_ATTRACTIONS);
      setWildlife(INITIAL_WILDLIFE);
      localStorage.removeItem("greenpass_explore_khaoyai_data");
      setIsEditing(false);
      setSuccessMessage("คืนค่าเริ่มต้นสำเร็จเรียบร้อยแล้ว!");
      setTimeout(() => setSuccessMessage(""), 3500);
    }
  };

  const handleUpdateAttractionField = (index: number, field: string, value: string) => {
    const updated = [...editAttractions];
    updated[index] = { ...updated[index], [field]: value };
    setEditAttractions(updated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      
      {/* Toast Notification */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <span>✅ {successMessage}</span>
          <button onClick={() => setSuccessMessage("")} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#0a5829] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4" /> Destination Guide
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">{headerTitle}</h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            {headerDescription}
          </p>
        </div>

        <button
          onClick={openEditModal}
          className="relative z-10 inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>แก้ไขข้อมูล</span>
        </button>
      </div>

      {/* Grid ของสถานที่ท่องเที่ยวหลัก */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#0a5829]" />
            สถานที่ท่องเที่ยวไฮไลท์ที่ไม่ควรพลาด
          </h2>
          <span className="text-[11px] text-zinc-500 font-semibold">{attractions.length} สถานที่ยอดนิยม</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attractions.map((spot) => (
            <div 
              key={spot.id} 
              className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 border-t-4 border-[#0a5829]"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded border border-emerald-200">
                    {spot.category}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[9px] rounded-full">
                    {spot.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{spot.name}</h3>
                  <p className="text-[11px] text-zinc-500 font-medium">{spot.englishName}</p>
                </div>
                <p className="text-xs text-zinc-650 leading-relaxed">
                  {spot.description}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] font-bold text-[#0a5829]">
                <Camera className="w-3.5 h-3.5" />
                <span>ไฮไลท์: {spot.highlight}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* สัตว์ป่าและชีวdiversity */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-zinc-800 flex items-center gap-2 border-b border-zinc-150 pb-3">
          <Trees className="w-4 h-4 text-[#0a5829]" />
          สัตว์ป่าน่าสนใจประจำอุทยาน (Wildlife Showcase)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {wildlife.map((animal, i) => (
            <div key={i} className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-150 flex flex-col items-center text-center space-y-1">
              <span className="text-2xl">{animal.icon}</span>
              <span className="text-xs font-bold text-zinc-800">{animal.name}</span>
              <span className="text-[10px] text-zinc-500 font-medium">{animal.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">แก้ไขข้อมูลหน้า 'สำรวจเขาใหญ่'</h3>
                <p className="text-xs text-slate-500">ปรับแต่งชื่อหัวข้อ คำอธิบาย และรายการสถานที่ท่องเที่ยว</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Header section edit */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">ข้อมูลส่วนหัว (Header Banner)</h4>
                
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">ชื่อหัวข้อ</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">คำอธิบาย</label>
                  <textarea
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Attractions edit */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">แก้ไขสถานที่ท่องเที่ยว ({editAttractions.length} รายการ)</h4>
                
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {editAttractions.map((spot, idx) => (
                    <div key={spot.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                      <div className="font-bold text-emerald-700 flex justify-between items-center">
                        <span>รายการที่ {idx + 1}: {spot.name}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-500 font-bold">ชื่อสถานที่ (ภาษาไทย)</label>
                          <input
                            type="text"
                            value={spot.name}
                            onChange={(e) => handleUpdateAttractionField(idx, "name", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:bg-white text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500 font-bold">ชื่อภาษาอังกฤษ</label>
                          <input
                            type="text"
                            value={spot.englishName}
                            onChange={(e) => handleUpdateAttractionField(idx, "englishName", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:bg-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-500 font-bold">หมวดหมู่</label>
                          <input
                            type="text"
                            value={spot.category}
                            onChange={(e) => handleUpdateAttractionField(idx, "category", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:bg-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500 font-bold">ไฮไลท์ประจำจุด</label>
                          <input
                            type="text"
                            value={spot.highlight}
                            onChange={(e) => handleUpdateAttractionField(idx, "highlight", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:bg-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 font-bold">รายละเอียด</label>
                        <textarea
                          rows={2}
                          value={spot.description}
                          onChange={(e) => handleUpdateAttractionField(idx, "description", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:bg-white text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="inline-flex items-center space-x-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>คืนค่าเริ่มต้น</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

