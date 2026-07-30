"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/service/api";

export default function LoginAdminPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 font-sans p-4 relative overflow-hidden">

      {/* Title */}
      <h1 className="text-xl font-bold text-zinc-900 mb-5 tracking-wide text-center">
        GreenPass Thailand Admin
      </h1>

      {/* Centered White Card Box (ตามรูปที่ 3.3.84 ในเอกสาร) */}
      <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.06)] relative z-10 text-zinc-800">

        {/* Subtitle */}
        <h2 className="text-base font-bold text-zinc-800 mb-6 tracking-tight">
          Login Account Admin
        </h2>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Username */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-zinc-500" htmlFor="admin-username">
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white text-zinc-800 text-xs border border-zinc-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-zinc-400 font-medium"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-zinc-500" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white text-zinc-800 text-xs border border-zinc-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-zinc-400 font-medium"
              disabled={isLoading}
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs text-zinc-650 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-500">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-emerald-500 rounded border-zinc-300"
              />
              <span>Remember for 30 day</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-[#00ff3c] hover:bg-[#00e035] bg-[#00f339] disabled:bg-emerald-800 text-black text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm mt-6 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>

      {/* Footer back to ranger portal link */}
      <button
        onClick={() => router.push("/ranger/login-park-ranger")}
        className="mt-6 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-all underline cursor-pointer"
      >
        เข้าสู่ระบบฝั่งเจ้าหน้าที่อุทยาน (Park Ranger) &gt;
      </button>
    </div>
  );
}
