# User Role Capabilities

This document outlines the capabilities and actions available to each user role in the Leaf Classifier application.

## User Roles

The system supports four user roles, defined in the Prisma schema:

- **USER**: Default role for all new users
- **CONTRIBUTOR**: Users who have been granted contributor status
- **MODERATOR**: Users with moderation capabilities
- **ADMIN**: Users with full administrative access

---

## Authentication & User Management

### All Authenticated Users

All authenticated users (USER, CONTRIBUTOR, MODERATOR, ADMIN) can:

- **Login/Registration**
  - Login via Google OAuth (`GET /auth/google`)
  - Login via local credentials (`POST /auth/login`)
  - Register new account (`POST /auth/register`)
  - Logout (`GET /auth/logout`)
  - Check authentication status (`GET /auth/me`)
  - Refresh access token (`POST /auth/refresh-token`)

- **User Profile Management**
  - View own profile (`GET /user/:id`) - where `:id` matches their own user ID
  - Update own profile (`PATCH /user/:id/update`) - where `:id` matches their own user ID
    - Can update: fullName, email, phone, institution, department, location, bio, password, emailNotifications, requestedContributorStatus
    - Can request contributor status by setting `requestedContributorStatus` to `true` (requires all profile fields to be filled)

---

## Plant Classification

### All Authenticated Users

- **Upload & Classify Images**
  - Upload images for classification (`POST /classifier/upload`)
    - Automatically classifies the image using ML models
    - Creates a classification record with status `PENDING`
    - Stores image in R2 storage or local storage

- **View Classifications**
  - View own classifications (`GET /classifier/classifications`)
    - Can filter by: status, isArchived, isHealthy, createdAt, search query
    - Can sort by various fields
    - Pagination supported
  - View specific classification (`GET /classifier/upload/:id`) - only if it belongs to them

- **Update Classifications**
  - Update own classifications (`PATCH /classifier/classifications/:id`)
    - Can update: taggedShape, taggedSpecies, taggedHealthy, isArchived
    - Cannot change status (only MODERATOR/ADMIN can)

### ADMIN Only

- **View All Classifications**
  - Can view any user's classifications via `userId` query parameter in `GET /classifier/classifications`

---

## Species Management

### All Authenticated Users

- **View Species**
  - List all species (`GET /species`)
    - Can filter by: isArchived, createdAt, search query
    - Can sort by various fields
    - Pagination supported

- **Create Species**
  - Create new species entries (`POST /species`)
    - Required fields: scientificName, commonNameEn, commonNameEs
    - Automatically generates slug from scientific name
    - Species are linked to the creator

### ADMIN Only

- **Update Species**
  - Update existing species (`PATCH /species/admin/:id/update`)
    - Can update: scientificName, commonNameEn, commonNameEs
    - Slug is automatically regenerated

- **Delete Species**
  - Delete species entries (`DELETE /species/admin/:id/delete`)

---

## Admin Panel - Classifications

### MODERATOR & ADMIN

- **View All Classifications**
  - List all classifications (`GET /admin/classifications`)
    - Can filter by: status (PENDING, VERIFIED, REJECTED, ALL), isArchived, createdAt, search query
    - Can search by: shape, species, originalFilename, user fullName, user email
    - Can sort by various fields
    - Returns aggregated counts: totalVerifiedCount, totalPendingCount, totalArchivedCount
    - Pagination supported

- **View Classification Details**
  - Get specific classification details (`GET /admin/classification/:id`)
    - Includes full user information

- **Update Classifications**
  - Update any classification (`PUT /admin/classification/:id`)
    - Can update: taggedShape, taggedSpecies, taggedHealthy, status, isArchived
    - **MODERATOR**: Can change status to: PENDING, REJECTED (but NOT VERIFIED)
    - **ADMIN**: Can change status to: PENDING, VERIFIED, REJECTED
    - When status changes to VERIFIED, automatically renames image file with "verified" suffix
    - When status changes from VERIFIED, automatically renames image file with "unverified" suffix
    - Updates image path in R2 storage if applicable

### ADMIN Only

- **Delete Classifications**
  - Permanently delete classifications (`DELETE /admin/classification/:id`)
    - This is a hard delete operation

---

## Admin Panel - User Management

### MODERATOR & ADMIN

- **View Users**
  - List all users (`GET /admin/users`)
    - Can filter by: role, isArchived, requestedContributorStatus, createdAt, search query
    - Can search by: email, fullName
    - Can sort by various fields
    - Returns classification count for each user
    - Returns count of users requesting contributor status
    - Pagination supported

