# Online Quiz Maker - Full Stack Application

A full-stack web application built with React, Node.js, Express, and MySQL.

## Features

- **User Authentication**: JWT-based login/register with roles (Creator & Participant).
- **Quiz Creation**: Dynamic form to add questions and options (Creators only).
- **Quiz Taking**: Timed quizzes with progress tracking.
- **Results**: Immediate scoring and results display.
- **Dashboard**: Track created quizzes and attempt history.

## Prerequisites

- Node.js (v16+)
- MySQL
- npm or yarn

## Setup Instructions

### 1. Database Setup

1. Open your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or CLI).
2. Run the script provided in `schema.sql` to create the database and tables.
3. (Optional) Run `seed.sql` to populate sample data.

### 2. Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (you can copy `.env.example`):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=quiz_maker
   JWT_SECRET=your_secret_key
   ```
4. Start the server:
   ```bash
   npm start
   ```

### 3. Frontend Setup

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Quizzes
- `GET /api/quizzes` - Get all quizzes (with filters/search)
- `GET /api/quizzes/:id` - Get quiz details (with questions)
- `POST /api/quizzes` - Create a new quiz (Creator only)
- `DELETE /api/quizzes/:id` - Delete a quiz (Creator only)

### Attempts
- `POST /api/attempts` - Submit quiz answers
- `GET /api/attempts/user` - Get authenticated user's quiz history

## Project Structure

```
.
├── backend/
│   ├── config/ (DB Connection)
│   ├── controllers/ (API Logic)
│   ├── middleware/ (Auth)
│   ├── routes/ (API endpoints)
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/ (Auth State)
│   │   ├── pages/ (UI Screens)
│   │   └── services/ (API calls)
└── schema.sql
```
