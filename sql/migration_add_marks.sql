-- ============================================================
-- UNIVERSITY ACADEMIC MANAGEMENT SYSTEM
-- Migration: Add `marks` column to Enrollment table
-- ============================================================
USE UniversityDB_Demo;

-- Add marks column (INT, nullable, valid range: 0 to 100)
ALTER TABLE Enrollment 
ADD COLUMN marks INT NULL 
CHECK (marks >= 0 AND marks <= 100);
