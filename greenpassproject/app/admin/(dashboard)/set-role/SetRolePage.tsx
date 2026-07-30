"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Ranger {
  id: string;
  name: string;
  roles?: string[];
}

const DEFAULT_RANGERS: Ranger[] = [
  { id: "01", name: "สมชาย ใจดี", roles: ["สแกนแสตมป์", "ประกาศข่าวสาร"] },
  { id: "04", name: "จอนนี่ จิ้มเอม", roles: ["สแกนแสตมป์"] }
];

function SetRoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rangerId = searchParams.get("id");

  const [rangers, setRangers] = useState<Ranger[]>([]);
  const [currentRanger, setCurrentRanger] = useState<Ranger | null>(null);

  // Checkboxes
  const [scanStamp, setScanStamp] = useState(false);
  const [announceNews, setAnnounceNews] = useState(false);
  const [editDetail, setEditDetail] = useState(false);
  const [reportIncident, setReportIncident] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("greenpass_rangers");
    let list = DEFAULT_RANGERS;
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    setRangers(list);
    const found = list.find((r) => r.id === rangerId) || list[0];
    if (found) {
      setCurrentRanger(found);
      const roles = found.roles || [];
      setScanStamp(roles.includes("สแกนแสตมป์"));
      setAnnounceNews(roles.includes("ประกาศข่าวสาร"));
      setEditDetail(roles.includes("แก้ไขรายละเอียด"));
      setReportIncident(roles.includes("รายงานความคืบหน้าของเหตุการณ์"));
    }
  }, [rangerId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRanger) return;

    setError("");
    setSuccess("");
    setIsLoading(true);

    const selectedRoles: string[] = [];
    if (scanStamp) selectedRoles.push("สแกนแสตมป์");
    if (announceNews) selectedRoles.push("ประกาศข่าวสาร");
    if (editDetail) selectedRoles.push("แก้ไขรายละเอียด");
    if (reportIncident) selectedRoles.push("รายงานความคืบหน้าของเหตุการณ์");

    setTimeout(() => {
      setIsLoading(false);
      try {
        const updated = rangers.map((r) => {
          if (r.id === currentRanger.id) {
            return {
              ...r,
              roles: selectedRoles
            };
          }
          return r;
        });

        localStorage.setItem("greenpass_rangers", JSON.stringify(updated));
        setSuccess("ตั้งค่าบทบาทเจ้าหน้าที่เรียบร้อยแล้ว");

        setTimeout(() => {
          router.push(`/admin/view-park-ranger-detail?id=${currentRanger.id}`);
        }, 1000);

      } catch (err) {
        setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    }, 800);
  };

  if (!currentRanger) {
    return (
      <div className="text-center py-12 text-zinc-400 font-bold text-xs">
        ไม่พบข้อมูลบัญชีผู้ใช้งานเจ้าหน้าที่อุทยาน
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs mx-auto bg-[#0b0303]/95 border border-[#300f0f]/30 rounded-2xl p-6 shadow-2xl relative z-10 text-white font-sans text-[10px] my-6">
      
      {/* Notifications */}
      {error && (
        <div className="mb-3 p-2 bg-red-950/60 border border-red-800 text-red-200 rounded text-center font-bold">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-200 rounded text-center font-bold">
          {success}
        </div>
      )}

      {/* Form (ตามรูปที่ 3.3.96 ในเอกสาร) */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="text-center font-bold text-xs pb-1 mb-2 text-white border-b border-white/10">
          เซตบทบาทเจ้าหน้าที่อุทยาน
        </div>

        <div className="space-y-3 px-1">
          <span className="font-bold text-[#5ac87f] block text-[11px] mb-1">
            บทบาท
          </span>

          <label className="flex items-center gap-2.5 cursor-pointer select-none font-bold text-zinc-300">
            <input
              type="checkbox"
              checked={scanStamp}
              onChange={(e) => setScanStamp(e.target.checked)}
              className="accent-emerald-500 rounded border-zinc-700/60 w-3.5 h-3.5"
            />
            <span>สแกนแสตมป์</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none font-bold text-zinc-300">
            <input
              type="checkbox"
              checked={announceNews}
              onChange={(e) => setAnnounceNews(e.target.checked)}
              className="accent-emerald-500 rounded border-zinc-700/60 w-3.5 h-3.5"
            />
            <span>ประกาศข่าวสาร</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none font-bold text-zinc-300">
            <input
              type="checkbox"
              checked={editDetail}
              onChange={(e) => setEditDetail(e.target.checked)}
              className="accent-emerald-500 rounded border-zinc-700/60 w-3.5 h-3.5"
            />
            <span>แก้ไขรายละเอียด</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none font-bold text-zinc-300">
            <input
              type="checkbox"
              checked={reportIncident}
              onChange={(e) => setReportIncident(e.target.checked)}
              className="accent-emerald-500 rounded border-zinc-700/60 w-3.5 h-3.5"
            />
            <span>รายงานความคืบหน้าของเหตุการณ์</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => router.push(`/admin/view-park-ranger-detail?id=${currentRanger.id}`)}
            className="px-5 py-1 border border-[#5ac87f] text-[#5ac87f] hover:bg-[#5ac87f]/10 text-[9px] font-bold rounded cursor-pointer transition-colors"
          >
            ย้อนกลับ
          </button>
          <button
            type="submit"
            className="px-5 py-1 bg-[#5ac87f] hover:bg-[#4cb570] text-black text-[9px] font-bold rounded cursor-pointer transition-colors flex items-center gap-1"
            disabled={isLoading}
          >
            {isLoading && <span className="w-2.5 h-2.5 border border-black border-t-transparent rounded-full animate-spin" />}
            ยืนยัน
          </button>
        </div>

      </form>
    </div>
  );
}

export default function SetRolePage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12 text-xs font-bold text-zinc-400">
        กำลังโหลดการตั้งค่าสิทธิ์...
      </div>
    }>
      <SetRoleContent />
    </Suspense>
  );
}
