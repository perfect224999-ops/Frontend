"use client";

import React, { useEffect, useState } from "react";
import { Footprints, Clock, Map, CheckCircle2, ShieldCheck, Compass, Edit3, X, RotateCcw } from "lucide-react";

const INITIAL_TRAILS = [
  {
    id: 1,
    name: "เส้นทางที่ 1: ศูนย์บริการนักท่องเที่ยว - น้ำตกกองแก้ว",
    englishName: "Visitor Center - Kong Kaew Waterfall Trail",
    distance: "1.2 กิโลเมตร",
    time: "45 นาที",
    difficulty: "ง่าย (Easy)",
    difficultyColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    guideRequired: "ไม่จำเป็นต้องมีเจ้าหน้าที่นำทาง",
    highlights: "เดินง่าย สะพานแขวนข้ามลำน้ำ ป่าดิบชื้นร่มรื่น นกป่าหลากหลายชนิด"
  },
  {
    id: 2,
    name: "เส้นทางที่ 2: ผากล้วยไม้ - น้ำตกเหวสุวัต",
    englishName: "Pha Kluai Mai - Haew Suwat Waterfall Trail",
    distance: "3.3 กิโลเมตร",
    time: "2 ชั่วโมง",
    difficulty: "ปานกลาง (Moderate)",
    difficultyColor: "bg-amber-100 text-amber-800 border-amber-300",
    guideRequired: "แนะนำให้ลงทะเบียนก่อนเดิน",
    highlights: "เดินเลียบลำน้ำ ลานหิน กล้วยไม้ป่า หินโผล่ และปลายทางที่น้ำตกเหวสุวัต"
  },
  {
    id: 3,
    name: "เส้นทางที่ 3: ศูนย์บริการนักท่องเที่ยว - หอดูสัตว์หนองผักชี",
    englishName: "Visitor Center - Nong Pak Chi Watchtower Trail",
    distance: "3.3 กิโลเมตร",
    time: "1.5 - 2 ชั่วโมง",
    difficulty: "ง่าย (Easy)",
    difficultyColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    guideRequired: "ลงทะเบียน ณ จุดเริ่มต้นเส้นทาง",
    highlights: "ผ่านป่าดิบแล้ง ทุ่งหญ้ากว้าง และหอดูสัตว์หนองผักชีสังเกตการณ์สัตว์ป่า"
  },
  {
    id: 4,
    name: "เส้นทางที่ 4: ดงสุวัต - หอดูสัตว์หนองผักชี (เส้นทางเดินป่าระยะไกล)",
    englishName: "Dong Suwat - Nong Pak Chi Long Trail",
    distance: "8.0 กิโลเมตร",
    time: "4 - 5 ชั่วโมง",
    difficulty: "ท้าทาย (Challenging)",
    difficultyColor: "bg-rose-100 text-rose-800 border-rose-300",
    guideRequired: "ต้องมีเจ้าหน้าที่พิทักษ์ป่านำทางเท่านั้น",
    highlights: "ข้ามลำห้วย ป่าสมบูรณ์ลึก ส่องพฤติกรรมสัตว์ป่าตามธรรมชาติ"
  }
];

const INITIAL_CHECKLIST = [
  "สวมรองเท้าผ้าใบหรือรองเท้าเดินป่าที่กระชับ ไม่ลื่น",
  "แต่งกายด้วยเสื้อผ้าแขนยาวและกางเกงขายาวเพื่อป้องกันแมลงและถุงทาก",
  "พกพาน้ำดื่มอย่างน้อย 1-2 ลิตร และอาหารย่อยง่าย",
  "นำยาทากันยุง สเปรย์กันทาก และยาสมุนไพรประจำตัวติดตัว",
  "ปฏิบัติตามป้ายเตือนตลอดเส้นทาง ห้ามเดินออกนอกเส้นทางเด็ดขาด",
  "แจ้งชื่อและลงทะเบียน ณ ศูนย์บริการนักท่องเที่ยวก่อนและหลังเดินป่าทุกครั้ง"
];

