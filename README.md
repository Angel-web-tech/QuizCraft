# QuizCraft

**Create. Challenge. Conquer.**

QuizCraft is an online quiz and assessment app. Students can discover published quizzes, complete timed attempts, and review their results. Administrators can manage quizzes and student accounts and view real performance reports.

## Technology

- Frontend: HTML, CSS, vanilla JavaScript, and Vite for local development/builds
- Backend: Node.js and Express REST API
- Database: MongoDB with Mongoose
- Authentication: bcryptjs password hashes and JWTs in HttpOnly, SameSite cookies

The browser never decides account permissions or quiz scores. The API checks roles and ownership, enforces quiz deadlines, and calculates marks from the stored answer key.

## MongoDB basics

MongoDB stores JSON-like **documents** inside **collections**, which are grouped into a **database**. In QuizCraft, users, quizzes, and attempts are separate collections. Mongoose defines and validates the shape of those documents.

You can use MongoDB Atlas (hosted) or a local MongoDB server.

### Option A: MongoDB Atlas

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/atlas). Atlas free-cluster availability and labels can vary by region and over time.
2. Create a project and a cluster using an available free/shared option.
3. In **Database Access**, create a database user with a strong password. This is separate from your Atlas website login.
4. In **Network Access**, allow only your current public IP address for local development. For a deployed app, allow only the app server's fixed outbound IPs where possible. Do not use `0.0.0.0/0` as a production rule.
5. In **Connect → Drivers**, copy the Node.js connection string. Replace the username, password, and database name. URL-encode special characters in the database user's password.
6. Keep the connection string private. Never put it in frontend files or commit it.

### Option B: Local MongoDB

Install MongoDB Community Server for your operating system (Compass alone is only a GUI client and does not run the database). Start the server with a local data directory, then use:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/quizcraft
```

For the downloaded macOS ARM MongoDB archive used for this setup, a local development server can be started with:

```bash
mkdir -p "$HOME/Library/Application Support/QuizCraft/mongodb-data"
"$HOME/Downloads/mongodb-macos-aarch64--9.0.4/bin/mongod" \
  --dbpath "$HOME/Library/Application Support/QuizCraft/mongodb-data" \
  --bind_ip 127.0.0.1 \
  --port 27017
```

Keep that terminal open while using the app. In Compass, use `mongodb://127.0.0.1:27017/quizcraft`. This local development server is bound to loopback only; do not expose it directly to the internet.

## Configuration

Backend configuration is read from `backend/.env`. A safe placeholder file is provided at `backend/.env.example`.

If `backend/.env` already exists, **do not overwrite it**. Keep any credentials you still need, and add or update the QuizCraft settings:

```env
PORT=5006
CLIENT_URL=http://localhost:5176
MONGODB_URI=mongodb://127.0.0.1:27017/quizcraft
JWT_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
ADMIN_NAME=QuizCraft Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password_of_at_least_12_characters
```

Use the Atlas URI instead of the local URI when using Atlas. Generate a signing key rather than reusing a password; for example, on macOS/Linux:

```bash
openssl rand -base64 48
```

Set `JWT_SECRET` to the generated value. Set a unique `ADMIN_EMAIL` and a private `ADMIN_PASSWORD` of at least 12 characters. Do not use the example admin values. `.env` files and `node_modules` are ignored by Git.

## Install and run

Use Node.js 20.19+ and npm.

### Backend

```bash
cd backend
npm install
npm start
```

The API listens on `http://localhost:5006` for the current local setup. It will refuse to start if `MONGODB_URI` or a 32-character `JWT_SECRET` is missing, and reports a clear connection error if MongoDB is unreachable.

### Provision the first administrator

With MongoDB configured and the admin variables set in `backend/.env`, run:

```bash
cd backend
npm run seed:admin
```

The script hashes the password before saving it. Re-running it for the same existing admin will not reset the password. It will not create a second administrator or convert a student account.

### Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5176](http://localhost:5176). Vite proxies `/api` requests to the backend at port 5006; the browser does not need database credentials or a bearer token. These alternate ports avoid conflicting with an older QuizMaster app that may still be running on 5173/5005. For the convenience launcher, first start MongoDB and then run `node start.js` from the repository root.

For a production deployment, serve the built `frontend/dist` assets and route `/api` to the Express service through the same origin (or configure an explicit trusted `CLIENT_URL` and API base URL). Set `NODE_ENV=production` so session cookies are marked `Secure`; use HTTPS.

