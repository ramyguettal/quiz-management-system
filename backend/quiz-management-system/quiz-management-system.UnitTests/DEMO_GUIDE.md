# 🧪 Unit Tests Demonstration Guide

## Quick Demo Commands

Open PowerShell and navigate to the project:
```powershell
cd c:\Users\khale\OneDrive\Desktop\quiz-management-system\backend\quiz-management-system
```

### Run All Tests
```powershell
dotnet test quiz-management-system.UnitTests
```

### Run with Detailed Output (Best for Demo)
```powershell
dotnet test quiz-management-system.UnitTests --verbosity normal
```

### Run Specific Test Classes
```powershell
# Course tests
dotnet test quiz-management-system.UnitTests --filter "CreateCourseCommandHandlerTests"

# Quiz tests
dotnet test quiz-management-system.UnitTests --filter "CreateQuizCommandHandlerTests"

# Student tests  
dotnet test quiz-management-system.UnitTests --filter "CreateStudentHandlerTests"
```

