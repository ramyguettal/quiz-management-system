#  Integration Tests Demonstration Guide

##  Overview
The integration tests now use an **In-Memory Database**, so **Docker is NOT required**. The tests run faster and are self-contained.

Authentication is also handled automatically using a special **TestAuthHandler** that simulates an Administrator user for all tests.

---

##  How to Run the Tests

Open PowerShell and navigate to the project:
```powershell
cd c:\Users\khale\OneDrive\Desktop\quiz-management-system\backend\quiz-management-system
```

### Run All Integration Tests
```powershell
dotnet test quiz-management-system.IntegrationTests
```

### Run with Detailed Output
```powershell
dotnet test quiz-management-system.IntegrationTests --verbosity normal
```

---

