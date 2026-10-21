// Create / edit task form, shown inside a Modal.
import { useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { FormBanner, FormGrid, SelectField, TextArea, TextField } from '../../components/ui/Form.jsx';
import { maxLength, minLength, required, validateForm } from '../../utils/validation.js';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../../utils/subjects.js';
import { addDays, todayKey } from '../../utils/format.js';

const RULES = {
  title: [required('Title'), minLength(3, 'Title'), maxLength(120, 'Title')],
  dueDate: [required('Due date')],
  description: [maxLength(1000, 'Description')],
};

const emptyTask = () => ({
  title: '',
  description: '',
  dueDate: addDays(todayKey(), 3),
  priority: 'medium',
  status: 'todo',
  subjectId: '',
  tags: '',
});

// Convert between the API shape and the form's string-based shape.
const toForm = (task) => (task ? { ...task, subjectId: task.subjectId ?? '', tags: task.tags.join(', ') } : emptyTask());
const toPayload = ({ title, description, dueDate, priority, status, subjectId, tags }) => ({
  title,
  description,
  dueDate,
  priority,
  status,
  subjectId: subjectId || null,
  tags: tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean),
});

export default function TaskForm({ open, task, subjects, onClose, onSubmit }) {
  const [values, setValues] = useState(() => toForm(task));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(task);

  const setField = (name) => (event) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const clientErrors = validateForm(values, RULES);
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await onSubmit(toPayload(values));
    } catch (err) {
      // Show server-side validation errors next to the matching fields.
      if (err.details) setErrors(err.details);
      setFormError(err.message);
      setSaving(false);
    }
  };

  const subjectOptions = [{ value: '', label: 'No subject' }, ...subjects.map((s) => ({ value: s.id, label: s.name }))];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit task' : 'New task'}
      description={isEdit ? 'Update the details and save your changes.' : 'Add something you need to get done.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="task-form" loading={saving}>
            {isEdit ? 'Save changes' : 'Add task'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} noValidate>
        {formError && !Object.keys(errors).length && <FormBanner>{formError}</FormBanner>}
        <FormGrid>
          <TextField className="span-2" label="Title" required value={values.title} onChange={setField('title')} error={errors.title} placeholder="e.g. Finish DAA assignment 4" maxLength={120} />
          <TextField label="Due date" type="date" required value={values.dueDate} onChange={setField('dueDate')} error={errors.dueDate} />
          <SelectField label="Priority" value={values.priority} onChange={setField('priority')} options={PRIORITY_OPTIONS} error={errors.priority} />
          <SelectField label="Subject" value={values.subjectId} onChange={setField('subjectId')} options={subjectOptions} error={errors.subjectId} />
          <SelectField label="Status" value={values.status} onChange={setField('status')} options={STATUS_OPTIONS} error={errors.status} />
          <TextArea className="span-2" label="Description" value={values.description} onChange={setField('description')} error={errors.description} maxLength={1000} rows={3} placeholder="Optional details, links or notes" />
          <TextField className="span-2" label="Tags" value={values.tags} onChange={setField('tags')} error={errors.tags} hint="Separate tags with commas, e.g. assignment, lab" />
        </FormGrid>
      </form>
    </Modal>
  );
}
