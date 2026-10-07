import plantClassifierService from "../Services/plantClassifier";
import { useCallback, useState } from "react";
import useStore from "../hooks/useStore";
function useClassifier() {
  const { accessToken } = useStore();
  const [uploads, setUploads] = useState([]);
  const [upload, setUpload] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pages, setPages] = useState(1);

  const [models, setModels] = useState([]);
  const [speciesVersions, setSpeciesVersions] = useState(null);
  const [shapesVersions, setShapesVersions] = useState(null);
  const [plantVersions, setPlantVersions] = useState(null);
  const [trainingStatus, setTrainingStatus] = useState(null);

  function uploadClassification(imageData) {
    setIsLoading(true);
    return plantClassifierService
      .uploadImage(imageData, accessToken)
      .then((response) => {
        setIsLoading(false);
        if (response.status === 200) {
          return response.data;
        } else {
          throw new Error("Failed to upload image");
        }
      })
      .catch((error) => {
        setIsLoading(false);
        setError(error);
        console.error("Error uploading image:", error);
        throw error;
      });
  }

  function getUploads(page, limit, sortBy, sortOrder, filters) {
    setIsLoading(true);
    return plantClassifierService
      .getClassifications(page, limit, sortBy, sortOrder, filters, accessToken)
      .then((response) => {
        setUploads(response.data.results);
        setShapes(response.data.shapes);
        setIsLoading(false);
        setPages(response.data.pages);
      })
      .catch((error) => {
        console.error("Error fetching uploads:", error);
        setError(error);
        setIsLoading(false);
      });
  }
  function getUpload(id) {
    setIsLoading(true);
    return plantClassifierService
      .getUpload(id, accessToken)
      .then((response) => {
        setIsLoading(false);
        setUpload(response.data.result);
        return response.data;
      })
      .catch((error) => {
        console.error("Error fetching upload:", error);
        setError(error);
        setIsLoading(false);
      });
  }

  function updateClassification(id, data) {
    setIsLoading(true);
    return plantClassifierService
      .updateClassification(id, data, accessToken)
      .then((response) => {
        setIsLoading(false);
        if (response.status === 200) {
          // Update the local state
          setUploads((prevUploads) =>
            prevUploads.map((upload) =>
              upload.id === id ? { ...upload, ...data } : upload
            )
          );
          return response.data;
        } else {
          throw new Error("Failed to update classification");
        }
      })
      .catch((error) => {
        setIsLoading(false);
        setError(error);
        console.error("Error updating classification:", error);
        throw error;
      });
  }

  function addUpload(upload) {
    setUploads((prev) => [upload, ...prev]);
  }

  const listModels = useCallback(() => {
    setIsLoading(true);
    return plantClassifierService
      .listModels(accessToken)
      .then((response) => {
        setModels(response.data.models);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching models:", error);
        setError(error);
        setIsLoading(false);
      });
  }, [accessToken]);

  const getModelVersions = useCallback(
    (model) => {
      setIsLoading(true);
      return plantClassifierService
        .getModelVersions(model, accessToken)
        .then((response) => {
          if (model === "especies") {
            setSpeciesVersions(response.data);
          } else if (model === "hojas") {
            setShapesVersions(response.data);
          } else if (model === "plantas") {
            setPlantVersions(response.data);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching models:", error);
          setError(error);
          setIsLoading(false);
        });
    },
    [accessToken]
  );

  const restoreModelVersion = useCallback(
    (model, version) => {
      setIsLoading(true);
      return plantClassifierService
        .restoreModelVersion(model, version, accessToken)
        .then((response) => {
          setIsLoading(false);
          return response.data;
        })
        .catch((error) => {
          console.error("Error restoring model version:", error);
          setError(error);
          setIsLoading(false);
        });
    },
    [accessToken]
  );

  const getTrainingStatus = useCallback(
    (model) => {
      return plantClassifierService
        .getTrainingStatus(model, accessToken)
        .then((response) => {
          setTrainingStatus(response.data);
          return response.data;
        })
        .catch((error) => {
          console.error("Error fetching training status:", error);
          setError(error);
          return null;
        });
    },
    [accessToken]
  );

  const retrainModel = useCallback(
    (model) => {
      setIsLoading(true);
      return plantClassifierService
        .retrainModel(model, accessToken)
        .then((response) => {
          setIsLoading(false);
          // Refresh training status after starting
          getTrainingStatus(model);
          return response.data;
        })
        .catch((error) => {
          console.error("Error retraining model:", error);
          setError(error);
          setIsLoading(false);
          throw error;
        });
    },
    [accessToken, getTrainingStatus]
  );

  const getRetrainPreview = useCallback(
    (model) => {
      setIsLoading(true);
      return plantClassifierService
        .getRetrainPreview(model, accessToken)
        .then((response) => {
          setIsLoading(false);
          return response.data;
        })
        .catch((error) => {
          console.error("Error getting retrain preview:", error);
          setError(error);
          setIsLoading(false);
          throw error;
        });
    },
    [accessToken]
  );

  const getMetrics = useCallback(
    (model) => {
      setIsLoading(true);
      return plantClassifierService
        .getMetrics(model, accessToken)
        .then((response) => {
          setIsLoading(false);
          return response.data;
        })
        .catch((error) => {
          console.error("Error getting metrics:", error);
          setError(error);
          setIsLoading(false);
          throw error;
        });
    },
    [accessToken]
  );

  return {
    uploadClassification,
    getUploads,
    getUpload,
    addUpload,
    updateClassification,
    listModels,
    restoreModelVersion,
    getModelVersions,
    retrainModel,
    getTrainingStatus,
    getRetrainPreview,
    getMetrics,
    shapes,
    uploads,
    upload,
    isLoading,
    error,
    pages,
    models,
    speciesVersions,
    shapesVersions,
    plantVersions,
    trainingStatus,
  };
}
export default useClassifier;
