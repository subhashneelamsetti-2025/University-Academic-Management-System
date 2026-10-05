-- ============================================================
-- UNIVERSITY ACADEMIC MANAGEMENT SYSTEM
-- MySQL 8.0 | Database implementation and SQL queries
-- ============================================================
-- Note:
-- This script creates/uses UniversityDB_Demo.
-- It does not drop existing databases or tables.
-- Run the setup and INSERT sections only once in this database.
-- ============================================================

-- 1. DATABASE CREATION
CREATE DATABASE IF NOT EXISTS UniversityDB_Demo;
USE UniversityDB_Demo;

SELECT DATABASE();

-- 2. TABLE CREATION (DDL)
CREATE TABLE Department (
    department_id INT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    office VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE Student (
    student_id INT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    major_id INT,
    CONSTRAINT fk_student_dept
        FOREIGN KEY (major_id)
        REFERENCES Department(department_id)
) ENGINE=InnoDB;

CREATE TABLE Staff (
    staff_id INT PRIMARY KEY,
    staff_name VARCHAR(100) NOT NULL,
    role VARCHAR(50),
    department_id INT,
    email VARCHAR(100) UNIQUE,
    CONSTRAINT fk_staff_dept
        FOREIGN KEY (department_id)
        REFERENCES Department(department_id)
) ENGINE=InnoDB;

CREATE TABLE Course (
    course_code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    credits INT NOT NULL CHECK (credits > 0),
    department_id INT,
    CONSTRAINT fk_course_dept
        FOREIGN KEY (department_id)
        REFERENCES Department(department_id)
) ENGINE=InnoDB;

CREATE TABLE Section (
    section_id INT PRIMARY KEY,
    course_code VARCHAR(10) NOT NULL,
    staff_id INT,
    term VARCHAR(20),
    section_number VARCHAR(10),
    room VARCHAR(20),
    CONSTRAINT fk_section_course
        FOREIGN KEY (course_code)
        REFERENCES Course(course_code),
    CONSTRAINT fk_section_staff
        FOREIGN KEY (staff_id)
        REFERENCES Staff(staff_id)
) ENGINE=InnoDB;

CREATE TABLE Enrollment (
    enrollment_id INT PRIMARY KEY,
    student_id INT NOT NULL,
    course_code VARCHAR(10) NOT NULL,
    grade VARCHAR(2),
    enroll_date DATE,
    CONSTRAINT fk_enroll_student
        FOREIGN KEY (student_id)
        REFERENCES Student(student_id),
    CONSTRAINT fk_enroll_course
        FOREIGN KEY (course_code)
        REFERENCES Course(course_code),
    CONSTRAINT uq_student_course
        UNIQUE (student_id, course_code)
) ENGINE=InnoDB;

SHOW TABLES;

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

-- 4. INSERT SAMPLE RECORDS (DML)
-- Execute this section only once to avoid duplicate-key errors.

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

-- 5. BASIC RETRIEVAL QUERIES (DQL)
SELECT * FROM Department;

SELECT * FROM Student;

SELECT * FROM Staff;

SELECT * FROM Course;

SELECT * FROM Section;

SELECT * FROM Enrollment;

SELECT student_id, student_name, email
FROM Student
WHERE major_id = 1;

SELECT course_code, title, credits
FROM Course
ORDER BY title ASC;

-- 6. JOIN QUERIES
-- Inner join: students with department names
SELECT s.student_id, s.student_name, d.department_name
FROM Student s
INNER JOIN Department d
    ON s.major_id = d.department_id;

-- Equi join: staff with department names
SELECT st.staff_id, st.staff_name, st.role,
       d.department_name
FROM Staff st, Department d
WHERE st.department_id = d.department_id;

-- Natural join: courses with departments
SELECT department_name, course_code, title, credits
FROM Course
NATURAL JOIN Department;

-- Left outer join: all departments and their students
SELECT d.department_name, s.student_id, s.student_name
FROM Department d
LEFT JOIN Student s
    ON d.department_id = s.major_id;

-- Right outer join: all courses and their departments
SELECT c.course_code, c.title, d.department_name
FROM Department d
RIGHT JOIN Course c
    ON d.department_id = c.department_id;

-- Full outer join equivalent in MySQL 8.0
SELECT d.department_id, d.department_name,
       st.staff_id, st.staff_name
FROM Department d
LEFT JOIN Staff st
    ON d.department_id = st.department_id

UNION ALL

SELECT d.department_id, d.department_name,
       st.staff_id, st.staff_name
FROM Department d
RIGHT JOIN Staff st
    ON d.department_id = st.department_id
WHERE d.department_id IS NULL;

-- 7. AGGREGATE FUNCTIONS, GROUP BY AND HAVING
-- Students per department
SELECT d.department_name,
       COUNT(s.student_id) AS total_students
FROM Department d
LEFT JOIN Student s
    ON d.department_id = s.major_id
GROUP BY d.department_id, d.department_name;

-- Enrolments per course
SELECT c.course_code, c.title,
       COUNT(e.enrollment_id) AS total_enrolled
FROM Course c
LEFT JOIN Enrollment e
    ON c.course_code = e.course_code
GROUP BY c.course_code, c.title;

-- Sections taught by each staff member
SELECT st.staff_name,
       COUNT(sec.section_id) AS sections_taught
FROM Staff st
LEFT JOIN Section sec
    ON st.staff_id = sec.staff_id
GROUP BY st.staff_id, st.staff_name;

-- Total credits registered by each student
SELECT s.student_id, s.student_name,
       SUM(c.credits) AS total_credits
FROM Student s
JOIN Enrollment e
    ON s.student_id = e.student_id
JOIN Course c
    ON e.course_code = c.course_code
GROUP BY s.student_id, s.student_name;

-- Departments offering more than one course
SELECT d.department_name,
       COUNT(c.course_code) AS total_courses
FROM Department d
JOIN Course c
    ON d.department_id = c.department_id
GROUP BY d.department_id, d.department_name
HAVING COUNT(c.course_code) > 1;

-- Average course credits
SELECT AVG(credits) AS average_credits
FROM Course;

-- 8. NESTED AND CORRELATED SUBQUERIES
-- Students who received grade A
SELECT student_id, student_name
FROM Student
WHERE student_id IN (
    SELECT student_id
    FROM Enrollment
    WHERE grade = 'A'
);

-- Students not enrolled in any course
SELECT s.student_id, s.student_name
FROM Student s
WHERE NOT EXISTS (
    SELECT 1
    FROM Enrollment e
    WHERE e.student_id = s.student_id
);

-- Courses with no enrolments
SELECT c.course_code, c.title
FROM Course c
WHERE NOT EXISTS (
    SELECT 1
    FROM Enrollment e
    WHERE e.course_code = c.course_code
);

-- Courses with enrolments above average
SELECT c.course_code, c.title,
       COUNT(e.enrollment_id) AS total_enrolled
FROM Course c
LEFT JOIN Enrollment e
    ON c.course_code = e.course_code
GROUP BY c.course_code, c.title
HAVING COUNT(e.enrollment_id) > (
    SELECT AVG(course_total)
    FROM (
        SELECT COUNT(*) AS course_total
        FROM Enrollment
        GROUP BY course_code
    ) AS avg_data
);

-- Students enrolled in the same courses as student 101
SELECT DISTINCT s.student_id, s.student_name
FROM Student s
JOIN Enrollment e
    ON s.student_id = e.student_id
WHERE e.course_code IN (
    SELECT course_code
    FROM Enrollment
    WHERE student_id = 101
)
AND s.student_id <> 101;

-- Students enrolled in at least two courses
SELECT s.student_id, s.student_name
FROM Student s
WHERE (
    SELECT COUNT(*)
    FROM Enrollment e
    WHERE e.student_id = s.student_id
) >= 2;

-- 9. VIEWS
CREATE VIEW StudentBasicView AS
SELECT student_id, student_name, email, major_id
FROM Student;

SELECT * FROM StudentBasicView;

CREATE VIEW DepartmentStudentCount AS
SELECT d.department_name,
       COUNT(s.student_id) AS total_students
FROM Department d
LEFT JOIN Student s
    ON d.department_id = s.major_id
GROUP BY d.department_id, d.department_name;

SELECT * FROM DepartmentStudentCount;

-- ============================================================
-- END OF SCRIPT
-- ============================================================
