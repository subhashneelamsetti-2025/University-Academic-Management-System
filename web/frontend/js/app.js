/**
 * UNIVERSITY ACADEMIC MANAGEMENT SYSTEM
 * Frontend Application Controller - Phase 4 (Complete 7 Core Academic Modules)
 */

// Determine API Base URL (supports direct file:/// and hosted environments)
const getApiBaseUrl = () => {
  if (window.location.protocol === 'file:') {
    return 'http://localhost:5001';
  }
  return window.location.origin.includes('5001') ? '' : 'http://localhost:5001';
};

const API_BASE = getApiBaseUrl();

// Global Application State
const state = {
  departments: [],
  students: [],
  staff: [],
  courses: [],
  sections: [],
  enrollments: [],

  // Search queries
  currentStudentSearch: '',
  currentDeptSearch: '',
  currentStaffSearch: '',
  currentCourseSearch: '',
  currentSectionSearch: '',
  currentEnrollmentSearch: '',

  // Section Filters
  sectionFilterTerm: '',
  sectionFilterCourse: '',

  // Enrollment Filters
  enrollmentFilterCourse: '',
  enrollmentFilterGrade: '',

  activeView: 'dashboard',

  // Active editing records
  editingStudentId: null,
  editingDeptId: null,
  editingStaffId: null,
  editingCourseCode: null,
  editingSectionId: null,
  editingEnrollmentId: null,

  // Active delete entity target
  deletingTarget: null // { type: 'student'|'department'|'staff'|'course'|'section'|'enrollment', id, name, details }
};

// ============================================================
// DOM Elements
// ============================================================
// Header
const headerStatusDot = document.getElementById('headerStatusDot');
const headerStatusText = document.getElementById('headerStatusText');
const refreshStatsBtn = document.getElementById('refreshStatsBtn');

// Navigation Items
const navDashboard = document.getElementById('navDashboard');
const navStudents = document.getElementById('navStudents');
const navDepartments = document.getElementById('navDepartments');
const navStaff = document.getElementById('navStaff');
const navCourses = document.getElementById('navCourses');
const navSections = document.getElementById('navSections');
const navEnrollments = document.getElementById('navEnrollments');
const navReports = document.getElementById('navReports');

// View Sections
const dashboardView = document.getElementById('dashboardView');
const studentsView = document.getElementById('studentsView');
const departmentsView = document.getElementById('departmentsView');
const staffView = document.getElementById('staffView');
const coursesView = document.getElementById('coursesView');
const sectionsView = document.getElementById('sectionsView');
const enrollmentsView = document.getElementById('enrollmentsView');
const reportsView = document.getElementById('reportsView');
const btnGoToStudents = document.getElementById('btnGoToStudents');

// Dashboard Counters & Lists
const statStudents = document.getElementById('statStudents');
const statDepartments = document.getElementById('statDepartments');
const statStaff = document.getElementById('statStaff');
const statCourses = document.getElementById('statCourses');
const statSections = document.getElementById('statSections');
const statEnrollments = document.getElementById('statEnrollments');
const deptDistributionList = document.getElementById('deptDistributionList');
const courseEnrollmentsList = document.getElementById('courseEnrollmentsList');
const recentStudentsTableBody = document.getElementById('recentStudentsTableBody');

// Students DOM
const studentSearchInput = document.getElementById('studentSearchInput');
const clearStudentSearchBtn = document.getElementById('clearStudentSearchBtn');
const studentCountBadge = document.getElementById('studentCountBadge');
const studentsTableBody = document.getElementById('studentsTableBody');
const openAddStudentBtn = document.getElementById('openAddStudentBtn');

// Departments DOM
const deptSearchInput = document.getElementById('deptSearchInput');
const clearDeptSearchBtn = document.getElementById('clearDeptSearchBtn');
const deptCountBadge = document.getElementById('deptCountBadge');
const departmentsTableBody = document.getElementById('departmentsTableBody');
const openAddDeptBtn = document.getElementById('openAddDeptBtn');

// Staff DOM
const staffSearchInput = document.getElementById('staffSearchInput');
const clearStaffSearchBtn = document.getElementById('clearStaffSearchBtn');
const staffCountBadge = document.getElementById('staffCountBadge');
const staffTableBody = document.getElementById('staffTableBody');
const openAddStaffBtn = document.getElementById('openAddStaffBtn');

// Courses DOM
const courseSearchInput = document.getElementById('courseSearchInput');
const clearCourseSearchBtn = document.getElementById('clearCourseSearchBtn');
const courseCountBadge = document.getElementById('courseCountBadge');
const coursesTableBody = document.getElementById('coursesTableBody');
const openAddCourseBtn = document.getElementById('openAddCourseBtn');

// Sections DOM (Phase 4)
const sectionSearchInput = document.getElementById('sectionSearchInput');
const clearSectionSearchBtn = document.getElementById('clearSectionSearchBtn');
const filterSectionTerm = document.getElementById('filterSectionTerm');
const filterSectionCourse = document.getElementById('filterSectionCourse');
const sectionCountBadge = document.getElementById('sectionCountBadge');
const sectionsTableBody = document.getElementById('sectionsTableBody');
const openAddSectionBtn = document.getElementById('openAddSectionBtn');

// Enrollments DOM (Phase 4)
const enrollmentSearchInput = document.getElementById('enrollmentSearchInput');
const clearEnrollmentSearchBtn = document.getElementById('clearEnrollmentSearchBtn');
const filterEnrollmentCourse = document.getElementById('filterEnrollmentCourse');
const filterEnrollmentGrade = document.getElementById('filterEnrollmentGrade');
const enrollmentCountBadge = document.getElementById('enrollmentCountBadge');
const enrollmentsTableBody = document.getElementById('enrollmentsTableBody');
const openAddEnrollmentBtn = document.getElementById('openAddEnrollmentBtn');

// Modals
// 1. Student Modal
const studentModal = document.getElementById('studentModal');
const studentModalTitle = document.getElementById('studentModalTitle');
const studentModalSubtitle = document.getElementById('studentModalSubtitle');
const studentForm = document.getElementById('studentForm');
const modalAlert = document.getElementById('modalAlert');
const studentIdHint = document.getElementById('studentIdHint');
const inputStudentId = document.getElementById('inputStudentId');
const inputStudentName = document.getElementById('inputStudentName');
const inputStudentEmail = document.getElementById('inputStudentEmail');
const selectStudentMajor = document.getElementById('selectStudentMajor');
const closeStudentModalBtn = document.getElementById('closeStudentModalBtn');
const cancelStudentModalBtn = document.getElementById('cancelStudentModalBtn');
const saveStudentBtn = document.getElementById('saveStudentBtn');

// 2. Department Modal
const departmentModal = document.getElementById('departmentModal');
const deptModalTitle = document.getElementById('deptModalTitle');
const deptModalSubtitle = document.getElementById('deptModalSubtitle');
const departmentForm = document.getElementById('departmentForm');
const deptModalAlert = document.getElementById('deptModalAlert');
const deptIdHint = document.getElementById('deptIdHint');
const inputDeptId = document.getElementById('inputDeptId');
const inputDeptName = document.getElementById('inputDeptName');
const inputDeptOffice = document.getElementById('inputDeptOffice');
const closeDeptModalBtn = document.getElementById('closeDeptModalBtn');
const cancelDeptModalBtn = document.getElementById('cancelDeptModalBtn');
const saveDeptBtn = document.getElementById('saveDeptBtn');

// 3. Staff Modal
const staffModal = document.getElementById('staffModal');
const staffModalTitle = document.getElementById('staffModalTitle');
const staffModalSubtitle = document.getElementById('staffModalSubtitle');
const staffForm = document.getElementById('staffForm');
const staffModalAlert = document.getElementById('staffModalAlert');
const staffIdHint = document.getElementById('staffIdHint');
const inputStaffId = document.getElementById('inputStaffId');
const inputStaffName = document.getElementById('inputStaffName');
const inputStaffRole = document.getElementById('inputStaffRole');
const inputStaffEmail = document.getElementById('inputStaffEmail');
const selectStaffDept = document.getElementById('selectStaffDept');
const closeStaffModalBtn = document.getElementById('closeStaffModalBtn');
const cancelStaffModalBtn = document.getElementById('cancelStaffModalBtn');
const saveStaffBtn = document.getElementById('saveStaffBtn');

// 4. Course Modal
const courseModal = document.getElementById('courseModal');
const courseModalTitle = document.getElementById('courseModalTitle');
const courseModalSubtitle = document.getElementById('courseModalSubtitle');
const courseForm = document.getElementById('courseForm');
const courseModalAlert = document.getElementById('courseModalAlert');
const courseCodeHint = document.getElementById('courseCodeHint');
const inputCourseCode = document.getElementById('inputCourseCode');
const inputCourseTitle = document.getElementById('inputCourseTitle');
const inputCourseCredits = document.getElementById('inputCourseCredits');
const selectCourseDept = document.getElementById('selectCourseDept');
const closeCourseModalBtn = document.getElementById('closeCourseModalBtn');
const cancelCourseModalBtn = document.getElementById('cancelCourseModalBtn');
const saveCourseBtn = document.getElementById('saveCourseBtn');

// 5. Section Modal (Phase 4)
const sectionModal = document.getElementById('sectionModal');
const sectionModalTitle = document.getElementById('sectionModalTitle');
const sectionModalSubtitle = document.getElementById('sectionModalSubtitle');
const sectionForm = document.getElementById('sectionForm');
const sectionModalAlert = document.getElementById('sectionModalAlert');
const sectionIdHint = document.getElementById('sectionIdHint');
const inputSectionId = document.getElementById('inputSectionId');
const selectSectionCourse = document.getElementById('selectSectionCourse');
const selectSectionStaff = document.getElementById('selectSectionStaff');
const inputSectionTerm = document.getElementById('inputSectionTerm');
const inputSectionNumber = document.getElementById('inputSectionNumber');
const inputSectionRoom = document.getElementById('inputSectionRoom');
const closeSectionModalBtn = document.getElementById('closeSectionModalBtn');
const cancelSectionModalBtn = document.getElementById('cancelSectionModalBtn');
const saveSectionBtn = document.getElementById('saveSectionBtn');

// 6. Enrollment Modal (Phase 4)
const enrollmentModal = document.getElementById('enrollmentModal');
const enrollmentModalTitle = document.getElementById('enrollmentModalTitle');
const enrollmentModalSubtitle = document.getElementById('enrollmentModalSubtitle');
const enrollmentForm = document.getElementById('enrollmentForm');
const enrollmentModalAlert = document.getElementById('enrollmentModalAlert');
const enrollmentIdHint = document.getElementById('enrollmentIdHint');
const inputEnrollmentId = document.getElementById('inputEnrollmentId');
const selectEnrollmentStudent = document.getElementById('selectEnrollmentStudent');
const selectEnrollmentCourse = document.getElementById('selectEnrollmentCourse');
const inputEnrollmentGrade = document.getElementById('inputEnrollmentGrade');
const inputEnrollmentDate = document.getElementById('inputEnrollmentDate');
const closeEnrollmentModalBtn = document.getElementById('closeEnrollmentModalBtn');
const cancelEnrollmentModalBtn = document.getElementById('cancelEnrollmentModalBtn');
const saveEnrollmentBtn = document.getElementById('saveEnrollmentBtn');

