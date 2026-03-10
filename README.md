# Advanced Tracking System - Frontend

A minimalistic Lost & Found tracking system built with React, TypeScript, and Firebase.

## Features

- 🔐 **Authentication**: Firebase-based email/password authentication
- 📦 **Item Management**: Report lost/found items with image upload
- 🔍 **Search & Filter**: Browse and filter items by type
- 💬 **Claim Chat**: Real-time communication between users and admins
- 👑 **Admin Dashboard**: Review and manage pending claims
- 📱 **Responsive Design**: Clean, minimalistic UI that works on all devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **React Router** for navigation
- **Axios** for API calls
- **Firebase** for authentication
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase project with Authentication enabled
- Backend API running (see backend documentation)

### Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API utilities and services
│   │   ├── axios.ts      # Axios instance with interceptors
│   │   └── services.ts   # API service functions
│   ├── components/       # Reusable components
│   │   └── Layout.tsx    # Main layout with navigation
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── pages/            # Page components
│   │   ├── Login.tsx     # Login page
│   │   ├── Home.tsx      # Item listing page
│   │   ├── ReportItem.tsx  # Report item form
│   │   ├── MyClaims.tsx  # User's claims dashboard
│   │   ├── ClaimChat.tsx # Claim chat interface
│   │   └── Admin.tsx     # Admin dashboard
│   ├── App.tsx           # Main app with routing
│   ├── main.tsx          # Entry point
│   ├── firebase.ts       # Firebase configuration
│   └── index.css         # Global styles
├── .env                  # Environment variables
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Pages & Routes

| Route | Component | Description | Auth Required |
|-------|-----------|-------------|---------------|
| `/login` | Login | User authentication | No |
| `/` | Home | Browse items | Yes |
| `/report` | ReportItem | Report lost/found item | Yes |
| `/my-claims` | MyClaims | View user's claims | Yes |
| `/claims/:id/chat` | ClaimChat | Chat about a claim | Yes |
| `/admin` | Admin | Admin dashboard | Yes (Admin only) |

## API Integration

The frontend communicates with the backend API using Axios. All requests automatically include the Firebase authentication token in the `Authorization` header.

### Key API Endpoints

- `POST /api/auth/login` - User login
- `GET /api/items` - Get all items
- `POST /api/items` - Report new item
- `POST /api/claims` - Submit claim
- `GET /api/claims/my` - Get user's claims
- `GET /api/admin/claims/pending` - Get pending claims (admin)

See `src/api/services.ts` for complete API documentation.

## Authentication Flow

1. User logs in via Firebase Authentication
2. Firebase returns an ID token
3. Token is automatically attached to all API requests via Axios interceptor
4. Backend verifies token and processes request
5. On 401 error, user is redirected to login

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `VITE_API_URL` | Backend API URL | Yes |

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## License

MIT

# Advanced Tracking System – Frontend

## Project Overview
This project is the frontend of the Advanced Tracking System, built using modern web technologies.

## Use Case Diagrams

### User Authentication
![Authentication Use Case](docs/diagrams/UseCaseDiagram1.png)

### Class Diagram
![Class Diagram](docs/diagrams/class_diagram.png)

### Sequence Diagram
![Sequence Diagram](docs/diagrams/sequence_diagram.png)