export default function HikingTrailsPage() {
  const [headerTitle, setHeaderTitle] = useState("จุดเดินป่าและเส้นทางศึกษาธรรมชาติ");
  const [headerDescription, setHeaderDescription] = useState("สัมผัสธรรมชาติอย่างใกล้ชิดผ่านเส้นทางศึกษาธรรมชาติและเดินป่าท่องพนาในอุทยานแห่งชาติเขาใหญ่");
  const [trails, setTrails] = useState(INITIAL_TRAILS);
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);

  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Edit draft states
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editTrails, setEditTrails] = useState(INITIAL_TRAILS);
  const [editChecklist, setEditChecklist] = useState(INITIAL_CHECKLIST);

  useEffect(() => {
    const saved = localStorage.getItem("greenpass_hiking_trails_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.headerTitle) setHeaderTitle(parsed.headerTitle);
        if (parsed.headerDescription) setHeaderDescription(parsed.headerDescription);
        if (parsed.trails) setTrails(parsed.trails);
        if (parsed.checklist) setChecklist(parsed.checklist);
      } catch (e) {
        console.error("Failed to parse hiking trails data", e);
      }
    }
  }, []);

  const openEditModal = () => {
    setEditTitle(headerTitle);
    setEditDesc(headerDescription);
    setEditTrails(JSON.parse(JSON.stringify(trails)));
    setEditChecklist([...checklist]);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setHeaderTitle(editTitle);
    setHeaderDescription(editDesc);
    setTrails(editTrails);
    setChecklist(editChecklist);

    const dataToSave = {
      headerTitle: editTitle,
      headerDescription: editDesc,
      trails: editTrails,
      checklist: editChecklist
    };
    localStorage.setItem("greenpass_hiking_trails_data", JSON.stringify(dataToSave));
    setIsEditing(false);

    setSuccessMessage("บันทึกข้อมูลหน้า 'จุดเดินป่าและเส้นทางการเดิน' สำเร็จเรียบร้อยแล้ว!");
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  const handleResetDefault = () => {
    if (confirm("คุณต้องการคืนค่าข้อมูลเริ่มต้นทั้งหมดใช่หรือไม่?")) {
      setHeaderTitle("จุดเดินป่าและเส้นทางศึกษาธรรมชาติ");
      setHeaderDescription("สัมผัสธรรมชาติอย่างใกล้ชิดผ่านเส้นทางศึกษาธรรมชาติและเดินป่าท่องพนาในอุทยานแห่งชาติเขาใหญ่");
      setTrails(INITIAL_TRAILS);
      setChecklist(INITIAL_CHECKLIST);
      localStorage.removeItem("greenpass_hiking_trails_data");
      setIsEditing(false);
      setSuccessMessage("คืนค่าเริ่มต้นสำเร็จเรียบร้อยแล้ว!");
      setTimeout(() => setSuccessMessage(""), 3500);
    }
  };

  const handleTrailChange = (idx: number, field: string, val: string) => {
    const updated = [...editTrails];
    updated[idx] = { ...updated[idx], [field]: val };
    setEditTrails(updated);
  };

  const handleChecklistChange = (idx: number, val: string) => {
    const updated = [...editChecklist];
    updated[idx] = val;
    setEditChecklist(updated);
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
            <Footprints className="w-4 h-4" /> Trekking &amp; Hiking Trails
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

      {/* รายการเส้นทางเดินป่า */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
            <Map className="w-4 h-4 text-[#0a5829]" />
            เส้นทางศึกษาธรรมชาติที่เปิดให้บริการ (Nature Trails)
          </h2>
          <span className="text-[11px] text-zinc-500 font-semibold">{trails.length} เส้นทางยอดนิยม</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trails.map((trail) => (
            <div 
              key={trail.id}
              className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 border-t-4 border-[#0a5829]"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className={`px-2.5 py-0.5 font-bold text-[10px] rounded border ${trail.difficultyColor}`}>
                    {trail.difficulty}
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                    {trail.guideRequired}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{trail.name}</h3>
                  <p className="text-[11px] text-zinc-500 font-medium">{trail.englishName}</p>
                </div>

                {/* Distance & Time */}
                <div className="flex gap-4 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
                    <Compass className="w-3.5 h-3.5 text-[#0a5829]" />
                    <span>{trail.distance}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
                    <Clock className="w-3.5 h-3.5 text-[#0a5829]" />
                    <span>{trail.time}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-650 pt-1 leading-relaxed">
                  <strong className="text-zinc-800">ไฮไลท์สำคัญ:</strong> {trail.highlights}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ข้อควรปฏิบัติและอุปกรณ์ที่ต้องเตรียม */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-zinc-800 flex items-center gap-2 border-b border-zinc-150 pb-3">
          <ShieldCheck className="w-4 h-4 text-[#0a5829]" />
          ข้อควรปฏิบัติและการเตรียมตัวเดินป่า (Hiking Checklist &amp; Safety)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {checklist.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 bg-emerald-50/40 p-3 rounded-lg border border-emerald-150">
              <CheckCircle2 className="w-4 h-4 text-[#0a5829] shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-zinc-700 leading-relaxed">{item}</span>
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
                <h3 className="text-base font-bold text-slate-800">แก้ไขข้อมูลหน้า 'จุดเดินป่าและเส้นทางการเดิน'</h3>
                <p className="text-xs text-slate-500">ปรับเปลี่ยนข้อมูลเส้นทาง ระยะทาง เวลาที่ใช้ และข้อควรปฏิบัติ</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Header Banner edit */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">ข้อมูลส่วนหัว (Header Banner)</h4>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">ชื่อหัวข้อ</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
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

              {/* Trails edit */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">แก้ไขเส้นทางเดินป่า ({editTrails.length} เส้นทาง)</h4>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {editTrails.map((trail, idx) => (
                    <div key={trail.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                      <span className="font-bold text-emerald-700 block">เส้นทางที่ {idx + 1}: {trail.name}</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-500 font-bold">ชื่อเส้นทาง (ไทย)</label>
                          <input
                            type="text"
                            value={trail.name}
                            onChange={(e) => handleTrailChange(idx, "name", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 font-bold">ชื่อภาษาอังกฤษ</label>
                          <input
                            type="text"
                            value={trail.englishName}
                            onChange={(e) => handleTrailChange(idx, "englishName", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-500 font-bold">ระยะทาง</label>
                          <input
                            type="text"
                            value={trail.distance}
                            onChange={(e) => handleTrailChange(idx, "distance", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 font-bold">เวลาที่ใช้</label>
                          <input
                            type="text"
                            value={trail.time}
                            onChange={(e) => handleTrailChange(idx, "time", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 font-bold">ระดับความยาก</label>
                          <input
                            type="text"
                            value={trail.difficulty}
                            onChange={(e) => handleTrailChange(idx, "difficulty", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 font-bold">ไฮไลท์สำคัญประจำเส้นทาง</label>
                        <input
                          type="text"
                          value={trail.highlights}
                          onChange={(e) => handleTrailChange(idx, "highlights", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist edit */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">ข้อควรปฏิบัติและการเตรียมตัว ({editChecklist.length} ข้อ)</h4>
                <div className="space-y-2">
                  {editChecklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleChecklistChange(idx, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
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