// 7. Universal Delete Modal
const deleteModal = document.getElementById('deleteModal');
const deleteModalTitle = document.getElementById('deleteModalTitle');
const deleteModalSubtitle = document.getElementById('deleteModalSubtitle');
const deleteConfirmPrompt = document.getElementById('deleteConfirmPrompt');
const deleteWarningNote = document.getElementById('deleteWarningNote');
const deleteModalAlert = document.getElementById('deleteModalAlert');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// 8. Coming Soon Modal & Toasts
const comingSoonModal = document.getElementById('comingSoonModal');
const comingSoonModuleName = document.getElementById('comingSoonModuleName');
const closeComingSoonBtn = document.getElementById('closeComingSoonBtn');
const ackComingSoonBtn = document.getElementById('ackComingSoonBtn');
const toastContainer = document.getElementById('toastContainer');

// ============================================================
// Utilities: Toasts & HTML Sanitization
// ============================================================
function showToast(message, type = 'success', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  } else if (type === 'error') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  } else {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
  }

  toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// Health Verification
// ============================================================
async function checkSystemHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error('Health probe failed');
    const data = await res.json();

    if (data.database === 'connected') {
      headerStatusDot.className = 'dot connected';
      headerStatusText.innerHTML = `Backend: <strong>Connected</strong> &bull; MySQL: <strong>Connected</strong> (${data.latencyMs ?? '< 5'}ms)`;
    } else {
      headerStatusDot.className = 'dot disconnected';
      headerStatusText.innerHTML = `Backend: Connected &bull; MySQL: <strong>Disconnected</strong>`;
    }
  } catch (err) {
    headerStatusDot.className = 'dot disconnected';
    headerStatusText.innerHTML = `Backend: <strong>Offline</strong> &bull; MySQL: Disconnected`;
  }
}

// ============================================================
// View Navigation Controller
// ============================================================
function switchView(viewName) {
  state.activeView = viewName;

  // Nav item states
  [navDashboard, navStudents, navDepartments, navStaff, navCourses, navSections, navEnrollments, navReports].forEach(btn => btn?.classList.remove('active'));
  [dashboardView, studentsView, departmentsView, staffView, coursesView, sectionsView, enrollmentsView, reportsView].forEach(view => view?.classList.remove('active'));

  if (viewName === 'dashboard') {
    navDashboard.classList.add('active');
    dashboardView.classList.add('active');
    loadDashboardStats();
  } else if (viewName === 'students') {
    navStudents.classList.add('active');
    studentsView.classList.add('active');
    loadStudents(state.currentStudentSearch);
  } else if (viewName === 'departments') {
    navDepartments.classList.add('active');
    departmentsView.classList.add('active');
    loadDepartmentsList(state.currentDeptSearch);
  } else if (viewName === 'staff') {
    navStaff.classList.add('active');
    staffView.classList.add('active');
    loadStaffList(state.currentStaffSearch);
  } else if (viewName === 'courses') {
    navCourses.classList.add('active');
    coursesView.classList.add('active');
    loadCoursesList(state.currentCourseSearch);
  } else if (viewName === 'sections') {
    navSections.classList.add('active');
    sectionsView.classList.add('active');
    loadSectionsList();
  } else if (viewName === 'enrollments') {
    navEnrollments.classList.add('active');
    enrollmentsView.classList.add('active');
    loadEnrollmentsList();
  } else if (viewName === 'reports') {
    navReports?.classList.add('active');
    reportsView?.classList.add('active');
    loadReportsOverview();
  }
}

function openComingSoon(moduleName) {
  comingSoonModuleName.textContent = `${moduleName} Module`;
  comingSoonModal.classList.add('active');
}

function closeComingSoon() {
  comingSoonModal.classList.remove('active');
}

// ============================================================
// Shared Dropdowns Population
// ============================================================
async function preloadCatalogs() {
  try {
    const [deptRes, courseRes, staffRes, studentRes] = await Promise.all([
      fetch(`${API_BASE}/api/departments`),
      fetch(`${API_BASE}/api/courses`),
      fetch(`${API_BASE}/api/staff`),
      fetch(`${API_BASE}/api/students`)
    ]);

    const deptData = await deptRes.json();
    const courseData = await courseRes.json();
    const staffData = await staffRes.json();
    const studentData = await studentRes.json();

    if (deptData.status === 'ok') state.departments = deptData.departments || [];
    if (courseData.status === 'ok') state.courses = courseData.courses || [];
    if (staffData.status === 'ok') state.staff = staffData.staff || [];
    if (studentData.status === 'ok') state.students = studentData.students || [];

    populateAllDropdowns();
  } catch (err) {
    console.error('Failed preloading catalogs:', err);
  }
}

function populateAllDropdowns() {
  // 1. Departments dropdowns
  const deptOptionsHtml = '<option value="" disabled selected>-- Select Academic Department --</option>' +
    state.departments.map(d => `<option value="${d.department_id}">${escapeHtml(d.department_name)} (ID: ${d.department_id})</option>`).join('');

  if (selectStudentMajor) selectStudentMajor.innerHTML = deptOptionsHtml;
  if (selectStaffDept) selectStaffDept.innerHTML = deptOptionsHtml;
  if (selectCourseDept) selectCourseDept.innerHTML = deptOptionsHtml;

  // 2. Courses dropdowns & filters
  const courseOptionsHtml = '<option value="" disabled selected>-- Select Course Offering --</option>' +
    state.courses.map(c => `<option value="${c.course_code}">${escapeHtml(c.course_code)}: ${escapeHtml(c.title)} (${c.credits} Credits)</option>`).join('');

  if (selectSectionCourse) selectSectionCourse.innerHTML = courseOptionsHtml;
  if (selectEnrollmentCourse) selectEnrollmentCourse.innerHTML = courseOptionsHtml;

  const courseFilterHtml = '<option value="">All Courses</option>' +
    state.courses.map(c => `<option value="${c.course_code}">${escapeHtml(c.course_code)} - ${escapeHtml(c.title)}</option>`).join('');

  if (filterSectionCourse) filterSectionCourse.innerHTML = courseFilterHtml;
  if (filterEnrollmentCourse) filterEnrollmentCourse.innerHTML = courseFilterHtml;

  // 3. Staff dropdown
  const staffOptionsHtml = '<option value="">-- No Instructor Assigned --</option>' +
    state.staff.map(s => `<option value="${s.staff_id}">${escapeHtml(s.staff_name)} (${escapeHtml(s.role || 'Faculty')})</option>`).join('');

  if (selectSectionStaff) selectSectionStaff.innerHTML = staffOptionsHtml;

  // 4. Student dropdown
  const studentOptionsHtml = '<option value="" disabled selected>-- Select Student --</option>' +
    state.students.map(s => `<option value="${s.student_id}">#${s.student_id} - ${escapeHtml(s.student_name)} (${escapeHtml(s.department_name || 'Student')})</option>`).join('');

  if (selectEnrollmentStudent) selectEnrollmentStudent.innerHTML = studentOptionsHtml;
}

