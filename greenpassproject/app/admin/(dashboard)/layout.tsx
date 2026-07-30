"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
    router.push("/admin/login-admin");
  };

  const menuItems = [
    { name: "หน้าแรก", href: "/admin/main-admin" },
    { name: "เพิ่มของรางวัล", href: "/admin/add-reward" },
    { name: "แสดงของรางวัล", href: "/admin/view-reward-admin" },
    { name: "รายงานสรุป", href: "/admin/view-all-statistics" },
    { name: "หน้ารายชื่อเจ้าหน้าที่", href: "/admin/list-park-ranger" },
    { name: "เพิ่มเจ้าหน้าที่อุทยาน", href: "/admin/add-park-ranger" }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      
      {/* Green Header Navbar (ตามรูปที่ 3.3.87 ในเอกสาร) */}
      <nav className="w-full bg-[#0e5a2f] text-white shadow-md relative z-40 py-3.5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/main-admin" className="font-bold text-base tracking-wide hover:opacity-90">
              GreenPass Thailand
            </Link>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold">
            {menuItems.map((item) => {
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
                  className={`transition-colors hover:text-emerald-200 py-1 ${
                    isActive ? "text-emerald-300 font-bold border-b-2 border-emerald-300" : "text-white/90"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            
            <button 
              onClick={handleLogout}
              className="ml-4 px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace Wrapper with Nature Background (ตามรูปโครงการ) */}
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
