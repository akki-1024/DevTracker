import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, clientsAPI } from '../api';
import StatusBadge from '../components/StatusBadge';

const STATUS_ORDER = ['planning', 'in-progress', 'review', 'completed', 'on-hold'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [clientCount, setClientCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    projectsAPI.getStats().then(r => setStats(r.data));
    clientsAPI.getAll().then(r => setClientCount(r.data.length));
  }, []);

  const getCount = (status) => {
    if (!stats) return 0;
    return stats.byStatus.find(s => s._id === status)?.count || 0;
  };

  return (
    <div>
      <div className="topbar">
        <span className="topbar-title">Dashboard</span>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/projects')}>
          + New Project
        </button>
      </div>
      <div className="page-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Projects</div>
            <div className="stat-value accent">{stats?.total ?? '—'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Clients</div>
            <div className="stat-value">{clientCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Progress</div>
            <div className="stat-value" style={{ color: 'var(--yellow)' }}>{getCount('in-progress')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{getCount('completed')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Review</div>
            <div className="stat-value" style={{ color: 'var(--orange)' }}>{getCount('review')}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Status breakdown */}
          <div className="card">
            <div className="section-title">Projects by Status</div>
            {STATUS_ORDER.map(s => (
              <div key={s} className="info-row">
                <span className="info-key"><StatusBadge status={s} /></span>
                <span className="info-val" style={{ fontFamily: 'var(--mono)' }}>{getCount(s)}</span>
              </div>
            ))}
          </div>

          {/* Recent projects */}
          <div className="card">
            <div className="section-title">Recent Projects</div>
            {stats?.recentProjects?.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No projects yet.</div>
            )}
            {stats?.recentProjects?.map(p => (
              <div
                key={p._id}
                className="info-row"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/projects/${p._id}`)}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.client?.name}</div>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
