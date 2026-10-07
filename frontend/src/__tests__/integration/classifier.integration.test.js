/**
 * Integration tests for useClassifier hook
 * 
 * Tests the complete flow: image upload → plantClassifier service → backend routes → hook state
 * Verifies that service calls match backend route definitions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useClassifier from '../../hooks/useClassifier';
import plantClassifierService from '../../Services/plantClassifier';
import useStore from '../../hooks/useStore';

// Mock dependencies
vi.mock('../../Services/plantClassifier');
vi.mock('../../hooks/useStore');

describe('useClassifier Integration', () => {
  const mockAccessToken = 'mock-access-token';

  beforeEach(() => {
    vi.clearAllMocks();
    
    useStore.mockReturnValue({
      accessToken: mockAccessToken,
    });
  });

  describe('uploadClassification - full stack', () => {
    it('should successfully upload and classify image', async () => {
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
      imageData.append('image', new Blob(), 'test.jpg');
      
      const uploadResult = await result.current.uploadClassification(imageData);

      expect(plantClassifierService.uploadImage).toHaveBeenCalledWith(imageData, mockAccessToken);
      expect(result.current.isLoading).toBe(false);
      expect(uploadResult).toEqual({
        classification: mockClassification,
        message: 'Image uploaded and classified successfully',
      });
    });

    it('should handle upload errors and propagate to hook state', async () => {
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

      // Start the upload
      act(() => {
        result.current.uploadClassification(new FormData());
      });

      // Check loading state immediately
      expect(result.current.isLoading).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolveUpload({
          status: 200,
          data: { classification: {} },
        });
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Wait for loading to be false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('getUploads - full stack', () => {
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

  describe('getUpload - full stack', () => {
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

    it('should handle fetch errors for single upload', async () => {
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

  describe('updateClassification - full stack', () => {
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

  describe('listModels - full stack', () => {
    it('should list models successfully', async () => {
      const mockModels = [
        { id: 'especies', name: 'Especies Model' },
        { id: 'hojas', name: 'Formas Model' },
        { id: 'plantas', name: 'Plantas Model' },
      ];

      plantClassifierService.listModels.mockResolvedValue({
        data: { models: mockModels },
      });

      const { result } = renderHook(() => useClassifier());

      await act(async () => {
        await result.current.listModels();
      });

      expect(plantClassifierService.listModels).toHaveBeenCalledWith(mockAccessToken);
      
      await waitFor(() => {
        expect(result.current.models).toEqual(mockModels);
      });
    });

    it('should handle list models errors', async () => {
      const error = new Error('Failed to list models');
      plantClassifierService.listModels.mockRejectedValue(error);

      const { result } = renderHook(() => useClassifier());

      await act(async () => {
        await result.current.listModels();
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('getModelVersions - full stack', () => {
    it('should get model versions for especies', async () => {
      const mockVersions = [
        { version: 1, filename: 'modelo_especies_v0001.h5' },
        { version: 2, filename: 'modelo_especies_v0002.h5' },
      ];

      plantClassifierService.getModelVersions.mockResolvedValue({
        data: mockVersions,
      });

      const { result } = renderHook(() => useClassifier());

      await act(async () => {
        await result.current.getModelVersions('especies');
      });

      expect(plantClassifierService.getModelVersions).toHaveBeenCalledWith('especies', mockAccessToken);
      
      await waitFor(() => {
        expect(result.current.speciesVersions).toEqual(mockVersions);
      });
    });

    it('should get model versions for hojas (formas)', async () => {
      const mockVersions = [
        { version: 1, filename: 'modelo_hojas_v0001.h5' },
      ];

      plantClassifierService.getModelVersions.mockResolvedValue({
        data: mockVersions,
      });

      const { result } = renderHook(() => useClassifier());

      await act(async () => {
        await result.current.getModelVersions('hojas');
      });

      expect(plantClassifierService.getModelVersions).toHaveBeenCalledWith('hojas', mockAccessToken);
      
      await waitFor(() => {
        expect(result.current.shapesVersions).toEqual(mockVersions);
      });
    });

    it('should get model versions for plantas', async () => {
      const mockVersions = [
        { version: 1, filename: 'modelo_plantas_v0001.h5' },
      ];

      plantClassifierService.getModelVersions.mockResolvedValue({
        data: mockVersions,
      });

      const { result } = renderHook(() => useClassifier());

      await act(async () => {
        await result.current.getModelVersions('plantas');
      });

      expect(plantClassifierService.getModelVersions).toHaveBeenCalledWith('plantas', mockAccessToken);
      
      await waitFor(() => {
        expect(result.current.plantVersions).toEqual(mockVersions);
      });
    });

    it('should handle getModelVersions errors', async () => {
      const error = new Error('Failed to get versions');
      plantClassifierService.getModelVersions.mockRejectedValue(error);

      const { result } = renderHook(() => useClassifier());

      await act(async () => {
        await result.current.getModelVersions('especies');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('retrainModel - full stack', () => {
    it('should retrain a model', async () => {
      plantClassifierService.retrainModel.mockResolvedValue({
        data: { status: 'Training started' },
      });
      plantClassifierService.getTrainingStatus.mockResolvedValue({
        data: { model: 'especies', status: 'training', progress: 0.5 },
      });

      const { result } = renderHook(() => useClassifier());

      await act(async () => {
        await result.current.retrainModel('especies');
      });

      expect(plantClassifierService.retrainModel).toHaveBeenCalledWith('especies', mockAccessToken);
      // getTrainingStatus should be called after retraining
      expect(plantClassifierService.getTrainingStatus).toHaveBeenCalledWith('especies', mockAccessToken);
      
      await waitFor(() => {
        expect(result.current.trainingStatus).toEqual({ model: 'especies', status: 'training', progress: 0.5 });
      });
    });

    it('should handle retrain errors', async () => {
      const error = new Error('Retrain failed');
      plantClassifierService.retrainModel.mockRejectedValue(error);

      const { result } = renderHook(() => useClassifier());

      await act(async () => {
        await expect(
          result.current.retrainModel('especies')
        ).rejects.toThrow('Retrain failed');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
      });
    });
  });

  describe('getTrainingStatus - full stack', () => {
    it('should get training status', async () => {
      const mockStatus = { model: 'especies', status: 'training', progress: 0.5 };

      plantClassifierService.getTrainingStatus.mockResolvedValue({
        data: mockStatus,
      });

      const { result } = renderHook(() => useClassifier());

      await act(async () => {
        await result.current.getTrainingStatus('especies');
      });

      expect(plantClassifierService.getTrainingStatus).toHaveBeenCalledWith('especies', mockAccessToken);
      expect(result.current.trainingStatus).toEqual(mockStatus);
    });

    it('should handle getTrainingStatus errors', async () => {
      const error = new Error('Failed to get status');
      plantClassifierService.getTrainingStatus.mockRejectedValue(error);

      const { result } = renderHook(() => useClassifier());

      await act(async () => {
        await result.current.getTrainingStatus('especies');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
        expect(result.current.trainingStatus).toBeNull();
      });
    });
  });
});