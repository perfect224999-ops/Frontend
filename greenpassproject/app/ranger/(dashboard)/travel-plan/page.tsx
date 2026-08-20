"use client";

import React, { useEffect, useState } from "react";
import { Navigation, DollarSign, Tent, ShieldAlert, PhoneCall, Edit3, X, RotateCcw, Plus, Trash2 } from "lucide-react";

const INITIAL_FEES = [
  { type: "คนไทย (ผู้ใหญ่)", price: "40 บาท / ท่าน" },
  { type: "คนไทย (เด็ก)", price: "20 บาท / ท่าน" },
  { type: "ชาวต่างชาติ (ผู้ใหญ่)", price: "400 บาท / ท่าน" },
  { type: "ชาวต่างชาติ (เด็ก)", price: "200 บาท / ท่าน" },
  { type: "รถยนต์ 4 ล้อ", price: "50 บาท / คัน" },
  { type: "รถจักรยานยนต์", price: "20 บาท / คัน" },
];

const INITIAL_CAMPING = [
  {
    name: "ลานกางเต็นท์ลำตะคอง",
    capacity: "รองรับนักท่องเที่ยว 800-1,000 คน",
    details: "มีห้องน้ำ รุมไฟ ร้านสวัสดิการ และจุดเช่าอุปกรณ์เต็นท์บริการลานกว้างใกล้ลำน้ำ",
    status: "เปิดบริการปกติ"
  },
  {
    name: "ลานกางเต็นท์ผากล้วยไม้",
    capacity: "รองรับนักท่องเที่ยว 500-700 คน",
    details: "บรรยากาศร่มรื่นใต้ร่มไม้ ใกล้จุดเริ่มต้นเส้นทางเดินป่าไปยังน้ำตกเหวสุวัต",
    status: "เปิดบริการปกติ"
  }
];

const INITIAL_RULES = [
  "ห้ามส่งเสียงดังรบกวนผู้อื่นและสัตว์ป่าหลังเวลา 22:00 น.",
  "ห้ามให้อาหารสัตว์ป่าทุกชนิดเด็ดขาด (ป้องกันสัตว์เปลี่ยนพฤติกรรม)",
  "ห้ามนำสัตว์เลี้ยงทุกชนิดเข้ามาภายในเขตอุทยานแห่งชาติ",
  "ห้ามทิ้งขยะ ให้ใช้นโยบาย ขยะคืนถิ่น นำขยะกลับออกไปนอกอุทยาน",
  "จำกัดความเร็วในการขับขี่ยานพาหนะไม่เกิน 60 กม./ชม. เพื่อความปลอดภัยของสัตว์ป่า",
  "ห้ามดื่มเครื่องดื่มแอลกอฮอล์ในบริเวณสถานที่ท่องเที่ยวและจุดกางเต็นท์"
];

