import { useEffect, useRef, useState } from 'react';
import { feedbackApi } from '../../api/endpoints.js';
import { useApi } from '../../hooks/useApi.js';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import { useDocumentTitle } from '../../hooks/useDomEvents.js';
import { useProfile } from '../../context/ProfileContext.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { FormBanner, FormGrid, TextArea, TextField } from '../../components/ui/Form.jsx';
import { isEmail, maxLength, minLength, required, validateForm } from '../../utils/validation.js';
import { timeAgo } from '../../utils/format.js';
import styles from './Feedback.module.css';

const CATEGORIES = [
  { value: 'feature', label: 'Feature idea', icon: 'star' },
  { value: 'bug', label: 'Report a bug', icon: 'alert' },
  { value: 'content', label: 'Content', icon: 'resources' },
  { value: 'general', label: 'General', icon: 'feedback' },
];
const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

const RULES = {
  name: [required('Name'), minLength(2, 'Name'), maxLength(80, 'Name')],
  email: [required('Email'), isEmail()],
  category: [required('Category')],
  rating: [[(v) => Number(v) >= 1 && Number(v) <= 5, 'Choose a rating from 1 to 5.']],
  message: [required('Message'), minLength(20, 'Message'), maxLength(2000, 'Message')],
};
const EMPTY = { name: '', email: '', category: '', rating: 0, message: '' };
const FIELD_ORDER = ['name', 'email', 'category', 'rating', 'message'];

