// Route table. Pages are lazy-loaded so each page's code is downloaded only
// when it is first visited (the AppShell shows a skeleton meanwhile).
import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell.jsx';

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard.jsx'));
const TasksPage = lazy(() => import('./pages/Tasks/TasksPage.jsx'));
const StudyLayout = lazy(() => import('./pages/Study/StudyLayout.jsx'));
const StudyOverview = lazy(() => import('./pages/Study/StudyOverview.jsx'));
const SubjectDetail = lazy(() => import('./pages/Study/SubjectDetail.jsx'));
const EventsPage = lazy(() => import('./pages/Events/EventsPage.jsx'));
const EventDetail = lazy(() => import('./pages/Events/EventDetail.jsx'));
const ResourcesPage = lazy(() => import('./pages/Resources/ResourcesPage.jsx'));
const SettingsLayout = lazy(() => import('./pages/Settings/SettingsLayout.jsx'));
const ProfileSettings = lazy(() => import('./pages/Settings/ProfileSettings.jsx'));
const PreferenceSettings = lazy(() => import('./pages/Settings/PreferenceSettings.jsx'));
const FeedbackPage = lazy(() => import('./pages/Feedback/FeedbackPage.jsx'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound.jsx'));

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<TasksPage />} />

        {/* Nested routes: /study and /study/subjects/:subjectId share StudyLayout */}
        <Route path="study" element={<StudyLayout />}>
          <Route index element={<StudyOverview />} />
          <Route path="subjects/:subjectId" element={<SubjectDetail />} />
        </Route>

        {/* Route parameter: /events/:eventId */}
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:eventId" element={<EventDetail />} />

        {/* Optional parameter: /resources and /resources/:category */}
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="resources/:category" element={<ResourcesPage />} />

        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="preferences" element={<PreferenceSettings />} />
        </Route>

        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
