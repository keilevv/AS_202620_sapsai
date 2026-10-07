# Testing Strategy for Leaf Classifier Application

## Overview

This document outlines a comprehensive unit testing strategy for the Leaf Classifier application, covering both backend (Express/TypeScript) and frontend (React) components.

## Testing Philosophy

- **Unit Tests**: Test individual functions, controllers, hooks, and utilities in isolation
- **Integration Tests**: Test interactions between components (controllers + routes, hooks + services)
- **Coverage Goals**: Aim for 80%+ code coverage on critical paths
- **Test-Driven Development**: Write tests before or alongside new features

## Backend Testing Strategy

### Framework & Tools
- **Test Runner**: Bun's built-in test runner (already available)
- **HTTP Testing**: Supertest for API endpoint testing
- **Database Mocking**: Mock Prisma client to avoid database dependencies
- **Utilities**: Custom test helpers for authentication, request/response mocking

### Areas to Test

#### 1. Authentication Controller (`controllers/auth.ts`)
**Priority: HIGH**

- ✅ `localLogin`: Valid credentials, invalid credentials, missing fields
- ✅ `localRegister`: Successful registration, duplicate email, invalid data
- ✅ `googleLogin`: OAuth flow initiation
- ✅ `googleCallback`: Successful callback, failure handling, state parsing
- ✅ `logout`: Session termination
- ✅ `isAuthenticated`: Authenticated user, unauthenticated user
- ✅ `refreshToken`: Valid token, invalid token, expired token

#### 2. User Controller (`controllers/user.ts`)
**Priority: HIGH**

- ✅ `getUser`: Own profile access, admin access, unauthorized access, not found
- ✅ `updateUser`: Own profile update, admin update, unauthorized update, validation errors
- ✅ Contributor status request validation

#### 3. Species Controller (`controllers/species.ts`)
**Priority: MEDIUM**

- ✅ `getSpecies`: Pagination, filtering, sorting, search, archived filter
- ✅ `createSpecies`: Successful creation, duplicate slug, missing fields, unauthorized
- ✅ `updateSpecies`: Successful update, unauthorized, missing fields
- ✅ `deleteSpecies`: Successful deletion, unauthorized, not found
- ✅ `slugify` utility function

#### 4. Plant Classifier Controller (`controllers/plantClassifier.ts`)
**Priority: HIGH**

- ✅ `uploadImage`: Successful upload, missing file, invalid file, classification service failure
- ✅ `getClassifications`: Pagination, filtering, user isolation, admin access
- ✅ `getUpload`: Own classification, unauthorized access, not found
- ✅ `updateClassification`: Successful update, unauthorized, not found

#### 5. Admin Controller (`controllers/admin.ts`)
**Priority: MEDIUM**

- ✅ `getClassificationsAdmin`: Admin access, moderator access, unauthorized
- ✅ `getUsers`: Pagination, filtering, search
- ✅ `updateClassification`: Status changes, verification
- ✅ `updateUser`: Role changes, contributor approval
- ✅ `deleteClassification`: Soft/hard delete
- ✅ `deleteUser`: User deletion

#### 6. Routes (`routes/*.ts`)
**Priority: MEDIUM**

- ✅ Route registration and middleware application
- ✅ Authentication middleware enforcement
- ✅ Request parameter validation

#### 7. Utilities (`utils/*.ts`)
**Priority: MEDIUM**

- ✅ JWT token generation and verification
- ✅ User sanitization
- ✅ Password hashing verification

#### 8. Middleware (`middleware/auth.ts`)
**Priority: HIGH**

- ✅ Token validation
- ✅ User extraction from token
- ✅ Unauthorized request handling

## Frontend Testing Strategy

### Framework & Tools
- **Test Runner**: Vitest (works seamlessly with Vite)
- **Component Testing**: React Testing Library
- **API Mocking**: MSW (Mock Service Worker)
- **Hook Testing**: React Testing Library's `renderHook`
- **Router Testing**: MemoryRouter for route testing

### Areas to Test

#### 1. Custom Hooks (`hooks/*.js`)
**Priority: HIGH**

- ✅ `useAuth`: Login, logout, registration, authentication check
- ✅ `useClassifier`: Upload, get classifications, update classification
- ✅ `useSpecies`: Get, create, update, delete species
- ✅ `useAdmin`: Admin operations, user management
- ✅ `useUser`: Profile fetching and updating
- ✅ `useStore`: State management (Zustand)

