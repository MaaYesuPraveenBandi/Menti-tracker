# Mentiby Tracker

A full-stack web application for tracking coding problem-solving progress. Built with React frontend and Node.js/Express backend.

## Features

- User authentication (register/login)
- Problem browsing with filters (difficulty, category)
- Progress tracking and statistics
- Leaderboard system
- User profiles with detailed analytics
- Modern, responsive UI

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Modern CSS with responsive design

## Project Structure

```
mentiby-tracker/
├── backend/
│   ├── server.js
│   ├── models/
│   │   ├── User.js
│   │   └── Problem.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── problemRoutes.js
│   │   ├── progressRoutes.js
│   │   └── leaderboardRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   └── config/
│       └── db.js
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Problems.js
│   │   │   ├── Leaderboard.js
│   │   │   ├── Solved.js
│   │   │   └── Profile.js
│   │   ├── components/
│   │   │   ├── Sidebar.js
│   │   │   └── ProgressBar.js
│   │   └── utils/
│   │       └── api.js
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your MongoDB connection string and JWT secret:
   ```
   MONGODB_URI=mongodb://localhost:27017/mentiby-tracker
   JWT_SECRET=your_secret_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user` - Get current user (protected)

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get problem by ID
- `GET /api/problems/category/:category` - Get problems by category
- `GET /api/problems/difficulty/:difficulty` - Get problems by difficulty
- `POST /api/problems` - Create new problem (protected)

### Progress
- `POST /api/progress/solve` - Mark problem as solved (protected)
- `GET /api/progress/user` - Get user progress (protected)
- `GET /api/progress/stats` - Get user statistics (protected)

### Leaderboard
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/leaderboard/top/:count` - Get top N users
- `GET /api/leaderboard/user/:userId` - Get user rank

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
