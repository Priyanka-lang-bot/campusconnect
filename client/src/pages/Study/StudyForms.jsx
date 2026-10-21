// Modal forms for creating/editing subjects and planning study sessions.
import { useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { FormBanner, FormGrid, SelectField, TextArea, TextField } from '../../components/ui/Form.jsx';
import { inRange, maxLength, minLength, required, validateForm } from '../../utils/validation.js';
import { PRIORITY_OPTIONS, SUBJECT_COLORS, subjectColor } from '../../utils/subjects.js';
import { addDays, formatMinutes, todayKey } from '../../utils/format.js';
import styles from './Study.module.css';

// Shared submit logic: client validation -> API -> map server errors to fields.
function useFormSubmit(rules, toPayload, onSubmit) {
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event, values) => {
    event.preventDefault();
    const found = validateForm(values, rules);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    setFormError('');
    try {
      await onSubmit(toPayload(values));
    } catch (err) {
      setErrors(err.details || {});
      setFormError(err.message);
      setSaving(false);
    }
  };
  return { errors, setErrors, formError, saving, submit };
}

const SUBJECT_RULES = {
  name: [required('Subject name'), minLength(2, 'Subject name'), maxLength(80, 'Subject name')],
  code: [maxLength(12, 'Course code')],
  targetHours: [required('Target hours'), inRange(1, 200, 'Target hours')],
};

export function SubjectForm({ subject, onClose, onSubmit }) {
  const [values, setValues] = useState(() =>
    subject
      ? { ...subject, examDate: subject.examDate ?? '', targetHours: String(subject.targetHours) }
      : { name: '', code: '', color: 'blue', priority: 'medium', targetHours: '20', examDate: '' },
  );
  const { errors, formError, saving, submit } = useFormSubmit(
    SUBJECT_RULES,
    ({ name, code, color, priority, targetHours, examDate }) => ({ name, code, color, priority, targetHours: Number(targetHours), examDate: examDate || null }),
    onSubmit,
  );
  const set = (name) => (e) => setValues((prev) => ({ ...prev, [name]: e.target.value }));

  return (
    <Modal
      open
      onClose={onClose}
      title={subject ? 'Edit subject' : 'Add subject'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="subject-form" loading={saving}>
            {subject ? 'Save subject' : 'Add subject'}
          </Button>
        </>
      }
    >
      <form id="subject-form" onSubmit={(e) => submit(e, values)} noValidate>
        {formError && !Object.keys(errors).length && <FormBanner>{formError}</FormBanner>}
        <FormGrid>
          <TextField className="span-2" label="Subject name" required value={values.name} onChange={set('name')} error={errors.name} placeholder="e.g. Operating Systems" />
          <TextField label="Course code" value={values.code} onChange={set('code')} error={errors.code} placeholder="CS301" />
          <SelectField label="Priority" value={values.priority} onChange={set('priority')} options={PRIORITY_OPTIONS} />
          <TextField label="Target study hours" type="number" min={1} max={200} required value={values.targetHours} onChange={set('targetHours')} error={errors.targetHours} />
          <TextField label="Exam date" type="date" value={values.examDate} onChange={set('examDate')} error={errors.examDate} />
          <fieldset className={`${styles.colorPicker} span-2`}>
            <legend>Colour</legend>
            {SUBJECT_COLORS.map((color) => (
              <label key={color} className={styles.swatch} style={{ '--swatch': subjectColor(color) }}>
                <input type="radio" name="color" value={color} checked={values.color === color} onChange={set('color')} />
                <span className="visually-hidden">{color}</span>
              </label>
            ))}
          </fieldset>
        </FormGrid>
      </form>
    </Modal>
  );
}

const SESSION_RULES = {
  subjectId: [required('Subject')],
  title: [required('Topic'), minLength(3, 'Topic'), maxLength(120, 'Topic')],
  date: [required('Date')],
  durationMinutes: [required('Duration'), inRange(10, 600, 'Duration')],
  notes: [maxLength(500, 'Notes')],
};

export function SessionForm({ subjects, defaultSubjectId, onClose, onSubmit }) {
  const [values, setValues] = useState({
    subjectId: defaultSubjectId ?? subjects[0]?.id ?? '',
    title: '',
    date: addDays(todayKey(), 1),
    durationMinutes: '60',
    notes: '',
  });
  const { errors, formError, saving, submit } = useFormSubmit(
    SESSION_RULES,
    (v) => ({ ...v, durationMinutes: Number(v.durationMinutes) }),
    onSubmit,
  );
  const set = (name) => (e) => setValues((prev) => ({ ...prev, [name]: e.target.value }));

  return (
    <Modal
      open
      onClose={onClose}
      title="Plan a study session"
      description="Block time for a topic. Mark it complete afterwards to update your progress."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="session-form" loading={saving}>
            Add session
          </Button>
        </>
      }
    >
      <form id="session-form" onSubmit={(e) => submit(e, values)} noValidate>
        {formError && !Object.keys(errors).length && <FormBanner>{formError}</FormBanner>}
        <FormGrid>
          <SelectField
            className="span-2"
            label="Subject"
            value={values.subjectId}
            onChange={set('subjectId')}
            error={errors.subjectId}
            options={subjects.map((s) => ({ value: s.id, label: s.name }))}
          />
          <TextField className="span-2" label="Topic" required value={values.title} onChange={set('title')} error={errors.title} placeholder="e.g. Dynamic programming revision" />
          <TextField label="Date" type="date" required value={values.date} onChange={set('date')} error={errors.date} />
          <SelectField
            label="Duration"
            value={values.durationMinutes}
            onChange={set('durationMinutes')}
            error={errors.durationMinutes}
            options={[30, 45, 60, 75, 90, 120, 150, 180].map((m) => ({ value: String(m), label: formatMinutes(m) }))}
          />
          <TextArea className="span-2" label="Notes" value={values.notes} onChange={set('notes')} error={errors.notes} maxLength={500} rows={2} />
        </FormGrid>
      </form>
    </Modal>
  );
}
