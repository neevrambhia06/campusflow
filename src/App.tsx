import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Assignments } from './pages/Assignments';
import { AssignmentDetail } from './pages/AssignmentDetail';
import { Subjects } from './pages/Subjects';
import { SubjectDetail } from './pages/SubjectDetail';
import { CalendarPage } from './pages/Calendar';
import { Submissions } from './pages/Submissions';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="assignments/:id" element={<AssignmentDetail />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="subjects/:id" element={<SubjectDetail />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="settings" element={<div className="p-8 text-center text-slate-500">Settings page coming soon.</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