// ============================================================
// 1. DASHBOARD CONTROLLER
// ============================================================
async function loadDashboardStats() {
  const spinIcon = refreshStatsBtn?.querySelector('.spin-icon');
  if (spinIcon) spinIcon.classList.add('spinning');

  try {
    const res = await fetch(`${API_BASE}/api/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to retrieve statistics');
    const data = await res.json();

    if (data.status === 'ok') {
      renderDashboardCounts(data.counts);
      renderDeptDistribution(data.studentsByDepartment, data.counts.totalStudents);
      renderCourseEnrollments(data.courseEnrollments);
      renderRecentStudents(data.recentStudents);
    }
  } catch (err) {
    console.error('Error loading dashboard stats:', err);
    showToast('Failed to load dashboard metrics from MySQL.', 'error');
  } finally {
    if (spinIcon) spinIcon.classList.remove('spinning');
  }
}

function renderDashboardCounts(counts) {
  statStudents.textContent = counts.totalStudents ?? 0;
  statDepartments.textContent = counts.totalDepartments ?? 0;
  statStaff.textContent = counts.totalStaff ?? 0;
  statCourses.textContent = counts.totalCourses ?? 0;
  statSections.textContent = counts.totalSections ?? 0;
  statEnrollments.textContent = counts.totalEnrollments ?? 0;
}

function renderDeptDistribution(depts, totalStudents) {
  if (!depts || depts.length === 0) {
    deptDistributionList.innerHTML = '<div class="text-muted" style="padding: 1rem 0;">No departments found.</div>';
    return;
  }

  const maxStudents = Math.max(1, totalStudents || 1);
  deptDistributionList.innerHTML = depts.map(d => {
    const count = d.student_count || 0;
    const pct = Math.round((count / maxStudents) * 100);
    return `
      <div class="dept-item">
        <div class="dept-item-header">
          <span class="dept-item-name">${escapeHtml(d.department_name)}</span>
          <span class="dept-item-count">${count} student${count === 1 ? '' : 's'} (${pct}%)</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderCourseEnrollments(courses) {
  if (!courses || courses.length === 0) {
    courseEnrollmentsList.innerHTML = '<div class="text-muted" style="padding: 1rem 0;">No course enrollments found.</div>';
    return;
  }

  courseEnrollmentsList.innerHTML = courses.map(c => `
    <div class="course-item">
      <div class="course-item-left">
        <span class="course-code-badge">${escapeHtml(c.course_code)}</span>
        <div>
          <div class="course-item-title">${escapeHtml(c.title)}</div>
          <div class="course-item-credits">${c.credits} Credits</div>
        </div>
      </div>
      <div class="course-item-count">${c.enrolled_count} Enrolled</div>
    </div>
  `).join('');
}

function renderRecentStudents(recent) {
  if (!recent || recent.length === 0) {
    recentStudentsTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted" style="padding: 1.5rem;">No student records found.</td>
      </tr>
    `;
    return;
  }

  recentStudentsTableBody.innerHTML = recent.map(s => `
    <tr>
      <td><span class="id-badge">#${s.student_id}</span></td>
      <td class="student-name-cell">${escapeHtml(s.student_name)}</td>
      <td class="student-email-cell">${escapeHtml(s.email)}</td>
      <td><span class="dept-badge">${escapeHtml(s.department_name || 'Undeclared')}</span></td>
    </tr>
  `).join('');
}

// ============================================================
// 2. STUDENTS CONTROLLER
// ============================================================
async function loadStudents(searchQuery = '') {
  studentsTableBody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center text-muted" style="padding: 3rem;">
        <div class="loading-spinner"></div>
        <p style="margin-top: 1rem;">Querying student records from MySQL...</p>
      </td>
    </tr>
  `;

  try {
    const url = searchQuery && searchQuery.trim()
      ? `${API_BASE}/api/students?search=${encodeURIComponent(searchQuery.trim())}`
      : `${API_BASE}/api/students`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch students');
    const data = await res.json();

    if (data.status === 'ok') {
      state.students = data.students || [];
      renderStudentsTable(state.students);
      studentCountBadge.textContent = `${state.students.length} student${state.students.length === 1 ? '' : 's'} recorded`;
      populateAllDropdowns();
    }
  } catch (err) {
    console.error('Error fetching students:', err);
    studentsTableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 2.5rem; color: #f87171;">Failed to load students.</td></tr>`;
    showToast('Failed to retrieve students from database.', 'error');
  }
}

function renderStudentsTable(students) {
  if (!students || students.length === 0) {
    const isSearch = state.currentStudentSearch.trim().length > 0;
    studentsTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted" style="padding: 3rem;">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔍</div>
          <p style="font-size: 1rem; color: #fff; font-weight: 600;">No students found</p>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">
            ${isSearch ? `No student matched "${escapeHtml(state.currentStudentSearch)}".` : 'No student records exist in the database.'}
          </p>
        </td>
      </tr>
    `;
    return;
  }

  studentsTableBody.innerHTML = students.map(s => {
    const enrollCount = s.enrollment_count || 0;
    const enrollLabel = enrollCount > 0 ? `${enrollCount} course${enrollCount === 1 ? '' : 's'}` : 'None';
    return `
      <tr>
        <td><span class="id-badge">#${s.student_id}</span></td>
        <td class="student-name-cell">${escapeHtml(s.student_name)}</td>
        <td class="student-email-cell">${escapeHtml(s.email)}</td>
        <td><span class="dept-badge">${escapeHtml(s.department_name || 'Undeclared')}</span></td>
        <td><span class="enrollment-count-badge">${enrollLabel}</span></td>
        <td style="text-align: right;">
          <div class="table-actions">
            <button class="btn-action edit-btn" title="Edit student" onclick="handleOpenEditStudent(${s.student_id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-action delete-btn" title="Delete student" onclick="triggerUniversalDelete('student', ${s.student_id}, '${escapeHtml(s.student_name).replace(/'/g, "\\'")}', 'Enrollment records')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddStudentModal() {
  state.editingStudentId = null;
  studentForm.reset();
  modalAlert.style.display = 'none';

  studentModalTitle.textContent = 'Add New Student';
  studentModalSubtitle.textContent = 'Register a new student profile in the database.';
  studentIdHint.textContent = 'Positive integer (e.g., 107)';

  inputStudentId.disabled = false;
  inputStudentId.value = '';
  saveStudentBtn.querySelector('.btn-text').textContent = 'Register Student';

  populateAllDropdowns();
  studentModal.classList.add('active');
  inputStudentId.focus();
}

function handleOpenEditStudent(studentId) {
  const student = state.students.find(s => s.student_id === studentId);
  if (!student) {
    showToast('Student not found.', 'error');
    return;
  }

  state.editingStudentId = studentId;
  studentForm.reset();
  modalAlert.style.display = 'none';

  studentModalTitle.textContent = `Edit Student #${student.student_id}`;
  studentModalSubtitle.textContent = 'Update student academic profile details.';
  studentIdHint.textContent = 'Primary Key (Cannot be modified)';

  inputStudentId.value = student.student_id;
  inputStudentId.disabled = true;
  inputStudentName.value = student.student_name;
  inputStudentEmail.value = student.email;

  populateAllDropdowns();
  selectStudentMajor.value = student.major_id || '';

  saveStudentBtn.querySelector('.btn-text').textContent = 'Save Changes';
  studentModal.classList.add('active');
  inputStudentName.focus();
}

studentForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  modalAlert.style.display = 'none';

  const name = inputStudentName.value.trim();
  const email = inputStudentEmail.value.trim();
  const majorId = Number(selectStudentMajor.value);

  if (!state.editingStudentId) {
    const idVal = Number(inputStudentId.value);
    if (!Number.isInteger(idVal) || idVal <= 0) {
      showModalAlert(modalAlert, 'Please enter a valid numeric Student ID.');
      inputStudentId.focus();
      return;
    }
  }

  if (!name) {
    showModalAlert(modalAlert, 'Student Name is required.');
    inputStudentName.focus();
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showModalAlert(modalAlert, 'Please provide a valid institutional email address.');
    inputStudentEmail.focus();
    return;
  }

  if (!majorId || isNaN(majorId)) {
    showModalAlert(modalAlert, 'Please select an Academic Department / Major.');
    selectStudentMajor.focus();
    return;
  }

  const isEdit = state.editingStudentId !== null;
  const url = isEdit ? `${API_BASE}/api/students/${state.editingStudentId}` : `${API_BASE}/api/students`;
  const method = isEdit ? 'PUT' : 'POST';

  const payload = { student_name: name, email, major_id: majorId };
  if (!isEdit) payload.student_id = Number(inputStudentId.value);

  saveStudentBtn.disabled = true;
  saveStudentBtn.querySelector('.btn-text').textContent = 'Saving...';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok || data.status !== 'ok') {
      showModalAlert(modalAlert, data.message || 'Failed to save student.');
      saveStudentBtn.disabled = false;
      saveStudentBtn.querySelector('.btn-text').textContent = isEdit ? 'Save Changes' : 'Register Student';
      return;
    }

    studentModal.classList.remove('active');
    showToast(isEdit ? 'Student updated successfully.' : 'Student registered successfully.', 'success');
    loadStudents(state.currentStudentSearch);
    loadDashboardStats();
  } catch (err) {
    console.error('Error saving student:', err);
    showModalAlert(modalAlert, 'Network error while communicating with the server.');
  } finally {
    saveStudentBtn.disabled = false;
    saveStudentBtn.querySelector('.btn-text').textContent = isEdit ? 'Save Changes' : 'Register Student';
  }
});

// ============================================================
// 3. DEPARTMENTS CONTROLLER
// ============================================================
async function loadDepartmentsList(searchQuery = '') {
  departmentsTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 3rem;"><div class="loading-spinner"></div><p style="margin-top: 1rem;">Querying departments from MySQL...</p></td></tr>`;

  try {
    const url = searchQuery && searchQuery.trim()
      ? `${API_BASE}/api/departments?search=${encodeURIComponent(searchQuery.trim())}`
      : `${API_BASE}/api/departments`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch departments');
    const data = await res.json();

    if (data.status === 'ok') {
      state.departments = data.departments || [];
      renderDepartmentsTable(state.departments);
      deptCountBadge.textContent = `${state.departments.length} department${state.departments.length === 1 ? '' : 's'} recorded`;
      populateAllDropdowns();
    }
  } catch (err) {
    console.error('Error loading departments:', err);
    departmentsTableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 2.5rem; color: #f87171;">Failed to load departments.</td></tr>`;
    showToast('Failed to retrieve departments from database.', 'error');
  }
}

function renderDepartmentsTable(depts) {
  if (!depts || depts.length === 0) {
    const isSearch = state.currentDeptSearch.trim().length > 0;
    departmentsTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 3rem;"><div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🏢</div><p style="font-size: 1rem; color: #fff; font-weight: 600;">No departments found</p></td></tr>`;
    return;
  }

  departmentsTableBody.innerHTML = depts.map(d => `
    <tr>
      <td><span class="id-badge">#${d.department_id}</span></td>
      <td style="font-weight: 600; color: #fff;">${escapeHtml(d.department_name)}</td>
      <td class="office-cell">${escapeHtml(d.office || 'Not assigned')}</td>
      <td><span class="enrollment-count-badge">${d.staff_count ?? 0} staff</span></td>
      <td><span class="enrollment-count-badge">${d.course_count ?? 0} courses</span></td>
      <td><span class="enrollment-count-badge">${d.student_count ?? 0} students</span></td>
      <td style="text-align: right;">
        <div class="table-actions">
          <button class="btn-action edit-btn" title="Edit department" onclick="handleOpenEditDept(${d.department_id})">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-action delete-btn" title="Delete department" onclick="triggerUniversalDelete('department', ${d.department_id}, '${escapeHtml(d.department_name).replace(/'/g, "\\'")}', 'Students, Staff, or Courses')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddDeptModal() {
  state.editingDeptId = null;
  departmentForm.reset();
  deptModalAlert.style.display = 'none';

  deptModalTitle.textContent = 'Add Department';
  deptModalSubtitle.textContent = 'Register a new academic department in the database.';
  deptIdHint.textContent = 'Positive integer (e.g., 4)';

  inputDeptId.disabled = false;
  inputDeptId.value = '';
  saveDeptBtn.querySelector('.btn-text').textContent = 'Create Department';

  departmentModal.classList.add('active');
  inputDeptId.focus();
}

function handleOpenEditDept(deptId) {
  const dept = state.departments.find(d => d.department_id === deptId);
  if (!dept) {
    showToast('Department not found.', 'error');
    return;
  }

  state.editingDeptId = deptId;
  departmentForm.reset();
  deptModalAlert.style.display = 'none';

  deptModalTitle.textContent = `Edit Department #${dept.department_id}`;
  deptModalSubtitle.textContent = 'Update department details and office location.';
  deptIdHint.textContent = 'Primary Key (Cannot be modified)';

  inputDeptId.value = dept.department_id;
  inputDeptId.disabled = true;
  inputDeptName.value = dept.department_name;
  inputDeptOffice.value = dept.office || '';

  saveDeptBtn.querySelector('.btn-text').textContent = 'Save Changes';
  departmentModal.classList.add('active');
  inputDeptName.focus();
}

departmentForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  deptModalAlert.style.display = 'none';

  const name = inputDeptName.value.trim();
  const office = inputDeptOffice.value.trim();

  if (!state.editingDeptId) {
    const idVal = Number(inputDeptId.value);
    if (!Number.isInteger(idVal) || idVal <= 0) {
      showModalAlert(deptModalAlert, 'Please enter a valid numeric Department ID.');
      inputDeptId.focus();
      return;
    }
  }

  if (!name) {
    showModalAlert(deptModalAlert, 'Department Name is required.');
    inputDeptName.focus();
    return;
  }

  const isEdit = state.editingDeptId !== null;
  const url = isEdit ? `${API_BASE}/api/departments/${state.editingDeptId}` : `${API_BASE}/api/departments`;
  const method = isEdit ? 'PUT' : 'POST';

  const payload = { department_name: name, office };
  if (!isEdit) payload.department_id = Number(inputDeptId.value);

  saveDeptBtn.disabled = true;
  saveDeptBtn.querySelector('.btn-text').textContent = 'Saving...';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok || data.status !== 'ok') {
      showModalAlert(deptModalAlert, data.message || 'Failed to save department.');
      saveDeptBtn.disabled = false;
      saveDeptBtn.querySelector('.btn-text').textContent = isEdit ? 'Save Changes' : 'Create Department';
      return;
    }

    departmentModal.classList.remove('active');
    showToast(isEdit ? 'Department updated successfully.' : 'Department created successfully.', 'success');
    loadDepartmentsList(state.currentDeptSearch);
    loadDashboardStats();
  } catch (err) {
    console.error('Error saving department:', err);
    showModalAlert(deptModalAlert, 'Network error while communicating with the server.');
  } finally {
    saveDeptBtn.disabled = false;
    saveDeptBtn.querySelector('.btn-text').textContent = isEdit ? 'Save Changes' : 'Create Department';
  }
});

