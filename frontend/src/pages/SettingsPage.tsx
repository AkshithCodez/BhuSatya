import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Toggle from '../components/ui/Toggle';
import Modal from '../components/ui/Modal';
import { Field, Input, Select } from '../components/ui/Field';
import { KeyValue, KeyValueList } from '../components/ui/KeyValue';

export default function SettingsPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: localStorage.getItem('userName') || 'Officer Rajesh Kumar',
    role: localStorage.getItem('userRole') || 'Revenue Verification Officer',
    email: 'officer@bhusatya.gov.in',
    district: 'Bengaluru Urban',
    employeeId: 'KAR-REV-20418',
  });
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    newCases: true,
    decisions: true,
    flagged: true,
    weekly: false,
  });

  const [display, setDisplay] = useState({ density: 'Comfortable', dateFormat: 'DD MMM YYYY' });
  const [security, setSecurity] = useState({ twoFactor: true, sessionAlerts: false });
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMessage, setPwMessage] = useState('');

  const saveProfile = () => {
    localStorage.setItem('userName', profile.name);
    localStorage.setItem('userRole', profile.role);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const submitPassword = () => {
    if (!pw.current || !pw.next) {
      setPwMessage('Enter your current and new password.');
      return;
    }
    if (pw.next.length < 8) {
      setPwMessage('The new password must be at least 8 characters.');
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwMessage('The new passwords do not match.');
      return;
    }
    setPwOpen(false);
    setPw({ current: '', next: '', confirm: '' });
    setPwMessage('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Your profile, alerts, display preferences and access." />

      <div className="mx-auto max-w-[840px] space-y-5">
        <Panel
          title="Officer Profile"
          subtitle="Shown on decisions you record and in the audit trail."
          actions={
            <>
              {saved && <span className="text-[12px] text-ok">Saved</span>}
              <Button variant="primary" size="sm" onClick={saveProfile}>
                Save changes
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name">
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </Field>
            <Field label="Designation">
              <Input
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              />
            </Field>
            <Field label="Official email">
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </Field>
            <Field label="Assigned district">
              <Select
                value={profile.district}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
              >
                <option>Bengaluru Urban</option>
                <option>Mysuru</option>
                <option>Tumakuru</option>
                <option>Belagavi</option>
                <option>Mandya</option>
                <option>Dakshina Kannada</option>
              </Select>
            </Field>
            <Field label="Employee ID" hint="Issued by the Revenue Department; not editable.">
              <Input className="tnum" value={profile.employeeId} readOnly disabled />
            </Field>
          </div>
        </Panel>

        <Panel title="Notifications" subtitle="Choose which activity reaches your inbox.">
          <div className="-mt-3.5">
            <Toggle
              label="New cases assigned to me"
              description="When a document is routed to your district for verification."
              checked={notifications.newCases}
              onChange={(v) => setNotifications({ ...notifications, newCases: v })}
            />
            <Toggle
              label="Decisions recorded on my cases"
              description="Confirmation each time a decision is written to the audit trail."
              checked={notifications.decisions}
              onChange={(v) => setNotifications({ ...notifications, decisions: v })}
            />
            <Toggle
              label="Cases flagged for dispute"
              description="Immediate alert when a case is flagged in your jurisdiction."
              checked={notifications.flagged}
              onChange={(v) => setNotifications({ ...notifications, flagged: v })}
            />
            <Toggle
              label="Weekly summary email"
              description="Digitization and verification totals every Monday morning."
              checked={notifications.weekly}
              onChange={(v) => setNotifications({ ...notifications, weekly: v })}
            />
          </div>
        </Panel>

        <Panel title="Display" subtitle="How tables and dates are presented.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Table density">
              <Select
                value={display.density}
                onChange={(e) => setDisplay({ ...display, density: e.target.value })}
              >
                <option>Comfortable</option>
                <option>Compact</option>
              </Select>
            </Field>
            <Field label="Date format">
              <Select
                value={display.dateFormat}
                onChange={(e) => setDisplay({ ...display, dateFormat: e.target.value })}
              >
                <option>DD MMM YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </Select>
            </Field>
          </div>
          <p className="mt-4 border-t border-line pt-4 text-[12px] text-ink-3">
            The portal uses a single dark theme so scanned documents stay legible against the
            interface.
          </p>
        </Panel>

        <Panel title="Security" subtitle="Access to your officer account.">
          <div className="-mt-3.5">
            <Toggle
              label="Two-factor authentication"
              description="Required for approving records in production environments."
              checked={security.twoFactor}
              onChange={(v) => setSecurity({ ...security, twoFactor: v })}
            />
            <Toggle
              label="Alert me about new sign-ins"
              description="Email whenever your account is used from a new device."
              checked={security.sessionAlerts}
              onChange={(v) => setSecurity({ ...security, sessionAlerts: v })}
            />
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <KeyValueList>
              <KeyValue label="Signed in as">{profile.email}</KeyValue>
              <KeyValue label="Employee ID">
                <span className="tnum">{profile.employeeId}</span>
              </KeyValue>
              <KeyValue label="Password last changed">14 Aug 2026</KeyValue>
            </KeyValueList>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-line pt-4">
            <Button variant="secondary" size="sm" onClick={() => setPwOpen(true)}>
              Change password
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </Panel>
      </div>

      <Modal
        open={pwOpen}
        onClose={() => {
          setPwOpen(false);
          setPwMessage('');
        }}
        title="Change password"
        subtitle="Use at least 8 characters, including a number."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPwOpen(false);
                setPwMessage('');
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={submitPassword}>
              Update password
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <Field label="Current password">
            <Input
              type="password"
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
            />
          </Field>
          <Field label="New password">
            <Input
              type="password"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
            />
          </Field>
          <Field label="Confirm new password">
            <Input
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
            />
          </Field>
          {pwMessage && <p className="text-[12px] text-danger">{pwMessage}</p>}
        </div>
      </Modal>
    </>
  );
}
