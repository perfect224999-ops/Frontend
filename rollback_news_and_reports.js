const { execSync } = require('child_process');
const mysqlExe = 'C:\\Program Files\\MySQL\\MySQL Workbench 8.0 CE\\mysql.exe';
console.log('🔄 กำลังทำการย้อนกลับข้อมูลข่าว (Announcement) และรายงาน (Report) ที่เพิ่มเข้าไป...');

const sql = `
DELETE FROM announcement WHERE announcement_id > 34;
DELETE FROM report WHERE report_id > 53;
SELECT COUNT(*) as remaining_announcements FROM announcement;
SELECT COUNT(*) as remaining_reports FROM report;
`;

try {
  const result = execSync(
    `"${mysqlExe}" --default-character-set=utf8mb4 -h mysql-3bd3fe00-greenpass.j.aivencloud.com -P 15385 -u avnadmin -pAVNS_3CvLujz1jfLyk4rL8r8 defaultdb`,
    { input: sql, encoding: 'utf8' }
  );
  console.log(result);
  console.log('✅ ย้อนกลับข้อมูลเดิมเรียบร้อยแล้วครับ! (ข้อมูลกลับสู่สถานะก่อนเพิ่มทันที)');
} catch (err) {
  console.error('❌ เกิดข้อผิดพลาดในการย้อนกลับข้อมูล:', err.message);
}