- **View User Details**
  - Get specific user details (`GET /admin/user/:id`)
    - Includes classification count
    - Returns sanitized user data

### ADMIN Only

- **Update Users**
  - Update any user (`PUT /admin/user/:id`)
    - Can update: fullName, email, phone, institution, department, location, bio, password, emailNotifications, role, isArchived, requestedContributorStatus
    - **Only ADMIN can change user roles**
    - Can archive/unarchive users
    - Can approve/deny contributor status requests

---

## Capability Summary by Role

### USER
- ✅ Authentication (login, register, logout)
- ✅ View and update own profile
- ✅ Upload and classify images
- ✅ View own classifications
- ✅ Update own classifications (tags and archive status only)
- ✅ View all species
- ✅ Create new species
- ❌ Cannot change classification status
- ❌ Cannot view other users' classifications
- ❌ Cannot update or delete species
- ❌ Cannot access admin panel
- ❌ Cannot manage other users

### CONTRIBUTOR
- ✅ All USER capabilities
- ⚠️ Note: Currently, CONTRIBUTOR role has the same capabilities as USER. The role exists in the schema but no additional permissions are implemented yet.

### MODERATOR
- ✅ All USER capabilities
- ✅ View all classifications (admin panel)
- ✅ View classification details
- ✅ Update any classification (tags, archive status, and status changes to PENDING/REJECTED)
- ✅ View all users
- ✅ View user details
- ❌ Cannot set classification status to VERIFIED (ADMIN only)
- ❌ Cannot delete classifications
- ❌ Cannot update users
- ❌ Cannot update or delete species

### ADMIN
- ✅ All MODERATOR capabilities
- ✅ Delete classifications
- ✅ Update any user (including role changes)
- ✅ Update species
- ✅ Delete species
- ✅ View any user's classifications via query parameter
- ✅ Full system access

---

## Notes

1. **Authentication Required**: All endpoints except login/register require authentication via JWT token in the `Authorization` header.

2. **Role Checks**: Role-based access control is enforced in the controller layer, not just at the route level.

3. **Ownership Checks**: Users can only modify their own resources unless they have elevated permissions (MODERATOR/ADMIN).

4. **Status Management**: 
   - MODERATOR and ADMIN can change classification status to PENDING or REJECTED
   - **Only ADMIN can set classification status to VERIFIED** (this is enforced in the controller)
   - When a classification is verified, the system automatically renames the associated image file with "verified" suffix
   - When a verified classification is changed to another status, it's automatically renamed with "unverified" suffix

5. **Contributor Status**: Users can request contributor status by updating their profile with all required fields and setting `requestedContributorStatus` to `true`. ADMIN can then approve these requests.

6. **Archiving**: Both classifications and users can be archived. Archived items are filtered out by default but can be viewed with the `isArchived=true` query parameter.

---

## API Endpoints Reference

### Authentication Routes (`/auth`)
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/login` - Local login
- `POST /auth/register` - Local registration
- `GET /auth/logout` - Logout
- `GET /auth/me` - Check authentication status
- `POST /auth/refresh-token` - Refresh access token

### User Routes (`/user`)
- `GET /user/:id` - Get user profile (own or ADMIN)
- `PATCH /user/:id/update` - Update user profile (own or ADMIN)

### Classifier Routes (`/classifier`)
- `POST /classifier/upload` - Upload and classify image
- `GET /classifier/classifications` - List classifications (own or all if ADMIN)
- `GET /classifier/upload/:id` - Get specific classification (own only)
- `PATCH /classifier/classifications/:id` - Update classification (own only)

### Species Routes (`/species`)
- `GET /species` - List species
- `POST /species` - Create species
- `PATCH /species/admin/:id/update` - Update species (ADMIN only)
- `DELETE /species/admin/:id/delete` - Delete species (ADMIN only)

### Admin Routes (`/admin`)
- `GET /admin/classifications` - List all classifications (MODERATOR/ADMIN)
- `GET /admin/classification/:id` - Get classification details (MODERATOR/ADMIN)
- `PUT /admin/classification/:id` - Update classification (MODERATOR/ADMIN, but only ADMIN can set status to VERIFIED)
- `DELETE /admin/classification/:id` - Delete classification (ADMIN only)
- `GET /admin/users` - List all users (MODERATOR/ADMIN)
- `GET /admin/user/:id` - Get user details (MODERATOR/ADMIN)
- `PUT /admin/user/:id` - Update user (ADMIN only)

