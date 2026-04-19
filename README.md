# Class Plus Platform

Class Plus is a comprehensive educational recruitment and management platform designed to connect schools with qualified teachers. It features a robust teacher assessment system, detailed profiles, and a streamlined booking process.

## 🚀 Project Overview

The platform is divided into two main parts:
- **Frontend**: Built with Next.js (App Router), focusing on a premium user experience and responsive design.
- **Backend**: Powered by ASP.NET Core with SQLite for data persistence, providing a secure and efficient API.

## 📁 Repository Structure

```text
├── frontend/             # Next.js Application
├── backend/              # ASP.NET Core Web API
├── .gitignore            # Root gitignore to exclude unnecessary files
└── README.md             # This file
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- .NET SDK (v8.0 or higher)

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Restore dependencies:
   ```bash
   dotnet restore
   ```
3. Run the migrations to setup the database:
   ```bash
   dotnet ef database update
   ```
4. Start the backend:
   ```bash
   dotnet run
   ```
   The API will be available at `http://localhost:5000` (check `appsettings.json` for details).

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file (if needed) and add your API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## ✨ Key Features
- **Teacher Assessment Center**: Multi-step registration with subject-specific testing.
- **Profile Strength Meter**: Encourages teachers to complete their profiles.
- **Advanced Search**: Filter teachers by subject, experience, and more.
- **Booking Management**: Streamlined interaction between schools and teachers.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## 📝 License
This project is for educational purposes as part of the Class Plus platform development.
