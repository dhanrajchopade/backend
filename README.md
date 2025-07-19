# Worksasana Backend

This is the backend API for the Worksasana project management platform. It provides RESTful endpoints for managing users, projects, teams, tasks, and tags, as well as reporting features.

## Features

- User authentication (JWT-based login & signup)
- CRUD operations for Projects, Teams, Tasks, and Tags
- Task filtering and reporting endpoints
- MongoDB integration via Mongoose
- CORS support for frontend integration

## Project Structure

```
.env
.gitignore
index.js
package.json
projectData.json
seed.js
tagData.json
taskData.json
teamData.json
userData.json
vercel.json
db/
  db.connect.js
models/
  project.models.js
  tag.models.js
  task.models.js
  team.models.js
  user.models.js
```

## Getting Started

### Prerequisites

- Node.js
- MongoDB database (local or cloud)

### Installation

1. Clone the repository.
2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file with your MongoDB URI:

   ```
   MONGODB=your_mongodb_connection_string
   ```

### Running the Server

Start the development server:

```sh
npm run dev
```

The server will run on `http://localhost:5000` by default.

### Seeding the Database

To seed initial data (users, projects, teams, tags, tasks):

```sh
node seed.js
```

## API Endpoints

### Auth

- `POST /auth/signup` — Register a new user
- `POST /auth/login` — Login and receive JWT token
- `GET /auth/me` — Get authenticated user details

### Users

- `GET /users` — List all users

### Projects

- `GET /projects` — List all projects
- `POST /projects` — Create a new project
- `GET /project/:id` — Get project by ID

### Teams

- `GET /teams` — List all teams
- `POST /teams` — Create a new team

### Tasks

- `GET /tasks` — List/filter tasks
- `POST /tasks` — Create a new task
- `GET /tasks/:id` — Get task by ID
- `PUT /tasks/:id` — Update a task
- `DELETE /tasks/:id` — Delete a task

### Tags

- `GET /tags` — List all tags
- `POST /tags` — Create a new tag

### Reports

- `GET /report/last-week` — Tasks completed in the last week
- `GET /report/pending` — Total pending work (days)
- `GET /report/closed-tasks` — Closed tasks grouped by team, owner, and project

## Environment Variables

- `MONGODB` — MongoDB connection string
- `PORT` — Server port (optional, defaults to 5000)
