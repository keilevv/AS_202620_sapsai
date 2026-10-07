# Testing Setup Guide

This guide will help you set up and run the testing suite for the Leaf Classifier application.

## Prerequisites

- Bun runtime installed
- Node.js (for frontend dependencies if needed)
- All project dependencies installed

## Installation

### Backend Testing Setup

Bun has built-in testing support, so no additional installation is needed. However, you may want to install additional testing utilities:

```bash
cd backend
bun install
```

The backend uses Bun's native test runner, which is already configured in `package.json`.

### Frontend Testing Setup

Install testing dependencies:

```bash
cd frontend
bun install
```

This will install:
- **Vitest**: Test runner
- **React Testing Library**: Component and hook testing
- **MSW (Mock Service Worker)**: API mocking
- **jsdom**: DOM environment for tests

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with UI
bun test:ui

# Run tests with coverage
bun test:coverage
```

## Test Structure

### Backend Test Structure

```
backend/src/__tests__/
├── controllers/
│   ├── auth.test.ts
│   ├── user.test.ts
│   ├── species.test.ts
│   ├── plantClassifier.test.ts
│   └── admin.test.ts
├── routes/
│   └── auth.test.ts
├── middleware/
│   └── auth.test.ts
├── utils/
│   └── jwt.test.ts
└── helpers/
    ├── mockPrisma.ts
    ├── mockRequest.ts
    └── testUtils.ts
```

### Frontend Test Structure

```
frontend/src/__tests__/
├── hooks/
│   ├── useAuth.test.js
│   ├── useClassifier.test.js
│   ├── useSpecies.test.js
│   └── useAdmin.test.js
├── Components/
│   └── ProtectedRoute.test.jsx
├── Services/
│   └── auth.test.js
├── mocks/
│   └── handlers.js
└── setupTests.js
```

## Writing Tests

### Backend Test Example

```typescript
import { describe, it, expect, beforeEach } from "bun:test";
import authController from "../../controllers/auth";

describe("Auth Controller", () => {
  let controller: ReturnType<typeof authController>;
  
  beforeEach(() => {
    controller = authController();
  });

  it("should successfully login with valid credentials", async () => {
    // Test implementation
  });
});
```

### Frontend Test Example

```javascript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import useAuth from '../../hooks/useAuth';

describe('useAuth', () => {
  it('should successfully login', async () => {
    const { result } = renderHook(() => useAuth());
    // Test implementation
  });
});
```

## Mocking

### Backend Mocking

- **Prisma**: Mock Prisma client methods using `jest.fn()` or Bun's mocking
- **Passport**: Mock authentication strategies
- **JWT**: Mock token generation/verification
- **External APIs**: Mock axios calls

### Frontend Mocking

- **API Calls**: Use MSW (Mock Service Worker) to intercept HTTP requests
- **Services**: Mock service modules
- **Store**: Mock Zustand store
- **Router**: Use MemoryRouter for route testing

## Coverage Goals

- **Critical Paths**: 90%+ coverage
  - Authentication
  - Authorization
  - Data validation
  - Security checks

- **Business Logic**: 80%+ coverage
  - Classification processing
  - Species management
  - User management

- **Overall**: 75%+ coverage

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: cd backend && bun install
      - run: cd backend && bun test:coverage

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: cd frontend && bun install
      - run: cd frontend && bun test:coverage
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Naming**: Use descriptive test names
3. **Arrange-Act-Assert**: Follow the AAA pattern
4. **Mock External Dependencies**: Don't hit real databases or APIs
5. **Test Edge Cases**: Include error conditions and boundary cases
6. **Keep Tests Fast**: Avoid slow operations in tests
7. **Maintain Tests**: Update tests when code changes

## Troubleshooting

### Backend Tests

**Issue**: Tests fail with database connection errors
- **Solution**: Ensure Prisma is properly mocked

**Issue**: Passport authentication not working in tests
- **Solution**: Mock passport strategies

### Frontend Tests

**Issue**: `jsdom` environment errors
- **Solution**: Ensure `jsdom` is installed and configured in `vitest.config.js`

**Issue**: MSW handlers not intercepting requests
- **Solution**: Ensure MSW is properly set up in `setupTests.js`

**Issue**: React hooks not working in tests
- **Solution**: Use `renderHook` from `@testing-library/react`

## Next Steps

1. ✅ Install testing dependencies
2. ✅ Run example tests to verify setup
3. ✅ Write tests for remaining controllers/hooks
4. ✅ Set up CI/CD integration
5. ✅ Monitor coverage metrics
6. ✅ Add integration tests

## Resources

- [Bun Testing Documentation](https://bun.sh/docs/cli/test)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)

