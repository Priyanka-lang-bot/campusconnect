import { useMemo, useState } from 'react';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocumentTitle } from '../../hooks/useDomEvents.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { FormBanner, FormGrid, SelectField, TextArea, TextField } from '../../components/ui/Form.jsx';
import { initials } from '../../utils/format.js';
import { isEmail, maxLength, minLength, required, validateForm } from '../../utils/validation.js';
import styles from './Settings.module.css';

const RULES = {
  name: [required('Name'), minLength(2, 'Name'), maxLength(80, 'Name')],
  email: [required('Email'), isEmail()],
  bio: [maxLength(280, 'Bio')],
};

const toForm = (p) => ({
  name: p.name,
  email: p.email,
  program: p.program ?? '',
  year: String(p.year ?? 1),
  semester: String(p.semester ?? 1),
  rollNumber: p.rollNumber ?? '',
  bio: p.bio ?? '',
  interests: (p.interests ?? []).join(', '),
});

export default function ProfileSettings() {
  useDocumentTitle('Profile');
  const { profile, updateProfile } = useProfile();
  const toast = useToast();
  const initial = useMemo(() => toForm(profile), [profile]);
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  const set = (name) => (e) => {
    setValues((prev) => ({ ...prev, [name]: e.target.value }));
    setErrors(({ [name]: _removed, ...rest }) => rest);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateForm(values, RULES);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    setFormError('');
    try {
      const updated = await updateProfile({
        ...values,
        year: Number(values.year),
        semester: Number(values.semester),
        interests: values.interests.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setValues(toForm(updated));
      toast.success('Profile saved');
    } catch (err) {
      setErrors(err.details || {});
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.split}>
      <Card className={styles.identity} as="aside" aria-label="Profile preview">
        <span className={styles.bigAvatar}>{initials(values.name) || '?'}</span>
        <h2>{values.name || 'Your name'}</h2>
        <p>{values.program}</p>
        <p className={styles.small}>
          Year {values.year} · Semester {values.semester}
          {values.rollNumber && ` · ${values.rollNumber}`}
        </p>
        {values.bio && <p className={styles.bio}>{values.bio}</p>}
        <ul className={styles.interests}>
          {values.interests
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((interest) => (
              <li key={interest}>{interest}</li>
            ))}
        </ul>
      </Card>

      <Card>
        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <h2 className={styles.formTitle}>Personal details</h2>
          {formError && !Object.keys(errors).length && <FormBanner>{formError}</FormBanner>}
          <FormGrid>
            <TextField label="Full name" required value={values.name} onChange={set('name')} error={errors.name} autoComplete="name" />
            <TextField label="College email" type="email" required value={values.email} onChange={set('email')} error={errors.email} autoComplete="email" />
            <TextField className="span-2" label="Programme" value={values.program} onChange={set('program')} error={errors.program} />
            <SelectField label="Year" value={values.year} onChange={set('year')} options={[1, 2, 3, 4, 5].map((y) => ({ value: String(y), label: `Year ${y}` }))} />
            <SelectField label="Semester" value={values.semester} onChange={set('semester')} options={Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: `Semester ${i + 1}` }))} />
            <TextField label="Roll number" value={values.rollNumber} onChange={set('rollNumber')} error={errors.rollNumber} />
            <TextField label="Interests" value={values.interests} onChange={set('interests')} error={errors.interests} hint="Comma separated" />
            <TextArea className="span-2" label="Short bio" value={values.bio} onChange={set('bio')} error={errors.bio} maxLength={280} rows={3} />
          </FormGrid>
          <div className={styles.formActions}>
            <Button
              variant="secondary"
              disabled={!dirty || saving}
              onClick={() => {
                setValues(initial);
                setErrors({});
              }}
            >
              Discard changes
            </Button>
            <Button type="submit" loading={saving} disabled={!dirty}>
              Save profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