export default function TravelPlanPage() {
  const [headerTitle, setHeaderTitle] = useState("วางแผนการเดินทางและการท่องเที่ยวอุทยาน");
  const [headerDescription, setHeaderDescription] = useState("ข้อมูลอัตราค่าบริการ จุดกางเต็นท์ ฤดูกาลท่องเที่ยวที่แนะนำ และกฎระเบียบสำคัญในการท่องเที่ยวอุทยานแห่งชาติเขาใหญ่");
  const [entranceFees, setEntranceFees] = useState(INITIAL_FEES);
  const [campingSites, setCampingSites] = useState(INITIAL_CAMPING);
  const [rules, setRules] = useState(INITIAL_RULES);

  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Edit draft states
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFees, setEditFees] = useState(INITIAL_FEES);
  const [editCamping, setEditCamping] = useState(INITIAL_CAMPING);
  const [editRules, setEditRules] = useState(INITIAL_RULES);

  useEffect(() => {
    const saved = localStorage.getItem("greenpass_travel_plan_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.headerTitle) setHeaderTitle(parsed.headerTitle);
        if (parsed.headerDescription) setHeaderDescription(parsed.headerDescription);
        if (parsed.entranceFees) setEntranceFees(parsed.entranceFees);
        if (parsed.campingSites) setCampingSites(parsed.campingSites);
        if (parsed.rules) setRules(parsed.rules);
      } catch (e) {
        console.error("Failed to parse travel plan data", e);
      }
    }
  }, []);

  const openEditModal = () => {
    setEditTitle(headerTitle);
    setEditDesc(headerDescription);
    setEditFees(JSON.parse(JSON.stringify(entranceFees)));
    setEditCamping(JSON.parse(JSON.stringify(campingSites)));
    setEditRules([...rules]);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setHeaderTitle(editTitle);
    setHeaderDescription(editDesc);
    setEntranceFees(editFees);
    setCampingSites(editCamping);
    setRules(editRules);

    const dataToSave = {
      headerTitle: editTitle,
      headerDescription: editDesc,
      entranceFees: editFees,
      campingSites: editCamping,
      rules: editRules
    };
    localStorage.setItem("greenpass_travel_plan_data", JSON.stringify(dataToSave));
    setIsEditing(false);

    setSuccessMessage("บันทึกข้อมูลหน้า 'วางแผนการเดินทาง' สำเร็จเรียบร้อยแล้ว!");
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  const handleResetDefault = () => {
    if (confirm("คุณต้องการคืนค่าข้อมูลเริ่มต้นทั้งหมดใช่หรือไม่?")) {
      setHeaderTitle("วางแผนการเดินทางและการท่องเที่ยวอุทยาน");
      setHeaderDescription("ข้อมูลอัตราค่าบริการ จุดกางเต็นท์ ฤดูกาลท่องเที่ยวที่แนะนำ และกฎระเบียบสำคัญในการท่องเที่ยวอุทยานแห่งชาติเขาใหญ่");
      setEntranceFees(INITIAL_FEES);
      setCampingSites(INITIAL_CAMPING);
      setRules(INITIAL_RULES);
      localStorage.removeItem("greenpass_travel_plan_data");
      setIsEditing(false);
      setSuccessMessage("คืนค่าเริ่มต้นสำเร็จเรียบร้อยแล้ว!");
      setTimeout(() => setSuccessMessage(""), 3500);
    }
  };

  const handleFeeChange = (idx: number, field: "type" | "price", val: string) => {
    const updated = [...editFees];
    updated[idx][field] = val;
    setEditFees(updated);
  };

  const handleCampingChange = (idx: number, field: string, val: string) => {
    const updated = [...editCamping];
    updated[idx] = { ...updated[idx], [field]: val };
    setEditCamping(updated);
  };

  const handleRuleChange = (idx: number, val: string) => {
    const updated = [...editRules];
    updated[idx] = val;
    setEditRules(updated);
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
            <Navigation className="w-4 h-4" /> Travel Planning &amp; Guidelines
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

      {/* Grid อัตราค่าบริการ & จุดกางเต็นท์ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* อัตราค่าบริการ */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4 shadow-xs border-t-4 border-[#0a5829]">
          <h2 className="text-sm font-bold text-zinc-800 flex items-center gap-2 border-b border-zinc-150 pb-3">
            <DollarSign className="w-4 h-4 text-[#0a5829]" />
            อัตราค่าธรรมเนียมเข้าอุทยาน (Entrance Fees)
          </h2>
          <div className="divide-y divide-zinc-150">
            {entranceFees.map((fee, i) => (
              <div key={i} className="py-2.5 flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-700">{fee.type}</span>
                <span className="font-bold text-[#0a5829] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  {fee.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* จุดกางเต็นท์ */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4 shadow-xs border-t-4 border-[#0a5829]">
          <h2 className="text-sm font-bold text-zinc-800 flex items-center gap-2 border-b border-zinc-150 pb-3">
            <Tent className="w-4 h-4 text-[#0a5829]" />
            บริการจุดกางเต็นท์พักแรม (Camping Sites)
          </h2>
          <div className="space-y-3">
            {campingSites.map((site, i) => (
              <div key={i} className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-150 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-zinc-900">{site.name}</span>
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    {site.status}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-emerald-800">{site.capacity}</p>
                <p className="text-xs text-zinc-600 leading-relaxed">{site.details}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* กฎระเบียบและข้อปฏิบัติ */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-zinc-800 flex items-center gap-2 border-b border-zinc-150 pb-3">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          กฎระเบียบและข้อปฏิบัติสำคัญ (Park Rules &amp; Safety)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rules.map((rule, idx) => (
            <div key={idx} className="flex items-start gap-2.5 bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                {idx + 1}
              </span>
              <span className="text-xs font-semibold text-zinc-700 leading-relaxed">{rule}</span>
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
                <h3 className="text-base font-bold text-slate-800">แก้ไขข้อมูลหน้า 'วางแผนการเดินทาง'</h3>
                <p className="text-xs text-slate-500">ปรับเปลี่ยนข้อมูลอัตราค่าบริการ จุดกางเต็นท์ และกฎระเบียบอุทยาน</p>
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

              {/* Entrance Fees edit */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">อัตราค่าธรรมเนียมเข้าอุทยาน</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {editFees.map((fee, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                      <input
                        type="text"
                        value={fee.type}
                        onChange={(e) => handleFeeChange(idx, "type", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-bold text-xs"
                      />
                      <input
                        type="text"
                        value={fee.price}
                        onChange={(e) => handleFeeChange(idx, "price", e.target.value)}
                        className="w-full bg-emerald-50 border border-emerald-200 text-emerald-900 rounded p-1.5 font-bold text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Camping sites edit */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">จุดกางเต็นท์พักแรม</h4>
                <div className="space-y-3">
                  {editCamping.map((site, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={site.name}
                          onChange={(e) => handleCampingChange(idx, "name", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-bold"
                          placeholder="ชื่อลานกางเต็นท์"
                        />
                        <input
                          type="text"
                          value={site.capacity}
                          onChange={(e) => handleCampingChange(idx, "capacity", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-emerald-800 font-bold"
                          placeholder="ความจุรองรับ"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={site.details}
                        onChange={(e) => handleCampingChange(idx, "details", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs"
                        placeholder="รายละเอียดและสิ่งอำนวยความสะดวก"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules edit */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">กฎระเบียบและข้อปฏิบัติ ({editRules.length} ข้อ)</h4>
                <div className="space-y-2">
                  {editRules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => handleRuleChange(idx, e.target.value)}
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