// ============================================================
// 4. STAFF CONTROLLER
// ============================================================
async function loadStaffList(searchQuery = '') {
  staffTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 3rem;"><div class="loading-spinner"></div><p style="margin-top: 1rem;">Querying staff records from MySQL...</p></td></tr>`;

  try {
    const url = searchQuery && searchQuery.trim()
      ? `${API_BASE}/api/staff?search=${encodeURIComponent(searchQuery.trim())}`
      : `${API_BASE}/api/staff`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch staff');
    const data = await res.json();

    if (data.status === 'ok') {
      state.staff = data.staff || [];
      renderStaffTable(state.staff);
      staffCountBadge.textContent = `${state.staff.length} staff member${state.staff.length === 1 ? '' : 's'} recorded`;
      populateAllDropdowns();
    }
  } catch (err) {
    console.error('Error loading staff:', err);
    staffTableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 2.5rem; color: #f87171;">Failed to load staff records.</td></tr>`;
    showToast('Failed to retrieve staff from database.', 'error');
  }
}

function renderStaffTable(staffList) {
  if (!staffList || staffList.length === 0) {
    const isSearch = state.currentStaffSearch.trim().length > 0;
    staffTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 3rem;"><div style="font-size: 2.2rem; margin-bottom: 0.5rem;">👨‍🏫</div><p style="font-size: 1rem; color: #fff; font-weight: 600;">No staff members found</p></td></tr>`;
    return;
  }

  staffTableBody.innerHTML = staffList.map(st => {
    const secCount = st.section_count || 0;
    const secLabel = secCount > 0 ? `${secCount} section${secCount === 1 ? '' : 's'}` : 'None';
    return `
      <tr>
        <td><span class="id-badge">#${st.staff_id}</span></td>
        <td style="font-weight: 600; color: #fff;">${escapeHtml(st.staff_name)}</td>
        <td><span class="role-badge">${escapeHtml(st.role || 'Staff')}</span></td>
        <td class="student-email-cell">${escapeHtml(st.email)}</td>
        <td><span class="dept-badge">${escapeHtml(st.department_name || 'Undeclared')}</span></td>
        <td><span class="enrollment-count-badge">${secLabel}</span></td>
        <td style="text-align: right;">
          <div class="table-actions">
            <button class="btn-action edit-btn" title="Edit staff member" onclick="handleOpenEditStaff(${st.staff_id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-action delete-btn" title="Delete staff member" onclick="triggerUniversalDelete('staff', ${st.staff_id}, '${escapeHtml(st.staff_name).replace(/'/g, "\\'")}', 'Teaching Sections')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddStaffModal() {
  state.editingStaffId = null;
  staffForm.reset();
  staffModalAlert.style.display = 'none';

  staffModalTitle.textContent = 'Add Staff Member';
  staffModalSubtitle.textContent = 'Register faculty or teaching staff profile.';
  staffIdHint.textContent = 'Positive integer (e.g., 204)';

  inputStaffId.disabled = false;
  inputStaffId.value = '';
  saveStaffBtn.querySelector('.btn-text').textContent = 'Register Staff';

  populateAllDropdowns();
  staffModal.classList.add('active');
  inputStaffId.focus();
}

function handleOpenEditStaff(staffId) {
  const st = state.staff.find(s => s.staff_id === staffId);
  if (!st) {
    showToast('Staff member not found.', 'error');
    return;
  }

  state.editingStaffId = staffId;
  staffForm.reset();
  staffModalAlert.style.display = 'none';

  staffModalTitle.textContent = `Edit Staff #${st.staff_id}`;
  staffModalSubtitle.textContent = 'Update faculty rank, role, department, and email.';
  staffIdHint.textContent = 'Primary Key (Cannot be modified)';

  inputStaffId.value = st.staff_id;
  inputStaffId.disabled = true;
  inputStaffName.value = st.staff_name;
  inputStaffRole.value = st.role || '';
  inputStaffEmail.value = st.email;

  populateAllDropdowns();
  selectStaffDept.value = st.department_id || '';

  saveStaffBtn.querySelector('.btn-text').textContent = 'Save Changes';
  staffModal.classList.add('active');
  inputStaffName.focus();
}

staffForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  staffModalAlert.style.display = 'none';

  const name = inputStaffName.value.trim();
  const role = inputStaffRole.value.trim();
  const email = inputStaffEmail.value.trim();
  const deptId = Number(selectStaffDept.value);

  if (!state.editingStaffId) {
    const idVal = Number(inputStaffId.value);
    if (!Number.isInteger(idVal) || idVal <= 0) {
      showModalAlert(staffModalAlert, 'Please enter a valid numeric Staff ID.');
      inputStaffId.focus();
      return;
    }
  }

  if (!name) {
    showModalAlert(staffModalAlert, 'Staff Name is required.');
    inputStaffName.focus();
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showModalAlert(staffModalAlert, 'Please provide a valid institutional email address.');
    inputStaffEmail.focus();
    return;
  }

  if (!deptId || isNaN(deptId)) {
    showModalAlert(staffModalAlert, 'Please select an Academic Department.');
    selectStaffDept.focus();
    return;
  }

  const isEdit = state.editingStaffId !== null;
  const url = isEdit ? `${API_BASE}/api/staff/${state.editingStaffId}` : `${API_BASE}/api/staff`;
  const method = isEdit ? 'PUT' : 'POST';

  const payload = { staff_name: name, role, email, department_id: deptId };
  if (!isEdit) payload.staff_id = Number(inputStaffId.value);

  saveStaffBtn.disabled = true;
  saveStaffBtn.querySelector('.btn-text').textContent = 'Saving...';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok || data.status !== 'ok') {
      showModalAlert(staffModalAlert, data.message || 'Failed to save staff member.');
      saveStaffBtn.disabled = false;
      saveStaffBtn.querySelector('.btn-text').textContent = isEdit ? 'Save Changes' : 'Register Staff';
      return;
    }

    staffModal.classList.remove('active');
    showToast(isEdit ? 'Staff member updated successfully.' : 'Staff member registered successfully.', 'success');
    loadStaffList(state.currentStaffSearch);
    loadDashboardStats();
  } catch (err) {
    console.error('Error saving staff:', err);
    showModalAlert(staffModalAlert, 'Network error while communicating with the server.');
  } finally {
    saveStaffBtn.disabled = false;
    saveStaffBtn.querySelector('.btn-text').textContent = isEdit ? 'Save Changes' : 'Register Staff';
  }
});

// ============================================================
// 5. COURSES CONTROLLER
// ============================================================
async function loadCoursesList(searchQuery = '') {
  coursesTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 3rem;"><div class="loading-spinner"></div><p style="margin-top: 1rem;">Querying course catalog from MySQL...</p></td></tr>`;

  try {
    const url = searchQuery && searchQuery.trim()
      ? `${API_BASE}/api/courses?search=${encodeURIComponent(searchQuery.trim())}`
      : `${API_BASE}/api/courses`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch courses');
    const data = await res.json();

    if (data.status === 'ok') {
      state.courses = data.courses || [];
      renderCoursesTable(state.courses);
      courseCountBadge.textContent = `${state.courses.length} course${state.courses.length === 1 ? '' : 's'} in catalog`;
      populateAllDropdowns();
    }
  } catch (err) {
    console.error('Error loading courses:', err);
    coursesTableBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 2.5rem; color: #f87171;">Failed to load courses.</td></tr>`;
    showToast('Failed to retrieve courses from database.', 'error');
  }
}

