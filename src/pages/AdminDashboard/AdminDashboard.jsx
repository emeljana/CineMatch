import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCount, getAllWatchParties } from '../../services/adminService';
import { useToast } from '../../context/toastContext';
import AppHeader from '../../components/layout/AppHeader/AppHeader';
import Button from '../../components/Button/Button';

const CREATED_AT_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatDate(value) {
  if (!value) return '—';
  return CREATED_AT_FORMATTER.format(new Date(value));
}

function AdminDashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(null);
  const [watchParties, setWatchParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [countRes, partiesRes] = await Promise.all([
          getUserCount(),
          getAllWatchParties(),
        ]);
        setUserCount(countRes.data);
        setWatchParties(partiesRes.data);
      } catch {
        setLoadFailed(true);
        toast.error('Could not load admin data.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [toast]);

  const activeParties = watchParties.filter((p) => p.isActive).length;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-bg max-[680px]:h-auto max-[680px]:min-h-screen max-[680px]:overflow-visible max-[680px]:block">
      <AppHeader
        action={
          <Button variant="secondary" onClick={() => navigate('/home')}>
            Back to home
          </Button>
        }
      />

      <main className="flex-1 overflow-hidden w-[min(1100px,100%)] mx-auto px-6 py-8 flex flex-col gap-10 max-[680px]:flex-none max-[680px]:overflow-visible">
        <h1 className="text-[22px] font-bold">Admin dashboard</h1>

        {loading && (
          <div className="flex-1 flex items-center justify-center text-[15px] text-muted max-[680px]:flex-none max-[680px]:min-h-[50vh]">
            Loading dashboard...
          </div>
        )}
        {loadFailed && (
          <div className="flex-1 flex items-center justify-center text-[15px] text-dislike max-[680px]:flex-none max-[680px]:min-h-[50vh]">
            Dashboard unavailable.
          </div>
        )}

        {!loading && !loadFailed && (
          <>
            <section className="grid grid-cols-3 gap-4 max-[680px]:grid-cols-1">
              <div className="flex flex-col gap-2 py-5 px-6 border border-border rounded-md bg-surface">
                <span className="text-[13px] font-semibold text-muted uppercase tracking-[0.06em]">Registered users</span>
                <span className="text-[36px] font-bold leading-none">{userCount}</span>
              </div>
              <div className="flex flex-col gap-2 py-5 px-6 border border-border rounded-md bg-surface">
                <span className="text-[13px] font-semibold text-muted uppercase tracking-[0.06em]">Total watch parties</span>
                <span className="text-[36px] font-bold leading-none">{watchParties.length}</span>
              </div>
              <div className="flex flex-col gap-2 py-5 px-6 border border-border rounded-md bg-surface">
                <span className="text-[13px] font-semibold text-muted uppercase tracking-[0.06em]">Active parties</span>
                <span className="text-[36px] font-bold leading-none text-like">{activeParties}</span>
              </div>
            </section>

            <section className="flex-1 overflow-hidden flex flex-col min-h-0 max-[680px]:flex-none max-[680px]:overflow-visible">
              <h2 className="mb-4 text-[18px] font-semibold">All watch parties</h2>
              {watchParties.length === 0 ? (
                <div className="p-8 border border-border rounded-md bg-surface text-center text-muted">
                  No watch parties yet.
                </div>
              ) : (
                <div className="flex-1 overflow-auto min-h-0 border border-border rounded-md bg-surface max-[680px]:flex-none max-[680px]:overflow-x-auto max-[680px]:overflow-y-visible">
                  <table className="w-full border-collapse text-[14px]">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 border-b border-border text-left text-[12px] font-bold text-muted uppercase tracking-[0.06em] whitespace-nowrap">Join code</th>
                        <th className="py-3 px-4 border-b border-border text-left text-[12px] font-bold text-muted uppercase tracking-[0.06em] whitespace-nowrap">Host</th>
                        <th className="py-3 px-4 border-b border-border text-left text-[12px] font-bold text-muted uppercase tracking-[0.06em] whitespace-nowrap">Members</th>
                        <th className="py-3 px-4 border-b border-border text-left text-[12px] font-bold text-muted uppercase tracking-[0.06em] whitespace-nowrap">Status</th>
                        <th className="py-3 px-4 border-b border-border text-left text-[12px] font-bold text-muted uppercase tracking-[0.06em] whitespace-nowrap">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {watchParties.map((party, i) => {
                        const isLast = i === watchParties.length - 1;
                        const tdBase = `py-3.5 px-4 align-middle${isLast ? '' : ' border-b border-border'}`;
                        return (
                          <tr key={party.id} className="hover:[&>td]:bg-surface-2">
                            <td className={`${tdBase} font-mono text-[15px] font-semibold tracking-[0.05em] text-accent`}>{party.joinCode}</td>
                            <td className={tdBase}>{party.hostUsername}</td>
                            <td className={tdBase}>{party.memberCount}</td>
                            <td className={tdBase}>
                              <span
                                className={`inline-block py-[3px] px-[9px] rounded-sm text-[12px] font-bold uppercase tracking-[0.06em] whitespace-nowrap ${
                                  party.isActive
                                    ? 'bg-[rgba(34,197,94,0.14)] text-like'
                                    : 'bg-[rgba(139,139,168,0.16)] text-muted'
                                }`}
                              >
                                {party.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className={`${tdBase} text-muted whitespace-nowrap`}>{formatDate(party.createdAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
