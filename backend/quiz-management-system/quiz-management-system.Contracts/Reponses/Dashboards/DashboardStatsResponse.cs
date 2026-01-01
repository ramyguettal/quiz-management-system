using quiz_management_system.Contracts.Reponses.Courses;
using System;
using System.Collections.Generic;
using System.Text;

namespace quiz_management_system.Contracts.Reponses.Dashboards;

public sealed record DashboardStatsResponse(
    int TotalCourses,
    int PublishedQuizzes,
    int DraftQuizzes,
    int ClosedQuizzes,
    int TotalStudents,
    int TotalInstructors,
    IReadOnlyList<CourseResponse> CourseResponses
);


