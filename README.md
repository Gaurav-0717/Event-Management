# EventWise — AI-Powered Event Planning & Budget Optimization System

EventWise is an intelligent, full-stack event planning platform designed to streamline event organization, timeline generation, budget allocation, and vendor requirements.

This repository contains the full-stack architecture initialized with clean, scalable, and modular design patterns for college project presentations and production scalability.

---

## 🌐 Live Deployment

### Frontend

**EventWise Web Application:**  
https://event-management-beryl-eight.vercel.app/

### Backend

**EventWise API:**  
https://eventwise-api.onrender.com

### Backend Health Check

https://eventwise-api.onrender.com/api/health

---

## Technology Stack

### Frontend

- **Framework & Tooling**: React.js (v18) + Vite
- **Styling**: Tailwind CSS with custom brand palettes & glassmorphic UI components
- **Routing**: React Router (v6)
- **HTTP Client**: Axios with configured interceptors and base URLs
- **Icons**: Lucide React
- **Data Visualization**: Recharts

### Backend

- **Runtime & Framework**: Node.js & Express.js
- **Database Layer**: MongoDB with Mongoose ODM
- **Environment & Middleware**: `dotenv`, `cors`, `morgan`
- **Development Tooling**: `nodemon`
- **Deployment**: Render

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
│   ├── public/                 # Static assets
│   └── src/
│       ├── main.jsx            # React root mount & BrowserRouter setup
│       ├── App.jsx             # Top-level application routes
│       ├── index.css           # Tailwind base styles and custom UI
│       ├── components/         # Reusable UI components
│       ├── pages/              # Routed pages
│       ├── layouts/            # Page layouts
│       ├── services/           # Axios API instance and API services
│       ├── hooks/              # Custom React hooks
│       ├── context/            # Global state context
│       └── utils/              # Utility helpers
│
├── server/                     # Backend API (Node.js + Express)
│   ├── package.json            # Backend dependencies and npm scripts
│   ├── server.js               # Express application entry point
│   ├── .env.example            # Server environment variable template
│   ├── .env                    # Local server environment config
│   ├── config/                 # Database configuration
│   ├── controllers/            # Request handlers
│   ├── models/                 # Mongoose schema definitions
│   ├── routes/                 # API route definitions
│   ├── middleware/             # Error handlers & 404 middleware
│   ├── services/               # Core business logic services
│   └── utils/                  # Helper utilities & logger
│
└── README.md                   # Project documentation
