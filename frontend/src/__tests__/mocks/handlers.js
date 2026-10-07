/**
 * MSW (Mock Service Worker) request handlers
 * Mocks API endpoints for testing
 */

import { http, HttpResponse } from 'msw';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json();
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        message: 'Login successful',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          fullName: 'Test User',
          role: 'USER',
        },
        accessToken: 'mock-access-token',
      }, { status: 200 });
    }
    return HttpResponse.json(
      { message: 'Login failed', error: 'Invalid credentials' },
      { status: 400 }
    );
  }),

  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const body = await request.json();
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      status: 'success',
      message: 'Registration successful',
      user: {
        id: 'user-new',
        email: body.email,
        fullName: body.fullName,
        role: 'USER',
      },
      accessToken: 'mock-access-token',
    }, { status: 200 });
  }),

  http.get(`${API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'USER',
      },
      accessToken: 'mock-access-token',
    }, { status: 200 });
  }),

  http.get(`${API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.text('Logged out', { status: 200 });
  }),

  // Plant Classifier endpoints
  http.post(`${API_BASE_URL}/plant-classifier/upload`, () => {
    return HttpResponse.json({
      message: 'Image uploaded and classified successfully',
      classification: {
        id: 'classification-123',
        species: 'zea-mays',
        shape: 'elliptic',
        isHealthy: false,
        speciesConfidence: 0.95,
        shapeConfidence: 0.88,
        imageUrl: '/uploads/test-image.jpg',
      },
      storageType: 'R2',
      imageUrl: '/uploads/test-image.jpg',
    }, { status: 200 });
  }),

  http.get(`${API_BASE_URL}/plant-classifier/classifications`, () => {
    return HttpResponse.json({
      count: 10,
      pages: 1,
      results: [
        {
          id: 'classification-123',
          species: 'zea-mays',
          shape: 'elliptic',
          isHealthy: false,
          createdAt: new Date().toISOString(),
        },
      ],
      shapes: ['elliptic', 'ovate', 'lanceolate'],
    }, { status: 200 });
  }),

  http.get(`${API_BASE_URL}/plant-classifier/upload/:id`, ({ params }) => {
    return HttpResponse.json({
      result: {
        id: params.id,
        species: 'zea-mays',
        shape: 'elliptic',
        isHealthy: false,
      },
    }, { status: 200 });
  }),

  http.patch(`${API_BASE_URL}/plant-classifier/classification/:id`, ({ params }) => {
    return HttpResponse.json({
      message: 'Classification updated successfully',
      results: {
        id: params.id,
        taggedSpecies: 'zea-mays',
        taggedShape: 'elliptic',
        taggedHealthy: false,
      },
    }, { status: 200 });
  }),

  // Species endpoints
  http.get(`${API_BASE_URL}/species`, () => {
    return HttpResponse.json({
      count: 5,
      pages: 1,
      results: [
        {
          id: 'species-123',
          scientificName: 'Zea mays',
          commonNameEn: 'Corn',
          commonNameEs: 'Maíz',
          slug: 'zea-mays',
        },
      ],
      shapes: ['elliptic', 'ovate', 'lanceolate'],
    }, { status: 200 });
  }),

  http.post(`${API_BASE_URL}/species`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      species: {
        id: 'species-new',
        ...body,
        slug: body.scientificName.toLowerCase().replace(/\s+/g, '-'),
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 });
  }),

  http.patch(`${API_BASE_URL}/species/:id`, ({ params }) => {
    return HttpResponse.json({
      species: {
        id: params.id,
        scientificName: 'Updated Name',
        commonNameEn: 'Updated',
        commonNameEs: 'Actualizado',
      },
    }, { status: 200 });
  }),

  http.delete(`${API_BASE_URL}/species/:id`, ({ params }) => {
    return HttpResponse.json({
      species: {
        id: params.id,
        scientificName: 'Deleted Species',
      },
    }, { status: 200 });
  }),

  // User endpoints
  http.get(`${API_BASE_URL}/users/:id`, ({ params }) => {
    return HttpResponse.json({
      user: {
        id: params.id,
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'USER',
      },
    }, { status: 200 });
  }),

  http.patch(`${API_BASE_URL}/users/:id/update`, ({ params }) => {
    return HttpResponse.json({
      user: {
        id: params.id,
        email: 'updated@example.com',
        fullName: 'Updated User',
      },
    }, { status: 200 });
  }),
];

