"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_PARK_DATA = {
  parkName: "อุทยานแห่งชาติแห่งชาติเขาใหญ่",
  openHours: "เปิดทุกวัน ตั้งแต่เวลา 06.00 น.-18.00 น.",
  description: "อุทยานแห่งชาติเขาใหญ่ มีความสำคัญในระดับโลกและระดับภูมิภาคอาเซียน คือ เป็นหนึ่งในพื้นที่มรดกโลกทางธรรมชาติ (World Heritage Site) และอุทยานมรดกแห่งอาเซียน (ASEAN Heritage Park) ครอบคลุม 4 จังหวัด ประกอบด้วย สระบุรี นครนายก ปราจีนบุรี และนครราชสีมา พื้นที่เกือบ 2,206 ตารางกิโลเมตร ของอุทยานแห่งชาติเขาใหญ่ เป็นแหล่งกำเนิดต้นน้ำลำธารสำคัญหลายสาย มีความหลากหลายทางชีวภาพ และเป็นบ้านหลังใหญ่ of สัตว์ป่าที่สำคัญ หายาก และใกล้สูญพันธุ์หลายชนิด รวมถึงนกมากกว่า 280 ชนิด จึงทำให้เป็นที่นิยมของนักท่องเที่ยวทั่วโลก",
  address: "ศูนย์บริการนักท่องเที่ยว ตู้ปณ. 9 ตำบลหมูสี อำเภอปากช่อง จังหวัดนครราชสีมา 30130",
  location: "14.4374° N, 101.4013° E"
};

export default function EditParkDetails() {
  const router = useRouter();

  const [parkName, setParkName] = useState("");
  const [openHours, setOpenHours] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem("greenpass_park_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setParkName(parsed.parkName || DEFAULT_PARK_DATA.parkName);
        setOpenHours(parsed.openHours || DEFAULT_PARK_DATA.openHours);
        setDescription(parsed.description || DEFAULT_PARK_DATA.description);
        setAddress(parsed.address || DEFAULT_PARK_DATA.address);
        setLocation(parsed.location || DEFAULT_PARK_DATA.location);
      } catch (e) {
        console.error("Failed to parse park data", e);
      }
    } else {
      setParkName(DEFAULT_PARK_DATA.parkName);
      setOpenHours(DEFAULT_PARK_DATA.openHours);
      setDescription(DEFAULT_PARK_DATA.description);
      setAddress(DEFAULT_PARK_DATA.address);
      setLocation(DEFAULT_PARK_DATA.location);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!parkName.trim()) {
      setError("ชื่ออุทยานต้องไม่เป็นค่าว่าง");
      return;
    }
    if (parkName.length < 4 || parkName.length > 50) {
      setError("ชื่ออุทยานต้องมีความยาว 4 - 50 ตัวอักษร");
      return;
    }

    if (!openHours.trim()) {
      setError("เวลาเปิด-ปิด ต้องไม่เป็นค่าว่าง");
      return;
    }

    if (!description.trim()) {
      setError("คำอธิบายต้องไม่เป็นค่าว่าง");
      return;
    }
    // ขยายขนาดความยาวของคำอธิบายเป็น 1000 ตัวอักษร เพื่อให้แสดงข้อความจริงได้ครบถ้วน
    if (description.length < 4 || description.length > 1000) {
      setError("คำอธิบายต้องมีความยาว 4 - 1000 ตัวอักษร");
      return;
    }

    if (!address.trim()) {
      setError("ที่อยู่ต้องไม่เป็นค่าว่าง");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      try {
        const dataToSave = {
          parkName,
          openHours,
          description,
          address,
          location
        };
        localStorage.setItem("greenpass_park_data", JSON.stringify(dataToSave));
        setSuccess("บันทึกข้อมูลอุทยานเสร็จสมบูรณ์เรียบร้อยแล้ว!");
        
        setTimeout(() => {
          router.push("/ranger/view-park-detail");
        }, 1200);
      } catch (err) {
        setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      }
    }, 1000);
  };

  return (
    <form onSubmit={handleSave} className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-6 font-sans relative border-l-[16px] border-r-[16px] border-[#2ebb5e] space-y-6">
      
      {/* ส่วนหัวชื่อหน้า */}
      <div className="flex justify-between items-center border-b border-zinc-150 pb-2">
        <h2 className="text-xs font-bold text-zinc-400">แก้ไขรายละเอียดอุทยาน</h2>
        <button 
          type="button" 
          onClick={() => router.push("/ranger/view-park-detail")}
          className="text-xs text-zinc-500 hover:text-zinc-700 font-bold"
        >
          &lt; ย้อนกลับ
        </button>
      </div>

      {/* บอร์ดแสดงความผิดพลาดหรือสำเร็จ */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded text-xs">
          <span>{success}</span>
        </div>
      )}

      {/* 1. ชื่ออุทยานในรูปแบบหัวข้อสีเขียวและช่องแก้ไข */}
      <div className="space-y-3">
        
        <div className="space-y-1 text-center">
          <label className="block text-xs font-bold text-zinc-500" htmlFor="edit-parkName">ชื่ออุทยาน</label>
          <input
            id="edit-parkName"
            type="text"
            value={parkName}
            onChange={(e) => setParkName(e.target.value)}
            className="w-full bg-[#5d6061] text-white text-xs rounded p-2 focus:outline-none text-center font-bold text-[16px]"
          />
        </div>
        
        {/* ช่องแก้ไขคำอธิบาย */}
        <div className="space-y-1">
          <textarea
            id="edit-desc"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#5d6061] text-white text-xs rounded p-4 leading-relaxed focus:outline-none text-center"
          />
        </div>
      </div>

      {/* 2. ส่วนเวลาเปิดทำการ */}
      <div className="text-center space-y-2 max-w-md mx-auto">
        <h3 className="text-sm font-bold text-[#0c592b] text-[14px]">เวลาเปิดทำการ</h3>
        <input
          id="edit-openHours"
          type="text"
          value={openHours}
          onChange={(e) => setOpenHours(e.target.value)}
          className="w-full bg-[#5d6061] text-white text-xs px-3 py-2 rounded text-center focus:outline-none"
        />
      </div>

      {/* 3. ส่วนที่ตั้ง */}
      <div className="text-center space-y-2 max-w-lg mx-auto">
        <h3 className="text-sm font-bold text-[#0c592b] text-[14px]">ที่ตั้ง</h3>
        <input
          id="edit-address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full bg-[#5d6061] text-white text-xs p-3 rounded text-center focus:outline-none leading-relaxed"
        />
      </div>

      {/* 4. ปุ่ม Google Map จำลอง */}
      <div className="text-center">
        <button
          type="button"
          className="px-5 py-1 bg-[#dfdfdf] text-zinc-800 text-[11px] rounded-full font-bold shadow-sm"
        >
          Google Map &gt;
        </button>
      </div>

      {/* 5. ปุ่มบันทึกที่มุมล่างขวา */}
      <div className="flex justify-end pt-4 border-t border-zinc-150">
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-1.5 bg-[#2ebb5e] hover:bg-[#27a853] text-white text-xs font-bold rounded-full transition-colors cursor-pointer text-center"
        >
          {isLoading ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>

    </form>
  );
}