function renderCoursesTable(courses) {
  if (!courses || courses.length === 0) {
    const isSearch = state.currentCourseSearch.trim().length > 0;
    coursesTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 3rem;"><div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📚</div><p style="font-size: 1rem; color: #fff; font-weight: 600;">No courses found</p></td></tr>`;
    return;
  }

  coursesTableBody.innerHTML = courses.map(c => `
    <tr>
      <td><span class="course-code-badge">${escapeHtml(c.course_code)}</span></td>
      <td style="font-weight: 600; color: #fff;">${escapeHtml(c.title)}</td>
      <td><span class="credit-badge">${c.credits} Credits</span></td>
      <td><span class="dept-badge">${escapeHtml(c.department_name || 'Undeclared')}</span></td>
      <td><span class="enrollment-count-badge">${c.section_count || 0} sections</span></td>
      <td><span class="enrollment-count-badge">${c.enrollment_count || 0} enrolled</span></td>
      <td style="text-align: right;">
        <div class="table-actions">
          <button class="btn-action edit-btn" title="Edit course" onclick="handleOpenEditCourse('${escapeHtml(c.course_code)}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-action delete-btn" title="Delete course" onclick="triggerUniversalDelete('course', '${escapeHtml(c.course_code)}', '${escapeHtml(c.title).replace(/'/g, "\\'")}', 'Sections and Enrollments')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddCourseModal() {
  state.editingCourseCode = null;
  courseForm.reset();
  courseModalAlert.style.display = 'none';

  courseModalTitle.textContent = 'Add Course';
  courseModalSubtitle.textContent = 'Register a new curriculum course offering.';
  courseCodeHint.textContent = 'Max 10 chars (e.g., CS201)';

  inputCourseCode.disabled = false;
  inputCourseCode.value = '';
  saveCourseBtn.querySelector('.btn-text').textContent = 'Add Course';

  populateAllDropdowns();
  courseModal.classList.add('active');
  inputCourseCode.focus();
}

function handleOpenEditCourse(courseCode) {
  const c = state.courses.find(item => item.course_code === courseCode);
  if (!c) {
    showToast('Course not found.', 'error');
    return;
  }

  state.editingCourseCode = courseCode;
  courseForm.reset();
  courseModalAlert.style.display = 'none';

  courseModalTitle.textContent = `Edit Course: ${c.course_code}`;
  courseModalSubtitle.textContent = 'Update title, credits, or host department.';
  courseCodeHint.textContent = 'Primary Key (Cannot be modified)';

  inputCourseCode.value = c.course_code;
  inputCourseCode.disabled = true;
  inputCourseTitle.value = c.title;
  inputCourseCredits.value = c.credits;

  populateAllDropdowns();
  selectCourseDept.value = c.department_id || '';

  saveCourseBtn.querySelector('.btn-text').textContent = 'Save Changes';
  courseModal.classList.add('active');
  inputCourseTitle.focus();
}

courseForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  courseModalAlert.style.display = 'none';

  const code = inputCourseCode.value.trim().toUpperCase();
  const title = inputCourseTitle.value.trim();
  const credits = Number(inputCourseCredits.value);
  const deptId = Number(selectCourseDept.value);

  if (!state.editingCourseCode) {
    if (!code || code.length > 10) {
      showModalAlert(courseModalAlert, 'Course Code is required and must not exceed 10 characters.');
      inputCourseCode.focus();
      return;
    }
  }

  if (!title) {
    showModalAlert(courseModalAlert, 'Course Title is required.');
    inputCourseTitle.focus();
    return;
  }

  if (!credits || credits <= 0 || !Number.isInteger(credits)) {
    showModalAlert(courseModalAlert, 'Credits must be a positive integer greater than 0.');
    inputCourseCredits.focus();
    return;
  }

  if (!deptId || isNaN(deptId)) {
    showModalAlert(courseModalAlert, 'Please select a Host Department.');
    selectCourseDept.focus();
    return;
  }

  const isEdit = state.editingCourseCode !== null;
  const url = isEdit ? `${API_BASE}/api/courses/${encodeURIComponent(state.editingCourseCode)}` : `${API_BASE}/api/courses`;
  const method = isEdit ? 'PUT' : 'POST';

  const payload = { title, credits, department_id: deptId };
  if (!isEdit) payload.course_code = code;

  saveCourseBtn.disabled = true;
  saveCourseBtn.querySelector('.btn-text').textContent = 'Saving...';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok || data.status !== 'ok') {
      showModalAlert(courseModalAlert, data.message || 'Failed to save course.');
      saveCourseBtn.disabled = false;
      saveCourseBtn.querySelector('.btn-text').textContent = isEdit ? 'Save Changes' : 'Add Course';
      return;
    }

    courseModal.classList.remove('active');
    showToast(isEdit ? 'Course updated successfully.' : 'Course added successfully.', 'success');
    loadCoursesList(state.currentCourseSearch);
    loadDashboardStats();
  } catch (err) {
    console.error('Error saving course:', err);
    showModalAlert(courseModalAlert, 'Network error while communicating with the server.');
  } finally {
    saveCourseBtn.disabled = false;
    saveCourseBtn.querySelector('.btn-text').textContent = isEdit ? 'Save Changes' : 'Add Course';
  }
});

// ============================================================
// 6. SECTIONS CONTROLLER (Phase 4)
// ============================================================
async function loadSectionsList() {
  sectionsTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 3rem;"><div class="loading-spinner"></div><p style="margin-top: 1rem;">Querying sections from MySQL...</p></td></tr>`;

  try {
    const params = new URLSearchParams();
    if (state.currentSectionSearch && state.currentSectionSearch.trim()) params.append('search', state.currentSectionSearch.trim());
    if (state.sectionFilterTerm) params.append('term', state.sectionFilterTerm);
    if (state.sectionFilterCourse) params.append('course_code', state.sectionFilterCourse);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/api/sections${qs}`);
    if (!res.ok) throw new Error('Failed to fetch sections');
    const data = await res.json();

    if (data.status === 'ok') {
      state.sections = data.sections || [];
      renderSectionsTable(state.sections);
      sectionCountBadge.textContent = `${state.sections.length} section${state.sections.length === 1 ? '' : 's'} recorded`;
    }
  } catch (err) {
    console.error('Error loading sections:', err);
    sectionsTableBody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 2.5rem; color: #f87171;">Failed to load sections.</td></tr>`;
    showToast('Failed to retrieve sections from database.', 'error');
  }
}

function renderSectionsTable(sections) {
  if (!sections || sections.length === 0) {
    sectionsTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 3rem;"><div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🏛️</div><p style="font-size: 1rem; color: #fff; font-weight: 600;">No sections found</p></td></tr>`;
    return;
  }

  sectionsTableBody.innerHTML = sections.map(sec => `
    <tr>
      <td><span class="id-badge">#${sec.section_id}</span></td>
      <td>
        <span class="course-code-badge">${escapeHtml(sec.course_code)}</span>
        <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 3px;">${escapeHtml(sec.course_title || '')}</div>
      </td>
      <td style="font-weight: 600; color: #fff;">${escapeHtml(sec.staff_name || 'Unassigned')}</td>
      <td><span class="dept-badge">${escapeHtml(sec.term || 'N/A')}</span></td>
      <td><span class="role-badge" style="background: rgba(99, 102, 241, 0.12); color: #a5b4fc; border-color: rgba(99, 102, 241, 0.3);">${escapeHtml(sec.section_number || 'A')}</span></td>
      <td><span class="room-badge">${escapeHtml(sec.room || 'TBD')}</span></td>
      <td><span class="enrollment-count-badge">${sec.enrollment_count || 0} enrolled</span></td>
      <td style="text-align: right;">
        <div class="table-actions">
          <button class="btn-action edit-btn" title="Edit section" onclick="handleOpenEditSection(${sec.section_id})">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-action delete-btn" title="Delete section" onclick="triggerUniversalDelete('section', ${sec.section_id}, '${escapeHtml(sec.course_code)} (Section ${escapeHtml(sec.section_number || 'A')} - ${escapeHtml(sec.term)})', 'None directly, but section will be removed')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddSectionModal() {
  state.editingSectionId = null;
  sectionForm.reset();
  sectionModalAlert.style.display = 'none';

  sectionModalTitle.textContent = 'Add Course Section';
  sectionModalSubtitle.textContent = 'Configure class schedule, instructor, and classroom.';
  sectionIdHint.textContent = 'Positive integer (e.g., 5)';

  inputSectionId.disabled = false;
  inputSectionId.value = '';
  inputSectionTerm.value = '2026-Fall';
  inputSectionNumber.value = 'A';
  saveSectionBtn.querySelector('.btn-text').textContent = 'Create Section';

  populateAllDropdowns();
  sectionModal.classList.add('active');
  inputSectionId.focus();
}

function handleOpenEditSection(sectionId) {
  const sec = state.sections.find(s => s.section_id === sectionId);
  if (!sec) {
    showToast('Section not found.', 'error');
    return;
  }

  state.editingSectionId = sectionId;
  sectionForm.reset();
  sectionModalAlert.style.display = 'none';

  sectionModalTitle.textContent = `Edit Section #${sec.section_id}`;
  sectionModalSubtitle.textContent = 'Update instructor, term, section number, or room.';
  sectionIdHint.textContent = 'Primary Key (Cannot be modified)';

  inputSectionId.value = sec.section_id;
  inputSectionId.disabled = true;

  populateAllDropdowns();
  selectSectionCourse.value = sec.course_code;
  selectSectionStaff.value = sec.staff_id || '';
  inputSectionTerm.value = sec.term || '';
  inputSectionNumber.value = sec.section_number || '';
  inputSectionRoom.value = sec.room || '';

  saveSectionBtn.querySelector('.btn-text').textContent = 'Save Changes';
  sectionModal.classList.add('active');
  selectSectionCourse.focus();
}

sectionForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  sectionModalAlert.style.display = 'none';

  const courseCode = selectSectionCourse.value;
  const staffId = selectSectionStaff.value ? Number(selectSectionStaff.value) : null;
  const term = inputSectionTerm.value.trim();
  const secNum = inputSectionNumber.value.trim();
  const room = inputSectionRoom.value.trim();

  if (!state.editingSectionId) {
    const idVal = Number(inputSectionId.value);
    if (!Number.isInteger(idVal) || idVal <= 0) {
      showModalAlert(sectionModalAlert, 'Please enter a valid numeric Section ID.');
      inputSectionId.focus();
      return;
    }
  }

  if (!courseCode) {
    showModalAlert(sectionModalAlert, 'Please select a Course Offering.');
    selectSectionCourse.focus();
    return;
  }

  if (!term) {
    showModalAlert(sectionModalAlert, 'Academic Term is required (e.g. 2026-Fall).');
    inputSectionTerm.focus();
    return;
  }

  const isEdit = state.editingSectionId !== null;
  const url = isEdit ? `${API_BASE}/api/sections/${state.editingSectionId}` : `${API_BASE}/api/sections`;
  const method = isEdit ? 'PUT' : 'POST';

  const payload = {
    course_code: courseCode,
    staff_id: staffId,
    term,
    section_number: secNum,
    room
  };
  if (!isEdit) payload.section_id = Number(inputSectionId.value);

  saveSectionBtn.disabled = true;
  saveSectionBtn.querySelector('.btn-text').textContent = 'Saving...';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok || data.status !== 'ok') {
      showModalAlert(sectionModalAlert, data.message || 'Failed to save section.');
      saveSectionBtn.disabled = false;
      saveSectionBtn.querySelector('.btn-text').textContent = isEdit ? 'Save Changes' : 'Create Section';
      return;
    }

    sectionModal.classList.remove('active');
    showToast(isEdit ? 'Section updated successfully.' : 'Section created successfully.', 'success');
    loadSectionsList();
    loadDashboardStats();
  } catch (err) {
    console.error('Error saving section:', err);
    showModalAlert(sectionModalAlert, 'Network error while communicating with the server.');
  } finally {
    saveSectionBtn.disabled = false;
    saveSectionBtn.querySelector('.btn-text').textContent = isEdit ? 'Save Changes' : 'Create Section';
  }
});

// ============================================================
// 7. ENROLLMENTS CONTROLLER (Phase 4)
// ============================================================
async function loadEnrollmentsList() {
  enrollmentsTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 3rem;"><div class="loading-spinner"></div><p style="margin-top: 1rem;">Querying course enrollments from MySQL...</p></td></tr>`;

  try {
    const params = new URLSearchParams();
    if (state.currentEnrollmentSearch && state.currentEnrollmentSearch.trim()) params.append('search', state.currentEnrollmentSearch.trim());
    if (state.enrollmentFilterCourse) params.append('course_code', state.enrollmentFilterCourse);
    if (state.enrollmentFilterGrade) params.append('grade', state.enrollmentFilterGrade);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/api/enrollments${qs}`);
    if (!res.ok) throw new Error('Failed to fetch enrollments');
    const data = await res.json();

    if (data.status === 'ok') {
      state.enrollments = data.enrollments || [];
      renderEnrollmentsTable(state.enrollments);
      enrollmentCountBadge.textContent = `${state.enrollments.length} enrollment${state.enrollments.length === 1 ? '' : 's'} recorded`;
    }
  } catch (err) {
    console.error('Error loading enrollments:', err);
    enrollmentsTableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 2.5rem; color: #f87171;">Failed to load enrollments.</td></tr>`;
    showToast('Failed to retrieve enrollments from database.', 'error');
  }
}

