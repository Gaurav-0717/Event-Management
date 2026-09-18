# EventWise — AI-Powered Event Planning & Budget Optimization System

EventWise is an intelligent, full-stack event planning platform designed to streamline event organization, timeline generation, budget allocation, and vendor requirements. 

This repository contains the foundational full-stack architecture initialized with clean, scalable, and modular design patterns for college project presentations and production scalability.

---

## Technology Stack

### Frontend
- **Framework & Tooling**: [React.js](https://react.dev/) (v18) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom brand palettes & glassmorphic UI components
- **Routing**: [React Router](https://reactrouter.com/) (v6)
- **HTTP Client**: [Axios](https://axios-http.com/) with configured interceptors and base URLs
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/) (ready for Phase 2/3 budget breakdowns)

### Backend
- **Runtime & Framework**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database Layer**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
- **Environment & Middleware**: `dotenv`, `cors`, `morgan`
- **Development Tooling**: `nodemon`

---

## Project Structure

```text
Event/
├── client/                     # Frontend Application (React + Vite)
│   ├── index.html              # HTML entry point with Google Fonts
│   ├── package.json            # Client dependencies and npm scripts
│   ├── vite.config.js          # Vite build configuration
│   ├── tailwind.config.js      # Tailwind theme and content configuration
│   ├── postcss.config.js       # PostCSS plugins
│   ├── .env.example            # Client environment variable template
│   ├── .env                    # Local client environment config
│   ├── public/                 # Static assets (favicons, SVGs)
│   └── src/
│       ├── main.jsx            # React root mount & BrowserRouter setup
│       ├── App.jsx             # Top-level application routes
│       ├── index.css           # Tailwind base styles and custom glassmorphism
│       ├── components/         # Reusable UI components (Navbar, Footer, StatusBadge)
│       ├── pages/              # Routed pages (HomePage, NotFoundPage)
│       ├── layouts/            # Page layouts (MainLayout)
│       ├── services/           # Axios API instance and health endpoints
│       ├── hooks/              # Custom React hooks (useHealthCheck)
│       ├── context/            # Global state context (AppContext)
│       └── utils/              # Utility helpers (formatters)
│
├── server/                     # Backend API (Node.js + Express)
│   ├── package.json            # Backend dependencies and npm scripts
│   ├── server.js               # Express application entry point
│   ├── .env.example            # Server environment variable template
│   ├── .env                    # Local server environment config
│   ├── config/                 # Database configuration (db.js)
│   ├── controllers/            # Request handlers (healthController.js)
│   ├── models/                 # Mongoose schema definitions (index.js)
│   ├── routes/                 # API route definitions (healthRoutes.js, index.js)
│   ├── middleware/             # Error handlers & 404 middlewares
│   ├── services/               # Core business logic services
│   └── utils/                  # Helper utilities & logger
│
└── README.md                   # Project documentation
```

---

## Environment Variables

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/eventwise
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Installation & Running Locally

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **MongoDB** (Local instance or MongoDB Atlas URI)

### 1. Install Dependencies

#### Install Backend Dependencies:
```bash
cd server
npm install
```

#### Install Frontend Dependencies:
```bash
cd ../client
npm install
```

---

### 2. Running the Project

Open two terminal windows:

#### Terminal 1 — Start the Backend Server:
```bash
cd server
npm run dev
```
> Server runs on: `http://localhost:5000`  
> Health check endpoint: `http://localhost:5000/api/health`

#### Terminal 2 — Start the Frontend Client:
```bash
cd client
npm run dev
```
> Client runs on: `http://localhost:5173`

---

## API Endpoints (Phase 1)

| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API Root Metadata | Operational |
| `GET` | `/api/health` | System diagnostics & DB status check | Operational |

---

## Future Roadmap (Phases 2+)
- **Phase 2**: Authentication & User Management (JWT + bcrypt).
- **Phase 3**: Event Input Engine & Dynamic Form with budget parameters.
- **Phase 4**: AI Integration for automated plan and itinerary generation.
- **Phase 5**: Budget Optimization & Real-Time Recharts Breakdown.
- **Phase 6**: Timeline Scheduler & Interactive Checklist.
- **Phase 7**: Vendor Matching & Downloadable Event Dossier (PDF).
