const { execSync } = require('child_process');

const mysqlExe = 'C:\\Program Files\\MySQL\\MySQL Workbench 8.0 CE\\mysql.exe';

console.log('🔄 กำลังทำการย้อนกลับข้อมูล Stamp และ User ที่เพิ่มเข้าไป...');

const sql = `
DELETE FROM stamp WHERE stamp_id > 16;
DELETE FROM user WHERE username BETWEEN 'th_user_101' AND 'th_user_180';
SELECT COUNT(*) as remaining_stamps FROM stamp;
SELECT COUNT(*) as remaining_users FROM user;
`;

try {
  const result = execSync(
    `"${mysqlExe}" --default-character-set=utf8mb4 -h mysql-3bd3fe00-greenpass.j.aivencloud.com -P 15385 -u avnadmin -pAVNS_3CvLujz1jfLyk4rL8r8 defaultdb`,
    { input: sql, encoding: 'utf8' }
  );
  console.log(result);
  console.log('✅ ย้อนกลับข้อมูลเดิมเรียบร้อยแล้วครับ! (stamp กลับไปเป็น 16 รายการเท่าเดิม)');
} catch (err) {
  console.error('❌ เกิดข้อผิดพลาดในการย้อนกลับข้อมูล:', err.message);
}
