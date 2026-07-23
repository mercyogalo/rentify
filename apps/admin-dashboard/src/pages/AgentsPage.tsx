import { useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';

export function AgentsPage() {
  const { agents, fetchAgents, verifyAgent } = useAdminStore();

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Agents</h1>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Agency</th>
              <th>Listings</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.agencyName || '—'}</td>
                <td>{a.listingCount}</td>
                <td>{a.isVerified ? '✓ Yes' : 'No'}</td>
                <td>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => verifyAgent(a.id, !a.isVerified)}
                  >
                    {a.isVerified ? 'Revoke' : 'Verify'}
                  </button>
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  No agents loaded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
