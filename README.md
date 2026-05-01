# IBM-HACKATHON-2026
BUILD YOUR DREAMS USING BOB IDE


# Full-Stack Application – Developer Guide  
**React (Client) + Laravel (Server)**

This repository contains a **full-stack web application** with:
- **React + TypeScript (Vite)** for the frontend
- **Laravel** for the backend API

---

## 📁 Root Structure

root
│
├─ client
└─ server 

---

## 📁 Client (React + TypeScript Frontend)

client/
│
├─ src
│ ├─ assets
│ ├─ components
│ ├─ config
│ ├─ context
│ ├─ hooks
│ ├─ layouts
│ ├─ pages
│ ├─ services
│ ├─ styles
│ ├─ utilities
│ ├─ App.tsx
│ ├─ index.css
│ ├─ main.tsx
│ └─ vite-env.d.ts
│
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ README.md
├─ TYPESCRIPT_SETUP.md
└─ INSTALLATION_GUIDE.md


---

### 📂 `client/src/`

Contains all frontend source code.

---

### `assets/`
Static frontend resources such as images, icons, and fonts.

---

### `components/`
Reusable UI components.

**Rules:**
- UI-only
- No API calls
- Reusable across pages

---

### `context/`
Global state management using **Context API + Reducer pattern**.

Each context feature must contain **three files**:

context/
└─ feature-name/
  ├─ FeatureContext.tsx
  ├─ FeatureReducer.ts
  └─ FeatureState.ts


**Responsibilities:**

- `FeatureContext.tsx`  
  Creates the context, provider, and connects reducer/state

- `FeatureReducer.ts`  
  Pure reducer payload and action handling

- `FeatureState.ts`  
  Initial state 

**Rules:**
- One feature per folder
- No UI inside context
- No API calls in reducers

---

### `hooks/`
Reusable logic and side effects.

**Examples:**
- API calls to Laravel
- Auth handling
- Data fetching

---

### `services/`
API communication layer and external service integrations.

**Responsibilities:**
- Centralized API endpoint definitions
- HTTP request/response handling
- Axios instance configuration
- API error handling
- Data transformation before/after API calls

**Rules:**
- One service file per resource/feature
- No UI logic
- Return promises or async/await
- Handle API-specific errors

**Example Structure:**
```
services/
├─ api.ts              # Base axios instance
├─ authService.ts      # Auth endpoints
└─ userService.ts      # User CRUD endpoints
```

---

### `layouts/`
Page wrappers such as Navbar, Sidebar, and Footer.

---

### `pages/`
Route-based views.

**Rules:**
- One page per route
- Pages may call APIs

---

### `utilities/`
Pure helper functions and constants.

**Organized by feature:**
```
utilities/
├─ admin-utils/
├─ client-utils/
└─ system-utils/
```

**Rules:**
- Pure functions only (no side effects)
- No API calls
- No state management
- Reusable across the application

---

### `styles/`
Component-specific and feature-specific styles.

**Organized by feature:**
```
styles/
├─ admin-css/
├─ client-css/
└─ system-css/
```

**Rules:**
- Use Tailwind CSS utility classes (primary)
- CSS modules for component-specific styles
- Global styles in `index.css`

---

### `config/`
Application configuration files.

**Examples:**
- API endpoints configuration
- Environment-specific settings
- Feature flags
- Constants

**Rules:**
- No business logic
- Export configuration objects
- Use TypeScript for type safety

---

### Core Client Files

- `App.tsx` – Routing, layout, providers (TypeScript)
- `main.tsx` – App entry point (TypeScript)
- `index.css` – Global styles (Tailwind CSS)
- `vite-env.d.ts` – Vite environment type definitions

---

## 🔧 Client Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation Steps

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Server will start at `http://localhost:5173`

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Type check + build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint to check code quality
npm run type-check   # Check TypeScript types only (no build)
```

### Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=My Application
```

**Note:** Vite requires environment variables to be prefixed with `VITE_`

---

## 📘 TypeScript Guidelines

### Component Props Typing

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ label, onClick, disabled = false }: ButtonProps): JSX.Element {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}
```

### State Typing

```typescript
import { useState } from 'react';

// Simple state
const [count, setCount] = useState<number>(0);

// Object state
interface User {
  id: number;
  name: string;
  email: string;
}

const [user, setUser] = useState<User | null>(null);
```

### Event Handlers

```typescript
// Form submit
const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
  event.preventDefault();
};

