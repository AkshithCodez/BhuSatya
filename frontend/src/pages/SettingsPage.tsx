import { useState } from 'react';

export default function SettingsPage() {
  const [savedMessage, setSavedMessage] = useState(false);
  const [name, setName] = useState('Rajesh Kumar');
  const [designation, setDesignation] = useState('Revenue Officer (Grade I)');
  const [jurisdiction, setJurisdiction] = useState('Bengaluru Urban & Devanahalli Taluk');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [instantAlerts, setInstantAlerts] = useState(true);

  const handleSave = () => {
    localStorage.setItem('userName', name);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Portal Settings</h1>
        <p className="text-sm text-[#94A39B] mt-1">
          Manage officer credentials, notification preferences, and display settings.
        </p>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
          ✓ Preferences saved successfully.
        </div>
      )}

      {/* 1. Officer Profile */}
      <div className="p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-4">
        <h2 className="text-base font-semibold text-white pb-3 border-b border-white/[0.08]">
          Officer Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#94A39B] mb-1.5">Officer Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#0F1513] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#94A39B] mb-1.5">Official Designation</label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#0F1513] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/40"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#94A39B] mb-1.5">Assigned Revenue Jurisdiction</label>
            <input
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#0F1513] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500/40"
            />
          </div>
        </div>
      </div>

      {/* 2. Notification Preferences */}
      <div className="p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-4">
        <h2 className="text-base font-semibold text-white pb-3 border-b border-white/[0.08]">
          Notifications
        </h2>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#0F1513] border border-white/[0.06] cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-white">Daily Queue Summary Email</p>
              <p className="text-[11px] text-[#94A39B] mt-0.5">
                Receive daily digests of pending verification cases at 09:00 AM IST.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-[#161E1B] border-white/20 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#0F1513] border border-white/[0.06] cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-white">Instant Discrepancy Alerts</p>
              <p className="text-[11px] text-[#94A39B] mt-0.5">
                Immediate notification when an ingested document has boundary variance flags.
              </p>
            </div>
            <input
              type="checkbox"
              checked={instantAlerts}
              onChange={(e) => setInstantAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-[#161E1B] border-white/20 focus:ring-0 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* 3. Display & Interface */}
      <div className="p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-4">
        <h2 className="text-base font-semibold text-white pb-3 border-b border-white/[0.08]">
          Display &amp; Interface
        </h2>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F1513] border border-white/[0.06]">
          <div>
            <p className="text-xs font-semibold text-white">Theme</p>
            <p className="text-[11px] text-[#94A39B] mt-0.5">
              Government Enterprise Dark (Charcoal / Muted Emerald)
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
            Active
          </span>
        </div>
      </div>

      {/* 4. Security */}
      <div className="p-6 rounded-2xl bg-[#161E1B] border border-white/[0.08] space-y-4">
        <h2 className="text-base font-semibold text-white pb-3 border-b border-white/[0.08]">
          Security &amp; Session
        </h2>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F1513] border border-white/[0.06]">
          <div>
            <p className="text-xs font-semibold text-white">Digital Sign-Off Key</p>
            <p className="text-[11px] text-[#94A39B] mt-0.5 font-mono">
              e-Sign Token #KA-REV-77291 (Active)
            </p>
          </div>
          <span className="text-xs text-[#94A39B]">Valid till Dec 2026</span>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleSave}
          className="py-2.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs transition-colors shadow-sm"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
