"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, parkApi } from "@/service/api";
import {
  Trees,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight
} from "lucide-react";

export default function LoginParkRanger() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // Validate script according to SRS Page 32 (Username 4-50 alpha-num, Password 8-32 alpha-num-special)
    const isUsernameValid = /^[a-zA-Z0-9]{4,50}$/.test(cleanUsername);
    const isPasswordValid = /^[a-zA-Z0-9!#_.]{8,32}$/.test(cleanPassword);

    if (!cleanUsername || !cleanPassword || !isUsernameValid || !isPasswordValid) {
      setError("กรุณากรอกข้อมูลให้ถูกต้อง");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.rangerLogin({ username: cleanUsername, password: cleanPassword });
      console.log("Ranger Login Response:", response);

      const isSuccess = response && (response.success === true || response.status === true || response.status === 200 || response.result);

      if (isSuccess) {
        const rangerData = response.result || response.data;
        localStorage.setItem("ranger_username", cleanUsername);
        const rangerFullName = rangerData?.firstname 
          ? `${rangerData.firstname} ${rangerData.surname || ''}`.trim() 
          : cleanUsername;
        localStorage.setItem("ranger_name", rangerFullName);
        localStorage.removeItem("greenpass_park_saved_data");

        const targetParkId = rangerData?.park?.parkId || rangerData?.parkId;
        if (targetParkId) {
          localStorage.setItem("ranger_park_id", String(targetParkId));
          const PARK_NAMES: Record<number, string> = {
            1: "อุทยานแห่งชาติเขาใหญ่",
            2: "อุทยานแห่งชาติแก่งกระจาน",
            3: "อุทยานแห่งชาติเอราวัณ",
            4: "อุทยานแห่งชาติดอยสุเทพ-ปุย",
            5: "อุทยานแห่งชาติดอยอินทนนท์"
          };
          const pName = rangerData?.park?.name || PARK_NAMES[Number(targetParkId)] || "อุทยานแห่งชาติ";
          localStorage.setItem("ranger_park_name", pName);

          try {
            const pRes = await parkApi.getParkById(Number(targetParkId));
            const freshName = pRes?.result?.name || pRes?.data?.name;
            if (freshName) {
              localStorage.setItem("ranger_park_name", freshName);
            }
          } catch (e) {}
        } else if (cleanUsername === "ranger03") {
          localStorage.setItem("ranger_park_id", "2");
          localStorage.setItem("ranger_park_name", "อุทยานแห่งชาติแก่งกระจาน");
        } else if (cleanUsername === "ranger04") {
          localStorage.setItem("ranger_park_id", "3");
          localStorage.setItem("ranger_park_name", "อุทยานแห่งชาติเอราวัณ");
        } else if (cleanUsername === "ranger05") {
          localStorage.setItem("ranger_park_id", "4");
          localStorage.setItem("ranger_park_name", "อุทยานแห่งชาติดอยสุเทพ-ปุย");
        } else if (cleanUsername === "ranger06") {
          localStorage.setItem("ranger_park_id", "5");
          localStorage.setItem("ranger_park_name", "อุทยานแห่งชาติดอยอินทนนท์");
        } else {
          localStorage.setItem("ranger_park_id", "1");
          localStorage.setItem("ranger_park_name", "อุทยานแห่งชาติเขาใหญ่");
        }

        // Save roles and permissions for active session
        let userRoles: string[] = [];
        const savedRoles = localStorage.getItem(`greenpass_ranger_roles_${cleanUsername}`);
        if (savedRoles) {
          try {
            const parsed = JSON.parse(savedRoles);
            if (Array.isArray(parsed)) userRoles = parsed;
          } catch (e) {}
        } else if (rangerData) {
          if (rangerData.canIssueStamp) userRoles.push("สแกนแสตมป์");
          if (rangerData.canAnnouncement) userRoles.push("ประกาศข่าวสาร");
          if (rangerData.canEditParkDetails) userRoles.push("แก้ไขรายละเอียด");
          if (rangerData.canProgressReport) userRoles.push("รายงานความคืบหน้าของเหตุการณ์");
        }

        localStorage.setItem("ranger_roles", JSON.stringify(userRoles));
        router.push("/ranger/view-park-detail");
      } else {
        setError("ไม่พบข้อมูลผู้ใช้");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Ranger Login Error:", err);
      setError("ไม่พบข้อมูลผู้ใช้");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 font-sans p-4 relative overflow-hidden">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Top Header Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-500/20 mb-2 border border-emerald-400/30">
            <Trees className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            GreenPass <span className="text-emerald-400 font-semibold">Ranger</span>
          </h1>
          <p className="text-xs text-emerald-200/70">
            ระบบปฏิบัติการสำหรับเจ้าหน้าที่อุทยานแห่งชาติ
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/40 text-slate-800 space-y-6">
          
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              เข้าสู่ระบบสำหรับ Park Ranger
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              กรุณากรอก Username และ Password เพื่อเข้าใช้งาน
            </p>
          </div>

          {/* Error Notification Alert */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600" htmlFor="ranger-username">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="ranger-username"
                  type="text"
                  placeholder="กรอกชื่อผู้ใช้ เช่น ranger01"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-200 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white font-medium transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600" htmlFor="ranger-password">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="ranger-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-200 rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white font-medium transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 accent-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span>จดจำการเข้าสู่ระบบ 30 วัน</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 disabled:opacity-70 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:-translate-y-0.5 mt-4 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบ Park Ranger</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

        </div>

        {/* Link back to Admin Login */}
        <div className="text-center">
          <button
            onClick={() => router.push("/admin/login-admin")}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-200 font-semibold transition-all hover:underline cursor-pointer group"
          >
            <span>เข้าสู่ระบบฝั่งผู้ดูแลระบบ (Admin)</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

    </div>
  );
}