#### 2. Components (`Components/*.jsx`)
**Priority: MEDIUM**

- ✅ ProtectedRoute: Authentication check, redirect behavior
- ✅ LoginForm: Form submission, validation, error handling
- ✅ Common components: Notification, Loading, etc.

#### 3. Services (`Services/*.js`)
**Priority: MEDIUM**

- ✅ API call construction
- ✅ Error handling
- ✅ Request/response transformation

#### 4. Pages (`Pages/*.jsx`)
**Priority: LOW** (Integration tests)

- ✅ Page rendering
- ✅ Route integration
- ✅ User flow testing

## Test Organization

### Backend Structure
```
backend/
├── src/
│   ├── __tests__/
│   │   ├── controllers/
│   │   │   ├── auth.test.ts
│   │   │   ├── user.test.ts
│   │   │   ├── species.test.ts
│   │   │   ├── plantClassifier.test.ts
│   │   │   └── admin.test.ts
│   │   ├── routes/
│   │   │   ├── auth.test.ts
│   │   │   └── user.test.ts
│   │   ├── middleware/
│   │   │   └── auth.test.ts
│   │   ├── utils/
│   │   │   ├── jwt.test.ts
│   │   │   └── index.test.ts
│   │   └── helpers/
│   │       ├── mockPrisma.ts
│   │       ├── mockRequest.ts
│   │       └── testUtils.ts
```

### Frontend Structure
```
frontend/
├── src/
│   ├── __tests__/
│   │   ├── hooks/
│   │   │   ├── useAuth.test.js
│   │   │   ├── useClassifier.test.js
│   │   │   ├── useSpecies.test.js
│   │   │   └── useAdmin.test.js
│   │   ├── Components/
│   │   │   ├── ProtectedRoute.test.jsx
│   │   │   └── Common/
│   │   │       └── Notification.test.jsx
│   │   ├── Services/
│   │   │   └── auth.test.js
│   │   └── setupTests.js
│   └── mocks/
│       └── handlers.js (MSW handlers)
```

## Testing Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach`/`afterEach` for setup/cleanup
- Mock external dependencies (database, APIs, file system)

### 2. Test Naming
- Use descriptive test names: `describe('functionName', () => { it('should do X when Y', ...) })`
- Group related tests with `describe` blocks

### 3. Arrange-Act-Assert Pattern
```typescript
// Arrange
const mockUser = { id: '1', email: 'test@example.com' };
mockPrisma.user.findUnique.mockResolvedValue(mockUser);

// Act
const result = await getUser(req, res);

// Assert
expect(res.json).toHaveBeenCalledWith({ user: sanitizeUser(mockUser) });
```

### 4. Mocking Strategy
- **Database**: Mock Prisma client methods
- **External APIs**: Mock axios/HTTP calls
- **File System**: Mock fs operations
- **Authentication**: Mock passport/req.user

### 5. Edge Cases
- Test error conditions (404, 401, 403, 500)
- Test boundary conditions (empty arrays, null values)
- Test validation failures
- Test unauthorized access attempts

### 6. Coverage Priorities
1. **Critical Paths**: Authentication, authorization, data validation
2. **Business Logic**: Classification processing, species management
3. **Error Handling**: All error paths should be tested
4. **Security**: Authorization checks, input validation

## Running Tests

### Backend
```bash
cd backend
bun test                    # Run all tests
bun test --watch            # Watch mode
bun test controllers/       # Run specific test suite
bun test --coverage         # With coverage report
```

### Frontend
```bash
cd frontend
bun test                    # Run all tests
bun test --watch            # Watch mode
bun test hooks/             # Run specific test suite
bun test --coverage         # With coverage report
```

## Continuous Integration

### Recommended CI/CD Integration
- Run tests on every pull request
- Require tests to pass before merging
- Generate coverage reports
- Fail builds if coverage drops below threshold

## Next Steps

1. ✅ Install testing dependencies
2. ✅ Set up test configuration files
3. ✅ Create test utilities and helpers
4. ✅ Write example tests for each area
5. ✅ Set up CI/CD integration
6. ✅ Establish coverage goals and monitoring

## Priority Order for Implementation

1. **Phase 1 (Critical)**: Authentication, User management, Authorization middleware
2. **Phase 2 (High)**: Plant Classifier, Species management
3. **Phase 3 (Medium)**: Admin functions, Routes, Utilities
4. **Phase 4 (Nice to have)**: Frontend components, Integration tests

