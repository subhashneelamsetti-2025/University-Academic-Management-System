-- ============================================================
-- UNIVERSITY ACADEMIC MANAGEMENT SYSTEM
-- MySQL 8.0 | Database Schema Creation (DDL)
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
    marks INT NULL CHECK (marks >= 0 AND marks <= 100),
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
