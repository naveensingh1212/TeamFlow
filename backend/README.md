# Team Task Manager - Backend API Documentation

## 🚀 Project Setup

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository** (or create the project directory)
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
Copy `.env.example` to `.env` and fill in your MongoDB Atlas connection string and JWT secret:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/teamflow
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRATION=7d
NODE_ENV=development
```

4. **Start the server**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:5000`

---

## 📋 API Endpoints

### Authentication Endpoints

#### 1. **Sign Up**
- **Route:** `POST /api/auth/signup`
- **Access:** Public
- **Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```
- **Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "data": {
    "user": {
      "id": "userId",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "member"
    },
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

#### 2. **Sign In**
- **Route:** `POST /api/auth/signin`
- **Access:** Public
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:** Same as Sign Up

#### 3. **Get User Profile**
- **Route:** `GET /api/auth/me`
- **Access:** Private (requires JWT token in Authorization header)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "id": "userId",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "member",
    "teams": [],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User profile fetched successfully"
}
```

#### 4. **Update Profile**
- **Route:** `PUT /api/auth/profile`
- **Access:** Private
- **Body:**
```json
{
  "username": "new_username",
  "email": "newemail@example.com"
}
```

---

### Project Endpoints

#### 1. **Create Project**
- **Route:** `POST /api/projects`
- **Access:** Private
- **Body:**
```json
{
  "name": "Website Redesign",
  "description": "Redesign company website",
  "team": "teamId",
  "dueDate": "2024-12-31T23:59:59Z"
}
```
- **Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "data": {
    "id": "projectId",
    "name": "Website Redesign",
    "description": "Redesign company website",
    "owner": { "id": "userId", "username": "john_doe", "email": "john@example.com" },
    "members": [
      {
        "user": { "id": "userId", "username": "john_doe" },
        "role": "admin"
      }
    ],
    "status": "active",
    "dueDate": "2024-12-31T23:59:59Z",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Project created successfully"
}
```

#### 2. **Get All Projects**
- **Route:** `GET /api/projects`
- **Access:** Private
- **Response:** Array of projects

#### 3. **Get Project by ID**
- **Route:** `GET /api/projects/:id`
- **Access:** Private (user must be member or owner)
- **Response:** Single project object

#### 4. **Update Project**
- **Route:** `PUT /api/projects/:id`
- **Access:** Private (admin or owner only)
- **Body:**
```json
{
  "name": "New Project Name",
  "description": "Updated description",
  "status": "on-hold",
  "dueDate": "2024-12-31T23:59:59Z"
}
```

#### 5. **Add Project Member**
- **Route:** `POST /api/projects/:id/members`
- **Access:** Private (admin or owner only)
- **Body:**
```json
{
  "userId": "newMemberId",
  "role": "member"
}
```

#### 6. **Remove Project Member**
- **Route:** `DELETE /api/projects/:id/members/:userId`
- **Access:** Private (admin or owner only)
- **Response:** Updated project

#### 7. **Delete Project**
- **Route:** `DELETE /api/projects/:id`
- **Access:** Private (owner only)
- **Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {},
  "message": "Project deleted successfully"
}
```

---

### Task Endpoints

#### 1. **Create Task**
- **Route:** `POST /api/tasks`
- **Access:** Private (user must be project member)
- **Body:**
```json
{
  "title": "Design Homepage",
  "description": "Create mockups for homepage",
  "projectId": "projectId",
  "assignedTo": "userId",
  "priority": "high",
  "dueDate": "2024-06-30T23:59:59Z",
  "tags": ["design", "frontend"]
}
```
- **Priority:** low | medium | high | critical
- **Status:** todo | in-progress | review | completed | blocked

#### 2. **Get All Tasks**
- **Route:** `GET /api/tasks`
- **Access:** Private
- **Query Parameters:**
  - `projectId=projectId` - Filter by project
  - `status=in-progress` - Filter by status
  - `priority=high` - Filter by priority
  - `assignedTo=userId` - Filter by assignee
- **Response:** Array of tasks

#### 3. **Get Task by ID**
- **Route:** `GET /api/tasks/:id`
- **Access:** Private (project member only)
- **Response:** Single task object

