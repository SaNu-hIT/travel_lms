# Quick Start Guide

## Prerequisites

1. **Node.js 18+** installed
2. **MongoDB** running locally or remotely

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env.local` file is already created with default values:

```env
MONGODB_URI=mongodb://localhost:27017/lms_saas
JWT_SECRET=super-secret-jwt-key-change-in-production-2024
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Important**: If using a remote MongoDB instance, update the `MONGODB_URI` value.

### 3. Start MongoDB

If using local MongoDB:

```bash
# macOS (if installed via Homebrew)
brew services start mongodb-community

# Or run directly
mongod

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 4. Seed the Database

```bash
npm run seed
```

This will create:
- 2 demo companies (Acme Corp & TechCo)
- Multiple users with different roles
- Sample leads for testing

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Login Credentials

### SaaS Admin
- **Email**: `admin@lmsplatform.com`
- **Password**: `admin123`
- **Access**: Can create and manage all tenant companies

### Acme Corporation

**Company Admin**
- **Email**: `admin@acme.com`
- **Password**: `admin123`
- **Access**: Can manage users and leads for Acme Corp

**Manager**
- **Email**: `manager@acme.com`
- **Password**: `manager123`
- **Access**: Can view team stats and reassign leads

**Employee 1**
- **Email**: `employee1@acme.com`
- **Password**: `employee123`
- **Access**: Can view and update assigned leads (3 leads)

**Employee 2**
- **Email**: `employee2@acme.com`
- **Password**: `employee123`
- **Access**: Can view and update assigned leads (2 leads)

### TechCo Industries

**Company Admin**
- **Email**: `admin@techco.com`
- **Password**: `admin123`

**Employee**
- **Email**: `employee@techco.com`
- **Password**: `employee123`

## Testing Multi-Tenancy

To verify multi-tenancy isolation:

1. **Login as Acme Admin** (`admin@acme.com`)
   - You should only see Acme Corp users and leads

2. **Login as TechCo Admin** (`admin@techco.com`)
   - You should only see TechCo users and leads
   - Acme Corp data should not be visible

3. **Login as SaaS Admin** (`admin@lmsplatform.com`)
   - You can see all tenants in the dashboard
   - You can create new tenant companies

## Testing Role-Based Access

### As Employee (`employee1@acme.com`)
- ✅ Can view assigned leads only
- ✅ Can update lead status and add comments
- ✅ Can set follow-up dates
- ❌ Cannot see other employees' leads
- ❌ Cannot reassign leads
- ❌ Cannot create users

### As Manager (`manager@acme.com`)
- ✅ Can view all team members' leads
- ✅ Can reassign leads
- ✅ Can view team statistics
- ❌ Cannot create or delete users

### As Company Admin (`admin@acme.com`)
- ✅ Can create managers and employees
- ✅ Can create and assign leads
- ✅ Can view all company data
- ❌ Cannot see other companies' data

### As SaaS Admin (`admin@lmsplatform.com`)
- ✅ Can create new tenant companies
- ✅ Can view all tenants
- ✅ Full platform access

## Common Tasks

### Create a New Company (SaaS Admin)
1. Login as SaaS Admin
2. Click "Add New Tenant"
3. Fill in company details
4. Click "Create Tenant"

### Add a New User (Company Admin)
1. Login as Company Admin
2. Go to "Users" tab
3. Click "Add User"
4. Fill in user details
5. Select role (Manager or Employee)
6. If Employee, select a manager

### Create and Assign Leads (Company Admin)
1. Login as Company Admin
2. Go to "Leads" tab
3. Click "Add Lead"
4. Fill in lead details
5. Select an employee to assign
6. Click "Create Lead"

### Update Lead Status (Employee)
1. Login as Employee
2. Find your assigned lead
3. Click "View/Update"
4. Change status (New → Contacted → Interested → Closed Won/Lost)
5. Add comments
6. Set follow-up date
7. Click "Update Lead"

### Reassign Leads (Manager)
1. Login as Manager
2. View team leads
3. Use the "Reassign" dropdown
4. Select new team member
5. Lead is automatically reassigned

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env.local`
- Verify MongoDB is listening on the correct port (default: 27017)

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Seed Errors
```bash
# Drop the database and reseed
mongosh
use lms_saas
db.dropDatabase()
exit

npm run seed
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## Production Build

```bash
npm run build
npm start
```

## Next Steps

1. Explore different role dashboards
2. Test multi-tenancy isolation
3. Create custom workflows
4. Review the API documentation in README.md
5. Customize the UI components

## Support

For issues or questions, refer to:
- Main README.md for detailed documentation
- Code comments for implementation details
- MongoDB documentation for database queries
