import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { studyApi, tasksApi } from '../../api/endpoints.js';
import { useApi } from '../../hooks/useApi.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import { useDocumentTitle, useKeyboardShortcut } from '../../hooks/useDomEvents.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { FilterChips, SearchInput } from '../../components/ui/Filters.jsx';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/ui/States.jsx';
import { ProgressBar } from '../../components/ui/Progress.jsx';
import TaskList from './TaskList.jsx';
import TaskForm from './TaskForm.jsx';
import { todayKey } from '../../utils/format.js';
import { indexById } from '../../utils/subjects.js';
import styles from './Tasks.module.css';

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
const DEFAULT_FILTERS = { status: 'all', priority: 'all', subjectId: 'all', sort: 'dueDate' };

export default function TasksPage() {
  useDocumentTitle('My Tasks');
  const toast = useToast();
  const { preferences } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchRef = useRef(null);

  // Load tasks and subjects in parallel with Promise.all.
  const { data, loading, error, reload, setData } = useApi(
    (signal) => Promise.all([tasksApi.list({}, { signal }), studyApi.subjects({ signal })]).then(([tasks, subjects]) => ({ tasks, subjects })),
    [],
  );

  // Filters persist in localStorage so the page reopens the way you left it.
  const [filters, setFilters] = useLocalStorage('taskFilters', DEFAULT_FILTERS);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query);
  const [editor, setEditor] = useState({ open: false, task: null, key: 0 });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // "/" focuses search — a document-level keyboard listener.
  useKeyboardShortcut('/', (event) => {
    event.preventDefault();
    searchRef.current?.focus();
  });

  // /tasks?new=1 (from the top bar or dashboard) opens the create dialog.
  useEffect(() => {
    if (searchParams.get('new')) {
      setEditor((prev) => ({ open: true, task: null, key: prev.key + 1 }));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const tasks = data?.tasks ?? [];
  const subjects = data?.subjects ?? [];
  const subjectsById = useMemo(() => indexById(subjects), [subjects]);

  // useMemo: recompute the visible list only when tasks or filters change.
  const visibleTasks = useMemo(() => {
    const today = todayKey();
    const term = debouncedQuery.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (filters.status === 'overdue') return t.status !== 'done' && t.dueDate < today;
        if (filters.status === 'all') return preferences.showCompletedTasks || t.status !== 'done';
        return t.status === filters.status;
      })
      .filter((t) => filters.priority === 'all' || t.priority === filters.priority)
      .filter((t) => filters.subjectId === 'all' || t.subjectId === filters.subjectId)
      .filter((t) => !term || [t.title, t.description, ...t.tags].join(' ').toLowerCase().includes(term))
      .sort((a, b) => {
        if (filters.sort === 'priority') return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.dueDate.localeCompare(b.dueDate);
        if (filters.sort === 'title') return a.title.localeCompare(b.title);
        // Default: open tasks first, then by due date.
        return (a.status === 'done') - (b.status === 'done') || a.dueDate.localeCompare(b.dueDate);
      });
  }, [tasks, filters, debouncedQuery, preferences.showCompletedTasks]);

  const counts = useMemo(() => {
    const today = todayKey();
    return {
      all: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
      overdue: tasks.filter((t) => t.status !== 'done' && t.dueDate < today).length,
    };
  }, [tasks]);

  const replaceTask = useCallback((updated) => setData((prev) => ({ ...prev, tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)) })), [setData]);

  // useCallback keeps these handler identities stable so memo(TaskItem) works.
  const handleToggle = useCallback(
    async (task) => {
      const nextStatus = task.status === 'done' ? 'todo' : 'done';
      replaceTask({ ...task, status: nextStatus }); // optimistic update
      try {
        replaceTask(await tasksApi.update(task.id, { status: nextStatus }));
        if (nextStatus === 'done') toast.success(`Nice! “${task.title}” is done.`);
      } catch (err) {
        replaceTask(task); // roll back
        toast.error(`Could not update task: ${err.message}`);
      }
    },
    [replaceTask, toast],
  );

  const handleEdit = useCallback((task) => setEditor((prev) => ({ open: true, task, key: prev.key + 1 })), []);

  const deleteTask = useCallback(
    async (task) => {
      await tasksApi.remove(task.id);
      setData((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== task.id) }));
      toast.success(`Deleted “${task.title}”`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            const { id, createdAt, updatedAt, ...restorable } = task;
            try {
              const restored = await tasksApi.create(restorable);
              setData((prev) => ({ ...prev, tasks: [...prev.tasks, restored] }));
            } catch (err) {
              toast.error(err.message);
            }
          },
        },
      });
    },
    [setData, toast],
  );

  const handleDelete = useCallback(
    (task) => {
      if (preferences.confirmDeletes) setPendingDelete(task);
      else deleteTask(task).catch((err) => toast.error(err.message));
    },
    [preferences.confirmDeletes, deleteTask, toast],
  );

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(pendingDelete);
      setPendingDelete(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (payload) => {
    if (editor.task) {
      replaceTask(await tasksApi.replace(editor.task.id, payload));
      toast.success('Task updated');
    } else {
      const created = await tasksApi.create(payload);
      setData((prev) => ({ ...prev, tasks: [...prev.tasks, created] }));
      toast.success('Task added');
    }
    setEditor((prev) => ({ ...prev, open: false }));
  };

  const setFilter = (key) => (value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const filtersActive = query || filters.status !== 'all' || filters.priority !== 'all' || filters.subjectId !== 'all';
  const completion = counts.all ? (counts.done / counts.all) * 100 : 0;

  return (
    <>
      <PageHeader
        eyebrow="Productivity"
        title="My Tasks"
        description="Assignments, labs and everything else on your plate."
        actions={
          <Button icon="plus" onClick={() => handleEdit(null)}>
            New task
          </Button>
        }
      >
        {data && (
          <div className={styles.summary}>
            <ProgressBar value={completion} label="Tasks completed" color="var(--success)" />
            <span>
              {counts.done} of {counts.all} completed
            </span>
          </div>
        )}
      </PageHeader>

      <Card className={styles.toolbar} as="div">
        <div className={styles.toolbarRow}>
          <SearchInput ref={searchRef} value={query} onChange={setQuery} label="Search tasks" placeholder="Search tasks or #tags" />
          <div className={styles.selects}>
            <label className={styles.inlineSelect}>
              <span>Priority</span>
              <select value={filters.priority} onChange={(e) => setFilter('priority')(e.target.value)}>
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className={styles.inlineSelect}>
              <span>Subject</span>
              <select value={filters.subjectId} onChange={(e) => setFilter('subjectId')(e.target.value)}>
                <option value="all">All</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code || s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.inlineSelect}>
              <span>Sort</span>
              <select value={filters.sort} onChange={(e) => setFilter('sort')(e.target.value)}>
                <option value="dueDate">Due date</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </label>
          </div>
        </div>
        <FilterChips
          label="Filter by status"
          value={filters.status}
          onChange={setFilter('status')}
          options={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'todo', label: 'To do', count: counts.todo },
            { value: 'in-progress', label: 'In progress', count: counts['in-progress'] },
            { value: 'done', label: 'Done', count: counts.done },
            { value: 'overdue', label: 'Overdue', count: counts.overdue },
          ]}
        />
      </Card>

      <section aria-live="polite" className={styles.results}>
        {loading && !data && <ListSkeleton rows={6} />}
        {error && !data && <ErrorState error={error} onRetry={reload} title="Could not load tasks" />}
        {data && (
          <>
            <p className={styles.resultCount}>
              Showing {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}
              {filters.status === 'all' && !preferences.showCompletedTasks && counts.done > 0 && ` · ${counts.done} completed hidden (change in Settings)`}
              {filtersActive && (
                <button
                  type="button"
                  className={styles.clear}
                  onClick={() => {
                    setQuery('');
                    setFilters(DEFAULT_FILTERS);
                  }}
                >
                  Clear filters
                </button>
              )}
            </p>
            {visibleTasks.length ? (
              <TaskList tasks={visibleTasks} subjectsById={subjectsById} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDelete} />
            ) : (
              <Card>
                {tasks.length === 0 ? (
                  <EmptyState
                    icon="tasks"
                    title="No tasks yet"
                    message="Add your first assignment, lab or reminder to get started."
                    action={
                      <Button icon="plus" onClick={() => handleEdit(null)}>
                        Add a task
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState icon="search" title="No matching tasks" message="Try a different search term or clear the filters." />
                )}
              </Card>
            )}
          </>
        )}
      </section>

      {editor.open && (
        <TaskForm key={editor.key} open task={editor.task} subjects={subjects} onClose={() => setEditor((prev) => ({ ...prev, open: false }))} onSubmit={handleSave} />
      )}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this task?"
        message={pendingDelete ? `“${pendingDelete.title}” will be removed. You can undo right after deleting.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
        loading={deleting}
      />
    </>
  );
}
