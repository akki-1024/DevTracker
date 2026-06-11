import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../api';
import StatusBadge from '../components/StatusBadge';
import ProjectModal from '../components/ProjectModal';
import { useToast } from '../context/ToastContext';

const STATUS_OPTIONS = ['', 'planning', 'in-progress', 'review', 'completed', 'on-hold'];

function fileIcon(mimetype = '') {
  if (mimetype.startsWith('image/')) return '🖼';
  if (mimetype === 'application/pdf') return '📄';
  if (mimetype.includes('zip')) return '🗜';
  return '📁';
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    const r = await projectsAPI.getAll(params);
    setProjects(r.data);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data) => {
    try {
      await projectsAPI.create(data);
      toast('Project created!');
      setShowModal(false);
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Error creating project', 'error');
    }
  };

  return (
    <div>
      <div className="topbar">
        <span className="topbar-title">Projects</span>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>
      <div className="page-content">
        <div className="filter-bar">
          <input
            className="form-input search-input"
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="form-input" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            {STATUS_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <div className="empty-title">No projects found</div>
            <div>Create your first project to get started</div>
          </div>
        ) : (
          <div className="card-grid">
            {projects.map(p => (
              <div key={p._id} className="project-card" onClick={() => navigate(`/projects/${p._id}`)}>
                <div className="project-card-header">
                  <div>
                    <div className="project-title">{p.title}</div>
                    <div className="project-client">
                      {p.client?.company ? `${p.client.name} · ${p.client.company}` : p.client?.name}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                {p.description && <p className="project-desc">{p.description}</p>}
                {p.techStack?.length > 0 && (
                  <div className="tech-tags">
                    {p.techStack.map(t => <span key={t} className="tech-tag">{t}</span>)}
                  </div>
                )}
                <div className="project-meta">
                  {p.files?.length > 0 && <span>📎 {p.files.length} file{p.files.length > 1 ? 's' : ''}</span>}
                  {p.budget && <span>💰 {p.currency} {Number(p.budget).toLocaleString()}</span>}
                  {p.startDate && <span>📅 {new Date(p.startDate).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <ProjectModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
    </div>
  );
}
