# 📘 **Quiz Management System – README**

> **Proprietary Software — Access Restricted**
> This system is licensed under a **proprietary, closed-source license**.
> Usage is strictly limited to **partnered organizations**.
> Redistribution, copying, or reverse engineering is prohibited.

---

## 📌 **Overview**

The **Quiz Management System (QMS)** is a web-based platform for creating, assigning, taking, and grading quizzes.
It supports **Admins**, **Teachers**, and **Students**, each with dedicated dashboards and workflows.
This README summarizes the system’s scope, sprint requirements, features, and constraints.

---

## 🎯 **Purpose**

Provide a secure, role-based quiz system with:

* Instructor quiz creation
* Student quiz-taking
* Auto-grading
* Analytics
* Admin user management

---

## 👥 **Stakeholders**

* **Admins** – manage users & system data
* **Teachers** – create quizzes & review results
* **Students** – take quizzes & view grades
* **Sponsors:** Okba Tibermacine, Khadija Chettah
* **Team (Group 1, Team 2):**
  Mohamed Ramy Guettal (Lead), Nour Tilba, Khaled Zaabat,
  Imad Eddine Smail, Nasrellah Kharroubi, Mokhlis Yacine Bouyahia

---

## 📦 **System Scope**

### **In Scope**

* Authentication & RBAC
* Quiz creation/editing
* Taking quizzes (timer, autosave)
* MCQ auto-grading
* Basic teacher analytics
* Student dashboards
* Admin CRUD (students/teachers)
* CSV/JSON import/export
* Notifications

### **Out of Scope**

* Proctoring
* AI features
* DevOps pipeline
* Public/enterprise deployment outside partners

---

# 🧩 **Functional Requirements (FR)**

### **FR-01: Authentication**

Email/password login, hashed passwords, redirects based on role.

### **FR-02: RBAC**

Admin/Teacher/Student privileges enforced across the system.

### **FR-03: Quiz Creation (Teacher)**

Create/edit/delete quizzes, set schedule, metadata, and question types.

### **FR-04: Question Editor**

Rich text, MCQ/short answer, correct answer selection, optional time limits.

### **FR-05: Quiz Taking (Student)**

Start quizzes within schedule, timer display, autosave, submit attempt.

### **FR-06: Auto-Grading + Attempt Storage**

Auto-grade MCQs; store attempts, answers, timestamp, score.

### **FR-07: Teacher Analytics (Basic)**

View attempt list, average score, question difficulty indicators.

### **FR-08: Admin Dashboard**

Student CRUD, teacher CRUD, quiz monitoring, activity overview.

### **FR-09: Notifications**

Admin/Teacher send notifications; Students view notifications.

### **FR-10: Import/Export**

Import students (CSV/JSON); export quiz results.

---

# ⚙️ **Non-Functional Requirements (NFR)**

### **NFR-01: Performance**

API latency < 500ms; support 100 concurrent users.

### **NFR-02: Security**

JWT, hashed passwords, sanitized inputs, strict RBAC.

### **NFR-03: Availability**

99% uptime during demo periods.

### **NFR-04: Scalability**

Architecture supports horizontal scaling (future-ready).

### **NFR-05: Maintainability**

Modular codebase, consistent standards, 60%+ test coverage (target).

### **NFR-06: Usability**

Responsive UI, accessible layouts.

### **NFR-07: Portability**

Dockerized services.

### **NFR-08: Privacy**

Student data restricted to authorized roles only.

---

# 🖥️ **Features Overview**

### **Admin**

* Dashboard: activities, ongoing quizzes
* Student CRUD + CSV/JSON import
* Teacher CRUD + course assignment
* Quiz monitoring
* Notifications

### **Teacher**

* Dashboard: courses, quizzes
* Create/update quizzes
* View submissions & statistics
* Manual grading for non-MCQ
* Export results

### **Student**

* Dashboard: ongoing, upcoming, previous quizzes
* Take quizzes (autosave + timer)
* Immediate MCQ feedback
* View past attempts
* Personal statistics

---

# 📚 **User Stories**

### **Admin**

* **US-A1:** The system shall allow the Administrator to manage user accounts, including creation, modification, and removal, to ensure proper platform maintenance.
* **US-A2:** The system shall allow the Administrator to assign and update user roles to maintain correct access privileges.
* **US-A3:** The system shall allow the Administrator to monitor platform activity and quiz status to ensure operational integrity.

### **Teacher**

* **US-T1:** The system shall allow the Teacher to create, configure, and publish quizzes so that assessments can be delivered to students.
* **US-T2:** The system shall allow the Teacher to view quiz analytics, including performance summaries, to evaluate student understanding.
* **US-T3:** The system shall allow the Teacher to manually grade non-automatically graded responses to finalize student scores.

### **Student**

