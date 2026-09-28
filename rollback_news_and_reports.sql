-- ========================================================
-- คำสั่งสำหรับย้อนกลับข้อมูลข่าวและรายงานที่เพิ่มเข้าไป
-- ========================================================
DELETE FROM announcement WHERE announcement_id > 34;
DELETE FROM report WHERE report_id > 53;
SELECT COUNT(*) as remaining_announcements FROM announcement;
SELECT COUNT(*) as remaining_reports FROM report;
