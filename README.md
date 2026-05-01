# TeamFlow - Team Task Manager

A modern, full-stack team task management application built with **React**, **Node.js**, and **SQL/NoSQL database**. TeamFlow brings projects, tasks, and people together in one shared workspace, enabling teams to collaborate effectively with role-based access control and real-time task tracking.

![TeamFlow](https://img.shields.io/badge/React-18.0+-blue) ![Node.js](https://img.shields.io/badge/Node.js-16+-green)  ![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

---

## 🚀 Live Demo

**Frontend:** [https://teamflow-frontend-production-a714.up.railway.app](https://teamflow-frontend-production-a714.up.railway.app)

**Backend API:** [https://teamflow-production-5659.up.railway.app](https://teamflow-production-5659.up.railway.app)

---

## ✨ Key Features

### 🔐 **Authentication & Authorization**
- Secure user registration and login
- Google OAuth 2.0 integration
- JWT token-based authentication
- Role-based access control (RBAC) with role-based middleware
- Password hashing with bcrypt
- Session management

### 📊 **Dashboard & Analytics**
- Personalized dashboard with task metrics
- Real-time task status overview (Total, In Progress, Completed, Overdue)
- Weekly progress tracking and visualization
- Quick task creation from dashboard
- Activity feed and notifications

### 🎯 **Project Management**
- Create and organize projects by team
- Project-level task grouping
- Assign projects to teams
- Set project deadlines and descriptions
- Team-based project visibility

### ✅ **Task Management**
- Create, assign, and track tasks
- Task status workflow (Todo → In Progress → Review → Completed → Blocked)
- Priority levels (Low, Medium, High)
- Due date management with overdue tracking
- Task assignment to team members
- Task filtering by status, priority, and assignee
- Bulk task operations

### 👥 **Team & Role Management**
- Create and manage teams
- Add members to teams
- Three role levels:
  - **Admin:** Full access to all features and data
  - **Manager:** Can create/assign tasks and view team progress
  - **Member:** Can only view and update assigned tasks
- Team-scoped data visibility
- Role-based API endpoint protection

### 🔒 **Security Features**
- Database-level RBAC enforcement
- JWT token validation on every request
- Role-based middleware protection
- CORS protection
- Input validation and sanitization
- Secure password storage
- Foreign key relationships enforce data integrity

---

## 📋 Project Structure

```
TeamFlow/
├── backend/                          # Node.js Express server
│   ├── config/                       # Configuration files
│   │   ├── database.js              # Database connection
│   │   
│   ├── controllers/                  # Request handlers
│   │   ├── authController.js        # Authentication logic
│   │   ├── taskController.js        # Task CRUD operations
│   │   ├── projectController.js     # Project CRUD operations
│   │   ├── teamController.js        # Team management
│   │   
│   ├── middleware/                   # Custom middleware
│   │   ├── authMiddleware.js        # JWT verification
│   │   
│   │   └── errorHandler.js          # Global error handling
│   ├── models/                       # Database models/schemas
│   │   ├── User.js                  # User schema
│   │   ├── Task.js                  # Task schema
│   │   ├── Project.js               # Project schema
│   │   └── Team.js                  # Team schema
│   ├── routes/                       # API routes
│   │   ├── auth.js                  # Auth endpoints
│   │   ├── tasks.js                 # Task endpoints
│   │   ├── projects.js              # Project endpoints
│   │   ├── teams.js                 # Team endpoints
│   │   
│   ├── utils/                        # Utility functions
│   │   ├── api.js                   # API response helpers
│   │   ├── validation.js            # Input validation
│   │   └── password.js              # Password utilities
│   ├── node_modules/                # Dependencies
│   ├── .env.production              # Production environment variables
│   ├── .gitignore                   # Git ignore rules
│   ├── package.json                 # Project metadata & dependencies
│   ├── package-lock.json            # Dependency lock file
│   ├── server.js                    # Express server entry point
│   └── README.md                    # Backend documentation
│
├── frontend/                         # React application
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── ui/                  # Basic UI components
│   │   │   │   ├── AuthModal.jsx    # Login/signup modal
│   │   │   │   ├── Button.jsx       # Reusable button component
│   │   │   │   ├── FeatureCard.jsx  # Feature card for landing
│   │   │   │   ├── Logo.jsx         # Logo component
│   │   │   │   └── SidebarBrand.jsx # Sidebar branding
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   │   ├── useCountUp.js    # Animated counter hook
│   │   │   │   └── useCurrentYear.js # Get current year
│   │   │   └── UnauthorizedPage.jsx # Access denied page
│   │   ├── pages/                   # Page components
│   │   │   ├── LandingPage.jsx      # Homepage
│   │   │   ├── DashboardPage.jsx    # Main dashboard
│   │   │   ├── ProjectsPage.jsx     # Projects management
│   │   │   ├── TasksPage.jsx        # Tasks management
│   │   │   └── TeamPage.jsx         # Team management
│   │   ├── utils/                   # Utility functions
│   │   │   ├── api.js               # API client setup
│   │   │   └── navigation.js        # Navigation helpers
│   │   ├── styles/                  # Global styles
│   │   │   └── styles.css           # Global CSS
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # React entry point
│   │   └── index.html               # HTML template
│   ├── .env.production              # Production environment variables
│   ├── .gitignore                   # Git ignore rules
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── package.json                 # Project metadata & dependencies
│   ├── package-lock.json            # Dependency lock file
│   ├── index.html                   # HTML entry point
│   ├── Dockerfile                   # Docker containerization
│   └── README.md                    # Frontend documentation
│
├── .gitignore                        # Git ignore rules
├── LICENSE                           # MIT License
└── README.md                         # This file
```

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18+** — Modern UI library with hooks
- **Vite** — Next-generation build tool
- **Tailwind CSS** — Utility-first CSS framework
- **PostCSS** — CSS transformation
- **Axios** — HTTP client for API requests

### **Backend**
- **Node.js** — JavaScript runtime
- **Express.js** — Web application framework
- **JWT (JSON Web Tokens)** — Authentication
- **bcryptjs** — Password hashing
- **CORS** — Cross-origin resource sharing
- **dotenv** — Environment variables management

### **Database**
- **SQL (PostgreSQL/MySQL)** OR **NoSQL (MongoDB)** — Data storage
- **ORM/ODM** — Database abstraction layer

### **DevOps & Deployment**
- **Docker** — Containerization
- **Railway** — Cloud deployment platform
- **Git** — Version control

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 16+ and npm 8+
- Git
- A database (PostgreSQL, MySQL, or MongoDB)
- A Google OAuth app (for OAuth integration)

### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/teamflow.git
cd teamflow
```

### **2. Backend Setup**

```bash
cd backend

# Install dependencies
npm install

# Create environment variables file
cp .env.example .env

# Configure your database connection in .env
# DATABASE_URL=your_database_connection_string
# JWT_SECRET=your_jwt_secret_key
# GOOGLE_CLIENT_ID=your_google_oauth_client_id
# GOOGLE_CLIENT_SECRET=your_google_oauth_secret

# Run database migrations (if applicable)
npm run migrate

# Start the backend server (development)
npm run dev

# Or start in production
npm start
```

**Backend runs on:** `http://localhost:5000` (or your configured port)

### **3. Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Create environment variables file
cp .env.example .env

# Configure API endpoint in .env
# VITE_API_URL=http://localhost:5000/api

# Start the frontend development server
npm run dev

# Or build for production
npm run build

# Preview production build
npm run preview
```

**Frontend runs on:** `http://localhost:5173` (Vite default)

---

## 📚 API Documentation

### **Base URL**
```
https://teamflow-production-5659.up.railway.app/api
```

### **Authentication Endpoints**

#### **POST /auth/register**
Register a new user
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

#### **POST /auth/login**
Login with email and password
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### **POST /auth/google**
OAuth login with Google token
```json
{
  "token": "google_id_token"
}
```

#### **POST /auth/logout**
Logout and invalidate token (requires JWT)

### **Task Endpoints** (Requires Authentication)

#### **GET /tasks**
Fetch all tasks (respects role-based filtering)
- Query parameters: `status`, `priority`, `projectId`, `assignee`

#### **POST /tasks**
Create a new task
```json
{
  "title": "Complete documentation",
  "description": "Write API docs",
  "priority": "medium",
  "dueDate": "2024-05-30",
  "assigneeId": "user_id",
  "projectId": "project_id"
}
```

#### **GET /tasks/:id**
Fetch a specific task

#### **PUT /tasks/:id**
Update a task (owner or admin only)
```json
{
  "status": "in-progress",
  "priority": "high",
  "dueDate": "2024-06-15"
}
```

#### **DELETE /tasks/:id**
Delete a task (owner or admin only)

### **Project Endpoints** (Requires Authentication)

#### **GET /projects**
Fetch all projects (team-scoped)

#### **POST /projects**
Create a new project
```json
{
  "name": "Website Redesign",
  "description": "Modernize the company website",
  "teamId": "team_id",
  "dueDate": "2024-12-31"
}
```

#### **PUT /projects/:id**
Update a project (admin or manager)

#### **DELETE /projects/:id**
Delete a project (admin only)

### **Team Endpoints** (Requires Authentication)

#### **GET /teams**
Fetch all teams

#### **POST /teams**
Create a new team (admin only)
```json
{
  "name": "Engineering",
  "description": "Frontend and backend development"
}
```

#### **POST /teams/:id/members**
Add a member to a team (admin only)
```json
{
  "userId": "user_id",
  "role": "member"
}
```

#### **PUT /teams/:id/members/:memberId**
Update member role (admin only)
```json
{
  "role": "manager"
}
```

### **Dashboard Endpoint** (Requires Authentication)

#### **GET /dashboard/metrics**
Fetch dashboard metrics
```json
{
  "totalTasks": 25,
  "inProgress": 5,
  "completed": 15,
  "overdue": 2,
  "weeklyProgress": [...]
}
```

---

## 🔐 Authentication & Authorization

### **How Authentication Works**

1. User registers or logs in
2. Backend validates credentials and returns a JWT token
3. Frontend stores token in localStorage/sessionStorage
4. Token is sent in `Authorization: Bearer <token>` header on each request
5. Backend middleware verifies token before processing request

### **Role-Based Access Control (RBAC)**

| Feature | Admin | Manager | Member |
|---------|-------|---------|--------|
| View all tasks | ✅ | ✅ | ❌ (only assigned) |
| Create tasks | ✅ | ✅ | ❌ |
| Assign tasks | ✅ | ✅ | ❌ |
| Update task status | ✅ | ✅ | ✅ (own tasks) |
| Delete tasks | ✅ | ❌ | ❌ |
| Create projects | ✅ | ✅ | ❌ |
| Manage teams | ✅ | ❌ | ❌ |
| Manage roles | ✅ | ❌ | ❌ |
| View dashboard | ✅ | ✅ | ✅ (personal) |

### **Middleware Protection**

Every API endpoint is protected by:
1. **authMiddleware** — Verifies JWT token
2. **roleMiddleware** — Checks user role against required permissions
3. **Database queries filter** — Only returns data user has access to

---

## 🐳 Docker & Deployment

### **Build Docker Image**

```bash
cd frontend

# Build Docker image
docker build -t teamflow-frontend .

# Run container locally
docker run -p 3000:80 teamflow-frontend
```

### **Deploy to Railway**

1. Connect your GitHub repository to Railway
2. Create a new project and select your repository
3. Configure environment variables in Railway dashboard
4. Deploy automatically on push to main branch

**Frontend Deployment:**
- Set `VITE_API_URL` to your backend API URL
- Build command: `npm run build`
- Start command: `npm run preview`

**Backend Deployment:**
- Set `DATABASE_URL`, `JWT_SECRET`, etc.
- Build command: `npm install`
- Start command: `npm start`

---






## 🧪 Testing

### **Run Tests**

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ../frontend
npm test
```

### **API Testing with Postman/Insomnia**

1. Import the API collection (if available in the repo)
2. Set up environment variables:
   - `BASE_URL`: Your API endpoint
   - `AUTH_TOKEN`: JWT token from login response
3. Test endpoints systematically

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Code Style Guidelines**
- Use consistent naming conventions (camelCase for JS, snake_case for SQL)
- Add comments for complex logic
- Keep functions small and focused
- Write meaningful commit messages

---

## 🐛 Known Issues & Limitations

- Session rate limiting on free Railway tier (upgrade for production)
- File upload feature not yet implemented
- Real-time collaboration (WebSockets) coming soon
- Mobile app version in development
- Email notifications currently not enabled

---

## 📝 Environment Variables



### **Frontend (.env.production)**
```env
VITE_API_URL=https://teamflow-production-5659.up.railway.app/api
VITE_APP_NAME=TeamFlow
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---








---

## 🎬 Video Demo

Check out the **3-minute explainer video** on [Loom](https://loom.com) for a walkthrough of all features.

---

## 👨‍💻 Authors

- **Naveen Singh** — Full-stack developer
- **GitHub:** [@yourusername](https://github.com/naveensingh1212)


---

## 💡 Acknowledgments

- Built with React, Node.js, and modern web technologies
- Inspired by Asana, Monday.com, and Notion
- Thanks to the open-source community for amazing libraries
- Special thanks to Railway for easy deployment

---

**Made with ❤️ by the TeamFlow team**

⭐ **If you found this helpful, please star the repository!**
