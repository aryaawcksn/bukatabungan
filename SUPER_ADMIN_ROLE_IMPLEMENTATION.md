# Super Admin Role Implementation

## Overview
Added super admin role functionality with conditional role options in user management:
- **Admin Cabang**: Can create `employement` and `admin_cabang` roles
- **Super Admin**: Can create `employement`, `admin_cabang`, and `super_admin` roles

## Changes Made

### Frontend Changes (`dashboard/src/components/AccountSetting.tsx`)

#### 1. Updated Interface and Imports
- Added `useAuth` import to access current user context
- Updated `User` interface to include `super_admin` role
- Added current user context: `const { user: currentUser } = useAuth()`

#### 2. Role Selection Logic
```typescript
// Role dropdown with conditional options
<SelectContent>
  <SelectItem value="employement">Staff Cabang</SelectItem>
  <SelectItem value="admin_cabang">Admin Cabang</SelectItem>
  {/* Super Admin option only visible to super admin */}
  {currentUser?.role === 'super_admin' && (
    <SelectItem value="super_admin">Super Admin</SelectItem>
  )}
</SelectContent>
```

#### 3. Branch Selection Logic
- **Super Admin**: Can select any branch for new users
- **Admin Cabang**: Locked to their own branch
```typescript
disabled={currentUser?.role !== "super_admin"}
```

#### 4. Updated Role Display
- Added color coding for all three roles:
  - `super_admin`: Red badge
  - `admin_cabang`: Purple badge  
  - `employement`: Blue badge

### Backend Changes

#### 1. Updated Auth Routes (`backend/routes/authRoutes.js`)
```javascript
// Updated to allow both admin_cabang and super_admin
authorizeRole("admin_cabang", "super_admin")
```

#### 2. Updated Auth Controller (`backend/controllers/authController.js`)

##### Register Function
- **Role Validation**: Dynamic based on current user's role
- **Branch Assignment**: Super admin can assign to any branch
```javascript
// Role validation based on current user's role
let allowedRoles = ["employement", "admin_cabang"];
if (req.user.role === "super_admin") {
  allowedRoles.push("super_admin");
}

// Branch assignment
if (req.user.role === "super_admin" && cabang_id) {
  cabangIdFinal = parseInt(cabang_id); // Can assign to any branch
} else {
  cabangIdFinal = req.user.cabang_id; // Limited to own branch
}
```

##### Get Users Function
- **Super Admin**: Can see all users across all branches
- **Admin Cabang**: Can only see users from their branch
```javascript
if (role === "super_admin") {
  // Super admin can see all users
  query += " ORDER BY u.id ASC";
} else {
  // Admin cabang can only see users from their branch
  query += " WHERE u.cabang_id = $1 ORDER BY u.id ASC";
  queryParams = [cabang_id];
}
```

##### Update User Function
- **Role Validation**: Same dynamic validation as register
- **Access Control**: Super admin can update any user, admin cabang limited to their branch

##### Delete User Function
- **Access Control**: Super admin can delete any user, admin cabang limited to their branch
- **Self-Protection**: Users cannot delete themselves

## Role Hierarchy

```
Super Admin (super_admin)
├── Can manage all branches
├── Can create/edit/delete any user
├── Can assign super_admin role
├── Can view analytics from all branches
└── Full system access

Admin Cabang (admin_cabang)  
├── Can manage their branch only
├── Can create/edit/delete users in their branch
├── Cannot assign super_admin role
├── Can view analytics from their branch only
└── Limited to branch scope

Staff Cabang (employement)
├── Can view their branch data
├── Cannot manage users
├── Can view analytics from their branch only
└── Read-only access
```

## Security Features

1. **Role-Based Access Control**: Each endpoint validates user role
2. **Branch Isolation**: Admin cabang cannot access other branches
3. **Self-Protection**: Users cannot delete their own accounts
4. **Dynamic Permissions**: Role options change based on current user's role
5. **Audit Logging**: All user management actions are logged

## Usage

### For Super Admin
1. Login with super_admin role
2. Access user management
3. Can create users with any role (including super_admin)
4. Can assign users to any branch
5. Can view/edit/delete any user in the system

### For Admin Cabang  
1. Login with admin_cabang role
2. Access user management
3. Can create users with employement or admin_cabang roles only
4. Users are automatically assigned to their branch
5. Can only manage users within their branch

The system now provides proper role hierarchy with appropriate restrictions and permissions! 🚀