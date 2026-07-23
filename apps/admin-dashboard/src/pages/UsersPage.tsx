import { useEffect, useState } from 'react';
import { useAdminStore } from '../store/adminStore';

export function UsersPage() {
  const { users, fetchUsers, suspendUser } = useAdminStore();
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers(roleFilter || undefined);
  }, [roleFilter]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Users</h1>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: 12, border: '1px solid var(--border)' }}
        >
          <option value="">All roles</option>
          <option value="user">Users</option>
          <option value="agent">Agents</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                <td>{u.isSuspended ? 'Suspended' : 'Active'}</td>
                <td>
                  {u.role !== 'admin' && (
                    <button
                      className={`btn ${u.isSuspended ? 'btn-outline' : 'btn-danger'}`}
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => suspendUser(u.id, !u.isSuspended)}
                    >
                      {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  No users loaded. Connect to API and log in as admin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
