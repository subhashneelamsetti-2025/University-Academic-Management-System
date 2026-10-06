# University Academic Management System

A production-ready full-stack academic administration portal built on top of a normalized MySQL relational database. The platform enables university administrators, faculty, and academic departments to manage student enrollments, course catalogs, section scheduling, departmental hierarchies, and institutional analytics in real time.

---

## 📌 Project Overview

- **Project Title:** University Academic Management System
- **Database Name:** `UniversityDB_Demo`
- **Target RDBMS:** MySQL 8.0 (InnoDB Storage Engine)
- **Application Type:** Single-Page Application (SPA) with Express.js REST API
- **Default Application URL:** `http://localhost:5001`
- **Primary Concepts:** Relational Data Modeling, Foreign Key Referential Integrity, Secondary Index Optimization, Parameterized Queries, Connection Pooling, Responsive Dark-Mode UI, and Institutional Analytics.

---

## 🎯 Objectives

1. **Academic Operational Efficiency:** Centralize student records, course offerings, classroom assignments, and grade evaluations into a unified administrative interface.
2. **Relational Data Integrity:** Enforce strict foreign key constraints, composite uniqueness rules, and check constraints to guarantee database consistency without anomalies.
3. **Real-Time Data Visualization:** Deliver instant institutional metrics and departmental distribution analytics directly from live database tables.
4. **Performance & Security:** Use connection pooling, parameterized SQL queries to prevent SQL injection, and keep all sensitive credentials isolated within environment files.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Client Browser (Desktop/Mobile)              │
│  - Vanilla ES6+ SPA Controller (web/frontend/js/app.js)     │
│  - Modern Glassmorphic Dark UI (web/frontend/css/style.css)  │
│  - Semantic HTML5 Shell (web/frontend/index.html)           │
└──────────────────────────────▲──────────────────────────────┘
                               │
                      HTTP / JSON (REST API)
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Node.js / Express Server                 │
│  - Server & Static SPA Host: web/backend/src/server.js       │
│  - Route Modules: /api/dashboard, /api/students, etc.       │
│  - Input Validation & Duplicate Key Conflict Detection      │
└──────────────────────────────▲──────────────────────────────┘
                               │
                   mysql2/promise Pool Connection
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  MySQL 8.0 (UniversityDB_Demo)              │
│  - InnoDB Relational Tables (Department, Student, Staff...) │
│  - Foreign Keys, Cascade Protections, Unique Constraints     │
│  - Secondary Indexes & Real-time Analytical Aggregations    │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Backend
- **Runtime:** Node.js (v16+)
- **Framework:** Express.js 4.x
- **Database Driver:** `mysql2` with promise-based connection pooling
- **Configuration & Security:** `dotenv` for environment variable isolation, `cors` middleware

### Frontend
- **Structure:** Semantic HTML5
- **Styling:** Custom CSS3 design system (HSL color tokens, CSS custom properties, glassmorphism, responsive grid)
- **Logic:** Vanilla JavaScript (ES6+), custom client-side router, debounced multi-field search, modal controllers, and Blob-based CSV generation
- **Typography:** Google Fonts (*Inter* & *Plus Jakarta Sans*)
- **Dependencies:** 100% zero external client-side JavaScript libraries (lightweight and lightning fast)

### Database Layer
- **RDBMS:** MySQL 8.0
- **Storage Engine:** InnoDB (ACID compliant)
- **Indexing:** B-Tree secondary indexes on all foreign keys and search paths

---

## 🗄️ Database Structure & Entities

The relational schema consists of **6 core entities**:

| Entity | Primary Key | Foreign Keys & Constraints | Description | Initial Count |
| :--- | :--- | :--- | :--- | :---: |
| **`Department`** | `department_id` | Unique `department_name` | Academic divisions within the university | 3 |
| **`Student`** | `student_id` | `major_id` → `Department(department_id)`<br>Unique `email` | Registered students with assigned majors | 6 |
| **`Staff`** | `staff_id` | `department_id` → `Department(department_id)`<br>Unique `email` | Faculty and academic instructors | 3 |
| **`Course`** | `course_code` | `department_id` → `Department(department_id)`<br>`credits > 0` | Course offerings with credit intensity | 4 |
| **`Section`** | `section_id` | `course_code` → `Course(course_code)`<br>`staff_id` → `Staff(staff_id)` | Scheduled term offerings, rooms, and assigned faculty | 4 |
| **`Enrollment`** | `enrollment_id` | `student_id` → `Student(student_id)`<br>`course_code` → `Course(course_code)`<br>`UNIQUE(student_id, course_code)`<br>`CHECK(marks >= 0 AND marks <= 100)` | Course registrations, numeric marks (0–100), and letter grades | 5 |

