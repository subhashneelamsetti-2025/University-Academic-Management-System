-- ============================================================
-- UNIVERSITY ACADEMIC MANAGEMENT SYSTEM
-- MySQL 8.0 | Sample Records (DML)
-- ============================================================
-- Execute this section only once to avoid duplicate-key errors.
USE UniversityDB_Demo;

-- 4. INSERT SAMPLE RECORDS (DML)
INSERT INTO Department
(department_id, department_name, office)
VALUES
(1, 'Artificial Intelligence and Machine Learning', 'Block A - 201'),
(2, 'Computer Science', 'Block B - 105'),
(3, 'Mathematics', 'Block C - 110');

INSERT INTO Student
(student_id, student_name, email, major_id)
VALUES
(101, 'Student One', 'student1@example.edu', 1),
(102, 'Student Two', 'student2@example.edu', 1),
(103, 'Student Three', 'student3@example.edu', 2),
(104, 'Student Four', 'student4@example.edu', 2),
(105, 'Student Five', 'student5@example.edu', 3);

INSERT INTO Staff
(staff_id, staff_name, role, department_id, email)
VALUES
(201, 'Staff One', 'Professor', 1, 'staff1@example.edu'),
(202, 'Staff Two', 'Assistant Professor', 2, 'staff2@example.edu'),
(203, 'Staff Three', 'Associate Professor', 3, 'staff3@example.edu');

INSERT INTO Course
(course_code, title, credits, department_id)
VALUES
('AI101', 'Introduction to AI', 4, 1),
('DB201', 'Database Management Systems', 4, 2),
('CS301', 'Data Structures', 3, 2),
('MA101', 'Discrete Mathematics', 3, 3);

INSERT INTO Section
(section_id, course_code, staff_id, term, section_number, room)
VALUES
(1, 'AI101', 201, '2026-Fall', 'A', 'R-101'),
(2, 'DB201', 202, '2026-Fall', 'A', 'R-102'),
(3, 'CS301', 202, '2026-Fall', 'B', 'R-103'),
(4, 'MA101', 203, '2026-Fall', 'A', 'R-104');

INSERT INTO Enrollment
(enrollment_id, student_id, course_code, grade, enroll_date)
VALUES
(1, 101, 'AI101', 'A', '2026-07-15'),
(2, 101, 'DB201', 'B+', '2026-07-15'),
(3, 102, 'DB201', 'A', '2026-07-16'),
(4, 103, 'CS301', 'B', '2026-07-16'),
(5, 104, 'DB201', NULL, '2026-07-17'),
(6, 105, 'MA101', 'A-', '2026-07-17');

SELECT 'Department' AS table_name, COUNT(*) AS total FROM Department
UNION ALL
SELECT 'Student', COUNT(*) FROM Student
UNION ALL
SELECT 'Staff', COUNT(*) FROM Staff
UNION ALL
SELECT 'Course', COUNT(*) FROM Course
UNION ALL
SELECT 'Section', COUNT(*) FROM Section
UNION ALL
SELECT 'Enrollment', COUNT(*) FROM Enrollment;
