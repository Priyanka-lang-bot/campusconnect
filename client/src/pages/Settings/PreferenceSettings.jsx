import { useState } from 'react';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocumentTitle } from '../../hooks/useDomEvents.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { SelectField, TextField, Toggle } from '../../components/ui/Form.jsx';
import styles from './Settings.module.css';

const THEMES = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'settings' },
];

// Keys this app stores in localStorage (all non-sensitive conveniences).
const LOCAL_KEYS = ['cc:taskFilters', 'cc:savedResources', 'cc:feedbackDraft'];

export default function PreferenceSettings() {
  useDocumentTitle('Preferences');
  const { preferences, updatePreferences } = useProfile();
  const { preference: themePreference, setPreference: setTheme } = useTheme();
  const toast = useToast();
  const [goal, setGoal] = useState(String(preferences.weeklyStudyGoalHours));
  const [goalError, setGoalError] = useState('');
  const [savingKey, setSavingKey] = useState(null);

  // Save a single preference immediately (PATCH /api/profile/preferences).
  const save = async (changes, message = 'Preference saved') => {
    const key = Object.keys(changes)[0];
    setSavingKey(key);
    try {
      await updatePreferences(changes);
      toast.success(message);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setSavingKey(null);
    }
  };

  const saveGoal = async (e) => {
    e.preventDefault();
    const hours = Number(goal);
    if (!Number.isInteger(hours) || hours < 1 || hours > 80) {
      setGoalError('Enter a whole number of hours between 1 and 80.');
      return;
    }
    setGoalError('');
    await save({ weeklyStudyGoalHours: hours }, `Weekly goal set to ${hours} hours`);
  };

  const clearLocalData = () => {
    LOCAL_KEYS.forEach((key) => localStorage.removeItem(key));
    toast.success('Saved filters, bookmarks and drafts cleared from this browser');
  };

  return (
    <div className={styles.stack}>
      <Card aria-labelledby="appearance">
        <h2 id="appearance" className={styles.formTitle}>
          Appearance
        </h2>
        <p className={styles.sectionHint}>Stored in this browser only.</p>
        <div className={styles.themeOptions} role="radiogroup" aria-label="Colour theme">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={themePreference === t.value}
              className={`${styles.themeOption} ${themePreference === t.value ? styles.themeActive : ''}`}
              onClick={() => setTheme(t.value)}
            >
              <span className={`${styles.themePreview} ${styles[`preview${t.value}`]}`} aria-hidden="true">
                <span />
                <span />
              </span>
              <span className={styles.themeLabel}>
                <Icon name={t.icon} size={16} /> {t.label}
              </span>
            </button>
          ))}
        </div>
        <Toggle
          label="Compact mode"
          description="Tighter spacing and smaller text to fit more on screen."
          checked={preferences.compactMode}
          disabled={savingKey === 'compactMode'}
          onChange={(compactMode) => save({ compactMode })}
        />
      </Card>

      <Card aria-labelledby="study-prefs">
        <h2 id="study-prefs" className={styles.formTitle}>
          Study & tasks
        </h2>
        <p className={styles.sectionHint}>Saved to your profile on the server.</p>
        <form className={styles.goalForm} onSubmit={saveGoal} noValidate>
          <TextField
            label="Weekly study goal (hours)"
            type="number"
            min={1}
            max={80}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            error={goalError}
            hint="Used for the progress ring on your dashboard."
          />
          <Button type="submit" variant="secondary" loading={savingKey === 'weeklyStudyGoalHours'} disabled={goal === String(preferences.weeklyStudyGoalHours)}>
            Update goal
          </Button>
        </form>
        <Toggle
          label="Show completed tasks"
          description="When off, the “All” view on My Tasks hides finished tasks."
          checked={preferences.showCompletedTasks}
          disabled={savingKey === 'showCompletedTasks'}
          onChange={(showCompletedTasks) => save({ showCompletedTasks })}
        />
        <Toggle
          label="Confirm before deleting"
          description="Ask for confirmation before deleting a task."
          checked={preferences.confirmDeletes}
          disabled={savingKey === 'confirmDeletes'}
          onChange={(confirmDeletes) => save({ confirmDeletes })}
        />
        <div className={styles.startPage}>
          <SelectField
            label="Start page"
            hint="Where CampusConnect opens when you start a new browser session."
            value={preferences.startPage}
            disabled={savingKey === 'startPage'}
            onChange={(e) => save({ startPage: e.target.value })}
            options={[
              { value: '/', label: 'Dashboard' },
              { value: '/tasks', label: 'My Tasks' },
              { value: '/study', label: 'Study Planner' },
              { value: '/events', label: 'Campus Events' },
            ]}
          />
        </div>
      </Card>

      <Card aria-labelledby="local-data">
        <h2 id="local-data" className={styles.formTitle}>
          Data in this browser
        </h2>
        <p className={styles.sectionHint}>
          Task filters, saved resources and unsent feedback drafts are kept in localStorage for convenience. Your tasks, study plan and profile are stored on the server.
        </p>
        <Button variant="secondary" icon="trash" onClick={clearLocalData}>
          Clear local data
        </Button>
      </Card>
    </div>
  );
}