### Secondary Indexing Strategy
Query response times are optimized through dedicated indexes:
- `idx_student_major` on `Student(major_id)`
- `idx_staff_dept` on `Staff(department_id)`
- `idx_course_dept` on `Course(department_id)`
- `idx_section_course` on `Section(course_code)`
- `idx_section_staff` on `Section(staff_id)`
- `idx_enroll_student` on `Enrollment(student_id)`
- `idx_enroll_course` on `Enrollment(course_code)`

---

## ✨ Features & Modules

### 1. Dashboard Overview
- Live metric cards: Total Students, Departments, Faculty, Courses, Term Sections, and Enrollments.
- Visual breakdown of students across academic departments.
- Course enrollment demand highlights.
- Live database connectivity probe with server latency indicator.

### 2. Students Module
- Complete CRUD operations (Create, Read, Update, Delete).
- Multi-attribute real-time search across student ID, name, email, and major.
- Prepopulated department dropdown for assigning majors.
- Unique email conflict detection.

### 3. Departments Module
- Complete CRUD operations with office location tracking.
- Real-time departmental metrics displaying associated student, faculty, and course counts.
- Foreign key deletion protection preventing accidental deletion of populated departments.

### 4. Staff Module
- Complete CRUD operations for academic faculty and administration.
- Tracking academic rank/role (Professor, Associate Professor, Assistant Professor).
- Teaching load dependency checks before deletion.

### 5. Courses Module
- Complete CRUD operations with credit value validation (`credits > 0`).
- Automated calculation of active term sections and enrolled student headcounts per course.
- Departmental classification.

### 6. Sections Module
- Management of term-based course allocations, section codes, and classrooms.
- Real-time calculation of enrollment capacity based on live course enrollments.
- Filter controls by Term (e.g., `2026-Fall`) and Course offering.

### 7. Enrollments Module
- Student course registration, numeric marks entry/editing (0–100), and grade assignment (`A`, `A-`, `B+`, `B`, etc.).
- Strict enforcement of the database `UNIQUE(student_id, course_code)` constraint with user-friendly conflict messaging: *"This student is already enrolled in this course."*
- Dropdown filters for Course and Grade standing.

### 8. Institutional Reports & Analytics
- **Visual Progress Charts:**
  1. *Students by Department:* Departmental population and proportional share.
  2. *Course Enrollment Demand:* Registration counts per course.
  3. *Academic Grade Distribution:* Color-coded breakdown of student performance.
  4. *Faculty Allocation & Roster:* Faculty headcounts and academic rank distribution.
- **Detailed Statistical Tables:** Five modular report tables with departmental credit intensity and section scheduling rosters.
- **Client-Side CSV Export:** Instant, zero-latency export of any report dataset to CSV via browser Blob generation without server-side file creation.

---

## 📂 Repository Structure

```
DBMS/
├── docs/                                   # Project documentation, presentations & diagrams
│   ├── DBMS Review 1.pptx
│   ├── Documentation of DBMS part 1  university.docx
│   ├── ER diagram.png
│   ├── Output - 1.jpeg ... Output - 4.jpeg
│   ├── Relational DATABASE Schema.jpeg
│   └── University_Academic_Management_DBMS_Project_Documentation (3).docx
├── sql/                                    # Database scripts
│   ├── schema.sql                          # DDL: Tables, primary keys, foreign keys, constraints
│   ├── migration_add_marks.sql             # Migration: Add marks column with CHECK(0-100) constraint
│   ├── indexes.sql                         # Performance: Secondary B-tree indexes
│   ├── seed.sql                            # DML: Baseline sample records
│   ├── queries.sql                         # Analytical joins, aggregations, subqueries & views
│   └── University_Academic_Management_System_CODE.sql  # Master all-in-one script
├── web/                                    # Full-Stack Web Application
│   ├── backend/
│   │   ├── src/
│   │   │   ├── db.js                       # MySQL connection pool & health diagnostics
│   │   │   ├── server.js                   # Express application setup & static hosting
│   │   │   └── routes/                     # REST API modular routers (38 endpoints)
│   │   │       ├── dashboard.js            # Summary statistics API
│   │   │       ├── departments.js          # Departments CRUD API
│   │   │       ├── students.js             # Students CRUD API
│   │   │       ├── staff.js                # Staff CRUD API
│   │   │       ├── courses.js              # Courses CRUD API
│   │   │       ├── sections.js             # Sections CRUD API
│   │   │       ├── enrollments.js          # Enrollments CRUD API
│   │   │       └── reports.js              # Read-only Analytics & Reports API
│   │   ├── .env.example                    # Environment variable template
│   │   ├── .gitignore                      # Local gitignore (.env, node_modules/)
│   │   ├── package.json                    # Backend dependencies
│   │   └── package-lock.json
│   └── frontend/
│       ├── css/
│       │   └── style.css                   # Custom responsive dark-mode styling
│       ├── js/
│       │   └── app.js                      # SPA router, controllers, search, modals & export
│       └── index.html                      # Single-Page Application container
├── README.md                               # Project documentation
└── .gitignore                              # Root repository ignore rules
```