export default function FeedbackPage() {
  useDocumentTitle('Feedback');
  const { profile } = useProfile();
  // Unsent drafts survive a refresh via localStorage (temporary client data).
  const [values, setValues, clearDraft] = useLocalStorage('feedbackDraft', EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' }); // idle | sending | sent | error
  const fieldRefs = useRef({});
  const { data: history, setData: setHistory } = useApi((signal) => feedbackApi.list({ signal }), []);

  // Pre-fill name and email from the shared profile if the draft is empty.
  useEffect(() => {
    if (profile) setValues((prev) => ({ ...prev, name: prev.name || profile.name, email: prev.email || profile.email }));
  }, [profile, setValues]);

  const set = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
  };

  const focusFirstError = (found) => {
    const first = FIELD_ORDER.find((f) => found[f]);
    fieldRefs.current[first]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateForm(values, RULES);
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirstError(found);
      return;
    }
    setStatus({ state: 'sending', message: '' });
    try {
      const { data, message } = await feedbackApi.submit({ ...values, rating: Number(values.rating) });
      setHistory((list) => [data, ...(list ?? [])]);
      setStatus({ state: 'sent', message });
      clearDraft();
    } catch (err) {
      setErrors(err.details || {});
      if (err.details) focusFirstError(err.details);
      setStatus({ state: 'error', message: err.message });
    }
  };

  const startOver = () => {
    setValues({ ...EMPTY, name: profile?.name ?? '', email: profile?.email ?? '' });
    setErrors({});
    setStatus({ state: 'idle', message: '' });
  };

  return (
    <>
      <PageHeader eyebrow="Help us improve" title="Feedback" description="Found a bug or have an idea? Your feedback goes straight to the CampusConnect team." />

      <div className={styles.layout}>
        <Card>
          {status.state === 'sent' ? (
            <div className={styles.success} role="status">
              <span className={styles.successIcon}>
                <Icon name="check" size={28} strokeWidth={2.6} />
              </span>
              <h2>Feedback sent</h2>
              <p>{status.message}</p>
              <Button variant="secondary" onClick={startOver}>
                Send more feedback
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className={styles.form} aria-describedby="feedback-required">
              <p id="feedback-required" className={styles.required}>
                Fields marked <span aria-hidden="true">*</span>
                <span className="visually-hidden">with an asterisk</span> are required.
              </p>
              {status.state === 'error' && <FormBanner>{status.message}</FormBanner>}

              <FormGrid>
                <TextField ref={(el) => (fieldRefs.current.name = el)} label="Your name" required value={values.name} onChange={(e) => set('name', e.target.value)} error={errors.name} autoComplete="name" />
                <TextField ref={(el) => (fieldRefs.current.email = el)} label="Email" type="email" required value={values.email} onChange={(e) => set('email', e.target.value)} error={errors.email} autoComplete="email" />
              </FormGrid>

              <fieldset className={styles.fieldset} aria-describedby={errors.category ? 'category-error' : undefined}>
                <legend>
                  What is it about? <span className={styles.star}>*</span>
                </legend>
                <div className={styles.categories}>
                  {CATEGORIES.map((c, i) => (
                    <label key={c.value} className={`${styles.categoryOption} ${values.category === c.value ? styles.selected : ''}`}>
                      <input
                        ref={i === 0 ? (el) => (fieldRefs.current.category = el) : undefined}
                        type="radio"
                        name="category"
                        value={c.value}
                        checked={values.category === c.value}
                        onChange={() => set('category', c.value)}
                      />
                      <Icon name={c.icon} size={18} />
                      {c.label}
                    </label>
                  ))}
                </div>
                {errors.category && (
                  <p id="category-error" className={styles.error} role="alert">
                    {errors.category}
                  </p>
                )}
              </fieldset>

              <fieldset className={styles.fieldset} aria-describedby={errors.rating ? 'rating-error' : undefined}>
                <legend>
                  How would you rate CampusConnect? <span className={styles.star}>*</span>
                </legend>
                <div className={styles.rating}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n} className={`${styles.ratingStar} ${n <= values.rating ? styles.lit : ''}`}>
                      <input
                        ref={n === 1 ? (el) => (fieldRefs.current.rating = el) : undefined}
                        type="radio"
                        name="rating"
                        value={n}
                        checked={Number(values.rating) === n}
                        onChange={() => set('rating', n)}
                      />
                      <Icon name="star" size={28} filled={n <= values.rating} />
                      <span className="visually-hidden">
                        {n} star{n > 1 && 's'} — {RATING_LABELS[n]}
                      </span>
                    </label>
                  ))}
                  <span className={styles.ratingLabel} aria-hidden="true">
                    {RATING_LABELS[values.rating] || 'Select a rating'}
                  </span>
                </div>
                {errors.rating && (
                  <p id="rating-error" className={styles.error} role="alert">
                    {errors.rating}
                  </p>
                )}
              </fieldset>

              <TextArea
                ref={(el) => (fieldRefs.current.message = el)}
                label="Message"
                required
                rows={6}
                maxLength={2000}
                value={values.message}
                onChange={(e) => set('message', e.target.value)}
                error={errors.message}
                hint={`${values.message.length}/2000 · at least 20 characters. Drafts are saved automatically in this browser.`}
                placeholder="Tell us what happened or what you'd like to see…"
              />

              <div className={styles.actions}>
                <Button variant="ghost" onClick={startOver} disabled={status.state === 'sending'}>
                  Clear form
                </Button>
                <Button type="submit" icon="arrowRight" loading={status.state === 'sending'}>
                  Send feedback
                </Button>
              </div>
            </form>
          )}
        </Card>

        <Card as="aside" aria-labelledby="feedback-history">
          <h2 id="feedback-history" className={styles.historyTitle}>
            Previously sent
          </h2>
          {history?.length ? (
            <ul className={styles.history}>
              {history.slice(0, 5).map((f) => (
                <li key={f.id}>
                  <div className={styles.historyTop}>
                    <Badge tone="lavender">{CATEGORIES.find((c) => c.value === f.category)?.label ?? f.category}</Badge>
                    <span aria-label={`${f.rating} out of 5 stars`}>{'★'.repeat(f.rating)}</span>
                  </div>
                  <p>{f.message}</p>
                  <time dateTime={f.createdAt}>{timeAgo(f.createdAt)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>Feedback you send will appear here.</p>
          )}
        </Card>
      </div>
    </>
  );
}
