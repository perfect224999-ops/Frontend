"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/service/api";
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Check
} from "lucide-react";

export default function LoginAdminPage() {
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

    const usernameRegex = /^[a-zA-Z0-9]+$/;

    if (!username) {
      setError("ชื่อผู้ใช้ต้องไม่เป็นค่าว่าง");
      return;
    }
    if (username.length < 4 || username.length > 50) {
      setError("ชื่อผู้ใช้ต้องมีความยาว 4 - 50 ตัวอักษร");
      return;
    }
    if (username.includes(" ")) {
      setError("ชื่อผู้ใช้ต้องไม่มีเว้นวรรคหรือช่องว่าง");
      return;
    }
    if (!usernameRegex.test(username)) {
      setError("ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลขเท่านั้น");
      return;
    }

    const passwordRegex = /^[a-zA-Z0-9!#_.]+$/;

    if (!password) {
      setError("รหัสผ่านต้องไม่เป็นค่าว่าง");
      return;
    }
    if (password.length < 8 || password.length > 32) {
      setError("รหัสผ่านต้องมีความยาว 8 - 32 ตัวอักษร");
      return;
    }
    if (password.includes(" ")) {
      setError("รหัสผ่านต้องไม่มีเว้นวรรคหรือช่องว่าง");
      return;
    }
    if (!passwordRegex.test(password)) {
      setError("รหัสผ่านต้องเป็นอักษรภาษาอังกฤษ ตัวเลข หรืออักขระพิเศษ !#_. เท่านั้น");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.adminLogin({ username, password });
      if (response && response.success) {
        // Save Admin session
        localStorage.setItem("admin_username", username);
        localStorage.setItem("admin_role", "SUPER_ADMIN");
        router.push("/admin/main-admin");
      } else {
        setError(response.message || "เข้าสู่ระบบไม่สำเร็จ");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("ชื่อผู้ใช้งานหรือรหัสผ่านแอดมินไม่ถูกต้อง หรือไม่พบข้อมูลผู้ใช้");
      }
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
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            GreenPass <span className="text-emerald-400 font-semibold">Admin</span>
          </h1>
          <p className="text-xs text-emerald-200/70">
            ระบบจัดการสำหรับผู้ดูแลระบบอุทยานแห่งชาติ
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/40 text-slate-800 space-y-6">
          
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              เข้าสู่ระบบสำหรับ Admin
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
              <label className="block text-xs font-semibold text-slate-600" htmlFor="admin-username">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-username"
                  type="text"
                  placeholder="กรอกชื่อผู้ใช้ เช่น admin01"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs border border-slate-200 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white font-medium transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600" htmlFor="admin-password">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
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
                  <span>เข้าสู่ระบบ Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

        </div>

        {/* Link back to Park Ranger Login */}
        <div className="text-center">
          <button
            onClick={() => router.push("/ranger/login-park-ranger")}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-200 font-semibold transition-all hover:underline cursor-pointer group"
          >
            <span>เข้าสู่ระบบสำหรับเจ้าหน้าที่อุทยาน (Park Ranger)</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

    </div>
  );
}

