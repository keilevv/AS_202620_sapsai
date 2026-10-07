# Bun Testing Guide

Bun's test runner has different mocking APIs than Jest. Here's how to properly mock modules in Bun tests.

## Key Differences from Jest

1. **No `jest.mock()`** - Use `mock.module()` instead
2. **No `jest.fn()`** - Use `mock()` from `bun:test`
3. **Module mocking must happen before imports** - Use dynamic imports after mocking

## Example Patterns

### Mocking a Module

```typescript
import { mock } from "bun:test";

// Create mock functions
const mockFn = mock(() => "result");

// Mock the module BEFORE importing
mock.module("./path/to/module", () => ({
  functionName: mockFn,
}));

// Then import dynamically
const module = await import("./path/to/module");
```

### Mocking Prisma

```typescript
const mockPrismaUser = {
  findUnique: mock(() => Promise.resolve(null)),
  create: mock(() => Promise.resolve({})),
};

mock.module("../../lib/prisma", () => ({
  default: {
    user: mockPrismaUser,
  },
}));

const prisma = (await import("../../lib/prisma")).default;
```

### Creating Mock Functions

```typescript
import { mock } from "bun:test";

const mockFn = mock(() => "return value");
mockFn.mockReturnValue("custom value");
mockFn.mockResolvedValue(Promise.resolve("async value"));
mockFn.mockImplementation(() => "custom implementation");

// Clear mocks
mockFn.mockClear();
```

## Common Issues

1. **Top-level await**: May not work in all contexts - use dynamic imports in test setup
2. **Module caching**: Bun caches modules, so mocks need to be set up before first import
3. **Default exports**: Use `default` key when mocking default exports

