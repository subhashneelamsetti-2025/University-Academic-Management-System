-- ============================================================
-- UNIVERSITY ACADEMIC MANAGEMENT SYSTEM
-- MySQL 8.0 | Indexes Creation (DDL)
-- ============================================================
USE UniversityDB_Demo;

-- 3. INDEX CREATION
CREATE INDEX idx_student_major
ON Student(major_id);

CREATE INDEX idx_staff_dept
ON Staff(department_id);

CREATE INDEX idx_course_dept
ON Course(department_id);

CREATE INDEX idx_section_course
ON Section(course_code);

CREATE INDEX idx_section_staff
ON Section(staff_id);

CREATE INDEX idx_enroll_student
ON Enrollment(student_id);

CREATE INDEX idx_enroll_course
ON Enrollment(course_code);

SHOW INDEX FROM Student;
SHOW INDEX FROM Enrollment;