function renderEnrollmentsTable(enrollments) {
  if (!enrollments || enrollments.length === 0) {
    enrollmentsTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 3rem;"><div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📝</div><p style="font-size: 1rem; color: #fff; font-weight: 600;">No enrollments found</p></td></tr>`;
    return;
  }

  enrollmentsTableBody.innerHTML = enrollments.map(e => {
    let gradeBadgeClass = 'grade-none';
    const g = (e.grade || '').toUpperCase();
    if (g.startsWith('A')) gradeBadgeClass = 'grade-a';
    else if (g.startsWith('B')) gradeBadgeClass = 'grade-b';
    else if (g.startsWith('C')) gradeBadgeClass = 'grade-c';

    const gradeLabel = e.grade ? e.grade : 'In Progress';

    return `
      <tr>
        <td><span class="id-badge">#${e.enrollment_id}</span></td>
        <td>
          <div style="font-weight: 600; color: #fff;">${escapeHtml(e.student_name)}</div>
          <div style="font-size: 0.76rem; color: #94a3b8;">Student ID: #${e.student_id}</div>
        </td>
        <td>
          <span class="course-code-badge">${escapeHtml(e.course_code)}</span>
          <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 3px;">${escapeHtml(e.course_title || '')}</div>
        </td>
        <td><span class="grade-badge ${gradeBadgeClass}">${escapeHtml(gradeLabel)}</span></td>
        <td style="color: #cbd5e1; font-size: 0.84rem;">${escapeHtml(e.enroll_date || 'N/A')}</td>
        <td style="text-align: right;">
          <div class="table-actions">
            <button class="btn-action edit-btn" title="Edit enrollment" onclick="handleOpenEditEnrollment(${e.enrollment_id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-action delete-btn" title="Delete enrollment" onclick="triggerUniversalDelete('enrollment', ${e.enrollment_id}, 'Enrollment #${e.enrollment_id} (${escapeHtml(e.student_name)} - ${escapeHtml(e.course_code)})', 'None directly, student course registration will be removed')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddEnrollmentModal() {
  state.editingEnrollmentId = null;
  enrollmentForm.reset();
  enrollmentModalAlert.style.display = 'none';

  enrollmentModalTitle.textContent = 'Register Course Enrollment';
  enrollmentModalSubtitle.textContent = 'Enroll a student in a course offering.';
  enrollmentIdHint.textContent = 'Positive integer (e.g., 7)';

  inputEnrollmentId.disabled = false;
  inputEnrollmentId.value = '';
  inputEnrollmentDate.value = new Date().toISOString().split('T')[0];
  saveEnrollmentBtn.querySelector('.btn-text').textContent = 'Confirm Enrollment';

  populateAllDropdowns();
  enrollmentModal.classList.add('active');
  inputEnrollmentId.focus();
}

function handleOpenEditEnrollment(enrollmentId) {
  const e = state.enrollments.find(item => item.enrollment_id === enrollmentId);
  if (!e) {
    showToast('Enrollment not found.', 'error');
    return;
  }

  state.editingEnrollmentId = enrollmentId;
  enrollmentForm.reset();
  enrollmentModalAlert.style.display = 'none';

  enrollmentModalTitle.textContent = `Edit Enrollment #${e.enrollment_id}`;
  enrollmentModalSubtitle.textContent = 'Update grade or enrollment date.';
  enrollmentIdHint.textContent = 'Primary Key (Cannot be modified)';

  inputEnrollmentId.value = e.enrollment_id;
  inputEnrollmentId.disabled = true;

  populateAllDropdowns();
  selectEnrollmentStudent.value = e.student_id;
  selectEnrollmentCourse.value = e.course_code;
  inputEnrollmentGrade.value = e.grade || '';
  inputEnrollmentDate.value = e.enroll_date || new Date().toISOString().split('T')[0];

  saveEnrollmentBtn.querySelector('.btn-text').textContent = 'Save Changes';
  enrollmentModal.classList.add('active');
  inputEnrollmentGrade.focus();
}

enrollmentForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  enrollmentModalAlert.style.display = 'none';

  const studentId = Number(selectEnrollmentStudent.value);
  const courseCode = selectEnrollmentCourse.value;
  const grade = inputEnrollmentGrade.value.trim().toUpperCase() || null;
  const enrollDate = inputEnrollmentDate.value;

  if (!state.editingEnrollmentId) {
    const idVal = Number(inputEnrollmentId.value);
    if (!Number.isInteger(idVal) || idVal <= 0) {
      showModalAlert(enrollmentModalAlert, 'Please enter a valid numeric Enrollment ID.');
      inputEnrollmentId.focus();
      return;
    }
  }

  if (!studentId || isNaN(studentId)) {
    showModalAlert(enrollmentModalAlert, 'Please select a Student.');
    selectEnrollmentStudent.focus();
    return;
  }

  if (!courseCode) {
    showModalAlert(enrollmentModalAlert, 'Please select a Course Offering.');
    selectEnrollmentCourse.focus();
    return;
  }

  if (grade && grade.length > 2) {
    showModalAlert(enrollmentModalAlert, 'Grade cannot exceed 2 characters (e.g. A, B+, C-).');
    inputEnrollmentGrade.focus();
    return;
  }

  const isEdit = state.editingEnrollmentId !== null;
  const url = isEdit ? `${API_BASE}/api/enrollments/${state.editingEnrollmentId}` : `${API_BASE}/api/enrollments`;
  const method = isEdit ? 'PUT' : 'POST';

  const payload = {
    student_id: studentId,
    course_code: courseCode,
    grade,
    enroll_date: enrollDate
  };
  if (!isEdit) payload.enrollment_id = Number(inputEnrollmentId.value);

  saveEnrollmentBtn.disabled = true;
  saveEnrollmentBtn.querySelector('.btn-text').textContent = 'Saving...';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok || data.status !== 'ok') {
      showModalAlert(enrollmentModalAlert, data.message || 'Failed to save enrollment.');
      saveEnrollmentBtn.disabled = false;
      saveEnrollmentBtn.querySelector('.btn-text').textContent = isEdit ? 'Save Changes' : 'Confirm Enrollment';
      return;
    }

    enrollmentModal.classList.remove('active');
    showToast(isEdit ? 'Enrollment updated successfully.' : 'Student enrolled successfully.', 'success');
    loadEnrollmentsList();
    loadDashboardStats();
    loadStudents(state.currentStudentSearch);
  } catch (err) {
    console.error('Error saving enrollment:', err);
    showModalAlert(enrollmentModalAlert, 'Network error while communicating with the server.');
  } finally {
    saveEnrollmentBtn.disabled = false;
    saveEnrollmentBtn.querySelector('.btn-text').textContent = isEdit ? 'Save Changes' : 'Confirm Enrollment';
  }
});

// ============================================================
// UNIVERSAL DELETE CONTROLLER
// ============================================================
function triggerUniversalDelete(type, id, name, dependencyDescription) {
  state.deletingTarget = { type, id, name };

  deleteModalAlert.style.display = 'none';
  confirmDeleteBtn.disabled = false;
  confirmDeleteBtn.querySelector('.btn-text').textContent = 'Delete Record';

  let typeName = 'Record';
  if (type === 'student') typeName = 'Student Profile';
  else if (type === 'department') typeName = 'Academic Department';
  else if (type === 'staff') typeName = 'Faculty Staff Member';
  else if (type === 'course') typeName = 'Curriculum Course';
  else if (type === 'section') typeName = 'Term Section';
  else if (type === 'enrollment') typeName = 'Course Enrollment';

  deleteModalTitle.textContent = `Delete ${typeName}`;
  deleteConfirmPrompt.innerHTML = `Are you sure you want to delete <strong>${escapeHtml(name)}</strong> (ID/Code: <code>#${escapeHtml(id)}</code>)?`;
  deleteWarningNote.innerHTML = `⚠️ <strong>Foreign Key Protection:</strong> The database enforces relational integrity and blocks deletion if dependent records exist in <code>${escapeHtml(dependencyDescription)}</code>.`;

  deleteModal.classList.add('active');
}

function closeDeleteModal() {
  deleteModal.classList.remove('active');
  state.deletingTarget = null;
  confirmDeleteBtn.disabled = false;
  confirmDeleteBtn.querySelector('.btn-text').textContent = 'Delete Record';
}

confirmDeleteBtn?.addEventListener('click', async () => {
  if (!state.deletingTarget) return;

  const { type, id, name } = state.deletingTarget;
  deleteModalAlert.style.display = 'none';
  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.querySelector('.btn-text').textContent = 'Deleting...';

  let endpoint = '';
  if (type === 'student') endpoint = `${API_BASE}/api/students/${id}`;
  else if (type === 'department') endpoint = `${API_BASE}/api/departments/${id}`;
  else if (type === 'staff') endpoint = `${API_BASE}/api/staff/${id}`;
  else if (type === 'course') endpoint = `${API_BASE}/api/courses/${encodeURIComponent(id)}`;
  else if (type === 'section') endpoint = `${API_BASE}/api/sections/${id}`;
  else if (type === 'enrollment') endpoint = `${API_BASE}/api/enrollments/${id}`;

  try {
    const res = await fetch(endpoint, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok || data.status !== 'ok') {
      deleteModalAlert.className = 'form-alert form-alert-danger';
      deleteModalAlert.innerHTML = `<strong>Relational Integrity Constraint:</strong><br>${escapeHtml(data.message)}<br><small style="opacity:0.9;">${escapeHtml(data.details || '')}</small>`;
      deleteModalAlert.style.display = 'block';
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.querySelector('.btn-text').textContent = 'Delete Record';
      return;
    }

    closeDeleteModal();
    showToast(`"${name}" was deleted successfully.`, 'success');

    // Refresh active views
    if (type === 'student') loadStudents(state.currentStudentSearch);
    else if (type === 'department') loadDepartmentsList(state.currentDeptSearch);
    else if (type === 'staff') loadStaffList(state.currentStaffSearch);
    else if (type === 'course') loadCoursesList(state.currentCourseSearch);
    else if (type === 'section') loadSectionsList();
    else if (type === 'enrollment') {
      loadEnrollmentsList();
      loadStudents(state.currentStudentSearch);
    }

    loadDashboardStats();
  } catch (err) {
    console.error('Error deleting record:', err);
    deleteModalAlert.className = 'form-alert form-alert-danger';
    deleteModalAlert.textContent = 'Network or server error while deleting record.';
    deleteModalAlert.style.display = 'block';
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.querySelector('.btn-text').textContent = 'Delete Record';
  }
});

function showModalAlert(el, msg) {
  if (!el) return;
  el.className = 'form-alert form-alert-danger';
  el.textContent = msg;
  el.style.display = 'block';
}

// ============================================================
// Search & Filter Helper
// ============================================================
function setupSearchHandler(inputEl, clearBtnEl, searchCallback, stateKey) {
  let timer = null;
  inputEl?.addEventListener('input', (e) => {
    const val = e.target.value;
    state[stateKey] = val;

    if (clearBtnEl) {
      clearBtnEl.style.display = val.trim().length > 0 ? 'block' : 'none';
    }

    clearTimeout(timer);
    timer = setTimeout(() => {
      searchCallback(val);
    }, 280);
  });

  clearBtnEl?.addEventListener('click', () => {
    inputEl.value = '';
    state[stateKey] = '';
    clearBtnEl.style.display = 'none';
    searchCallback('');
  });
}

// ============================================================
// REPORTS MODULE CONTROLLER (Phase 5)
// ============================================================
const reportStatStudents = document.getElementById('reportStatStudents');
const reportStatDepartments = document.getElementById('reportStatDepartments');
const reportStatStaff = document.getElementById('reportStatStaff');
const reportStatCourses = document.getElementById('reportStatCourses');
const reportStatSections = document.getElementById('reportStatSections');
const reportStatEnrollments = document.getElementById('reportStatEnrollments');

const chartStudentsTotal = document.getElementById('chartStudentsTotal');
const chartEnrollmentsTotal = document.getElementById('chartEnrollmentsTotal');
const chartStaffTotal = document.getElementById('chartStaffTotal');

