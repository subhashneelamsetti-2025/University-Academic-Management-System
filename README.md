# University Academic Management System (DBMS)

A robust relational database management system designed for universities to manage academic operations, student enrollments, faculty allocations, course schedules, and departmental hierarchies.

---

## 📌 Project Overview

- **Project Title:** University Academic Management System
- **Database Name:** `UniversityDB_Demo`
- **Target RDBMS:** MySQL 8.0 (InnoDB Engine)
- **Primary Concepts:** Relational Data Modeling, Foreign Key Constraints, Secondary Indexing, Analytical Queries (Joins, Aggregations, Subqueries), and Views.

---

## 📂 Repository Structure

```
DBMS/
├── docs/
│   ├── DBMS Review 1.pptx
│   ├── Documentation of DBMS part 1  university.docx
│   ├── ER diagram.png
│   ├── Output - 1.jpeg
│   ├── Output - 2.jpeg
│   ├── Output - 3.jpeg
│   ├── Output - 4.jpeg
│   ├── Relational DATABASE Schema.jpeg
│   └── University_Academic_Management_DBMS_Project_Documentation (3).docx
├── sql/
│   ├── schema.sql
│   ├── indexes.sql
│   ├── seed.sql
│   ├── queries.sql
│   └── University_Academic_Management_System_CODE.sql
├── README.md
└── .gitignore
```

---

## 🗄️ Database Schema & Entities

The system consists of **6 core entities**:

1. **`Department`**
   - Stores academic departments within the university.
   - **Columns:** `department_id` (PK), `department_name`, `office`.

2. **`Student`**
   - Stores student personal and academic profile.
   - **Columns:** `student_id` (PK), `student_name`, `email` (UNIQUE), `major_id` (FK → `Department.department_id`).

3. **`Staff`**
   - Stores faculty and teaching staff details.
   - **Columns:** `staff_id` (PK), `staff_name`, `role`, `department_id` (FK → `Department.department_id`), `email` (UNIQUE).

4. **`Course`**
   - Stores course offerings and credit values.
   - **Columns:** `course_code` (PK), `title`, `credits` (CHECK > 0), `department_id` (FK → `Department.department_id`).

5. **`Section`**
   - Represents course offerings for specific terms, assigned faculty, and classrooms.
   - **Columns:** `section_id` (PK), `course_code` (FK → `Course.course_code`), `staff_id` (FK → `Staff.staff_id`), `term`, `section_number`, `room`.

6. **`Enrollment`**
   - Tracks course registrations and student grades.
   - **Columns:** `enrollment_id` (PK), `student_id` (FK → `Student.student_id`), `course_code` (FK → `Course.course_code`), `grade`, `enroll_date`.
   - **Constraint:** Unique composite constraint on `(student_id, course_code)` to prevent duplicate course enrollments.

---

## ⚡ Secondary Indexes

To optimize query retrieval performance, indexes are established on foreign keys and frequently searched columns:
- `idx_student_major` on `Student(major_id)`
- `idx_staff_dept` on `Staff(department_id)`
- `idx_course_dept` on `Course(department_id)`
- `idx_section_course` on `Section(course_code)`
- `idx_section_staff` on `Section(staff_id)`
- `idx_enroll_student` on `Enrollment(student_id)`
- `idx_enroll_course` on `Enrollment(course_code)`

---

## 🚀 Getting Started & Execution Order

You can execute the modular SQL scripts sequentially in MySQL 8.0:

### Option A: Modular Execution
1. **Schema & Tables:**
   ```sql
   source sql/schema.sql;
   ```
2. **Indexes:**
   ```sql
   source sql/indexes.sql;
   ```
3. **Sample Data (Seed):**
   ```sql
   source sql/seed.sql;
   ```
4. **Queries & Views:**
   ```sql
   source sql/queries.sql;
   ```

### Option B: All-in-One Execution
Execute the full master script directly:
```sql
source sql/University_Academic_Management_System_CODE.sql;
```

---

## 📊 SQL Capabilities Demonstrated

- **DDL:** Database and table creation with primary keys, foreign keys with referential integrity, unique constraints, and check constraints.
- **DML:** Sample insertions across all tables representing departments, faculty, students, courses, sections, and enrollments.
- **DQL:**
  - Filtering and sorting.
  - Joins: `INNER JOIN`, equi-joins, `NATURAL JOIN`, `LEFT OUTER JOIN`, `RIGHT OUTER JOIN`, and full outer join simulation via `UNION ALL`.
  - Aggregations: `COUNT`, `SUM`, `AVG`, `GROUP BY`, and `HAVING` filters.
  - Subqueries: Nested subqueries with `IN`, correlated subqueries with `NOT EXISTS`.
- **Views:**
  - `StudentBasicView`: Abstraction of student basic info.
  - `DepartmentStudentCount`: Aggregated department-level student enrolment count.

---

## 📄 Documentation & Assets

All project deliverables, presentation decks, diagrams, and execution output screenshots are cataloged in the `docs/` folder:
- **ER Diagram:** `docs/ER diagram.png`
- **Relational Schema:** `docs/Relational DATABASE Schema.jpeg`
- **Execution Outputs:** `docs/Output - 1.jpeg` through `Output - 4.jpeg`
- **Reports & Presentation:** `docs/DBMS Review 1.pptx`, `docs/University_Academic_Management_DBMS_Project_Documentation (3).docx`
