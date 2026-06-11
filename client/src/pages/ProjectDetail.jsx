import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../api';
import StatusBadge from '../components/StatusBadge';
import ProjectModal from '../components/ProjectModal';
import { useToast } from '../context/ToastContext';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimetype = '') {
  if (mimetype.startsWith('image/')) return '🖼';
  if (mimetype === 'application/pdf') return '📄';
  if (mimetype.includes('zip')) return '🗜';
  if (mimetype.includes('word')) return '📝';
  if (mimetype.includes('sheet') || mimetype.includes('excel')) return '📊';
  return '📁';
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const load = async () => {
    try {
      const r = await projectsAPI.getOne(id);
      setProject(r.data);
    } catch {
      toast('Project not found', 'error');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async (data) => {
    try {
      const r = await projectsAPI.update(id, data);
      setProject(r.data);
      toast('Project updated!');
      setEditing(false);
    } catch (err) {
      toast(err.response?.data?.error || 'Error saving', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project and all its files?')) return;
    try {
      await projectsAPI.delete(id);
      toast('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast(err.response?.data?.error || 'Error deleting', 'error');
    }
  };

  const uploadFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('files', f));
      await projectsAPI.uploadFiles(id, fd);
      await load();
      toast(`${files.length} file(s) uploaded!`);
    } catch (err) {
      toast(err.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId) => {
    if (!window.confirm('Remove this file?')) return;
    try {
      await projectsAPI.deleteFile(id, fileId);
      await load();
      toast('File removed');
    } catch {
      toast('Error removing file', 'error');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading…</div>;
  if (!project) return null;

  const client = project.client;

  return (
    <div>
      <div className="topbar">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>← Back</button>
        <span className="topbar-title">{project.title}</span>
        <StatusBadge status={project.status} />
        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
      </div>

      <div className="page-content">
        <div className="detail-grid">
          {/* Left column */}
          <div>
            {project.description && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="section-title">About</div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{project.description}</p>
              </div>
            )}

            {project.techStack?.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="section-title">Tech Stack</div>
                <div className="tech-tags">
                  {project.techStack.map(t => <span key={t} className="tech-tag">{t}</span>)}
                </div>
              </div>
            )}

            {/* Files */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div className="section-title" style={{ marginBottom: 0 }}>Files ({project.files?.length || 0})</div>
                <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>+ Upload</button>
              </div>

              <div
                className={`upload-zone ${dragging ? 'dragging' : ''}`}
                style={{ marginBottom: 14 }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); uploadFiles(e.dataTransfer.files); }}
              >
                {uploading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <div className="spinner" /> Uploading…
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>📂</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Drop files here or click to upload</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>PDF, images, ZIP, docs — up to 20MB each</div>
                  </>
                )}
              </div>

              <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={e => uploadFiles(e.target.files)} />

              {project.files?.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No files attached yet.</div>
              )}

              {project.files?.map(f => (
                <div key={f._id} className="file-item">
                  <span className="file-icon">{fileIcon(f.mimetype)}</span>
                  <div className="file-info">
                    <div className="file-name">{f.originalName}</div>
                    <div className="file-size">{formatBytes(f.size)} · {new Date(f.uploadedAt).toLocaleDateString()}</div>
                  </div>
                  <a href={`${process.env.REACT_APP_SERVER_URL}/uploads/${f.filename}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" onClick={e => e.stopPropagation()}>↓</a>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteFile(f._id)}>✕</button>
                </div>
              ))}
            </div>

            {project.notes && (
              <div className="card" style={{ marginTop: 20 }}>
                <div className="section-title">Notes</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{project.notes}</p>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="section-title">Details</div>
              {[
                ['Status', <StatusBadge status={project.status} />],
                ['Client', client?.name],
                ['Company', client?.company],
                ['Email', client?.email && <a href={`mailto:${client.email}`} style={{ color: 'var(--accent-light)' }}>{client.email}</a>],
                ['Start Date', project.startDate && new Date(project.startDate).toLocaleDateString()],
                ['End Date', project.endDate && new Date(project.endDate).toLocaleDateString()],
                ['Budget', project.budget && `${project.currency} ${Number(project.budget).toLocaleString()}`],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="info-row">
                  <span className="info-key">{k}</span>
                  <span className="info-val">{v}</span>
                </div>
              ))}
            </div>

            {(project.repoUrl || project.liveUrl) && (
              <div className="card">
                <div className="section-title">Links</div>
                {project.repoUrl && (
                  <div className="info-row">
                    <span className="info-key">Repository</span>
                    <a href={project.repoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-light)', fontSize: 13 }}>Open ↗</a>
                  </div>
                )}
                {project.liveUrl && (
                  <div className="info-row">
                    <span className="info-key">Live Site</span>
                    <a href={project.liveUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--green)', fontSize: 13 }}>Open ↗</a>
                  </div>
                )}
              </div>
            )}

            {project.tags?.length > 0 && (
              <div className="card">
                <div className="section-title">Tags</div>
                <div className="tech-tags" style={{ marginBottom: 0 }}>
                  {project.tags.map(t => <span key={t} className="tech-tag">#{t}</span>)}
                </div>
              </div>
            )}

            <div className="card">
              <div className="section-title">Timestamps</div>
              <div className="info-row">
                <span className="info-key">Created</span>
                <span className="info-val">{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <span className="info-key">Updated</span>
                <span className="info-val">{new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editing && <ProjectModal project={project} onClose={() => setEditing(false)} onSave={handleSave} />}
    </div>
  );
}