const chartStudentsByDept = document.getElementById('chartStudentsByDept');
const chartEnrollmentsByCourse = document.getElementById('chartEnrollmentsByCourse');
const chartGradeDistribution = document.getElementById('chartGradeDistribution');
const chartStaffByDept = document.getElementById('chartStaffByDept');

const reportStudentsTableBody = document.getElementById('reportStudentsTableBody');
const reportCoursesTableBody = document.getElementById('reportCoursesTableBody');
const reportEnrollmentsTableBody = document.getElementById('reportEnrollmentsTableBody');
const reportStaffTableBody = document.getElementById('reportStaffTableBody');
const reportSectionsTableBody = document.getElementById('reportSectionsTableBody');

const exportReportBtn = document.getElementById('exportReportBtn');
const exportMenu = document.getElementById('exportMenu');
const refreshReportsBtn = document.getElementById('refreshReportsBtn');

/**
 * Loads reports overview from backend and renders KPI cards, charts, and tables
 */
async function loadReportsOverview(forceRefresh = false) {
  try {
    if (forceRefresh) {
      showToast('Refreshing live reports from MySQL...', 'info', 2000);
    }

    const res = await fetch(`${API_BASE}/api/reports/overview`);
    const data = await res.json();

    if (data.status !== 'ok') {
      showToast(data.message || 'Failed to retrieve reports from server.', 'error');
      return;
    }

    state.reportsData = data;

    // 1. Populate KPI Summary Cards
    const counts = data.counts || {};
    if (reportStatStudents) reportStatStudents.textContent = counts.totalStudents ?? '--';
    if (reportStatDepartments) reportStatDepartments.textContent = counts.totalDepartments ?? '--';
    if (reportStatStaff) reportStatStaff.textContent = counts.totalStaff ?? '--';
    if (reportStatCourses) reportStatCourses.textContent = counts.totalCourses ?? '--';
    if (reportStatSections) reportStatSections.textContent = counts.totalSections ?? '--';
    if (reportStatEnrollments) reportStatEnrollments.textContent = counts.totalEnrollments ?? '--';

    if (chartStudentsTotal) chartStudentsTotal.textContent = `${counts.totalStudents || 0} Students`;
    if (chartEnrollmentsTotal) chartEnrollmentsTotal.textContent = `${counts.totalEnrollments || 0} Enrollments`;
    if (chartStaffTotal) chartStaffTotal.textContent = `${counts.totalStaff || 0} Faculty`;

    // 2. Render Visual Charts
    renderStudentsByDeptChart(data.studentsByDepartment || [], counts.totalStudents || 1);
    renderEnrollmentsByCourseChart(data.enrollmentsByCourse || [], counts.totalEnrollments || 1);
    renderGradeDistributionChart(data.gradeDistribution || [], counts.totalEnrollments || 1);
    renderStaffByDeptChart(data.staffByDepartment || [], data.staffByRole || [], counts.totalStaff || 1);

    // 3. Render Detailed Report Tables
    renderReportStudentsTable(data.studentsByDepartment || []);
    renderReportCoursesTable(data.coursesByDepartment || []);
    renderReportEnrollmentsTable(data.enrollmentsByCourse || []);
    renderReportStaffTable(data.staffByDepartment || [], data.staffByRole || []);
    renderReportSectionsTable(data.sectionsRoster || []);

    if (forceRefresh) {
      showToast('Live reports synchronized successfully!', 'success');
    }
  } catch (err) {
    console.error('Error loading reports overview:', err);
    showToast('Network error loading reports. Please check database connectivity.', 'error');
  }
}

