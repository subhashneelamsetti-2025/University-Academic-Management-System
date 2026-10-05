-- ============================================================
-- UNIVERSITY ACADEMIC MANAGEMENT SYSTEM
-- MySQL 8.0 | Retrieval Queries & Views (DQL)
-- ============================================================
USE UniversityDB_Demo;

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
