import React, { Suspense } from "react";
import logo from "./logo.svg";
import "./App.css";
import { StatsCard } from "./components/StatsCard";
import { Activity } from "lucide-react";

// ...existing code...
const EnhancedStudentDashboard = React.lazy(() =>
  import("./components/student/EnhancedStudentDashboard").then((mod) => ({
    default: // adjust the identifier if the component is exported with a different name
      // e.g. if file exports `export function EnhancedStudentDashboard()` use `mod.EnhancedStudentDashboard`
      // or if it exports `export default EnhancedStudentDashboard` this mapping is not needed.
      (mod as any).EnhancedStudentDashboard ?? (mod as any).default,
  }))
);

const EnhancedAvailableQuizzes = React.lazy(() =>
  import("./components/student/EnhancedAvailableQuizzes").then((mod) => ({
    default: (mod as any).EnhancedAvailableQuizzes ?? (mod as any).default,
  }))
);
// ...existing code...

function App() {
  return (
    <div className="App">
      <main className="p-4">
        <section className="mb-5">
          <StatsCard
            title="Active Students"
            value={128}
            icon={Activity}
            description="Students active this week"
            trend="+8%"
          />
        </section>

        <section>
          <Suspense fallback={<div>Loading student components...</div>}>
            <EnhancedStudentDashboard />
            <EnhancedAvailableQuizzes />
          </Suspense>
        </section>
      </main>
    </div>
  );
}

export default App;