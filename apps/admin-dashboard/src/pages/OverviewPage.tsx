import { useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { AdminStats } from '@rentify/shared-types';
import { useAdminStore } from '../store/adminStore';

const PIE_COLORS = ['#059669', '#9ca3af', '#d97706'];

export function OverviewPage() {
  const { stats, fetchStats } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, []);

  if (!stats) return <p>Loading...</p>;

  const pieData = [
    { name: 'Available', value: stats.listingsByStatus.available },
    { name: 'Taken', value: stats.listingsByStatus.taken },
    { name: 'Pending', value: stats.listingsByStatus.pending },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Overview</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Users', value: stats.totalUsers },
          { label: 'Total Agents', value: stats.totalAgents },
          { label: 'Total Listings', value: stats.totalListings },
          { label: 'Messages Today', value: stats.messagesSentToday },
        ].map((m) => (
          <div key={m.label} className="card">
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>{m.label}</p>
            <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)' }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>User Growth</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1b4332" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Listings by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Listings by City</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.listingsByCity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="city" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1b4332" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>By Property Type</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.listingsByPropertyType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Most Active Agents</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Listings</th>
              <th>Response Rate</th>
            </tr>
          </thead>
          <tbody>
            {stats.mostActiveAgents.map((a: AdminStats['mostActiveAgents'][number]) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.listingCount}</td>
                <td>{a.responseRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
