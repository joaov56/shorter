<img width="1510" alt="Captura de Tela 2025-04-25 às 22 05 27" src="https://github.com/user-attachments/assets/694b5e56-5c5d-4945-813f-e5a9d1c962fc" /># URL Shortener

A URL shortener application built with Go (backend), MongoDB (database), and Next.js (frontend).

## Prerequisites

- Go 1.16 or higher
- Node.js 14 or higher
- MongoDB
- npm or yarn

## Setup and Running

### Quick Start

1. Install all dependencies:

   ```bash
   npm run install:all
   ```

2. Start both frontend and backend services:
   ```bash
   npm start
   ```

This will start:

- Frontend on `http://localhost:3000`
- Backend on `http://localhost:8080`

### Manual Setup

#### Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   go mod tidy
   ```

3. Start the backend server:
   ```bash
   go run main.go
   ```

The backend server will run on `http://localhost:8080`.

#### Frontend

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:3000`.

## Features

- Shorten long URLs
- Redirect to original URLs
- Modern and responsive UI
- Error handling
- Loading states

## API Endpoints

- `POST /api/url` - Create a new shortened URL
- `GET /api/url/{shortURL}` - Get the original URL

## Project Structure

```
.
├── backend/
│   └── main.go
├── frontend/
│   ├── src/
│   │   └── app/
│   │       └── page.tsx
│   └── package.json
├── package.json
└── README.md
```
