export default function AuditTrailPage() {
  const auditLogs = [
    {
      id: 'LOG-9921',
      action: 'OFFICER_SIGN_OFF',
      caseId: 'TUM-2026-3190',
      officer: 'Officer Ananya Sharma (REV-041)',
      timestamp: '2026-09-05 15:22:11 IST',
      hash: 'sha256:4a8b29f0e139c...881a29',
      status: 'Cryptographically Verified',
    },
    {
      id: 'LOG-9920',
      action: 'AI_DETECTION_PASS',
      caseId: 'BLR-2026-8819',
      officer: 'System AI Inference Engine',
      timestamp: '2026-09-08 10:24:08 IST',
      hash: 'sha256:77bc09e144a19...99cfa1',
      status: 'Immutable Ingestion',
    },
    {
      id: 'LOG-9919',
      action: 'ANOMALY_DISPUTE_FLAGGED',
      caseId: 'BLG-2026-1048',
      officer: 'Senior Nodal Officer (REV-012)',
      timestamp: '2026-09-04 11:10:44 IST',
      hash: 'sha256:33fa8188bc120...0041ef',
      status: 'Escalation Logged',
    },
    {
      id: 'LOG-9918',
      action: 'MUTATION_RECONCILED',
      caseId: 'MND-2026-7721',
      officer: 'Deputy Tehsildar (REV-088)',
      timestamp: '2026-09-03 14:02:19 IST',
      hash: 'sha256:91efaa4477c10...1259ab',
      status: 'Cryptographically Verified',
    },
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Tamper-Evident Ledger
          </span>
          <span className="text-xs text-slate-500 font-mono">SHA-256 HASH CHAIN</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Audit Trail &amp; Verification Ledger</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Every document ingestion, AI detection run, and officer sign-off is committed to an immutable append-only ledger.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-[#11161d] border border-white/[0.08] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
            <tr>
              <th className="py-3 px-4">Log ID &amp; Action</th>
              <th className="py-3 px-4">Target Case</th>
              <th className="py-3 px-4">Actor / System</th>
              <th className="py-3 px-4">Timestamp (IST)</th>
              <th className="py-3 px-4 font-mono">Cryptographic SHA-256 Hash</th>
              <th className="py-3 px-4 text-right">Integrity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-4 font-semibold text-white">
                  <span>{log.id}</span>
                  <span className="block text-[10px] font-mono text-emerald-400 font-normal">{log.action}</span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-200">{log.caseId}</td>
                <td className="py-3.5 px-4 text-slate-300">{log.officer}</td>
                <td className="py-3.5 px-4 text-slate-400">{log.timestamp}</td>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{log.hash}</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    ✓ Valid
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