---

## 🚀 Local Setup Guide

### 1. Prerequisites
- **Node.js:** v16.x or newer
- **npm:** v8.x or newer
- **MySQL Server:** v8.0 or newer
- **MySQL Workbench** or MySQL CLI

### 2. Database Initialization
Open MySQL Workbench or your terminal and execute the SQL scripts to create and seed the database:

```bash
# Option A: Execute modular scripts sequentially
mysql -u root -p < sql/schema.sql
mysql -u root -p < sql/indexes.sql
mysql -u root -p < sql/seed.sql

# Option B: Execute the master all-in-one script
mysql -u root -p < sql/University_Academic_Management_System_CODE.sql
```

Verify that the `UniversityDB_Demo` database exists and contains the 6 tables.

### 3. Backend Setup & Dependencies
Navigate to the backend directory and install the required npm packages:

```bash
cd web/backend
npm install
```

---

## ⚙️ Environment Configuration (`.env`)

In the `web/backend` directory, create a local `.env` file by copying the provided `.env.example`:

```bash
cp .env.example .env
```

Open `.env` in your text editor and configure your local MySQL credentials:

```ini
# Server Configuration
PORT=5001

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=UniversityDB_Demo
```

> **Security Note:** The `.env` file contains sensitive credentials and is strictly excluded from version control via `.gitignore`. Never commit or push `.env` to GitHub.

---

## 🖥️ Running the Application

### 1. Start the Backend Server
From the `web/backend` directory, run:

```bash
npm start
# or: node src/server.js
```

You should see confirmation output:
```
====================================================
 University Academic Management System - Backend
 Server running on: http://localhost:5001
 Health Check URL:  http://localhost:5001/api/health
 Target Database:   UniversityDB_Demo on localhost:3306
====================================================
```

### 2. Verify Backend & Database Health
Open your browser or run curl to test the health probe:
```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "backend": "connected",
  "database": "connected",
  "databaseName": "universitydb_demo",
  "latencyMs": 1,
  "timestamp": "2026-10-05T09:59:29.074Z"
}
```
*(Note: Depending on host operating system and MySQL `lower_case_table_names` settings, `databaseName` may be returned in lowercase as `"universitydb_demo"`).*

### 3. Access the Web Application
Open your web browser and navigate to:
```
http://localhost:5001
```

The Express server automatically serves the frontend SPA. All 8 modules are immediately accessible through the top navigation bar.

---

## 📡 REST API Reference (38 Endpoints)

All 38 API endpoints use parameterized SQL queries, handle database errors gracefully, and return standard JSON structures.

### 1. System & Health (1 Endpoint)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend server and MySQL connectivity/latency probe |

### 2. Dashboard Analytics (1 Endpoint)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Aggregated counts, departmental student distribution, course enrollment highlights |

### 3. Departments Module (5 Endpoints)
| Method | Endpoint | Query / Body Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | `?search=` | List all departments with student, staff, and course counts |
| `GET` | `/api/departments/:id` | — | Retrieve single department details |
| `POST` | `/api/departments` | `{ department_id, department_name, office }` | Create new academic department |
| `PUT` | `/api/departments/:id` | `{ department_name, office }` | Update department details |
| `DELETE` | `/api/departments/:id` | — | Delete department (with child dependency protection) |

