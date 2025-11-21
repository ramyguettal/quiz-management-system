Quiz Management System – Requirements Analysis
1. Introduction

This document presents the collected, analyzed, and prioritized requirements for the Quiz Management System (Web Platform) developed by Group 1 – Team 2 for the Software Engineering module. It defines scope, stakeholders, functional and non-functional requirements, user stories, data models, constraints, and the prioritized MVP backlog.
The objective is to provide a stable foundation for design, implementation, testing, and deployment.

2. Purpose and Objectives

Purpose:
To serve as the single, authoritative reference describing what the system must do and under what constraints. This SRS-style analysis guides all SDLC phases.

Objectives:

Define clear, testable functional requirements for the MVP and later iterations.

Specify non-functional requirements (performance, security, maintainability, accessibility).

Identify stakeholders and responsibilities.

Provide acceptance criteria and a prioritized backlog for sprint planning.

3. Stakeholders & Users

Primary stakeholders:

Instructors

Students

Administrators (IT staff)

Project sponsors:

Okba Tibermacine

Khadija Chettah

Development Team – Group 1, Team 2:

Leader: Mohamed Ramy Guettal

Nour Tilba

Khaled Zaabat

Imad Eddine Smail

Nasrellah Kharroubi

Mokhlis Yacine Bouyahia

External references:

Comparable quiz systems such as Wooclap.

4. Scope of the System

In Scope:

Web-based Quiz Management System with role-based access (Admin, Instructor, Student).

MVP features: authentication, quiz creation, quiz taking, automatic grading for MCQs, attempt storage, basic analytics, notifications.

Instructor customization of questions and access to student progress.

Admin dashboard for user and quiz management.

5. Method of Requirements Elicitation

Requirements were gathered through:

Team meetings (Oct 1, Oct 8, Oct 14, 2025)

Competitive analysis of tools like Wooclap

Brainstorming and workflow simulations

Feasibility and task-based role discussions

6. Functional Requirements (FR)
FR-01: User Authentication

The system shall allow registration and authentication using email and password. Supports roles (admin, instructor, student).
Acceptance: Valid users log in; passwords are hashed.

FR-02: Role-Based Access Control (RBAC)

Permissions enforced based on role.
Acceptance: Users cannot access unauthorized features.

FR-03: Quiz Creation and Management (Instructor)

Instructors create, edit, schedule, and delete quizzes. Supports MCQ and short-answer.
Acceptance: Instructor can publish a quiz with at least one question.

FR-04: Question Editor

Rich text support, choices, correct answers, optional time limits and explanations.
Acceptance: Question preview displays correctly.

FR-05: Taking a Quiz (Student)

Students can start quizzes within schedule, answer questions, and submit using a visible timer.
Acceptance: Students receive instant auto-graded results.

FR-06: Automatic Grading and Attempt Storage

MCQs are auto-graded; attempts stored with timestamps and scores.
Acceptance: Attempt stored and graded after submission.

FR-07: Instructor Analytics

Per-quiz statistics (average scores, distributions, difficulty indicators).
Acceptance: Instructor can view analytics page.

FR-08: Admin Dashboard

User CRUD operations and system-level statistics.
Acceptance: Admin can manage users successfully.

FR-09: Notifications

Instructors/Admins may send in-app notifications to students.
Acceptance: Notification visible to intended recipients.

FR-10: Export / Import

Export quiz results to CSV and import question banks via CSV/JSON.
Acceptance: Successful CSV export.

7. Non-Functional Requirements (NFR)

Performance (NFR-01): API responses < 500ms under normal load; handle 100 concurrent users.

Security (NFR-02): Hashed passwords, JWT authentication, sanitized inputs.

Availability (NFR-03): 99% uptime during demo phase.

Scalability (NFR-04): Backend and DB architecture support horizontal scaling.

Maintainability (NFR-05): Modular codebase, documented, >60% unit test coverage.

Usability (NFR-06): Responsive UI, accessibility best practices.

Portability (NFR-07): Dockerized system.

Privacy (NFR-08): Student data accessible only to authorized users.

8. User Stories / Use Cases

US-01: As an Instructor, I want to create and schedule quizzes so students can take them on time.
US-02: As a Student, I want to take a timed quiz and receive immediate MCQ results.
US-03: As an Admin, I want to manage users and roles.
US-04: As an Instructor, I want to view analytics to understand question difficulty.
US-05: As a Student, I want to view my past attempts and track progress.

Use Case Example: Create Quiz

Actor: Instructor
Main Flow:

Instructor navigates to /instructor/new-quiz

Enters metadata (title, description, schedule)

Adds questions

Saves and publishes
Postcondition: Quiz stored and scheduled.

9. High-Level Data Model

Entities:

User: id, name, email, role, hashed_password, created_at

Quiz: id, instructor_id, title, description, start_time, end_time, settings

Question: id, quiz_id, content, type, options, correct_answer, points

Attempt: id, quiz_id, student_id, start_time, end_time, answers, score

Notification: id, sender_id, recipient_ids, message, created_at

10. High-Level API Endpoints (Sample)
POST /api/auth/register
POST /api/auth/login
GET  /api/quizzes
POST /api/quizzes
GET  /api/quizzes/{id}
POST /api/quizzes/{id}/attempts
GET  /api/quizzes/{id}/analytics
GET  /api/admin/users
POST /api/notifications

11. System Constraints & Assumptions

Frontend: React.js with Tailwind CSS

Backend: ASP.NET (final choice for implementation)

Database: PostgreSQL

Version control using GitHub and PR workflow

Docker for local development and staging deployment

12. MoSCoW Prioritization for MVP

Must Have:

Authentication and RBAC

Quiz creation and editing

Quiz taking with MCQ auto-grading

Attempt storage

Admin user management

Should Have:

Instructor analytics

Notifications

Responsive and accessible UI

Could Have:

CSV export

Question bank import

Additional question types

Won’t Have:

Advanced proctoring or plagiarism detection

Large-scale enterprise features

13. Acceptance Criteria / Definition of Done

Feature implemented with unit and integration tests

End-to-end test for main workflow

Code reviewed and merged via PR

Deployed to Docker-based staging environment

14. Traceability & Change Control

A traceability matrix will link:

Requirements

Design components

Implementation tasks

Test cases

Acceptance criteria

All requirement changes must be logged with justification and impact analysis.

15. Risks & Mitigations

Backend uncertainty: Resolved by choosing ASP.NET

Scope creep: Controlled through MoSCoW prioritization

Security vulnerabilities: Addressed through sanitization and reviews

Integration issues: Mitigated with API contract (OpenAPI) and mock endpoint