import ViewVisitStatistics from "./ViewVisitStatistics";

export const metadata = {
  title: "สถิติจำนวนผู้เข้าชม - GreenPass Park Ranger",
  description: "รายงานสถิติจำนวนนักท่องเที่ยวชาวไทยและต่างชาติที่เข้าเยี่ยมชมและสะสมสแตมป์ในอุทยานแห่งชาติ",
};

export default function VisitStatisticsPage() {
  return <ViewVisitStatistics />;
}
