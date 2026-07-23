import { useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';

export function ListingsPage() {
  const { listings, fetchListings, deleteListing } = useAdminStore();

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Listings</h1>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>City</th>
              <th>Price</th>
              <th>Agent</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id}>
                <td>{l.title}</td>
                <td>{l.city}</td>
                <td>${l.price.toLocaleString()}</td>
                <td>{l.agentName || '—'}</td>
                <td>
                  <span className={`badge badge-${l.status}`}>{l.status}</span>
                </td>
                <td>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => {
                      if (confirm('Remove this listing?')) deleteListing(l.id);
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  No listings loaded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