#### 4. **Update Task**
- **Route:** `PUT /api/tasks/:id`
- **Access:** Private (project member only)
- **Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "in-progress",
  "priority": "critical",
  "assignedTo": "userId",
  "dueDate": "2024-07-15T23:59:59Z",
  "tags": ["design", "ui"]
}
```

#### 5. **Delete Task**
- **Route:** `DELETE /api/tasks/:id`
- **Access:** Private (task creator, project admin, or project owner)
- **Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {},
  "message": "Task deleted successfully"
}
```

#### 6. **Get Dashboard Stats**
- **Route:** `GET /api/tasks/dashboard/stats`
- **Access:** Private
- **Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "totalTasks": 25,
    "completedTasks": 10,
    "overdueTasks": 3,
    "inProgressTasks": 12,
    "tasksByPriority": [
      { "_id": "high", "count": 8 },
      { "_id": "medium", "count": 12 },
      { "_id": "low", "count": 5 }
    ],
    "myTasks": [
      { "id": "taskId", "title": "Task 1", "status": "in-progress", ... }
    ]
  },
  "message": "Dashboard stats fetched successfully"
}
```

---

### Team Endpoints

#### 1. **Create Team**
- **Route:** `POST /api/teams`
- **Access:** Private
- **Body:**
```json
{
  "name": "Frontend Team",
  "description": "Frontend development team"
}
```

#### 2. **Get All Teams**
- **Route:** `GET /api/teams`
- **Access:** Private
- **Response:** Array of teams (user is member or owner)

#### 3. **Get Team by ID**
- **Route:** `GET /api/teams/:id`
- **Access:** Private (member or owner only)
- **Response:** Single team object

#### 4. **Update Team**
- **Route:** `PUT /api/teams/:id`
- **Access:** Private (admin or owner only)
- **Body:**
```json
{
  "name": "New Team Name",
  "description": "Updated description"
}
```

#### 5. **Add Team Member**
- **Route:** `POST /api/teams/:id/members`
- **Access:** Private (admin or owner only)
- **Body:**
```json
{
  "userId": "newMemberId",
  "role": "member"
}
```

#### 6. **Remove Team Member**
- **Route:** `DELETE /api/teams/:id/members/:userId`
- **Access:** Private (admin or owner only)

#### 7. **Delete Team**
- **Route:** `DELETE /api/teams/:id`
- **Access:** Private (owner only)

---

## 🔐 Authentication

All private endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

Token is valid for 7 days by default and is returned upon successful signup/signin.

---

## 🚨 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message here",
  "errors": []
}
```

**Common Status Codes:**
- `400` - Bad Request (missing or invalid fields)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `409` - Conflict (duplicate email/username)
- `500` - Internal Server Error

---

## 🛠️ Technology Stack

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Auth logic
│   ├── projectController.js # Project logic
│   ├── taskController.js    # Task logic
│   └── teamController.js    # Team logic
├── middleware/
│   ├── auth.js              # JWT verification & role checks
│   └── errorHandler.js      # Global error handling
├── models/
│   ├── User.js              # User schema
│   ├── Project.js           # Project schema
│   ├── Task.js              # Task schema
│   └── Team.js              # Team schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── projectRoutes.js     # Project endpoints
│   ├── taskRoutes.js        # Task endpoints
│   └── teamRoutes.js        # Team endpoints
├── utils/
│   ├── ApiError.js          # Custom error class
│   ├── ApiResponse.js       # Response wrapper
│   └── asyncHandler.js      # Try-catch wrapper
├── .env                     # Environment variables
├── package.json             # Dependencies
└── server.js                # Main entry point
```

---

## ✨ Key Features Implemented

✅ User Authentication (Signup/Signin) with JWT
✅ Password hashing with bcryptjs
✅ Role-based access control (Admin/Member)
✅ Project management with team collaboration
✅ Task creation, assignment, and tracking
✅ Dashboard with statistics
✅ Centralized error handling
✅ MongoDB integration with Mongoose
✅ Input validation
✅ CORS support

---

## 📝 Next Steps

After backend is running successfully:
1. Test all endpoints using Postman or similar tool
2. Verify MongoDB Atlas connection
3. Once backend is stable, proceed with frontend development

---

## 🤝 Support

For issues or questions, check:
- Error messages in console
- API response status codes and messages
- MongoDB connection logs
