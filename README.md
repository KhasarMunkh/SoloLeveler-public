# SoloLeveler

A gamified personal development and productivity mobile app built with Expo/React Native. Users manage daily quests and tasks with a timeline interface, AI-powered summaries, and secure authentication.

## Features

- **Task Management** - Create, edit, and complete daily quests with a visual timeline
- **AI-Powered Summaries** - OpenAI integration for daily quest summaries
- **Secure Authentication** - Clerk authentication with OAuth support (Google, Apple)
- **Real-time Sync** - All data persisted to MongoDB with optimistic UI updates
- **Cross-Platform** - Works on iOS, Android, and web via Expo

## Tech Stack

### Frontend
- **Framework:** Expo (React Native) with TypeScript
- **Routing:** Expo Router (file-based)
- **Styling:** NativeWind (Tailwind for React Native)
- **Auth:** Clerk React Native SDK

### Backend
- **Runtime:** Node.js with Express
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Auth:** Clerk JWT validation
- **AI:** OpenAI API

## Architecture

```
/backend     - Express TypeScript API server
/frontend    - Expo React Native mobile app
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quests` | Get all user's quests |
| POST | `/quests` | Create new quest |
| PATCH | `/quests/:id` | Update quest |
| DELETE | `/quests/:id` | Delete quest |
| PATCH | `/quests/:id/complete` | Toggle completion |
| GET | `/quests/wakie-wakie` | AI daily summary |

All endpoints require JWT authentication via Bearer token.

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- Clerk account (for auth keys)
- OpenAI API key (for AI features)

### Installation

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/SoloLeveler.git
cd SoloLeveler
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd frontend
yarn install
```

4. Configure environment variables

**Backend** (`backend/.env`):
```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
CLERK_SECRET_KEY=your_clerk_secret
OPENAI_API_KEY=your_openai_key
```

**Frontend** (`frontend/.env`):
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Running the App

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
yarn start
```

Scan the QR code with Expo Go or press `a` for Android / `i` for iOS simulator.

## Testing

```bash
cd backend
npm test              # Run all tests
npm run test:coverage # With coverage report
```

39 tests covering all API endpoints, authentication, and business logic.

## Project Structure

```
backend/
├── src/
│   ├── models/        # Mongoose schemas (User, Task)
│   ├── routes/        # Express route handlers
│   ├── services/      # Business logic (auth, LLM)
│   ├── db/            # Database connection
│   └── __tests__/     # Jest test suites

frontend/
├── app/
│   ├── (auth)/        # Sign-in/sign-up screens
│   ├── (tabs)/        # Main app screens
│   ├── components/    # Reusable UI components
│   └── lib/           # API client, utilities
```

## Key Components

- **DayTimeline** - Visual timeline showing tasks by hour
- **TaskEditorSheet** - Bottom sheet for creating/editing tasks
- **TaskPill** - Individual task display with completion toggle