### 4. Students Module (5 Endpoints)
| Method | Endpoint | Query / Body Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/students` | `?search=` | List all students with joined major department |
| `GET` | `/api/students/:id` | — | Retrieve single student details |
| `POST` | `/api/students` | `{ student_id, student_name, email, major_id }` | Create student (with email uniqueness check) |
| `PUT` | `/api/students/:id` | `{ student_name, email, major_id }` | Update student details (with conflict detection) |
| `DELETE` | `/api/students/:id` | — | Delete student (with enrollment protection) |

### 5. Faculty & Staff Module (5 Endpoints)
| Method | Endpoint | Query / Body Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/staff` | `?search=` | List faculty with department details |
| `GET` | `/api/staff/:id` | — | Retrieve single staff member details |
| `POST` | `/api/staff` | `{ staff_id, staff_name, role, department_id, email }` | Create staff member (with email uniqueness check) |
| `PUT` | `/api/staff/:id` | `{ staff_name, role, department_id, email }` | Update staff member details |
| `DELETE` | `/api/staff/:id` | — | Delete staff member (with section protection) |

### 6. Courses Module (5 Endpoints)
| Method | Endpoint | Query / Body Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | `?search=` | List courses with section and enrollment counts |
| `GET` | `/api/courses/:code` | — | Retrieve single course details |
| `POST` | `/api/courses` | `{ course_code, title, credits, department_id }` | Create course offering (`credits > 0`) |
| `PUT` | `/api/courses/:code` | `{ title, credits, department_id }` | Update course offering |
| `DELETE` | `/api/courses/:code` | — | Delete course (with dependency protection) |

### 7. Term Sections Module (5 Endpoints)
| Method | Endpoint | Query / Body Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/sections` | `?search=&term=&course_code=` | List sections with instructor and live enrollment count |
| `GET` | `/api/sections/:id` | — | Retrieve single section details |
| `POST` | `/api/sections` | `{ section_id, course_code, staff_id, term, section_number, room }` | Create section (with duplicate PK and FK checks) |
| `PUT` | `/api/sections/:id` | `{ course_code, staff_id, term, section_number, room }` | Update section schedule, room, or instructor |
| `DELETE` | `/api/sections/:id` | — | Delete section |

### 8. Course Enrollments Module (5 Endpoints)
| Method | Endpoint | Query / Body Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/enrollments` | `?search=&course_code=&grade=` | List enrollments with joined student and course |
| `GET` | `/api/enrollments/:id` | — | Retrieve single enrollment record details |
| `POST` | `/api/enrollments` | `{ enrollment_id, student_id, course_code, marks, grade, enroll_date }` | Register student (enforces `UNIQUE(student_id, course_code)` & marks 0–100) |
| `PUT` | `/api/enrollments/:id` | `{ student_id, course_code, marks, grade, enroll_date }` | Update enrollment record, marks (0–100), or letter grade |
| `DELETE` | `/api/enrollments/:id` | — | Delete enrollment record |

### 9. Institutional Reports & Analytics (6 Endpoints — Read-Only)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/reports/overview` | Unified summary of all metrics, charts, and report tables |
| `GET` | `/api/reports/student-statistics` | Student headcounts and percentage distribution by major |
| `GET` | `/api/reports/course-statistics` | Departmental course counts, total credits, and averages |
| `GET` | `/api/reports/enrollment-statistics` | Course enrollment demand and academic grade distribution |
| `GET` | `/api/reports/staff-statistics` | Faculty headcounts by department and academic rank |
| `GET` | `/api/reports/section-statistics` | Term section scheduling and room utilization |

---

## 🔒 Security & Best Practices

1. **SQL Injection Prevention:** Every database interaction uses parameterized prepared statements (`?` placeholders) through `mysql2`. No inline string concatenation is used in SQL queries.
2. **Environment Isolation:** Local database passwords and configuration reside exclusively in `web/backend/.env`, which is strictly ignored by Git. Only the sanitized `.env.example` template is tracked.
3. **Data Integrity Checks:** The frontend and backend validate required fields, data types, and primary key duplicates prior to executing SQL commands.
4. **Referential Integrity Protection:** Foreign key constraints prevent orphaned records. Destructive delete actions require explicit confirmation in the UI and are blocked if related child records exist.
5. **Safe CSV Generation:** Report CSV exports are generated purely client-side via JavaScript Blobs, ensuring no server-side temp files are created and no database credentials can leak.

---

## 🐙 Git Workflow & GitHub Usage

### Clone Repository
```bash
git clone git@github.com:subhashneelamsetti-2025/University-Academic-Management-System.git
cd University-Academic-Management-System
```

### Git Maintenance Rules
- Never remove `.env` from `.gitignore`.
- Check status prior to committing:
  ```bash
  git status
  ```
- Push updates to the main branch using SSH:
  ```bash
  git push origin main
  ```

---

## 📄 License & Attribution

Developed as an academic database management system and university administration web platform. Built using MySQL 8.0, Node.js, Express, and Vanilla JavaScript.
