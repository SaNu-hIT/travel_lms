# LMS SaaS - Multi-Tenant Lead Management System

A comprehensive multi-tenant SaaS application for lead management built with Next.js, TypeScript, MongoDB, and shadcn/ui.

## Features

### Multi-Tenancy
- Complete tenant isolation at the database level
- Multiple companies can use the same platform with complete data separation
- SaaS Admin can manage all tenants

### Role-Based Access Control
- **SaaS Admin**: Platform administrator who can create and manage tenant companies
- **Company Admin**: Can manage users and leads within their tenant
- **Manager**: Can view team statistics and reassign leads among team members
- **Employee**: Can view and manage their assigned leads

### Lead Management
- Create, update, and delete leads
- Lead assignment (manual and auto-assign)
- Lead status tracking (New, Contacted, Interested, Closed Won/Lost)
- Comments and follow-up dates
- Dashboard statistics and conversion rates

### User Management
- Create managers and employees
- Role-based access control
- Manager-employee hierarchy

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **State Management**: Zustand
- **UI Components**: shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS
- **Authentication**: JWT
- **HTTP Client**: Axios with interceptors

## Project Structure

```
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── tenants/        # Tenant management
│   │   ├── users/          # User management
│   │   └── leads/          # Lead management
│   ├── login/              # Login page
│   ├── saas-admin/         # SaaS Admin dashboard
│   ├── company-admin/      # Company Admin dashboard
│   ├── manager/            # Manager dashboard
│   └── employee/           # Employee dashboard
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── shared/             # Shared components
├── lib/                    # Core utilities
│   ├── mongodb.ts          # Database connection
│   ├── auth.ts             # Auth utilities
│   ├── axios.ts            # Axios instance
│   └── utils.ts            # Helper functions
├── models/                 # Mongoose models
│   ├── Tenant.ts
│   ├── User.ts
│   └── Lead.ts
├── services/               # API service layer
│   ├── authService.ts
│   ├── tenantService.ts
│   ├── userService.ts
│   └── leadService.ts
├── store/                  # Zustand stores
│   ├── authStore.ts
│   ├── leadStore.ts
│   └── userStore.ts
├── middleware/             # Custom middleware
│   └── auth.ts            # Authentication & authorization
├── types/                  # TypeScript types
│   └── index.ts
└── scripts/                # Utility scripts
    └── seed.ts            # Database seeding
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or remote)
- npm or yarn

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local` and configure:
   ```env
   MONGODB_URI=mongodb://localhost:27017/lms_saas
   JWT_SECRET=your-super-secret-jwt-key
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Demo Credentials

After seeding the database, you can log in with these credentials:

### SaaS Admin
- Email: `admin@lmsplatform.com`
- Password: `admin123`
- Can create and manage tenant companies

### Acme Corporation

**Company Admin**
- Email: `admin@acme.com`
- Password: `admin123`
- Can manage users and leads

**Manager**
- Email: `manager@acme.com`
- Password: `manager123`
- Can view team stats and reassign leads

**Employee 1**
- Email: `employee1@acme.com`
- Password: `employee123`
- Has 3 assigned leads

**Employee 2**
- Email: `employee2@acme.com`
- Password: `employee123`
- Has 2 assigned leads

### TechCo Industries

**Company Admin**
- Email: `admin@techco.com`
- Password: `admin123`

**Employee**
- Email: `employee@techco.com`
- Password: `employee123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tenants (SaaS Admin only)
- `GET /api/tenants` - Get all tenants
- `POST /api/tenants` - Create tenant
- `GET /api/tenants/:id` - Get tenant by ID
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant

### Users
- `GET /api/users` - Get all users in tenant
- `POST /api/users` - Create user (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Leads
- `GET /api/leads` - Get all leads (filtered by role)
- `POST /api/leads` - Create lead
- `GET /api/leads/:id` - Get lead by ID
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead (Admin/Manager only)
- `POST /api/leads/:id/comments` - Add comment to lead
- `GET /api/leads/stats` - Get dashboard statistics

## Key Features Explained

### Multi-Tenancy
Every query is automatically filtered by `tenantId` to ensure complete data isolation. SaaS Admin has special permissions to access all tenants.

### Role-Based Access
- Routes are protected using the `ProtectedRoute` component
- API endpoints use middleware to verify roles
- Employees can only see their assigned leads
- Managers can see all team leads
- Admins can see all tenant leads

### State Management
- Zustand for global state (auth, leads, users)
- Local state for component-specific data
- Persistent auth state across page reloads

### Authentication Flow
1. User logs in with email/password
2. Server verifies credentials and generates JWT
3. Token stored in localStorage and Zustand store
4. Axios interceptor attaches token to all requests
5. Server middleware validates token and extracts user info

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with demo data

## Database Schema

### Tenant
- Company information
- Plan and status
- Max users allowed

### User
- Belongs to a tenant
- Role-based (SaaS Admin, Admin, Manager, Employee)
- Manager hierarchy support

### Lead
- Belongs to a tenant
- Assignment tracking
- Status and source tracking
- Comments and follow-ups
- Complete audit trail

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Tenant isolation at database level
- Role-based authorization
- Protected API routes
- XSS protection via React
- CSRF protection via same-origin policy

## Future Enhancements

- CSV lead import functionality
- Bulk lead assignment
- Email notifications
- Advanced reporting and analytics
- Lead scoring
- Activity timeline
- File attachments
- Integration with CRM systems
- Two-factor authentication
- Audit logs

## Contributing

This is a demo project showcasing multi-tenant SaaS architecture. Feel free to use it as a template for your own projects.

## License

MIT
