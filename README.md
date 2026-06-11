# DevTrack — Project Tracker

A full-stack MERN app to track your development projects, clients, and project files.

## Features
- **Projects** — Create and manage projects with status, tech stack, dates, budget, repo/live URLs, tags, and notes
- **Clients** — Maintain a client directory; each project is linked to a client
- **File Storage** — Attach files (PDFs, images, ZIPs, docs) to any project; stored on disk via Multer
- **Dashboard** — At-a-glance stats and recent project activity
- **Filter & Search** — Filter projects by status or search by title

## Stack
- **MongoDB** — Database (via Mongoose)
- **Express.js** — REST API server
- **React** — Frontend SPA with React Router
- **Node.js** — Runtime

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Server

```bash
cd server
cp .env.example .env         # Edit MONGO_URI if needed
npm install
npm start                    # Runs on http://localhost:5000
```

### 2. Client

```bash
cd client
npm install
npm start                    # Runs on http://localhost:3000
```

The React dev server proxies `/api` and `/uploads` requests to the server on port 5000.

---

## API Endpoints

### Projects
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/projects | List all (filter: status, client, search) |
| GET | /api/projects/meta/stats | Dashboard stats |
| GET | /api/projects/:id | Single project |
| POST | /api/projects | Create project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project + files |
| POST | /api/projects/:id/files | Upload files (multipart) |
| DELETE | /api/projects/:id/files/:fileId | Remove a file |

### Clients
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/clients | List all clients |
| GET | /api/clients/:id | Client + their projects |
| POST | /api/clients | Create client |
| PUT | /api/clients/:id | Update client |
| DELETE | /api/clients/:id | Delete (blocks if projects exist) |

---

## Production Build

```bash
cd client && npm run build
```

Then serve the `client/build` folder as static files from Express by adding to `server/index.js`:

```js
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')));
```
