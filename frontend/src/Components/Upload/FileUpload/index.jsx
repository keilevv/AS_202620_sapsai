"use client";

import { useState, useRef, useCallback } from "react";
import {
  FaCloudUploadAlt,
  FaImage,
  FaTrash,
  FaSpinner,
  FaUpload,
  FaBrain,
} from "react-icons/fa";
import useClassifier from "../../../hooks/useClassifier";
import UploadModal from "../UploadModal";
import { useNavigate } from "react-router-dom";
import { showNotification } from "../../Common/Notification";
import useStore from "../../../hooks/useStore";

export default function FileUpload({ onUpload }) {
  const navigate = useNavigate();
  const { user } = useStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { uploadClassification, isLoading } = useClassifier();
  const [openModal, setOpenModal] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState(null);

  const handleFileSelect = useCallback((file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeModal = () => {
    setOpenModal(false);
    setSelectedUpload(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      uploadClassification(formData)
        .then((response) => {
          if (response && response.classification) {
            showNotification({
              type: "success",
              message:
                "Image classified successfully! Click here to view details.",
              duration: 5000,
            });
            setOpenModal(true);
            setSelectedUpload(response.classification);
          }

          // Call onUpload with the classification data
          if (onUpload && response.classification) {
            onUpload(response.classification);
          }

          // Reset form
          handleRemoveFile();
        })
        .catch((error) => {
          const code = error.response.data.error;
          showNotification({
            message:
              code === "no_plant"
                ? "Image is not a plant"
                : "Upload failed. Please try again.",
            type: "error",
          });
          handleRemoveFile();
        });
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      {!user.requestedContributorStatus && user.role === "USER" && (
        <div className="bg-white rounded lg shadow-lg p-6 gap-2 flex flex-col">
          <p className="text-xl font-semibold text-green-700 flex items-center gap-2">
            <FaBrain className="text-blue-700 h-10 w-10" /> Want to help us
            train our AI model?
          </p>
          <p className="text-gray-600 mt-1">
            Fill out your details and request to become a contributor
          </p>
          <button
            onClick={() => navigate("/settings/request-to-contribute")}
            className="max-w-fit cursor-pointer bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Request to become a contributor
          </button>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-green-700">
            <FaUpload /> Upload Plant Leaf Image
          </h2>
          <p className="text-gray-600 mt-1">
            Upload an image of a plant leaf to get AI-powered classification
            results
          </p>
        </div>
        <div className="p-6">
          {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your image here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports JPG, PNG, and other image formats
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors cursor-pointer"
              >
                Select File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <FaImage className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-green-700">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              </div>

              {previewUrl && (
                <div className="flex justify-center">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="max-w-xs max-h-64 rounded-lg shadow-md object-cover"
                  />
                </div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`bg-green-600  text-white font-medium py-2 px-8 rounded-md transition-colors flex items-center ${
                    isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                      Classifying...
                    </>
                  ) : (
                    "Classify Plant"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <UploadModal
        isOpen={openModal}
        selectedUpload={selectedUpload}
        closeModal={closeModal}
      />
    </div>
  );
}
