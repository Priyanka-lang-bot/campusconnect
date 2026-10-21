// Parent route for /study/*. It loads the subject list once and shares it
// with the nested child routes through <Outlet context>, so both the overview
// and the subject detail page can read and refresh it.
import { Outlet, useOutletContext } from 'react-router-dom';
import { studyApi } from '../../api/endpoints.js';
import { useApi } from '../../hooks/useApi.js';
import { ErrorState, PageSkeleton } from '../../components/ui/States.jsx';

export default function StudyLayout() {
  const { data: subjects, loading, error, reload, refresh } = useApi((signal) => studyApi.subjects({ signal }), []);

  if (loading && !subjects) return <PageSkeleton cards={3} />;
  if (error && !subjects) return <ErrorState error={error} onRetry={reload} title="Could not load your study planner" />;

  return <Outlet context={{ subjects, refreshSubjects: refresh }} />;
}

export const useStudyContext = () => useOutletContext();
