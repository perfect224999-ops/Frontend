"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_PARK_DATA = {
  parkName: "อุทยานแห่งชาติเขาใหญ่",
  openHours: "เปิดทุกวัน ตั้งแต่เวลา 06.00 น.-18.00 น.",
  description: "อุทยานแห่งชาติเขาใหญ่ มีความสำคัญในระดับโลกและระดับภูมิภาคอาเซียน คือ เป็นหนึ่งในพื้นที่มรดกโลกทางธรรมชาติ (World Heritage Site) และอุทยานมรดกแห่งอาเซียน (ASEAN Heritage Park) ครอบคลุม 4 จังหวัด ประกอบด้วย สระบุรี นครนายก ปราจีนบุรี และนครราชสีมา พื้นที่เกือบ 2,206 ตารางกิโลเมตร ของอุทยานแห่งชาติเขาใหญ่ เป็นแหล่งกำเนิดต้นน้ำลำธารสำคัญหลายสาย มีความหลากหลายทางชีวภาพ และเป็นบ้านหลังใหญ่ของสัตว์ป่าที่สำคัญ หายาก และใกล้สูญพันธุ์หลายชนิด รวมถึงนกมากกว่า 280 ชนิด จึงทำให้เป็นที่นิยมของนักท่องเที่ยวทั่วโลก",
  address: "ศูนย์บริการนักท่องเที่ยว ตู้ปณ. 9 ตำบลหมูสี อำเภอปากช่อง จังหวัดนครราชสีมา 30130",
  location: "14.4374° N, 101.4013° E"
};

export default function ViewParkDetail() {
  const router = useRouter();
  const [parkData, setParkData] = useState(DEFAULT_PARK_DATA);

  useEffect(() => {
    const savedData = localStorage.getItem("greenpass_park_data");
    if (savedData) {
      try {
        setParkData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse park data", e);
      }
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-6 font-sans border-l-[16px] border-r-[16px] border-[#2ebb5e] space-y-6">
      
      {/* ส่วนหัวชื่อหน้า */}
      <div className="flex justify-between items-center border-b border-zinc-150 pb-2">
        <h2 className="text-xs font-bold text-zinc-400">รายละเอียดข้อมูลอุทยาน</h2>
        <button 
          onClick={() => router.push("/ranger/edit-park-details")}
          className="text-xs text-emerald-600 hover:text-emerald-700 font-bold"
        >
          แก้ไขข้อมูล &gt;
        </button>
      </div>

      {/* รายละเอียดข้อมูล */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-lg font-bold text-[#0c592b]">{parkData.parkName}</h1>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-2xl mx-auto px-2">
            {parkData.description}
          </p>
        </div>

        <hr className="border-zinc-100" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 space-y-1.5">
            <h3 className="text-xs font-bold text-[#0c592b]">เวลาเปิดทำการ</h3>
            <p className="text-xs text-zinc-700 font-medium">{parkData.openHours}</p>
          </div>

          <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 space-y-1.5">
            <h3 className="text-xs font-bold text-[#0c592b]">ที่ตั้งอุทยาน</h3>
            <p className="text-xs text-zinc-700 font-medium">{parkData.address}</p>
            <span className="text-[10px] text-zinc-500 block font-mono">พิกัด: {parkData.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
