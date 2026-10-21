// PROP DRILLING vs CONTEXT — a deliberate teaching example.
//
// TaskList does not use the callbacks itself; it only passes onToggle,
// onEdit, onDelete and subjectsById down to each TaskItem. That is "prop
// drilling". With only one level of nesting it is the simplest, most
// explicit option, so we keep it here.
//
// Compare with the profile and theme: they are needed by many unrelated
// components at different depths (Sidebar, Topbar, Dashboard, Settings…),
// so they live in ProfileContext / ThemeContext instead.
import TaskItem from './TaskItem.jsx';
import styles from './Tasks.module.css';

export default function TaskList({ tasks, subjectsById, onToggle, onEdit, onDelete }) {
  return (
    <ul className={styles.list} aria-label="Tasks">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} subject={subjectsById[task.subjectId]} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}
