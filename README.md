# Real Estate Management System

A full-stack real estate management platform with React frontend, Node.js backend, and Supabase for image storage.

## Project Structure

```
├── frontend/          # React + Vite application
├── backend/           # Node.js + Express API
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- MySQL Server (via XAMPP/WAMP/MAMP or standalone)
- PHPMyAdmin (optional but recommended)
- Supabase Account (for image storage)

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Set up MySQL Database:
- Start XAMPP/WAMP and ensure MySQL is running
- Open PHPMyAdmin (http://localhost/phpmyadmin)
- Run the SQL commands from `database_setup.sql`
- This will create `real_estate_db` database and all tables

Configure Environment Variables:
The `.env` file is already created with default values:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=real_estate_db
DB_PORT=3306

JWT_SECRET=real_estate_secret_key_2024_secure_token_xyz123
JWT_EXPIRE=7d

PORT=5000
NODE_ENV=development
```

Update if your MySQL credentials are different.

Start the backend server:
```bash
npm start
```
Backend runs on: http://localhost:5000

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Configure Supabase (for image uploads):
The `.env` file is already configured. Make sure these values are correct:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

Start the development server:
```bash
npm run dev
```
Frontend runs on: http://localhost:5173

## Features

- User Authentication (Admin, Agent, User roles)
- Property Listings Management with Image Upload
- Property Search & Filters
- Favorites System
- Appointment Scheduling
- Contact Messages
- Admin Dashboard
- Image Storage via Supabase Storage
- Responsive Design with Tailwind CSS

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
- Axios
- Supabase JS Client

### Backend
- Node.js
- Express
- MySQL (via PHPMyAdmin)
- MySQL2 (Promise-based)
- JWT Authentication
- Bcrypt for password hashing
- CORS enabled

### Storage
- Supabase Storage for property images

## Key Features Implementation

### Image Upload System
- Images are uploaded to Supabase Storage
- Unique filenames generated for each upload
- Public URLs stored in MySQL database
- Fallback to placeholder images if no images uploaded

### Database Tables
- `users` - User accounts with roles
- `properties` - Property listings
- `property_images` - Multiple images per property
- `favorites` - User favorite properties
- `schedules` - Property viewing appointments
- `contact_messages` - Contact form submissions

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Get user profile (protected)

### Properties
- GET `/api/properties` - Get all properties (with filters)
- GET `/api/properties/:id` - Get single property
- POST `/api/properties` - Create property (protected, agent/admin)
- PUT `/api/properties/:id` - Update property (protected, agent/admin)
- DELETE `/api/properties/:id` - Delete property (protected, agent/admin)

### Schedules
- GET `/api/schedules/all` - Get all schedules (protected, admin)
- GET `/api/schedules/user` - Get user schedules (protected)
- POST `/api/schedules` - Create schedule (protected)
- PATCH `/api/schedules/:id/status` - Update schedule status (protected)
- DELETE `/api/schedules/:id` - Delete schedule (protected)

## Bug Fixes Applied

1. Fixed image array handling in PropertyContext
2. Added null checks for images in backend responses
3. Implemented proper Supabase Storage integration
4. Fixed environment variable loading across all files
5. Updated database connection to use .env variables
6. Fixed JWT secret consistency across auth files
7. Improved error handling in property fetching
8. Fixed loadUserProperties to use correct image field

## Troubleshooting

### Backend won't start
- Ensure MySQL is running in XAMPP/WAMP
- Check database credentials in `.env`
- Verify database `real_estate_db` exists

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check VITE_API_URL in frontend `.env`
- Ensure CORS is enabled in backend

### Images not uploading
- Verify Supabase credentials in frontend `.env`
- Check Supabase Storage bucket `property-images` exists
- Ensure user is authenticated

## License

MIT
