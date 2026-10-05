"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { rangerApi } from "@/service/api";
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
    async function fetchRanger() {
      if (!rangerId) return;
      setIsLoading(true);
      const targetIdLower = String(rangerId).toLowerCase();
      try {
        let found: any = null;

        // 1. Try getRangerByUsername
        try {
          const resUser = await rangerApi.getRangerByUsername(rangerId);
          if (resUser && (resUser.success || resUser.status) && (resUser.result || resUser.data)) {
            found = resUser.result || resUser.data;
          }
        } catch (e) {}

        // 2. Try getAllRangers
        if (!found) {
          try {
            const res = await rangerApi.getAllRangers();
            const rawList = res?.result || res?.data || (Array.isArray(res) ? res : []);
            if (Array.isArray(rawList)) {
              found = rawList.find((r: any) =>
                String(r.username || "").toLowerCase() === targetIdLower ||
                String(r.employeeId || "").toLowerCase() === targetIdLower ||
                String(r.id || "").toLowerCase() === targetIdLower
              );
            }
          } catch (e) {}
        }

        // 3. Try localStorage fallback
        if (!found) {
          const saved = localStorage.getItem("greenpass_rangers");
          if (saved) {
            try {
              const list = JSON.parse(saved);
              found = list.find((r: any) =>
                String(r.username || "").toLowerCase() === targetIdLower ||
                String(r.employeeId || "").toLowerCase() === targetIdLower ||
                String(r.id || "").toLowerCase() === targetIdLower
              );
            } catch (e) {}
          }
        }

        if (found) {
          const fullName = `${found.firstname || found.firstName || ""} ${found.surname || found.lastName || ""}`.trim() || found.username || found.name;
          
          const hasFlags = (
            found.canIssueStamp !== undefined ||
            found.canAnnouncement !== undefined ||
            found.canEditParkDetails !== undefined ||
            found.canProgressReport !== undefined
          );

          let stamp = false;
          let announce = false;
          let edit = false;
          let rep = false;

          if (hasFlags) {
            stamp = Boolean(found.canIssueStamp);
            announce = Boolean(found.canAnnouncement);
            edit = Boolean(found.canEditParkDetails);
            rep = Boolean(found.canProgressReport);
          } else if (Array.isArray(found.roles) && found.roles.length > 0) {
            stamp = found.roles.includes("สแกนแสตมป์");
            announce = found.roles.includes("ประกาศข่าวสาร");
            edit = found.roles.includes("แก้ไขรายละเอียด");
            rep = found.roles.includes("รายงานความคืบหน้าของเหตุการณ์");
          } else {
            try {
              const storedRoles = localStorage.getItem(`greenpass_ranger_roles_${targetIdLower}`);
              if (storedRoles) {
                const parsed: string[] = JSON.parse(storedRoles);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  stamp = parsed.includes("สแกนแสตมป์");
                  announce = parsed.includes("ประกาศข่าวสาร");
                  edit = parsed.includes("แก้ไขรายละเอียด");
                  rep = parsed.includes("รายงานความคืบหน้าของเหตุการณ์");
                }
              }
            } catch (e) {}
          }

          const rObj: Ranger = {
            id: found.username || found.id || rangerId,
            username: found.username || rangerId,
            name: fullName,
            employeeId: (found.username || found.employeeId || rangerId).toUpperCase(),
            canIssueStamp: stamp,
            canAnnouncement: announce,
            canEditParkDetails: edit,
            canProgressReport: rep
          };
          setCurrentRanger(rObj);
          setScanStamp(stamp);
          setAnnounceNews(announce);
          setEditDetail(edit);
          setReportIncident(rep);
        }
      } catch (err) {
        console.error("Failed to load ranger info from database:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRanger();
  }, [rangerId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRanger) return;

    setError("");
    setSuccess("");

    // Alternate Flow 3.1: กรณีที่ผู้ดูแลระบบไม่ได้เลือก Role ระบบจะแสดงข้อความ “กรุณาเลือก Role 1 รายการ”
    if (!scanStamp && !announceNews && !editDetail && !reportIncident) {
      setError("กรุณาเลือก Role 1 รายการ");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    setIsLoading(true);

    const selectedRoles: string[] = [];
    if (scanStamp) selectedRoles.push("สแกนแสตมป์");
    if (announceNews) selectedRoles.push("ประกาศข่าวสาร");
    if (editDetail) selectedRoles.push("แก้ไขรายละเอียด");
    if (reportIncident) selectedRoles.push("รายงานความคืบหน้าของเหตุการณ์");

    try {
      const username = currentRanger.username || currentRanger.employeeId || currentRanger.id;
      if (!username) {
        throw new Error("Username not found");
      }

      // Basic Flow 4 & 5: ระบบรับค่า Role และดำเนินการบันทึกลงฐานข้อมูล
      const rolePayload = {
        canIssueStamp: scanStamp,
        canAnnouncement: announceNews,
        canEditParkDetails: editDetail,
        canProgressReport: reportIncident
      };

      let updateRes: any = null;
      if (typeof (rangerApi as any).setRole === "function") {
        updateRes = await (rangerApi as any).setRole(username, rolePayload);
      } else {
        updateRes = await rangerApi.updateRanger(username, rolePayload);
      }

      if (updateRes && updateRes.success === false) {
        throw new Error(updateRes.message || "Failed to update");
      }

      // Sync with localStorage
      try {
        const savedRangers = localStorage.getItem("greenpass_rangers");
        if (savedRangers) {
          const list = JSON.parse(savedRangers);
          const updatedList = list.map((r: any) => {
            const match =
              String(r.username || "").toLowerCase() === username.toLowerCase() ||
              String(r.employeeId || "").toLowerCase() === username.toLowerCase() ||
              String(r.id || "").toLowerCase() === username.toLowerCase() ||
              String(r.id || "").toLowerCase() === String(rangerId).toLowerCase();
            if (match) {
              return {
                ...r,
                roles: selectedRoles,
                canIssueStamp: scanStamp,
                canAnnouncement: announceNews,
                canEditParkDetails: editDetail,
                canProgressReport: reportIncident
              };
            }
            return r;
          });
          localStorage.setItem("greenpass_rangers", JSON.stringify(updatedList));
        }

        const detailKeys = [
          `greenpass_ranger_detail_${username}`,
          `greenpass_ranger_detail_${username.toLowerCase()}`,
          `greenpass_ranger_detail_${username.toUpperCase()}`,
          `greenpass_ranger_detail_${rangerId}`
        ];
        detailKeys.forEach(k => {
          const raw = localStorage.getItem(k);
          if (raw) {
            try {
              const d = JSON.parse(raw);
              d.roles = selectedRoles;
              d.canIssueStamp = scanStamp;
              d.canAnnouncement = announceNews;
              d.canEditParkDetails = editDetail;
              d.canProgressReport = reportIncident;
              localStorage.setItem(k, JSON.stringify(d));
            } catch (e) {}
          }
        });

        localStorage.setItem(`greenpass_ranger_roles_${username.toLowerCase()}`, JSON.stringify(selectedRoles));
        if (rangerId) {
          localStorage.setItem(`greenpass_ranger_roles_${String(rangerId).toLowerCase()}`, JSON.stringify(selectedRoles));
        }
      } catch (e) {
        console.error("Failed to sync roles to localStorage:", e);
      }

      // Basic Flow 6: ระบบแสดงผลการกำหนดสิทธิ์สำเร็จ
      setSuccess("ตั้งค่าบทบาทและสิทธิ์ของเจ้าหน้าที่เรียบร้อยแล้ว!");
      setTimeout(() => {
        router.push(`/admin/view-park-ranger-detail?id=${username}`);
      }, 1000);
    } catch (err: any) {
      console.error("Failed to update ranger permissions:", err);
      // Alternate Flow 5.1.1: กรณีที่ระบบไม่สามารถบันทึกข้อมูลได้ ระบบจะแสดงข้อความ “ไม่สามารถบันทึกข้อมูลได้กรุณาลองใหม่อีกครั้ง”
      const serverMsg = err?.response?.data?.message || err?.message;
      if (serverMsg && (serverMsg.includes("กรุณาเลือก Role") || serverMsg.includes("Role 1 รายการ"))) {
        setError("กรุณาเลือก Role 1 รายการ");
      } else {
        setError("ไม่สามารถบันทึกข้อมูลได้กรุณาลองใหม่อีกครั้ง");
      }
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentRanger) {
    return (
      <div className="text-center py-14 text-slate-500 font-bold text-xs space-y-3">
        <p>ไม่พบข้อมูล Park Ranger กรุณาลองใหม่อีกครั้ง</p>
        <button
          onClick={() => router.push("/admin/list-park-ranger")}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          กลับหน้ารายชื่อเจ้าหน้าที่
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto font-sans relative py-4 my-2 px-2 sm:px-4">
      
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

          {/* Bottom Error Notification if any */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span>{error}</span>
            </div>
          )}

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

