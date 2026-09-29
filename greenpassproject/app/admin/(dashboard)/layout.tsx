"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Trees, 
  Home, 
  Gift, 
  BarChart3, 
  Users, 
  UserPlus, 
  LogOut, 
  Award
} from "lucide-react";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUsername, setAdminUsername] = useState("Admin");

  useEffect(() => {
    // Basic auth check
    const username = localStorage.getItem("admin_username");
    if (!username) {
      router.push("/admin/login-admin");
    } else {
      setAdminUsername(username);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_username");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("greenpass_emergency_alert");
    router.push("/admin/login-admin");
  };

  const menuItems = [
    { name: "เพิ่มของรางวัล", href: "/admin/add-reward", icon: Gift },
    { name: "แสดงของรางวัล", href: "/admin/view-reward-admin", icon: Award },
    { name: "รายงานสรุป", href: "/admin/view-all-statistics", icon: BarChart3 },
    { name: "หน้ารายชื่อเจ้าหน้าที่", href: "/admin/list-park-ranger", icon: Users },
    { name: "เพิ่มเจ้าหน้าที่อุทยาน", href: "/admin/add-park-ranger", icon: UserPlus }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      
      {/* Modern Executive Header Navbar */}
      <header className="sticky top-0 w-full bg-gradient-to-r from-[#042410] via-[#0b4822] to-[#042410] text-white shadow-xl shadow-emerald-950/40 relative z-50 border-b border-emerald-500/25 backdrop-blur-md">
        <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Tag */}
          <Link href="/admin/add-reward" className="flex items-center gap-3 group transition-transform duration-200 active:scale-95">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/50 ring-1 ring-emerald-300/40 group-hover:shadow-emerald-400/30 transition-all duration-300">
              <Trees className="w-5 h-5 text-white transform group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
                  GreenPass
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 tracking-wider">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-emerald-300/80 font-medium tracking-wider uppercase -mt-0.5">
                Thailand Management
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-2.5 sm:gap-3.5 bg-black/20 p-1.5 rounded-2xl border border-white/10 shadow-inner">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href === "/admin/list-park-ranger" && pathname.startsWith("/admin/view-park-ranger-detail")) ||
                (item.href === "/admin/list-park-ranger" && pathname.startsWith("/admin/edit-park-ranger-profile")) ||
                (item.href === "/admin/list-park-ranger" && pathname.startsWith("/admin/set-role")) ||
                (item.href === "/admin/view-reward-admin" && pathname.startsWith("/admin/edit-reward")) ||
                (item.href === "/admin/view-all-statistics" && pathname.startsWith("/admin/view-all-statistics"));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 relative ${
                    isActive 
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-900/60 ring-1 ring-emerald-300/40" 
                      : "text-emerald-100/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-emerald-300/80"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Profile & Logout Button */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/50 flex items-center justify-center text-xs font-bold text-emerald-200 border border-emerald-400/30">
                {adminUsername ? adminUsername.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="text-xs font-bold text-emerald-100">{adminUsername}</span>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/40 border border-red-400/30 hover:border-red-300 transition-all duration-200 cursor-pointer active:scale-95"
              title="ออกจากระบบ"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Wrapper with Nature Background */}
      <div 
        className="flex-1 w-full bg-cover bg-center bg-no-repeat bg-fixed flex flex-col justify-start p-4 md:p-8"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1920&q=80')" 
        }}
      >
        {/* Centered Children Container */}
        <div className="w-full flex justify-center py-4 flex-1 items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
