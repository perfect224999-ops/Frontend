"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { rangerApi } from "../../../../service/api";
import { 
  ShieldCheck, 
  Check, 
  ArrowLeft, 
  QrCode, 
  Megaphone, 
  Edit3, 
  FileText, 
  User 
} from "lucide-react";

interface Ranger {
  id: string;
  name: string;
  username?: string;
  employeeId?: string;
  roles?: string[];
  canIssueStamp?: boolean;
  canAnnouncement?: boolean;
  canEditParkDetails?: boolean;
  canProgressReport?: boolean;
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
    const found = list.find((r: any) => 
      String(r.id) === String(rangerId) || 
      String(r.username) === String(rangerId) ||
      `PR${r.id}` === rangerId
    ) || list[0];
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

    const updatePermissionsAsync = async () => {
      try {
        const username = currentRanger.username || currentRanger.id;
        if (username && username.startsWith("ranger")) {
          await rangerApi.updateRanger(username, {
            canIssueStamp: scanStamp,
            canAnnouncement: announceNews,
            canEditParkDetails: editDetail,
            canProgressReport: reportIncident
          });
        }
      } catch (err) {
        console.warn("Could not sync permissions with Spring Boot backend DB:", err);
      }

      setIsLoading(false);
      try {
        const updatedObj = {
          ...currentRanger,
          roles: selectedRoles,
          canIssueStamp: scanStamp,
          canAnnouncement: announceNews,
          canEditParkDetails: editDetail,
          canProgressReport: reportIncident
        };

        const updated = rangers.map((r) => {
          if (r.id === currentRanger.id || (r.username && r.username === currentRanger.username)) {
            return updatedObj;
          }
          return r;
        });

        localStorage.setItem("greenpass_rangers", JSON.stringify(updated));
        localStorage.setItem(`greenpass_ranger_detail_${currentRanger.id}`, JSON.stringify(updatedObj));
        if (currentRanger.username) {
          localStorage.setItem(`greenpass_ranger_roles_${currentRanger.username}`, JSON.stringify(selectedRoles));
          localStorage.setItem(`greenpass_ranger_roles_${currentRanger.id}`, JSON.stringify(selectedRoles));
        }

        // If the logged in ranger is this user, update active session
        const activeRanger = localStorage.getItem("ranger_username");
        if (activeRanger && (activeRanger === currentRanger.username || activeRanger === currentRanger.id)) {
          localStorage.setItem("ranger_roles", JSON.stringify(selectedRoles));
        }

        setSuccess("ตั้งค่าบทบาทและสิทธิ์ของเจ้าหน้าที่เรียบร้อยแล้ว!");

        setTimeout(() => {
          router.push(`/admin/view-park-ranger-detail?id=${currentRanger.id}`);
        }, 1000);

      } catch (err) {
        setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    };

    updatePermissionsAsync();
  };

  if (!currentRanger) {
    return (
      <div className="text-center py-14 text-slate-400 font-bold text-xs">
        ไม่พบข้อมูลบัญชีผู้ใช้งานเจ้าหน้าที่อุทยาน
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl xl:max-w-6xl mx-auto font-sans relative py-4 my-2 px-2 sm:px-4">
      
      {/* Container หลัก สีขาว */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl shadow-slate-200/50 text-slate-800">
        
        {/* Header Banner */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-slate-200/80">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              เซตบทบาทและสิทธิ์เจ้าหน้าที่
            </h1>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              เจ้าหน้าที่: <span className="text-slate-900 font-bold">{currentRanger.name}</span>
            </p>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}
        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600" />
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="space-y-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-2">
              การกำหนดสิทธิ์ในการเข้าถึงฟังก์ชั่นระบบ
            </span>

            <div className="space-y-2.5">
              
              {/* สแกนแสตมป์ */}
              <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                scanStamp 
                  ? "bg-emerald-50 border-emerald-200 text-slate-900 shadow-sm" 
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/60"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${scanStamp ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">สแกนแสตมป์</div>
                    <div className="text-[11px] text-slate-500 font-medium">สิทธิ์สแกน QR Code เพื่อให้ตราประทับสะสมแต้มแก่นักท่องเที่ยว</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={scanStamp}
                  onChange={(e) => setScanStamp(e.target.checked)}
                  className="accent-emerald-600 rounded border-slate-300 w-4 h-4 cursor-pointer ml-3 shrink-0"
                />
              </label>

              {/* ประกาศข่าวสาร */}
              <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                announceNews 
                  ? "bg-emerald-50 border-emerald-200 text-slate-900 shadow-sm" 
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/60"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${announceNews ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">ประกาศข่าวสาร</div>
                    <div className="text-[11px] text-slate-500 font-medium">สิทธิ์สร้างและจัดการประกาศข่าวสารประจำอุทยาน</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={announceNews}
                  onChange={(e) => setAnnounceNews(e.target.checked)}
                  className="accent-emerald-600 rounded border-slate-300 w-4 h-4 cursor-pointer ml-3 shrink-0"
                />
              </label>

              {/* แก้ไขรายละเอียด */}
              <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                editDetail 
                  ? "bg-emerald-50 border-emerald-200 text-slate-900 shadow-sm" 
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/60"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${editDetail ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">แก้ไขรายละเอียด</div>
                    <div className="text-[11px] text-slate-500 font-medium">สิทธิ์ในการแก้ไขข้อมูลรายละเอียดและรูปภาพของอุทยาน</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={editDetail}
                  onChange={(e) => setEditDetail(e.target.checked)}
                  className="accent-emerald-600 rounded border-slate-300 w-4 h-4 cursor-pointer ml-3 shrink-0"
                />
              </label>

              {/* รายงานความคืบหน้าของเหตุการณ์ */}
              <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                reportIncident 
                  ? "bg-emerald-50 border-emerald-200 text-slate-900 shadow-sm" 
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/60"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${reportIncident ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">รายงานความคืบหน้าของเหตุการณ์</div>
                    <div className="text-[11px] text-slate-500 font-medium">สิทธิ์ในการบันทึกและอัปเดตรายงานสถานการณ์เหตุการณ์ภัยพิบัติ</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={reportIncident}
                  onChange={(e) => setReportIncident(e.target.checked)}
                  className="accent-emerald-600 rounded border-slate-300 w-4 h-4 cursor-pointer ml-3 shrink-0"
                />
              </label>

            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.push(`/admin/view-park-ranger-detail?id=${currentRanger.id}`)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              ย้อนกลับ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4 stroke-[3]" />
              )}
              บันทึกการตั้งค่า
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default function SetRolePage() {
  return (
    <Suspense fallback={
      <div className="text-center py-14 text-xs font-bold text-slate-400">
        กำลังโหลดการตั้งค่าสิทธิ์...
      </div>
    }>
      <SetRoleContent />
    </Suspense>
  );
}

