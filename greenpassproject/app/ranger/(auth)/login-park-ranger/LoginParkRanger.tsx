"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/service/api";

export default function LoginParkRanger() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // กฎเกณฑ์ตามเอกสารความต้องการของระบบ หน้า 31-32
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
      const response = await authApi.rangerLogin({ username, password });
      if (response && response.success) {
        // บันทึกชื่อผู้ใช้เจ้าหน้าที่ใน localStorage
        localStorage.setItem("ranger_username", username);
        // ไปยังหน้า View Park Detail
        router.push("/ranger/view-park-detail");
      } else {
        setError(response.message || "เข้าสู่ระบบไม่สำเร็จ");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("ชื่อผู้ใช้งานหรือรหัสผ่านเจ้าหน้าที่ไม่ถูกต้อง หรือไม่พบข้อมูลผู้ใช้");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 font-sans p-4">

      {/* ชื่อนอกกรอบ GreenPass Thailand */}
      <h1 className="text-xl font-bold text-zinc-900 mb-4 tracking-tight">
        GreenPass Thailand
      </h1>

      <div className="w-full max-w-sm bg-white border border-zinc-200/80 rounded-lg p-6 shadow-sm">

        {/* หัวข้อ Login Account Park Ranger */}
        <h2 className="text-sm font-bold text-zinc-900 mb-6">
          Login Account Park Ranger
        </h2>

        {/* แถบแจ้งข้อความล้มเหลว */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Username */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-zinc-300 rounded text-xs text-zinc-950 focus:outline-none focus:border-zinc-400"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-zinc-300 rounded text-xs text-zinc-950 focus:outline-none focus:border-zinc-400"
            />
          </div>

          {/* Remember me */}
          <div className="flex items-center space-x-2 pt-1 pb-3">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 border-zinc-300 rounded cursor-pointer"
            />
            <label htmlFor="remember" className="text-[10px] font-medium text-zinc-500 cursor-pointer select-none">
              Remember for 30 day
            </label>
          </div>

          {/* ปุ่มสีเขียวสว่างตรงตามรูปภาพ */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-[#00ff40] hover:bg-[#00e039] disabled:bg-zinc-200 text-zinc-900 font-bold rounded text-xs transition-colors cursor-pointer text-center"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

        </form>

      </div>

    </div>
  );
}
