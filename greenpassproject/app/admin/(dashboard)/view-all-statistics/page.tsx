import ViewAllStatisticesPage from "./ViewAllStatisticesPage";

export const metadata = {
  title: "รายงานสถิติภาพรวมระบบ - GreenPass Admin",
  description: "ตรวจดูรายงานจำนวนผู้เข้าชม ยอดสะสมแสตมป์ และสถิติการใช้งานทั้งระบบ",
};

export default function Page() {
  return <ViewAllStatisticesPage />;
}