* **US-S1:** The system shall allow the Student to attempt quizzes within the defined schedule so that assessments are completed on time.
* **US-S2:** The system shall allow the Student to view quiz results, including automatically and manually graded components, to monitor performance.
* **US-S3:** The system shall allow the Student to access records of past attempts and performance indicators to track academic progress.

---

# 🧪 **Use Cases**

---

## **UC-01: Create Quiz (Teacher)**

**Primary Actor:** Teacher
**Preconditions:** Teacher is authenticated and has appropriate permissions.
**Postconditions:** A new quiz is created and stored; optionally published based on configuration.

**Main Flow:**

1. The Teacher navigates to the *Create Quiz* interface.
2. The system displays fields for quiz metadata (title, description, schedule).
3. The Teacher enters metadata and proceeds to question creation.
4. The Teacher adds one or more questions and specifies question types and correct answers.
5. The Teacher configures quiz settings (timer, visibility, scoring).
6. The Teacher selects *Publish* or *Save as Draft*.
7. The system validates input and stores the quiz.

**Alternate Flows:**

* 6A. If validation errors are detected, the system displays an error message and prompts correction.

---

## **UC-02: Take Quiz (Student)**

**Primary Actor:** Student
**Preconditions:** The quiz is active and the Student is authorized to take it.
**Postconditions:** A submitted attempt is stored; automatic grading is performed.

**Main Flow:**

1. The Student selects an available quiz from the dashboard.
2. The system loads the quiz and initializes the timer (if applicable).
3. The Student answers each question; the system autosaves progress.
4. The Student submits the quiz.
5. The system stores the attempt and performs automatic grading for MCQs.
6. The system presents the available results to the Student.

**Alternate Flows:**

* 3A. If connection issues occur, autosave ensures no loss of progress.
* 4A. If time expires, the system auto-submits the attempt.

---

## **UC-03: Manage Students (Admin)**

**Primary Actor:** Administrator
**Preconditions:** Administrator is authenticated and authorized.
**Postconditions:** Student accounts are added, updated, or removed from the system.

**Main Flow:**

1. The Administrator opens the *User Management* interface.
2. The system displays the list of existing student accounts.
3. The Administrator selects an operation: add, modify, or remove.
4. The Administrator provides or edits the required student information.
5. The system validates and updates the records accordingly.

**Alternate Flows:**

* 4A. Missing or invalid information triggers a validation error.

---

## **UC-04: Manual Grading (Teacher)**

**Primary Actor:** Teacher
**Preconditions:** A submitted attempt contains questions that require manual grading.
**Postconditions:** Final score is updated and stored.

**Main Flow:**

1. The Teacher accesses the *Submissions* section for a quiz.
2. The system displays attempts requiring manual grading.
3. The Teacher selects a specific attempt.
4. The Teacher reviews each written or short-answer response.
5. The Teacher assigns scores to each manually graded item.
6. The Teacher confirms the grading.
7. The system updates the final attempt score and stores it.

**Alternate Flows:**

* 5A. If the Teacher omits required inputs, the system displays a notification requesting completion.

---

# 🗄️ **Data Model (High-Level)**

* **User:** id, name, email, role, hashed_password, year, group
* **Quiz:** id, instructor_id, title, schedule, settings
* **Question:** id, quiz_id, type, content, options, correct_answer, points
* **Attempt:** id, quiz_id, student_id, timestamp, answers, score
* **Notification:** id, sender_id, recipients, message, created_at

---

# 🧱 **Tech Stack**

| Layer      | Technology           |
| ---------- | -------------------- |
| Frontend   | React + Tailwind     |
| Backend    | ASP.NET Core         |
| Database   | PostgreSQL           |
| Deployment | Docker               |
| VCS        | GitHub + PR workflow |

---

# 🗂️ **MoSCoW Prioritization**

### **Must Have**

Auth/RBAC, quiz creation, quiz taking, auto-grading, attempt storage, admin CRUD, dashboards.

### **Should Have**

Analytics, notifications, imports, manual grading.

### **Could Have**

Collaboration, multi-language support, deeper analytics.

### **Won’t Have**

AI proctoring, surveillance features, enterprise scaling.

---

# ✔️ **Acceptance Criteria**

A feature is DONE when:

* FR/NFR satisfied
* Unit + integration tests pass
* Reviewed & merged via PR
* Deployed on staging
* Linked in traceability matrix

---

# 🔁 **Traceability & Change Control**

Requirements ↔ Design ↔ Tasks ↔ Tests
All changes require justification and impact review.

---

# ⚠️ **Risks & Mitigations**

| Risk                   | Mitigation            |
| ---------------------- | --------------------- |
| Scope creep            | MoSCoW control        |
| Security flaws         | Review + sanitization |
| Integration issues     | API contract & mocks  |
| Tech stack uncertainty | Finalized as ASP.NET  |

---

# 🔒 **License**

**© 2025 — Group 1, Team 2. All Rights Reserved.**
This software is **proprietary**.
Access is limited exclusively to **partner institutions**.
Unauthorized use is strictly prohibited.