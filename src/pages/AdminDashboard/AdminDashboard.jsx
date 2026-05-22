import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCount, getAllWatchParties } from '../../services/adminService';
import { useToast } from '../../context/toastContext';
import AppHeader from '../../components/layout/AppHeader/AppHeader';
import Button from '../../components/Button/Button';
import './AdminDashboard.css';

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
    <div className="admin-page">
      <AppHeader
        action={
          <Button variant="secondary" onClick={() => navigate('/home')}>
            Back to home
          </Button>
        }
      />

      <main className="admin-main">
        <h1 className="admin-title">Admin dashboard</h1>

        {loading && <div className="admin-status">Loading dashboard...</div>}
        {loadFailed && <div className="admin-status admin-status--error">Dashboard unavailable.</div>}

        {!loading && !loadFailed && (
          <>
            <section className="admin-stats">
              <div className="admin-stat-card">
                <span className="admin-stat-label">Registered users</span>
                <span className="admin-stat-value">{userCount}</span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-label">Total watch parties</span>
                <span className="admin-stat-value">{watchParties.length}</span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-label">Active parties</span>
                <span className="admin-stat-value admin-stat-value--active">{activeParties}</span>
              </div>
            </section>

            <section className="admin-section">
              <h2 className="admin-section-title">All watch parties</h2>
              {watchParties.length === 0 ? (
                <div className="admin-empty">No watch parties yet.</div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Join code</th>
                        <th>Host</th>
                        <th>Members</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {watchParties.map((party) => (
                        <tr key={party.id}>
                          <td className="admin-join-code">{party.joinCode}</td>
                          <td>{party.hostUsername}</td>
                          <td>{party.memberCount}</td>
                          <td>
                            <span className={`admin-badge${party.isActive ? ' admin-badge--active' : ''}`}>
                              {party.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="admin-date">{formatDate(party.createdAt)}</td>
                        </tr>
                      ))}
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
