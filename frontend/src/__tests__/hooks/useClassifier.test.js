/**
 * Unit tests for useClassifier hook
 * 
 * Tests cover:
 * - Image upload and classification
 * - Fetching classifications with pagination/filtering
 * - Getting single classification
 * - Updating classification
 * - State management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useClassifier from '../../hooks/useClassifier';
import plantClassifierService from '../../Services/plantClassifier';
import useStore from '../../hooks/useStore';

// Mock dependencies
vi.mock('../../Services/plantClassifier');
vi.mock('../../hooks/useStore');

describe('useClassifier', () => {
  const mockAccessToken = 'mock-access-token';

  beforeEach(() => {
    vi.clearAllMocks();
    
    useStore.mockReturnValue({
      accessToken: mockAccessToken,
    });
  });

  describe('uploadClassification', () => {
    it('should successfully upload and classify an image', async () => {
      const mockClassification = {
        id: 'classification-123',
        species: 'zea-mays',
        shape: 'elliptic',
        isHealthy: false,
        imageUrl: '/uploads/test-image.jpg',
      };

      plantClassifierService.uploadImage.mockResolvedValue({
        status: 200,
        data: {
          classification: mockClassification,
          message: 'Image uploaded and classified successfully',
        },
      });

      const { result } = renderHook(() => useClassifier());

      const imageData = new FormData();
      const uploadResult = await result.current.uploadClassification(imageData);

      expect(plantClassifierService.uploadImage).toHaveBeenCalledWith(imageData, mockAccessToken);
      expect(result.current.isLoading).toBe(false);
      expect(uploadResult).toEqual({
        classification: mockClassification,
        message: 'Image uploaded and classified successfully',
      });
    });

    it('should handle upload errors', async () => {
      const error = new Error('Upload failed');
      plantClassifierService.uploadImage.mockRejectedValue(error);

      const { result } = renderHook(() => useClassifier());

      await act(async () => {
        await expect(
          result.current.uploadClassification(new FormData())
        ).rejects.toThrow('Upload failed');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.error).toBe(error);
    });

    it('should set loading state during upload', async () => {
      let resolveUpload;
      const uploadPromise = new Promise((resolve) => {
        resolveUpload = resolve;
      });

      plantClassifierService.uploadImage.mockReturnValue(uploadPromise);

      const { result } = renderHook(() => useClassifier());

      let uploadPromise2;
      
      // Start the upload
      act(() => {
        uploadPromise2 = result.current.uploadClassification(new FormData());
      });

      // Check loading state immediately (setIsLoading is called synchronously)
      expect(result.current.isLoading).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolveUpload({
          status: 200,
          data: { classification: {} },
        });
        await uploadPromise2;
      });

      // Wait for loading to be false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('getUploads', () => {
    it('should fetch classifications with pagination', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 'classification-123',
              species: 'zea-mays',
              shape: 'elliptic',
            },
          ],
          pages: 5,
          shapes: ['elliptic', 'ovate'],
        },
      };

      plantClassifierService.getClassifications.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useClassifier());

      await act(async () => {
        await result.current.getUploads(1, 10, 'createdAt', 'desc', {});
      });

      expect(plantClassifierService.getClassifications).toHaveBeenCalledWith(
        1,
        10,
        'createdAt',
        'desc',
        {},
        mockAccessToken
      );
      
      await waitFor(() => {
        expect(result.current.uploads).toEqual(mockResponse.data.results);
      });
      expect(result.current.pages).toBe(5);
      expect(result.current.shapes).toEqual(['elliptic', 'ovate']);
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Fetch failed');
      plantClassifierService.getClassifications.mockRejectedValue(error);

      const { result } = renderHook(() => useClassifier());

      await act(async () => {
        await result.current.getUploads(1, 10, 'createdAt', 'desc', {});
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('getUpload', () => {
    it('should fetch a single classification', async () => {
      const mockClassification = {
        id: 'classification-123',
        species: 'zea-mays',
        shape: 'elliptic',
      };

      plantClassifierService.getUpload.mockResolvedValue({
        data: {
          result: mockClassification,
        },
      });

      const { result } = renderHook(() => useClassifier());

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.getUpload('classification-123');
      });

      expect(plantClassifierService.getUpload).toHaveBeenCalledWith(
        'classification-123',
        mockAccessToken
      );
      
      await waitFor(() => {
        expect(result.current.upload).toEqual(mockClassification);
      });
      expect(uploadResult).toEqual({ result: mockClassification });
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Not found');
      plantClassifierService.getUpload.mockRejectedValue(error);

      const { result } = renderHook(() => useClassifier());

      await act(async () => {
        await result.current.getUpload('non-existent-id');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('updateClassification', () => {
    it('should successfully update a classification', async () => {
      const updateData = {
        taggedSpecies: 'zea-mays',
        taggedShape: 'ovate',
        taggedHealthy: true,
      };

      const mockUpdated = {
        id: 'classification-123',
        ...updateData,
      };

      plantClassifierService.updateClassification.mockResolvedValue({
        status: 200,
        data: {
          results: mockUpdated,
        },
      });

      const { result } = renderHook(() => useClassifier());

      // Set initial uploads
      await act(() => {
        result.current.addUpload({
          id: 'classification-123',
          taggedSpecies: 'old-species',
        });
      });

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateClassification('classification-123', updateData);
      });

      expect(plantClassifierService.updateClassification).toHaveBeenCalledWith(
        'classification-123',
        updateData,
        mockAccessToken
      );
      expect(updateResult).toEqual({ results: mockUpdated });
      
      await waitFor(() => {
        expect(result.current.uploads[0]).toMatchObject(updateData);
      });
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      plantClassifierService.updateClassification.mockRejectedValue(error);

      const { result } = renderHook(() => useClassifier());

      await act(async () => {
        await expect(
          result.current.updateClassification('classification-123', {})
        ).rejects.toThrow('Update failed');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
      });
    });
  });

  describe('addUpload', () => {
    it('should add a new upload to the list', async () => {
      const { result } = renderHook(() => useClassifier());

      const newUpload = {
        id: 'classification-new',
        species: 'new-species',
      };

      await act(() => {
        result.current.addUpload(newUpload);
      });

      await waitFor(() => {
        expect(result.current.uploads).toContainEqual(newUpload);
        expect(result.current.uploads[0]).toEqual(newUpload);
      });
    });
  });
});

