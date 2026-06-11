import React, { useState, useEffect } from 'react';
import { clientsAPI } from '../api';

const STATUS_OPTIONS = ['planning', 'in-progress', 'review', 'completed', 'on-hold'];

export default function ProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', description: '', client: '', status: 'planning',
    techStack: '', startDate: '', endDate: '', budget: '',
    currency: 'USD', repoUrl: '', liveUrl: '', tags: '', notes: '',
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clientsAPI.getAll().then(r => setClients(r.data));
    if (project) {
      setForm({
        title: project.title || '',
        description: project.description || '',
        client: project.client?._id || project.client || '',
        status: project.status || 'planning',
        techStack: (project.techStack || []).join(', '),
        startDate: project.startDate ? project.startDate.slice(0, 10) : '',
        endDate: project.endDate ? project.endDate.slice(0, 10) : '',
        budget: project.budget || '',
        currency: project.currency || 'USD',
        repoUrl: project.repoUrl || '',
        liveUrl: project.liveUrl || '',
        tags: (project.tags || []).join(', '),
        notes: project.notes || '',
      });
    }
  }, [project]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      techStack: form.techStack ? form.techStack.split(',').map(s => s.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      budget: form.budget ? Number(form.budget) : undefined,
    };
    await onSave(payload);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{project ? 'Edit Project' : 'New Project'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. E-commerce Platform" />
              </div>
              <div className="form-group">
                <label className="form-label">Client *</label>
                <select className="form-input" value={form.client} onChange={e => set('client', e.target.value)} required>
                  <option value="">Select client…</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief project overview…" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tech Stack</label>
                <input className="form-input" value={form.techStack} onChange={e => set('techStack', e.target.value)} placeholder="React, Node.js, MongoDB" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-input" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input type="date" className="form-input" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Budget</label>
                <input type="number" className="form-input" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="50000" />
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-input" value={form.currency} onChange={e => set('currency', e.target.value)}>
                  {['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Repo URL</label>
                <input className="form-input" value={form.repoUrl} onChange={e => set('repoUrl', e.target.value)} placeholder="https://github.com/…" />
              </div>
              <div className="form-group">
                <label className="form-label">Live URL</label>
                <input className="form-input" value={form.liveUrl} onChange={e => set('liveUrl', e.target.value)} placeholder="https://…" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <input className="form-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="frontend, api, mobile" />
            </div>

            <div className="form-group">
              <label className="form-label">Internal Notes</label>
              <textarea className="form-input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Private notes about this project…" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
