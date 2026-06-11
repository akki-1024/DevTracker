import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsAPI, projectsAPI } from '../api';
import ClientModal from '../components/ClientModal';
import { useToast } from '../context/ToastContext';

function Avatar({ name }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors = ['#6c63ff', '#3b82f6', '#22c55e', '#f97316', '#eab308', '#ef4444'];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  return (
    <div style={{
      width: 38, height: 38, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 13, flexShrink: 0,
    }}>{initials}</div>
  );
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [projectCounts, setProjectCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const r = await clientsAPI.getAll();
    setClients(r.data);
    // Get project counts per client
    const pr = await projectsAPI.getAll();
    const counts = {};
    pr.data.forEach(p => {
      const cid = p.client?._id || p.client;
      counts[cid] = (counts[cid] || 0) + 1;
    });
    setProjectCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    try {
      if (editClient) {
        await clientsAPI.update(editClient._id, data);
        toast('Client updated!');
      } else {
        await clientsAPI.create(data);
        toast('Client added!');
      }
      setShowModal(false);
      setEditClient(null);
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Error saving', 'error');
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Delete "${client.name}"?`)) return;
    try {
      await clientsAPI.delete(client._id);
      toast('Client deleted');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Error deleting', 'error');
    }
  };

  return (
    <div>
      <div className="topbar">
        <span className="topbar-title">Clients</span>
        <button className="btn btn-primary" onClick={() => { setEditClient(null); setShowModal(true); }}>+ Add Client</button>
      </div>
      <div className="page-content">
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading clients…</div>
        ) : clients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◉</div>
            <div className="empty-title">No clients yet</div>
            <div>Add your first client to start tracking projects</div>
          </div>
        ) : (
          <div className="card-grid">
            {clients.map(c => (
              <div key={c._id} className="card" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
                  <Avatar name={c.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                    {c.company && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.company}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditClient(c); setShowModal(true); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>✕</button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                  {c.email && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      ✉ <a href={`mailto:${c.email}`} style={{ color: 'var(--accent-light)' }}>{c.email}</a>
                    </div>
                  )}
                  {c.phone && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📞 {c.phone}</div>}
                  {c.address && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📍 {c.address}</div>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {projectCounts[c._id] || 0} project{projectCounts[c._id] !== 1 ? 's' : ''}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/projects?client=${c._id}`)}
                  >
                    View Projects →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ClientModal
          client={editClient}
          onClose={() => { setShowModal(false); setEditClient(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
