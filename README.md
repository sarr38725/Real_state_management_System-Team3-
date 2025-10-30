# Real Estate Management System

A full-stack real estate management platform with React frontend and Node.js backend.

## Project Structure

```
├── frontend/          # React + Vite application
├── backend/           # Node.js + Express API
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   - Open PHPMyAdmin or MySQL console
   - Run the SQL commands from `database_setup.sql`
   - This will create the database and all tables

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update your database credentials

5. Start the backend server:
   ```bash
   npm start
   ```
   Backend runs on: http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the API base URL in your frontend code to point to http://localhost:5000

4. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- User Authentication (Admin, Agent, User roles)
- Property Listings Management
- Property Search & Filters
- Favorites System
- Appointment Scheduling
- Contact Messages
- Admin Dashboard

## Default Admin Login

- Email: admin@realestate.com
- Password: admin123

**Important:** Change the admin password after first login!

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- Framer Motion

### Backend
- Node.js
- Express
- MySQL (via PHPMyAdmin)
- JWT Authentication
- Bcrypt for password hashing