## First use

1. Provision the administrator using the seed command above.
2. Open `/admin/login` and sign in with the configured admin email and password.
3. Create a quiz and save it as a draft or publish it for students.
4. Open `/register` to create a student account. Public registration always assigns the `student` role; submitted role fields are ignored.
5. Sign in as a student at `/login`, find a published quiz, and complete it before the deadline.
6. Return to the student dashboard or history to see the server-calculated result.

## Roles and security

- There are exactly two roles: `student` and `admin`.
- Student registration cannot create administrators. Admins are provisioned by the protected seed script.
- Login checks that the selected login type matches the account role and rejects inactive users.
- Password hashes are excluded from normal user queries and API responses.
- JWTs are stored in HttpOnly cookies with `SameSite=Strict`; the API checks the request origin for CSRF defense and only allows the configured client origin.
- Admin routes require an authenticated admin. Student routes require an authenticated student. Students can read only their own profile and attempts.
- Participant quiz responses omit correct answers until a submitted result is eligible for answer review.
- Attempts store their server start/deadline. Scores, correct counts, and percentages are calculated on the server. Repeated submission of a completed attempt returns its existing result.
- Quiz deletion archives the quiz rather than removing its document, keeping related historical attempts available to administrators.

## REST API

Successful responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "message": ... }`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a student |
| POST | `/api/auth/login` | Public | Student/admin login (include `role`) |
| POST | `/api/auth/logout` | Public | Clear the session cookie |
| GET | `/api/auth/me` | Signed in | Current account |
| GET | `/api/student/dashboard` | Student | Dashboard statistics and recent attempts |
| GET | `/api/student/quizzes` | Student | Search/filter published quizzes; paginated |
| GET | `/api/student/quizzes/:id` | Student | Quiz details without the answer key |
| GET | `/api/student/attempts` | Student | Own paginated attempt history |
| GET | `/api/student/profile` | Student | Own profile |
| POST | `/api/attempts` | Student | Start an attempt with a server deadline |
| GET | `/api/attempts/:id` | Owning student | Resume an active attempt or retrieve result |
| POST | `/api/attempts/:id/submit` | Owning student | Submit answers; server scores once |
| GET | `/api/admin/dashboard` | Admin | Live counts and recent activity |
| GET | `/api/admin/students` | Admin | Search/filter/paginate students |
| GET | `/api/admin/students/:id` | Admin | Student profile and recent attempts |
| PATCH | `/api/admin/students/:id/status` | Admin | Activate/deactivate a student |
| GET/POST | `/api/admin/quizzes` | Admin | List/create quizzes |
| GET/PUT/DELETE | `/api/admin/quizzes/:id` | Admin | Read, edit, or archive a quiz |
| PATCH | `/api/admin/quizzes/:id/status` | Admin | Publish/unpublish |
| GET | `/api/admin/attempts` | Admin | Paginated attempt and results list |
| GET | `/api/admin/reports` | Admin | Quiz performance and average scores |

Quiz creation accepts `questions` with `text`, `options` (an array of strings), `correctIndex`, and `marks`. The API creates option IDs and calculates total marks; clients cannot set a score or pass arbitrary answer keys through student-facing endpoints.

## Data retention and legacy SQL files

The previous `schema.sql`, `seed.sql`, and related SQL seed files are retained as legacy references and are no longer used by the app. Existing MySQL data is not deleted or changed by this migration, but it is **not automatically copied** into MongoDB. Back up the SQL database before any separate data conversion. If you have records that must be migrated, plan and verify a dedicated one-time importer before switching those users over; the app does not currently include that importer.

## Validation and tests

Run backend unit tests and frontend production build:

```bash
cd backend && npm test
cd ../frontend && npm run build
```

The backend tests cover score calculation, quiz validation, and answer-key serialization. A full workflow also requires a reachable MongoDB instance and a configured private admin account. Without those credentials/services, registration, login, persistence, and browser workflows cannot be truthfully reported as end-to-end tested.

## Project layout

```text
backend/
  config/db.js
  controllers/
  middleware/
  models/
  routes/
  scripts/seedAdmin.js
  services/scoringService.js
  server.js
frontend/
  assets/css/style.css
  assets/js/app.js
  index.html
  vite.config.js
```
