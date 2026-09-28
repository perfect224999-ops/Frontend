-- ========================================================
-- คำสั่งสำหรับย้อนกลับข้อมูล (Rollback) ที่เพิ่มเข้าไป
-- สามารถคัดลอกคำสั่งด้านล่างนี้ไปรันใน MySQL Workbench ได้ทันทีครับ
-- ========================================================

-- 1. ลบข้อมูลการแสตมป์ทั้งหมดที่เพิ่มในรอบนี้ (stamp_id > 16)
DELETE FROM `defaultdb`.`stamp` WHERE stamp_id > 16;

-- 2. ลบข้อมูล User คนไทยที่สร้างเพิ่มสำหรับรอบนี้ (th_user_101 ถึง th_user_180)
DELETE FROM `defaultdb`.`user` WHERE username BETWEEN 'th_user_101' AND 'th_user_180';

-- ตรวจสอบข้อมูลคงเหลือหลังย้อนกลับ
SELECT COUNT(*) AS remaining_stamps FROM `defaultdb`.`stamp`;
SELECT COUNT(*) AS remaining_users FROM `defaultdb`.`user`;