// Chart 1: Students by Department
function renderStudentsByDeptChart(items, total) {
  if (!chartStudentsByDept) return;
  if (!items || items.length === 0) {
    chartStudentsByDept.innerHTML = '<div class="text-muted text-center" style="padding: 1.5rem;">No student department data available.</div>';
    return;
  }

  const colors = ['fill-indigo', 'fill-cyan', 'fill-emerald', 'fill-amber', 'fill-violet'];

  chartStudentsByDept.innerHTML = items.map((item, idx) => {
    const pct = parseFloat(item.percentage) || 0;
    const colorClass = colors[idx % colors.length];
    return `
      <div class="chart-bar-item">
        <div class="chart-bar-labels">
          <span class="chart-bar-name">
            <span class="badge badge-dept">${escapeHtml(item.department_name)}</span>
          </span>
          <span class="chart-bar-val">
            <strong>${item.student_count}</strong> students
            <span class="chart-bar-pct">${pct}%</span>
          </span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill ${colorClass}" style="width: ${Math.max(pct, 4)}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Chart 2: Enrollments by Course
function renderEnrollmentsByCourseChart(items, total) {
  if (!chartEnrollmentsByCourse) return;
  if (!items || items.length === 0) {
    chartEnrollmentsByCourse.innerHTML = '<div class="text-muted text-center" style="padding: 1.5rem;">No course enrollment data recorded.</div>';
    return;
  }

  chartEnrollmentsByCourse.innerHTML = items.map((item) => {
    const pct = parseFloat(item.percentage) || 0;
    return `
      <div class="chart-bar-item">
        <div class="chart-bar-labels">
          <span class="chart-bar-name">
            <strong>${escapeHtml(item.course_code)}</strong> &bull; ${escapeHtml(item.course_title)}
          </span>
          <span class="chart-bar-val">
            <strong>${item.enrollment_count}</strong> enrolled
            <span class="chart-bar-pct">${pct}%</span>
          </span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill fill-cyan" style="width: ${Math.max(pct, 3)}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Chart 3: Grade Distribution
function renderGradeDistributionChart(items, total) {
  if (!chartGradeDistribution) return;
  if (!items || items.length === 0) {
    chartGradeDistribution.innerHTML = '<div class="text-muted text-center" style="padding: 1.5rem;">No grade evaluations recorded.</div>';
    return;
  }

  chartGradeDistribution.innerHTML = items.map((item) => {
    const pct = parseFloat(item.percentage) || 0;
    const gradeStr = item.grade || 'None';
    let badgeClass = 'grade-a';
    if (gradeStr.startsWith('B')) badgeClass = 'grade-b';
    else if (gradeStr.startsWith('C')) badgeClass = 'grade-c';
    else if (gradeStr === 'F') badgeClass = 'grade-f';
    else if (gradeStr === 'Ungraded') badgeClass = 'grade-none';

    return `
      <div class="chart-bar-item">
        <div class="chart-bar-labels">
          <span class="chart-bar-name">
            <span class="grade-badge ${badgeClass}">${escapeHtml(gradeStr)}</span>
            <span class="text-muted" style="font-size: 0.8rem;">Grade Standing</span>
          </span>
          <span class="chart-bar-val">
            <strong>${item.count}</strong> record${item.count !== 1 ? 's' : ''}
            <span class="chart-bar-pct">${pct}%</span>
          </span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill fill-emerald" style="width: ${Math.max(pct, 4)}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Chart 4: Staff by Department & Roles
function renderStaffByDeptChart(deptItems, roleItems, total) {
  if (!chartStaffByDept) return;
  if (!deptItems || deptItems.length === 0) {
    chartStaffByDept.innerHTML = '<div class="text-muted text-center" style="padding: 1.5rem;">No faculty staffing data available.</div>';
    return;
  }

  let html = deptItems.map(item => {
    const count = item.staff_count || 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
      <div class="chart-bar-item">
        <div class="chart-bar-labels">
          <span class="chart-bar-name">
            <span class="badge badge-dept">${escapeHtml(item.department_name)}</span>
          </span>
          <span class="chart-bar-val">
            <strong>${count}</strong> faculty
            <span class="chart-bar-pct">${pct}%</span>
          </span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill fill-amber" style="width: ${Math.max(pct, 5)}%;"></div>
        </div>
      </div>
    `;
  }).join('');

  if (roleItems && roleItems.length > 0) {
    html += `
      <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color);">
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Academic Rank Roster:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${roleItems.map(r => `
            <span class="badge badge-staff">
              ${escapeHtml(r.role)}: <strong>${r.count}</strong>
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }

  chartStaffByDept.innerHTML = html;
}

// Table A: Students by Department Table
function renderReportStudentsTable(items) {
  if (!reportStudentsTableBody) return;
  if (!items || items.length === 0) {
    reportStudentsTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No student data.</td></tr>';
    return;
  }

  reportStudentsTableBody.innerHTML = items.map(d => {
    const pct = parseFloat(d.percentage) || 0;
    return `
      <tr>
        <td class="font-mono">${d.department_id}</td>
        <td><strong>${escapeHtml(d.department_name)}</strong></td>
        <td><span class="badge badge-students">${d.student_count} Enrolled</span></td>
        <td><strong>${pct}%</strong> of total</td>
        <td>
          <div class="mini-progress-track">
            <div class="mini-progress-fill" style="width: ${pct}%;"></div>
          </div>
          <span class="font-mono text-muted" style="font-size: 0.75rem;">${pct}%</span>
        </td>
      </tr>
    `;
  }).join('');
}

// Table B: Course Portfolio Table
function renderReportCoursesTable(items) {
  if (!reportCoursesTableBody) return;
  if (!items || items.length === 0) {
    reportCoursesTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No course data.</td></tr>';
    return;
  }

  reportCoursesTableBody.innerHTML = items.map(c => `
    <tr>
      <td class="font-mono">${c.department_id}</td>
      <td><strong>${escapeHtml(c.department_name)}</strong></td>
      <td><span class="badge badge-courses">${c.course_count} Courses</span></td>
      <td><strong class="font-mono">${c.total_credits}</strong> Credits</td>
      <td><span class="badge badge-primary">${c.avg_credits} Cr/Course</span></td>
    </tr>
  `).join('');
}

// Table C: Course Enrollment Demand Table
function renderReportEnrollmentsTable(items) {
  if (!reportEnrollmentsTableBody) return;
  if (!items || items.length === 0) {
    reportEnrollmentsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No enrollment records.</td></tr>';
    return;
  }

  reportEnrollmentsTableBody.innerHTML = items.map(e => `
    <tr>
      <td class="font-mono"><strong>${escapeHtml(e.course_code)}</strong></td>
      <td>${escapeHtml(e.course_title)}</td>
      <td><span class="badge badge-dept">${escapeHtml(e.department_name)}</span></td>
      <td class="font-mono">${e.credits} Cr</td>
      <td><span class="badge badge-enroll">${e.enrollment_count} Students</span></td>
      <td>
        <div class="mini-progress-track">
          <div class="mini-progress-fill" style="width: ${e.percentage || 0}%;"></div>
        </div>
        <span class="font-mono text-muted" style="font-size: 0.75rem;">${e.percentage || 0}%</span>
      </td>
    </tr>
  `).join('');
}

// Table D: Staff by Department Table
function renderReportStaffTable(deptItems, roleItems) {
  if (!reportStaffTableBody) return;
  if (!deptItems || deptItems.length === 0) {
    reportStaffTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No staff records.</td></tr>';
    return;
  }

  reportStaffTableBody.innerHTML = deptItems.map(s => `
    <tr>
      <td class="font-mono">${s.department_id}</td>
      <td><strong>${escapeHtml(s.department_name)}</strong></td>
      <td><span class="badge badge-staff">${s.staff_count} Member${s.staff_count !== 1 ? 's' : ''}</span></td>
      <td>
        <span class="text-muted">Faculty Assigned</span>
      </td>
    </tr>
  `).join('');
}

// Table E: Section Schedules Table
function renderReportSectionsTable(items) {
  if (!reportSectionsTableBody) return;
  if (!items || items.length === 0) {
    reportSectionsTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No section schedules.</td></tr>';
    return;
  }

  reportSectionsTableBody.innerHTML = items.map(sec => `
    <tr>
      <td class="font-mono">${sec.section_id}</td>
      <td class="font-mono"><strong>${escapeHtml(sec.course_code)}</strong></td>
      <td>${escapeHtml(sec.course_title)}</td>
      <td><span class="badge badge-primary">${escapeHtml(sec.term)}</span></td>
      <td class="font-mono">${escapeHtml(sec.section_number || 'A')}</td>
      <td><span class="room-badge">${escapeHtml(sec.room || 'TBD')}</span></td>
      <td>${escapeHtml(sec.staff_name || 'Unassigned')}</td>
      <td><span class="badge badge-enroll">${sec.enrollment_count} Enrolled</span></td>
    </tr>
  `).join('');
}

// Report Tab Filtering Logic
function setupReportTabs() {
  const tabs = document.querySelectorAll('.report-tab-btn');
  const blocks = {
    students: document.getElementById('reportBlockStudents'),
    courses: document.getElementById('reportBlockCourses'),
    enrollments: document.getElementById('reportBlockEnrollments'),
    staff: document.getElementById('reportBlockStaff'),
    sections: document.getElementById('reportBlockSections')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-report-tab');

      if (target === 'all') {
        Object.values(blocks).forEach(b => { if (b) b.style.display = 'block'; });
      } else {
        Object.keys(blocks).forEach(key => {
          if (blocks[key]) {
            blocks[key].style.display = key === target ? 'block' : 'none';
          }
        });
        // Smooth scroll to the filtered block
        blocks[target]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
}

// CSV Export Engine
function exportReportToCsv(type) {
  if (!state.reportsData) {
    showToast('Report data is still loading. Please wait a moment...', 'warning');
    return;
  }

  const data = state.reportsData;
  let csvRows = [];
  const timestamp = new Date().toISOString().slice(0, 10);
  let filename = `university_${type}_report_${timestamp}.csv`;

  if (type === 'students') {
    csvRows.push(['Department ID', 'Department Name', 'Student Count', 'Percentage Share (%)']);
    (data.studentsByDepartment || []).forEach(d => {
      csvRows.push([d.department_id, `"${(d.department_name || '').replace(/"/g, '""')}"`, d.student_count, d.percentage]);
    });
  } else if (type === 'courses') {
    csvRows.push(['Department ID', 'Department Name', 'Courses Offered', 'Total Credits', 'Average Credits per Course']);
    (data.coursesByDepartment || []).forEach(d => {
      csvRows.push([d.department_id, `"${(d.department_name || '').replace(/"/g, '""')}"`, d.course_count, d.total_credits, d.avg_credits]);
    });
  } else if (type === 'enrollments') {
    csvRows.push(['Course Code', 'Course Title', 'Department Name', 'Credits', 'Enrolled Students', 'Enrollment Share (%)']);
    (data.enrollmentsByCourse || []).forEach(e => {
      csvRows.push([
        `"${e.course_code}"`,
        `"${(e.course_title || '').replace(/"/g, '""')}"`,
        `"${(e.department_name || '').replace(/"/g, '""')}"`,
        e.credits,
        e.enrollment_count,
        e.percentage
      ]);
    });
  } else if (type === 'staff') {
    csvRows.push(['Department ID', 'Department Name', 'Faculty Count']);
    (data.staffByDepartment || []).forEach(s => {
      csvRows.push([s.department_id, `"${(s.department_name || '').replace(/"/g, '""')}"`, s.staff_count]);
    });
  } else if (type === 'sections') {
    csvRows.push(['Section ID', 'Course Code', 'Course Title', 'Term', 'Section #', 'Room', 'Instructor', 'Enrolled Students']);
    (data.sectionsRoster || []).forEach(s => {
      csvRows.push([
        s.section_id,
        `"${s.course_code}"`,
        `"${(s.course_title || '').replace(/"/g, '""')}"`,
        `"${(s.term || '').replace(/"/g, '""')}"`,
        `"${s.section_number || 'A'}"`,
        `"${s.room || 'TBD'}"`,
        `"${(s.staff_name || 'Unassigned').replace(/"/g, '""')}"`,
        s.enrollment_count
      ]);
    });
  }

  if (csvRows.length <= 1) {
    showToast(`No records found to export for ${type}.`, 'warning');
    return;
  }

  const csvString = csvRows.map(row => row.join(',')).join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast(`Exported ${type.toUpperCase()} report successfully!`, 'success');
}

// ============================================================
// Initialization & Event Setup
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Health Probe
  checkSystemHealth();
  setInterval(checkSystemHealth, 15000);

  // 2. Preload dropdown catalogs
  preloadCatalogs();

  // 3. Load initial dashboard stats
  loadDashboardStats();

  // Navigation Links
  navDashboard?.addEventListener('click', () => switchView('dashboard'));
  navStudents?.addEventListener('click', () => switchView('students'));
  navDepartments?.addEventListener('click', () => switchView('departments'));
  navStaff?.addEventListener('click', () => switchView('staff'));
  navCourses?.addEventListener('click', () => switchView('courses'));
  navSections?.addEventListener('click', () => switchView('sections'));
  navEnrollments?.addEventListener('click', () => switchView('enrollments'));
  navReports?.addEventListener('click', () => switchView('reports'));
  btnGoToStudents?.addEventListener('click', () => switchView('students'));

  // Reports Module Handlers (Phase 5)
  setupReportTabs();
  refreshReportsBtn?.addEventListener('click', () => loadReportsOverview(true));

  exportReportBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    exportMenu?.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (exportMenu && !exportReportBtn?.contains(e.target) && !exportMenu.contains(e.target)) {
      exportMenu.classList.remove('active');
    }
  });

  document.querySelectorAll('.export-menu-item').forEach(btn => {
    btn.addEventListener('click', () => {
      exportMenu?.classList.remove('active');
      const type = btn.getAttribute('data-export');
      if (type) exportReportToCsv(type);
    });
  });

  document.querySelectorAll('.export-single-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-export');
      if (type) exportReportToCsv(type);
    });
  });

  // Placeholder Modules (Coming Soon)
  document.querySelectorAll('.nav-item-disabled').forEach(btn => {
    btn.addEventListener('click', () => {
      const moduleName = btn.getAttribute('data-module') || 'Academic';
      openComingSoon(moduleName);
    });
  });

  closeComingSoonBtn?.addEventListener('click', closeComingSoon);
  ackComingSoonBtn?.addEventListener('click', closeComingSoon);

  // Refresh Stats Button
  refreshStatsBtn?.addEventListener('click', () => {
    checkSystemHealth();
    if (state.activeView === 'dashboard') loadDashboardStats();
    else if (state.activeView === 'students') loadStudents(state.currentStudentSearch);
    else if (state.activeView === 'departments') loadDepartmentsList(state.currentDeptSearch);
    else if (state.activeView === 'staff') loadStaffList(state.currentStaffSearch);
    else if (state.activeView === 'courses') loadCoursesList(state.currentCourseSearch);
    else if (state.activeView === 'sections') loadSectionsList();
    else if (state.activeView === 'enrollments') loadEnrollmentsList();
    else if (state.activeView === 'reports') loadReportsOverview(true);
  });

  // Modal Open Buttons
  openAddStudentBtn?.addEventListener('click', openAddStudentModal);
  openAddDeptBtn?.addEventListener('click', openAddDeptModal);
  openAddStaffBtn?.addEventListener('click', openAddStaffModal);
  openAddCourseBtn?.addEventListener('click', openAddCourseModal);
  openAddSectionBtn?.addEventListener('click', openAddSectionModal);
  openAddEnrollmentBtn?.addEventListener('click', openAddEnrollmentModal);

  // Modal Close Buttons
  closeStudentModalBtn?.addEventListener('click', () => studentModal.classList.remove('active'));
  cancelStudentModalBtn?.addEventListener('click', () => studentModal.classList.remove('active'));

  closeDeptModalBtn?.addEventListener('click', () => departmentModal.classList.remove('active'));
  cancelDeptModalBtn?.addEventListener('click', () => departmentModal.classList.remove('active'));

  closeStaffModalBtn?.addEventListener('click', () => staffModal.classList.remove('active'));
  cancelStaffModalBtn?.addEventListener('click', () => staffModal.classList.remove('active'));

  closeCourseModalBtn?.addEventListener('click', () => courseModal.classList.remove('active'));
  cancelCourseModalBtn?.addEventListener('click', () => courseModal.classList.remove('active'));

  closeSectionModalBtn?.addEventListener('click', () => sectionModal.classList.remove('active'));
  cancelSectionModalBtn?.addEventListener('click', () => sectionModal.classList.remove('active'));

  closeEnrollmentModalBtn?.addEventListener('click', () => enrollmentModal.classList.remove('active'));
  cancelEnrollmentModalBtn?.addEventListener('click', () => enrollmentModal.classList.remove('active'));

  closeDeleteModalBtn?.addEventListener('click', closeDeleteModal);
  cancelDeleteBtn?.addEventListener('click', closeDeleteModal);

  // Search setup
  setupSearchHandler(studentSearchInput, clearStudentSearchBtn, loadStudents, 'currentStudentSearch');
  setupSearchHandler(deptSearchInput, clearDeptSearchBtn, loadDepartmentsList, 'currentDeptSearch');
  setupSearchHandler(staffSearchInput, clearStaffSearchBtn, loadStaffList, 'currentStaffSearch');
  setupSearchHandler(courseSearchInput, clearCourseSearchBtn, loadCoursesList, 'currentCourseSearch');
  setupSearchHandler(sectionSearchInput, clearSectionSearchBtn, loadSectionsList, 'currentSectionSearch');
  setupSearchHandler(enrollmentSearchInput, clearEnrollmentSearchBtn, loadEnrollmentsList, 'currentEnrollmentSearch');

  // Filter dropdown listeners for Sections
  filterSectionTerm?.addEventListener('change', (e) => {
    state.sectionFilterTerm = e.target.value;
    loadSectionsList();
  });

  filterSectionCourse?.addEventListener('change', (e) => {
    state.sectionFilterCourse = e.target.value;
    loadSectionsList();
  });

  // Filter dropdown listeners for Enrollments
  filterEnrollmentCourse?.addEventListener('change', (e) => {
    state.enrollmentFilterCourse = e.target.value;
    loadEnrollmentsList();
  });

  filterEnrollmentGrade?.addEventListener('change', (e) => {
    state.enrollmentFilterGrade = e.target.value;
    loadEnrollmentsList();
  });

  // Backdrop click closing for all modals
  [studentModal, departmentModal, staffModal, courseModal, sectionModal, enrollmentModal, deleteModal, comingSoonModal].forEach(modal => {
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });
});
