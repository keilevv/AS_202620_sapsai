import { useEffect, useMemo, useState, useRef } from "react";
import { showNotification } from "../../Common/Notification";
import useClassifier from "../../../hooks/useClassifier";

function ModelSettings() {
  const {
    listModels,
    getModelVersions,
    models,
    speciesVersions,
    restoreModelVersion,
    retrainModel,
    getTrainingStatus,
    getRetrainPreview,
    getMetrics,
    trainingStatus,
    isLoading,
    error,
  } = useClassifier();

  const [selectedVersion, setSelectedVersion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isRetraining, setIsRetraining] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [metricsData, setMetricsData] = useState(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);
  const pollingIntervalRef = useRef(null);

  // Determine if training is in progress from the status endpoint
  const isTrainingInProgress = trainingStatus?.is_training === true;

  useEffect(() => {
    listModels();
  }, [listModels]);

  useEffect(() => {
    if (models.length > 0) {
      models.forEach((model) => {
        if (model === "especies") {
          getModelVersions(model);
        }
      });
    }
  }, [models, getModelVersions]);

  useEffect(() => {
    if (!speciesVersions?.versions?.length) {
      setSelectedVersion(null);
    }
  }, [speciesVersions]);

  // Check initial status on mount
  useEffect(() => {
    const model = "especies";
    getTrainingStatus(model);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update local state based on training status from endpoint
  useEffect(() => {
    setIsRetraining(trainingStatus?.is_training === true);
  }, [trainingStatus?.is_training]);

  const sortedVersions = useMemo(() => {
    if (!speciesVersions?.versions) return [];
    return [...speciesVersions.versions].sort((a, b) => b.version - a.version);
  }, [speciesVersions]);

  const handleSelect = (versionNumber) => {
    setSelectedVersion(versionNumber);
    setFeedback(null);
  };

  const handleRestore = async () => {
    if (!selectedVersion) return;
    try {
      await restoreModelVersion("especies", selectedVersion);
      setFeedback({
        type: "success",
        message: `Version ${selectedVersion} restored successfully.`,
      });
      showNotification({
        type: "success",
        title: "Version restored",
        message: `Version ${selectedVersion} restored successfully.`,
      });
      await getModelVersions("especies");
    } catch (err) {
      setFeedback({
        type: "error",
        message: "Could not restore the version. Please try again.",
      });
      showNotification({
        type: "error",
        title: "Restore failed",
        message:
          err?.response?.data?.error ||
          err?.message ||
          "Could not restore the version. Please try again.",
      });
    }
  };

  const handleShowPreview = async () => {
    const model = "especies";
    try {
      setFeedback(null);
      const status = await getTrainingStatus(model);
      if (status?.is_training) {
        setFeedback({
          type: "error",
          message: "Training is already in progress. Please wait for it to complete.",
        });
        return;
      }
      setIsPreviewLoading(true);
      setShowPreviewModal(true);
      const data = await getRetrainPreview(model);
      setPreviewData(data);
    } catch (err) {
      setFeedback({ type: "error", message: "Could not load preview data." });
      setShowPreviewModal(false);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleShowMetrics = async () => {
    const model = "especies";
    try {
      setFeedback(null);
      setIsMetricsLoading(true);
      setShowMetricsModal(true);
      const data = await getMetrics(model);
      setMetricsData(data);
    } catch (err) {
      setFeedback({ type: "error", message: err?.response?.data?.error || "Could not load metrics data." });
      setShowMetricsModal(false);
    } finally {
      setIsMetricsLoading(false);
    }
  };

  const handleConfirmRetrain = async () => {
    setShowPreviewModal(false);
    const model = "especies";
    try {
      setFeedback(null);
      await retrainModel(model);
      setFeedback({
        type: "success",
        message: "Model retraining started. This may take several minutes.",
      });
      showNotification({
        type: "success",
        title: "Retraining started",
        message: "Model retraining started. This may take several minutes.",
      });
      await getTrainingStatus(model);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Could not start retraining. Please try again.";
      setFeedback({
        type: "error",
        message: errorMessage,
      });
      showNotification({
        type: "error",
        title: "Retraining failed",
        message: errorMessage,
      });
      getTrainingStatus(model);
    }
  };

  const renderFeedback = () => {
    const activeMessage =
      feedback ||
      (error && {
        type: "error",
        message: "There was an error loading the information.",
      });
    if (!activeMessage) return null;
    return (
      <div
        style={{
          marginTop: "1rem",
          padding: "0.75rem 1rem",
          borderRadius: "8px",
          backgroundColor:
            activeMessage.type === "success" ? "#e8f5e9" : "#ffebee",
          color: activeMessage.type === "success" ? "#1b5e20" : "#b71c1c",
        }}
      >
        {activeMessage.message}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-xl font-medium text-green-700">Model Settings</h1>
      <section style={{ marginTop: "2rem" }}>
        <header style={{ marginBottom: "1rem" }}>
          <h2>Species model versions</h2>
          <p style={{ color: "#555" }}>Select a version to restore it.</p>
        </header>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "640px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ textAlign: "left", padding: "0.75rem" }}>
                  Version
                </th>
                <th style={{ textAlign: "left", padding: "0.75rem" }}>
                  Generated
                </th>
                <th style={{ textAlign: "left", padding: "0.75rem" }}>File</th>
                <th style={{ textAlign: "left", padding: "0.75rem" }}>Notes</th>
                <th style={{ textAlign: "center", padding: "0.75rem" }}>
                  Select
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedVersions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "1.5rem",
                      textAlign: "center",
                      color: "#777",
                    }}
                  >
                    {isLoading
                      ? "Loading versions..."
                      : "No versions are registered for this model."}
                  </td>
                </tr>
              ) : (
                sortedVersions.map((version) => {
                  const formattedDate = version.timestamp
                    ? new Date(version.timestamp).toLocaleString()
                    : "-";
                  const formattedSize = version.size_bytes
                    ? `${(version.size_bytes / (1024 * 1024)).toFixed(2)} MB`
                    : "-";
                  const isSelected = selectedVersion === version.version;

                  return (
                    <tr
                      key={version.version}
                      style={{
                        borderBottom: "1px solid #eee",
                        backgroundColor: isSelected ? "#e3f2fd" : "transparent",
                      }}
                    >
                      <td style={{ padding: "0.75rem" }}>
                        v{version.version}
                        {speciesVersions?.current_version === version.version && (
                          <span style={{ marginLeft: "0.5rem", padding: "0.2rem 0.5rem", fontSize: "0.8rem", backgroundColor: "#e8f5e9", color: "#2e7d32", borderRadius: "12px", fontWeight: "bold" }}>
                            Current
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem" }}>{formattedDate}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span>{version.filename}</span>
                          <span style={{ color: "#777", fontSize: "0.85rem" }}>
                            {formattedSize}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        {version.notes || "-"}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        <input
                          type="radio"
                          name="species-version"
                          checked={isSelected}
                          onChange={() => handleSelect(version.version)}
                          aria-label={`Seleccionar versión ${version.version}`}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={handleRestore}
            disabled={!selectedVersion || isLoading || isTrainingInProgress}
            style={{
              padding: "0.65rem 1.2rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor:
                !selectedVersion || isLoading || isTrainingInProgress
                  ? "#cfd8dc"
                  : "#1976d2",
              color: "#fff",
              cursor:
                !selectedVersion || isLoading || isTrainingInProgress
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {isLoading ? "Restoring..." : "Restore version"}
          </button>
          <button
            type="button"
            onClick={handleShowPreview}
            disabled={isLoading || isTrainingInProgress}
            style={{
              padding: "0.65rem 1.2rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor:
                isLoading || isTrainingInProgress ? "#cfd8dc" : "#2e7d32",
              color: "#fff",
              cursor:
                isLoading || isTrainingInProgress ? "not-allowed" : "pointer",
            }}
          >
            {isTrainingInProgress ? "Training in progress..." : "Retrain model"}
          </button>
          <button
            type="button"
            onClick={handleShowMetrics}
            style={{
              marginLeft: "1rem",
              padding: "0.65rem 1.2rem",
              borderRadius: "6px",
              border: "1px solid #1976d2",
              backgroundColor: "transparent",
              color: "#1976d2",
              cursor: "pointer",
            }}
          >
            Info (Metrics)
          </button>
          {isTrainingInProgress && trainingStatus?.started_at && (
            <div
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#e3f2fd",
                borderRadius: "6px",
                fontSize: "0.9rem",
                color: "#1976d2",
              }}
            >
              Started: {new Date(trainingStatus.started_at).toLocaleString()}
            </div>
          )}
          {renderFeedback()}
        </div>
      </section>

      {showPreviewModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#fff", padding: "2rem", borderRadius: "8px",
            maxWidth: "600px", width: "100%", maxHeight: "80vh", overflowY: "auto",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
          }}>
            <h2 className="text-xl font-medium mb-4" style={{ color: "#333" }}>Training Preview</h2>
            {isPreviewLoading ? (
              <p style={{ color: "#666" }}>Loading preview data...</p>
            ) : previewData ? (
              <div>
                <div style={{ backgroundColor: "#f9f9f9", padding: "1rem", borderRadius: "6px", marginBottom: "1.5rem" }}>
                  <p style={{ marginBottom: "0.5rem" }}><strong>Total existing images:</strong> {previewData.total_images}</p>
                  <p style={{ marginBottom: "0.5rem" }}><strong>Total images to augment:</strong> {previewData.total_to_augment}</p>
                  <p><strong>Target per class:</strong> {previewData.target_per_class}</p>
                </div>
                <div>
                  <h3 className="font-medium" style={{ color: "#333", marginBottom: "0.75rem" }}>Details per class:</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f0f0f0" }}>
                        <th style={{ textAlign: "left", padding: "0.75rem", borderBottom: "2px solid #ddd" }}>Class</th>
                        <th style={{ textAlign: "center", padding: "0.75rem", borderBottom: "2px solid #ddd" }}>Current</th>
                        <th style={{ textAlign: "center", padding: "0.75rem", borderBottom: "2px solid #ddd" }}>To Augment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.classes && Object.entries(previewData.classes).map(([className, stats]) => (
                        <tr key={className}>
                          <td style={{ padding: "0.75rem", borderBottom: "1px solid #eee" }}>{className}</td>
                          <td style={{ padding: "0.75rem", borderBottom: "1px solid #eee", textAlign: "center" }}>{stats.current}</td>
                          <td style={{ padding: "0.75rem", borderBottom: "1px solid #eee", textAlign: "center", color: stats.to_augment > 0 ? "#1976d2" : "#555" }}>
                            {stats.to_augment > 0 ? `+${stats.to_augment}` : "0"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    style={{ padding: "0.65rem 1.2rem", borderRadius: "6px", backgroundColor: "#e0e0e0", color: "#333", border: "none", cursor: "pointer", fontWeight: "500" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmRetrain}
                    style={{ padding: "0.65rem 1.2rem", borderRadius: "6px", backgroundColor: "#2e7d32", color: "#fff", border: "none", cursor: "pointer", fontWeight: "500" }}
                  >
                    Confirm & Start Training
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: "#b71c1c", marginBottom: "1.5rem" }}>Failed to load preview data.</p>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    style={{ padding: "0.65rem 1.2rem", borderRadius: "6px", backgroundColor: "#e0e0e0", color: "#333", border: "none", cursor: "pointer" }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showMetricsModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#fff", padding: "2rem", borderRadius: "8px",
            maxWidth: "900px", width: "95%", maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
          }}>
            <h2 className="text-xl font-medium mb-4" style={{ color: "#333" }}>Model Metrics</h2>
            {isMetricsLoading ? (
              <p style={{ color: "#666" }}>Loading metrics...</p>
            ) : metricsData ? (
              <div>
                <div style={{ backgroundColor: "#f9f9f9", padding: "1rem", borderRadius: "6px", marginBottom: "1.5rem" }}>
                  <p style={{ marginBottom: "0.5rem" }}><strong>Model:</strong> {metricsData.model}</p>
                  <p style={{ marginBottom: "0.5rem" }}><strong>Number of classes:</strong> {metricsData.metrics?.num_classes}</p>
                  <p><strong>Classes trained:</strong> {metricsData.metrics?.classes?.join(", ")}</p>
                </div>
                
                {metricsData.image_base64 && (
                  <div style={{ marginTop: "1rem" }}>
                    <h3 className="font-medium" style={{ color: "#333", marginBottom: "0.75rem" }}>Outputs</h3>
                    <img 
                      src={metricsData.image_base64} 
                      alt="Training Metrics and Confusion Matrix" 
                      style={{ width: "100%", height: "auto", border: "1px solid #ddd", borderRadius: "4px" }} 
                    />
                  </div>
                )}
                
                <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setShowMetricsModal(false)}
                    style={{ padding: "0.65rem 1.2rem", borderRadius: "6px", backgroundColor: "#1976d2", color: "#fff", border: "none", cursor: "pointer", fontWeight: "500" }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: "#b71c1c", marginBottom: "1.5rem" }}>Failed to load metrics data.</p>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setShowMetricsModal(false)}
                    style={{ padding: "0.65rem 1.2rem", borderRadius: "6px", backgroundColor: "#e0e0e0", color: "#333", border: "none", cursor: "pointer" }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default ModelSettings;
