import React from "react";

export const metadata = {
  title: "GreenPass Thailand - Admin Portal",
  description: "ระบบจัดการสำหรับผู้ดูแลระบบ GreenPass Thailand",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-zinc-50">{children}</div>;
}