// Input change
const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
  console.log(event.target.value);
};

// Button click
const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
  console.log('Clicked');
};
```

### API Response Types

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

async function fetchProducts(): Promise<ApiResponse<Product[]>> {
  const response = await fetch('/api/products');
  return response.json();
}
```

For more TypeScript patterns, see `client/README.md`

---

## 📁 Server (Laravel Backend)


server/
│
├─ app
│ ├─ Http
│ │ ├─ Controllers
│ │ ├─ Request
│ │ └─ Middleware
│ ├─ Models
│ └─ Providers
│
├─ database
│ ├─ migrations
│ ├─ seeders
│ └─ factories
│
├─ routes
│ ├─ api.php
│ └─ web.php
│
├─ config
├─ storage
├─ public
└─ .env



---

### 📂 `routes/api.php`
Defines all API endpoints consumed by the React client.

**Guidelines:**
- Use RESTful routes
- Group routes with middleware
- Prefer `Route::apiResource` when possible

---

### 📂 `app/Http/Controllers`
Handles API logic and request processing.

**Rules:**
- Controllers should be thin
- Business logic should be delegated to services (if applicable)

---

### 📂 `app/Models`
Eloquent models representing database tables.

---

### 📂 `database/`
Contains:
- Migrations
- Seeders
- Factories

---

### 📂 `config/`
Laravel configuration files.

---

### 📂 `storage/`
Logs, cache, and file uploads.

---

## 🔗 Client ↔ Server Communication

### Communication Flow

```
React Component → Custom Hook → Service Layer → Axios → Laravel API
                                                              ↓
React Component ← Custom Hook ← Service Layer ← JSON Response ← Controller → Model
```

### Architecture Layers

1. **React Component (UI Layer)**
   - Renders UI
   - Handles user interactions
   - Calls custom hooks

2. **Custom Hook (Logic Layer)**
   - Manages component state
   - Handles side effects
   - Calls service functions

3. **Service Layer (API Layer)**
   - Centralized API calls
   - Request/response transformation
   - Error handling

4. **Laravel API (Backend)**
   - Route → Controller → Model
   - Business logic
   - Database operations

### Configuration

**Client `.env`:**
```env
VITE_API_URL=http://localhost:8000/api
```

**Server `.env`:**
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### Authentication

Recommended: **Laravel Sanctum** (SPA Authentication)

**Setup:**
1. Install Sanctum in Laravel
2. Configure CORS
3. Use `axios.defaults.withCredentials = true`
4. Handle CSRF token

**Alternative:** JWT (JSON Web Tokens)

### Example Implementation

**Service Layer (`services/authService.ts`):**
```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    await axios.post(`${API_URL}/logout`);
  }
};
```

**Custom Hook (`hooks/useAuth.ts`):**
```typescript
import { useState } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      // Handle success
      return data;
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
```

**React Component:**
```typescript
import { useAuth } from '../hooks/useAuth';

function LoginPage(): JSX.Element {
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 📦 Tech Stack

### Frontend (Client)
- **Framework:** React 19.2.0
- **Language:** TypeScript 5.7.3
- **Build Tool:** Vite 7.2.4
- **Styling:** Tailwind CSS 4.1.18
- **Routing:** React Router DOM 7.13.1
- **Icons:** React Icons 5.5.0
- **PDF Generation:** @react-pdf/renderer 4.3.2
- **Excel Export:** xlsx 0.18.5

### Backend (Server)
- **Framework:** Laravel
- **Language:** PHP
- **Database:** MySQL/PostgreSQL
- **Authentication:** Laravel Sanctum

---

## 🚀 Getting Started

### 1. Clone Repository
```bash
git clone <repository-url>
cd IBM-HACKATHON-2026
```

### 2. Setup Client
```bash
cd client
npm install
npm run dev
```

### 3. Setup Server
```bash
cd server
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### 4. Access Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000

---

## 📚 Documentation

- **Client Setup:** `client/INSTALLATION_GUIDE.md`
- **TypeScript Guide:** `client/TYPESCRIPT_SETUP.md`
- **React Patterns:** `client/README.md`
- **API Documentation:** `server/README.md` (if available)

---

## 🤝 Contributing

1. Create a feature branch
2. Follow TypeScript and React best practices
3. Write type-safe code
4. Test your changes
5. Submit a pull request

---

## 📝 License

[Your License Here]

